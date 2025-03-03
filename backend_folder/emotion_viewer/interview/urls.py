from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import JobPositionViewSet, start_interview, upload_captured_data

router = DefaultRouter()
router.register(r'jobs', JobPositionViewSet)

urlpatterns = [
    path("", include(router.urls)),
    path("interviews/start/", start_interview),
    path("interviews/upload/", upload_captured_data),
]
