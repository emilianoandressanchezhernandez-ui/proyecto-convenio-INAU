# Despliegue en un servidor desde cero — TheNewfutures / INAU

## Guía de montaje del sitio en un servidor nuevo

---

> **Qué es este documento.** Es la guía reproducible para montar el sitio en un **servidor recién creado, sin nada instalado**, hasta dejarlo accesible por internet con HTTPS. Usa el entorno Docker definido en `backend/api-completa/compose.yaml`; aquí no se redefine ese entorno, se documenta **cómo preparar el servidor y poner el sistema en producción**.

### Supuestos

- Servidor **Ubuntu 22.04 o 24.04** con acceso por SSH (un VPS, por ejemplo).
- Un **dominio** (`<tu-dominio>`) cuyo registro DNS apunte a la IP del servidor (`<IP>`). Sin dominio se puede probar por IP, pero el HTTPS necesita dominio.
- El sistema tiene dos partes que se publican por separado:
  - **La API y la base de datos** corren en Docker (servicios `api` y `database` del `compose`).
  - **El frontend** (carpeta `frontend/`) son archivos estáticos que sirve **Nginx** directamente. El contenedor `api` no incluye el frontend.
- Nginx publica todo bajo el mismo dominio: el frontend en `https://<tu-dominio>/` y la API en `https://<tu-dominio>/api/`.
- Reemplazá los marcadores `<IP>`, `<tu-dominio>` y `<usuario>` por los valores reales.

---

## Paso 1 — Entrar al servidor y crear un usuario de trabajo

Conectarse como root (con la credencial que entrega el proveedor):

```bash
ssh root@<IP>
```

Crear un usuario sin privilegios de root para el día a día y darle permiso de administración:

```bash
adduser <usuario>
usermod -aG sudo <usuario>
```

Desde aquí se trabaja con ese usuario (`ssh <usuario>@<IP>`), no como root.

## Paso 2 — Actualizar el sistema y activar el firewall

```bash
sudo apt update && sudo apt upgrade -y
```

Activar el firewall dejando entrar solo SSH y web:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

> **Importante:** Docker escribe sus propias reglas de red y **no respeta UFW** para los puertos que publican los contenedores. El firewall por sí solo **no** impide que se acceda desde internet a la base (3308) o a la API (8002). Para cerrarlos hay que publicarlos solo en `127.0.0.1`, como se indica en el Paso 5.

## Paso 3 — Instalar Docker y Docker Compose

```bash
# Dependencias y clave del repositorio oficial de Docker
sudo apt install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Poder usar docker sin sudo (requiere reabrir la sesión SSH después)
sudo usermod -aG docker <usuario>
```

Verificar:

```bash
docker --version
docker compose version
```

## Paso 4 — Traer el proyecto al servidor

```bash
sudo apt install -y git
git clone -b cambios-frontend https://github.com/emilianoandressanchezhernandez-ui/proyecto-convenio-INAU.git
cd proyecto-convenio-INAU
```

> La versión con el backend completo está en la rama `cambios-frontend`. Una vez que se una a `main`, se puede clonar sin `-b cambios-frontend`.

## Paso 5 — Configurar las variables de entorno

Entrar a la carpeta de la API y crear el `.env` a partir de la plantilla:

```bash
cd backend/api-completa
cp .env.example .env
```

Generar una clave secreta nueva:

```bash
openssl rand -hex 32
```

Editar el `.env` (`nano .env`) y dejarlo así, con valores propios:

```dotenv
SECRET_KEY=<la clave generada arriba>
APP_ENV=production
FRONTEND_ORIGIN=https://<tu-dominio>

DB_PASSWORD=<contraseña fuerte del usuario de la base>
MYSQL_ROOT_PASSWORD=<contraseña fuerte de root>

# Publicar la API y la base solo dentro del servidor (no hacia internet)
API_PORT=127.0.0.1:8002
MYSQL_PORT=127.0.0.1:3308
```

> **`SECRET_KEY` no puede quedar vacía.** Si se deja vacía, el `compose` usa una clave por defecto que está publicada en el repositorio, y cualquiera podría falsificar una sesión de administrador.

> **Antes de cargar datos reales:** quitar la línea `DROP DATABASE IF EXISTS` del script `DataBase/inau_talleres.sql`, para que una reinstalación no borre la base. Y no subir nunca el `.env` al repositorio.

## Paso 6 — Levantar la API y la base

Desde `backend/api-completa`:

```bash
docker compose up -d --build
docker compose ps
```

Esto construye la imagen de la API, crea la base desde `DataBase/inau_talleres.sql` y deja la API escuchando en `127.0.0.1:8002`, accesible solo desde el propio servidor.

