from rest_framework import serializers
from user.serializers import UserSerializer
from .models import (
    Room,
    Message,
)


class MessageSerializer(serializers.ModelSerializer):

    class Meta:
        model = Message
        fields = (
            'text',
            'seen',
            'timestamp',
            'sender',
            'receiver',
        )

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['timestamp'] = instance.timestamp.strftime("%b %d %I:%M %p")
        return representation



class RoomSerializer(serializers.ModelSerializer):
    other_user = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    
    class Meta:
        model = Room
        fields = (
            'id',
            'other_user',
            'last_message',
            'users',
        )

    def get_other_user(self, room):
        current_user = self.context['current_user']
        other_user = room.other_user(current_user)
        serializer = UserSerializer(other_user)
        return serializer.data
    
    def get_last_message(self, room):
        last_message = room.last_message()
        serializer = MessageSerializer(last_message)
        return serializer.data


