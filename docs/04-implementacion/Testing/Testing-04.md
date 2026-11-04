# Registro de pruebas 04 — Verificación completa

<br>

## Sistema de Gestión de Talleres en Convenio con INAU — TheNewfutures

> **Qué es este documento.** Registra la cuarta ronda de pruebas, ejecutada después de las correcciones de código del 01/11/2026. Tiene tres objetivos: verificar esas correcciones, repetir la prueba de todas las funciones de los tres roles (regresión completa) y cubrir lo que no se había probado en las rondas anteriores. Los resultados esperados se toman de los requerimientos (`requerimientos.md`); los obtenidos se registran tal como los devolvió el sistema. `Testing-01.md` a `Testing-03.md` se conservan sin cambios.

---

<br>

## 1. Alcance y entorno

| Elemento | Valor |
|---|---|
| Fecha de ejecución | 01/11/2026 |
| Rama / commit | `cambios-frontend` / `0e311a3` (incluye las correcciones del commit `46320c2` de `main`) |
| Servidor | Máquina virtual con Ubuntu Server en VirtualBox (`one-security-mark01`), API y MySQL 8.4 en Docker, frontend servido por Nginx. Actualizado el mismo día según el Paso 10 de `Documento de Reconstruccion - Servidor.md` (`git pull`, `docker compose up -d --build`, reemplazo de la dirección de la API y copia del frontend) |
| Sitio | `http://192.168.1.5` (red local) |
| Navegador | Google Chrome en Windows; vista de teléfono simulada con marcos de 375 px de ancho |
| Ejecutado por | Ejecución asistida por IA (Claude, mediante la extensión Claude en Chrome), supervisada por Gabriel Rendon (subcoordinador). Los comandos del servidor se ejecutaron por SSH |

<br>

**Método.** Cada función se probó por la interfaz y, además, con peticiones directas a la API desde la misma sesión del navegador, para comprobar que el servidor aplica las reglas aunque se omita la pantalla. Las pruebas que crean, modifican, desactivan o finalizan datos se hicieron sobre **registros creados para esta prueba**, para no alterar los datos de ejemplo:

<br>

| Registro de prueba | Uso |
|---|---|
| Tallerista "Tallerista Cuatro" (id 8, `tallerista.t4@example.com`) | Altas, ediciones, acceso a un taller ajeno, desactivación |
| Alumno "Alumno Cuatro" (id 7) | Altas, ediciones, inscripción, asistencia |
| Taller "Taller T4" (id 3) | Altas, asignaciones, asistencia, reportes, finalización |
| Tareas "T4 Tarea de prueba" (id 4) y "T4 Tarea entrega JPG" (id 7), en el taller 1 | Adjuntos, entregas en PDF y JPG, corrección |

Los usuarios de ejemplo (Carlos, Martín y Sofía) se usaron para iniciar sesión. Las contraseñas y los teléfonos que se modificaron durante las pruebas se restauraron a su valor original.

---

<br>

## 2. Verificación de las correcciones

| ID | Corrección | Caso | Resultado obtenido | Estado |
|---|---|---|---|---|
| CP-01 | Clave secreta obligatoria (Revisión 4.2) | Actualizar el servidor con el nuevo `compose.yaml` | Al actualizar, el `.env` del servidor **no tenía `SECRET_KEY`** (`grep -c '^SECRET_KEY=.\+' .env` → `0`): hasta ese momento, el servidor funcionaba con la clave por defecto publicada en el repositorio (DEF-14). Se generó una clave con `openssl rand -hex 32`; los contenedores se reconstruyeron y arrancaron (`Up`, base `healthy`); página 200 y API 401 desde el servidor. Que el sistema no arranque sin clave se verificó en el código (`${SECRET_KEY:?...}`), no en el servidor | Aprobado |
| CP-02 | Archivos subidos sin sesión (H-02) | Subir un PDF a un contenido y pedirlo por la ruta directa `/api/uploads/contenidos/<archivo>` con y sin sesión | Ruta directa: **403 con sesión y sin sesión**. Listado de `/api/uploads/` y `/api/uploads/contenidos/`: 403. Descarga oficial `/api/adjuntos/{id}/archivo`: 200 (`application/pdf`) con sesión y 401 sin sesión | Aprobado |
| CP-03 | Datos repetidos con código 409 | Crear un alumno con la cédula "5.123.456-7" (Sofía) y talleristas con el correo y la cédula de Martín | Alumno: 409 "Ya existe un alumno con esa cédula." Tallerista: 409 "Ya existe un usuario con ese correo." y 409 "Ya existe un usuario con esa cédula." | Aprobado |
| CP-04 | Mensajes de error sin detalles internos | Pedir recursos inexistentes (id 999999) de alumno, tallerista, taller, contenido, entrega, asistencia, reporte y adjunto | Los ocho respondieron 404 con un mensaje claro ("Alumno no encontrado.", "Taller no encontrado.", etc.), sin detalles de la base de datos | Aprobado |
| CP-05 | Cédula repetida en otro formato (DEF-09) | Crear un alumno con "51234567" (Sofía, "5.123.456-7") y un tallerista con "45678901" (Martín, "4.567.890-1") | **Ambos se crearon** (201): el alumno id 6 y el tallerista id 7 quedaron duplicados. El defecto sigue abierto y **afecta también a los talleristas** | Fallido |

