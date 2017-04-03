from django.contrib.auth.models import User, Group

def UserInGroup(user, group):
    user = User.objects.get(username = user)
    return user.groups.filter(name = group).exists()

def UserExists(user):
    try:
        User.objects.get(username = user)
        
    except User.DoesNotExist:
        return False
    
    return True