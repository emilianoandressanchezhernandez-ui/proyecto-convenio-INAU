# Registro de pruebas 06 — Verificación de las correcciones de prioridad media, del hardening y prueba completa del sistema

<br>

## Sistema de Gestión de Talleres en Convenio con INAU — TheNewfutures

> **Qué es este documento.** Sexta ronda de pruebas. Verifica las correcciones de prioridad media y del hardening, e incluye una prueba completa del sistema con los tres roles.

---

<br>

## 1. Alcance y entorno

| Elemento | Valor |
|---|---|
| Fecha de ejecución | Correcciones: del 02/11/2026 al 04/11/2026. Prueba completa: 04/11/2026, hasta las 12:35. Verificación de CP-38: 04/11/2026, 14:01 |
| Rama / commit | `cambios-frontend` / `b992ac2`, `3d32378`, `a9179fa`, `1ff8170` y `0ebc5ed` (DEF-10, DEF-12 y DEF-13); `ce23286` (DEF-07); `25c453f` (DEF-09); `fbc9612` (H-01); `829d1ae` (H-02, H-03, H-04 y contraseñas de MySQL); `b6144d6` (H-05); `2f35d21` (DEF-06); `222722c` (DEF-16); `ceff0a0` (retiro del inventario de datos sensibles, ver 2.8); `fe516e8` (detalle del alumno en el panel del administrador); `da3dc6b` (alumno en la ventana **Corregir**). La prueba completa se ejecutó sobre `fe516e8`, y CP-38, sobre `da3dc6b` |
| Servidor | Máquina virtual con Ubuntu Server en VirtualBox (`one-security-mark01`), API y MySQL 8.4 en Docker y frontend servido por Nginx. Se actualizó según el Paso 10 de `Documento de Reconstruccion - Servidor.md`; en los cambios del backend se reconstruyeron los contenedores con `docker compose up -d --build` |
| Sitio | `http://192.168.1.7` (red local). La dirección del servidor cambió durante el período (la asigna el router por DHCP) |
| Navegador | Google Chrome en Windows |
| Ejecutado por | Ejecución asistida por IA (Claude, mediante la extensión Claude en Chrome), supervisada por Gabriel Rendon (subcoordinador). Los inicios de sesión, los cambios de contraseña y los comandos del servidor los realizó el supervisor |

**Método.** Se verifican las correcciones de los defectos de prioridad media que seguían abiertos después de `Testing-05.md` y las de los hallazgos de `Hardening de Infraestructura y Contenedores.md`, y se deja constancia de que DEF-02 se posterga. La prueba completa con los tres roles sirve además como regresión de las correcciones de `Testing-05.md`. Cada corrección se revisó en el código al subirse al repositorio y se probó en el servidor durante la prueba completa del 04/11/2026: en la interfaz y con peticiones directas a la API desde la sesión del navegador. Como en `Testing-05.md`, las descargas se verificaron hasta el último paso (petición a la API, tipo y tamaño del archivo recibido y nombre con el que se guardaría), interceptando el clic final para no guardar archivos en el equipo. Las validaciones del cambio de contraseña se probaron con **valores inventados**, por lo que ninguna contraseña cambió durante las pruebas. Los casos que modifican datos se revirtieron al terminar. Los resultados se registran tal como los devolvió el sistema. `Testing-01.md` a `Testing-05.md` se conservan sin cambios.

**Datos de prueba** (las contraseñas no se publican):

| Rol o registro | Usuario | Uso en esta ronda |
|---|---|---|
| Administrador | carlos.perez@inau.gov.uy | Cambio de contraseña (CP-12); cédula repetida (CP-17); datos personales (CP-25 a CP-27); recorrido del panel (CP-29 a CP-31) |
| Tallerista | martin.rodriguez@ejemplo.com | Cambio de contraseña (CP-12); eliminar una nota (CP-14); material con adjuntos (CP-15); recorrido del panel (CP-32 a CP-34); alumno en la ventana **Corregir** (CP-38) |
| Alumno | sofia.pereira@email.com | Detalle del taller, tareas y asistencia (CP-01 a CP-07); cambio de contraseña y perfil (CP-08 a CP-11 y CP-13); acceso a datos ajenos (CP-35) |
| Tareas "T4 Tarea de prueba" (id 4) y "T4 Tarea entrega JPG" (id 7), creadas en `Testing-04.md` | — | Archivos de la consigna (CP-04 a CP-07) |

---

<br>

## 2. Verificación de las correcciones

### 2.1 DEF-12 y DEF-13 — Detalle del taller del alumno

