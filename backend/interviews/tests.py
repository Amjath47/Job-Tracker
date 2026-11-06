from django.contrib.auth.models import User
from django.utils import timezone

from rest_framework import status
from rest_framework.test import APITestCase

from jobs.models import JobApplication
from .models import Interview


class InterviewAPITest(APITestCase):

    def setUp(self):

        # Create a test user
        self.user = User.objects.create_user(
            username='testuser',
            password='testpassword123'
        )

        # Authenticate the test user
        self.client.force_authenticate(user=self.user)

        # Create a job application
        self.job = JobApplication.objects.create(
            user=self.user,
            company_name='Infosys',
            job_role='Python Developer',
            job_location='Bengaluru',
            job_type='Full Time',
            application_date=timezone.localdate(),
            status='Interview'
        )

        # Create an interview
        self.interview = Interview.objects.create(
            job_application=self.job,
            interview_date=timezone.now(),
            interview_round='Technical Round 1',
            interview_mode='Online',
            status='Scheduled',
            feedback=''
        )

        self.url = '/api/interviews/'

    # Test GET: View all interviews
    def test_get_interviews(self):

        response = self.client.get(self.url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.assertEqual(len(response.data['results']), 1)

    # Test POST: Schedule an interview
    def test_create_interview(self):

        data = {
            'job_application': self.job.id,
            'interview_date': '2026-12-10T10:30:00',
            'interview_round': 'Technical Round 2',
            'interview_mode': 'Online',
            'status': 'Scheduled',
            'feedback': ''
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

        self.assertEqual(Interview.objects.count(), 2)

    # Test GET: View one interview
    def test_get_interview_detail(self):

        url = f'{self.url}{self.interview.id}/'

        response = self.client.get(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.assertEqual(
            response.data['interview_round'],
            'Technical Round 1'
        )

    # Test PATCH: Update interview status
    def test_update_interview(self):

        url = f'{self.url}{self.interview.id}/'

        data = {
            'status': 'Completed',
            'feedback': 'Interview completed successfully'
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

        self.interview.refresh_from_db()

        self.assertEqual(
            self.interview.status,
            'Completed'
        )

    # Test DELETE: Delete an interview
    def test_delete_interview(self):

        url = f'{self.url}{self.interview.id}/'

        response = self.client.delete(url)

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.assertFalse(
            Interview.objects.filter(
                id=self.interview.id
            ).exists()
        )

    # Test validation: Empty interview round
    def test_empty_interview_round(self):

        data = {
            'job_application': self.job.id,
            'interview_date': '2026-12-10T10:30:00',
            'interview_round': '   ',
            'interview_mode': 'Online',
            'status': 'Scheduled',
            'feedback': ''
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

    # Test security: Cannot schedule interview for another user
    def test_cannot_use_another_users_job(self):

        another_user = User.objects.create_user(
            username='anotheruser',
            password='anotherpassword123'
        )

        another_job = JobApplication.objects.create(
            user=another_user,
            company_name='TCS',
            job_role='Python Developer',
            job_location='Bengaluru',
            job_type='Full Time',
            application_date=timezone.localdate(),
            status='Applied'
        )

        data = {
            'job_application': another_job.id,
            'interview_date': '2026-12-10T10:30:00',
            'interview_round': 'Technical Round 1',
            'interview_mode': 'Online',
            'status': 'Scheduled',
            'feedback': ''
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

        self.assertEqual(Interview.objects.count(), 1)