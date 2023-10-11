from django.urls import path
from .views import (
    LogIn,
    LogOut,
    SignUp,
    Search,
    Block,
    Unblock,
    Report
)

urlpatterns = [
    path('login/', LogIn.as_view()),
    path('signup/', SignUp.as_view()),
    path('logout/', LogOut.as_view()),
    path('search/', Search.as_view()),
    path('block/<str:username>/', Block.as_view()),
    path('unblock/<str:username>/', Unblock.as_view()),
    path('report/<str:username>/', Report.as_view()),
]