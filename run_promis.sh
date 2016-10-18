#!/bin/sh
python ./promis/manage.py makemigrations
python ./promis/manage.py migrantion
python ./promis/manage.py runserver 0.0.0.0:80
