# Plan y registro de pruebas — TheNewfutures / INAU

## Sistema de Gestión de Talleres en Convenio con INAU

> **Qué es este documento.** Registra las pruebas de la primera versión del sistema, cada una vinculada al requerimiento que verifica, con el resultado obtenido al ejecutarlas. Los resultados esperados se toman de los requerimientos (`docs/02-analisis/requerimientos.md`), no del comportamiento actual del código; cuando no coinciden, la diferencia se registra como defecto.

---

<br>

## 1. Alcance y entorno

Se prueban los requerimientos de la primera versión desde la interfaz de cada rol. Algunos resultados se confirmaron además con consultas a la API hechas desde la misma sesión del navegador. No se prueban los requerimientos postergados por plazo (RF15, RF18, RF20, RF21, RF23 y RF26) ni el alcance excluido.

| Elemento | Valor |
|---|---|
| Fecha de ejecución | 24/10/2026 |
| Rama / commit | `cambios-frontend` / `<commit>` |
| Servidor | Máquina virtual con Ubuntu Server en VirtualBox, desplegada según `Documento de Reconstruccion - Servidor.md` (API y MySQL 8.4 en Docker; frontend servido por Nginx) |
| Sitio | `http://192.168.1.14` (red local) |
| Navegador y dispositivos | Google Chrome en Windows; vista de teléfono simulada con un ancho de 375 px |
| Ejecutado por | Ejecución asistida por IA (Claude, mediante la extensión Claude en Chrome), supervisada por Gabriel Rendon (subcoordinador). |

**Datos de prueba** (cargados por `backend/api-completa/DataBase/inau_talleres.sql`; las contraseñas no se publican):

<br>

| Rol | Usuario | Relación |
|---|---|---|
| Administrador | carlos.perez@inau.gov.uy | Acceso a todo el sistema |
| Tallerista | martin.rodriguez@ejemplo.com | Talleres 1 (Programación Web) y 2 (Robótica) |
| Alumno | sofia.pereira@email.com | Talleres 1 y 2 |
| Tallerista creado en CP-04 | prueba.tallerista@inau.gov.uy | Talleres 1 y 3 (Taller de Pruebas); no asignado al taller 2 |
| Alumno creado en CP-04 | Lucía Prueba (sin cuenta de acceso) | Usado para las inscripciones de CP-06 |

> Los usuarios María López y Mateo Rodríguez, previstos en el plan original, se reemplazaron por el tallerista y la alumna creados en CP-04, porque no se contaba con sus contraseñas.

---

<br>

## 2. Casos de prueba funcionales