---

<br>

## 3. Acceso y permisos

| ID | Requisito | Caso | Resultado obtenido | Estado |
|---|---|---|---|---|
| CP-06 | NRF07 | Llamar sin sesión a las 53 rutas protegidas de la API | Las 53 respondieron 401 "Tenes que iniciar sesion." Una ruta inexistente respondió 404 "No existe esa dirección, o no se puede usar con GET." | Aprobado |
| CP-07 | RF01 | Iniciar sesión con un correo inexistente, con una contraseña errónea, con `' OR '1'='1` en ambos campos y con el formulario vacío | Los tres primeros: 401 "Correo o contraseña incorrectos." (mismo mensaje). Vacío: 400 "Revisá los datos." ["Falta el correo.", "Falta la contraseña."]. El login correcto no devuelve el token en el cuerpo y el perfil no incluye el hash de la contraseña | Aprobado |
| CP-08 | NRF07 | Como tallerista, operar sobre un taller al que no está asignado (Martín sobre el taller 3; Tallerista Cuatro sobre el taller 1) | Ver el taller, sus contenidos, asistencias, alumnos y entregas; crear, editar o borrar contenido; poner notas; descargar adjuntos; registrar asistencia: **todo 403**, con mensajes como "No tienes permiso para gestionar el contenido de este taller." Sobre sus propios talleres: 200 | Aprobado |
| CP-09 | NRF07 | Como tallerista, usar rutas del administrador | `GET /alumnos`, `/talleristas`, `/talleres`, `/reportes` y `POST /reportes`: 403 "No tenes permisos para hacer esto." | Aprobado |
| CP-10 | NRF07 | Como alumna, usar rutas del administrador y del tallerista, y abrir pantallas de otros paneles | Diez rutas de administrador y tallerista: 403. Taller en el que no está inscripta: 403. Al abrir `frontend-tallerista/dashboard.html` y `frontend-admin/alumnos.html`, la interfaz redirigió al panel de la alumna, sin mostrar datos | Aprobado |
| CP-11 | NRF07 / NRF08 | Como alumna, acceder a la entrega de otro alumno (entrega 2, de Mateo) | Ver la entrega, sus adjuntos, descargar el archivo, borrarlo y subir un archivo: **todo 403**. Borrar el adjunto de un material: 403. Su propia entrega: 200 | Aprobado |
| CP-12 | RF12 | Como tallerista, consultar reportes de otros talleres | Martín solo ve el reporte de Programación Web; el General y el de Taller T4: 403 "No tienes permisos para consultar este reporte." Tallerista Cuatro solo ve el de Taller T4 | Aprobado |

---

<br>

## 4. Regresión funcional

### 4.1 Administrador

