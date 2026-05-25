from rest_framework import generics, status
from rest_framework.response import Response
from django.db.models import Count, Sum
from django.utils import timezone
from datetime import timedelta
from authentication.permissions import IsAcademy
from dashboard.serializers.bookings import (
    AcademyBookingSerializer,
    AcademyBookingUpdateSerializer,
)
from bookings.models import Booking


class AcademyBookingListView(generics.ListAPIView):
    permission_classes = [IsAcademy]
    serializer_class = AcademyBookingSerializer

    def get_queryset(self):
        academy = self.request.user.academy_profile
        queryset = (
            Booking.objects
            .filter(course__academy=academy)
            .select_related('user', 'course', 'trainer')
            .order_by('-booked_at')
        )

        # filter by status if provided
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        # filter by trainer if provided
        trainer_filter = self.request.query_params.get('trainer')
        if trainer_filter:
            queryset = queryset.filter(trainer__id=trainer_filter)

        # filter by course if provided
        course_filter = self.request.query_params.get('course')
        if course_filter:
            queryset = queryset.filter(course__id=course_filter)

        return queryset


class AcademyBookingDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAcademy]
    http_method_names = ['get', 'patch']

    def get_serializer_class(self):
        if self.request.method == 'PATCH':
            return AcademyBookingUpdateSerializer
        return AcademyBookingSerializer

    def get_queryset(self):
        academy = self.request.user.academy_profile
        return (
            Booking.objects
            .filter(course__academy=academy)
            .select_related('user', 'course', 'trainer')
        )


class AcademyBookingStatsView(generics.GenericAPIView):
    permission_classes = [IsAcademy]

    def get(self, request):
        academy = request.user.academy_profile
        bookings = Booking.objects.filter(course__academy=academy)

        today = timezone.localdate()
        days = [today - timedelta(days=i) for i in range(6, -1, -1)]
        daily_counts = bookings.filter(booked_at__date__in=days).values('booked_at__date').annotate(count=Count('id'))
        counts_by_date = {item['booked_at__date']: item['count'] for item in daily_counts}
        weekly_sessions = [
            {
                'date': day.isoformat(),
                'label': day.strftime('%a'),
                'count': counts_by_date.get(day, 0),
            }
            for day in days
        ]

        revenue_base = bookings.filter(status__in=['confirmed', 'completed'])
        daily_revenue = revenue_base.filter(booked_at__date__in=days).values('booked_at__date').annotate(total=Sum('total_price'))
        revenue_by_date = {item['booked_at__date']: float(item['total'] or 0) for item in daily_revenue}
        weekly_revenue = [
            {
                'date': day.isoformat(),
                'label': day.strftime('%a'),
                'total': revenue_by_date.get(day, 0),
            }
            for day in days
        ]

        stats = {
            'total_bookings': bookings.count(),
            'confirmed_bookings': bookings.filter(status='confirmed').count(),
            'completed_bookings': bookings.filter(status='completed').count(),
            'cancelled_bookings': bookings.filter(status='cancelled').count(),
            'weekly_sessions': weekly_sessions,
            'weekly_revenue': weekly_revenue,
            'total_revenue': bookings.filter(
                status__in=['confirmed', 'completed']
            ).aggregate(
                total=Sum('total_price')
            )['total'] or 0,
            'bookings_per_course': list(
                bookings.values('course__title')
                .annotate(count=Count('id'))
                .order_by('-count')
            ),
            'bookings_per_trainer': list(
                bookings.values('trainer__name')
                .annotate(count=Count('id'))
                .order_by('-count')
            ),
        }

        return Response(stats)