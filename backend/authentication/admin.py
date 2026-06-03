from django.contrib import admin
from .models import User, UserProfile


class UserProfileInline(admin.StackedInline):
      model = UserProfile
      can_delete = False
      verbose_name_plural = 'profile'


class UserAdmin(admin.ModelAdmin):
      inlines = (UserProfileInline,)
      list_display = ('username', 'email', 'phone', 'is_active', 'is_staff')
      list_filter = ('is_active', 'is_staff')
      search_fields = ('username', 'email', 'profile__phone')

      def phone(self, obj):
            return obj.profile.phone if hasattr(obj, 'profile') else ''
      phone.short_description = 'Phone'


admin.site.register(User, UserAdmin)