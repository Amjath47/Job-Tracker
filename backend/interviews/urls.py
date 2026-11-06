from django.urls import path

from .views import (
    InterviewListCreateView,
    InterviewDetailView,
    InterviewExportView,
    InterviewPDFExportView
)

urlpatterns = [
    path('', InterviewListCreateView.as_view(), name='interview-list-create'),

    path('export/', InterviewExportView.as_view(), name='interview-export'),

    path(
        'export/pdf/',
        InterviewPDFExportView.as_view(),
        name='interview-export-pdf'
    ),

    path('<int:pk>/', InterviewDetailView.as_view(), name='interview-detail'),
]