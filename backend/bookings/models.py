from datetime import datetime, timedelta

from django.db import models
from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from django.db.models import Q


def _normalize_working_days(working_days):
    if not isinstance(working_days, list):
        return []
    return [
        str(day).strip().lower()
        for day in working_days
        if isinstance(day, str) and str(day).strip()
    ]


class Booking(models.Model):
    STATUS_CHOICES = [
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='bookings'
    )
    course = models.ForeignKey(
        'academy.Course',
        on_delete=models.CASCADE,
        related_name='bookings'
    )
    trainer = models.ForeignKey(
        'academy.Trainer',
        on_delete=models.CASCADE,
        related_name='bookings'
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='confirmed'
    )

    booked_at = models.DateTimeField(auto_now_add=True)
    scheduled_date = models.DateField()
    start_time = models.TimeField()
    cancelled_at = models.DateTimeField(null=True, blank=True)

    total_price = models.DecimalField(max_digits=8, decimal_places=2)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['-booked_at']
        constraints = [
            models.UniqueConstraint(
                fields=['trainer', 'scheduled_date', 'start_time'],
                condition=Q(status='confirmed'),
                name='unique_confirmed_booking_slot',
            )
        ]

    def clean(self):
        errors = {}

        if not self.course_id or not self.trainer_id:
            return

        course = self.course
        trainer = self.trainer

        # 1) Enforce trainer-course assignment for admin and ModelForm-based flows.
        if not course.trainers.filter(pk=trainer.pk).exists():
            errors['trainer'] = 'This trainer is not assigned to this course.'

        # 2) Enforce booking day to be in trainer working days.
        if self.scheduled_date:
            day_name = self.scheduled_date.strftime('%A').lower()
            working_days = _normalize_working_days(trainer.working_days)

            if not working_days:
                errors['trainer'] = 'This trainer has no working days configured.'
            elif day_name not in working_days:
                errors['scheduled_date'] = f'This trainer does not work on {day_name.capitalize()}.'

        # 3) Enforce start_time inside trainer session window and aligned with course duration.
        if self.scheduled_date and self.start_time and trainer.session_start_time and trainer.session_end_time:
            slot_duration = timedelta(minutes=course.duration)
            current_time = datetime.combine(self.scheduled_date, trainer.session_start_time)
            end_time = datetime.combine(self.scheduled_date, trainer.session_end_time)
            requested_time = datetime.combine(self.scheduled_date, self.start_time)

            valid_slots = set()
            while current_time + slot_duration <= end_time:
                valid_slots.add(current_time.time())
                current_time += slot_duration

            if self.start_time not in valid_slots:
                errors['start_time'] = 'Start time is outside trainer availability for this course duration.'

        if errors:
            raise ValidationError(errors)

    def __str__(self):
        return f"{self.user} booked {self.course} with {self.trainer} on {self.scheduled_date}"