# dashboard/urls/__init__.py
from django.urls import path, include

urlpatterns = [
    path('profile/', include('dashboard.urls.profile')),
    path('trainers/', include('dashboard.urls.trainers')),
    path('courses/', include('dashboard.urls.courses')),
    path('bookings/', include('dashboard.urls.bookings')),
]