| ID | Caso | Resultado obtenido | Estado |
|---|---|---|---|
| CP-01 | Como Sofía, abrir el detalle de "Programación Web" y revisar "Mi asistencia en este taller" (DEF-12) | Muestra **33 %**, calculado con `/mis-asistencias`, en lugar de "Pendiente de integrar". Coincide con **Mi Asistencia**: tres registros (Presente el 14/08/2026, Tardanza el 26/10/2026 y Justificado el 01/11/2026), con 1 presente y 0 ausencias. Solo el presente cuenta para el porcentaje | Aprobado |
| CP-02 | Revisar el estado de las tareas en el mismo detalle (DEF-13) | Cada tarea consulta `/contenidos/{id}/mi-entrega`. Las tres figuran **Corregida**, con sus notas (7, 9 y 9), en lugar de "Sin consultar". **Mis Tareas** muestra las mismas tres tareas como "Corregida" | Aprobado |
| CP-03 | Revisar el inicio del panel del alumno | 2 talleres, 0 tareas pendientes y 33 % de asistencia | Aprobado |

### 2.2 DEF-16 — Archivos de la consigna para el alumno

| ID | Caso | Resultado obtenido | Estado |
|---|---|---|---|
| CP-04 | En el detalle del taller, revisar la tarea "T4 Tarea de prueba", que tiene archivos adjuntos | Muestra la línea "Archivos de la consigna: imagen.jpg, consigna.pdf" | Aprobado |
| CP-05 | Abrir la tarea y descargar los archivos de la consigna | Se descargan `imagen.jpg` (`image/jpeg`, 771 bytes) y `consigna.pdf` (`application/pdf`, 69 bytes) | Aprobado |
| CP-06 | En la misma tarea, revisar la entrega propia | Se descarga `mi-entrega-t4.pdf`. Se muestran la nota 9 y el comentario del tallerista. El formulario de entrega está bloqueado, porque la tarea ya está corregida | Aprobado |
| CP-07 | Abrir "T4 Tarea entrega JPG", que no tiene archivos en la consigna | El bloque "Archivos de la consigna" (`bloque-archivos-tarea`) queda oculto | Aprobado |

### 2.3 DEF-10 — Cambio de contraseña del tallerista y del alumno

| ID | Caso | Resultado obtenido | Estado |
|---|---|---|---|
| CP-08 | En **Mi Perfil** del alumno, con los tres campos vacíos, presionar **Cambiar contraseña** | "Completá los tres campos de contraseña." No se envía la petición | Aprobado |
| CP-09 | Nueva contraseña y confirmación distintas | "Las contraseñas nuevas no coinciden." No se envía la petición | Aprobado |
| CP-10 | Nueva contraseña de 3 caracteres | "La nueva contraseña debe tener al menos 8 caracteres." No se envía la petición | Aprobado |
| CP-11 | Contraseña actual incorrecta, con una nueva válida | La API rechaza el cambio y la pantalla muestra "La contraseña actual es incorrecta." La contraseña no cambió | Aprobado |
| CP-12 | Repetir CP-08 a CP-11 en **Mi Perfil** del tallerista (Martín) y del administrador (Carlos) | Mismos mensajes en los dos perfiles | Aprobado |
| CP-13 | Presionar **Guardar cambios** en el perfil del alumno | "Los datos de contacto se guardaron correctamente." La sesión sigue activa | Aprobado |

### 2.4 DEF-07 — Eliminar una nota

| ID | Caso | Resultado obtenido | Estado |
|---|---|---|---|
| CP-14 | Como Martín, abrir **Corregir** en una entrega con nota y presionar **Eliminar nota** | La nota se elimina y la entrega queda sin nota. El botón solo aparece cuando la entrega tiene nota. La nota se volvió a cargar a continuación (9) | Aprobado |

### 2.5 DEF-06 — Adjuntar archivos al material

| ID | Caso | Resultado obtenido | Estado |
|---|---|---|---|
| CP-15 | Como Martín, crear un material con un archivo `.xlsx` | La pantalla rechaza el archivo antes de enviarlo: solo admite PDF e imágenes JPG, de hasta 10 MB. No se creó el material | Aprobado |
| CP-16 | Revisar en el código la subida de archivos permitidos | `material.js` valida el tipo, que el archivo no esté vacío y el tamaño. Después de crear el material, sube cada archivo con `subirAdjuntoMaterialAPI()` | Aprobado |

### 2.6 DEF-09 — Cédula repetida en otro formato

