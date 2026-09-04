# TheNewfutures — Entorno Docker (PHP + HTML/CSS + MySQL)

### Plataforma de gestión de talleres | Convenio con INAU

---

> Este documento define el entorno de desarrollo/despliegue en contenedores para el sistema de **TheNewfutures**, usando **HTML + CSS + JS** en el frontend (`frontend-admin`, `frontend-tallerista`, `frontend-alumno`), **PHP** en el backend y **MySQL** como base de datos. Se resuelve con `docker compose` para reemplazar el uso actual de **XAMPP o servidor local** (mencionado como entorno de ejecución durante el desarrollo en `docs/PrimeraVista.md`, sección "Entorno técnico"), de forma que los 5 integrantes del equipo trabajen con el mismo entorno sin instalar XAMPP cada uno por su cuenta, y el proyecto quede listo para moverse a un hosting externo cuando INAU lo requiera.

---

## 1. Justificación de la arquitectura elegida

| Decisión | Justificación |
|---|---|
| PHP + Apache en vez de un framework pesado | El equipo son 5 estudiantes de 3.º BT Informática con un plazo de 16 semanas (Charter del proyecto). PHP corre sin build step adicional, es lo que ya está definido como backend en `docs/PrimeraVista.md` ("PHP para el backend", "MySQL para la base de datos"), y es ampliamente soportado por hostings económicos — relevante porque INAU, como organismo público, no necesariamente cuenta con infraestructura de servidor dedicada. |
| Frontend HTML + CSS + JS servido por el mismo contenedor PHP (sin SPA/build) | NRF01 "diseño responsive, adaptándose a computadora, tablet y teléfono"; el frontend ya está construido así (Bootstrap + CSS propio, sin framework de JS), consistente con la decisión ya tomada por el equipo en `docs/PrimeraVista.md` §14.3 ("Bootstrap como base"). |
| Un único punto de login (`index.html` + `js/auth.js` en la raíz) | Corresponde exactamente a la decisión ya documentada por el equipo en `docs/PrimeraVista.md` §14.1: *"No se crearán páginas de acceso separadas por rol. El backend identificará al usuario y lo redirigirá al panel correspondiente."* El contenedor `web` sirve ese `index.html` como raíz del document root. |
| MySQL en contenedor separado con volumen persistente | NRF09 "garantizar la persistencia confiable de los datos en una base de datos relacional". Aísla los datos del ciclo de vida del contenedor de aplicación. |
| phpMyAdmin como servicio opcional | Facilita a los talleristas/administradores del equipo de desarrollo inspeccionar datos durante la etapa de pruebas, sin instalar un cliente MySQL aparte. |
| Variables sensibles vía `.env` (no hardcodeadas) | NRF08 "proteger los datos personales de los usuarios" — las credenciales de base de datos no deben quedar en el repositorio ni en la imagen. |
| Backend separado del frontend a nivel de código (carpeta `backend/`) | NRF06 "arquitectura separada entre frontend y backend". El frontend (`frontend-admin/`, `frontend-tallerista/`, `frontend-alumno/`) sigue siendo HTML/JS estático que consume los endpoints PHP de `backend/api/`, tal como ya prevé el propio código actual (los `main.js` de cada panel están preparados para reemplazar los archivos `mock/` por la API real cuando el backend esté listo). |

---

## 2. Estructura de carpetas del proyecto

Esta estructura respeta la que ya existe en el repositorio (`frontend/`, `index.html`, `js/`, `backend/`), agregando solamente lo necesario para levantar el stack:

```
proyecto-convenio-INAU/
├── docker-compose.yml
├── .env                        # NO se commitea (ver .gitignore)
├── .env.example                # plantilla versionada
├── db/
│   └── init/
│       └── 001_schema.sql      # DDL inicial (ver sección 8, a completar con el MER final del equipo)
├── php/
│   ├── Dockerfile
│   └── php.ini
├── index.html                  # login único (ya existe) — punto de entrada de todos los roles
├── js/
│   └── auth.js                 # hoy valida contra USUARIOS_DEMO; pasa a llamar a backend/api/login.php
├── frontend/
│   ├── frontend-admin/
│   ├── frontend-tallerista/
│   └── frontend-alumno/        # pendiente de JS propio (ver docs/informe-sast.md)
└── backend/
    ├── api/
    │   ├── login.php
    │   ├── talleres.php
    │   ├── asistencias.php
    │   ├── tareas.php
    │   ├── informes.php
    │   └── perfil.php
    └── includes/
        ├── conexion.php
        └── sesion.php          # equivalente en PHP de verificarSesion() (NRF07)
```

---

