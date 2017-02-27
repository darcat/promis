from django.contrib import admin

# Register your models here.

from .models import Space_project, Device, Channel, Parameter, Unit, Value

admin.site.register([Space_project, Device, Channel, Parameter, Unit, Value])