| ID | Caso | Resultado obtenido | Estado |
|---|---|---|---|
| CP-17 | Como administrador, crear un alumno con la cédula "51234567" (Sofía tiene "5.123.456-7") | **409**: la cédula se reconoce como ya registrada. En `Testing-04.md` (CP-05), el mismo caso había creado un alumno duplicado | Aprobado |
| CP-18 | Revisar en el código el caso de los talleristas | Los validadores de alumno y de tallerista normalizan la cédula al formato X.XXX.XXX-X con `normalizarCedula()`. Los servicios la normalizan antes de comparar y de guardar, y los repositorios comparan solo los dígitos. En el servidor no se creó un tallerista, porque requiere ingresar una contraseña | Aprobado (verificado en el código) |

### 2.7 Hardening de infraestructura

| ID | Hallazgo | Resultado obtenido | Estado |
|---|---|---|---|
| CP-19 | H-01: puertos de la API y de MySQL | `compose.yaml` publica por defecto `127.0.0.1:8002` y `127.0.0.1:3308`, y las plantillas `.env.example` y `.env.docker.example` traen los mismos valores (commit `fbc9612`). En el servidor, desde el navegador de otra computadora: `http://192.168.1.7:8002` y `:3308` no respondieron en 4 segundos; el puerto 80 respondió en 2 ms | Aprobado |
| CP-20 | H-02: datos internos de los adjuntos | Las respuestas de adjuntos ya no incluyen `ruta` ni `nombre_archivo`. Por ejemplo, `/api/contenidos/4/adjuntos` devuelve `id`, `contenido_id`, `entrega_id`, `nombre_original`, `tipo_mime`, `tamano_bytes` y `fecha_subida`. Las descargas siguieron funcionando (CP-05, CP-06 y CP-32) | Aprobado |
| CP-21 | H-03: reglas del `.gitignore` | Las reglas apuntan a `backend/api-completa/uploads/` y `backend/api-completa/storage/uploads/`, que coinciden con la carpeta real (commit `829d1ae`) | Aprobado (verificado en el código) |
| CP-22 | H-04: reinicio de los contenedores | `compose.yaml` define `restart: unless-stopped` en los dos servicios. Después de reiniciar el servidor, la API y la base volvieron a funcionar sin ejecutar `docker compose up -d`. El supervisor comprobó la conexión a la base y la página | Aprobado |
| CP-23 | H-05: versión de los servicios | Las respuestas de la página y de la API muestran `Server: nginx`, sin número de versión, y no incluyen `X-Powered-By`. El `Dockerfile` cambia `ServerTokens` a `Prod`, `ServerSignature` a `Off` y define `expose_php = Off` (commit `b6144d6`) | Aprobado |
| CP-24 | Contraseñas de MySQL | `compose.yaml` exige `DB_PASSWORD` y `MYSQL_ROOT_PASSWORD`, igual que `SECRET_KEY` (`${VAR:?mensaje}`), y ya no usa valores de demostración como alternativa. Las plantillas las marcan como obligatorias | Aprobado (verificado en el código) |

### 2.8 DEF-03 y DEF-04 — Listados e información personal (RF19, RF22 y RF24)

| ID | Caso | Resultado obtenido | Estado |
|---|---|---|---|
| CP-25 | Consultar los datos personales de un alumno como administrador (RF24) | **Primera ejecución: parcial.** El detalle del alumno no mostraba la dirección, el referente adulto ni el centro de referencia, aunque la API los devuelve. Corregido en el commit `fe516e8`. **Repetición: aprobada.** El detalle muestra los tres datos después del correo | Aprobado |
| CP-26 | Consultar los datos de los talleristas como administrador (RF24) | El panel **Talleristas** muestra el listado y el detalle de cada tallerista, con sus datos personales y su último acceso | Aprobado |
| CP-27 | Listado de alumnos (RF19) e informe de talleristas (RF22) | El panel **Alumnos** muestra el listado completo, con búsqueda. El panel **Talleristas** cumple la función del informe de talleristas | Aprobado |
| CP-28 | Comprobar el retiro del inventario de datos sensibles | Entre el 03/11 y el 04/11 se construyó una pantalla de inventario de datos sensibles, que se retiró porque los paneles ya cumplían RF24 (commit `ceff0a0`; el código volvió al estado de `222722c`). En el servidor, la página y la ruta de la API responden 404 | Aprobado |

### 2.9 DEF-02 — Exportación de informes (RF13)

No se probó. El equipo decidió postergar la exportación a PDF y Excel, porque requiere cambios en el código y se prefirió no entregar una función mal integrada. Los botones de exportación siguen descargando JSON. La decisión se registra en `Control de Cambios.md`.

