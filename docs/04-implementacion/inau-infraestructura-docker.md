# TheNewfutures — Entorno Docker (PHP + MySQL)

### Plataforma de gestión de talleres | Convenio con INAU

---

Este documento describe el entorno en contenedores de **TheNewfutures**. El entorno vive en `backend/api-completa/` y levanta **la API PHP y la base de datos MySQL** con `docker compose`. El frontend (HTML + CSS + JS) no forma parte de estos contenedores: es un sitio estático que se sirve aparte y consume la API. Docker reemplaza la instalación de un **servidor local** (como XAMPP) en cada computadora, de modo que el equipo trabaje con el mismo entorno y el proyecto pueda trasladarse a un servidor externo cuando INAU lo requiera.

---

## 1. Justificación de la arquitectura elegida

Las decisiones de stack (PHP como backend, frontend sin framework, login único) están justificadas en `docs/03-diseño/Justificacion Tecnologica.md`. Esta sección justifica únicamente su **contenedorización**.

| Decisión | Justificación |
|---|---|
| MySQL en contenedor separado con volumen persistente (`mysql_data`) | NRF09 "garantizar la persistencia confiable de los datos en una base de datos relacional". Los datos sobreviven aunque se detengan o se vuelvan a crear los contenedores. |
| Código de la API copiado dentro de la imagen | La API queda autocontenida: la imagen se construye desde `backend/api-completa/` e instala sus dependencias con Composer a partir de `composer.lock`, sin depender de la computadora de cada integrante. |
| Archivos subidos en un volumen propio (`uploads_data`) | Los adjuntos de material y entregas persisten de forma independiente del contenedor de la API (NRF09). |
| Variables configurables mediante `.env` | NRF08 "proteger los datos personales de los usuarios". El `compose` trae valores por defecto pensados solo para desarrollo, de modo que funciona sin `.env`; en producción esos valores (clave secreta y contraseñas) deben reemplazarse obligatoriamente. |
| Frontend separado de la API | NRF06 "arquitectura separada entre frontend y backend". El frontend es estático y se comunica con la API por HTTP; la API solo acepta solicitudes con credenciales desde el origen autorizado en `FRONTEND_ORIGIN` (CORS). |

---

## 2. Archivos del entorno Docker

La estructura completa del repositorio se documenta en `docs/Estructura del Repositorio.md`. Los archivos que definen el entorno son:

```
backend/api-completa/
├── compose.yaml                 # orquestación de los servicios api y database
├── .env.docker.example          # plantilla opcional de variables (se copia como .env)
├── DataBase/
│   └── inau_talleres.sql        # esquema y datos de prueba, ejecutado al crear la base
└── docker/php-apache/
    ├── Dockerfile               # imagen PHP 8.3 + Apache con la API y sus dependencias
    ├── app.conf                 # configuración de Apache (AllowOverride, sin listado de carpetas)
    ├── uploads.ini              # límites de tamaño de archivos subidos
    └── entrypoint.sh            # prepara la carpeta de archivos subidos al iniciar
```

El contenedor `api` sirve **solo la API**. El contenedor `database` crea la base a partir de `DataBase/inau_talleres.sql`.

---

## 3. Servicios (`compose.yaml`)

El archivo completo está en `backend/api-completa/compose.yaml`. Define dos servicios y dos volúmenes:

| Elemento | Configuración | Justificación |
|---|---|---|
| Servicio `database` | Imagen `mysql:8.4`, base `inau_talleres`, usuario `utu_user` | El script del proyecto usa restricciones `CHECK`, que requieren MySQL 8.0 o superior. |
| Inicialización de la base | Monta `./DataBase/inau_talleres.sql` como `/docker-entrypoint-initdb.d/01-database.sql` | MySQL ejecuta el script automáticamente, pero **solo la primera vez que se crea el volumen**. |
| `healthcheck` en `database` + `depends_on: service_healthy` en `api` | `mysqladmin ping` cada 5 s | La API no arranca hasta que MySQL está listo, evitando errores de conexión en el primer inicio. |
| Servicio `api` | Se construye con `docker/php-apache/Dockerfile` | Contiene el código de la API y sus dependencias. |
| Puerto de la API | `${API_PORT:-8002}:80` | La API queda disponible en `http://localhost:8002`. |
| Puerto de MySQL | `${MYSQL_PORT:-3308}:3306` | Permite inspeccionar la base desde la computadora durante el desarrollo. **Queda expuesto en todas las interfaces**: en un servidor debe restringirse (ver sección 9). |
| Volumen `mysql_data` | Datos de MySQL | Persisten con `docker compose down`; solo se borran con `docker compose down -v` (NRF09). |
| Volumen `uploads_data` | `/var/www/html/uploads` | Persistencia de los archivos adjuntos. |

---

## 4. Variables de entorno

El `compose` funciona sin archivo `.env`, con valores por defecto de desarrollo. Para cambiarlos, se copia `.env.docker.example` como `.env` en la misma carpeta y se completan los valores:

