# TheNewfutures — Proyecto de gestión de talleres en convenio con INAU

## Hardening de infraestructura y contenedores

**Fecha de revisión:** 22 de octubre de 2026  
**Última actualización:** 25 de octubre de 2026
**Alcance:** configuración Docker de la API PHP, servicio MySQL, almacenamiento persistente, configuración de Apache y límites de carga de archivos.

---

## 1. Objetivo y método de elaboración

Este documento registra las medidas de configuración que pueden verificarse en los archivos actuales del proyecto y explica cómo se organiza y ejecuta el entorno con contenedores. El análisis se limitó a los archivos de Docker, Apache, PHP, variables de entorno, reglas de exclusión de archivos y documentación de despliegue.

Se contrastó la documentación existente con la configuración versionada bajo `backend/api-completa/`. La guía refleja esa configuración concreta: el archivo `compose.yaml` de esa carpeta define los servicios `api` y `database`. No se atribuyen a esta configuración servicios que no aparecen allí.

Los hallazgos de la revisión y las acciones recomendadas se registran en la sección 6. Varios de ellos se comprobaron sobre el servidor de prueba del equipo (máquina virtual con Ubuntu Server en la red local, desplegada según `Documento de Reconstruccion - Servidor.md`).

## 2. Fuentes consultadas

| Archivo | Información utilizada |
|---|---|
| `backend/api-completa/compose.yaml` | Servicios, variables, puertos, volúmenes, montaje de SQL y comprobación de disponibilidad de MySQL. |
| `backend/api-completa/docker/php-apache/Dockerfile` | Imagen base, extensiones instaladas, dependencias PHP y permisos del contenido de la imagen. |
| `backend/api-completa/docker/php-apache/app.conf` | Configuración de Apache para el directorio web y desactivación del listado de directorios. |
| `backend/api-completa/docker/php-apache/entrypoint.sh` | Creación del directorio de cargas y preparación de permisos. |
| `backend/api-completa/docker/php-apache/uploads.ini` | Límites de tamaño para carga de archivo y petición POST. |
| `backend/api-completa/.dockerignore` | Archivos y directorios excluidos del contexto de construcción Docker. |
| `.gitignore` (raíz) | Reglas de exclusión de variables de entorno, dependencias y archivos generados. |
| `docs/05-Ciberseguridad/Doc NMAP.md` | Resultados del escaneo de puertos del servidor de prueba (24 y 25 de octubre de 2026). |
| `backend/api-completa/.htaccess` | Reglas de reescritura y restricciones de acceso a archivos internos y listados de directorios. |
| `backend/api-completa/storage/.gitignore` | Exclusión del contenido generado dentro de `storage/` del control de versiones. |
| `backend/api-completa/validators/AdjuntoValidator.php` | Validación de tamaño y tipo MIME de archivos recibidos por la API. |
| `backend/api-completa/controllers/AdjuntoController.php` | Descarga mediante endpoint, nombre adjunto y cabecera `X-Content-Type-Options`. |
| `backend/api-completa/services/AdjuntoService.php` | Validación de acceso a archivos, ubicación física y operaciones de carga y eliminación. |
| `docs/04-implementacion/Documento de Reconstruccion - Servidor.md` | Pasos documentados para desplegar el proyecto y comprobar el entorno. |

## 3. Arquitectura de contenedores definida por el proyecto

El archivo `backend/api-completa/compose.yaml` declara dos servicios:

```text
Docker Compose
├── api
│   ├── PHP 8.3 + Apache
│   ├── código de la API copiado durante el build
│   ├── dependencias instaladas con Composer
│   └── volumen persistente uploads_data
│
└── database
    ├── MySQL 8.4
    ├── inicialización desde DataBase/inau_talleres.sql
    └── volumen persistente mysql_data
```

La configuración de Compose hace que la API dependa de la comprobación de salud de MySQL mediante `depends_on` con `condition: service_healthy`. El propio contenedor de base de datos ejecuta una comprobación con `mysqladmin ping`, repetida en intervalos definidos en `compose.yaml`.

