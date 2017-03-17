#!/bin/sh

# Starting a virtual display
sh -e /etc/init.d/xvfb start

# FTP server
/usr/bin/python2.7 -m pyftpdlib &

# Waiting to split the output and start up X
sleep 3

# Setting up a minimal viable config
echo "development_setup: yes" > conf/conf.yml

# Non-standard Postgres port so it won't clash with Travis machine
# TODO: maaybe just make it expose a different one on the host?
POSTGIS_PORT=4242
echo "port_sql_host: $POSTGIS_PORT" >> conf/conf.yml

# Ready, steady, go
vagrant up

# Download the Firefox driver for Selenium
# TODO: any chance to apt-get so we can put this to travis.yml?
wget https://github.com/mozilla/geckodriver/releases/download/v0.13.0/geckodriver-v0.13.0-linux64.tar.gz
tar -xf geckodriver-v0.13.0-linux64.tar.gz

# Populate with artificial data
export PGPASSWORD="swordfish"
repos/promis-testing/data/generate.py | psql -h localhost -p $POSTGIS_PORT -U promis promisdb >> /tmp/sql.log

# Import POTENTIAL
# NOTE: this may slow things down
repos/promis-testing/api_command check_data_updates
