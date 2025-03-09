from django.urls import path
from .views import process_resume  # Import the updated view function

urlpatterns = [
    path('upload-resume/', process_resume, name='upload_resume'),  # Updated API endpoint for processing resumes
]