Los archivos estáticos del frontend están en `frontend/` y el cliente común de API se encuentra en `frontend/js/api.js`. El `compose.yaml` de `backend/api-completa/` construye la API y MySQL; no define un servicio de contenedor separado para alojar el frontend.

## 4. Medidas de configuración verificadas

### 4.1. Separación entre API y base de datos

En `compose.yaml`, la API y MySQL se declaran como servicios independientes. La API se configura para conectarse al servicio `database` utilizando las variables `DB_HOST`, `DB_NAME`, `DB_USER` y `DB_PASSWORD`. MySQL recibe la configuración inicial a través de variables de entorno.

**Fundamentación:** la base de datos y el proceso que atiende las peticiones HTTP se ejecutan en servicios diferentes, con ciclos de vida y almacenamiento configurados por separado.

### 4.2. Persistencia de datos

Compose declara dos volúmenes con nombre:

- `mysql_data`, montado en `/var/lib/mysql`, conserva los datos de MySQL entre recreaciones del contenedor.
- `uploads_data`, montado en `/var/www/html/uploads` en el contenedor de la API, conserva los archivos cargados.

El esquema `backend/api-completa/DataBase/inau_talleres.sql` se monta como solo lectura (`:ro`) en el directorio de inicialización de MySQL. La configuración establece que MySQL utiliza ese archivo cuando inicializa un volumen de datos nuevo.

**Fundamentación:** los datos de la base y los archivos cargados se mantienen en volúmenes separados del sistema de archivos efímero del contenedor.

### 4.3. Construcción de la imagen de la API

`backend/api-completa/docker/php-apache/Dockerfile` utiliza una etapa `composer:2` para obtener Composer y una imagen de aplicación `php:8.3-apache`. En la imagen de aplicación:

1. Instala `unzip` como dependencia auxiliar de Composer.
2. Instala la extensión PHP `pdo_mysql` para la conexión PDO a MySQL.
3. Habilita `mod_rewrite` y copia la configuración de Apache del proyecto.
4. Copia el código de la API al directorio `/var/www/html/`.
5. Instala dependencias a partir de `composer.lock` mediante Composer, con `--no-dev`, `--no-interaction`, `--prefer-dist` y `--optimize-autoloader`.
6. Limpia la lista de paquetes de `apt` después de instalar `unzip`.
7. Copia el archivo de límites de carga PHP y prepara el script de entrada del contenedor.

El Dockerfile establece que el contexto de construcción es `backend/api-completa/`, de modo que la API puede construirse desde esa carpeta con sus archivos y dependencias.

### 4.4. Configuración de Apache

`backend/api-completa/docker/php-apache/app.conf` define `ServerName localhost` y la configuración del directorio `/var/www/html`. En ese directorio permite la lectura de configuración `.htaccess` con `AllowOverride All`, desactiva el listado de directorios con `Options -Indexes` y permite atender solicitudes web con `Require all granted`.

El archivo `backend/api-completa/.htaccess` contiene las reglas específicas de la aplicación:

- Reescribe las rutas que no coinciden con un archivo o directorio físico hacia `index.php`.
- Bloquea el acceso web a las rutas `vendor/`, `data/` y `storage/`.
- Deniega mediante `FilesMatch` los archivos con extensiones `.env`, `.json`, `.lock`, `.sql`, `.md` y `.http`.
- Desactiva el listado de directorios.
- Conserva la cabecera `Authorization` para el caso de peticiones que la utilicen.

**Fundamentación:** estas reglas restringen la exposición directa de archivos internos de la API y permiten que las rutas definidas por el enrutador PHP se procesen mediante el punto de entrada.

### 4.5. Exclusión de archivos durante el build y en Git

El archivo `backend/api-completa/.dockerignore` excluye `.env`, `vendor`, archivos Markdown, archivos `.http` y `database.sql` del contexto enviado al constructor. En particular, `.env` no se copia como parte del contexto de construcción.

