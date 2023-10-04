from django.urls import path
from .views import (
    LogIn,
    LogOut,
    SignUp
)

urlpatterns = [
    path('login/', LogIn.as_view()),
    path('signup/', SignUp.as_view()),
    path('logout/', LogOut.as_view())
]