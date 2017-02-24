#!/bin/sh
PROMIS_DIR=`dirname $0`
# Create a superuser if necessary
# Adapted from: http://stackoverflow.com/questions/6244382/how-to-automate-createsuperuser-on-django
script="
from django.contrib.auth.models import User;

username = '$DJANGO_SUPERUSER';
password = '$DJANGO_SUPERPASS';
email = '$DJANGO_SUPERMAIL';

if User.objects.filter(username=username).count()==0:
    User.objects.create_superuser(username, email, password);
    print('Superuser created.');
else:
    print('Superuser creation skipped.');
"
printf "$script" | python manage.py shell

# Migrate data if needed
python $PROMIS_DIR/promis/manage.py makemigrations backend_api
python $PROMIS_DIR/promis/manage.py migrate
# Generate a diagram for the frontend
python $PROMIS_DIR/promis/manage.py graph_models -a > $SYNC_DIR/model.dot
# Run the actual server
python $PROMIS_DIR/promis/manage.py runserver 0.0.0.0:80
