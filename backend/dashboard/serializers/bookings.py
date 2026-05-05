from rest_framework import serializers
from bookings.models import Booking


class AcademyBookingSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='user.username', read_only=True)
    student_email = serializers.CharField(source='user.email', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)
    trainer_name = serializers.CharField(source='trainer.name', read_only=True)
    remaining_sessions = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            'id',
            'student_name',
            'student_email',
            'course_title',
            'trainer_name',
            'status',
            'scheduled_date',
            'start_time',
            'total_price',
            'notes',
            'booked_at',
            'cancelled_at',
            'remaining_sessions',
        ]
        read_only_fields = [
            'student_name',
            'student_email',
            'course_title',
            'trainer_name',
            'booked_at',
            'cancelled_at',
            'total_price',
        ]

    def get_remaining_sessions(self, obj):
        return obj.course.sessions - 1


class AcademyBookingUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ['status']

    def validate_status(self, value):
        allowed = ['confirmed', 'completed', 'cancelled']
        if value not in allowed:
            raise serializers.ValidationError(
                f"Status must be one of: {', '.join(allowed)}"
            )
        return value