#!/bin/sh

# Starting a virtual display
sh -e /etc/init.d/xvfb start

# FTP server
mkdir ftproot
cd ftproot
python3 -m pyftpdlib > /tmp/ftp.log 2>&1 &
echo "=> FTP service started"

# Generate data for FTP
../test/data/generate.py
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
while ! docker logs api.promis | grep 'at http://0.0.0.0:80/' > /dev/null; do
    echo "Backend not ready, sleeping 10 secs"
    sleep 10
done

# Display backend logs just for kicks
docker logs api.promis

# Artificial data satellites
./backend_command loaddata --format json - < test/data/test_set.json

# Load the satellite data
./backend_command check_data_updates