### 2.10 Alumno vacío en la ventana Corregir (observación de `Testing-05.md`)

| ID | Caso | Resultado obtenido | Estado |
|---|---|---|---|
| CP-38 | Como Martín, abrir **Corregir** en las entregas de "T4 Tarea entrega JPG" y de "T4 Tarea de prueba", y cerrar la ventana sin guardar | El campo "Alumno:" muestra "Sofía Pereira" en las dos entregas, junto con el archivo entregado (`entrega-foto.jpg` y `mi-entrega-t4.pdf`) y la nota (7 y 9). El nombre se toma de la misma lista de alumnos del taller que usa la tabla de entregas. No se modificó ninguna nota | Aprobado |

---

<br>

## 3. Prueba completa del sistema (regresión)

| ID | Rol | Caso | Resultado obtenido | Estado |
|---|---|---|---|---|
| CP-29 | Administrador | Recorrer el panel | Inicio, Alumnos (listado y búsqueda), Talleristas, Talleres, Asistencias, Reportes (creación, validaciones y detalle) y Mi Perfil cargan y funcionan | Aprobado |
| CP-30 | Administrador | Error de base de datos (Revisión 4.7) | 500 con el mensaje genérico, sin el texto de MySQL | Aprobado |
| CP-31 | Administrador | Límite de intentos de inicio de sesión (DEF-11) | Después de cinco intentos fallidos con un correo inexistente, la API responde 429 | Aprobado |
| CP-32 | Tallerista | Archivo entregado en la pantalla de corrección (DEF-15) | Se descarga desde la columna **Archivo** de la tabla y desde la ventana **Corregir** | Aprobado |
| CP-33 | Tallerista | Informes | Solo ve los informes de su taller. Pedir el de otro taller responde 403 | Aprobado |
| CP-34 | Tallerista | Crear y eliminar una tarea | La tarea de prueba se creó y se eliminó sin errores | Aprobado |
| CP-35 | Alumno | Acceso a datos ajenos | 403 en `/alumnos`, `/talleristas`, `/mis-reportes`, `/contenidos/4/entregas`, el taller 3, la entrega 2 y sus adjuntos (de otro alumno). 200 en sus propias entregas 1, 3 y 4 | Aprobado |
| CP-36 | Alumno | Detalle del taller | Muestra a los talleristas María López y Martín Rodríguez, la asistencia y las tareas (CP-01 y CP-02) | Aprobado |
| CP-37 | Todos | Permisos por rol | Cada rol recibe 403 en las rutas de los otros roles | Aprobado |

---

<br>

## 4. Defectos

### 4.1 Estado de los defectos anteriores

| ID | Descripción | Estado tras esta ronda |
|---|---|---|
| DEF-02 | Exportación de informes en JSON (RF13) | **Postergado** (sección 2.9) |
| DEF-03 | Sin listado de alumnos ni informe de talleristas (RF19, RF22) | **Cerrado**: lo cumplen los paneles Alumnos y Talleristas (CP-27) |
| DEF-04 | Sin consulta de datos sensibles (RF24) | **Cerrado**: lo cumplen los detalles de alumnos y talleristas (CP-25 y CP-26) |
| DEF-06 | El tallerista no puede adjuntar archivos al material | **Corregido** (CP-15 y CP-16) |
| DEF-07 | La interfaz no permite eliminar una nota | **Corregido** (CP-14) |
| DEF-08 | Falta el archivo del adjunto de ejemplo | **Abierto**: al descargar "guia-html.pdf", aparece "Este archivo todavía no está disponible en el servidor." Es un dato de prueba, no un error del código |
| DEF-09 | Cédula repetida en otro formato | **Corregido** (CP-17 y CP-18) |
| DEF-10 | El tallerista y el alumno no pueden cambiar su contraseña en la interfaz | **Corregido** (CP-08 a CP-13) |
| DEF-12 | "Pendiente de integrar" en el detalle del taller del alumno | **Corregido** (CP-01) |
| DEF-13 | Estado "Sin consultar" en tareas entregadas o corregidas | **Corregido** (CP-02) |
| DEF-16 | Los archivos de la tarea no se muestran al alumno | **Corregido** (CP-04 a CP-07) |
| Observación de `Testing-05.md` | El campo "Alumno:" aparece vacío en la ventana **Corregir** | **Corregido** (CP-38) |
| H-01 a H-05 | Hallazgos de hardening | **Corregidos** (CP-19 a CP-23) |