| ID | Requisito | Caso | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|---|
| CP-01 | RF01 | Iniciar sesión con un usuario de cada rol | Cada uno es redirigido a su panel | Carlos fue redirigido a `frontend-admin/dashboard.html` ("Bienvenido, Carlos"), Martín a `frontend-tallerista/dashboard.html` y Sofía a `frontend-alumno/dashboard.html` | Aprobado |
| CP-02 | RF01 | Iniciar sesión con contraseña errónea y con un correo inexistente | En ambos casos, "Correo o contraseña incorrectos.", sin acceso | En ambos casos se mostró "Correo o contraseña incorrectos." y no hubo acceso. Con el formulario vacío, el navegador pidió completar los campos | Aprobado |
| CP-03 | RF01 | Cerrar sesión y abrir después una página de un panel sin iniciar sesión | Vuelve al acceso y el panel no muestra datos | Al pulsar "Salir" volvió a `index.html`. Al abrir después `frontend-admin/dashboard.html` sin sesión, redirigió a la pantalla de acceso; la API respondió 401 "Tenes que iniciar sesion." | Aprobado |
| CP-04 | RF02 | Como administrador, crear y editar un tallerista, un alumno y un taller | Los cambios se guardan y se ven al recargar; el tallerista nuevo puede iniciar sesión | Se crearon el tallerista "Prueba Tallerista", la alumna "Lucía Prueba" y el "Taller de Pruebas". Las ediciones (teléfono del tallerista y de la alumna, salón del taller) se guardaron y se vieron al recargar. El tallerista nuevo inició sesión. Al editar el taller se informa "La edición de horarios todavía no está disponible." | Aprobado |
| CP-05 | RF02 / NRF05 | Crear un alumno sin cédula y un taller con fecha de fin anterior a la de inicio | Se rechazan con el mensaje del campo correspondiente | Alumno sin cédula: "Todos los campos son obligatorios." Taller con fechas invertidas: "La fecha de finalización no puede ser anterior al inicio." Ninguno se guardó. El formulario del alumno exige también correo y teléfono, que la API trata como opcionales | Aprobado |
| CP-06 | RF03 / RF25 | Asignar un tallerista y un alumno a un taller, y quitar la asignación | Figuran en el taller y en sus paneles; al quitarlas, dejan de figurar. El tallerista ve el listado de alumnos de su taller | Se asignó "Prueba Tallerista" al taller 1, que pasó a figurar en sus talleres. Se inscribió a "Lucía Prueba" en el taller 1 y figuró en la lista; al quitarla (con confirmación "¿Desea quitar a Lucía Prueba de este taller?") dejó de figurar. El tallerista ve el listado de alumnos del taller en la pantalla de asistencia | Aprobado |
| CP-07 | RF04 / RF05 | Como tallerista, registrar la asistencia del taller 1 con los cuatro estados y modificar uno | Se guardan Presente, Ausente, Justificado y Tardanza, y la modificación se ve al recargar | "Asistencia guardada correctamente. 3 registros guardados en MySQL." con Presente, Tardanza y Ausente. Se cambió Ausente por Justificado y, al recargar, quedó Presente, Tardanza y Justificado | Aprobado |
| CP-08 | RF05 | Como Sofía, consultar "Asistencia" | Se ven sus registros reales de asistencia | Se mostraron cuatro registros "Presente" de agosto, sin la Tardanza registrada el 24/10 en CP-07. La página no consulta la API: carga los datos de `mock-data.js` | Fallido |
| CP-09 | RF06 / RF16 | Como tallerista, publicar un material con PDF y una tarea con fecha límite, y eliminar el material | Ambos aparecen en el taller; el material eliminado desaparece también para el alumno | Material y tarea (fecha límite 30/11/2026) publicados: "Contenido publicado correctamente en MySQL." La alumna los vio en su taller. El formulario del tallerista no tiene campo para adjuntar archivos; el PDF solo pudo subirse con una petición directa a la API (201, "Archivo del contenido subido correctamente."). El material se eliminó con confirmación ("Contenido eliminado correctamente.") y dejó de figurar en la API | Parcial |
| CP-10 | RF07 / RF08 | Como alumna, abrir el taller 1, descargar el adjunto y entregar la tarea con un PDF y un comentario | Ve el contenido de su taller; la entrega queda "Entregada" con el archivo y el comentario | Sofía vio el material y la tarea del taller 1. El adjunto de ejemplo del script ("guia-html.pdf") no se pudo descargar: "El archivo no existe en el servidor." (404). La entrega con PDF y comentario se guardó ("La entrega y el archivo se guardaron correctamente."), quedó "Entregada" y su propio archivo se descargó correctamente (PDF, 394 bytes) | Parcial |
| CP-11 | RF09 / RF10 / RF17 | Como tallerista, corregir la entrega, asignar nota 8, intentar 0 y 11, y eliminar la nota | La entrega pasa a "Corregida"; 0 y 11 se rechazan con "La nota debe ser un número entero entre 1 y 10."; la nota se elimina | 0 y 11 se rechazaron con "La nota debe ser un número entero entre 1 y 10." (también la API rechazó 11 con 422). Con nota 8 y devolución, la entrega quedó "Corregida". La interfaz no ofrece eliminar la nota; con una petición directa a la API se eliminó ("Nota eliminada correctamente.") | Parcial |
| CP-12 | RF11 / RF12 | Como administrador, generar reportes de tipo Asistencia y General; como tallerista, abrir "Informes" | Los reportes se generan; el tallerista ve solo los de sus talleres | Se generaron "Reporte General del Sistema" y "Reporte de Asistencia - Programación Web". "Prueba Tallerista" vio solo el de Programación Web; al pedir el General, la API respondió 403 "No tienes permisos para consultar este reporte." | Aprobado |
| CP-13 | RF13 | Descargar un informe | Se descarga en PDF o Excel | "Exportar Reporte" (administrador) y "Descargar Informe" (tallerista) generan un archivo `.json` (`application/json`) | Fallido |
| CP-14 | RF19 / RF22 | Como administrador, generar el listado de alumnos y el informe de talleristas | Se obtienen ambos documentos consolidados | Las pantallas Alumnos y Talleristas muestran los listados en pantalla, pero no existe opción para generar el listado de alumnos ni el informe de talleristas; Reportes solo ofrece los tipos General y Asistencia | Fallido |
| CP-15 | RF14 | Con cada rol, modificar un dato del propio perfil | El cambio se guarda y se ve al recargar | Administrador, tallerista y alumna cambiaron su teléfono; se guardó y la API devolvió el valor nuevo. Nombre, apellido y cédula son de solo lectura. El cambio de contraseña figura como "Próximamente" o "No disponible por el momento" | Aprobado |
| CP-16 | RF24 | Como administrador, consultar los datos sensibles | Se muestran los datos sensibles registrados en la plataforma | No existe ninguna pantalla ni opción para consultar datos sensibles | Fallido |

