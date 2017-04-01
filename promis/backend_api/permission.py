from rest_framework.permissions import BasePermission
from django.contrib.auth.models import User
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth.models import Permission

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
        