#!/usr/bin/env python3
# Create a superuser if necessary
# Adapted from: http://stackoverflow.com/questions/6244382/how-to-automate-createsuperuser-on-django
from django.contrib.auth.models import User
import os

username = os.environ['DJANGO_SUPERUSER']
password = os.environ['DJANGO_SUPERPASS']
email = os.environ['DJANGO_SUPEREMAIL']

if User.objects.filter(username=username).count()==0:
    User.objects.create_superuser(username, email, password)
