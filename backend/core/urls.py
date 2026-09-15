# core/urls.py
from django.contrib import admin
from django.conf import settings
from django.urls import path, include
from django.urls import re_path
from django.views.static import serve

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('academy.urls')),
    path('auth/', include('authentication.url')),
    path('bookings/', include('bookings.urls')),
    path('dashboard/', include('dashboard.urls')),
]

urlpatterns += [
    re_path(r'^media/(?P<path>.*)$', serve, {
        'document_root': settings.MEDIA_ROOT,
    }),
]