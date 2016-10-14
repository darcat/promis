# TODO maybe nginx:alpine?
# TODO: special rights on /etc/ssl.d/
FROM nginx:1.11.5
ADD index.html /usr/share/nginx/html/
