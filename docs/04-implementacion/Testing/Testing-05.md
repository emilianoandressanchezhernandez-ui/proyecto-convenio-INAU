# Registro de pruebas 05 — Verificación de las correcciones de alta prioridad

<br>

## Sistema de Gestión de Talleres en Convenio con INAU — TheNewfutures

> **Qué es este documento.** Registra la quinta ronda de pruebas, que verifica las correcciones de los defectos de alta prioridad que quedaron abiertos en `Testing-04.md`: el enlace al archivo entregado en la pantalla de corrección (DEF-15), el límite de intentos de inicio de sesión (DEF-11), el cierre de las sesiones abiertas al cambiar la contraseña (`Mecanismos_Autenticacion_Criptografia_INAU.md`, sección 4.5) y la filtración de errores internos de la API (Revisión de Coherencia 4.7). Incluye además una regresión de las rutas principales, para comprobar que los cambios no afectaron el resto del sistema. Los resultados se registran tal como los devolvió el sistema. `Testing-01.md` a `Testing-04.md` se conservan sin cambios.

---

<br>

## 1. Alcance y entorno

| Elemento | Valor |
|---|---|
| Fechas de ejecución | 01/11/2026 (21:50 a 23:50) y 02/11/2026 (12:28 a 12:42) |
| Rama | `cambios-frontend` |
| Commits verificados | `767ba3e` y `feae87b` (DEF-15), `52743cc` (DEF-11), `e039725` (sesiones), `bb7a254`, `43f0e87`, `9c7647a`, `2da95d9` y `616421b` (Revisión 4.7). Las pruebas en el servidor se ejecutaron sobre `2da95d9`; el commit `616421b` se verificó en el código |
| Servidor | Máquina virtual con Ubuntu Server en VirtualBox (`one-security-mark01`), API y MySQL 8.4 en Docker, frontend servido por Nginx. Actualizado después de cada corrección según el Paso 10 de `Documento de Reconstruccion - Servidor.md`; en los cambios del backend, con `docker compose up -d --build` y revisión de sintaxis (`php -l`) dentro del contenedor |
| Sitio | `http://192.168.1.5` (red local) |
| Navegador | Google Chrome en Windows; ventana de incógnito para las pruebas con dos sesiones simultáneas |
| Ejecutado por | Ejecución asistida por IA (Claude, mediante la extensión Claude en Chrome), supervisada por Gabriel Rendon (subcoordinador). Los inicios de sesión, el cambio de contraseña y los comandos del servidor los realizó el supervisor |

**Método.** Cada corrección se probó en la interfaz y con peticiones directas a la API desde la sesión del navegador. Para no guardar archivos en el equipo, las descargas se verificaron hasta el último paso (petición a la API, tipo y tamaño del archivo recibido y nombre con el que se guardaría), interceptando el clic final. Las pruebas de límite de intentos usaron **correos inexistentes** (`def11.prueba.*@example.com`, `def11.final.*@example.com`) para no bloquear cuentas reales. Las pruebas que provocan errores de base de datos usaron datos que la base rechaza, por lo que no crearon ni modificaron registros.

---

<br>

## 2. Verificación de las correcciones

### 2.1 DEF-15 — Archivo entregado en la pantalla de corrección

| ID | Caso | Resultado obtenido | Estado |
|---|---|---|---|
| CP-01 | Como Martín, abrir **Ver Entregas** de "T4 Tarea entrega JPG" y hacer clic en el archivo de la columna **Archivo** | "entrega-foto.jpg" se muestra como enlace. La pantalla pide `/api/adjuntos/7/archivo` (200), recibe `image/jpeg` de 786 bytes y lo descarga como `entrega-foto.jpg` | Aprobado |
| CP-02 | Abrir **Corregir** y hacer clic en "Archivo entregado" | **Primera ejecución (01/11, commit `767ba3e`): fallida.** El nombre seguía como texto, porque el código anterior quedó en el archivo y reescribía el enlace. Corregido en el commit `feae87b`. **Repetición (01/11 y 02/11): aprobada.** El nombre se muestra como enlace y descarga el mismo JPG de 786 bytes | Aprobado |
| CP-03 | En "Primera página web", hacer clic en el adjunto de ejemplo, que no tiene archivo en el servidor (DEF-08) | Aparece la alerta "Este archivo no está disponible en el servidor." y no se descarga nada | Aprobado |

