FROM nginx:alpine

COPY build /usr/share/nginx/html

COPY default.conf /etc/nginx/conf.d/

# Alternate option is to sed the required line just like below:
#RUN sed -i "11i \ \ \ \ \ \ \ \ "'try_files $uri.html $uri $uri/ /index.html;' /etc/nginx/conf.d/default.conf
