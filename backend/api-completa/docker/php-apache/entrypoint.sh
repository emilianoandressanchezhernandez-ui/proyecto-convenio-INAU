#!/bin/sh
set -e

# Preparar la carpeta de archivos subidos.
mkdir -p /var/www/html/uploads
chown -R www-data:www-data /var/www/html/uploads

# Continuar con el inicio normal de PHP-Apache.
exec docker-php-entrypoint "$@"