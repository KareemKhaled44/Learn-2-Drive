from django.urls import path
from dashboard.views.bookings import (
    AcademyBookingListView,
    AcademyBookingDetailView,
    AcademyBookingStatsView,
)

urlpatterns = [
    path('', AcademyBookingListView.as_view(), name='dashboard-booking-list'),
    path('<int:pk>/', AcademyBookingDetailView.as_view(), name='dashboard-booking-detail'),
    path('stats/', AcademyBookingStatsView.as_view(), name='dashboard-booking-stats'),
]
