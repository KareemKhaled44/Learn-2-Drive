# dashboard/views/trainers.py
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.db.models import Avg, Count
from authentication.permissions import IsAcademy
from dashboard.serializers.trainers import (
    TrainerDashboardSerializer,
    TrainerCreateUpdateSerializer,
)
from academy.models import Trainer


class TrainerListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAcademy]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return TrainerCreateUpdateSerializer
        return TrainerDashboardSerializer

    def get_queryset(self):
        return (
            Trainer.objects
            .filter(academy=self.request.user.academy_profile)
            .annotate(
                avg_rating=Avg('ratings__rating'),
                reviews_count=Count('ratings'),
            )
        )

    def perform_create(self, serializer):
        serializer.save(academy=self.request.user.academy_profile)


class TrainerRetrieveUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAcademy]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    http_method_names = ['get', 'patch', 'delete']

    def get_serializer_class(self):
        if self.request.method == 'PATCH':
            return TrainerCreateUpdateSerializer
        return TrainerDashboardSerializer

    def get_queryset(self):
        return (
            Trainer.objects
            .filter(academy=self.request.user.academy_profile)
            .annotate(
                avg_rating=Avg('ratings__rating'),
                reviews_count=Count('ratings'),
            )
        )