## 3. `docker-compose.yml`

```yaml
services:
  web:
    build:
      context: ./php
      dockerfile: Dockerfile
    container_name: inau_tallerista_web
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
      - tallerista_net

  db:
    image: mysql:8.0
    container_name: inau_tallerista_db
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
      - ./db/init:/docker-entrypoint-initdb.d:ro
    ports:
      - "127.0.0.1:3306:3306"   # expuesto solo en localhost, no hacia afuera (NRF08)
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-p${MYSQL_ROOT_PASSWORD}"]
      interval: 5s
      timeout: 5s
      retries: 10
    networks:
      - tallerista_net

  phpmyadmin:
    image: phpmyadmin:5
    container_name: inau_tallerista_phpmyadmin
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
      - tallerista_net
    profiles:
      - herramientas   # se levanta solo con: docker compose --profile herramientas up

networks:
  tallerista_net:
    driver: bridge

volumes:
  db_data:
    driver: local
```

**Justificación de decisiones del compose:**

| Elemento | Justificación |
|---|---|
| `web` monta la raíz del proyecto (`./:/var/www/html`) | El document root necesita servir `index.html`, `js/auth.js` y `frontend/` como estático, y `backend/api/*.php` como endpoints, tal como ya está organizado el repositorio actual — no hace falta mover archivos a una carpeta `public/` nueva. |
| `db` con `ports: 127.0.0.1:3306:3306` | El puerto de MySQL solo se expone en la máquina local del desarrollador (para administración/debug con un cliente MySQL propio), nunca hacia la red externa — NRF08. |
| `healthcheck` en `db` + `depends_on: condition: service_healthy` en `web` | Evita que Apache/PHP arranque antes de que MySQL esté listo, reduciendo errores intermitentes de conexión — NRF03 (respuesta rápida) desde el primer arranque. |
| `phpmyadmin` bajo `profiles: [herramientas]` | No se levanta por defecto (reduce superficie de ataque); el equipo lo activa solo cuando necesita inspeccionar datos. |
| `db_data` como volumen nombrado | Persiste los datos aunque se recree el contenedor `db` (`docker compose down` sin `-v`) — NRF09. |
| Variables vía `${...}` desde `.env` | Ninguna credencial queda escrita en el archivo versionado — NRF08. |

> **Nota:** a diferencia de otros proyectos del curso, la consigna de este proyecto no exige explícitamente un servicio de respaldo automático diario. Si el equipo lo considera necesario para reforzar NRF09, se puede agregar un servicio `db-backup` (mismo patrón: `mysqldump` programado + volumen `./backup`), pero no se incluye acá por no estar entre los requerimientos relevados.

---

## 4. Variables de entorno

### 4.1 `.env.example` (versionado en git)

```dotenv
# Copiar este archivo a .env y completar antes de levantar el stack
APP_PORT=8080
PMA_PORT=8081

MYSQL_ROOT_PASSWORD=CAMBIAR_ESTA_CLAVE_ROOT
MYSQL_DATABASE=inau_tallerista
MYSQL_APP_USER=tallerista_app
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
COPY php.ini /usr/local/etc/php/conf.d/tallerista.ini

# Apache: permitir .htaccess y activar mod_rewrite
RUN a2enmod rewrite
RUN sed -i 's/AllowOverride None/AllowOverride All/' /etc/apache2/apache2.conf

WORKDIR /var/www/html
```

### `php/php.ini`

```ini
date.timezone = America/Montevideo

; NRF11/NRF12: adjuntos de tareas/material restringidos a PDF y JPG,
; con tamaño máximo acotado. El límite del servidor es la primera barrera;
; el tipo de archivo (PDF/JPG) igual debe validarse explícitamente en PHP
; (extensión + tipo MIME real), nunca confiar solo en esta configuración.
upload_max_filesize = 5M
post_max_size = 6M

memory_limit = 128M
display_errors = Off
log_errors = On
error_log = /var/log/apache2/php_errors.log

; Sesiones (equivalente en el backend de sesionActiva/usuarioActual del frontend)
session.cookie_httponly = 1
session.cookie_samesite = "Lax"
```

> `display_errors = Off` + `log_errors = On`: NRF08 exige proteger datos personales de alumnos y talleristas (varios de ellos menores de edad bajo convenio INAU); los errores de PHP no deben mostrarse al usuario final (podrían filtrar rutas o consultas), pero sí quedar registrados para diagnóstico — esto también es la base técnica de NRF10 (trazabilidad).

---

## 6. Conexión PHP → MySQL y control de acceso por rol

### `backend/includes/conexion.php`

