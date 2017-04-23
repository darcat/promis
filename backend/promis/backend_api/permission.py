from rest_framework.permissions import BasePermission
from django.contrib.auth.models import User
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth.models import Permission
from backend_api import helpers, models, views
import datetime
from django.utils import timezone

def check_session(user, obj):
    if helpers.UserGroupsNo(user) <= 0:
            now = datetime.datetime.now()
            half_year_ago = timezone.make_aware(now - datetime.timedelta(183), timezone.get_default_timezone())
            if obj.time_end > half_year_ago:
                return True
            else:
                return False

    else:
        return True

class PromisPermission(BasePermission):

    message = 'Data retreival is not allowed'

    def has_permission(self, request, view):
        if isinstance(view, views.ChannelsView):
            print(helpers.UserInGroup(request.user, "level1"))
            return helpers.UserInGroup(request.user, "level1")
        
        return True
   
    def has_object_permission(self, request, view, obj):
        if not helpers.UserExists(request.user):
            return False
        
        if helpers.IsSuperUser(request.user):
            return True
                
        if helpers.UserInGroup(request.user, "level1"):
            return True
        
        if isinstance(view, views.ChannelsView):
            return False
        
        if isinstance(view, views.SessionsView):
            return check_session(request.user, obj)

        if isinstance(view, views.MeasurementsView) \
            or isinstance(view, views.QuicklookView) \
            or isinstance(view, views.DownloadView) \
            or isinstance(view, views.DownloadData):
                if not helpers.UserInGroup(request.user, "level2"):
                    return check_session(request.user, obj.session)

        return True

class SelfProfilePermission(BasePermission):
    message = 'Unauthorized'
    
    def has_permission(self, request, view):
        return True
    
    def has_object_permission(self, request, view, obj):
        if (helpers.IsSuperUser()) or (obj.username == request.user):
            return True
        else:
            return False
        
