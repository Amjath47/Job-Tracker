from django.shortcuts import get_object_or_404

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .models import Interview
from .serializers import InterviewSerializer
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
import csv
from django.http import HttpResponse
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4

class InterviewListCreateView(APIView):

    permission_classes = [IsAuthenticated]

    # GET: View all interviews belonging to the logged-in user
    def get(self, request):
        interviews = Interview.objects.filter(
            job_application__user=request.user
        )

        # Search by company name or interview round
        search = request.query_params.get('search', '').strip()

        if search:
            interviews = interviews.filter(
                Q(job_application__company_name__icontains=search) |
                Q(interview_round__icontains=search)
            )

        # Filter by interview status
        interview_status = request.query_params.get('status')

        if interview_status:
            interviews = interviews.filter(
                status=interview_status
            )

        # Filter by interview mode
        interview_mode = request.query_params.get('mode')

        if interview_mode:
            interviews = interviews.filter(
                interview_mode=interview_mode
            )

        # Sorting by interview date
        sort_by = request.query_params.get(
            'sort_by',
            'interview_date'
        )

        allowed_sorting = [
            'interview_date',
            '-interview_date'
        ]

        if sort_by not in allowed_sorting:
            sort_by = 'interview_date'

        interviews = interviews.order_by(sort_by)

        # Pagination
        paginator = PageNumberPagination()
        paginator.page_size = 5
        paginator.page_size_query_param = 'page_size'
        paginator.max_page_size = 50

        paginated_interviews = paginator.paginate_queryset(
            interviews,
            request
        )

        serializer = InterviewSerializer(
            paginated_interviews,
            many=True
        )

        return paginator.get_paginated_response(serializer.data)
    
    # POST: Schedule a new interview
    def post(self, request):
        serializer = InterviewSerializer(data=request.data)

        if serializer.is_valid():
            job_application = serializer.validated_data['job_application']

            if job_application.user != request.user:
                return Response(
                    {"error": "You cannot schedule an interview for another user's job application."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            serializer.save()

            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class InterviewDetailView(APIView):

    permission_classes = [IsAuthenticated]

    # Find an interview belonging to the logged-in user
    def get_object(self, pk, user):
        return get_object_or_404(
            Interview,
            pk=pk,
            job_application__user=user
        )

    # GET: View one interview
    def get(self, request, pk):
        interview = self.get_object(pk, request.user)
        serializer = InterviewSerializer(interview)

        return Response(serializer.data)

    # PUT: Update the complete interview
    def put(self, request, pk):
        interview = self.get_object(pk, request.user)

        serializer = InterviewSerializer(
            interview,
            data=request.data
        )

        if serializer.is_valid():
            job_application = serializer.validated_data.get(
                'job_application',
                interview.job_application
            )

            if job_application.user != request.user:
                return Response(
                    {"error": "You cannot use another user's job application."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            serializer.save()
            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    # PATCH: Update selected interview fields
    def patch(self, request, pk):
        interview = self.get_object(pk, request.user)

        serializer = InterviewSerializer(
            interview,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            job_application = serializer.validated_data.get(
                'job_application',
                interview.job_application
            )

            if job_application.user != request.user:
                return Response(
                    {"error": "You cannot use another user's job application."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            serializer.save()
            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    # DELETE: Delete an interview
    def delete(self, request, pk):
        interview = self.get_object(pk, request.user)
        interview.delete()

        return Response(
            {"message": "Interview deleted successfully"},
            status=status.HTTP_200_OK
        )

class InterviewExportView(APIView):

    permission_classes = [IsAuthenticated]

    # GET: Export logged-in user's interviews as CSV
    def get(self, request):

        interviews = Interview.objects.filter(
            job_application__user=request.user
        ).select_related(
            'job_application'
        ).order_by('-interview_date')

        response = HttpResponse(
            content_type='text/csv'
        )

        response['Content-Disposition'] = (
            'attachment; filename="interviews.csv"'
        )

        writer = csv.writer(response)

        # CSV column headings
        writer.writerow([
            'Company Name',
            'Job Role',
            'Interview Date',
            'Interview Round',
            'Interview Mode',
            'Status',
            'Feedback'
        ])

        # Write interview records
        for interview in interviews:
            writer.writerow([
                interview.job_application.company_name,
                interview.job_application.job_role,
                interview.interview_date,
                interview.interview_round,
                interview.interview_mode,
                interview.status,
                interview.feedback
            ])

        return response

class InterviewPDFExportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        interviews = Interview.objects.filter(
            job_application__user=request.user
        ).select_related(
            'job_application'
        ).order_by('-interview_date')

        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = (
            'attachment; filename="interviews.pdf"'
        )

        pdf = canvas.Canvas(response, pagesize=A4)
        width, height = A4

        y = height - 50

        pdf.setFont('Helvetica-Bold', 16)
        pdf.drawString(50, y, 'Interview Report')

        y -= 40

        for interview in interviews:
            if y < 100:
                pdf.showPage()
                y = height - 50

            pdf.setFont('Helvetica-Bold', 11)
            pdf.drawString(
                50,
                y,
                f"{interview.job_application.company_name} - "
                f"{interview.job_application.job_role}"
            )

            y -= 20

            pdf.setFont('Helvetica', 9)

            details = [
                f"Date: {interview.interview_date}",
                f"Round: {interview.interview_round}",
                f"Mode: {interview.interview_mode}",
                f"Status: {interview.status}",
                f"Feedback: {interview.feedback or 'No feedback'}"
            ]

            for detail in details:
                pdf.drawString(60, y, detail[:110])
                y -= 15

            y -= 15

        pdf.save()
        return response