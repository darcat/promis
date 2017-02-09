FROM python:3.6-onbuild

# Pull GDAL
RUN apt-get update -y # this may harm reproducibility, but necessary since image has no repo checkout
RUN apt-get -y install binutils libproj-dev gdal-bin