| ID | Requisito | Caso | Resultado obtenido | Estado |
|---|---|---|---|---|
| CP-13 | RF02 / NRF05 | Talleristas: alta, consulta, edición y validaciones | Alta 201. Contraseña corta, sin nombre y correo inválido: 422 con el mensaje del campo. Edición de teléfono y especialidad: 200, persistió. Teléfono "abc": 422 | Aprobado |
| CP-14 | RF02 / NRF05 | Alumnos: alta, edición y validaciones; intento de cambiar la cédula | Alta 201. Sin fecha de nacimiento, fecha "04/04/2011", correo inválido y estado "Borrado": 422 con el mensaje del campo. Edición de teléfono y observaciones: 200, persistió. Cambiar la cédula por la API: 200 "Alumno actualizado correctamente.", pero **la cédula no cambió** (la API la ignora sin avisar). En la interfaz, la cédula es de solo lectura | Aprobado |
| CP-15 | RF02 / NRF05 | Talleres: alta con horario, edición y validaciones | Alta 201, con el horario "Martes 10:00–12:00" guardado. Fechas invertidas, sin nombre, horario invertido y día inválido: 422 con el mensaje correspondiente. Edición de salón (API) y de descripción (interfaz): se guardaron | Aprobado |
| CP-16 | RF03 / RF25 | Asignar y quitar talleristas; inscribir y quitar alumnos | Asignar 201, repetido 409, inexistente 404, quitar 200, quitar de nuevo 409. Inscribir 201, repetido 409, inexistente 404. La lista del taller mostró al alumno inscripto | Aprobado |
| CP-17 | RF04 / RF05 | Asistencia: crear jornada, registrar, corregir y validar (API e interfaz) | Jornada 201; misma fecha 409; fecha mal escrita 422. Registro 200; estado inválido 422; alumno no inscripto 409; antes de la fecha de inscripción 409 "No se puede registrar asistencia antes de la fecha de inscripción del alumno." En la pantalla Asistencias, el filtro por taller mostró el registro y "Editar → Tardanza" lo modificó | Aprobado |
| CP-18 | RF11 / RF12 / RF13 | Reportes: generar General y de Asistencia, ver el detalle y exportar | Generación 201 (API e interfaz, "Reporte generado correctamente."). Tipo inválido, Asistencia sin taller y taller inexistente: 422, 422 y 404. Detalle con jornadas, registros, porcentaje y resumen por estado. **Exportar descarga un archivo `.json`** (`application/json`, 572 bytes), no PDF ni Excel | Parcial |
| CP-19 | RF02 | Pantallas de listado, búsqueda y panel principal | Panel: 5 talleristas, 7 alumnos, 3 talleres (coincide con la API). Búsquedas por nombre ("Cuatro") y por cédula ("4.222") mostraron solo el registro buscado. Detalle del taller con su tallerista, alumno y listas para agregar | Aprobado |
| CP-20 | RF14 | Perfil y contraseña del administrador | Cambiar `rol` o `cedula` desde el perfil: 400 "El campo '...' no se puede modificar desde el perfil." Teléfono inválido y correo inválido: 400. Teléfono válido: 200, restaurado. Contraseña: actual incorrecta 400, nueva corta 400, cambio válido 200; la anterior dejó de funcionar (401), la nueva funcionó; se restauró la original | Aprobado |

### 4.2 Tallerista

