from django.urls import path
from .views import JobPositionListCreate, CandidateListCreate
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from .views import CaptureUploadView

urlpatterns = [
    path('jobs/', JobPositionListCreate.as_view(), name='job-list-create'),
    path('candidates/', CandidateListCreate.as_view(), name='candidate-list-create'),
    path("upload/", CaptureUploadView.as_view(), name="upload-file"),
]
