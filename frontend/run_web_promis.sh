#!/bin/sh

if [ "$CODE_RELOAD" == "true" ]; then
    echo "=> Starting up the development server"
    npm start &
else
    echo "=> Building a static version of the site"
    npm run-script build
fi

# TODO: more elegant way of making sure this container doesn't shut off?
# http://stackoverflow.com/questions/2935183/bash-infinite-sleep-infinite-blocking
mkfifo "/tmp/.pause.fifo" 2>/dev/null; read <"/tmp/.pause.fifo"
