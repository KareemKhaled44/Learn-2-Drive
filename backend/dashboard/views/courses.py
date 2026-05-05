from rest_framework import generics
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.db.models import Avg, Count
from authentication.permissions import IsAcademy
from dashboard.serializers.courses import (
    CourseDashboardSerializer,
    CourseCreateUpdateSerializer,
)
from academy.models import Course


class CourseListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAcademy]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CourseCreateUpdateSerializer
        return CourseDashboardSerializer

    def get_queryset(self):
        return (
            Course.objects
            .filter(academy=self.request.user.academy_profile)
            .annotate(
                avg_rating=Avg('ratings__rating'),
                reviews_count=Count('ratings'),
            )
            .prefetch_related('trainers')
        )

    def perform_create(self, serializer):
        serializer.save(academy=self.request.user.academy_profile)


class CourseRetrieveUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAcademy]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    http_method_names = ['get', 'patch', 'delete']

    def get_serializer_class(self):
        if self.request.method == 'PATCH':
            return CourseCreateUpdateSerializer
        return CourseDashboardSerializer

    def get_queryset(self):
        return (
            Course.objects
            .filter(academy=self.request.user.academy_profile)
            .annotate(
                avg_rating=Avg('ratings__rating'),
                reviews_count=Count('ratings'),
            )
            .prefetch_related('trainers')
        )