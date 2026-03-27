from django.db.models import Sum
from django.db.models.functions import ExtractMonth
from ..models import Expense
from datetime import datetime
from django.conf import settings
import redis
import json
import logging

logger = logging.getLogger(__name__)

redis_client = redis.Redis(
    host=settings.REDIS_CONFIG['HOST'],
    port=settings.REDIS_CONFIG['PORT'],
    db=settings.REDIS_CONFIG['DB'],
    )

# Helper functions
def get_pie_chart_data(user):
    queryset = Expense.objects.filter(user=user).values("category").annotate(total=Sum("amount"))
    return [
        {"category": item["category"], "total": float(item["total"] or 0)}
        for item in queryset
    ]

def get_bar_graph_data(user,year):

    months = [
            "Jan", "Feb", "Mar", "Apr","May","Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    
    expenses = Expense.objects.filter(user=user)
    
    # Apply year filter
    expenses = expenses.filter(date__year=year)
    
    expenses = (
            expenses
            .annotate(month=ExtractMonth('date'))
            .values('month')
            .annotate(total=Sum('amount'))
            .order_by('month')
        )
    
    # Ensure all 12 months exists
    month_data = {i: 0 for i in range(1,13)}
    
    for expense in expenses:
        month_data[expense["month"]] = float(expense["total"] or 0)

    return [
        {
            "month": months[i-1], 
            "total": month_data[i]
        }
        for i in range(1,13)
    ]

def get_recent_expenses(user):
    
    expenses = Expense.objects.filter(user=user).order_by("-date")[:5]

    return [
        {
            "date": expense.date.isoformat(),
            "category": expense.category,
            "amount": float(expense.amount)
        }
        for expense in expenses
    ]

def refresh_dashboard_cache(user, year=None):
    """Refreshes the full dashboard cache"""

    data = {
        "pie_chart" : get_pie_chart_data(user),
        "bar_graph": get_bar_graph_data(user,year),
        "recent_transactions": get_recent_expenses(user)
    }

    try:
        redis_client.set(f"dashboard_{user.id}_{year}",json.dumps(data), ex=86400)
    except Exception:
        logger.warning("Redis set failed for dashboard",exc_info=True)

def clear_dashboard_cache(user_id):

    try:
        keys = redis_client.keys(f"dashboard_{user_id}_*")
        if keys:
            redis_client.delete(*keys)
    except Exception:
        logger.warning("Redis cache clear failed for dashboard", exc_info=True)