### 2.2 DEF-11 — Límite de intentos de inicio de sesión

| ID | Caso | Resultado obtenido | Estado |
|---|---|---|---|
| CP-04 | Pedir cualquier ruta de la API | Las respuestas incluyen `X-RateLimit-Limit: 300` y `X-RateLimit-Remaining` | Aprobado |
| CP-05 | Seis intentos de inicio de sesión con contraseña incorrecta para un mismo correo | Intentos 1 a 5: 401 "Correo o contraseña incorrectos.", con `X-RateLimit-Remaining` de 4 a 0. Intentos 6 y 7: **429** "Demasiados intentos de inicio de sesión. Esperá unos minutos e intentá de nuevo." Repetido el 02/11 después de la actualización, con el mismo resultado | Aprobado |
| CP-06 | Con el primer correo bloqueado, intentar con otro correo desde la misma IP; intentar con el primer correo en mayúsculas y con espacios | Otro correo: 401, con su propio contador (`Remaining: 4`). El mismo correo en mayúsculas y con espacios: 429 (se reconoce como el mismo correo) | Aprobado |
| CP-07 | Con un correo bloqueado desde el navegador, intentar con ese correo desde el propio servidor (`curl` a `http://localhost/api/login`) | **Primera ejecución (23:02): no concluyente**, porque el bloqueo del navegador ya había vencido. **Repetición:** se bloqueó un correo nuevo desde el navegador a las 23:03:10 y el supervisor repitió la consulta desde el servidor dentro del plazo; informó el resultado como correcto (contador propio del servidor). La salida de esa consulta no quedó registrada | Aprobado |
| CP-08 | Seguir intentando con el correo bloqueado | El bloqueo se mantuvo unos 5 minutos. Después se permitió **un** intento (401) y el siguiente volvió a responder 429, con `Retry-After: 284` | Aprobado |
| CP-09 | Enviar 320 pedidos seguidos a `/api/perfil` desde una sesión | Los primeros 311 respondieron 200 y los 9 siguientes **429** "Demasiadas peticiones. Espera unos segundos antes de intentar de nuevo." Al bajar el ritmo, la sesión volvió a responder 200. Que pasen 311 y no 300 se debe a la ventana deslizante, que reparte el conteo entre el minuto actual y el anterior | Aprobado |

### 2.3 Cierre de sesiones al cambiar la contraseña o desactivar al usuario

| ID | Caso | Resultado obtenido | Estado |
|---|---|---|---|
| CP-10 | Con dos sesiones de Carlos abiertas (pestaña normal y ventana de incógnito), cambiar la contraseña desde **Mi Perfil** en la ventana de incógnito | La sesión de la pestaña normal fue rechazada: 401 "Tu sesión ya no es válida. Iniciá sesión de nuevo." En el pedido siguiente respondió 401 "Tenes que iniciar sesion.", porque la API también borró la cookie | Aprobado |
| CP-11 | Seguir usando la sesión desde la que se cambió la contraseña | La sesión de la ventana de incógnito siguió abierta (comprobado por el supervisor) | Aprobado |
| CP-12 | Con Martín conectado en una ventana de incógnito, desactivarlo desde la sesión de Carlos (`PATCH /talleristas/3` con estado "Inactivo") | Al tocar una tarjeta, la sesión de Martín se cerró y no pudo volver a entrar. Martín se reactivó a continuación ("Activo") | Aprobado |
| CP-13 | Comprobar que los permisos por rol se mantienen con la nueva comprobación | El administrador recibe 403 en `/mis-asistencias` (solo alumnos) y el tallerista recibe 403 en `/talleristas` (solo administrador) | Aprobado |

