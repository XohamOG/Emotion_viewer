from django.urls import path
from . import views

urlpatterns = [
    # Analysis endpoints
    path('analysis/start/', views.analyze_interview, name='start_analysis'),
    path('analysis/<uuid:analysis_id>/', views.get_analysis_data, name='analysis_data'),
    path('analysis/<uuid:analysis_id>/visualization-data/', 
         views.get_analysis_data, 
         name='analysis_visualization_data'),
    
    # Session management
    path('sessions/', views.InterviewSessionViewSet.as_view({'get': 'list', 'post': 'create'}), 
         name='session_list'),
    path('sessions/<uuid:pk>/', 
         views.InterviewSessionViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}),
         name='session_detail'),
    
    # Development/testing endpoints
    path('generate-sample-data/', views.generate_sample_data, name='generate_sample_data'),
]