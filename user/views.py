from django.contrib.auth import authenticate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authtoken.models import Token
from .serializers import UserSerializer

class SignUp(APIView):
    """Sign up a user"""

    permission_classes = (AllowAny,)

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class LogIn(APIView):
    """Log in a user"""

    permission_classes = (AllowAny,)

    def post(self, request):
        print(request.data.get('username'))
        print(request.data.get('username'))
        try:
            user = authenticate(
                username=request.data.get('username'),
                password=request.data.get('password')
            )
        except:
            user = None
        if not user:
            return Response({
                "error": "Invalid login details"
            }, status=status.HTTP_400_BAD_REQUEST)
        token = Token.objects.get(user=user)
        serializer = UserSerializer(user)
        return Response({
            "token": token.key,
            "user": serializer.data
        })


class LogOut(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        try:
            request.user.auth_token.delete()
            return Response(status=status.HTTP_200_OK)
        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        