El `.gitignore` de la raíz excluye `.env`, patrones `.env.*` con excepciones para plantillas de ejemplo, `vendor/`, archivos temporales y archivos del sistema y del editor. Sus dos últimas reglas, previstas para los archivos subidos, están escritas como `Backend/api-completa/...`, con mayúscula inicial, mientras que la carpeta se llama `backend`; como Git distingue mayúsculas y minúsculas, esas dos reglas no tienen efecto (ver sección 6). Además, `backend/api-completa/storage/.gitignore` excluye los archivos generados en `storage/`, conservando únicamente el propio `.gitignore`, y existe un `backend/.gitignore` sin contenido.

### 4.6. Preparación del directorio de cargas

El script `backend/api-completa/docker/php-apache/entrypoint.sh` se ejecuta como punto de entrada del contenedor. Crea `/var/www/html/uploads`, ajusta el propietario de esa carpeta a `www-data:www-data` y continúa con el arranque normal de PHP-Apache.

El archivo `backend/api-completa/docker/php-apache/uploads.ini` configura:

```ini
upload_max_filesize = 10M
post_max_size = 12M
```

A nivel de aplicación, `backend/api-completa/validators/AdjuntoValidator.php` establece un máximo de 10 MB y valida el tipo MIME para aceptar `application/pdf` e `image/jpeg`. El controlador de descarga `AdjuntoController::archivo()` comprueba el acceso mediante el servicio, envía el archivo como adjunto y añade la cabecera `X-Content-Type-Options: nosniff`.

**Fundamentación:** la configuración PHP limita el tamaño recibido por la petición y la validación de la aplicación comprueba el tamaño y el tipo del archivo que se intenta cargar.

## 5. Reproducción del entorno definido en el repositorio

Los pasos siguientes muestran cómo ejecutar la configuración versionada del proyecto.

### Paso 1. Obtener el proyecto

Clonar el repositorio y cambiar al directorio donde se encuentra Compose:

```bash
git clone https://github.com/emilianoandressanchezhernandez-ui/proyecto-convenio-INAU.git
cd proyecto-convenio-INAU/backend/api-completa
```

### Paso 2. Preparar las variables de entorno

Crear un archivo local a partir de la plantilla:

**PowerShell:**

```powershell
Copy-Item .env.example .env
```

**Linux/macOS:**

```bash
cp .env.example .env
```

Las variables utilizadas por el Compose de la API incluyen `SECRET_KEY`, `APP_ENV`, `TOKEN_LIFETIME`, `FRONTEND_ORIGIN`, `DB_PASSWORD`, `MYSQL_ROOT_PASSWORD`, `API_PORT` y `MYSQL_PORT`. Antes de iniciar los contenedores, completar el archivo `.env` con valores propios para `SECRET_KEY`, `DB_PASSWORD` y `MYSQL_ROOT_PASSWORD`. Para generar una clave aleatoria, la documentación del proyecto muestra este comando:

```bash
openssl rand -hex 32
```

Copiar el resultado como valor de `SECRET_KEY` y definir contraseñas propias para MySQL. Esta configuración evita depender de los valores de demostración que Compose usa como alternativa cuando ciertas variables están vacías o ausentes. Mantener `APP_ENV=development` para las pruebas locales y establecer `FRONTEND_ORIGIN` con el origen real donde se sirve el frontend.

### Paso 3. Construir e iniciar los contenedores

Desde `backend/api-completa/`, ejecutar:

```bash
docker compose up --build -d
```

El parámetro `--build` solicita construir la imagen de la API y `-d` deja los servicios ejecutándose en segundo plano.

### Paso 4. Comprobar el estado de los servicios

```bash
docker compose ps
docker compose logs api
docker compose logs database
```

`docker compose ps` permite ver si los servicios están activos; los registros muestran mensajes del arranque de Apache/PHP y MySQL.

### Paso 5. Comprobar la conexión

La configuración publica la API en el puerto del host definido por `API_PORT`, cuyo valor predeterminado en Compose es `8002`. La dirección base coincide con la configuración del cliente común en `frontend/js/api.js`: `http://localhost:8002`.

El origen del frontend se configura mediante `FRONTEND_ORIGIN`; el código PHP utiliza ese valor en `backend/api-completa/index.php` para decidir cuándo enviar las cabeceras CORS que permiten credenciales.

### Paso 6. Detener los servicios

```bash
docker compose down
```

