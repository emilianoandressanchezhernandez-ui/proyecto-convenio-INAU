# TheNewfutures — Entorno Docker (PHP + HTML/CSS + MySQL)

### Plataforma de gestión de talleres | Convenio con INAU

---

> Este documento define el entorno de desarrollo/despliegue en contenedores para **TheNewfutures** (frontend HTML + CSS + JS, backend PHP y base de datos MySQL). Se resuelve con `docker compose` para reemplazar el uso actual de **XAMPP o servidor local** (mencionado como entorno de ejecución en `docs/03-diseño/Justificacion Tecnologica.md`, sección 1.3), de forma que el equipo trabaje con el mismo entorno sin instalar XAMPP cada uno por su cuenta, y el proyecto quede listo para moverse a un hosting externo cuando INAU lo requiera.

---

## 1. Justificación de la arquitectura elegida

Las decisiones de stack (PHP como backend, frontend sin framework, login único) ya están justificadas en `docs/03-diseño/Justificacion Tecnologica.md`. Esta sección justifica únicamente su **contenedorización**.

| Decisión | Justificación |
|---|---|
| MySQL en contenedor separado con volumen persistente | NRF09 "garantizar la persistencia confiable de los datos en una base de datos relacional". Aísla los datos del ciclo de vida del contenedor de aplicación. |
| phpMyAdmin como servicio opcional | Facilita al equipo de desarrollo inspeccionar datos durante la etapa de pruebas, sin instalar un cliente MySQL aparte. |
| Variables sensibles vía `.env` (no hardcodeadas) | NRF08 "proteger los datos personales de los usuarios" — las credenciales de base de datos no deben quedar en el repositorio ni en la imagen. |
| Backend separado del frontend a nivel de código (carpeta `backend/`) | NRF06 "arquitectura separada entre frontend y backend". El frontend es HTML/JS estático que consume los endpoints PHP de `backend/api/`. |

---

## 2. Archivos que agrega el entorno Docker

La estructura completa del repositorio se documenta en `docs/Estructura del Repositorio.md`. Este entorno **agrega únicamente** los archivos necesarios para levantar el stack; el backend PHP se sirve tal como está versionado en `main`, sin que este documento defina su estructura interna.

```
proyecto-convenio-INAU/
├── docker-compose.yml          # (nuevo) orquestación de servicios
├── .env                        # (nuevo) NO se commitea (ver .gitignore)
├── .env.example                # (nuevo) plantilla versionada
└── php/
    ├── Dockerfile              # (nuevo) imagen PHP + Apache
    └── php.ini                 # (nuevo) límites y configuración
```

El contenedor `web` sirve la raíz del proyecto (`index.html`, `frontend/` y el backend PHP de `main`), y el contenedor `db` inicializa el esquema desde `backend/DataBase/inau_talleres.sql`.

---

## 3. `docker-compose.yml`

```yaml
services:
  web:
    build:
      context: ./php
      dockerfile: Dockerfile
    container_name: inau_talleres_web
    restart: unless-stopped
    ports:
      - "${APP_PORT:-8080}:80"
    volumes:
      - ./:/var/www/html
    environment:
      DB_HOST: db
      DB_PORT: 3306
      DB_NAME: ${MYSQL_DATABASE}
      DB_USER: ${MYSQL_APP_USER}
      DB_PASSWORD: ${MYSQL_APP_PASSWORD}
      APP_TIMEZONE: America/Montevideo
    depends_on:
      db:
        condition: service_healthy
    networks:
      - talleres_net

  db:
    image: mysql:8.0
    container_name: inau_talleres_db
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: ${MYSQL_DATABASE}
      MYSQL_USER: ${MYSQL_APP_USER}
      MYSQL_PASSWORD: ${MYSQL_APP_PASSWORD}
      TZ: America/Montevideo
    command: >
      --character-set-server=utf8mb4
      --collation-server=utf8mb4_unicode_ci
      --default-time-zone=-03:00
    volumes:
      - db_data:/var/lib/mysql
      - ./backend/DataBase:/docker-entrypoint-initdb.d:ro
    ports:
      - "127.0.0.1:3306:3306"   # expuesto solo en localhost, no hacia afuera (NRF08)
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-p${MYSQL_ROOT_PASSWORD}"]
      interval: 5s
      timeout: 5s
      retries: 10
    networks:
      - talleres_net

  phpmyadmin:
    image: phpmyadmin:5
    container_name: inau_talleres_phpmyadmin
    restart: unless-stopped
    environment:
      PMA_HOST: db
      PMA_PORT: 3306
      UPLOAD_LIMIT: 50M
    ports:
      - "${PMA_PORT:-8081}:80"
    depends_on:
      db:
        condition: service_healthy
    networks:
      - talleres_net
    profiles:
      - herramientas   # se levanta solo con: docker compose --profile herramientas up

networks:
  talleres_net:
    driver: bridge

volumes:
  db_data:
    driver: local
```

