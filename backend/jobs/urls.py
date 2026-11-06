from django.urls import path
from .views import (
    JobApplicationListCreateView,
    JobApplicationDetailView,
    JobApplicationExportView,
    JobApplicationPDFExportView
)

urlpatterns = [

    path(
        '',
        JobApplicationListCreateView.as_view(),
        name='job-list-create'
    ),

    path(
        'export/',
        JobApplicationExportView.as_view(),
        name='job-export'
    ),

    path(
        'export/pdf/',
        JobApplicationPDFExportView.as_view(),
        name='job-export-pdf'
    ),

    path(
        '<int:pk>/',
        JobApplicationDetailView.as_view(),
        name='job-detail'
    ),

]