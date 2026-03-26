from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from .models import Expense
from .serializer import ExpenseSerializer, ProfileUpdateSerializer
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.decorators import action
from django.http import HttpResponse
from datetime import datetime
from django.db.models.functions import ExtractYear
from .utils.dashboard_cache import refresh_dashboard_cache
from .utils.ml_insights_cache import get_ml_insights
from django.conf import settings
import redis
import json
import csv

redis_client = redis.Redis(
    host = settings.REDIS_CONFIG['HOST'],
    port = settings.REDIS_CONFIG['PORT'],
    db = settings.REDIS_CONFIG['DB'],
)

year = datetime.now().year

# Create your views here.
class LoginView(APIView):
    permission_classes = []

    def post(self, request):
        serializer = TokenObtainPairSerializer(data=request.data)

        if serializer.is_valid():
            return Response(serializer.validated_data, status = status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ExpenseViewSet(ModelViewSet):
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        queryset = Expense.objects.filter(user=self.request.user).order_by("-date")
    
        # Get optional query parameter
        category = self.request.query_params.get("category")
        start_date = self.request.query_params.get("start_date")
        end_date = self.request.query_params.get("end_date")
        search = self.request.query_params.get("search")

        if category:
            queryset = queryset.filter(category=category)

        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        
        if end_date:
            queryset = queryset.filter(date__lte=end_date)

        if search:
            queryset = queryset.filter(note__icontains=search)

        return queryset
                
    def perform_create(self,serializer):
        serializer.save(user=self.request.user)
        keys = redis_client.keys(f"dashboard_{self.request.user.id}_*")
        if keys:
            redis_client.delete(*keys)

        ml_key = f"ml_insights_{self.request.user.id}"
        redis_client.delete(ml_key)


    def perform_update(self, serializer):
        serializer.save()
        keys = redis_client.keys(f"dashboard_{self.request.user.id}_*")
        if keys:
            redis_client.delete(*keys)

        ml_key = f"ml_insights_{self.request.user.id}"
        redis_client.delete(ml_key)


    def perform_destroy(self, instance):
        instance.delete()
        keys = redis_client.keys(f"dashboard_{self.request.user.id}_*")
        if keys:
            redis_client.delete(*keys)   

        ml_key = f"ml_insights_{self.request.user.id}"
        redis_client.delete(ml_key)

    @action(detail=False,methods=["get"])
    def download_csv(self, request):
        # get all the expenses of the user
        expenses = Expense.objects.filter(user=request.user).order_by("date")  

        # Create csv response
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="expense.csv"'

        writer = csv.writer(response)
        writer.writerow(["Amount", "Category", "Date", "Note"])
        
        for expense in expenses:
            writer.writerow([expense.amount, expense.category, expense.date, expense.note])
        
        return response

class ProfileUpdateView(generics.RetrieveUpdateAPIView):  # For GET/PUT methods only..
    serializer_class = ProfileUpdateSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

class BulkExpenseUpload(APIView):
    
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        data = request.data #list  of expense objects
        if not isinstance(data,list):
            return Response(
                {"error":"Expected a list of expenses."},
                status = status.HTTP_400_BAD_REQUEST
                )
        
        MAX_ROWS = 100
        if len(data) > MAX_ROWS:
            return Response(
                {"error": f"Maximum {MAX_ROWS} allowed per upload."},
                status=status.HTTP_400_BAD_REQUEST) 
        
        success = []
        failed = []

        for i, item in enumerate(data,start=1):
            serializer = ExpenseSerializer(data=item)
            if serializer.is_valid():
                serializer.save(user=request.user)
                keys = redis_client.keys(f"dashboard_{self.request.user.id}_*")
                if keys:
                    redis_client.delete(*keys)

                ml_key = f"ml_insights_{self.request.user.id}"
                redis_client.delete(ml_key)

                success.append(serializer.data)
            else:
                failed.append({"row":i,"errors":serializer.errors})

        return Response({"success":success,
                         "failed":failed},
                         status=status.HTTP_200_OK)
    
class DashboardView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):

        year = request.query_params.get("year")
        if not year:
            year = datetime.now().year
            
        year = int(year)

        redis_key = f"dashboard_{request.user.id}_{year}"

        cached_dashboard_data = redis_client.get(redis_key)
        if cached_dashboard_data:
            return Response(json.loads(cached_dashboard_data))
        
        refresh_dashboard_cache(request.user,year)
        dashboard_data = redis_client.get(redis_key)
       
        return Response(json.loads(dashboard_data))
    
class MLInsightView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        data = get_ml_insights(request.user)

        return Response(data)
    
class AvailableYearsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        years = (
            Expense.objects
            .filter(user=request.user)
            .annotate(year=ExtractYear('date'))
            .values_list('year',flat=True)
            .distinct()
            .order_by('-year')
        )

        return Response(list(years))