from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from .models import Expense
from .serializer import ExpenseSerializer, ProfileUpdateSerializer
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from django.http import HttpResponse
from datetime import datetime
from django.db.models.functions import ExtractYear
from .utils.dashboard_cache import refresh_dashboard_cache, clear_dashboard_cache
from .utils.ml_insights_cache import refresh_ml_insights, clear_ml_insights_cache
from django.conf import settings
import redis
import json
import csv
import logging

redis_client = redis.Redis(
    host = settings.REDIS_CONFIG['HOST'],
    port = settings.REDIS_CONFIG['PORT'],
    db = settings.REDIS_CONFIG['DB'],
)

# Create a logger for this view
logger = logging.getLogger(__name__)

year = datetime.now().year

# Create your views here.
class LoginView(APIView):
    permission_classes = []

    def post(self, request):
        logger.info(f"Login attempt for user: {request.data.get('username')}")
        serializer = TokenObtainPairSerializer(data=request.data)

        if serializer.is_valid():
            logger.info("Login successful")
            return Response(serializer.validated_data, status = status.HTTP_200_OK)
        
        logger.warning(f"Login failed: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ExpensePagination(PageNumberPagination):
    page_size = 15

class ExpenseViewSet(ModelViewSet):
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = ExpensePagination

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
        instance = serializer.save(user=self.request.user)
        logger.info(f"Expense created by user {self.request.user.id}, id={instance.id}")
        
        clear_dashboard_cache(self.request.user.id)
        clear_ml_insights_cache(self.request.user.id)

    def perform_update(self, serializer):
        instance = serializer.save()
        logger.info(f"Expense updated by user {self.request.user.id}, id={instance.id}")

        clear_dashboard_cache(self.request.user.id)
        clear_ml_insights_cache(self.request.user.id)

    def perform_destroy(self, instance):
        logger.warning(f"Expense deleted by user {self.request.user.id}, id={instance.id}")
        instance.delete()
        
        clear_dashboard_cache(self.request.user.id)
        clear_ml_insights_cache(self.request.user.id)
        
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
        logger.info(f"Bulk expense started by user {request.user.id}")
        
        if not isinstance(data,list):
            logger.error("Bulk upload failed: data is not a list")
            return Response(
                {"error":"Expected a list of expenses."},
                status = status.HTTP_400_BAD_REQUEST
                )
        
        MAX_ROWS = 100
        if len(data) > MAX_ROWS:
            logger.warning(f"Bulk upload exceeded limit: {len(data)} rows")
            return Response(
                {"error": f"Maximum {MAX_ROWS} allowed per upload."},
                status=status.HTTP_400_BAD_REQUEST) 
        
        success = []
        failed = []

        for i, item in enumerate(data,start=1):
            serializer = ExpenseSerializer(data=item)
            if serializer.is_valid():
                serializer.save(user=request.user)
                success.append(serializer.data)
            else:
                failed.append({"row":i,"errors":serializer.errors})
                
        clear_dashboard_cache(request.user.id)
        clear_ml_insights_cache(request.user.id)

        logger.info(f"Bulk upload done: success={len(success)}, failed={len(failed)}")

        return Response({"success":success,
                         "failed":failed},
                         status=status.HTTP_200_OK)
    
class DashboardView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        logger.info(f"Dashboard data requested by user {request.user.id}")

        year = request.query_params.get("year")
        if not year:
            year = datetime.now().year
            
        year = int(year)

        redis_key = f"dashboard_{request.user.id}_{year}"

        try:
            cached_dashboard_data = redis_client.get(redis_key)
        except Exception:
            cached_dashboard_data = None

        if cached_dashboard_data:
            logger.info(f"Dashboard cache HIT for user {request.user.id}, year={year}")
            return Response(json.loads(cached_dashboard_data))
        
        logger.info(f"Dashboard cache MISS for user {request.user.id}, year={year}")
        refresh_dashboard_cache(request.user,year)
        dashboard_data = redis_client.get(redis_key)

        if not dashboard_data:
            logger.error(f"Dashboard load failed for user {request.user.id}, year={year}")
            return Response({"error":"Failed to load dashboard data"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR
                            )
       
        return Response(json.loads(dashboard_data))
    
class MLInsightView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        logger.info(f"ML Insights requested by user {request.user.id}")

        redis_key = f"ml_insights_{request.user.id}"

        try:
            cached_data = redis_client.get(redis_key)
        except Exception:
            cached_data = None
        if cached_data:
            logger.info(f"ML Insights cache HIT for user {request.user.id}")
            return Response(json.loads(cached_data))

        logger.info(f"ML Insights cache MISS for user {request.user.id}")
        
        refresh_ml_insights(request.user)

        ml_insights_data = redis_client.get(redis_key)
        if not ml_insights_data:
            logger.error(f"ML Insights load failed for user {request.user.id}",exc_info=True)
            return Response({
                "error": "Failed to load ML Insights"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response(json.loads(ml_insights_data))
    
class AvailableYearsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        logger.info(f"Fetching available years for user {request.user.id}")
        years = (
            Expense.objects
            .filter(user=request.user)
            .annotate(year=ExtractYear('date'))
            .values_list('year',flat=True)
            .distinct()
            .order_by('-year')
        )

        return Response(list(years))