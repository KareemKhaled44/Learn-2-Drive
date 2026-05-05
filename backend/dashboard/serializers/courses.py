from rest_framework import serializers
from academy.models import Course, Trainer


class CourseDashboardSerializer(serializers.ModelSerializer):
    avg_rating = serializers.FloatField(read_only=True)
    reviews_count = serializers.IntegerField(read_only=True)
    remaining_spots = serializers.SerializerMethodField()
    trainers = serializers.SerializerMethodField()

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
            'remaining_spots',
            'transmission',
            'is_active',
            'status',
            'rejected_reason',
            'created_at',
            'avg_rating',
            'reviews_count',
            'trainers',
        ]

    def get_remaining_spots(self, obj):
        return obj.quantity - obj.quantity_sold

    def get_trainers(self, obj):
        return obj.trainers.values('id', 'name', 'image')


class CourseCreateUpdateSerializer(serializers.ModelSerializer):
    trainers = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Trainer.objects.filter(status='approved')
    )

    class Meta:
        model = Course
        fields = [
            'title',
            'description',
            'image',
            'price',
            'sessions',
            'duration',
            'quantity',
            'transmission',
            'is_active',
            'trainers',
        ]

    def validate_trainers(self, trainers):
        request = self.context.get('request')
        academy = request.user.academy_profile

        # make sure all trainers belong to this academy
        for trainer in trainers:
            if trainer.academy != academy:
                raise serializers.ValidationError(
                    f"Trainer {trainer.name} does not belong to your academy."
                )
        return trainers

    def create(self, validated_data):
        trainers = validated_data.pop('trainers', [])
        course = Course.objects.create(**validated_data)
        course.trainers.set(trainers)
        return course

    def update(self, instance, validated_data):
        trainers = validated_data.pop('trainers', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if trainers is not None:
            instance.trainers.set(trainers)
        return instance