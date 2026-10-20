# Despliegue en un servidor desde cero — TheNewfutures / INAU

## Guía de montaje del sitio en un servidor nuevo

---

> **Qué es este documento.** Es la guía reproducible para montar el sitio en un **servidor recién creado, sin nada instalado**, hasta dejarlo accesible por internet con HTTPS. Reutiliza el entorno Docker ya definido en `docs/04-implementacion/inau-infraestructura-docker.md`; aquí no se redefine el `compose`, se documenta **cómo preparar el servidor y poner el stack en producción**.

### Supuestos

- Servidor **Ubuntu 22.04 o 24.04** con acceso por SSH (un VPS, por ejemplo).
- Un **dominio** (`<tu-dominio>`) cuyo registro DNS apunte a la IP del servidor (`<IP>`). Sin dominio se puede probar por IP, pero el HTTPS necesita dominio.
- El proyecto se despliega con **Docker**, usando el `compose` del repositorio (servicios `api` y `database`).
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

## Paso 2 — Actualizar el sistema y cerrar el servidor

```bash
sudo apt update && sudo apt upgrade -y
```

Activar el firewall dejando entrar solo lo necesario (SSH y web):

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

> El puerto de la base (MySQL) **no se abre** al exterior: queda accesible solo dentro del servidor.

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
git clone https://github.com/emilianoandressanchezhernandez-ui/proyecto-convenio-INAU.git
cd proyecto-convenio-INAU/backend/api
```

> El `docker-compose` vive en la carpeta de la API, igual que en el entorno local.

## Paso 5 — Configurar las variables de entorno (claves reales)

Copiar la plantilla y completar con valores **nuevos y propios de producción**:

```bash
cp .env.example .env
```

Generar una clave secreta nueva (no reutilizar la de desarrollo):

```bash
openssl rand -hex 32
```

Editar el `.env` (`nano .env`) y completar al menos:

- `SECRET_KEY` → el valor generado arriba.
- Las contraseñas de MySQL (root y usuario de la aplicación) → contraseñas fuertes propias.
- `FRONTEND_ORIGIN` → `https://<tu-dominio>`.

> **Importante antes de datos reales:** quitar la línea `DROP DATABASE IF EXISTS` del script `DataBase/inau_talleres.sql`, para que un reinicio no borre la base; y confirmar que el `.env` está en `.gitignore` para no versionarlo nunca.

## Paso 6 — Levantar el stack

```bash
docker compose up -d --build
docker compose ps
```

Esto construye las imágenes, crea la base desde `DataBase/inau_talleres.sql` y deja la API escuchando en el puerto interno del servidor (por defecto `8002`).

## Paso 7 — Publicar con dominio y HTTPS (Nginx + Certbot)

Instalar Nginx y Certbot:

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

Crear el sitio en `/etc/nginx/sites-available/talleres` (con `sudo nano`), que reenvía el tráfico web al contenedor de la API:

```nginx
server {
    server_name <tu-dominio>;

    location / {
        proxy_pass http://127.0.0.1:8002;
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
sudo nginx -t
sudo systemctl reload nginx
```

Obtener el certificado HTTPS (Certbot edita la config y renueva solo):

```bash
sudo certbot --nginx -d <tu-dominio>
```

> Al quedar todo servido desde `https://<tu-dominio>`, el frontend y la API comparten origen, de modo que el login y las llamadas a la API funcionan sin problemas de CORS.

## Paso 8 — Verificación

| Qué | Cómo |
|---|---|
| Contenedores arriba | `docker compose ps` muestra `api` y `database` activos |
| Base recreada | `docker compose exec database mysql -u root -p -e "USE inau_talleres; SELECT * FROM usuarios;"` |
| Sitio accesible | Abrir `https://<tu-dominio>` en el navegador y entrar con un usuario de prueba |
| HTTPS válido | El navegador muestra el candado sin advertencias |

## Paso 9 — Operación y mantenimiento

```bash
# Ver logs
docker compose logs api
docker compose logs database

# Actualizar el sitio tras nuevos cambios en el repositorio
git pull
docker compose up -d --build

# Respaldo de la base (recomendado antes de cada actualización)
docker compose exec database mysqldump -u root -p inau_talleres > respaldo_$(date +%F).sql
```

## Checklist de seguridad antes de usar con datos reales

- [ ] `SECRET_KEY` y contraseñas **nuevas** en `.env` (nunca las de desarrollo).
- [ ] `.env` en `.gitignore`, fuera del control de versiones.
- [ ] `DROP DATABASE IF EXISTS` retirado del script de la base.
- [ ] Puerto de MySQL cerrado al exterior (solo interno).
- [ ] HTTPS activo y renovación automática de Certbot funcionando.
- [ ] phpMyAdmin **no** expuesto públicamente (o directamente no desplegado en producción).
- [ ] Respaldo de la base programado.

---

## Relación con el resto de la documentación

- La definición del entorno (servicios, `Dockerfile`, `php.ini`, variables) está en `docs/04-implementacion/inau-infraestructura-docker.md`.
- La prueba del entorno en una máquina local está en `docs/04-implementacion/Documento de Reconstruccion.md`.
- Este documento cubre el escenario restante: montar el sitio en un servidor nuevo, de cero, hasta dejarlo en producción con HTTPS.