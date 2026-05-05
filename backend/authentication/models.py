from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = [
        ('user', 'User'),
        ('academy', 'Academy'),
    ]
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
    email = models.EmailField(unique=True)
    def __str__(self):
        return f"{self.username} ({self.role})"
    
class UserProfile(models.Model):
    user = models.OneToOneField(
        'authentication.User',
        on_delete=models.CASCADE,
        related_name='profile',
        limit_choices_to={'role': 'user'}
    )
    phone = models.CharField(max_length=20, blank=True)
    avatar = models.ImageField(upload_to='users/', blank=True, null=True)

    def __str__(self):
        return f"Profile of {self.user.username}"