### 2.4 Revisión 4.7 — Errores internos de la API

| ID | Caso | Resultado obtenido | Estado |
|---|---|---|---|
| CP-14 | Modificar "Taller T4" con un salón de 101 caracteres (la columna admite 100 y la validación no controla el largo) | **500** "Ocurrio un error interno con la base de datos.", sin el texto de MySQL ni nombres de columnas. Antes de la corrección, la misma operación respondía 400 con el error de MySQL. El taller no se modificó (el salón siguió siendo "Salón final") | Aprobado |
| CP-15 | Modificar "Taller T4" con un nombre de 151 caracteres | 500 con el mismo mensaje genérico | Aprobado |
| CP-16 | Crear un taller con un centro de 151 caracteres | 500 con el mismo mensaje genérico. No se creó ningún taller (3 antes y 3 después) | Aprobado |
| CP-17 | Comprobar la corrección en Contenidos, Entregas, Adjuntos y Reportes | No se encontró un dato que supere la validación y que la base rechace, por lo que se verificó en el código: Contenido tiene 5 `catch (PDOException)`, Entrega y Adjunto dejan pasar el `PDOException` en su método de manejo de errores, y Reporte tiene 3, en `store()`, `misReportes()` y `miReporte()`. En el commit `2da95d9` faltaba el de `miReporte()`; se agregó en el commit `616421b` (02/11), que no presenta errores de sintaxis (`php -l`) | Aprobado |
| CP-18 | Comprobar que los mensajes de negocio no cambiaron | Taller, contenido, entrega, adjunto, reporte (en las dos rutas), alumno y tallerista inexistentes: **404** con su mensaje ("Taller no encontrado.", "Entrega no encontrada.", etc.). Fechas invertidas en un taller y reporte sin tipo: **422** con su mensaje | Aprobado |

---

<br>

## 3. Regresión

| ID | Caso | Resultado obtenido | Estado |
|---|---|---|---|
| CP-19 | Rutas del administrador después de todos los cambios | `/perfil`, `/talleres`, `/talleres/3`, `/alumnos`, `/talleristas`, `/talleristas/3`, `/reportes`, `/mis-reportes`, `/talleres/1/contenidos`, `/talleres/1/alumnos`, `/talleres/1/talleristas`, `/talleres/1/asistencias`, `/contenidos/7/entregas` y `/entregas/1/adjuntos`: todas 200. El panel del administrador carga con normalidad | Aprobado |
| CP-20 | Ruta protegida sin sesión | `/talleres`: 401 "Tenes que iniciar sesion." | Aprobado |

---

<br>

## 4. Defectos

### 4.1 Estado de los defectos verificados

| ID | Descripción | Estado tras esta ronda |
|---|---|---|
| DEF-11 | Sin límite de intentos de inicio de sesión | **Corregido** (CP-04 a CP-09) |
| DEF-15 | El tallerista no puede abrir el archivo entregado desde la pantalla de corrección | **Corregido** (CP-01 a CP-03) |
| Mecanismos 4.5 | El cambio de contraseña no cierra las sesiones abiertas | **Corregido** (CP-10 y CP-11). La misma corrección cierra la sesión de un usuario desactivado (CP-12) |
| Revisión 4.7 | La API devuelve el detalle de los errores de base de datos | **Corregido** (CP-14 a CP-18) en los cinco controladores pendientes: Taller, Contenido, Entrega, Adjunto y Reporte |

Los demás defectos de `Testing-04.md` (DEF-02 a DEF-04, DEF-06 a DEF-10, DEF-12, DEF-13 y DEF-16) no formaron parte de esta ronda y siguen abiertos.

### 4.2 Defectos nuevos

No se encontraron defectos nuevos en las funciones verificadas. Los hallazgos menores se registran como observaciones en la sección 5.

