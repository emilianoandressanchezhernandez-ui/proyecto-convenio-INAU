# Proyecto TheNewfutures — Plataforma de gestión de talleres en convenio con INAU

## Nmap aplicado al proyecto

**Rama:** Ciberseguridad  
**Fecha:** 22 de octubre de 2026
**Aclaración:** Este documento se hizo como muestra ya que no pudimos aplicar nmap por problemas de maquinas virtuales, computadoras del equipo y su almacenamiento.

## 1. Objetivo

Este documento establece cómo utilizar Nmap para comprobar qué puertos y servicios de red son accesibles en el entorno de ejecución de TheNewfutures/INAU. El propósito es contrastar la exposición de red con la arquitectura que aparece en los archivos Docker y en la documentación de despliegue.

Nmap se utiliza aquí como herramienta de reconocimiento defensivo. Un escaneo identifica puertos accesibles y puede intentar reconocer el servicio que responde; por sí solo no demuestra que exista una vulnerabilidad ni reemplaza las pruebas de la aplicación.

## 2. Alcance y autorización

Las comprobaciones descritas se deben ejecutar únicamente sobre:

- `127.0.0.1`, si se analiza el entorno Docker local del equipo.
- Una dirección IP de laboratorio o del servidor del proyecto cuyo uso haya sido autorizado por el responsable.

No se deben ejecutar escaneos contra direcciones públicas, redes de terceros o equipos ajenos al proyecto sin autorización expresa. Este documento no contiene resultados reales de escaneo: las instrucciones son un procedimiento reproducible que debe ejecutarse y documentarse en el entorno que corresponda.

## 3. Componentes del proyecto que se comprobarán

La configuración ejecutable de contenedores se encuentra en `backend/api-completa/compose.yaml`.

| Componente | Evidencia en el repositorio | Puerto publicado por defecto | Uso dentro del proyecto |
|---|---|---:|---|
| API PHP y Apache | `backend/api-completa/compose.yaml` y `docker/php-apache/Dockerfile` | TCP 8002 en el host, redirigido al puerto 80 del contenedor | Recibe las solicitudes HTTP de la aplicación y las entrega a la API. |
| MySQL | Servicio `database` en `backend/api-completa/compose.yaml` | TCP 3308 en el host, redirigido al puerto 3306 del contenedor | Almacena los datos del sistema. |
| Proxy web HTTPS previsto para el despliegue | `docs/04-implementacion/Documento de Reconstruccion - Servidor.md` | TCP 80 y 443; SSH utiliza TCP 22 | La guía de despliegue propone Nginx y Certbot delante del servicio de la API. |

Los puertos 8002 y 3308 son los valores por defecto definidos en el `compose.yaml` actual. Si se cambian `API_PORT` o `MYSQL_PORT` en el archivo `.env`, el escaneo debe utilizar los puertos configurados realmente.

**Distinción importante:** el archivo Compose actual publica los puertos 8002 y 3308 en el host sin limitar explícitamente la dirección de escucha a `127.0.0.1`. La guía de despliegue, por su parte, plantea que desde Internet solo se habiliten SSH y HTTP/HTTPS y que MySQL no quede expuesto al exterior. Nmap permite comprobar la exposición que resulta en una máquina concreta; no se debe asumir que la configuración final cumple ese objetivo sin medirla.

## 4. Preparación del escaneo local

### Paso 1. Ubicarse en la carpeta de la API

Desde PowerShell, dentro de la copia local del repositorio:

```powershell
cd ruta\proyecto-convenio-INAU\backend\api-completa
```

### Paso 2. Comprobar que Nmap está disponible

```powershell
nmap --version
```

Si el comando no se reconoce, Nmap no está disponible en esa terminal y el escaneo no puede realizarse hasta contar con la herramienta.

### Paso 3. Verificar el estado de Docker

```powershell
docker compose ps
```

Esta comprobación permite saber si los servicios `api` y `database` están levantados antes de interpretar los resultados. Un puerto cerrado cuando el contenedor está detenido no equivale a una comprobación de seguridad de un servicio en funcionamiento.

## 5. Escaneo de puertos locales del proyecto

Con los contenedores en ejecución y los puertos por defecto, ejecutar:

```powershell
nmap -Pn -sT -sV -p 8002,3308 -oN nmap-local.txt 127.0.0.1
```

| Opción | Función en este procedimiento |
|---|---|
| `-Pn` | Realiza la comprobación sin depender de una respuesta previa a las solicitudes de descubrimiento del host. |
| `-sT` | Ejecuta un escaneo TCP mediante conexión. |
| `-sV` | Intenta identificar el servicio que responde en los puertos encontrados. |
| `-p 8002,3308` | Limita la comprobación a los puertos publicados por defecto por el Compose del proyecto. |
| `-oN nmap-local.txt` | Guarda una copia legible de los resultados para la documentación de la prueba. |
| `127.0.0.1` | Limita el objetivo a la propia máquina. |

El archivo `nmap-local.txt` será la evidencia de esa ejecución. Su contenido debe reflejar el resultado observado; no se debe completar anticipadamente con estados supuestos.

