# Registro de pruebas 03 — Rendimiento y carga

<br>

## Sistema de Gestión de Talleres en Convenio con INAU — TheNewfutures

> **Qué es este documento.** Pruebas de rendimiento y de carga (NRF02 y NRF03), pendientes en `Testing-01.md`. La carga se llevó hasta el punto de falla.

---

<br>

## 1. Alcance y entorno

| Elemento | Valor |
|---|---|
| Fecha de ejecución | 29/10/2026 |
| Rama / commit | `cambios-frontend` / `5cbb75b` |
| Servidor | Máquina virtual con Ubuntu Server en VirtualBox (`one-security-mark01`), 2 núcleos de CPU, 3,8 GiB de RAM y 2,2 GiB de swap. API y MySQL 8.4 en Docker; frontend servido por Nginx |
| Sitio | `http://192.168.1.14` (red local) |
| Navegador | Google Chrome en Windows, por Wi-Fi (tiempo de respuesta, mediante Claude en Chrome) |
| Herramientas | Carga: ApacheBench (`ab`) y `curl`, ejecutados dentro del servidor; monitoreo con `curl` y `docker stats` |
| Ejecutado por | Ejecución asistida por IA (Claude), supervisada por Gabriel Rendon (subcoordinador). Los comandos se ejecutaron en el servidor por SSH |

**Método.** Se midió, en orden: el tiempo de respuesta de la página y de la API sin carga (desde el navegador), y la resistencia a la carga de tres rutas (desde el propio servidor), subiendo la cantidad de solicitudes simultáneas por escalones hasta provocar el colapso. Así se miden dos cosas: el tiempo de respuesta sin carga y cuántas solicitudes simultáneas soporta el sistema antes de colapsar. Los valores se registran tal como los devolvieron las herramientas. `Testing-01.md` y `Testing-02.md` se conservan sin cambios.

**Criterio de colapso (definido para esta prueba):** se llevó cada ruta hasta que el servidor dejó de responder correctamente a la mayoría de las solicitudes, sin fijar un umbral de corte previo. Se registra en qué escalón empiezan las fallas y en cuál colapsa.

**Datos de prueba:** los datos de ejemplo del script de la base. El inicio de sesión y las rutas con sesión usaron credenciales válidas de un usuario de ejemplo (las contraseñas no se publican).

---

<br>

## 2. Tiempo de respuesta sin carga

Veinte solicitudes consecutivas a cada ruta, una después de otra, desde el navegador. Mide la respuesta del sistema con un solo usuario.

| Ruta | Código | Mínimo | Promedio | P95 | Máximo |
|---|---|---:|---:|---:|---:|
| `GET /` (pantalla de acceso, Nginx) | 200 | 6,0 ms | 10,8 ms | 18,7 ms | 21,5 ms |
| `GET /api/perfil` sin sesión | 401 | 8,6 ms | 15,7 ms | 16,3 ms | 86,3 ms |
| `POST /api/login` (credenciales válidas) | 200 | 98,9 ms | 142,6 ms | 205,7 ms | 396,8 ms |
| `GET /api/perfil` con sesión | 200 | 14,8 ms | 91,8 ms | 234,7 ms | 313,4 ms |
| `GET /api/talleres` | 200 | 14,8 ms | 66,8 ms | 197,8 ms | 200,2 ms |
| `GET /api/alumnos` | 200 | 16,7 ms | 51,8 ms | 209,7 ms | 218,4 ms |
| `GET /api/talleres/1/contenidos` | 200 | 14,8 ms | 18,6 ms | 23,8 ms | 25,0 ms |

**Observaciones:**
- Sin carga, todas las rutas respondieron en menos de medio segundo.
- La solicitud más costosa es el inicio de sesión (mínimo de 99 ms), porque verifica el hash de la contraseña con `password_verify()`, una operación lenta a propósito.
- El tiempo incluye la red Wi-Fi local, por lo que los picos sueltos de 200–300 ms corresponden probablemente a la red y no al servidor.

---

