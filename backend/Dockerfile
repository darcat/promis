FROM python:3.6

# Pull GDAL
RUN apt-get update -y # this may harm reproducibility, but necessary since image has no repo checkout
RUN apt-get -y install binutils libproj-dev gdal-bin

# Basically what onbuild does, but we need to squeeze apt-get before
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY requirements.txt /usr/src/app/
RUN pip install --no-cache-dir -r requirements.txt

# NOTE: this copies everything, but only promis directory reloads
# As such, the migration files auto-created on the container will
# be lost when the container is deleted
COPY . /usr/src/app

CMD [ "/usr/src/app/run_promis.sh" ]
