FROM promis_backend_django_deps
ADD run_promis.sh /usr/src/app
ADD promis /usr/src/app/promis
CMD [ "./run_promis.sh" ]