**Justificación de decisiones del compose:**

| Elemento | Justificación |
|---|---|
| `web` monta la raíz del proyecto (`./:/var/www/html`) | El document root necesita servir `index.html` y `frontend/` como estático, y `backend/api/*.php` como endpoints, tal como ya está organizado el repositorio — no hace falta mover archivos a una carpeta `public/` nueva. |
| `db` monta `./backend/DataBase` como directorio de inicialización | MySQL ejecuta automáticamente los scripts `.sql` de esa carpeta en el primer arranque, de modo que el esquema real del proyecto se aplica sin mantener una copia paralela. |
| `db` con `ports: 127.0.0.1:3306:3306` | El puerto de MySQL solo se expone en la máquina local del desarrollador (para administración/debug con un cliente MySQL propio), nunca hacia la red externa — NRF08. |
| `healthcheck` en `db` + `depends_on: condition: service_healthy` en `web` | Evita que Apache/PHP arranque antes de que MySQL esté listo, reduciendo errores intermitentes de conexión desde el primer arranque. |
| `phpmyadmin` bajo `profiles: [herramientas]` | No se levanta por defecto (reduce superficie de ataque); el equipo lo activa solo cuando necesita inspeccionar datos. |
| `db_data` como volumen nombrado | Persiste los datos aunque se recree el contenedor `db` (`docker compose down` sin `-v`) — NRF09. |
| Variables vía `${...}` desde `.env` | Ninguna credencial queda escrita en el archivo versionado — NRF08. |

> **Nota:** la consigna de este proyecto no exige explícitamente un servicio de respaldo automático diario. Si el equipo lo considera necesario para reforzar NRF09, se puede agregar un servicio `db-backup` (mismo patrón: `mysqldump` programado + volumen `./backup`), pero no se incluye acá por no estar entre los requerimientos relevados.

---

## 4. Variables de entorno

### 4.1 `.env.example` (versionado en git)

```dotenv
# Copiar este archivo a .env y completar antes de levantar el stack
APP_PORT=8080
PMA_PORT=8081

MYSQL_ROOT_PASSWORD=CAMBIAR_ESTA_CLAVE_ROOT
MYSQL_DATABASE=inau_talleres
MYSQL_APP_USER=talleres_app
MYSQL_APP_PASSWORD=CAMBIAR_ESTA_CLAVE_APP
```

### 4.2 `.gitignore` (agregar a lo que ya exista)

```gitignore
.env
```

---

## 5. `php/Dockerfile`

```dockerfile
FROM php:8.2-apache

# Extensiones necesarias para MySQL (mysqli/PDO) y para RF13 (exportar PDF/Excel)
RUN docker-php-ext-install mysqli pdo pdo_mysql

# Configuración propia de PHP (uploads, límites, zona horaria)
COPY php.ini /usr/local/etc/php/conf.d/talleres.ini

# Apache: permitir .htaccess y activar mod_rewrite
RUN a2enmod rewrite
RUN sed -i 's/AllowOverride None/AllowOverride All/' /etc/apache2/apache2.conf

WORKDIR /var/www/html
```

### `php/php.ini`

