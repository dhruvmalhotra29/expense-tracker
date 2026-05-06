# Expense Tracker Web Application

A full-stack expense tracking system with secure authentication, real-time analytics, and a hybrid intelligence layer combining machine learning–based predictions with rule-based financial insights. The system enables users to track expenses, analyze spending behavior, and receive actionable financial recommendations.

---

## Key Features

### Authentication & User Management
- JWT-based authentication
- Secure login and session handling
- Profile management with email and password update functionality

---

### Expense Management
- Add single and bulk expenses
- View, edit, and delete expenses
- Structured expense tracking with persistent storage

---

### Analytics Dashboard
- Pie chart for overall expense distribution
- Month-wise bar chart with year filtering
- Recent 5 transactions summary table

---

### Intelligent Insights

The system provides a hybrid intelligence layer:

#### ML-Based Prediction
- Predicted future expenses based on historical spending patterns

#### Rule-Based Analytics
- Spending trend comparison with previous month
- Overspending detection using threshold-based logic
- Budget recommendations based on spending behavior patterns

---

## Tech Stack

Frontend: React.js  
Backend: Django REST Framework  
Database: PostgreSQL  
Cache: Redis (Dockerized for local development)  
Authentication: JWT  

---

## System Design Overview

The application follows a decoupled architecture where the React frontend communicates with Django REST APIs. PostgreSQL is used for persistent storage, while Redis is containerized using Docker for caching ML-generated insights and improving response performance. Machine learning models process historical expense data to generate predictions, while rule-based logic provides real-time financial insights.

---

## DevOps / Deployment

- CI/CD pipeline integrated for automated build and deployment
- Docker used for containerizing Redis in local development environment
- Environment-based configuration for development and production
- GitHub-based version control with automated workflow support

---

## Project Highlights

- Scalable full-stack architecture  
- Secure JWT-based authentication system  
- Hybrid ML + rule-based intelligence system  
- Optimized backend with caching layer  
- Interactive analytics dashboard  
- CI/CD-enabled development workflow  
- Dockerized local infrastructure components  

---

## Run Locally (Optional)

Clone the repository and configure environment variables for backend and frontend services.

Ensure PostgreSQL is running and Redis is started via Docker before launching the application.

Create a .env file with required configuration variables.
---

## Demo

Project Walkthrough Video: *Coming soon*

[Live Application](https://expense-tracker-xi-navy.vercel.app/)

Login credentials can be shared for the evaluation process if required.