## 6. Escaneo del servidor autorizado

Cuando el proyecto esté desplegado en un servidor y exista autorización para comprobarlo, ejecutar el siguiente comando sustituyendo `<IP_AUTORIZADA>` por la dirección real del servidor:

```bash
nmap -Pn -sT -sV -p 22,80,443,8002,3308 -oN nmap-servidor.txt <IP_AUTORIZADA>
```

La selección de puertos corresponde a los servicios tratados en la documentación del proyecto: SSH para administración del servidor; HTTP y HTTPS para el acceso web previsto; y los puertos publicados por defecto para la API y MySQL en el Compose actual.

No se debe ejecutar este comando con el marcador literal `<IP_AUTORIZADA>`. Primero debe asignarse el servidor correcto y confirmar que el escaneo está autorizado.

## 7. Cómo interpretar la salida

| Estado informado por Nmap | Interpretación operativa | Acción para el proyecto |
|---|---|---|
| `open` | Nmap pudo establecer que un servicio acepta conexiones en ese puerto. | Comparar el servicio con la matriz de exposición prevista en la sección 8. Si se trata de MySQL o de un acceso directo a la API desde Internet, registrar el hallazgo y solicitar revisión de firewall/Compose. |
| `closed` | El host responde, pero no hay una aplicación aceptando conexiones en ese puerto en el momento de la prueba. | Confirmar si el servicio debía estar levantado. No es por sí solo una vulnerabilidad. |
| `filtered` | Nmap no puede determinar con certeza si el puerto está abierto porque un filtro de red impide obtener una respuesta concluyente. | Revisar reglas de firewall y repetir la prueba desde el punto de red apropiado, si está autorizado. |
| Servicio o versión identificados | Nmap detectó características compatibles con un servicio concreto. | Registrar el dato como identificación probable del servicio, no como prueba de una vulnerabilidad. |

## 8. Matriz de comprobación de exposición

Esta matriz define el resultado que debe verificarse; no representa resultados de un escaneo ya realizado.

| Puerto | Servicio relacionado | En el entorno local | En un despliegue publicado según la guía del proyecto |
|---:|---|---|---|
| 22/TCP | SSH | Depende de si el equipo ofrece SSH; no es un puerto exigido por el Compose local. | Debe quedar accesible para la administración autorizada del servidor. |
| 80/TCP | HTTP / redirección web | Depende de los servicios que se ejecuten en el equipo. | Se habilita en la guía para servir o redirigir el acceso web. |
| 443/TCP | HTTPS | Depende de si existe un proxy HTTPS local. | Debe quedar accesible si se sigue el procedimiento documentado con Nginx y Certbot. |
| 8002/TCP | API PHP/Apache publicada por Docker | Se espera que responda cuando el contenedor de API está activo y se usan los valores por defecto. | Debe evaluarse si puede limitarse a la interfaz local detrás de Nginx; no debería darse por hecho que debe quedar accesible directamente desde Internet. |
| 3308/TCP | MySQL publicado por Docker | Se puede utilizar para conexiones desde el host de desarrollo si el mapeo por defecto está activo. | No debería quedar accesible desde Internet; la guía del servidor indica que el puerto de la base de datos no se abre al exterior. |

## 9. Registro de evidencia y cierre

Por cada ejecución, registrar:

1. Fecha y hora del escaneo.
2. Equipo o dirección IP objetivo y autorización correspondiente.
3. Contexto de la prueba: local o servidor.
4. Comando utilizado y variables de puerto aplicadas.
5. Archivo de salida generado por Nmap.
6. Estado de los contenedores al realizar la prueba (`docker compose ps`).
7. Puertos accesibles que no coinciden con la matriz de exposición y acción correctiva acordada.
8. Resultado de una nueva comprobación después de los cambios.

El documento debe actualizarse con los resultados observados únicamente después de ejecutar la prueba. No se debe escribir que el sistema está seguro porque el escaneo no haya mostrado puertos inesperados: Nmap solo comprueba la superficie de red definida en el comando.

## 10. Fuentes dentro del proyecto

| Archivo | Uso en este documento |
|---|---|
| `backend/api-completa/compose.yaml` | Nombres de servicios, puertos publicados, volúmenes y dependencias de Docker Compose. |
| `backend/api-completa/docker/php-apache/Dockerfile` | Imagen PHP/Apache que ejecuta la API. |
| `backend/api-completa/docker/php-apache/app.conf` | Configuración de Apache y desactivación del listado de directorios mediante `Options -Indexes`. |
| `docs/04-implementacion/inau-infraestructura-docker.md` | Arquitectura de contenedores propuesta y objetivo de no exponer MySQL al exterior. |
| `docs/04-implementacion/Documento de Reconstruccion - Servidor.md` | Procedimiento documentado de firewall, SSH, HTTP/HTTPS, Nginx y Certbot. |
| `docs/05-Ciberseguridad/Identificación de amenazas.md` | Contexto de riesgos de seguridad analizados por el proyecto. |

