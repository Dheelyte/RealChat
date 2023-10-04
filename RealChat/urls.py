from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('api/chat/', include('chat.urls')),
    path('api/user/', include('user.urls')),
    path('admin/', admin.site.urls),
]
