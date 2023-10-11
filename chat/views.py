from django.shortcuts import render
from django.core.paginator import Paginator, EmptyPage
from django.db.models import Subquery, OuterRef
from django.contrib.auth import get_user_model

from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from chat.models import Room, Message

from .serializers import RoomSerializer, MessageSerializer

User = get_user_model()


class Rooms(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request) -> Response:
        """Get all rooms (chats) which the current user is in"""

        current_user = request.user
        rooms = Room.objects.filter(users=current_user)
        serializer = RoomSerializer(
            rooms,
            context={'current_user': current_user},
            many=True
        )
        return Response({"status": True, "data": serializer.data})
    

class RoomMessages(APIView):
    """
    Gets the last twenty messages in a room
    """

    permission_classes = (IsAuthenticated,)

    def get(self, request, other_user: int):
        other_user = User.objects.get(username=other_user)
        room_query_set = Room.objects.filter(users=other_user).filter(users=request.user)
        if not room_query_set.exists():
            return Response({"error": "An error occurred"}, status=status.HTTP_404_NOT_FOUND)
        room = room_query_set.first()
        messages = Message.objects.filter(room=room)
        page = request.query_params.get('page')
        if page:
            paginator = Paginator(messages, 2)
            try:
                paginated_messages = paginator.page(page)
            except EmptyPage:
                paginated_messages = []
            serializer = MessageSerializer(paginated_messages, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        serializer = MessageSerializer(messages[:30], many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    

class UnreadMessages(APIView):
    def get(self, request):

        rooms_with_last_message = Room.objects.filter(
            users=request.user
        ).annotate(
            last_message_timestamp=Subquery(
                Message.objects.filter(room=OuterRef('pk')).order_by('-timestamp').values('timestamp')[:1]
            ),
            last_message_sender=Subquery(
                Message.objects.filter(room=OuterRef('pk')).order_by('-timestamp').values('sender')[:1]
            ),
            last_message_seen=Subquery(
                Message.objects.filter(room=OuterRef('pk')).order_by('-timestamp').values('seen')[:1]
            )
        )

        unread = rooms_with_last_message.exclude(
            last_message_seen=True
        ).exclude(
            last_message_sender=request.user
        ).count()

        return Response({"unread": unread})


class Index(APIView):
    def get(self, request):
        return Response({"message": "Logged in"})


def index(request):
    return render(request, "chat/index.html")

def room(request, room_name):
    return render(request, "chat/room.html", {"room_name": room_name})