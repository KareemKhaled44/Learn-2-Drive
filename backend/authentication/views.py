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
User = get_user_model()

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
        }

        # add academy info if user is an academy
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