import os

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'RealChat.settings')

django_asgi_app = get_asgi_application()

from chat.routing import websocket_urlpatterns
from user.middlewares import TokenAuthMiddleWare

application = ProtocolTypeRouter(
    {
        "http": django_asgi_app,
        "websocket": AllowedHostsOriginValidator(
            TokenAuthMiddleWare(URLRouter(websocket_urlpatterns))
        ),
    }
)
