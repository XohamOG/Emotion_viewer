from django.urls import path
from .views import upload_resume # Import the updated view function

urlpatterns = [
    path('upload-resume/', upload_resume, name='upload_resume'),  # Updated API endpoint for processing resumes
]
