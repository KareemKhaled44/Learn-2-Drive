from rest_framework import serializers
from .models import *
from django.db.models import Avg, Count, Min

class AcademySerializer(serializers.ModelSerializer):
    logo = serializers.SerializerMethodField()
    location = serializers.StringRelatedField(many=True) # get only the location name
    courses_count = serializers.IntegerField(source='courses.count', read_only=True)
    trainers_count = serializers.IntegerField(source='trainers.count', read_only=True)
    avg_rating = serializers.FloatField(read_only=True)
    reviews_count = serializers.IntegerField(read_only=True)
    contactInfo = serializers.SerializerMethodField()
    has_female_trainer = serializers.SerializerMethodField()
    minimum_price = serializers.SerializerMethodField()

    class Meta:
        model = Academy
        fields = ['id', 'name', 'description', 'logo', 'location', 'courses_count', 'trainers_count', 'avg_rating', 'reviews_count', 'contactInfo', 'has_female_trainer', 'minimum_price', 'address_text', 'google_maps_url']

    def get_logo(self, obj):
        request = self.context.get('request')
        if request and obj.logo:
            return request.build_absolute_uri(obj.logo.url)
        return None
    
    def get_contactInfo(self, obj):

        contacts = obj.contacts.all()

        return {
            "phones": [c.value for c in contacts if c.type == "phone"],
            "emails": [c.value for c in contacts if c.type == "email"],
            "websites": [c.value for c in contacts if c.type == "website"],
        }

    def get_has_female_trainer(self, obj):
        return obj.trainers.filter(gender='female').exists()
    
    def get_minimum_price(self, obj):
        min_price = obj.courses.aggregate(Min('price'))['price__min']
        return min_price if min_price is not None else 0

    
class TrainerSerializer(serializers.ModelSerializer):
    location = serializers.StringRelatedField() # get only the location name
    avg_rating = serializers.FloatField(read_only=True)
    reviews_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Trainer
        fields = [
            'id',
            'name',
            'gender',
            'bio',
            'car_model',
            'image',
            'location',
            'experience_years',
            'working_days',
            'session_start_time',
            'session_end_time',
            'is_active',
            'avg_rating',
            'reviews_count',
        ]

class CourseSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    trainers = serializers.SerializerMethodField()
    academy = AcademySerializer(read_only=True)
    avg_rating = serializers.FloatField(read_only=True)
    reviews_count = serializers.IntegerField(read_only=True)
    has_female_trainer = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = '__all__'

    def get_image(self, obj):
        request = self.context.get('request')
        if request and obj.image:
            return request.build_absolute_uri(obj.image.url)
        return None
    
    def get_trainers(self, obj):
        trainers = obj.trainers.annotate(
            avg_rating=Avg('ratings__rating'),
            reviews_count=Count('ratings'),
        )

        return TrainerSerializer(trainers, many=True).data
    
    def get_has_female_trainer(self, obj):
        return obj.trainers.filter(gender='female').exists()
    

class TrainerHomeSerializer(serializers.ModelSerializer):
    location = serializers.StringRelatedField() # get only the location name

    class Meta:
        model = Trainer
        fields = [
            'id',
            'name',
            'gender',
            'bio',
            'car_model',
            'image',
            'location',
            'experience_years',
            'working_days',
            'session_start_time',
            'session_end_time',
            'is_active',
        ]

class TrainerProfileSerializer(serializers.ModelSerializer):
    location = serializers.StringRelatedField()

    class Meta:
        model = Trainer
        fields = '__all__'

class AcademyDetailSerializer(AcademySerializer):

    courses = serializers.SerializerMethodField()
    trainers = serializers.SerializerMethodField()
    reviews = serializers.SerializerMethodField()

    class Meta(AcademySerializer.Meta):
        fields = AcademySerializer.Meta.fields + ['courses', 'trainers', 'reviews']

    # =========================
    # Courses
    # =========================
    def get_courses(self, obj):
        courses = obj.courses.filter(status='approved').annotate(
            avg_rating=Avg('ratings__rating'),
            reviews_count=Count('ratings'),
        ).prefetch_related('trainers')  # optimization

        return CourseSerializer(
            courses,
            many=True,
            context=self.context
        ).data

    # =========================
    # Trainers (Academy level)
    # =========================
    def get_trainers(self, obj):
        trainers = obj.trainers.filter(status='approved').annotate(
            avg_rating=Avg('ratings__rating'),
            reviews_count=Count('ratings'),
        )

        return TrainerSerializer(
            trainers,
            many=True,
            context=self.context
        ).data

    # =========================
    # Reviews (Generic)
    # =========================
    def get_reviews(self, obj):
        content_type = ContentType.objects.get_for_model(Academy)

        reviews = Review.objects.filter(
            content_type=content_type,
            object_id=obj.id
        ).select_related("user").order_by("-created_at")[:5]

        return ReviewSerializer(reviews, many=True).data
    
class CourseDetailSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    trainers = serializers.SerializerMethodField()
    academy = AcademySerializer(read_only=True)
    avg_rating = serializers.FloatField(read_only=True)
    reviews_count = serializers.IntegerField(read_only=True)
    has_female_trainer = serializers.SerializerMethodField()
    reviews = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            'id',
            'title',
            'description',
            'image',
            'price',
            'sessions',
            'duration',
            'quantity',
            'quantity_sold',
            'transmission',
            'is_active',
            'created_at',
            'avg_rating',
            'reviews_count',
            'has_female_trainer',
            'academy',
            'trainers',
            'reviews',
        ]

    def get_image(self, obj):
        request = self.context.get('request')
        if request and obj.image:
            return request.build_absolute_uri(obj.image.url)
        return None

    def get_trainers(self, obj):
        trainers = obj.trainers.annotate(
            avg_rating=Avg('ratings__rating'),
            reviews_count=Count('ratings'),
        )
        return TrainerSerializer(
            trainers,
            many=True,
            context=self.context
        ).data

    def get_has_female_trainer(self, obj):
        return obj.trainers.filter(gender='female').exists()

    def get_reviews(self, obj):
        content_type = ContentType.objects.get_for_model(Course)
        reviews = Review.objects.filter(
            content_type=content_type,
            object_id=obj.id
        ).select_related('user').order_by('-created_at')[:5]
        return ReviewSerializer(reviews, many=True).data

    
class ReviewSerializer(serializers.ModelSerializer):

    user_name = serializers.CharField(source="user.username", read_only=True)
    rating = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = [
            "id",
            "user_name",
            "text",
            "created_at",
            "rating",
        ]
        
    def get_rating(self, obj):

        rating = Rating.objects.filter(
            user=obj.user,
            content_type=obj.content_type,
            object_id=obj.object_id
        ).first()

        return rating.rating if rating else 0

class ReviewCreateSerializer(serializers.Serializer):

    content_type = serializers.CharField()
    object_id = serializers.IntegerField()
    rating = serializers.IntegerField(min_value=1, max_value=5)
    text = serializers.CharField()

    def create(self, validated_data):

        user = self.context["request"].user

        model_map = {
            "academy": Academy,
            "course": Course,
            "trainer": Trainer
        }

        model = model_map.get(validated_data["content_type"])

        obj = model.objects.get(id=validated_data["object_id"])

        content_type = ContentType.objects.get_for_model(model)

        review, created = Review.objects.update_or_create(
            user=user,
            content_type=content_type,
            object_id=obj.id,
            defaults={"text": validated_data["text"]}
        )

        Rating.objects.update_or_create(
            user=user,
            content_type=content_type,
            object_id=obj.id,
            defaults={"rating": validated_data["rating"]}
        )

        return review