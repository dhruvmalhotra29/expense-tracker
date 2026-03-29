from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth.models import User
from api.models import Expense
from rest_framework_simplejwt.tokens import RefreshToken
import datetime

class ExpenseTest(TestCase):
    """
        Test class for Expense API (list, create, delete) with JWT auth.
    """

    def setUp(self):
        """
            Runs before each test method.
            - Creates a test user
            - Generates a JWT token for authentication
            - Sets up the APIClient with Authorizatiion header 
        """
        
        # 1. Create a test User
        self.user = User.objects.create_user(username="testuser",password="testpass")

        # 2. Create JWT token for the user
        refresh = RefreshToken.for_user(self.user)
        self.token = refresh.access_token

        # 3. Initialize API Client
        self.client = APIClient()

        # 4. Add JWT token to Authorization header
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

        # 5. Create a test expense for listing
        self.expense = Expense.objects.create(
            user=self.user,
            amount=100,
            category="Food",
            date=datetime.date.today(),
            note="Test expense"
        )

    def test_unauthorized_access(self):
        client = APIClient()
        response = client.get("/api/expenses/")
        self.assertEqual(response.status_code,401)
    
    def test_expenses_list(self):
        """
            Test listing expense
            Should return 200 OK and the correct number of expenses.
        """
        response = self.client.get("/api/expenses/")

        # Assert HTTP status code
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Assert the number of expenes returned
        self.assertEqual(len(response.data["results"]),1) # pagination returns 'results'

    def test_create_expense(self):
        """
            Test creating a new expense.
            Should return 201 Created and expense should exists in DB.
        """
        payload = {
            "amount":50,
            "category":"Travel",
            "date":str(datetime.date.today()),
            "note": "New test expense"
        }

        response = self.client.post("/api/expenses/",payload,format="json")

        # Assert HTTP status code
        self.assertEqual(response.status_code,status.HTTP_201_CREATED)

        # Assert the expense is created in the db
        self.assertEqual(Expense.objects.filter(user=self.user).count(), 2)

    def test_update_expense(self):
        payload = {"amount": 200}
        response = self.client.patch(f"/api/expenses/{self.expense.id}/", payload)
        self.assertEqual(response.status_code, 200)
        self.expense.refresh_from_db()
        self.assertEqual(self.expense.amount,200)

    def test_delete_expense(self):
        """
            Test deleting an expense.
            Should return 204 No Content and remove the expense from DB.
        """
        response = self.client.delete(f"/api/expenses/{self.expense.id}/")

        # Assert HTTP status code
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        self.assertEqual(Expense.objects.filter(user=self.user).count(),0)

    def test_filter_by_category(self):
        response = self.client.get("/api/expenses/?category=Food")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]),1)
        self.assertEqual(response.data["results"][0]["category"],"Food")

    def test_download_csv(self):
        response = self.client.get("/api/expenses/download_csv/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response["Content-Type"],"text/csv")
        content = response.content.decode()
        self.assertIn("Food", content)

    def test_create_invalid_expense(self):
        payload = {"amount":"", "category":""}
        response = self.client.post("/api/expenses/",payload)

        self.assertEqual(response.status_code, 400)