from rest_framework import serializers
from .models import Expense
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password

class ExpenseSerializer(serializers.ModelSerializer):
    STANDARD_CATEGORIES = [
        "Food",
        "Travel",
        "Shopping",
        "Bills",
        "Health",
        "Education",
        "Entertainment",
        "Rent",
        "Savings",
        "Other"
    ]
        
    class Meta:
        model = Expense
        fields = ["id","amount","category","date","note"]
        read_only_fields = ["user"]

    def validate_category(self,value):
         if value not in self.STANDARD_CATEGORIES:
              raise serializers.ValidationError(
                   f"Invalid Category '{value}'. Must be one of {self.STANDARD_CATEGORIES}"
              )
         return value

class ProfileUpdateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required = False, allow_blank=True)

    class Meta:
          model = User
          fields = ["username", "email", "password"]

    def update(self, instance, validated_data): # For storing password as hashed in database
         instance.username = validated_data.get('username',instance.username)
         instance.email = validated_data.get('email', instance.email)
         password = validated_data.get('password')
         if password:
              instance.password = make_password(password)
         instance.save()

         return instance
    