---

<br>

## 3. Pruebas no funcionales y de seguridad

| ID | Requisito | Caso | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|---|
| NF-01 | NRF01 | Recorrer los tres paneles con ancho de teléfono | El contenido se adapta a la pantalla, sin desplazamiento horizontal | Se cargaron las 27 páginas de los tres paneles con 375 px de ancho: en ninguna el contenido superó el ancho de la pantalla. Prueba en vista simulada, no en un teléfono físico | Aprobado |
| NF-02 | NRF07 | Como alumna, abrir una página del panel del administrador | No muestra datos; la API responde "No tenes permisos para hacer esto." | Al abrir `frontend-admin/alumnos.html`, redirigió al panel de la alumna. La API respondió 403 "No tenes permisos para hacer esto." | Aprobado |
| NF-03 | NRF07 | Como tallerista, abrir el detalle de un taller al que no está asignado (`detalle-taller.html?id=2`) | La API rechaza la petición | La pantalla mostró "Este taller no está asignado a tu usuario." La API respondió 403 "No tenés permisos para consultar este taller." También se rechazó a la alumna el contenido del taller 3, en el que no está inscripta (403) | Aprobado |
| NF-04 | NRF11 | Subir un `.exe` y un `.docx` como adjuntos | El `.exe` se rechaza; el `.docx` se acepta, porque NRF11 incluye documentos de oficina | El `.exe` se rechazó en el formulario ("Formato no permitido. Elegí un archivo PDF o JPG.") y en la API (422, "Solo se permiten archivos PDF o JPG."). El `.docx` también se rechazó, con los mismos mensajes. *Nota: NRF11 se modificó después de esta prueba (Control de Cambios CC-13); con el requisito vigente, que admite solo PDF y JPG, este resultado corresponde a Aprobado.* | Fallido |
| NF-05 | NRF12 | Subir un PDF de más de 10 MB | "El archivo no puede superar los 10 MB." | El formulario de la alumna mostró "El archivo no puede superar los 10 MB." y no permitió enviarlo. La API también lo rechazó (422, "El archivo supera el tamaño permitido.") | Aprobado |
| NF-06 | Seguridad (XSS) | Escribir `<script>alert(1)</script>` como título de un material | Se muestra como texto, sin ejecutarse | El título `<script>alert(1)</script><img src=x onerror=alert(2)>` se mostró como texto en el panel del tallerista y en el de la alumna; no se ejecutó ningún código | Aprobado |
| NF-07 | NRF09 | Ejecutar `docker compose down` y `docker compose up -d`, y volver a entrar | Los datos creados durante las pruebas se conservan | Tras reiniciar los contenedores, siguieron presentes el tallerista, la alumna y el taller creados, la asistencia del 24/10, la entrega corregida, los dos reportes y el PDF entregado (se descargó correctamente) | Aprobado |

