from django.db import models
from django.contrib.auth.models import AbstractUser


class CustomUser(AbstractUser):
    """
    Defines a custom User model that makes email unique and required
    and also adds an image and online field
    """

    email = models.EmailField(max_length=50, unique=True, blank=False, null=False)
    image = models.ImageField(default='DefaultUser.png', upload_to='user_thumbnails')
    online = models.BooleanField(default=False)

    def __str__(self) -> str:
        return self.email