# permissions.py
from rest_framework.permissions import BasePermission

class IsAcademy(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'academy'

class IsRegularUser(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'user'