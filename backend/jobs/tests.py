from django.contrib.auth.models import User
from django.urls import reverse
from django.utils import timezone

from rest_framework import status
from rest_framework.test import APITestCase

from .models import JobApplication
from datetime import timedelta
from interviews.models import Interview


class JobApplicationAPITest(APITestCase):

    def setUp(self):

        # Create a test user
        self.user = User.objects.create_user(
            username='testuser',
            password='testpassword123'
        )

        # Authenticate the test user
        self.client.force_authenticate(user=self.user)

        # Create a sample job application
        self.job = JobApplication.objects.create(
            user=self.user,
            company_name='Infosys',
            job_role='Python Developer',
            job_description='Entry-level Python developer',
            job_location='Bengaluru',
            job_type='Full Time',
            salary=350000,
            application_date=timezone.localdate(),
            status='Applied'
        )

        self.url = '/api/jobs/'

    # Test GET: View job applications
    def test_get_jobs(self):

        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.assertEqual(response.data['count'], 1)

    # Test POST: Create a job application
    def test_create_job(self):

        data = {
            'company_name': 'Wipro',
            'job_role': 'Python Developer',
            'job_description': 'Python developer vacancy',
            'job_location': 'Bengaluru',
            'job_type': 'Full Time',
            'salary': '400000',
            'application_date': str(timezone.localdate()),
            'status': 'Applied',
            'job_url': '',
            'notes': ''
        }

        response = self.client.post(
            self.url,
            data,
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )

        self.assertEqual(
            JobApplication.objects.count(),
            2
        )

    # Test PATCH: Update application status
    def test_update_job_status(self):

        url = f'{self.url}{self.job.id}/'

        data = {
            'status': 'Interview'
        }

        response = self.client.patch(
            url,
            data,
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.job.refresh_from_db()

        self.assertEqual(
            self.job.status,
            'Interview'
        )

    # Test DELETE: Delete application
    def test_delete_job(self):

        url = f'{self.url}{self.job.id}/'

        response = self.client.delete(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.assertFalse(
            JobApplication.objects.filter(
                id=self.job.id
            ).exists()
        )

    # Test validation: Negative salary
    def test_negative_salary(self):

        data = {
            'company_name': 'TCS',
            'job_role': 'Python Developer',
            'job_location': 'Bengaluru',
            'job_type': 'Full Time',
            'salary': '-5000',
            'application_date': str(timezone.localdate()),
            'status': 'Applied'
        }

        response = self.client.post(
            self.url,
            data,
            format='json'
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

class DashboardAPITest(APITestCase):

    def setUp(self):

        # Create test user
        self.user = User.objects.create_user(
            username='dashboarduser',
            password='testpassword123'
        )

        self.client.force_authenticate(user=self.user)

        # Create job applications with different statuses
        self.job1 = JobApplication.objects.create(
            user=self.user,
            company_name='Infosys',
            job_role='Python Developer',
            job_location='Bengaluru',
            job_type='Full Time',
            application_date=timezone.localdate(),
            status='Applied'
        )

        self.job2 = JobApplication.objects.create(
            user=self.user,
            company_name='Wipro',
            job_role='Django Developer',
            job_location='Bengaluru',
            job_type='Full Time',
            application_date=timezone.localdate(),
            status='Interview'
        )

        self.job3 = JobApplication.objects.create(
            user=self.user,
            company_name='TCS',
            job_role='Python Developer',
            job_location='Bengaluru',
            job_type='Full Time',
            application_date=timezone.localdate(),
            status='Selected'
        )

        # Create an upcoming interview
        Interview.objects.create(
            job_application=self.job2,
            interview_date=timezone.now() + timedelta(days=2),
            interview_round='Technical Round 1',
            interview_mode='Online',
            status='Scheduled'
        )

        self.url = '/api/dashboard/'

    # Test dashboard statistics
    def test_dashboard_statistics(self):

        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.assertEqual(response.data['total_applications'], 3)
        self.assertEqual(response.data['applied'], 1)
        self.assertEqual(response.data['interview'], 1)
        self.assertEqual(response.data['selected'], 1)
        self.assertEqual(response.data['total_interviews'], 1)
        self.assertEqual(response.data['upcoming_interviews'], 1)

    # Test dashboard user data isolation
    def test_dashboard_user_isolation(self):

        another_user = User.objects.create_user(
            username='anotherdashboarduser',
            password='testpassword123'
        )

        JobApplication.objects.create(
            user=another_user,
            company_name='Google',
            job_role='Software Developer',
            job_location='Bengaluru',
            job_type='Full Time',
            application_date=timezone.localdate(),
            status='Applied'
        )

        response = self.client.get(self.url)

        self.assertEqual(
            response.data['total_applications'],
            3
        )