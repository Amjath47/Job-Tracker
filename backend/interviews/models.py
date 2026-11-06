from django.db import models
from jobs.models import JobApplication


class Interview(models.Model):

    INTERVIEW_MODE_CHOICES = [
        ('Online', 'Online'),
        ('Offline', 'Offline'),
        ('Phone', 'Phone'),
    ]

    INTERVIEW_STATUS_CHOICES = [
        ('Scheduled', 'Scheduled'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
    ]

    job_application = models.ForeignKey(
        JobApplication,
        on_delete=models.CASCADE,
        related_name='interviews'
    )

    interview_date = models.DateTimeField()

    interview_round = models.CharField(max_length=100)

    interview_mode = models.CharField(
        max_length=20,
        choices=INTERVIEW_MODE_CHOICES
    )

    status = models.CharField(
        max_length=20,
        choices=INTERVIEW_STATUS_CHOICES,
        default='Scheduled'
    )

    feedback = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.interview_round} - {self.job_application.company_name}"