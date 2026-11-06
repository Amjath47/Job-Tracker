from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q

from .pagination import JobApplicationPagination
from .models import JobApplication
from .serializers import JobApplicationSerializer
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
import csv
from django.http import HttpResponse
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4

class JobApplicationListCreateView(APIView):

    permission_classes = [IsAuthenticated]

    # GET - Retrieve all job applications
    def get(self, request):

        # Get applications belonging to the logged-in user
        jobs = JobApplication.objects.filter(user=request.user)

        # Filter by application status
        status_filter = request.query_params.get('status')

        if status_filter:
            jobs = jobs.filter(status=status_filter)

        # Filter by job type
        job_type = request.query_params.get('job_type')

        if job_type:
            jobs = jobs.filter(job_type=job_type)

        # Filter by job location
        location = request.query_params.get('location')

        if location:
            jobs = jobs.filter(job_location__icontains=location)

        # Search by company name or job role
        search = request.query_params.get('search')

        if search:
            jobs = jobs.filter(
                Q(company_name__icontains=search) |
                Q(job_role__icontains=search)
            )

        # Sorting
        sort_by = request.query_params.get('sort_by', 'created_at')

        allowed_sort_fields = [
            'created_at',
            '-created_at',
            'application_date',
            '-application_date',
            'company_name',
            '-company_name',
            'salary',
            '-salary'
        ]

        if sort_by in allowed_sort_fields:
            jobs = jobs.order_by(sort_by)

        # Apply pagination
        paginator = JobApplicationPagination()

        page = paginator.paginate_queryset(jobs, request)

        serializer = JobApplicationSerializer(page, many=True)

        return paginator.get_paginated_response(serializer.data)

    # POST - Create a new job application
    def post(self, request):

        serializer = JobApplicationSerializer(
            data=request.data
        )

        if serializer.is_valid():

            serializer.save(user=request.user)

            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

class JobApplicationDetailView(APIView):

    permission_classes = [IsAuthenticated]

    def get_object(self, pk, user):
        return get_object_or_404(
            JobApplication,
            pk=pk,
            user=user
        )

    # GET - Retrieve one job application
    def get(self, request, pk):

        job = self.get_object(pk, request.user)

        serializer = JobApplicationSerializer(job)

        return Response(serializer.data)

    # PUT - Update complete job application
    def put(self, request, pk):

        job = self.get_object(pk, request.user)

        serializer = JobApplicationSerializer(
            job,
            data=request.data
        )

        if serializer.is_valid():

            serializer.save()

            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    # PATCH - Update selected fields
    def patch(self, request, pk):

        job = self.get_object(pk, request.user)

        serializer = JobApplicationSerializer(
            job,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            serializer.save()

            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    # DELETE - Delete job application
    def delete(self, request, pk):

        job = self.get_object(pk, request.user)

        job.delete()

        return Response(
            {"message": "Job application deleted successfully"},
            status=status.HTTP_200_OK
        )
    
class JobApplicationExportView(APIView):

    permission_classes = [IsAuthenticated]

    # GET - Export logged-in user's job applications as CSV
    def get(self, request):

        jobs = JobApplication.objects.filter(
            user=request.user
        ).order_by('-created_at')

        response = HttpResponse(
            content_type='text/csv'
        )

        response['Content-Disposition'] = (
            'attachment; filename="job_applications.csv"'
        )

        writer = csv.writer(response)

        # CSV column headings
        writer.writerow([
            'Company Name',
            'Job Role',
            'Job Description',
            'Job Location',
            'Job Type',
            'Salary',
            'Application Date',
            'Status',
            'Job URL',
            'Notes'
        ])

        # Write job application records
        for job in jobs:
            writer.writerow([
                job.company_name,
                job.job_role,
                job.job_description,
                job.job_location,
                job.job_type,
                job.salary,
                job.application_date,
                job.status,
                job.job_url,
                job.notes
            ])

        return response

class JobApplicationPDFExportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        jobs = JobApplication.objects.filter(
            user=request.user
        ).order_by('-created_at')

        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = (
            'attachment; filename="job_applications.pdf"'
        )

        pdf = canvas.Canvas(response, pagesize=A4)
        width, height = A4

        y = height - 50

        pdf.setFont('Helvetica-Bold', 16)
        pdf.drawString(50, y, 'Job Applications Report')

        y -= 40

        for job in jobs:
            if y < 100:
                pdf.showPage()
                y = height - 50

            pdf.setFont('Helvetica-Bold', 11)
            pdf.drawString(
                50, y,
                f"{job.company_name} - {job.job_role}"
            )
            y -= 20

            pdf.setFont('Helvetica', 9)

            details = [
                f"Location: {job.job_location}",
                f"Type: {job.job_type}",
                f"Status: {job.status}",
                f"Application Date: {job.application_date}",
                f"Salary: {job.salary or 'Not specified'}"
            ]

            for detail in details:
                pdf.drawString(60, y, detail)
                y -= 15

            y -= 15

        pdf.save()
        return response