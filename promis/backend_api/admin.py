from django.contrib import admin

# Register your models here.

from .models import Space_projects, Devices, Channels, Parameters

admin.site.register([Space_projects, Devices, Channels, Parameters])
