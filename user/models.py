from django.db import models
from django.contrib.auth.models import AbstractUser


class CustomUser(AbstractUser):
    """
    Defines a custom User model that makes email unique and required
    and also adds an image and online field
    """

    email = models.EmailField(max_length=50, unique=True, blank=False, null=False)
    image = models.ImageField(default='DefaultUser.png', upload_to='user_thumbnails')
    online = models.PositiveIntegerField(default=0)

    def __str__(self) -> str:
        return self.email
    

class ReportUser(models.Model):
    reported_user = models.ForeignKey(CustomUser, related_name='reported_user', on_delete=models.PROTECT)
    reported_by_user = models.ForeignKey(CustomUser, related_name='reported_by_user', on_delete=models.PROTECT)


class BlockUser(models.Model):
    blocked_user = models.ForeignKey(CustomUser, related_name='blocked_user', on_delete=models.CASCADE)
    blocked_by_user = models.ForeignKey(CustomUser, related_name='blocked_by_user', on_delete=models.CASCADE)