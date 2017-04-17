#!/bin/sh

cd /usr/src/app
npm start &

/usr/sbin/nginx -c /etc/nginx/nginx.conf
