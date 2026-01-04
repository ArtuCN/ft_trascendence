FROM nginx:alpine

COPY conf/default.conf.template /etc/nginx/templates/default.conf.template
COPY certs /etc/ssl

CMD ["sh", "-c", "envsubst '$FRONTEND_PORT $BACKEND_PORT $GAMEPLAY_PORT $AI_PORT $VITE_PORT' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