<br>

## 3. Prueba de carga

Con ApacheBench, 60 segundos por escalón, subiendo las solicitudes simultáneas (10, 50, 100, 250, 500, 1000, 2000, 5000). La herramienta de carga se ejecutó en el mismo servidor, por lo que también consumió CPU.

> **Lectura de los resultados.** "Fallas reales" cuenta las conexiones rechazadas, cortadas o con excepción (solicitudes que no llegaron a completarse). No incluye las diferencias de tamaño de respuesta que `ab` marca como fallas cuando los cuerpos varían de forma legítima (por ejemplo, una respuesta de error frente a una exitosa).

### 3.1 Página estática (`GET /`, servida por Nginx)

| Simultáneos | Completadas | Fallas reales | Solicitudes/s | Media | P95 | Máximo |
|---:|---:|---:|---:|---:|---:|---:|
| 10 | 216.126 | 0 | 3.602 | 2,8 ms | 6 ms | 50 ms |
| 50 | 213.747 | 0 | 3.562 | 14,0 ms | 25 ms | 89 ms |
| 100 | 224.590 | 0 | 3.743 | 26,7 ms | 46 ms | 141 ms |
| 250 | 228.547 | 0 | 3.808 | 65,6 ms | 99 ms | 265 ms |
| 500 | 225.043 | 0 | 3.750 | 133,3 ms | 202 ms | 440 ms |
| 1000 | 226.059 | 0 | 3.764 | 265,7 ms | 370 ms | 1.424 ms |
| **2000** | 242.977 | **26.255** | 4.041 | 494,9 ms | 638 ms | 2.483 ms |
| **5000** | 295.645 | **283.250** | 4.884 | 1.023,7 ms | 1.164 ms | 2.026 ms |

- **Soporta hasta 1000 solicitudes simultáneas sin una sola falla**, manteniendo unas 3.700 solicitudes por segundo.
- **Las primeras fallas aparecen a 2000 simultáneos** (26.255, por conexiones con excepción).
- **A 5000 simultáneos colapsa:** 283.250 fallas, más que las completadas.

### 3.2 API con sesión (`GET /api/talleres/1/contenidos`, PHP + MySQL)

| Simultáneos | Completadas | Fallas reales | Solicitudes/s | Media | P95 | Máximo |
|---:|---:|---:|---:|---:|---:|---:|
| 10 | 8.147 | 0 | 135,8 | 73,7 ms | 118 ms | 304 ms |
| 50 | 8.192 | 0 | 136,5 | 366,2 ms | 578 ms | 1.425 ms |
| 100 | 8.248 | 0 | 137,5 | 727,5 ms | 1.106 ms | 3.048 ms |
| 250 | 8.498 | 0 | 141,6 | 1.765,3 ms | 2.258 ms | 3.974 ms |
| 500 | 8.176 | 0 | 136,3 | 3.669,7 ms | 4.247 ms | 5.713 ms |
| **1000** | 288.475 | **349.851** | — | 208,1 ms | 103 ms | **56.212 ms** |

- **La API tiene un techo de unas 136 solicitudes por segundo**, sin importar cuántos usuarios simultáneos haya. De 10 a 500 simultáneos no hubo ninguna falla, pero el tiempo de respuesta crece de forma proporcional: con 500 simultáneos cada respuesta tarda **3,7 segundos de promedio**.
- **A 1000 simultáneos colapsa:** 349.851 fallas y una solicitud que tardó **56 segundos**. Durante este escalón, el monitor registró que la API quedó sin responder (tiempo de espera agotado a los 5 segundos) entre las **16:14:23 y las 16:15:22**, aproximadamente un minuto. La página estática siguió respondiendo con código 200 en ese mismo lapso.

### 3.3 Inicio de sesión (`POST /api/login`, verificación de contraseña)

