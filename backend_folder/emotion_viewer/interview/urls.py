from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import JobPositionViewSet, start_interview, upload_captured_data

router = DefaultRouter()
router.register(r'jobs', JobPositionViewSet)

urlpatterns = [
    path("api/", include(router.urls)),
    path("api/interviews/start/", start_interview),
    path("api/interviews/upload/", upload_captured_data),
]
