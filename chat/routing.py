from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r"ws/chat/(?P<other_user>[\w.@+-]+)/$", consumers.ChatConsumer.as_asgi()),
    re_path(r"ws/status/$", consumers.OnlineStatusConsumer.as_asgi()),
]