| ID | Requisito | Caso | Resultado obtenido | Estado |
|---|---|---|---|---|
| CP-21 | RF04 / RF05 | Pantalla de asistencia del taller 1: registrar y modificar | Fecha 01/11/2026, tres alumnos. Guardar: "Asistencia guardada correctamente. 3 registros guardados en MySQL." Al recargar, los estados se conservaron; el cambio a Justificado también. El panel mostró "1 presente del día" | Aprobado |
| CP-22 | RF06 / NRF05 | Material y tareas por la API: crear, editar y validar | Tarea con fecha límite 201. Sin título y tipo "Examen": 422. Edición con todos los campos: 200. La API acepta una tarea sin fecha límite y sin descripción (ver observaciones) | Aprobado |
| CP-23 | NRF11 / NRF12 | Adjuntar archivos a una tarea | PDF y JPG: 201. PNG, `.exe`, texto renombrado como `.pdf` y `.docx`: 422 "Solo se permiten archivos PDF o JPG." PDF de 10,5 MB: 422 "El archivo supera el tamaño permitido." | Aprobado |
| CP-24 | RF06 / RF16 | Material desde la interfaz: publicar y eliminar | Publicar: "Contenido publicado correctamente en MySQL." Tarea sin descripción ni fecha: no se guarda. Eliminar: confirmación del navegador y "Contenido eliminado correctamente." **El formulario no tiene campo para adjuntar archivos** | Parcial |
| CP-25 | RF09 / RF10 | Corregir y poner nota (API e interfaz) | Notas 0, 11, 8.5, "abc" y −1: 422 "La nota debe ser un número entero entre 1 y 10."; sin nota: 422. Comentario 200; nota 8 200, la entrega pasó a "Corregida". En la interfaz, nota 7 con comentario: "Corrección guardada correctamente en MySQL." y la fila pasó a "Con nota y comentario 7" | Aprobado |
| CP-26 | RF09 | Abrir el archivo entregado desde la pantalla de corrección | El nombre del archivo aparece como **texto sin enlace**, en la tabla y en la ventana de corrección; no hay forma de abrirlo desde la interfaz. Por la API, el archivo se descarga (200, `image/jpeg`) | Fallido |
| CP-27 | RF17 | Eliminar una nota | La interfaz no ofrece la opción. Por la API: 200 "Nota eliminada correctamente."; la entrega quedó sin nota, pero con estado "Corregida" | Parcial |
| CP-28 | RF12 / RF13 | Informes del tallerista y descarga | Lista solo el informe de su taller. "Descargar Informe" genera un archivo `.json` | Parcial |
| CP-29 | RF14 | Perfil del tallerista | Teléfono guardado ("Los cambios del perfil se guardaron correctamente.") y restaurado. **Los campos de contraseña siguen deshabilitados** | Parcial |

### 4.3 Alumno

| ID | Requisito | Caso | Resultado obtenido | Estado |
|---|---|---|---|---|
| CP-30 | RF05 | Consultar la asistencia | Mostró 01/11 Justificado, 26/10 Tardanza y 14/08 Presente (incluido el registro del día); 33 %, coincide con el panel principal | Aprobado |
| CP-31 | RF08 | Entregar una tarea con PDF y comentario desde la interfaz | "La entrega y el archivo se guardaron correctamente."; estado "Entregada", con archivo, fecha y comentario; el botón y el selector de archivo quedaron deshabilitados | Aprobado |
| CP-32 | RF08 / NRF11 | Entregar con JPG, subir un segundo archivo y volver a entregar | JPG: 201 (`image/jpeg`), descargable por su dueña. Segundo archivo: 400 "La entrega ya tiene un archivo adjunto." Reentregar una tarea: 400 "El alumno ya realizó una entrega para esta tarea." Entregar en un material: 400 | Aprobado |
| CP-33 | RF07 | Ver los archivos que el tallerista adjuntó a una tarea | La tarea 4 tiene "consigna.pdf" e "imagen.jpg" (la API los lista para la alumna), pero **no aparecen** en la pantalla de la tarea ni en el detalle del taller | Fallido |
| CP-34 | RF05 / RF07 | Detalle del taller del alumno | "Mi asistencia en este taller" muestra "Promedio: Pendiente de integrar" (DEF-12). Las tres tareas figuran "Sin consultar", aunque una está corregida y dos entregadas (DEF-13) | Fallido |
| CP-35 | RF07 / RF23* | Mis Tareas y panel principal | Estados correctos: Corregida (nota 9), Entregada y Entregada; el filtro "Corregida" muestra solo esa. Panel: 2 talleres, 0 tareas pendientes, 33 % | Aprobado |
| CP-36 | RF07 | Descargar el material de ejemplo "guia-html.pdf" | 404: el archivo no existe en el servidor (DEF-08) | Fallido |
| CP-37 | RF14 | Perfil del alumno | Teléfono guardado ("Los datos de contacto se guardaron correctamente.") y restaurado. Contraseña por la API: cambio, verificación y restauración correctos. **Los campos de contraseña de la interfaz siguen deshabilitados** | Parcial |

*RF23 (ver notas) está postergado; la nota se muestra igualmente en Mis Tareas.

---

<br>

## 5. Pruebas no realizadas en rondas anteriores

