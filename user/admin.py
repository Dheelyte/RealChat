from django.contrib import admin
from .models import CustomUser, ReportUser

# Register your models here.

admin.site.register(CustomUser)
admin.site.register(ReportUser)
