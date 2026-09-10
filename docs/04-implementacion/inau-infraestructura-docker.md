# TheNewfutures — Entorno Docker (PHP + HTML/CSS + MySQL)

### Plataforma de gestión de talleres | Convenio con INAU

---

> Este documento define el entorno de desarrollo/despliegue en contenedores para el sistema de **TheNewfutures**, usando **HTML + CSS + JS** en el frontend (`frontend-admin`, `frontend-tallerista`, `frontend-alumno`), **PHP** en el backend y **MySQL** como base de datos. Se resuelve con `docker compose` para reemplazar el uso actual de **XAMPP o servidor local** (mencionado como entorno de ejecución durante el desarrollo en `docs/03-diseño/Justificacion Tecnologica.md`, sección 1.3), de forma que los 5 integrantes del equipo trabajen con el mismo entorno sin instalar XAMPP cada uno por su cuenta, y el proyecto quede listo para moverse a un hosting externo cuando INAU lo requiera.

---

## 1. Justificación de la arquitectura elegida

| Decisión | Justificación |
|---|---|
| PHP + Apache en vez de un framework pesado | El equipo son 5 estudiantes de 3.º BT Informática con un plazo de 12 semanas (Charter del proyecto). PHP corre sin build step adicional, es lo que ya está definido como backend en `docs/03-diseño/Justificacion Tecnologica.md`, sección 1.2 ("PHP para el backend", "MySQL para la base de datos"), y es ampliamente soportado por hostings económicos — relevante porque INAU, como organismo público, no necesariamente cuenta con infraestructura de servidor dedicada. |
| Frontend HTML + CSS + JS servido por el mismo contenedor PHP (sin SPA/build) | NRF01 "diseño responsive, adaptándose a computadora, tablet y teléfono"; el frontend ya está construido así (Bootstrap + CSS propio, sin framework de JS), consistente con la decisión ya tomada por el equipo en `docs/03-diseño/Justificacion Tecnologica.md`, sección 1.1 (Bootstrap como base). |
| Un único punto de login (`index.html` en la raíz) | Corresponde exactamente a la decisión ya documentada por el equipo en `docs/03-diseño/Justificacion Tecnologica.md`, sección 3: *"En lugar de tres pantallas de acceso independientes, existe un único `index.html`. El backend identificará el rol del usuario autenticado y lo redirigirá al panel correspondiente."* El contenedor `web` sirve ese `index.html` como raíz del document root. |
| MySQL en contenedor separado con volumen persistente | NRF09 "garantizar la persistencia confiable de los datos en una base de datos relacional". Aísla los datos del ciclo de vida del contenedor de aplicación. |
| phpMyAdmin como servicio opcional | Facilita al equipo de desarrollo inspeccionar datos durante la etapa de pruebas, sin instalar un cliente MySQL aparte. |
| Variables sensibles vía `.env` (no hardcodeadas) | NRF08 "proteger los datos personales de los usuarios" — las credenciales de base de datos no deben quedar en el repositorio ni en la imagen. |
| Backend separado del frontend a nivel de código (carpeta `backend/`) | NRF06 "arquitectura separada entre frontend y backend". El frontend (`frontend-admin/`, `frontend-tallerista/`, `frontend-alumno/`) sigue siendo HTML/JS estático que consume los endpoints PHP de `backend/api/`, tal como ya prevé el propio código actual (los `main.js` de cada panel están preparados para reemplazar los archivos de datos simulados por la API real cuando el backend esté listo). |

---

## 2. Estructura de carpetas del proyecto

Esta estructura respeta la que ya existe en el repositorio, agregando solamente lo necesario para levantar el stack:

```
proyecto-convenio-INAU/
├── docker-compose.yml
├── .env                        # NO se commitea (ver .gitignore)
├── .env.example                # plantilla versionada
├── php/
│   ├── Dockerfile
│   └── php.ini
├── index.html                  # login único (ya existe) — punto de entrada de todos los roles
├── docs/                       # documentación organizada por etapa
├── frontend/
│   ├── frontend-admin/
│   │   ├── css/  js/           # incluye auth.js, hoy con usuarios de demostración
│   │   └── 11 páginas HTML
│   ├── frontend-tallerista/
│   │   ├── css/  js/
│   │   └── 9 páginas HTML
│   └── frontend-alumno/
│       ├── css/
│       └── 7 páginas HTML      # pendiente de lógica JavaScript propia
└── backend/
    ├── DataBase/
    │   └── inau_talleres.sql   # esquema real, ejecutado al inicializar el contenedor
    ├── api/
    │   ├── login.php
    │   ├── talleres.php
    │   ├── asistencias.php
    │   ├── contenidos.php
    │   ├── entregas.php
    │   ├── informes.php
    │   └── perfil.php
    └── includes/
        ├── conexion.php
        └── sesion.php          # control de acceso por rol en el servidor (NRF07)
```

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
| `web` monta la raíz del proyecto (`./:/var/www/html`) | El document root necesita servir `index.html` y `frontend/` como estático, y `backend/api/*.php` como endpoints, tal como ya está organizado el repositorio actual — no hace falta mover archivos a una carpeta `public/` nueva. |
| `db` monta `./backend/DataBase` como directorio de inicialización | MySQL ejecuta automáticamente los scripts `.sql` de esa carpeta en el primer arranque, de modo que el esquema real del proyecto se aplica sin mantener una copia paralela. |
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

