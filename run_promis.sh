#!/bin/sh
# Migrate data if needed
python ./promis/manage.py makemigrations backend_api
python ./promis/manage.py migrate
# Generate a diagram for the frontend
python ./promis/manage.py graph_models -a > $SYNC_DIR/model.dot
# Run the actual server
python ./promis/manage.py runserver 0.0.0.0:80
