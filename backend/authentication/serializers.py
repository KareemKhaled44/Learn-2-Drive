from rest_framework import serializers
from .models import User
from academy.models import Academy, ContactInfo


# ================================
# User Registration Serializer
# ================================
class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)
    phone = serializers.CharField(required=True, allow_blank=False)

    class Meta:
        model = User
        fields = ['username', 'email', 'phone', 'password', 'confirm_password']

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return data

    def create(self, validated_data):
        phone = validated_data.pop('phone')
        validated_data.pop('confirm_password')

        user = User.objects.create_user(role='user', **validated_data)

        profile = getattr(user, 'profile', None)
        if profile is not None:
            profile.phone = phone
            profile.save(update_fields=['phone'])

        return user


# ================================
# Academy Registration Serializer
# ================================
class AcademyRegisterSerializer(serializers.Serializer):
    # Account fields
    username = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)

    # Academy fields
    academy_name = serializers.CharField()
    phone = serializers.CharField()

    # Optional
    description = serializers.CharField(required=False, allow_blank=True)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists.")
        return value

    def validate_academy_name(self, value):
        if Academy.objects.filter(name=value).exists():
            raise serializers.ValidationError("Academy name already exists.")
        return value

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return data

    def create(self, validated_data):
        # 1 - create the user
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role='academy'
        )

        # 2 - create the academy (status=pending by default)
        academy = Academy.objects.create(
            user=user,
            name=validated_data['academy_name'],
            description=validated_data.get('description', ''),
        )


        # 3 - create phone contact info
        ContactInfo.objects.create(
            academy=academy,
            type='phone',
            value=validated_data['phone']
        )

        return user


class UserProfileSerializer(serializers.Serializer):
    name = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField(required=False, allow_blank=False)
    phone = serializers.CharField(required=False, allow_blank=True)

    def validate_email(self, value):
        user = getattr(self, 'instance', None)
        if User.objects.exclude(pk=user.pk if user else None).filter(email=value).exists():
            raise serializers.ValidationError('Email already exists.')
        return value

    def update(self, instance, validated_data):
        user = instance
        profile = getattr(user, 'profile', None)

        if 'name' in validated_data:
            user.username = validated_data['name'].strip() or user.username

        if 'email' in validated_data:
            user.email = validated_data['email'].strip() or user.email

        if profile and 'phone' in validated_data:
            profile.phone = validated_data['phone']
            profile.save(update_fields=['phone'])

        user.save(update_fields=['username', 'email'])
        return user