| ID | Requisito | Caso | Resultado obtenido | Estado |
|---|---|---|---|---|
| CP-38 | RF02 | Desactivar un tallerista y un alumno desde la interfaz | Confirmación del navegador ("¿Desea desactivar a ...?"); ambos pasaron a "Inactivo". El tallerista inactivo no puede iniciar sesión: 403 "Tu cuenta está deshabilitada." El alumno inactivo no puede inscribirse (409) ni recibir asistencia (409). Reactivarlos solo es posible por la API | Aprobado |
| CP-39 | RF02 | Finalizar un taller desde la interfaz | Confirmación del navegador; el taller pasó a "Finalizado" y los botones de agregar y quitar se deshabilitaron. En el taller finalizado: crear o registrar asistencia 409, asignar o inscribir 409, publicar contenido 400 | Aprobado |
| CP-40 | NRF01 | Recorrer las 28 pantallas con 375 px de ancho | Pantalla de acceso y las 27 pantallas de los tres paneles: ninguna superó el ancho (sin desplazamiento horizontal). Vista simulada | Aprobado |
| CP-41 | Seguridad (XSS) | Publicar un material con `<img onerror>` y `<script>` en el título y la descripción | Se mostró como texto en el panel del tallerista y en el del alumno; no se ejecutó ningún código | Aprobado |

---

<br>

## 6. Defectos

### 6.1 Estado de los defectos anteriores

| ID | Descripción | Estado tras esta ronda |
|---|---|---|
| DEF-01 | Asistencia del alumno con datos simulados | Cerrado (Testing-02); se mantiene correcto (CP-30) |
| DEF-02 | Exportación de informes en JSON (RF13) | **Abierto** (CP-18, CP-28) |
| DEF-03 | Sin listado de alumnos ni informe de talleristas (RF19, RF22) | **Abierto**: Reportes solo ofrece General y Asistencia |
| DEF-04 | Sin consulta de datos sensibles (RF24) | **Abierto** |
| DEF-05 | Documentos de oficina rechazados | Cerrado (CC-13); se confirma el rechazo de `.docx` (CP-23) |
| DEF-06 | El tallerista no puede adjuntar archivos al material | **Abierto** (CP-24) |
| DEF-07 | La interfaz no permite eliminar una nota | **Abierto** (CP-27) |
| DEF-08 | Falta el archivo del adjunto de ejemplo | **Abierto** (CP-36) |
| DEF-09 | Cédula repetida en otro formato | **Abierto, y se extiende a talleristas** (CP-05) |
| DEF-10 | El tallerista y el alumno no pueden cambiar su contraseña en la interfaz | **Abierto** (CP-29, CP-37) |
| DEF-11 | Sin límite de intentos de inicio de sesión | Abierto; no se volvió a probar y el código no cambió |
| DEF-12 | "Pendiente de integrar" en el detalle del taller del alumno | **Abierto** (CP-34) |
| DEF-13 | Estado "Sin consultar" en tareas entregadas o corregidas | **Abierto** (CP-34) |
| H-02 | Archivos subidos accesibles sin sesión | **Cerrado** (CP-02) |

### 6.2 Defectos nuevos

| ID | Caso | Descripción | Severidad | Estado | Referencia |
|---|---|---|---|---|---|
| DEF-14 | CP-01 | El servidor de prueba funcionó sin `SECRET_KEY` en su `.env` hasta el 01/11/2026, firmando las sesiones con la clave publicada en el repositorio. Con el nuevo `compose.yaml` ya no puede arrancar así; se configuró una clave propia | Alta | Corregido | Revisión de Coherencia 4.2 |
| DEF-15 | CP-26 | En la pantalla de corrección, el tallerista no puede abrir el archivo que entregó el alumno: el nombre aparece como texto, sin enlace | Alta | Abierto | `frontend-tallerista/correccion-tarea.html` |
| DEF-16 | CP-33 | Los archivos que el tallerista adjunta a una tarea no se muestran al alumno | Media | Abierto | `frontend-alumno/detalle-tarea.html`, `detalle-taller.html` |

---

<br>

## 7. Resumen de resultados

