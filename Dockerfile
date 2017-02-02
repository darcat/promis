FROM python:3.6-onbuild

# Pull GDAL
RUN apt-get update -y
RUN apt-get -y install binutils libproj-dev gdal-bin

CMD [ "./run_promis.sh" ]
