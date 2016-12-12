# TODO maybe nginx:alpine?
# TODO: special rights on /etc/ssl.d/
FROM nginx:1.11.5
ADD index.html /var/www/promis/
ADD data /var/www/promis/data/
ADD css /var/www/promis/css/
ADD js /var/www/promis/js/
ADD nginx.conf /etc/nginx/
ADD promis.conf /etc/nginx/
ADD download /var/www/promis/download/

# EnvPlate to replace templates
# See LICENSE.endplate for copyright information
ADD ep-linux /usr/local/bin/ep
RUN chgrp nginx /etc/ssl/private
RUN chmod g+x,g+r /etc/ssl/private
CMD [ "/usr/local/bin/ep", "-v", "/etc/nginx/nginx.conf", "/etc/nginx/promis.conf", "/var/www/promis/index.html", "--", "/usr/sbin/nginx", "-c", "/etc/nginx/nginx.conf" ]