Los defectos DEF-11, DEF-14 y DEF-15, y los de la Revisión 4.7 y de Mecanismos 4.5, se corrigieron en `Testing-04.md` y `Testing-05.md`, y se mantienen correctos (CP-30 a CP-32).

### 4.2 Defectos nuevos

| ID | Caso | Descripción | Severidad | Estado | Referencia |
|---|---|---|---|---|---|
| DEF-17 | CP-29 | En las tablas del panel del administrador, el texto de los encabezados es blanco sobre fondo blanco y no se lee. La regla `.table thead th` define el color del texto, pero Bootstrap pinta el fondo de las celdas | Baja | Abierto | `frontend-admin/css/styles.css`, línea 279 |

---

<br>

## 5. Resumen de resultados

| Área | Casos | Aprobados | Parciales | Fallidos | No ejecutados |
|---|---:|---:|---:|---:|---:|
| DEF-12 y DEF-13 | 3 | 3 | 0 | 0 | 0 |
| DEF-16 | 4 | 4 | 0 | 0 | 0 |
| DEF-10 | 6 | 6 | 0 | 0 | 0 |
| DEF-07 | 1 | 1 | 0 | 0 | 0 |
| DEF-06 | 2 | 2 | 0 | 0 | 0 |
| DEF-09 | 2 | 2 | 0 | 0 | 0 |
| Hardening | 6 | 6 | 0 | 0 | 0 |
| DEF-03 y DEF-04 | 4 | 4 | 0 | 0 | 0 |
| Prueba completa | 9 | 9 | 0 | 0 | 0 |
| Alumno en la ventana Corregir | 1 | 1 | 0 | 0 | 0 |
| **Total** | **38** | **38** | **0** | **0** | **0** |

**Criterios:** iguales a los de `Testing-01.md`. CP-25 se registra con el resultado de su repetición; la primera ejecución se describe en el propio caso. CP-18, CP-21 y CP-24 se verificaron en el código.

**Conclusión.** Los defectos de prioridad media están corregidos, salvo DEF-02, que se posterga, y DEF-08, que corresponde a un dato de prueba. El alumno ve su asistencia real, el estado de sus tareas y los archivos de la consigna. El tallerista puede adjuntar archivos al material, eliminar notas y ve el nombre del alumno en la ventana **Corregir**. Los tres roles pueden cambiar su contraseña. Una cédula ya registrada se detecta aunque se escriba en otro formato. Los hallazgos de hardening están corregidos. La prueba completa no encontró fallos en las funciones de los tres roles ni en el control de acceso. El único defecto nuevo es visual (DEF-17).

**Observaciones de la ejecución:**
- **Tallerista "Sin asignar":** en **Asistencias** del administrador, el taller "Taller T4", que ya finalizó, muestra el tallerista como "Sin asignar".
- **Horas en UTC:** el último acceso de los talleristas y otras fechas con hora se muestran en UTC, tres horas adelantadas respecto de la hora de Uruguay.
- **Caché del navegador:** después de actualizar el frontend en el servidor, el navegador mostró la versión anterior de una página hasta recargarla con Ctrl+Shift+R.
- **Dirección del servidor:** cambió de `192.168.1.5` a `192.168.1.9` y luego a `192.168.1.7`, porque la asigna el router. Para un uso estable conviene fijarla.

**No ejecutado:**
- La creación de un tallerista con cédula repetida en el servidor, porque requiere ingresar una contraseña; se verificó en el código (CP-18). Queda pendiente que el supervisor la pruebe.
- Un cambio de contraseña exitoso del alumno y del tallerista durante la prueba asistida, porque requiere ingresar la contraseña real. El supervisor cambió después la contraseña de Sofía desde su perfil, y el cambio funcionó.

**Limitaciones:** pruebas manuales y asistidas, sin pruebas automatizadas; un solo navegador; datos de prueba, no datos reales de INAU.

**Datos del servidor de prueba:** esta ronda no dejó registros nuevos. La tarea de prueba de CP-34 se eliminó y la nota de CP-14 se restauró a 9. La contraseña de Sofía se cambió después de la prueba. La de Carlos se cambió en `Testing-05.md` (CP-10) y debe restaurarse a su valor original. Los demás datos de prueba son los que lista `Testing-04.md`.

**Documentos relacionados:** `Testing-01.md` a `Testing-05.md`, `requerimientos.md`, `Control de Cambios.md`, `api.md`, `Documento de Reconstruccion - Servidor.md`, `Hardening de Infraestructura y Contenedores.md`, `Doc NMAP.md` y `Revision_Coherencia_INAU.md`.