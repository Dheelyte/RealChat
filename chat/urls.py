from django.urls import path

from .views import (
    Rooms,
    RoomMessages,
    UnreadMessages,
    send_message_notification,
    Index,
    index,
    room
)


urlpatterns = [
    path("rooms/", Rooms.as_view()),
    path("rooms/<str:other_user>/messages/", RoomMessages.as_view()),
    path("unread/", UnreadMessages.as_view()),
    path("notify/<str:username>/", send_message_notification),
    
    path("", index, name="index"),
    path('index/', Index.as_view()),
    path("<str:room_name>/", room, name="room"),
]