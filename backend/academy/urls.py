from django.urls import path
from .views import *

urlpatterns = [
    path("home-academies/", HomeAcademyListView.as_view(), name="home-academies"),
    path('academies/', AcademyListCreateView.as_view(), name='academy-list'),
    path('academies/<int:pk>/', AcademyDetailView.as_view(), name='academy-detail'),
    path("reviews/", ReviewCreateView.as_view(), name="create-review"),
    path("home-courses/", HomeCourseListView.as_view(), name="home-courses"),
    path('courses/', CourseListCreateView.as_view(), name='course-list'),
    path('courses/<int:pk>/', CourseDetailView.as_view(), name='course-detail'),
    path("home-trainers/", HomeTrainerListCreateView.as_view(), name="home-trainers"),
    path('trainers/', TrainerListCreateView.as_view(), name='trainer-list'),
    path('trainer-profile/<int:pk>/', TrainerProfileView.as_view(), name='trainer-profile'),
    path("locations/", LocationListView.as_view()),
    path("contact-messages/", ContactMessageCreateView.as_view(), name="contact-message-create"),
]