```php
<?php
declare(strict_types=1);

function obtenerConexion(): mysqli
{
    $host     = getenv('DB_HOST')     ?: 'db';
    $puerto   = (int) (getenv('DB_PORT') ?: 3306);
    $base     = getenv('DB_NAME')     ?: 'inau_tallerista';
    $usuario  = getenv('DB_USER')     ?: 'tallerista_app';
    $password = getenv('DB_PASSWORD') ?: '';

    mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

    $conexion = new mysqli($host, $usuario, $password, $base, $puerto);
    $conexion->set_charset('utf8mb4');

    return $conexion;
}
```

### `backend/includes/sesion.php` — NRF07, control de acceso por rol

Es el equivalente en el servidor de la función `verificarSesion()` que ya existe en `frontend-admin/js/main.js` y `frontend-tallerista/js/main.js` (ver `docs/CAMBIOS-SEGURIDAD.md`). El frontend bloquea la *navegación*; esto bloquea el *dato*, que es lo que realmente importa una vez que exista una API real.

```php
<?php
declare(strict_types=1);

function requerirRol(string $rolEsperado): array
{
    session_start();

    if (empty($_SESSION['usuario_id']) || ($_SESSION['rol'] ?? null) !== $rolEsperado) {
        http_response_code(401);
        header('Content-Type: application/json');
        echo json_encode(['error' => 'No autorizado']);
        exit;
    }

    return [
        'id'     => $_SESSION['usuario_id'],
        'rol'    => $_SESSION['rol'],
        'nombre' => $_SESSION['nombre'] ?? '',
    ];
}
```

### Ejemplo de uso — RF04/RF05, asistencia por taller y fecha (`backend/api/asistencias.php`)

```php
<?php
require_once __DIR__ . '/../includes/conexion.php';
require_once __DIR__ . '/../includes/sesion.php';

// NRF07: solo un tallerista autenticado puede registrar/consultar asistencia
$usuario = requerirRol('Tallerista');

$conexion = obtenerConexion();
$tallerId = (int) ($_GET['taller_id'] ?? 0);
$fecha    = $_GET['fecha'] ?? date('Y-m-d');

$consulta = $conexion->prepare(
    'SELECT a.id, al.nombre, al.apellido, a.presente
     FROM asistencias a
     JOIN alumnos al ON al.id = a.alumno_id
     WHERE a.taller_id = ? AND a.fecha = ?
     ORDER BY al.apellido'
);
$consulta->bind_param('is', $tallerId, $fecha);
$consulta->execute();
$resultado = $consulta->get_result();

$filas = [];
while ($fila = $resultado->fetch_assoc()) {
    // htmlspecialchars() aunque la respuesta sea JSON: si en algún punto
    // el frontend inserta este dato con innerHTML (como ya audita
    // docs/informe-sast.md), llega neutralizado igual.
    $filas[] = [
        'id'       => (int) $fila['id'],
        'nombre'   => htmlspecialchars($fila['nombre'], ENT_QUOTES, 'UTF-8'),
        'apellido' => htmlspecialchars($fila['apellido'], ENT_QUOTES, 'UTF-8'),
        'presente' => (bool) $fila['presente'],
    ];
}

header('Content-Type: application/json');
echo json_encode($filas);
```

> Se usa `mysqli` con **consultas preparadas** (`prepare` + `bind_param`) para evitar inyección SQL, y `htmlspecialchars()` en toda salida — ambos son la contraparte, del lado del servidor, de la validación que NRF05 exige "tanto en el frontend como en el backend", y de la protección anti-XSS ya verificada en el frontend (`docs/informe-sast.md`, sección 1.4-c).

### Nota importante sobre `js/auth.js`

El `js/auth.js` construido durante la Segunda Entrega de seguridad autentica contra un listado `USUARIOS_DEMO` en texto plano **porque todavía no existía backend** (documentado explícitamente en `docs/POLITICA-SEGURIDAD-v1.md`, sección 4.2). Cuando `backend/api/login.php` esté levantado con este entorno Docker, ese archivo debe cambiar únicamente en la función `autenticarUsuario()`, para que haga un `fetch('/backend/api/login.php', ...)` y el servidor compare la contraseña con `password_verify()` contra un hash guardado con `password_hash()` — nunca contraseñas en texto plano en una tabla `usuarios`. El resto de `auth.js` (validación de cédula, manejo de intentos fallidos, redirección por rol) no necesita tocarse.

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

## 8. `db/init/001_schema.sql` — punto de partida

