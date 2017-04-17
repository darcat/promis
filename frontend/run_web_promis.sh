#!/bin/sh

cd /usr/src/app
npm start &

/usr/sbin/nginx -c /etc/nginx/nginx.conf

#TODO: the output gets iterwinded when running a live Node.js
