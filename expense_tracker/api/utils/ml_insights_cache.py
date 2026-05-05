from datetime import timedelta
from django.utils import timezone
from django.db.models import Sum, Avg
from django.db.models.functions import TruncMonth
from sklearn.linear_model import LinearRegression
from ..models import Expense
import json
import numpy as np
import calendar
from .redis_client import redis_client
import logging

logger = logging.getLogger(__name__)

def get_expense_prediction(user):

    data = (
        Expense.objects
        .filter(user=user)
        .annotate(month=TruncMonth("date"))
        .values("month")
        .annotate(total=Sum("amount"))
        .order_by("month")
    )

    if len(data) < 2:
        return {"message": "Not enough data for prediction"}

    # build continuous time series
    totals = [item["total"] or 0 for item in data]

    X = np.arange(len(totals)).reshape(-1, 1)
    y = np.array(totals)

    model = LinearRegression()
    model.fit(X, y)

    prediction = model.predict([[len(totals)]])

    last_date = data.order_by("-month").first()["month"]
    next_month = (last_date.month % 12) + 1
    next_year = last_date.year + (1 if next_month == 1 else 0)

    return {
        "month": calendar.month_name[next_month],
        "year": next_year,
        "predicted_expense": float(round(prediction[0], 2))
    }

def get_spending_trend(user):

    today = timezone.now().date()

    start_current_month = today.replace(day=1)
    start_last_month = (start_current_month - timedelta(days=1)).replace(day=1)
    end_last_month = start_current_month - timedelta(days=1)

    current_month_total = (
                        Expense.objects.filter(
                            user=user,
                            date__gte = start_current_month
                            ).aggregate(total=Sum("amount"))["total"] or 0
                        )
    
    last_month_total = (
                Expense.objects.filter(
                    user = user,
                    date__gte = start_last_month,
                    date__lte = end_last_month
                ).aggregate(total=Sum("amount"))["total"] or 0
            )

    if last_month_total == 0:
        percentage_change = 100 if current_month_total > 0 else 0

    else:
        percentage_change = ((current_month_total - last_month_total) / last_month_total) * 100

    if percentage_change > 0:
        trend = "increase"

    elif percentage_change < 0:
        trend = "decrease"

    else:
        trend = "no change"

    return {
        "current_month_total": float(current_month_total),
        "last_month_total": float(last_month_total),
        "percentage_change" : float(round(abs(percentage_change), 2)),
        "trend":trend
    }

def get_overspending_alert(user):

    today = timezone.now().date()
    three_months_ago = today - timedelta(days=90)
    start_current_month = timezone.now().date().replace(day=1)

    categories = (
        Expense.objects
        .filter(user=user, date__gte=three_months_ago)
        .values("category")
        .annotate(avg_spend=Avg("amount")))
    
    alert_category = None
    max_increase = 0

    for category in categories:
        current_total = (
            Expense.objects.filter(
                user=user,
                category=category["category"],
                date__gte = start_current_month
            ).aggregate(total=Sum("amount"))["total"] or 0
        )

        avg = category["avg_spend"] or 0

        if avg == 0:
            continue

        increase = ((current_total - avg) / avg) * 100
        if increase > max_increase:
            max_increase = increase
            alert_category = category["category"]

    return {
        "category": alert_category,
        "increase_percent": float(round(max_increase,2))
    }

def get_budget_recommendation(user):

    six_months_ago = timezone.now().date() - timedelta(days=180)
    total = (
        Expense.objects.filter(
            user=user,
            date__gte = six_months_ago
        ).aggregate(total=Sum("amount"))["total"] or 0
    )

    recommended_budget = total / 6 if total else 0

    return {
        "recommended_budget": float(round(recommended_budget,2))
    }

def refresh_ml_insights(user):
    
    data = {
        "prediction": get_expense_prediction(user),
        "trend": get_spending_trend(user),
        "overspending_alert": get_overspending_alert(user),
        "budget" : get_budget_recommendation(user)
    }

    try:
        redis_client.setex(f"ml_insights_{user.id}", 3600, json.dumps(data))
    except Exception:
        logger.warning("Redis set failed for ml insights.",exc_info=True)


def clear_ml_insights_cache(user_id):
    try:
        ml_key = f"ml_insights_{user_id}"
        redis_client.delete(ml_key)
    except Exception:
        logger.warning("Redis cache clear failed for ml insights",exc_info=True)