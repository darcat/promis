#!/bin/sh

# Starting a virtual display
sh -e /etc/init.d/xvfb start

# FTP server
/usr/bin/python2.7 -m pyftpdlib &

# Waiting to split the output and start up X
sleep 3

# Setting up a minimal viable config
echo "development_setup: yes" > conf/conf.yml

# Not exposing postgres though
echo "expose_db: no" >> conf/conf.yml

# Ready, steady, go
vagrant up

# Download the Firefox driver for Selenium
# TODO: any chance to apt-get so we can put this to travis.yml?
wget https://github.com/mozilla/geckodriver/releases/download/v0.13.0/geckodriver-v0.13.0-linux64.tar.gz
tar -xf geckodriver-v0.13.0-linux64.tar.gz

# Pip requirements
pip3 install -r repos/promis-testing/requirements.txt
