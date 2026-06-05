from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from django.contrib.auth.hashers import make_password
from .serializers import AcademyRegisterSerializer, UserRegisterSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.exceptions import AuthenticationFailed
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from .serializers import UserProfileSerializer
User = get_user_model()
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.conf import settings
from django.core.mail import send_mail
from rest_framework.permissions import AllowAny

# Create your views here.
# ================================
# User Registration View
# ================================
class UserRegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "User account created successfully."},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ================================
# Academy Registration View
# ================================
class AcademyRegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = AcademyRegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {
                    "message": "Academy registration submitted successfully.",
                    "status": "pending",
                    "info": "Your academy is under review. You will be notified once approved."
                },
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        # find user by email
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise AuthenticationFailed("No account found with this email.")

        # check password
        if not user.check_password(password):
            raise AuthenticationFailed("Invalid email or password.")

        # check if active
        if not user.is_active:
            raise AuthenticationFailed("This account is disabled.")

        # check academy status
        if user.role == 'academy':
            try:
                academy = user.academy_profile
                if academy.status == 'pending':
                    raise AuthenticationFailed(
                        "Your academy is still under review. Please wait for approval."
                    )
                elif academy.status == 'rejected':
                    raise AuthenticationFailed(
                        f"Your academy registration was rejected. Reason: {academy.rejected_reason or 'No reason provided.'}"
                    )
                elif academy.status == 'suspended':
                    raise AuthenticationFailed(
                        "Your academy has been suspended. Please contact support."
                    )
            except ObjectDoesNotExist:
                raise AuthenticationFailed("Academy profile not found.")

        # generate tokens manually
        refresh = self.get_token(user)
        data = {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }

        self.user = user
        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        data = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "phone": user.profile.phone if hasattr(user, 'profile') else None,
        }
        if user.role == 'academy':
            try:
                academy = user.academy_profile
                data['academy_id'] = academy.id
                data['academy_name'] = academy.name
                data['academy_status'] = academy.status
            except Exception:
                data['academy_id'] = None
                data['academy_name'] = None
                data['academy_status'] = None
        return Response(data, status=status.HTTP_200_OK)

    def patch(self, request):
        user = request.user
        data = request.data

        # update username
        if 'name' in data:
            user.username = data['name']

        # update email
        if 'email' in data:
            # check email not taken by another user
            if User.objects.exclude(pk=user.pk).filter(email=data['email']).exists():
                return Response(
                    {"email": "This email is already in use."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            user.email = data['email']

        user.save()

        # update phone in UserProfile
        if 'phone' in data and hasattr(user, 'profile'):
            user.profile.phone = data['phone']
            user.profile.save()

        return Response({
            "username": user.username,
            "email": user.email,
            "phone": user.profile.phone if hasattr(user, 'profile') else None,
        }, status=status.HTTP_200_OK)


class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({"email": "This field is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            # Do not reveal whether email exists
            return Response({"detail": "If an account with that email exists, a reset link has been sent."}, status=status.HTTP_200_OK)

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        reset_link = f"{getattr(settings, 'FRONTEND_URL', '')}/reset-password?uid={uid}&token={token}"

        subject = 'Password reset request'
        message = f"Hi {user.username},\n\nYou requested a password reset. Click the link below to reset your password:\n\n{reset_link}\n\nIf you didn't request this, please ignore this email."
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email], fail_silently=True)

        return Response({"detail": "If an account with that email exists, a reset link has been sent."}, status=status.HTTP_200_OK)


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        uidb64 = request.data.get('uid')
        token = request.data.get('token')
        new_password = request.data.get('new_password')

        if not uidb64 or not token or not new_password:
            return Response({"detail": "uid, token and new_password are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except Exception:
            return Response({"detail": "Invalid link."}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response({"detail": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()

        return Response({"detail": "Password has been reset successfully."}, status=status.HTTP_200_OK)