Este comando detiene y elimina los contenedores del proyecto, pero no elimina los volúmenes con nombre. La base de datos y los archivos se encuentran en `mysql_data` y `uploads_data`, respectivamente.

## 6. Hallazgos de la revisión

| ID | Hallazgo | Evidencia | Riesgo | Acción recomendada |
|---|---|---|---|---|
| H-01 | **La API y MySQL quedan publicados en todas las interfaces de red.** Con los valores por defecto, `compose.yaml` publica 8002 y 3308 en `0.0.0.0`. Docker crea sus propias reglas de red y no respeta el firewall `ufw`. | Escaneo con Nmap del 24/10/2026: 8002 (Apache 2.4.69) y 3308 (MySQL 8.4.13) abiertos, aunque `ufw` solo permitía 22 y 80. Tras limitarlos a `127.0.0.1` en el `.env`, quedaron cerrados, y desde otra computadora de la red dejaron de responder (`Doc NMAP.md`, sección 10). | Alto | Corregido en el servidor de prueba con `API_PORT=127.0.0.1:8002` y `MYSQL_PORT=127.0.0.1:3308` en el `.env`. Conviene aplicar ese valor por defecto en `compose.yaml`, para que no dependa de cada `.env`. |
| H-02 | **Los archivos subidos pueden descargarse sin iniciar sesión.** Se guardan en `/var/www/html/uploads/`, dentro del directorio que publica Apache. `.htaccess` bloquea `vendor/`, `data/` y `storage/`, pero no `uploads/`, y sirve directamente cualquier archivo existente. | Comprobado el 25/10/2026 en el servidor de prueba: sin sesión, la descarga oficial (`/api/adjuntos/4/archivo`) respondió 401, mientras que la ruta directa del archivo (`/api/uploads/entregas/<archivo>`) respondió 200 y entregó el PDF. La API devuelve al cliente `ruta` y `nombre_archivo` de cada adjunto. | Alto | Bloquear `uploads/` en `.htaccess` (como `vendor/`, `data/` y `storage/`) o guardar los archivos fuera del directorio público, y dejar de enviar `ruta` y `nombre_archivo` en las respuestas de la API. |
| H-03 | **Dos reglas del `.gitignore` no tienen efecto.** `Backend/api-completa/uploads/` y `Backend/api-completa/storage/uploads/` no coinciden con la carpeta real `backend/`. | Revisión del `.gitignore` de la raíz. | Bajo | Corregir a `backend/api-completa/uploads/` y `backend/api-completa/storage/uploads/`. Evaluar eliminar el `backend/.gitignore` vacío. |
| H-04 | **Los contenedores no se reinician solos.** Tras reiniciar el servidor, la API y MySQL quedaron detenidos hasta ejecutar `docker compose up -d`. | Observado el 24/10/2026 (`Doc NMAP.md`, sección 10.2, ejecución 2). | Medio (disponibilidad) | Agregar una política de reinicio (`restart: unless-stopped`) a los servicios de `compose.yaml`. |
| H-05 | **Los servicios informan su versión exacta.** Nmap identificó OpenSSH 9.6p1, nginx 1.24.0, Apache 2.4.69 y MySQL 8.4.13. | Escaneo con Nmap del 24/10/2026. | Bajo | Mantener los servicios actualizados y evaluar ocultar la versión en las cabeceras de Nginx (`server_tokens off`) y Apache (`ServerTokens Prod`). |

## 7. Interpretación del resultado

La configuración actual del repositorio incorpora separación de servicios, almacenamiento persistente, una imagen PHP-Apache construida para la API, instalación de dependencias mediante Composer, reglas de Apache contra listados de directorios y acceso web a ciertos archivos internos, exclusiones de contexto y límites de carga de archivos.

El documento registra lo que existe en los archivos revisados y cómo reproducirlo. No constituye una certificación de que el stack esté completamente endurecido o listo para un despliegue con información real. Los hallazgos de la sección 6 deben resolverse antes de usar el sistema con datos de INAU; en particular H-01, corregido solo en el servidor de prueba, y H-02, que permite descargar archivos sin autenticación.