| Área | Casos | Aprobados | Parciales | Fallidos | No ejecutados |
|---|---:|---:|---:|---:|---:|
| Verificación de correcciones | 5 | 4 | 0 | 1 | 0 |
| Acceso y permisos | 7 | 7 | 0 | 0 | 0 |
| Regresión: administrador | 8 | 7 | 1 | 0 | 0 |
| Regresión: tallerista | 9 | 4 | 4 | 1 | 0 |
| Regresión: alumno | 8 | 4 | 1 | 3 | 0 |
| Pruebas nuevas | 4 | 4 | 0 | 0 | 0 |
| **Total** | **41** | **30** | **6** | **5** | **0** |

**Criterios:** iguales a los de `Testing-01.md`.

**Conclusión.** Las correcciones de seguridad funcionan: los archivos subidos ya no se descargan sin sesión, los datos repetidos responden 409 y el sistema exige una clave secreta propia. El control de acceso es sólido: ninguna de las pruebas de acceso a datos ajenos tuvo éxito (rutas sin sesión, talleres no asignados, entregas de otro alumno, reportes de otros talleres). Las funciones de los tres roles siguen funcionando después de los cambios. Los fallos que quedan son de interfaz (pantallas que no muestran o no permiten algo que la API sí admite) y de funciones pendientes ya conocidas; dos de ellos son nuevos y afectan la corrección de tareas (DEF-15 y DEF-16).

**Observaciones de la ejecución:**
- **Hora en UTC:** la fecha de generación de los reportes y el último acceso se muestran en hora UTC (por ejemplo, 23:31 cuando en Uruguay eran las 20:31).
- **Último acceso vacío:** el detalle del tallerista muestra "Último Acceso" vacío, aunque la API tiene el dato.
- **Cédula del alumno:** la API ignora el cambio de cédula, pero responde "Alumno actualizado correctamente." sin avisar que ese dato no se modificó.
- **Contenido:** la API acepta una tarea sin fecha límite y sin descripción (la interfaz sí las exige), y la edición (`PATCH /contenidos/{id}`) exige enviar todos los campos.
- **Archivo vacío:** un archivo de 0 bytes se rechaza con "Solo se permiten archivos PDF o JPG." en lugar de "El archivo está vacío."
- **Nota eliminada:** al eliminar la nota, la entrega conserva el estado "Corregida"; eliminarla de nuevo también responde 200.
- **Reactivar usuarios:** solo es posible por la API; la interfaz no tiene la opción. Desactivar de nuevo a un usuario inactivo responde 200.
- **Taller finalizado:** por la API se puede quitar un alumno (la interfaz lo deshabilita) y editar el taller; publicar contenido responde 400 en lugar de 409.
- **Teléfono:** el mensaje de teléfono inválido tiene tres textos distintos según la pantalla o la ruta.
- **Versión del servidor (H-05):** la página de error 403 de Apache muestra "Apache/2.4.69 (Debian)".
- Los diálogos de confirmación del navegador (`confirm()`) se aceptaron automáticamente durante la ejecución asistida.

**No ejecutado:**
- El vencimiento natural de la sesión (una hora), porque no se esperó ese tiempo.
- Que los contenedores no arranquen sin `SECRET_KEY`: se verificó en el código, no se ejecutó en el servidor.
- La filtración de errores de MySQL (Revisión 4.7): no se puede provocar un error de base desde la interfaz sin alterar el servidor. Por revisión de código, está corregida en 4 de los 10 controladores.
- Que una sesión abierta se corte al desactivar al usuario, porque requiere dos sesiones simultáneas en navegadores distintos.

**Limitaciones:** pruebas manuales y asistidas, sin pruebas automatizadas; un solo navegador; vista de teléfono simulada; datos de prueba, no datos reales de INAU.

**Datos que quedaron en el servidor de prueba:** talleristas 7 ("Dup T4", duplicado de Martín) y 8 ("Tallerista Cuatro"); alumnos 6 ("Dup T4", inactivo) y 7 ("Alumno Cuatro"); taller 3 ("Taller T4", finalizado) con sus asistencias; reportes 1 a 3; tareas 4 y 7 del taller 1, con las entregas y notas de Sofía; y la asistencia del 01/11 del taller 1.

**Documentos relacionados:** `Testing-01.md`, `Testing-02.md`, `Testing-03.md`, `requerimientos.md`, `api.md`, `Documento de Reconstruccion - Servidor.md`, `Hardening de Infraestructura y Contenedores.md` y `Revision_Coherencia_INAU.md`.
