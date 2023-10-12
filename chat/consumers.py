from django.utils import timezone
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async

from chat.models import (
    Room,
    User,
    Message,
)


class ChatConsumer(AsyncJsonWebsocketConsumer):
    """
    Asynchronous consumer class for handling chats and messages
    """

    async def connect(self):
        """
        Connects to a channel room group after performing some checks
        """

        other_user_name = self.scope["url_route"]["kwargs"]["other_user"]

        self.current_user = self.scope['user']
        self.other_user = await self.check_user(other_user_name, self.current_user.username)

        self.room = await self.join_or_create_room(self.other_user, self.current_user)
        self.room_group_id = f"room_{self.room.id}"
        await self.channel_layer.group_add(self.room_group_id, self.channel_name)

        await self.accept()

        await self.read_messages(self.room)

    async def disconnect(self, close_code):
        """
        Disconnects from a channel room group
        """

        pass
        
    async def receive_json(self, data):
        """
        Receives data from the websocket in json format,
        then sends it to the room group
        """
        type = data.get("type")
        text = data.get("text")
        sender = data.get("sender")
      
        if type == "message":
            await self.save_message(text)
            # Send received message to the room grop
            await self.channel_layer.group_send(
                self.room_group_id,
                {
                    "type": f"chat.{type}",
                    "text": text,
                    "sender": sender,
                    "timestamp": timezone.now().isoformat(),
                }
            )

        if type == "typing":
            await self.channel_layer.group_send(
                self.room_group_id,
                {
                    "type": f"chat.{type}",
                    "sender": sender,
                }
            )

    async def chat_message(self, event):
        """
        Sends data of type 'message' to the websocket
        """
        # Get message from chat.message event
        await self.send_json({
            "type": "message",
            "text": event["text"],
            "sender": event["sender"],
            "timestamp": event["timestamp"]
        })

    async def chat_typing(self, event):
        """
        Sends data of type 'typing' to the websocket
        """
        # Get message from chat.message event
        await self.send_json({
            "type": "typing",
            "sender": event["sender"],
        })
    
    @database_sync_to_async
    def save_message(self, text):
        """
        Saves a message to the database
        """
        Message.objects.create(
            text=text,
            sender=self.current_user,
            receiver=self.other_user,
            room=self.room,
        )

    @database_sync_to_async
    def read_messages(self, room):
        """
        Updates read messages to seen
        """
        Message.objects.filter(room=room).update(seen=True)

    @database_sync_to_async
    def check_user(self, other_user, current_user):
        """
        Checks if the username from the URL exists.
        If it doesn't, raise an exception
        """
        if other_user != current_user:    
            user = User.objects.get(username=other_user) 
            return user
        raise PermissionError

    @database_sync_to_async
    def join_or_create_room(self, other_user, current_user):
        """
        Checks if a room exists. If it exists, return the room's id
        which is the channel room name. If the room does not exist,
        create a new room then return its id
        """
        room = Room.objects.filter(users=current_user).filter(users=other_user)
        if room.exists():
            return room.first()
        else:
            room = Room.objects.create()
            room.users.add(current_user, other_user)
            return room


class OnlineStatusConsumer(AsyncJsonWebsocketConsumer):
    """
    Asynchronous consumer class for handling the online status of a user
    """

    async def connect(self):
        """
        Called when the websocket connects
        """
        print('Connected')
        self.user = self.scope['user']
        print(self.scope)

        self.user_instance = await self.get_user_instance()

        if self.user_instance is not None:
            print('user instance is not none')
            await self.accept()
            print('Connection accepted')
            await self.set_online()

    async def disconnect(self, close_code):
        """
        Called when the websocket disconnects
        """
        print('Disonnected')
        await self.set_offline()

    @database_sync_to_async
    def get_user_instance(self):
        print('get user called')
        try:
            return User.objects.get(username=self.user.username)
        except User.DoesNotExist:
            return None

    @database_sync_to_async
    def set_online(self):
        """
        Sets a user's online status to True when connected to the websocket
        """
        print('set online called')
        self.user_instance.online = True
        self.user_instance.save()
        print('User set to online')

    @database_sync_to_async
    def set_offline(self):
        """
        Sets a user's online status to False when disconnected from the websocket
        """
        print('set offline called')
        self.user_instance.online = False
        self.user_instance.save()
        print('User set to offline')