; Sesiones (equivalente en el backend del control de sesión del frontend)
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
    $base     = getenv('DB_NAME')     ?: 'inau_talleres';
    $usuario  = getenv('DB_USER')     ?: 'talleres_app';
    $password = getenv('DB_PASSWORD') ?: '';

    mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

    $conexion = new mysqli($host, $usuario, $password, $base, $puerto);
    $conexion->set_charset('utf8mb4');

    return $conexion;
}
```

### `backend/includes/sesion.php` — NRF07, control de acceso por rol

Es el equivalente en el servidor de la verificación de sesión que ya realiza el `main.js` de cada panel. El frontend bloquea la *navegación*; esto bloquea el *dato*, que es lo que realmente importa una vez que exista una API real.

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
$usuario = requerirRol('tallerista');

$conexion = obtenerConexion();
$tallerId = (int) ($_GET['taller_id'] ?? 0);
$fecha    = $_GET['fecha'] ?? date('Y-m-d');

// La asistencia se estructura en dos niveles: la jornada (asistencias) y el
// estado de cada alumno dentro de ella (registros_asistencia).
$consulta = $conexion->prepare(
    'SELECT r.id, al.nombre, al.apellido, r.estado
     FROM registros_asistencia r
     JOIN asistencias a ON a.id = r.asistencia_id
     JOIN alumnos al ON al.id = r.alumno_id
     WHERE a.taller_id = ? AND a.fecha = ?
     ORDER BY al.apellido'
);
$consulta->bind_param('is', $tallerId, $fecha);
$consulta->execute();
$resultado = $consulta->get_result();

$filas = [];
while ($fila = $resultado->fetch_assoc()) {
    // htmlspecialchars() aunque la respuesta sea JSON: si en algún punto
    // el frontend inserta este dato con innerHTML, llega neutralizado igual.
    $filas[] = [
        'id'       => (int) $fila['id'],
        'nombre'   => htmlspecialchars($fila['nombre'], ENT_QUOTES, 'UTF-8'),
        'apellido' => htmlspecialchars($fila['apellido'], ENT_QUOTES, 'UTF-8'),
        'estado'   => $fila['estado'],   // Presente | Ausente | Justificado | Tardanza
    ];
}

header('Content-Type: application/json');
echo json_encode($filas);
```

> Se usa `mysqli` con **consultas preparadas** (`prepare` + `bind_param`) para evitar inyección SQL, y `htmlspecialchars()` en toda salida — ambos son la contraparte, del lado del servidor, de la validación que NRF05 exige "tanto en el frontend como en el backend".

### Nota importante sobre la autenticación actual

El archivo `frontend/frontend-admin/js/auth.js` autentica contra un listado de usuarios de demostración en texto plano, **porque todavía no existe backend**. Cuando `backend/api/login.php` esté levantado con este entorno Docker, ese archivo debe cambiar únicamente en su función de autenticación, para que haga un `fetch('/backend/api/login.php', ...)` y el servidor compare la contraseña con `password_verify()` contra el hash guardado en `usuarios.clave_hash` — nunca contraseñas en texto plano. El resto de `auth.js` (validación de cédula, manejo de intentos fallidos, redirección por rol) no necesita tocarse.

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

El esquema de la base de datos está definido en `backend/DataBase/inau_talleres.sql`, derivado del modelo de clases mediante el método documentado en `docs/03-diseño/Modelado/`. Consta de trece tablas: once de entidad y dos intermedias.

El contenedor `db` ejecuta ese script automáticamente en el primer arranque, mediante el montaje de la carpeta en `/docker-entrypoint-initdb.d`. No se define un esquema propio para el entorno Docker: mantener un segundo script produciría dos versiones divergentes de la misma estructura.

**Consideraciones para el entorno en contenedor:**

- El script comienza con `DROP DATABASE IF EXISTS`, apropiado para desarrollo pero que debe retirarse antes de cualquier despliegue con datos reales.
- Los datos de prueba incluidos utilizan hashes de contraseña reales, válidos para probar el inicio de sesión pero que no deben conservarse en un entorno con datos de INAU.
- El script requiere MySQL 8.0 o superior por el uso de restricciones `CHECK`. La imagen `mysql:8.0` del compose cumple ese requisito.
- La base se llama `inau_talleres`, valor que debe coincidir con `MYSQL_DATABASE` en el archivo `.env`.

---

## 9. Relación con el resto del proyecto

- Los roles y el flujo de un único login coinciden exactamente con lo ya definido en `docs/03-diseño/Justificacion Tecnologica.md`, sección 3, y en `docs/03-diseño/Modelado/modelo-clases-uml-mer.md`.
- `backend/includes/sesion.php` es la contraparte del lado del servidor de la verificación de sesión que ya realiza el frontend — ambos controles deben coexistir: el del frontend evita mostrar pantallas sin sesión, el del backend evita entregar datos aunque alguien se salte el frontend.
- Los formatos y tamaños de archivo restringidos en `php.ini` (sección 5) instrumentan NRF11 y NRF12, ya identificados en `docs/02-analisis/requerimientos.md`.
- La tabla `trazabilidad` instrumenta NRF10 ("trazabilidad de las acciones importantes"), listado en `docs/02-analisis/requerimientos.md` y modelado como clase `RegistroTrazabilidad` en `docs/03-diseño/Modelado/modelo-clases-uml-mer.md`.
- Antes de conectar este backend a datos reales de INAU deben verificarse tres condiciones: contraseñas almacenadas mediante hash seguro, conexión bajo HTTPS y verificación de permisos por rol en cada endpoint, conforme a NRF07 y NRF08.