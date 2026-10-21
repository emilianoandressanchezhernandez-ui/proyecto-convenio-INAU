# Reconstrucción del entorno — Puesta en marcha y prueba en Docker Desktop

## Sistema de Gestión de Talleres en Convenio con INAU — TheNewfutures

<br>

> **Qué es este documento.** Es la **bitácora de montaje y prueba** del entorno en contenedores: registra los comandos que se usaron para levantar y verificar el sistema completo (API PHP + base MySQL + frontend) con Docker Desktop, y el resultado obtenido. No redefine el entorno —el `compose`, el `Dockerfile` y el `php.ini` están en `docs/04-implementacion/inau-infraestructura-docker.md`—: aquí queda constancia de cómo se ejecutó y se comprobó que funciona.

---

<br>

## 1. Objetivo

Dejar documentado el procedimiento reproducible para levantar la API y su base de datos en contenedores, recrear la base desde el script del proyecto, servir el frontend y verificar que el sistema quedó operativo de punta a punta, de modo que cualquier integrante pueda repetir la prueba en su propia máquina.

## 2. Requisitos previos

- Docker Desktop instalado y en ejecución.
- Situarse en la carpeta de la API, donde está el `compose.yaml`. En el equipo donde se probó:

```
C:\Users\barro\proyecto-convenio-INAU\backend\api-completa
```

> En el repositorio, esa carpeta se corresponde con el directorio de la API (`backend/api-completa`). Los comandos de las secciones 3 a 5 se ejecutan desde ahí.

## 3. Prueba limpia completa

La secuencia que se usó para una prueba desde cero (borra datos viejos, reconstruye las imágenes y levanta todo):

```bash
docker compose down -v
docker compose up -d --build
docker compose ps -a
```

- `down -v` baja los contenedores y **borra los volúmenes**, de modo que la base se recree de cero. Es necesario porque MySQL ejecuta el script de inicialización solo la primera vez que crea el volumen.
- `up -d --build` reconstruye las imágenes y levanta los servicios en segundo plano.
- `ps -a` confirma que los contenedores quedaron en estado correcto.

Esto recrea la base desde `backend/api-completa/DataBase/inau_talleres.sql` y deja la API disponible en **http://localhost:8002**.

## 4. Comandos de operación

### Levantar y construir

```bash
docker compose up -d --build
```

### Volver a levantar sin reconstruir la imagen

```bash
docker compose up -d
```

### Ver el estado de los contenedores

```bash
docker compose ps -a     # incluye los detenidos
docker compose ps        # solo los activos
```

### Revisar logs

```bash
docker compose logs database   # logs de MySQL
docker compose logs api        # logs de la API
```

### Detener

```bash
docker compose down      # detiene sin borrar los datos (el volumen persiste)
docker compose down -v   # detiene y BORRA los datos (usar con cuidado)
```

## 5. Verificación de la base de datos

Entrar a MySQL como root dentro del contenedor:

```bash
docker compose exec database mysql -u root -proot_password
```

Ejecutar una consulta puntual sin entrar de forma interactiva:

```bash
docker compose exec database mysql -u root -proot_password -e "USE inau_talleres; SELECT * FROM usuarios;"
```

Si la consulta devuelve las filas de la tabla `usuarios`, la base se recreó correctamente y la API tiene datos contra los cuales responder.

> **Nota de seguridad:** `root_password` es la contraseña por defecto del entorno de desarrollo definida en el `compose`. No debe usarse en un despliegue real; ahí corresponde definir la contraseña por variable de entorno (ver la política de claves en la Revisión de Coherencia).

## 6. Levantar el frontend

El frontend no forma parte del `compose`: se sirve aparte, como sitio estático. Debe cumplir dos condiciones:

- La **raíz** del sitio tiene que ser la carpeta `frontend/`, porque todas sus rutas son relativas a ella (`js/api.js`, `frontend-admin/dashboard.html`, etc.).
- Tiene que quedar en **http://localhost:8000**, que es el origen que la API acepta por defecto (`FRONTEND_ORIGIN` en el `compose`). Desde otra dirección, el navegador bloquea las llamadas a la API por CORS y el inicio de sesión falla.

Desde la carpeta `frontend` del repositorio, en PowerShell:

```powershell
cd C:\Users\barro\proyecto-convenio-INAU\frontend
docker run --rm -d --name inau-frontend -p 8000:80 -v "${PWD}:/usr/share/nginx/html:ro" nginx:alpine
```

El contenedor sirve los archivos de `frontend/` en el puerto 8000. Para detenerlo:

```powershell
docker stop inau-frontend
```

> **Alternativa:** si se tiene PHP instalado en el equipo, el mismo resultado se obtiene con `php -S localhost:8000` desde la carpeta `frontend`. Cualquier otro servidor estático sirve, siempre que use `frontend/` como raíz y el puerto 8000.

Con el frontend levantado, abrir **http://localhost:8000/index.html** e iniciar sesión con un usuario de prueba. Según su rol, el sistema redirige al panel de administrador, tallerista o alumno.

## 7. Resultado esperado

| Elemento | Resultado |
|---|---|
| Contenedores | `api` y `database` levantados (`docker compose ps`) |
| Base de datos | `inau_talleres` recreada desde `backend/api-completa/DataBase/inau_talleres.sql`, con sus trece tablas y datos de prueba |
| API | Disponible en **http://localhost:8002** |
| Verificación de la base | `SELECT * FROM usuarios;` devuelve los usuarios de prueba |
| Frontend | Disponible en **http://localhost:8000** |
| Inicio de sesión | El login acepta un usuario de prueba y redirige al panel correspondiente a su rol |

## 8. Relación con el resto de la documentación

- La definición del entorno (servicios, imágenes, `Dockerfile`, `php.ini`, variables) está en `docs/04-implementacion/inau-infraestructura-docker.md`. Este documento solo registra su ejecución y prueba.
- El despliegue en un servidor real se documenta en `docs/04-implementacion/Documento de Reconstruccion - Servidor.md`.
- El esquema de la base que se carga está en `backend/api-completa/DataBase/inau_talleres.sql`, derivado del modelo documentado en `docs/03-diseño/Modelado/`.