from django.urls import path
from .views import ProcessPendingFiles, GetProcessedResults

urlpatterns = [
    path("pending/", ProcessPendingFiles.as_view(), name="process-pending"),
    path("results/", GetProcessedResults.as_view(), name="get-results"),
]
