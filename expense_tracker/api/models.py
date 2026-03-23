from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

# Create your models here.
class Expense(models.Model):
    user = models.ForeignKey(User,on_delete=models.CASCADE)
    amount  = models.DecimalField(max_digits=10,decimal_places=2)
    category = models.CharField(max_length=50)
    date = models.DateField(default=timezone.now)
    note = models.TextField(blank=True)