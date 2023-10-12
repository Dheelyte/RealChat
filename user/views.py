from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authtoken.models import Token
from .serializers import UserSerializer
from .models import ReportUser, BlockUser


User = get_user_model()


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
    """Logs in a user"""

    permission_classes = (AllowAny,)

    def post(self, request):
        try:
            user = authenticate(
                username=request.data.get('username'),
                password=request.data.get('password')
            )
        except:
            user = None
        if not user:
            return Response({"error": "Invalid login details"}, status=status.HTTP_400_BAD_REQUEST)
        token, _ = Token.objects.get_or_create(user=user)
        serializer = UserSerializer(user)
        return Response({"token": token.key, "user": serializer.data})


class LogOut(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        try:
            request.user.auth_token.delete()
            return Response(status=status.HTTP_200_OK)
        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)


class Search(APIView):
    permission_classes = (AllowAny,)

    def get(self, request):
        search_term = request.GET.get('search_term')
        users = User.objects.filter(username__startswith=search_term)
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)


class OnlineStatus(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request, username):
        online = User.objects.get(username=username).online
        return Response({"online": online})

        

class Report(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request, username):
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({"error": "User does not exist"}, status=status.HTTP_404_NOT_FOUND)
        if user != request.user:
            ReportUser.objects.get_or_create(reported_user=user, reported_by_user=request.user)
            return Response({"message": "User has been reported"}, status=status.HTTP_200_OK)



class Block(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request, username):
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({"error": "User does not exist"}, status=status.HTTP_404_NOT_FOUND)
        if BlockUser.objects.filter(blocked_user=request.user, blocked_by_user=user).exists():
            return Response(
                {"error": "You have been blocked by this user"},
                status=status.HTTP_403_FORBIDDEN
            )
        return Response(status=status.HTTP_200_OK)


    def post(self, request, username):
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({"error": "User does not exist"}, status=status.HTTP_404_NOT_FOUND)
        if user != request.user:
            BlockUser.objects.get_or_create(blocked_user=user, blocked_by_user=request.user)
            return Response({"message": "User has been blocked"}, status=status.HTTP_200_OK)


class Unblock(APIView):

    def post(self, request, username):
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({"error": "User does not exist"}, status=status.HTTP_404_NOT_FOUND)
        
        try:
            BlockUser.objects.get(blocked_user=user, blocked_by_user=request.user).delete()
        except BlockUser.DoesNotExist:
            return Response({"error": "An error occurred"}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"message": "User has been unblocked"}, status=status.HTTP_200_OK)
