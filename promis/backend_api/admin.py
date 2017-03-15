from django.contrib import admin


from .models import Space_project, Device, Channel, Parameter, Unit, Value
from hvad.admin import TranslatableAdmin


class SpaceProjectsAdmin(TranslatableAdmin):
    pass


class DeviceAdmin(TranslatableAdmin):
    pass


class ChannelAdmin(TranslatableAdmin):
    pass


class ParameterAdmin(TranslatableAdmin):
    pass


class ValueAdmin(TranslatableAdmin):
    pass


class UnitAdmin(TranslatableAdmin):
    pass


admin.site.register(Space_project, SpaceProjectsAdmin)
admin.site.register(Device, DeviceAdmin)
admin.site.register(Channel, ChannelAdmin)
admin.site.register(Parameter, ParameterAdmin)
admin.site.register(Value, ValueAdmin)
admin.site.register(Unit, UnitAdmin)

