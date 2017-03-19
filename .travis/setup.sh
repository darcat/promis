#!/bin/sh

# Starting a virtual display
sh -e /etc/init.d/xvfb start

# FTP server
mkdir ftproot
cd ftproot 
/usr/bin/python2.7 -m pyftpdlib &

# Generate data for FTP
../repos/promis-testing/data/generate.py
cd -

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

# Wait for the backend to start up
while ! docker logs api.promis | grep 'Starting development server at http://0.0.0.0:80/' > /dev/null; do
    echo "Backend not ready, sleeping 10 secs"
    sleep 10
done

# Display backend logs just for kicks
docker logs api.promis

# Populate with artificial data
repos/promis-testing/api_command loaddata --format json - < repos/promis-testing/data/test_set.json
