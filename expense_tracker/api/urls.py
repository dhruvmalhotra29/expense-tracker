from rest_framework.routers import DefaultRouter
from .views import (
    ExpenseViewSet, 
    LoginView, 
    BulkExpenseUpload, 
    ProfileUpdateView, 
    AvailableYearsView,
    DashboardView,
    MLInsightView,
)

from django.urls import path

router = DefaultRouter()
router.register("expenses",ExpenseViewSet,basename="expenses")

urlpatterns = [
    path("auth/login",LoginView.as_view()),
    path("expenses/bulk/",BulkExpenseUpload.as_view(),name='bulk-expense-upload'),
    path("expenses/available-years/",AvailableYearsView.as_view()),
    path("profile-update/",ProfileUpdateView.as_view()),
    path("dashboard/",DashboardView.as_view()),
    path("ml-insights/",MLInsightView.as_view(), name='ml-insights'),
]

urlpatterns += router.urls