---

<br>

## 4. Defectos encontrados

| ID | Caso | Descripción | Severidad | Estado | Referencia |
|---|---|---|---|---|---|
| DEF-01 | CP-08 | La asistencia del alumno muestra datos simulados de `mock-data.js` en lugar de los registros reales | Alta | Abierto | Revisión de Coherencia 4.3 |
| DEF-02 | CP-13 | La exportación de informes genera un archivo JSON, no PDF ni Excel | Alta | Abierto | Control de Cambios CC-11 |
| DEF-03 | CP-14 | No existe opción para generar el listado de alumnos ni el informe de talleristas | Media | Abierto | Revisión de Coherencia §5 (RF19 y RF22) |
| DEF-04 | CP-16 | No existe la consulta de datos sensibles | Media | Abierto | Control de Cambios CC-12 |
| DEF-05 | NF-04 | El formulario y la API rechazan los documentos de oficina que NRF11 admitía al momento de la prueba | Media | Cerrado (requisito modificado) | Control de Cambios CC-13 |
| DEF-06 | CP-09 | El formulario del tallerista no permite adjuntar archivos al material; la API sí lo admite | Media | Abierto | Justificación Tecnológica §7 |
| DEF-07 | CP-11 | La interfaz del tallerista no ofrece eliminar una nota (RF17); la API sí lo admite | Media | Abierto | Justificación Tecnológica §7 |
| DEF-08 | CP-10 | El adjunto de ejemplo del script SQL está registrado en la base, pero el archivo no existe en el servidor | Baja | Abierto | Plan de Contingencia PC-12 |

---

<br>

## 5. Resumen de resultados

| Área | Casos | Aprobados | Parciales | Fallidos | No ejecutados |
|---|---:|---:|---:|---:|---:|
| Funcionales | 16 | 9 | 3 | 4 | 0 |
| No funcionales y seguridad | 7 | 6 | 0 | 1 | 0 |
| **Total** | **23** | **15** | **3** | **5** | **0** |

**Criterios:** *Aprobado*, el resultado coincide con el esperado; *Parcial*, funciona con limitaciones que se indican; *Fallido*, no coincide y se registra en la sección 4; *No ejecutado*, no se pudo probar y se indica el motivo.

**Observaciones de la ejecución:**
- Las confirmaciones del navegador ("¿Desea quitar…?", "¿Querés eliminar…?", "¿Desea cerrar sesión?") se aceptaron automáticamente durante la ejecución asistida.
- En el formulario de edición de alumnos del administrador, la cédula aparece como solo lectura.
- En el entorno probado, los puertos de la API (8002) y de MySQL (3308) quedaron publicados en todas las interfaces de la máquina virtual (`0.0.0.0`), porque el `.env` del servidor no los restringe a `127.0.0.1` como indica la guía de despliegue. Corregido después de las pruebas: los puertos se limitaron a `127.0.0.1` y se verificó con Nmap (`Doc NMAP.md`, sección 10).

**Limitaciones:** las pruebas fueron manuales y asistidas, sin pruebas automatizadas; no se probaron rendimiento (NRF03) ni disponibilidad continua (NRF02); la vista de teléfono fue simulada; se usaron los datos de prueba del script, no datos reales de INAU.

**Documentos relacionados:** `requerimientos.md`, `Documento de Reconstruccion - Servidor.md`, `Revision_Coherencia_INAU.md`, `Control_de_Cambios.md`, `Doc NMAP.md` y `Hardening de Infraestructura y Contenedores.md`.