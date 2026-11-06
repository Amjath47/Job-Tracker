from django.utils import timezone

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from jobs.models import JobApplication
from interviews.models import Interview


class DashboardView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        # Get applications belonging to the logged-in user
        jobs = JobApplication.objects.filter(user=request.user)

        # Get interviews belonging to the logged-in user
        interviews = Interview.objects.filter(
            job_application__user=request.user
        )

        # Calculate job application statistics
        total_applications = jobs.count()

        applied = jobs.filter(status='Applied').count()

        assessment = jobs.filter(status='Assessment').count()

        interview = jobs.filter(status='Interview').count()

        selected = jobs.filter(status='Selected').count()

        rejected = jobs.filter(status='Rejected').count()

        withdrawn = jobs.filter(status='Withdrawn').count()

        # Calculate interview statistics
        total_interviews = interviews.count()

        scheduled_interviews = interviews.filter(
            status='Scheduled'
        ).count()

        completed_interviews = interviews.filter(
            status='Completed'
        ).count()

        cancelled_interviews = interviews.filter(
            status='Cancelled'
        ).count()

        upcoming_interviews_queryset = interviews.filter(
            status='Scheduled',
            interview_date__gte=timezone.now()
        ).select_related('job_application').order_by('interview_date')

        upcoming_interviews = upcoming_interviews_queryset.count()

        upcoming_interview_details = []

        for item in upcoming_interviews_queryset:
            upcoming_interview_details.append({
                "id": item.id,
                "company_name": item.job_application.company_name,
                "job_role": item.job_application.job_role,
                "interview_round": item.interview_round,
                "interview_date": item.interview_date,
                "interview_mode": item.interview_mode,
                "status": item.status
            })

        # Prepare dashboard response
        data = {
            "total_applications": total_applications,
            "applied": applied,
            "assessment": assessment,
            "interview": interview,
            "selected": selected,
            "rejected": rejected,
            "withdrawn": withdrawn,
        
            "total_interviews": total_interviews,
            "scheduled_interviews": scheduled_interviews,
            "completed_interviews": completed_interviews,
            "cancelled_interviews": cancelled_interviews,
        
            "upcoming_interviews": upcoming_interviews,
            "upcoming_interview_details": upcoming_interview_details
        }

        return Response(data)