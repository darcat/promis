# TODO: [@landswellsong] I honestly dislike this file
# Do we get user as string in the limitation form or not?

from django.contrib.auth.models import User, Group

def UserInGroup(user, group):
    user = User.objects.get(username = user)
    return user.groups.filter(name = group).exists()

def UserGroupsNo(user):
    return len(User.objects.get(username = user).groups.all())

def UserExists(user):
    try:
        User.objects.get(username = user)

    except User.DoesNotExist:
        return False

    return True
