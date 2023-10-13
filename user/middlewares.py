from rest_framework.authtoken.models import Token
from urllib.parse import parse_qs
from channels.db import database_sync_to_async


@database_sync_to_async
def get_user(token):
    try:
        return Token.objects.get(key=token).user
    except:
        return None

class TokenAuthMiddleWare:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        #print(scope)
        # headers = dict(scope['headers'])
        # token_name, token_key = headers[b'authorization'].decode().split()
        # if token_name == 'Token':
        query_string = scope["query_string"]
        query_params = query_string.decode()
        query_dict = parse_qs(query_params)
        token = query_dict["token"][0]
        user = await get_user(token)
        if user is not None:
            scope["user"] = user
        return await self.app(scope, receive, send)