| Variable | Uso | Valor por defecto |
|---|---|---|
| `SECRET_KEY` | Clave con la que la API firma los tokens de sesión | Clave de demostración incluida en `compose.yaml` |
| `APP_ENV` | `development` o `production` | `development` |
| `TOKEN_LIFETIME` | Duración del token, en segundos | `3600` |
| `FRONTEND_ORIGIN` | Origen del frontend autorizado por CORS | `http://localhost:8000` |
| `DB_PASSWORD` | Contraseña del usuario `utu_user` | `utu_password` |
| `MYSQL_ROOT_PASSWORD` | Contraseña de root de MySQL | `root_password` |
| `API_PORT` / `MYSQL_PORT` | Puertos publicados en la computadora | `8002` / `3308` |

> La `SECRET_KEY` por defecto está publicada en el repositorio, por lo que **solo sirve para desarrollo**. Fuera de la máquina local debe generarse una nueva (por ejemplo, con `php -r "echo bin2hex(random_bytes(32));"`).

El archivo `.env` no debe versionarse. El repositorio todavía no cuenta con un `.gitignore`; al crearlo debe incluir:

```gitignore
.env
```

---

## 5. Imagen de la API (`Dockerfile`)

El archivo está en `backend/api-completa/docker/php-apache/Dockerfile`. Sus decisiones principales:

| Decisión | Justificación |
|---|---|
| Base `php:8.3-apache` | PHP y servidor web en una sola imagen. |
| Extensión `pdo_mysql` | Conexión de la API a MySQL mediante PDO. |
| Módulo `rewrite` + `app.conf` con `AllowOverride All` | Permite que Apache envíe todas las rutas de la API a `index.php` mediante `.htaccess`. `app.conf` desactiva además el listado de carpetas (`Options -Indexes`). |
| `uploads.ini` | NRF12: limita el tamaño de los archivos subidos (`upload_max_filesize = 10M`, `post_max_size = 12M`). El tipo de archivo se valida en la propia API (NRF11). |
| `entrypoint.sh` | Crea la carpeta `uploads` y le asigna los permisos del usuario de Apache al iniciar el contenedor. |

El manejo de errores no se configura en la imagen sino en la aplicación: según `APP_ENV`, y mediante el manejador de `index.php`, que registra el detalle en el log y responde al cliente con un mensaje genérico.

---

## 6. Conexión de la API con MySQL

La conexión está implementada en `backend/api-completa/core/Database.php` mediante **PDO**, con `charset=utf8mb4` y modo de errores por excepción. Las credenciales (`DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`) se leen en `config.php` desde las variables de entorno que define el `compose`, de modo que ninguna contraseña queda escrita en el código (NRF08). Dentro de Docker, la API se conecta al host `database`, que es el nombre del servicio de MySQL.

> El control de acceso por rol, la autenticación y los endpoints son responsabilidad de la API; este documento solo describe el entorno en que se ejecutan.

---

## 7. Puesta en marcha

Los comandos se ejecutan desde `backend/api-completa/`:

```bash
docker compose up -d --build   # construye la imagen y levanta los servicios
docker compose ps              # verifica que api y database estén activos
docker compose logs api        # revisa los logs de la API (o database, para MySQL)
docker compose down            # detiene los servicios sin borrar los datos
docker compose down -v         # detiene y borra los volúmenes: la base se recrea en el próximo inicio
```

Para un servidor nuevo, el procedimiento completo está en `docs/04-implementacion/Documento de Reconstruccion - Servidor.md`.

Accesos por defecto en desarrollo:

| Servicio | Dirección |
|---|---|
| API | http://localhost:8002 |
| MySQL (cliente externo) | localhost:3308 |
| Frontend (servido aparte) | http://localhost:8000 |

---

## 8. Inicialización de la base de datos

El esquema está definido en `backend/api-completa/DataBase/inau_talleres.sql` (su derivación y el detalle de tablas se documentan en `docs/03-diseño/Modelado/`). El contenedor `database` lo ejecuta automáticamente la primera vez que se crea el volumen `mysql_data`; para volver a cargarlo hay que borrar el volumen con `docker compose down -v`.

**Consideraciones para el entorno en contenedor:**

- El script comienza con `DROP DATABASE IF EXISTS`, apropiado para desarrollo pero que debe retirarse antes de cualquier despliegue con datos reales.
- Los datos de prueba incluyen hashes de contraseña válidos para probar el inicio de sesión, que no deben conservarse en un entorno con datos de INAU.
- El nombre de la base (`inau_talleres`) está fijado en `compose.yaml`.

---

## 9. Verificaciones previas a un despliegue con datos reales

Antes de conectar este entorno a datos reales de INAU deben verificarse:

- `SECRET_KEY` nueva y contraseñas propias definidas en `.env`, reemplazando los valores por defecto del `compose`.
- `APP_ENV=production`.
- Puerto de MySQL no expuesto fuera del servidor.
- `.env` fuera del control de versiones.
- Contraseñas almacenadas mediante hash seguro.
- Conexión bajo HTTPS.
- Verificación de permisos por rol en cada endpoint (NRF07 y NRF08).