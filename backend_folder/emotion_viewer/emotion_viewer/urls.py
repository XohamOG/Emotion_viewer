from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/interview/", include("interview.urls")),  # No extra 'api/'
    path("api/", include("question.urls")),
    path("api/process/", include("process.urls")),    
]
