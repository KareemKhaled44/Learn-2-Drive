from django.contrib import admin
from django.utils import timezone
from .models import Booking


# Register your models here.
class BookingAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'user',
        'course',
        'trainer',
        'status',
        'scheduled_date',
        'start_time',
        'total_price',
        'booked_at',
    )
    list_filter = ('status', 'scheduled_date', 'booked_at', 'trainer', 'course')
    search_fields = (
        'user__username',
        'user__email',
        'course__title',
        'trainer__name',
        'notes',
    )
    ordering = ('-booked_at',)
    list_per_page = 25
    date_hierarchy = 'scheduled_date'
    list_select_related = ('user', 'course', 'trainer')
    readonly_fields = ('booked_at', 'cancelled_at')
    actions = ('mark_as_confirmed', 'mark_as_completed', 'mark_as_cancelled')
    fieldsets = (
        ('Booking Details', {
            'fields': ('user', 'course', 'trainer', 'status')
        }),
        ('Schedule', {
            'fields': ('scheduled_date', 'start_time')
        }),
        ('Pricing & Notes', {
            'fields': ('total_price', 'notes')
        }),
        ('Timestamps', {
            'fields': ('booked_at', 'cancelled_at'),
            'classes': ('collapse',),
        }),
    )

    @admin.action(description='Mark selected bookings as confirmed')
    def mark_as_confirmed(self, request, queryset):
        queryset.update(status='confirmed', cancelled_at=None)

    @admin.action(description='Mark selected bookings as completed')
    def mark_as_completed(self, request, queryset):
        queryset.update(status='completed', cancelled_at=None)

    @admin.action(description='Mark selected bookings as cancelled')
    def mark_as_cancelled(self, request, queryset):
        queryset.update(status='cancelled', cancelled_at=timezone.now())


admin.site.register(Booking, BookingAdmin)