| Simultáneos | Completadas | Fallas reales | Solicitudes/s | Media | P95 | Máximo |
|---:|---:|---:|---:|---:|---:|---:|
| 10 | 938 | 0 | 15,6 | 640 ms | 987 ms | 1.357 ms |
| 50 | 975 | 0 | 16,2 | 3.080 ms | 4.579 ms | 6.725 ms |
| 100 | 960 | 0 | 16,0 | 6.254 ms | 9.434 ms | 12.780 ms |
| 250 | 953 | 0 | 15,9 | 15.757 ms | 21.206 ms | 38.563 ms |
| 500 | 953 | 0 | 15,8 | 31.562 ms | 34.846 ms | 48.643 ms |
| **1000** | 139.252 | **143.409** | — | 431 ms | 250 ms | **57.972 ms** |

- **El inicio de sesión es la ruta más débil: un techo de unas 16 solicitudes por segundo.** Es el costo de verificar la contraseña de forma segura.
- No se registraron fallas de 10 a 500 simultáneos, pero el servicio se vuelve inutilizable mucho antes de fallar: **con 500 inicios de sesión simultáneos, cada uno tarda unos 31 segundos de promedio** (hasta 48 segundos).
- **A 1000 simultáneos colapsa:** 143.409 fallas y Nginx registró de forma repetida el error `768 worker_connections are not enough` (agotó su límite de conexiones simultáneas).

---

<br>

## 4. Comportamiento durante el colapso y recuperación

- **Los contenedores nunca se cayeron.** Al finalizar, la API y MySQL seguían activos (`Up`), y MySQL, `healthy`. El colapso ocurrió en la capa de conexiones (procesos de Apache y conexiones de Nginx), no por caída de los servicios.
- **No hubo falta de memoria.** El registro del kernel no muestra ninguna intervención por memoria agotada (`memoria-kernel.txt` quedó vacío). Durante las pruebas, el contenedor de la API no superó los ~50 MiB y el de MySQL se mantuvo en ~485 MiB, de los 3,8 GiB disponibles. El límite fue la CPU (2 núcleos) y la cantidad de procesos, no la memoria.
- **El cuello de botella es la CPU y el número de procesos.** Las lecturas de CPU de `docker stats` quedaron por debajo del 10 %, un valor que no refleja la carga real: el promedio de carga del sistema (`load average`) llegó a 22,8, muy por encima de los 2 núcleos. Las lecturas de `docker stats` no se consideran representativas y no se usan como medida.
- **Pérdida de la sesión durante la prueba.** Durante los escalones de inicio de sesión, la conexión SSH interactiva se cortó (la CPU estaba saturada) y el monitoreo automático dejó de registrar a las 16:16:45. El escalón de 1000 simultáneos del inicio de sesión quedó registrado recién a las 18:44, tras reconectarse al servidor.
- **Recuperación.** El servidor volvió a estar accesible por SSH y la página y la API respondieron con normalidad una vez retirada la carga. No fue necesario reiniciar los contenedores manualmente para la navegación normal.

---

<br>

## 5. Defectos

### 5.1 Estado de los defectos anteriores

No se revisaron en esta ronda, que se limitó al rendimiento y la carga.

### 5.2 Defectos nuevos

Durante el recorrido de todas las pantallas para elaborar el `Manual de Usuario.md` (31/10/2026, sitio `http://192.168.1.9`, usuarios de prueba de los tres roles, sin modificar datos), se detectaron dos defectos en el panel del alumno (DEF-12 y DEF-13) que no corresponden a la prueba de carga, pero se registran en este documento por ser la ronda de pruebas vigente. DEF-11 surge de la prueba de carga del inicio de sesión.

