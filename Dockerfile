FROM python:3.6

# Pull GDAL
RUN apt-get update -y # this may harm reproducibility, but necessary since image has no repo checkout
RUN apt-get -y install binutils libproj-dev gdal-bin

# Not using onbuild to help Docker auto-cache the intermediate images
# This requires manually adding stuff :/
ADD run_promis.sh /usr/src/app
ADD promis /usr/src/app/promis
CMD [ "./run_promis.sh" ]
