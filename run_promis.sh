#!/bin/sh
PROMIS_DIR=`dirname $0`

# Wait until the database is up
python $PROMIS_DIR/promis/wait_for_database.py

# Change the Host: string in YAML
# NOTE: this may change your host filesystem!
sed -i -e 's/host:.*/host: '$API_DOMAIN'/g' $YML_PATH/promis_api.yaml

# Migrate data if needed
python $PROMIS_DIR/promis/manage.py makemigrations --no-input
python $PROMIS_DIR/promis/manage.py migrate

# Record the available functions
python $PROMIS_DIR/promis/manage.py collect_functions

# Create superuser if needed
python $PROMIS_DIR/promis/manage.py batch_create_superuser

# Add initial Potential data
python $PROMIS_DIR/promis/manage.py loaddata init_data.json

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
else
    SERVER_COMMAND="runserver"
fi

# Run the actual server
python $PROMIS_DIR/promis/manage.py $SERVER_COMMAND 0.0.0.0:80
