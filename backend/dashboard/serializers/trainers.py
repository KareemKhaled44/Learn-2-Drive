from rest_framework import serializers
from academy.models import Trainer, Location, ContactInfo


class TrainerContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactInfo
        fields = ['id', 'type', 'value']


class TrainerDashboardSerializer(serializers.ModelSerializer):
    contacts = TrainerContactSerializer(many=True, read_only=True)
    location = serializers.StringRelatedField()
    avg_rating = serializers.FloatField(read_only=True)
    reviews_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Trainer
        fields = [
            'id',
            'name',
            'gender',
            'bio',
            'car_model',
            'image',
            'location',
            'experience_years',
            'working_days',
            'session_start_time',
            'session_end_time',
            'is_active',
            'contacts',
            'avg_rating',
            'reviews_count',
        ]


class TrainerCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trainer
        fields = [
            'name',
            'gender',
            'bio',
            'car_model',
            'image',
            'experience_years',
            'working_days',
            'session_start_time',
            'session_end_time',
            'is_active',
        ]

    def validate_location(self, value):
        # make sure location exists
        if value and not Location.objects.filter(pk=value.pk).exists():
            raise serializers.ValidationError("Location not found.")
        return value