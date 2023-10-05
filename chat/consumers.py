from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async

from django.db.models import Q

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
        Connect to a channel room group
        """

        # Get the other user's username in the URL
        other_user_name = self.scope["url_route"]["kwargs"]["other_user"]
        
        self.current_user = self.scope['user']
        self.other_user = await self.check_user(other_user_name, self.current_user.username)

        self.room = await self.join_or_create_room(self.other_user, self.current_user)

        self.room_group_id = f"room_{self.room.id}"
        await self.channel_layer.group_add(self.room_group_id, self.channel_name)

        await self.accept()

    async def disconnect(self, close_code):
        """
        Disconnect from a channel room group
        """

        pass
        

    async def receive_json(self, data):
        """
        Receives data from the websocket in json format,
        then sends it to the room group
        """

        text = data.get("text")
        type = data.get("type")
        sender = data.get("sender")
      
        if type == "message":
            # Save the message to the database
            await self.save_message(text)

            # Send received message to the room grop
            await self.channel_layer.group_send(
                self.room_group_id,
                {
                    "type": f"chat.{type}",
                    "text": text,
                    "sender": sender,
                    #"receiver": self.other_user.username
                }
            )

    @database_sync_to_async
    def save_message(self, text):
        Message.objects.create(
            text=text,
            sender=self.current_user,
            receiver=self.other_user,
            room=self.room,
        )

    async def chat_message(self, event):
        """
        Send data of type 'message' to the websocket
        """

        # Get message from chat.message event
        text, sender = event["text"], event["sender"]
        await self.send_json({
            "text": text,
            "sender": sender
        })

    @database_sync_to_async
    def check_user(self, other_user, current_user):
        """
        Check if the username from the URL exists.
        If it doesn't, raise an exception
        """

        if other_user != current_user:    
            user = User.objects.get(username=other_user) 
            return user
        raise PermissionError

    @database_sync_to_async
    def join_or_create_room(self, other_user, current_user):
        """
        Check if a room exists. If it exists, return the room's id
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
