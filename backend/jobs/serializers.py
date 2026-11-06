from rest_framework import serializers
from .models import JobApplication


class JobApplicationSerializer(serializers.ModelSerializer):

    class Meta:
        model = JobApplication
        fields = '__all__'
        read_only_fields = [
            'user',
            'created_at',
            'updated_at'
        ]

    def validate_company_name(self, value):
        if not value.strip():
            raise serializers.ValidationError(
                "Company name cannot be empty."
            )

        return value.strip()

    def validate_job_role(self, value):
        if not value.strip():
            raise serializers.ValidationError(
                "Job role cannot be empty."
            )

        return value.strip()

    def validate_job_location(self, value):
        if not value.strip():
            raise serializers.ValidationError(
                "Job location cannot be empty."
            )

        return value.strip()

    def validate_salary(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError(
                "Salary cannot be negative."
            )

        return value