| ID | Caso | Descripción | Severidad | Estado | Referencia |
|---|---|---|---|---|---|
| DEF-11 | Sección 3.3 | No hay límite de intentos de inicio de sesión (el `RateLimiter` existe pero no está conectado). La prueba de carga del login llegó al límite del servidor sin que nada la frenara | Media (seguridad) | Abierto | `Mecanismos_Autenticacion_Criptografia_INAU.md`, sección 9 |
| DEF-12 | Revisión complementaria (31/10/2026) | La tarjeta "Mi asistencia en este taller" muestra "Promedio: Pendiente de integrar", aunque la asistencia real ya se obtiene de la API. En **Mi Asistencia**, la misma alumna muestra 50 % de asistencia, con sus registros reales | Baja | Abierto | `frontend-alumno/detalle-taller.html` |
| DEF-13 | Revisión complementaria (31/10/2026) | La tarea "Primera página web" figura como "Sin consultar", aunque la alumna ya la entregó y está corregida con nota 9. En **Mis Tareas** y en el detalle de la tarea, la misma tarea figura como "Corregida", con nota 9 | Media | Abierto | `frontend-alumno/detalle-taller.html` |

---

<br>

## 6. Resumen de resultados

| Ruta | Techo de rendimiento | Primeras fallas | Colapso |
|---|---|---|---|
| Página estática (Nginx) | ~3.700 solicitudes/s | 2000 simultáneos | 5000 simultáneos |
| API con sesión (PHP + MySQL) | ~136 solicitudes/s | 1000 simultáneos | 1000 simultáneos |
| Inicio de sesión | ~16 solicitudes/s | 1000 simultáneos | 1000 simultáneos |

**Evaluación de los requerimientos:**

| Requerimiento | Resultado | Fundamento |
|---|---|---|
| NRF03 — Responder con rapidez en las operaciones habituales | Cumplido | Con un solo usuario, todas las rutas respondieron en menos de medio segundo (sección 2). Bajo carga, la API mantiene tiempos menores a un segundo hasta 100 usuarios simultáneos (sección 3.2). |
| NRF02 — Disponibilidad las 24 horas una vez desplegado | No verificable con esta prueba | La prueba mide la resistencia a la carga, no la disponibilidad continua. Ningún servicio se cayó durante el colapso, pero los contenedores no se reinician solos tras un reinicio del servidor (`Hardening de Infraestructura y Contenedores.md`, H-04). |

**Criterios:** el criterio de colapso se define en la sección 1. Los requerimientos se evalúan como *Cumplido* o *No verificable con esta prueba*, según el fundamento indicado.

**Conclusión.** El sistema responde de forma rápida con un solo usuario (menos de medio segundo en todas las rutas). Bajo carga, la página estática resiste bien (1000 usuarios simultáneos sin fallas). La API tiene un techo de unas 136 solicitudes por segundo y el inicio de sesión, de unas 16, que es el límite más bajo del sistema. Para un uso previsto de decenas de usuarios de talleres en convenio, estos límites son holgados; serían un problema solo ante cientos de inicios de sesión en el mismo instante. Ninguno de los componentes llegó a caerse ni a quedarse sin memoria: el límite es la capacidad de CPU y la cantidad de procesos del servidor de prueba.

**Observaciones de la ejecución:**
- Nginx agota sus conexiones (`768 worker_connections`) bajo carga alta; es un parámetro ajustable si se quisiera mayor capacidad (antes registrado como OBS-01, severidad baja).

**No ejecutado:** la verificación de NRF02 (disponibilidad las 24 horas), que no puede comprobarse con una prueba de carga.

**Limitaciones:** la herramienta de carga se ejecutó en el mismo servidor, por lo que compitió por la CPU con los servicios medidos (el rendimiento real de los servicios, por sí solos, sería algo mayor); el tiempo de respuesta de la sección 2 se midió por Wi-Fi e incluye la red local; las lecturas de CPU por contenedor no fueron representativas (la saturación se infiere del promedio de carga del sistema). Se usaron los datos de prueba del script, no datos reales de INAU.

**Datos del servidor de prueba:** esta ronda no creó ni modificó registros, las rutas probadas solo consultan datos o inician sesión, y la revisión complementaria se hizo sin modificar datos.

**Documentos relacionados:** `Testing-01.md`, `Testing-02.md`, `Mecanismos_Autenticacion_Criptografia_INAU.md`, `Hardening de Infraestructura y Contenedores.md` y `requerimientos.md` (NRF02 y NRF03).