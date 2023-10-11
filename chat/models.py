from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Room(models.Model):
    users = models.ManyToManyField(User)
    timestamp = models.DateTimeField(auto_now_add=True)

    def last_message(self):
        message = Message.objects.filter(room=self).last()
        return message

    def other_user(self, current_user):
        user = self.users.exclude(id=current_user.id).first()
        return user

    def __str__(self) -> str:
        return f"{self.id}"
    
class Message(models.Model):
    text = models.TextField()
    seen = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)
    sender = models.ForeignKey(User, related_name="sender", blank=True, null=True, on_delete=models.SET_NULL)
    receiver = models.ForeignKey(User, related_name="receiver", blank=True, null=True, on_delete=models.SET_NULL)
    room = models.ForeignKey(Room, on_delete=models.CASCADE, db_index=True)

    class Meta:
        ordering = ('-timestamp',)

    def __str__(self) -> str:
        return f"{self.id}"