# Reconstrucción del entorno — Puesta en marcha y prueba del servidor Docker

## Sistema de Gestión de Talleres en Convenio con INAU — TheNewfutures

<br>

> **Qué es este documento.** Es la **bitácora de montaje y prueba** del entorno en contenedores: registra los comandos que se usaron para levantar y verificar el servidor (API PHP + base MySQL) con Docker, y el resultado obtenido. No redefine el entorno —el `compose`, el `Dockerfile` y el `php.ini` están en `docs/04-implementacion/inau-infraestructura-docker.md`—: aquí queda constancia de cómo se ejecutó y se comprobó que funciona.

---

<br>

## 1. Objetivo

Dejar documentado el procedimiento reproducible para levantar la API y su base de datos en contenedores, recrear la base desde el script del proyecto y verificar que quedó operativa, de modo que cualquier integrante pueda repetir la prueba en su propia máquina.


## 2. Requisitos previos

- Docker y Docker Compose instalados.
- Situarse en la carpeta de la API, donde está el `docker-compose`. En el equipo donde se probó:

```
C:\Users\barro\proyecto-convenio-INAU\api-completa
```

> En el repositorio, esa carpeta se corresponde con el directorio de la API (`backend/api`). Los comandos se ejecutan desde ahí.

## 3. Prueba limpia completa

La secuencia que se usó para una prueba desde cero (borra datos viejos, reconstruye las imágenes y levanta todo):

```bash
docker compose down -v
docker compose up -d --build
docker compose ps -a
```

- `down -v` baja los contenedores y **borra los volúmenes**, de modo que la base se recree de cero.
- `up -d --build` reconstruye las imágenes y levanta los servicios en segundo plano.
- `ps -a` confirma que los contenedores quedaron en estado correcto.

Esto recrea la base desde `api-completa/DataBase/inau_talleres.sql` y deja la API disponible en **http://localhost:8002**.

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

> **Nota de seguridad:** `root_password` es la contraseña por defecto del entorno de desarrollo definida en el `compose`. No debe usarse en un despliegue real; ahí corresponde definir la contraseña por variable de entorno (ver la política de claves en la Revisión de Coherencia, 4.2).

## 6. Resultado esperado

| Elemento | Resultado |
|---|---|
| Contenedores | `api` y `database` levantados (`docker compose ps`) |
| Base de datos | `inau_talleres` recreada desde `api-completa/DataBase/inau_talleres.sql`, con sus trece tablas y datos de prueba |
| API | Disponible en **http://localhost:8002** |
| Verificación | `SELECT * FROM usuarios;` devuelve los usuarios de prueba |

## 7. Relación con el resto de la documentación

- La definición del entorno (servicios, imágenes, `Dockerfile`, `php.ini`, variables) está en `docs/04-implementacion/inau-infraestructura-docker.md`. Este documento solo registra su ejecución y prueba.
- El esquema de la base que se carga está en `backend/DataBase/inau_talleres.sql`, derivado del modelo documentado en `docs/03-diseño/Modelado/`.