Basado en las entidades ya identificadas por el equipo en `docs/PrimeraVista.md`, sección 13 ("Modelo de datos preliminar"). Es un punto de partida para discutir con el equipo, **no** un MER cerrado — falta completar tipos exactos, `mensajes`/`adjuntos`/`historial de actividad` una vez que esos módulos se definan con más detalle.

```sql
CREATE TABLE roles (
    id   TINYINT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(20) NOT NULL UNIQUE  -- 'Administrador' | 'Tallerista' | 'Alumno'
);

CREATE TABLE usuarios (
    id            INT PRIMARY KEY AUTO_INCREMENT,
    cedula        VARCHAR(15) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nombre        VARCHAR(80) NOT NULL,
    apellido      VARCHAR(80) NOT NULL,
    rol_id        TINYINT NOT NULL,
    creado_en     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (rol_id) REFERENCES roles(id)
);

CREATE TABLE talleres (
    id          INT PRIMARY KEY AUTO_INCREMENT,
    nombre      VARCHAR(120) NOT NULL,
    descripcion TEXT
);

-- Asignación de talleristas a talleres (un taller puede tener varios talleristas)
CREATE TABLE talleres_talleristas (
    taller_id     INT NOT NULL,
    tallerista_id INT NOT NULL,
    PRIMARY KEY (taller_id, tallerista_id),
    FOREIGN KEY (taller_id) REFERENCES talleres(id),
    FOREIGN KEY (tallerista_id) REFERENCES usuarios(id)
);

-- Inscripción de alumnos a talleres (un alumno puede estar en varios talleres)
CREATE TABLE talleres_alumnos (
    taller_id INT NOT NULL,
    alumno_id INT NOT NULL,
    PRIMARY KEY (taller_id, alumno_id),
    FOREIGN KEY (taller_id) REFERENCES talleres(id),
    FOREIGN KEY (alumno_id) REFERENCES usuarios(id)
);

CREATE TABLE asistencias (
    id        INT PRIMARY KEY AUTO_INCREMENT,
    taller_id INT NOT NULL,
    alumno_id INT NOT NULL,
    fecha     DATE NOT NULL,
    presente  BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE KEY uq_asistencia (taller_id, alumno_id, fecha),
    FOREIGN KEY (taller_id) REFERENCES talleres(id),
    FOREIGN KEY (alumno_id) REFERENCES usuarios(id)
);

CREATE TABLE tareas (
    id            INT PRIMARY KEY AUTO_INCREMENT,
    taller_id     INT NOT NULL,
    titulo        VARCHAR(150) NOT NULL,
    descripcion   TEXT,
    archivo_ruta  VARCHAR(255),   -- NRF11: solo .pdf/.jpg validado en PHP antes de guardar
    creado_en     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (taller_id) REFERENCES talleres(id)
);

CREATE TABLE entregas (
    id           INT PRIMARY KEY AUTO_INCREMENT,
    tarea_id     INT NOT NULL,
    alumno_id    INT NOT NULL,
    archivo_ruta VARCHAR(255) NOT NULL,
    nota         DECIMAL(4,2),
    entregado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tarea_id) REFERENCES tareas(id),
    FOREIGN KEY (alumno_id) REFERENCES usuarios(id)
);

-- NRF10: trazabilidad de acciones importantes
CREATE TABLE historial_actividad (
    id          INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id  INT NOT NULL,
    accion      VARCHAR(120) NOT NULL,
    detalle     TEXT,
    creado_en   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

INSERT INTO roles (nombre) VALUES ('Administrador'), ('Tallerista'), ('Alumno');
```

---

## 9. Relación con el resto del proyecto

- Los roles y el flujo de un único login coinciden exactamente con lo ya definido en `docs/PrimeraVista.md`, secciones 13 y 14.1.
- `backend/includes/sesion.php` es la contraparte del lado del servidor de `verificarSesion()`, agregado al frontend en la Segunda Entrega de seguridad (`docs/CAMBIOS-SEGURIDAD.md`, punto 1) — ambos controles deben coexistir: el del frontend evita mostrar pantallas sin sesión, el del backend evita entregar datos aunque alguien se salte el frontend.
- Los formatos y tamaños de archivo restringidos en `php.ini` (sección 5) instrumentan NRF11 y NRF12, ya identificados en `docs/requerimientos.md`.
- La tabla `historial_actividad` instrumenta NRF10 ("trazabilidad de las acciones importantes"), listado en `docs/requerimientos.md` y en las entidades preliminares de `docs/PrimeraVista.md` §13 ("historial de actividad").
- Antes de conectar este backend a datos reales de INAU, revisar `docs/POLITICA-SEGURIDAD-v1.md` (contraseñas hasheadas, HTTPS obligatorio, niveles de acceso).
