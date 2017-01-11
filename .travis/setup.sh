#!/bin/sh

# FTP server
/usr/bin/python2.7 -m pyftpdlib &

# Waiting to split the output
sleep 2

# Setting up a minimal viable config
echo "development_setup: yes" > conf/conf.yml

# Not exposing postgres though
echo "expose_db: no" >> conf/conf.yml

# Ready, steady, go
vagrant up
