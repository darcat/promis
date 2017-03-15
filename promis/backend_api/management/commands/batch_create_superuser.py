# Create a superuser if necessary
# Adapted from: http://stackoverflow.com/questions/6244382/how-to-automate-createsuperuser-on-django
from django.contrib.auth.models import User
from django.core.management.base import BaseCommand
import os

class Command(BaseCommand):
    def handle(self, *args, **options):
        username = os.environ['DJANGO_SUPERUSER']
        password = os.environ['DJANGO_SUPERPASS']
        email = os.environ['DJANGO_SUPEREMAIL']

        if User.objects.filter(username=username).count()==0:
            User.objects.create_superuser(username, email, password)
            print("=> Created a superuser")
        else:
            print("=> Superuser already exists")