> El script de la base se ejecuta **solo la primera vez**, cuando se crea el volumen de datos. Si más adelante cambia el esquema, volver a levantar el stack no lo aplica: hay que migrar la base a mano o recrearla.

## Paso 7 — Preparar el frontend

El frontend tiene escrita la dirección de la API de desarrollo (`http://localhost:8002`). En producción la API se publica en `/api` del mismo dominio, así que hay que reemplazarla:

```bash
cd ~/proyecto-convenio-INAU
grep -rl 'http://localhost:8002' frontend | xargs sed -i 's#http://localhost:8002#/api#g'

# Comprobar que no quedó ninguna
grep -rn 'localhost:8002' frontend
```

Copiar el frontend a la carpeta que va a servir Nginx:

```bash
sudo mkdir -p /var/www/talleres
sudo cp -r frontend/* /var/www/talleres/
```

## Paso 8 — Publicar con dominio y HTTPS (Nginx + Certbot)

Instalar Nginx y Certbot:

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

Crear el sitio en `/etc/nginx/sites-available/talleres` (con `sudo nano`):

```nginx
server {
    server_name <tu-dominio>;

    # Tamaño máximo de subida (adjuntos de hasta 10 MB)
    client_max_body_size 12M;

    # Frontend: archivos estáticos
    root /var/www/talleres;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    # API: se reenvía al contenedor, quitando el prefijo /api
    location /api/ {
        proxy_pass http://127.0.0.1:8002/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Activarlo y recargar Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/talleres /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

Obtener el certificado HTTPS (Certbot ajusta la configuración y renueva solo):

```bash
sudo certbot --nginx -d <tu-dominio>
```

> Como el frontend y la API quedan bajo el mismo dominio, el navegador envía la cookie de sesión en cada llamada a la API y no aparecen problemas de CORS. Por eso `FRONTEND_ORIGIN` debe ser exactamente `https://<tu-dominio>`.

## Paso 9 — Verificación

| Qué | Cómo |
|---|---|
| Contenedores arriba | `docker compose ps` (en `backend/api-completa`) muestra `api` y `database` activos |
| Base creada | `docker compose exec database sh -c 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" -e "USE inau_talleres; SELECT correo, rol FROM usuarios;"'` |
| API accesible por el dominio | `curl -i https://<tu-dominio>/api/perfil` responde (un `401` sin sesión es correcto: la API está respondiendo) |
| Puertos cerrados hacia afuera | Desde otra máquina, `https://<tu-dominio>:8002` y el puerto `3308` no responden |
| Sitio funcionando | Abrir `https://<tu-dominio>`, iniciar sesión con un usuario de prueba y navegar el panel |
| HTTPS válido | El navegador muestra el candado sin advertencias |

## Paso 10 — Operación y mantenimiento

```bash
cd ~/proyecto-convenio-INAU/backend/api-completa

# Ver logs
docker compose logs api
docker compose logs database

# Respaldo de la base (recomendado antes de cada actualización)
docker compose exec -T database sh -c 'mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" inau_talleres' > ~/respaldo_$(date +%F).sql
```

Para actualizar el sitio con cambios nuevos del repositorio:

```bash
cd ~/proyecto-convenio-INAU
git pull

# API
cd backend/api-completa && docker compose up -d --build && cd ../..

# Frontend: repetir el reemplazo de la URL y volver a copiar
grep -rl 'http://localhost:8002' frontend | xargs -r sed -i 's#http://localhost:8002#/api#g'
sudo cp -r frontend/* /var/www/talleres/
```

> Actualizar el código no modifica la base de datos (ver la nota del Paso 6).

## Checklist de seguridad antes de usar con datos reales

- [ ] `SECRET_KEY` **generada y no vacía** en el `.env`; contraseñas de base propias.
- [ ] `APP_ENV=production`.
- [ ] `API_PORT` y `MYSQL_PORT` publicados solo en `127.0.0.1` (verificado desde otra máquina).
- [ ] El frontend apunta a `/api` y no a `localhost:8002`.
- [ ] El `.env` nunca se sube al repositorio.
- [ ] `DROP DATABASE IF EXISTS` retirado del script de la base.
- [ ] HTTPS activo y renovación automática de Certbot funcionando.
- [ ] Respaldo de la base programado.

---

## Relación con el resto de la documentación

- El entorno de contenedores (servicios, imagen, variables) está definido en `backend/api-completa/compose.yaml` y su `Dockerfile`; su documentación de diseño está en `docs/04-implementacion/inau-infraestructura-docker.md`.
- La prueba del entorno en una máquina local está en `docs/04-implementacion/Documento de Reconstruccion - Doker desktop.md`.
- Este documento cubre el escenario restante: montar el sitio en un servidor nuevo, de cero, hasta dejarlo en producción con HTTPS.