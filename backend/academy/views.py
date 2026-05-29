from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django_filters import rest_framework as filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.permissions import AllowAny
from .models import *
from .serializers import *
from django.db.models import Avg, Count, Prefetch

class HomeAcademyListView(generics.ListAPIView):
    serializer_class = AcademySerializer

    def get_queryset(self):
        qs = (
            Academy.objects
            .annotate(
                avg_rating=Avg('ratings__rating'),
                reviews_count=Count('ratings'),
                courses_count=Count('courses'),
            )
            .order_by('-avg_rating')
            .filter(status='approved')
            .distinct()
        )
        return qs[:3]
    
class AcademyListCreateView(generics.ListCreateAPIView):
    serializer_class = AcademySerializer
    filterset_fields = ['location__city', 'location__area', 'courses__transmission']
    search_fields = ['name', 'location__city', 'location__area']
    ordering_fields = ['avg_rating', 'reviews_count', 'created_at', 'courses_count']
    def get_queryset(self):
        qs = (
            Academy.objects
            .annotate(
                avg_rating=Avg('ratings__rating'),
                reviews_count=Count('ratings'),
                courses_count=Count('courses'),
            )
            .filter(status='approved')
            .order_by('-avg_rating')
            .distinct()
        )

        if self.request.query_params.get('has_female_trainer') == 'true':
            qs = qs.filter(trainers__gender='female')

        return qs

class AcademyDetailView(generics.RetrieveAPIView):
    queryset = (
        Academy.objects
        .filter(status='approved')
        .prefetch_related('courses', 'trainers', 'contacts')
        .annotate(
            avg_rating=Avg('ratings__rating'),
            reviews_count=Count('ratings'),
            courses_count=Count('courses')
        )
    )
    serializer_class = AcademyDetailSerializer
    

class HomeCourseListView(generics.ListAPIView):
    serializer_class = CourseSerializer

    def get_queryset(self):
        qs=(
            Course.objects
            .filter(status='approved')
            .annotate(
                    avg_rating=Avg('ratings__rating'),
                    reviews_count=Count('ratings'),)
            .order_by('-avg_rating')
        )
        return qs[:3]

# api call to get course duration options for filtering
class CourseFilter(filters.FilterSet):

    duration = filters.CharFilter(method='filter_duration')

    min_price = filters.NumberFilter(field_name="price", lookup_expr="gte")
    max_price = filters.NumberFilter(field_name="price", lookup_expr="lte")

    has_female_trainer = filters.BooleanFilter(method="filter_female_trainer")

    class Meta:
        model = Course
        fields = ['transmission']

    def filter_duration(self, queryset, name, value):

        if value == "short":
            return queryset.filter(sessions__lte=6)

        elif value == "medium":
            return queryset.filter(sessions__gt=6, sessions__lte=10)

        elif value == "long":
            return queryset.filter(sessions__gt=10, sessions__lte=20)

        elif value == "intensive":
            return queryset.filter(sessions__gt=20)

        return queryset

    def filter_female_trainer(self, queryset, name, value):
        if value:
            return queryset.filter(trainers__gender='female').distinct()
        return queryset
    
class CourseListCreateView(generics.ListCreateAPIView):
    serializer_class = CourseSerializer
    search_fields = ['title']
    filterset_class = CourseFilter
    filter_backends = [DjangoFilterBackend]
    ordering_fields = ['avg_rating', 'reviews_count', 'created_at', 'price']
    
    def get_queryset(self):
        qs=(
            Course.objects
            .filter(status='approved')
            .annotate(
                    avg_rating=Avg('ratings__rating'),
                    reviews_count=Count('ratings'),)
            .order_by('-avg_rating')
            .distinct()
        )
        return qs

class CourseDetailView(generics.RetrieveAPIView):
    serializer_class = CourseDetailSerializer

    def get_queryset(self):
        return (
            Course.objects
            .filter(status='approved')
            .prefetch_related(
                'trainers',
                Prefetch(
                    'academy',
                    queryset=Academy.objects.annotate(
                        avg_rating=Avg('ratings__rating'),
                        reviews_count=Count('ratings'),
                        courses_count=Count('courses'),
                    ).prefetch_related('contacts', 'location')
                )
            )
            .annotate(
                avg_rating=Avg('ratings__rating'),
                reviews_count=Count('ratings'),
            )
        )

class HomeTrainerListCreateView(generics.ListCreateAPIView):
    def get_queryset(self):
        return Trainer.objects.filter(status='approved').prefetch_related("courses")[:5]
    
    serializer_class = TrainerHomeSerializer


class TrainerListCreateView(generics.ListCreateAPIView):
    serializer_class = TrainerSerializer
    def get_queryset(self):
        return (
            Trainer.objects
            .filter(status='approved')
            .annotate(
                avg_rating=Avg('ratings__rating'),
                reviews_count=Count('ratings'),
            )
        )


class TrainerProfileView(generics.RetrieveAPIView):
    def get_queryset(self):
        return Trainer.objects.filter(status='approved')
    serializer_class = TrainerProfileSerializer


# api call to get distinct cities and areas for filtering
class LocationListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        city = request.query_params.get("city")

        if city:
            # return distinct areas for the specified city, ordered alphabetically
            areas = (
                Location.objects
                .filter(city=city)
                .values_list("area", flat=True)
                .distinct()
                .order_by("area")
            )
            return Response(areas)

        # if no city is specified, return distinct cities, ordered alphabetically
        cities = (
            Location.objects
            .values_list("city", flat=True)
            .distinct()
            .order_by("city")
        )
        return Response(cities)

class ContactMessageCreateView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = ContactMessageSerializer

class ReviewCreateView(generics.CreateAPIView):

    serializer_class = ReviewCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        review = serializer.save()

        response_serializer = ReviewSerializer(review)

        return Response(response_serializer.data, status=201)
