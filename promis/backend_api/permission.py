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
        return True
    
    def has_object_permission(self, request, view, obj):
        if helpers.IsSuperUser:
            return True
                
        if isinstance(view, views.SessionView):
            return check_session(request.user, obj)

        if isinstance(view, views.MeasurementsView) \
            or isinstance(view, views.DownloadView):
                return check_session(request.user, obj.session)

        if isinstance(view, views.QuicklookView) \
           or isinstance(view, views.DownloadData):
                if not helpers.UserInGroup(request.user, "level2"):
                    for meas in models.Measurement.objects.filter(par_doc = obj):
                        return False
                else:
                    for meas in models.Measurement.objects.filter(chn_doc = obj):
                        if not check_session(request.user, meas.session):
                            return False

        if isinstance(view, views.ParametersView):
            return helpers.UserInGroup(request.user, "level2")

        return True
