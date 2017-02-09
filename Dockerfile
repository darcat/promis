FROM dep.promis
ADD run_promis.sh /usr/src/app
ADD promis /usr/src/app/promis
CMD [ "./run_promis.sh" ]
