FROM php:8.2-cli

RUN apt-get update && apt-get install -y \
    libsqlite3-dev \
    && docker-php-ext-install pdo pdo_sqlite

RUN docker-php-ext-install pdo pdo_sqlite

COPY app/ /var/www/app
RUN chmod -R 777 /var/www/app/data

WORKDIR /var/www/app

CMD [ "php", "main.php" ]
