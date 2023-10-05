from django.shortcuts import render
from django.core.paginator import Paginator, EmptyPage
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from chat.models import Room, Message

from .serializers import RoomSerializer, MessageSerializer


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

    def get(self, request, room_id: int):
        messages = Message.objects.filter(room__id=room_id)
        page = request.query_params.get('page')
        if page:
            paginator = Paginator(messages, 2)
            try:
                paginated_messages = paginator.page(page)
            except EmptyPage:
                paginated_messages = []
            serializer = MessageSerializer(paginated_messages, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        serializer = MessageSerializer(messages[:20], many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    




class Index(APIView):
    def get(self, request):
        return Response({"message": "Logged in"})


def index(request):
    return render(request, "chat/index.html")

def room(request, room_name):
    return render(request, "chat/room.html", {"room_name": room_name})