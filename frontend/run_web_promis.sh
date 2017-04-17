#!/bin/sh

if [ "$CODE_RELOAD" == "true" ]; then
    echo "=> Starting up the development server"
    npm start &
else
    echo "=> Building a static version of the site"
    npm run-script build
fi

/usr/sbin/nginx -c /etc/nginx/nginx.conf

#TODO: the output gets iterwinded when running a live Node.js