```ini
date.timezone = America/Montevideo

; NRF11/NRF12: adjuntos de tareas/material restringidos a PDF, imágenes JPG
; y documentos de oficina (DOCX, XLSX, PPTX), con tamaño máximo acotado.
; El límite del servidor es la primera barrera; el tipo de archivo igual debe
; validarse explícitamente en PHP (extensión + tipo MIME real), nunca confiar
; solo en esta configuración.
upload_max_filesize = 10M
post_max_size = 12M

memory_limit = 128M
display_errors = Off
log_errors = On
error_log = /var/log/apache2/php_errors.log
```

> `display_errors = Off` + `log_errors = On`: NRF08 exige proteger datos personales de alumnos y talleristas; los errores de PHP no deben mostrarse al usuario final (podrían filtrar rutas o consultas), pero sí quedar registrados para diagnóstico — esto también es la base técnica de NRF10 (trazabilidad).

---

## 6. Conexión PHP → MySQL vía variables de entorno

El backend se conecta a MySQL leyendo las credenciales desde las variables de entorno que define el compose (sección 3), de modo que ninguna contraseña queda escrita en el código (NRF08).

```php
<?php
declare(strict_types=1);

function obtenerConexion(): mysqli
{
    $host     = getenv('DB_HOST')     ?: 'db';
    $puerto   = (int) (getenv('DB_PORT') ?: 3306);
    $base     = getenv('DB_NAME')     ?: 'inau_talleres';
    $usuario  = getenv('DB_USER')     ?: 'talleres_app';
    $password = getenv('DB_PASSWORD') ?: '';

    mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

    $conexion = new mysqli($host, $usuario, $password, $base, $puerto);
    $conexion->set_charset('utf8mb4');

    return $conexion;
}
```

> El control de acceso por rol, la autenticación y los endpoints son responsabilidad del backend versionado en `main`; este documento de infraestructura no los define, solo provee el entorno en que se ejecutan.

---

## 7. Puesta en marcha

```bash
# 1. Ubicarse en la raíz del repositorio y preparar variables de entorno
cp .env.example .env
# editar .env y completar contraseñas reales

# 2. Levantar el stack base (web + db)
docker compose up -d --build

# 3. (Opcional) levantar también phpMyAdmin para administración
docker compose --profile herramientas up -d

# 4. Ver logs de la aplicación
docker compose logs -f web

# 5. Apagar el stack (los datos persisten en el volumen db_data)
docker compose down

# 6. Apagar y BORRAR también los datos (usar con cuidado)
docker compose down -v
```

Accesos por defecto:

| Servicio | URL |
|---|---|
| Login del sistema (`index.html`) | http://localhost:8080 |
| phpMyAdmin (perfil `herramientas`) | http://localhost:8081 |

---

## 8. Inicialización de la base de datos

El esquema está definido en `backend/DataBase/inau_talleres.sql` (su derivación y el detalle de tablas se documentan en `docs/03-diseño/Modelado/`). El contenedor `db` ejecuta ese script automáticamente en el primer arranque, mediante el montaje de la carpeta en `/docker-entrypoint-initdb.d`. No se define un esquema propio para el entorno Docker: mantener un segundo script produciría dos versiones divergentes de la misma estructura.

**Consideraciones para el entorno en contenedor:**

- El script comienza con `DROP DATABASE IF EXISTS`, apropiado para desarrollo pero que debe retirarse antes de cualquier despliegue con datos reales.
- Los datos de prueba incluidos utilizan hashes de contraseña reales, válidos para probar el inicio de sesión pero que no deben conservarse en un entorno con datos de INAU.
- El script requiere MySQL 8.0 o superior por el uso de restricciones `CHECK`. La imagen `mysql:8.0` del compose cumple ese requisito.
- La base se llama `inau_talleres`, valor que debe coincidir con `MYSQL_DATABASE` en el archivo `.env`.

---

## 9. Verificaciones previas a un despliegue con datos reales

Antes de conectar este entorno a datos reales de INAU deben verificarse:

- Contraseñas almacenadas mediante hash seguro.
- Conexión bajo HTTPS.
- Verificación de permisos por rol en cada endpoint del backend (NRF07 y NRF08).
- El puerto de MySQL no expuesto fuera de `localhost`, y el `.env` nunca versionado.

>Pendiente: Revisar con Diego.