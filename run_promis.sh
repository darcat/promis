#!/bin/sh
PROMIS_DIR=`dirname $0`
# Migrate data if needed
python $PROMIS_DIR/promis/manage.py makemigrations backend_api
python $PROMIS_DIR/promis/manage.py migrate
# Generate a diagram for the frontend
python $PROMIS_DIR/promis/manage.py graph_models -a > $SYNC_DIR/model.dot
# Run the actual server
python $PROMIS_DIR/promis/manage.py runserver 0.0.0.0:80
