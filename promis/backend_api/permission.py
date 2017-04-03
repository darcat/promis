from rest_framework.permissions import BasePermission
from django.contrib.auth.models import User
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth.models import Permission
from backend_api import helpers
import datetime
from django.utils import timezone 

def check_session(user, obj):
    if helpers.UserInGroup(user, 'default'):
            now = datetime.datetime.now()
            half_year_ago = timezone.make_aware(now - datetime.timedelta(183), timezone.get_default_timezone())
            if obj.time_end > half_year_ago:
                return True
            else:
                return False
    
    else:
        return True
    

class ViewPermission(BasePermission):
    
    message = 'View data is not allowed'
    
    def has_permission(self, request, view):
        if str(request.user) != 'AnonymousUser':
            try:
                user = User.objects.get(username = request.user)
                codename = 'backend_api.view_%s' % ContentType.objects.get_for_model(view.queryset.model).model
                return user.has_perm(codename)
            except User.DoesNotExist:
                return False
        else:
            return False

class PromisPermission(BasePermission):
    
    message = 'Data retreival is not allowed'
    
    def has_permission(self, request, view):
        return True
    
    def has_object_permission(self, request, view, obj):
        if view.__class__.__name__ == 'SessionsView':
            return check_session(request.user, obj)
        
        if view.__class__.__name__ == 'MeasurementsView':
            return check_session(request.user, obj.session)
                
        return True