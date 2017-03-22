#!/bin/sh
PROMIS_DIR=`dirname $0`

# Migrate data if needed
python $PROMIS_DIR/promis/manage.py makemigrations backend_api
python $PROMIS_DIR/promis/manage.py migrate

# Create superuser if needed
python $PROMIS_DIR/promis/manage.py batch_create_superuser

# Generate a diagram for the frontend
python $PROMIS_DIR/promis/manage.py graph_models -a > $SYNC_DIR/model.dot

# Generate static assets
python $PROMIS_DIR/promis/manage.py collectstatic --no-input

# Enable proflinig if debug is enabled
if [ "$DJANGO_DEBUG" = "true" ]; then
    if [ ! -d $SYNC_DIR/profiling ]; then
        echo "=> Creating sync/profiling directory."
        mkdir $SYNC_DIR/profiling
    else
        echo "=> sync/profiling directory exists."
    fi
    SERVER_COMMAND="runprofileserver --use-cprofile --nostatic --prof-path $SYNC_DIR/profiling"
    
    # TODO: remove after upstream django-extensions merge #1035
    (cd /usr/local/lib/python3.6/site-packages/django_extensions/management/commands/ && patch -p0) < fix_runprofileserver_ipport.patch
else
    SERVER_COMMAND="runserver"
fi

# Run the actual server
python $PROMIS_DIR/promis/manage.py $SERVER_COMMAND 0.0.0.0:80
