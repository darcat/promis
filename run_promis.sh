#!/bin/sh
# Migrate data if needed
python ./promis/manage.py makemigrations
python ./promis/manage.py migrantion
# Generate a diagram for the frontend
#python ./promis/manage.py graph_models -a > my_project.dot
# Run the actual server
python ./promis/manage.py runserver 0.0.0.0:80
