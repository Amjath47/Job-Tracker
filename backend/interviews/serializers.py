from rest_framework import serializers
from .models import Interview


class InterviewSerializer(serializers.ModelSerializer):

    class Meta:
        model = Interview
        fields = '__all__'

    def validate_interview_round(self, value):
        if not value.strip():
            raise serializers.ValidationError(
                "Interview round cannot be empty."
            )

        return value.strip()