---

<br>

## 5. Resumen de resultados

| Área | Casos | Aprobados | Parciales | Fallidos | No ejecutados |
|---|---:|---:|---:|---:|---:|
| DEF-15 | 3 | 3 | 0 | 0 | 0 |
| DEF-11 | 6 | 6 | 0 | 0 | 0 |
| Sesiones | 4 | 4 | 0 | 0 | 0 |
| Revisión 4.7 | 5 | 5 | 0 | 0 | 0 |
| Regresión | 2 | 2 | 0 | 0 | 0 |
| **Total** | **20** | **20** | **0** | **0** | **0** |

**Criterios:** iguales a los de `Testing-01.md`. Los casos CP-02 y CP-07 se registran con el resultado de su repetición; la primera ejecución se describe en el propio caso.

**Conclusión.** Los defectos de alta prioridad están corregidos. La pantalla de corrección permite descargar el archivo entregado; el inicio de sesión se bloquea después de cinco intentos fallidos, con un contador por correo y por IP; cambiar la contraseña o desactivar a un usuario cierra sus sesiones abiertas; y los errores de base de datos ya no llegan al navegador. Los cambios no afectaron las rutas principales ni los mensajes que ve el usuario.

**Observaciones de la ejecución:**
- **Tiempo de espera informado:** el primer 429 del inicio de sesión indica `Retry-After: 60`, pero el bloqueo real dura unos 5 minutos (CP-08). El mensaje que ve el usuario ("Esperá unos minutos") es correcto.
- **Alumno vacío en la corrección:** en la ventana **Corregir**, el campo "Alumno:" aparece vacío. El HTML tiene el espacio (`corregir-alumno`), pero el código de la pantalla no lo completa.
- **Volver a iniciar sesión:** al actualizar el servidor con la corrección de sesiones, todas las sesiones anteriores dejaron de ser válidas y los usuarios tuvieron que volver a entrar una vez.
- **Incidencia durante la actualización:** el commit `9c7647a` tenía un error de sintaxis en `ReporteController.php`. Lo detectó la revisión con `php -l` en el contenedor y se corrigió en el commit `2da95d9`. Mientras estuvo desplegado, la API no podía atender pedidos, porque `index.php` carga todos los controladores.
- **Contadores del límite:** se guardan en `storage/cache` dentro del contenedor, por lo que se reinician al reconstruir la imagen.
- **Pruebas de carga:** los valores de `Testing-03.md` corresponden a la API sin límite de pedidos. Con el límite actual, una misma IP recibe 429 a partir de unos 300 pedidos por minuto.
- **Cierre de sesión:** sigue sin invalidar en el servidor un token copiado antes del logout; se mantiene como limitación documentada en `Mecanismos_Autenticacion_Criptografia_INAU.md`.

**No ejecutado:**
- Que un inicio de sesión correcto reinicie el contador de intentos, porque requiere ingresar la contraseña real durante la prueba asistida.
- El error de base de datos en Contenidos, Entregas, Adjuntos y Reportes, porque no se encontró un dato que lo provoque sin alterar el servidor; se verificó en el código (CP-17).

**Limitaciones:** pruebas manuales y asistidas, sin pruebas automatizadas; un solo navegador, con una ventana de incógnito como segunda sesión; datos de prueba, no datos reales de INAU.

**Datos del servidor de prueba:** esta ronda no creó registros. Martín se desactivó y se reactivó en CP-12. La contraseña de Carlos se cambió en CP-10 y debe restaurarse a su valor original. Los demás datos de prueba son los que lista `Testing-04.md`.

**Documentos relacionados:** `Testing-01.md` a `Testing-04.md`, `requerimientos.md`, `api.md`, `Documento de Reconstruccion - Servidor.md`, `Mecanismos_Autenticacion_Criptografia_INAU.md`, `Hardening de Infraestructura y Contenedores.md` y `Revision_Coherencia_INAU.md`.