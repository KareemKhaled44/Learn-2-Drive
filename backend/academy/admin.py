from django.contrib import admin
from django import forms
from .models import *
from django.contrib.contenttypes.admin import GenericTabularInline
from django.utils import timezone
from django.utils.html import format_html
# Register your models here.
class RatingInline(GenericTabularInline):
    model = Rating
    extra = 1

class ContactInfoInline(admin.StackedInline):
    model = ContactInfo
    extra = 1

class ReviewInline(GenericTabularInline):
    model = Review
    extra = 1

class AcademyAdmin(admin.ModelAdmin):
    inlines = [RatingInline, ContactInfoInline, ReviewInline]
    search_fields = ['name', 'location__city', 'location__area']
    list_display = [
        'name',
        'status',
        'locations_display',
        'trainers_count',
        'courses_count',
        'created_at',
    ]
    list_filter = ['status', 'created_at', 'location__city', 'location__area']
    list_editable = ['status']
    list_per_page = 20
    date_hierarchy = 'created_at'
    ordering = ['-created_at']
    filter_horizontal = ['location']
    readonly_fields = ['created_at', 'approved_at', 'approved_by', 'logo_preview']
    actions = ['mark_as_approved', 'mark_as_rejected', 'mark_as_suspended']
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'user', 'description', 'logo', 'logo_preview')
        }),
        ('Location Details', {
            'fields': ('location', 'address_text', 'google_maps_url')
        }),
        ('Approval Workflow', {
            'fields': ('status', 'rejected_reason', 'approved_at', 'approved_by')
        }),
        ('System Metadata', {
            'fields': ('created_at',),
            'classes': ('collapse',),
        }),
    )

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.prefetch_related('location').select_related('approved_by', 'user')

    @admin.display(description='Locations')
    def locations_display(self, obj):
        locations = obj.location.all()
        if not locations:
            return '-'
        return ', '.join(str(loc) for loc in locations)

    @admin.display(description='Trainers')
    def trainers_count(self, obj):
        return obj.trainers.count()

    @admin.display(description='Courses')
    def courses_count(self, obj):
        return obj.courses.count()

    @admin.display(description='Logo Preview')
    def logo_preview(self, obj):
        if not obj.logo:
            return 'No logo uploaded'
        return format_html(
            '<img src="{}" style="max-height: 80px; border-radius: 8px;" />',
            obj.logo.url,
        )

    @admin.action(description='Mark selected academies as approved')
    def mark_as_approved(self, request, queryset):
        queryset.update(
            status='approved',
            rejected_reason='',
            approved_at=timezone.now(),
            approved_by=request.user,
        )

    @admin.action(description='Mark selected academies as rejected')
    def mark_as_rejected(self, request, queryset):
        queryset.update(status='rejected', approved_at=None, approved_by=None)

    @admin.action(description='Mark selected academies as suspended')
    def mark_as_suspended(self, request, queryset):
        queryset.update(status='suspended')

class CourseAdmin(admin.ModelAdmin):
    inlines = [RatingInline, ReviewInline]
    class CourseAdminForm(forms.ModelForm):
        class Meta:
            model = Course
            fields = "__all__"

        def clean(self):
            cleaned_data = super().clean()
            academy = cleaned_data.get("academy")
            trainers = cleaned_data.get("trainers")

            if academy and trainers is not None:
                invalid_trainers = trainers.exclude(academy=academy)
                if invalid_trainers.exists():
                    names = ", ".join(invalid_trainers.values_list("name", flat=True))
                    raise forms.ValidationError(
                        f"These trainers don't belong to {academy.name}: {names}"
                    )

            return cleaned_data

    form = CourseAdminForm

class TrainerAdminForm(forms.ModelForm):
    DAYS_CHOICES = [
        ("saturday", "Saturday"),
        ("sunday", "Sunday"),
        ("monday", "Monday"),
        ("tuesday", "Tuesday"),
        ("wednesday", "Wednesday"),
        ("thursday", "Thursday"),
        ("friday", "Friday"),
    ]

    working_days = forms.MultipleChoiceField(
        choices=DAYS_CHOICES,
        widget=forms.CheckboxSelectMultiple,
        required=False
    )

    class Meta:
        model = Trainer
        fields = '__all__'

class TrainerAdmin(admin.ModelAdmin):
    inlines = [RatingInline, ReviewInline]
    list_display = ['name', 'academy', 'is_active', 'session_start_time', 'session_end_time']
    form = TrainerAdminForm
    
admin.site.register(Rating)
admin.site.register(Academy, AcademyAdmin)
admin.site.register(ContactInfo)
admin.site.register(Course, CourseAdmin)
admin.site.register(Location)
admin.site.register(Trainer, TrainerAdmin)
admin.site.register(Review)
admin.site.register(ContactMessage)