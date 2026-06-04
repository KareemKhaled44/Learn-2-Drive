from datetime import datetime, timedelta

from rest_framework import serializers
from django.utils import timezone
from django.db import transaction
from .models import Booking
from academy.models import Course, Trainer
from authentication.emails import send_booking_confirmation_email


def _normalize_working_days(working_days):
    if not isinstance(working_days, list):
        return []
    return [
        str(day).strip().lower()
        for day in working_days
        if isinstance(day, str) and str(day).strip()
    ]


class BookingCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = [
            'course',
            'trainer',
            'scheduled_date',
            'start_time',
            'notes',
        ]

    def validate(self, data):
        course = data['course']
        trainer = data['trainer']
        scheduled_date = data['scheduled_date']
        start_time = data['start_time']
        working_days = _normalize_working_days(trainer.working_days)

        # 1 - check trainer belongs to the course
        if not course.trainers.filter(pk=trainer.pk).exists():
            raise serializers.ValidationError(
                {"trainer": "This trainer is not assigned to this course."}
            )

        # 2 - check scheduled date is not in the past
        if scheduled_date < timezone.now().date():
            raise serializers.ValidationError(
                {"scheduled_date": "Scheduled date cannot be in the past."}
            )

        # 3 - check trainer is not already booked at this date and time
        if Booking.objects.filter(
            trainer=trainer,
            scheduled_date=scheduled_date,
            start_time=start_time,
            status='confirmed'
        ).exists():
            raise serializers.ValidationError(
                {"start_time": "This trainer is already booked at this date and time."}
            )

        # 4 - check course has available spots
        if course.quantity - course.quantity_sold <= 0:
            raise serializers.ValidationError(
                {"course": "This course is fully booked."}
            )
        
  
        # 5- check scheduled date is a working day for trainer
        day_name = scheduled_date.strftime('%A').lower()
        if not working_days:
            raise serializers.ValidationError(
                {"trainer": "This trainer has no working days configured."}
            )

        if day_name not in working_days:
            raise serializers.ValidationError(
                {"scheduled_date": f"This trainer does not work on {day_name.capitalize()}."}
            )

        # 6 - check start_time is inside trainer session window and aligned to course duration slots
        if not trainer.session_start_time or not trainer.session_end_time:
            raise serializers.ValidationError(
                {"trainer": "This trainer has no session time window configured."}
            )

        session_duration = timedelta(minutes=course.duration)
        current_time = datetime.combine(scheduled_date, trainer.session_start_time)
        end_time = datetime.combine(scheduled_date, trainer.session_end_time)
        valid_slots = set()

        while current_time + session_duration <= end_time:
            valid_slots.add(current_time.time())
            current_time += session_duration

        if start_time not in valid_slots:
            raise serializers.ValidationError(
                {"start_time": "Start time is outside trainer availability for this course duration."}
            )

        return data

    def create(self, validated_data):
        course = validated_data['course']

        with transaction.atomic():
            # set total price from course price
            validated_data['total_price'] = course.price

            # set the user from request
            validated_data['user'] = self.context['request'].user

            # increment quantity sold
            course.quantity_sold += 1
            course.save()

            booking = Booking.objects.create(**validated_data)

            transaction.on_commit(lambda: send_booking_confirmation_email(booking))

        return booking


class BookingListSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True)
    course_id = serializers.IntegerField(source='course.id', read_only=True)
    course_price = serializers.DecimalField(source='course.price', read_only=True, max_digits=10, decimal_places=2)
    course_sessions = serializers.IntegerField(source='course.sessions', read_only=True)
    
    trainer_name = serializers.CharField(source='trainer.name', read_only=True)
    trainer_id = serializers.IntegerField(source='trainer.id', read_only=True)
    trainer_location = serializers.CharField(source='trainer.location.name', read_only=True)
    
    academy_id = serializers.IntegerField(source='course.academy.id', read_only=True)
    academy_name = serializers.CharField(source='course.academy.name', read_only=True)
    academy_address = serializers.CharField(source='course.academy.address_text', read_only=True)
    
    class Meta:
        model = Booking
        fields = [
            'id', 'status', 'scheduled_date', 'start_time', 'booked_at',
            'course_title', 'course_id', 'course_price', 'course_sessions',
            'trainer_name', 'trainer_id', 'trainer_location',
            'academy_id', 'academy_name', 'academy_address'
        ]


class BookingDetailSerializer(serializers.ModelSerializer):
    course = serializers.SerializerMethodField()
    trainer = serializers.SerializerMethodField()
    schedule = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            'id',
            'course',
            'trainer',
            'status',
            'scheduled_date',
            'start_time',
            'total_price',
            'notes',
            'booked_at',
            'cancelled_at',
            'schedule', 
        ]

    def get_course(self, obj):
        return {
            'id': obj.course.id,
            'title': obj.course.title,
            'image': self.context['request'].build_absolute_uri(obj.course.image.url) if obj.course.image else None,
            'academy_name': obj.course.academy.name,
            'academy_id': obj.course.academy.id,
        }

    def get_trainer(self, obj):
        return {
            'id': obj.trainer.id,
            'name': obj.trainer.name,
            'image': self.context['request'].build_absolute_uri(obj.trainer.image.url) if obj.trainer.image else None,
            'car_model': obj.trainer.car_model,
            'phone': obj.trainer.contacts.filter(type='phone').first().value if obj.trainer.contacts.filter(type='phone').exists() else None,
        }
    
    def get_schedule(self, obj):
        trainer = obj.trainer
        course = obj.course
        working_days = _normalize_working_days(trainer.working_days)

        # if trainer has no working days set
        if not working_days:
            return []

        sessions = []
        current_date = obj.scheduled_date + timedelta(days=1)
        session_count = 0

        # Keep session 1 anchored to the actual booked date.
        sessions.append({
            "session_number": 1,
            "date": obj.scheduled_date.strftime('%Y-%m-%d'),
            "day": obj.scheduled_date.strftime('%A'),
            "time": obj.start_time.strftime('%H:%M'),
            "status": "completed" if obj.scheduled_date < obj.booked_at.date() else "scheduled"
        })
        session_count = 1

        # safety limit to avoid infinite loop
        max_days = course.sessions * 14

        while session_count < course.sessions and max_days > 0:
            day_name = current_date.strftime('%A').lower()
            if day_name in working_days:
                sessions.append({
                    "session_number": session_count + 1,
                    "date": current_date.strftime('%Y-%m-%d'),
                    "day": current_date.strftime('%A'),
                    "time": obj.start_time.strftime('%H:%M'),
                    "status": "completed" if current_date < obj.booked_at.date() else "scheduled"
                })
                session_count += 1
            current_date += timedelta(days=1)
            max_days -= 1

        return sessions