FROM richarvey/nginx-nodejs

# Do this first to benefit from cache
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
ADD my-react-app/package.json /usr/src/app/
RUN npm config set registry https://registry.npmjs.org/
RUN npm install 

ADD run_web_promis.sh /
ADD my-react-app /usr/src/app

# The original image uses supervisord to start up
# Skipping their logic and just running our stuff
CMD [ "/run_web_promis.sh" ]
