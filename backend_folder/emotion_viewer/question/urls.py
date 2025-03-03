from django.urls import path
from .views import upload_resume  # Import your view function

urlpatterns = [
    path('upload-resume/', upload_resume, name='upload_resume'),  # Correct API endpoint
]
