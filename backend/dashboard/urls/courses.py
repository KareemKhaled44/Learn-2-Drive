from django.urls import path
from dashboard.views.courses import (
    CourseListCreateView,
    CourseRetrieveUpdateDeleteView,
)

urlpatterns = [
    path('', CourseListCreateView.as_view(), name='dashboard-course-list'),
    path('<int:pk>/', CourseRetrieveUpdateDeleteView.as_view(), name='dashboard-course-detail'),
]
