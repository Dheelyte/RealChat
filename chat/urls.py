from django.urls import path

from .views import (
    Rooms,
    RoomMessages,
    Index,
    index,
    room
)


urlpatterns = [
    path("rooms/", Rooms.as_view()),
    path("messages/<int:room_id>/", RoomMessages.as_view()),
    path("", index, name="index"),
    path('index/', Index.as_view()),
    path("<str:room_name>/", room, name="room"),
]