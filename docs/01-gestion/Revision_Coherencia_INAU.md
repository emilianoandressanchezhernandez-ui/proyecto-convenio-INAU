# Revisión integral de coherencia — Proyecto TheNewfutures / INAU

**Fecha de revisión:** 28 de octubre de 2026  
**Última actualización:** 5 de noviembre de 2026
**Fuente:** rama `cambios-frontend` del repositorio `proyecto-convenio-INAU`.
**Alcance:** documentación, estructura de repositorio, HTML, CSS, JavaScript, PHP y SQL presentes en el repositorio, y resultados de las pruebas del sistema (`Testing-01.md` a `Testing-06.md`).

> Esta revisión distingue entre lo que está realmente presente en el repositorio, lo que la documentación declara y lo que todavía está planificado. No se considera una implementación como terminada solo porque esté descrita en un documento. Cuando un punto fue verificado en las pruebas del sistema, se indica el caso correspondiente.

---

## 1. Diagnóstico general

El proyecto tiene una **arquitectura general coherente** y una separación clara entre frontend, backend y documentación. Los tres paneles consumen la API REST en PHP, que expone 55 rutas; el inicio de sesión se resuelve por correo y contraseña con redirección según el rol.

El sistema se desplegó en un servidor de prueba (Ubuntu Server en una máquina virtual, con Docker y Nginx) y se sometió a seis rondas de pruebas, del 24/10 al 05/11/2026 (`Testing-01.md` a `Testing-06.md`). La última ronda verificó todas las correcciones y una prueba completa con los tres roles: 38 casos, todos aprobados.

Los frentes de seguridad y de funciones de interfaz señalados en la revisión anterior están resueltos: la clave por defecto del `compose`, la filtración de errores de la base de datos, los archivos accesibles sin sesión, los hallazgos de endurecimiento H-01 a H-05 y las funciones que la API admitía pero la interfaz no ofrecía. De los 20 requerimientos de la primera versión, 19 están cumplidos y RF13 (exportación a PDF o Excel) quedó postergado.

Lo pendiente se concentra en: **controles de seguridad adicionales** (protección contra CSRF, invalidación del token al cerrar sesión, HTTPS y registro de trazabilidad), **la gestión de las cuentas de alumno** (su alta y su sincronización con la ficha, 4.25 y 4.26), **validaciones que solo existen en el frontend** (4.27), **limpieza del frontend** (datos simulados, dirección de la API repetida y estilos del login), **documentación** (Acta de cierre, el README de la API y el Plan de Negocios) y **los Términos y Condiciones**, implementados en `main` pero no integrados en esta rama ni probados (4.23).

### Estado general

| Área | Estado | Observación |
|---|---|---|
| Análisis del problema | Completo | Entrevista, análisis, requerimientos, historias de usuario y backlog. |
| Alcance | Definido | Alcance incluido, excluido y ajuste por plazo documentados de forma coherente. |
| Frontend tallerista | Conectado a la API | Nueve páginas, con adjuntos en el material, descarga del archivo entregado, eliminación de notas y cambio de contraseña (ver 4.17). |
| Frontend administrador | Conectado a la API | Once páginas, incluido el cambio de contraseña. El listado de alumnos, el informe de talleristas y la consulta de datos personales se resuelven en los paneles Alumnos y Talleristas. La exportación a PDF o Excel (RF13) quedó postergada (ver 4.17). |
| Frontend alumno | Conectado a la API | Siete páginas, con la asistencia, el estado de las tareas, los archivos de la consigna, las notas y el cambio de contraseña (ver 4.17). |
| Login | Completo | Acceso por correo y contraseña en `frontend/index.html`, autenticación contra la API y redirección por rol. |
| Backend PHP | Implementado | 55 rutas en arquitectura por capas, con autenticación JWT y verificación de rol por ruta. |
| Base de datos | Completa | Trece tablas con claves, restricciones, índices y datos de prueba, en un único script. |
| API REST | Implementada y documentada | Referencia completa en `docs/04-implementacion/api.md`. |
| Pruebas | Realizadas | Seis rondas en el servidor de prueba, de `Testing-01.md` (24/10/2026) a `Testing-06.md` (05/11/2026), incluida una prueba de rendimiento y carga (`Testing-03.md`). |
| Modelo de datos documental | Completo | Modelo de clases, MER, anexo de derivación y análisis del modelo, alineados con el SQL actual. |
| Planificación documental | Resuelto | El backlog priorizado de los seis sprints está en `Doc.md`. |
| Seguridad | Avanzada | Resueltos la clave por defecto (4.2), la filtración de errores (4.7), los hallazgos H-01 a H-05 (4.19) y el límite de intentos de inicio de sesión. Quedan CSRF, la invalidación del token al cerrar sesión, HTTPS, la trazabilidad y la baja de alumnos con cuenta (sección 8 y 4.26). |
| Infraestructura | Implementada | Entorno Docker en `backend/api-completa`, desplegado en un servidor de prueba según `Documento de Reconstruccion - Servidor.md`. Hallazgos de endurecimiento corregidos y verificados (4.19). |
| Ciberseguridad (documentación) | Completa | Cinco documentos en `05-Ciberseguridad`: amenazas, mecanismos de autenticación, hardening, escaneo con Nmap y plan de contingencia. |
| Identidad visual | Definida | Documentación completa y hojas de estilo por panel. |
| Uso ético de IA | Documentado | Declaración con registro de 32 usos de herramientas de IA (IA-01 a IA-33; la numeración omite IA-30), coherente con los demás documentos. |
| Emprendedurismo | Requiere actualización | El Plan de Negocios no refleja la postergación de RF13 ni las rondas de pruebas posteriores al 26/10 (4.21). |
| Gestión | Avanzada | Actas de reuniones R-01 a R-14, Control de Cambios (CC-01 a CC-17) y declaración sobre las Sprint Review. Falta el Acta de cierre. |

---

<br>

## 2. Estructura actual real del repositorio

La estructura completa del repositorio, con su árbol y el resumen por carpeta, se documenta en `docs/Estructura del Repositorio.md`. Esta revisión no la reproduce para no duplicarla; solo registra el conteo que sirve de base a los apartados siguientes.

### Conteo real

| Componente | HTML | JS | CSS |
|---|---:|---:|---:|
| Administrador | 11 | 15 | 1 |
| Tallerista | 9 | 12 | 1 |
| Alumno | 7 | 10 | 1 |
| Login y scripts compartidos (`frontend/`) | 1 | 2 | usa CSS del panel tallerista |
| Backend (`backend/api-completa`) | — | — | 74 archivos en total |

**Total: 183 archivos en el repositorio**, coincidente con el resumen de `Estructura del Repositorio.md` y del `README.md`.

---

<br>

## 3. Coherencia funcional por rol

### Administrador

Dispone de pantallas para dashboard, talleristas, detalle de tallerista, alumnos, detalle de alumno, talleres, detalle de taller, asistencias, reportes, detalle de reporte y perfil.

Las pantallas obtienen y modifican los datos a través de la API: listados, búsquedas, detalles, estadísticas, formularios con ventanas modales, generación de reportes y cambio de contraseña. Las altas validan la cédula (8 dígitos) y el teléfono (8 a 15 dígitos) en el formulario y en la API (`Testing-02.md`, CP-06 y CP-07).

El detalle del alumno muestra todos sus datos personales, incluidos la dirección, el referente adulto y el centro de referencia (`Testing-06.md`, CP-25).

**Conclusión:** frontend administrativo conectado a la API. El listado de alumnos, el informe de talleristas y la consulta de datos personales se resuelven en los paneles Alumnos y Talleristas (RF19, RF22 y RF24). La exportación de informes en PDF o Excel (RF13) quedó postergada: los informes se descargan en JSON.

### Tallerista

Dispone de dashboard, perfil, mis talleres, detalle del taller, asistencia, informes, detalle de informe, material y corrección de tareas.

Mantiene la arquitectura modular por pantalla, alimentada por la API: solo accede a los talleres que tiene asignados (`Testing-01.md`, NF-03).

**Conclusión:** frontend conectado a la API. La interfaz permite adjuntar archivos al material, descargar el archivo entregado por el alumno, eliminar notas y cambiar la contraseña (`Testing-06.md`, secciones 2.3 a 2.5 y 2.10).

### Alumno

Hay siete páginas: dashboard, mis talleres, detalle del taller, tareas, detalle de tarea, asistencia y perfil, con su carpeta `js/` de diez módulos.

Las páginas consultan sus talleres, material, tareas y asistencias, y envían entregas a través de la API. La asistencia se obtiene de `GET /mis-asistencias` y muestra los registros reales (`Testing-02.md`, CP-01).

**Conclusión:** panel conectado a la API. Muestra su porcentaje de asistencia, el estado y la nota de cada tarea, y los archivos de la consigna, y permite cambiar la contraseña (`Testing-06.md`, secciones 2.1 a 2.3).

### API

Expone 55 rutas que cubren autenticación y perfil (incluido el cambio de contraseña, que cierra las demás sesiones del usuario), alumnos, talleristas, talleres, asignaciones e inscripciones, asistencias, reportes, contenidos, entregas y adjuntos. Cada ruta declara qué rol puede usarla, el rol se comprueba en la base de datos en cada pedido, y la verificación se aplica tanto por rol como por pertenencia: un tallerista solo accede a los talleres que tiene asignados. Los reportes los genera el administrador (tipos General y Asistencia) y el tallerista consulta los de sus talleres.

**Conclusión:** la cobertura funcional es amplia, el control de acceso está correctamente implementado y verificado en las pruebas, y la API está documentada en `api.md`.

---

<br>

## 4. Principales incoherencias detectadas

### 4.1 Script de base de datos duplicado — **Resuelto**

La copia sin uso `backend/DataBase/inau_talleres.sql` se eliminó (Control de Cambios, CC-14). El único script es `backend/api-completa/DataBase/inau_talleres.sql`, que carga el entorno Docker e incluye `SET NAMES utf8mb4;` al inicio.

### 4.2 Clave secreta por defecto en el `compose` — **Resuelto**

`compose.yaml` ya no trae valores por defecto: `SECRET_KEY`, `DB_PASSWORD` y `MYSQL_ROOT_PASSWORD` son obligatorias, y sin ellas `docker compose` no arranca ("Debes configurar … en .env"). Las plantillas `.env.example` y `.env.docker.example` las dejan vacías. Verificado en el servidor (`Testing-06.md`, CP-24, y la verificación del 05/11/2026). El servidor de prueba usa una clave nueva desde el 01/11/2026 (`Testing-04.md`, DEF-14).

### 4.3 Datos simulados residuales en el frontend

La asistencia del alumno ya se obtiene de la API, por lo que ningún dato que se muestra en pantalla depende de `mock-data.js` (`Testing-02.md`, CP-01). Sin embargo, quedan restos de la etapa inicial:

- Las 27 páginas de los tres paneles siguen cargando `mock-data.js`.
- `frontend-alumno/js/asistencia.js` conserva funciones que leen `DATOS_SIMULADOS` y `localStorage` (por ejemplo, `validarDatosAsistenciaAlumno` y `combinarJornadasAsistencia`) que ya no se invocan. Otros módulos del alumno y los `main.js` de los tres paneles mantienen referencias a `DATOS_SIMULADOS`.
- El encabezado de `frontend-admin/js/mock-data.js` sigue afirmando que no existe conexión con PHP ni MySQL.

**Acción recomendada:** retirar la carga de `mock-data.js` de las páginas, eliminar las funciones sin uso y, por último, eliminar los archivos `mock-data.js`.

### 4.4 El panel del alumno referencia archivos inexistentes — **Resuelto**

La carpeta `frontend-alumno/js/` existe con diez módulos y las páginas consumen la API, incluida la asistencia.

### 4.5 El login del frontend no consume la API — **Resuelto**

`frontend/index.html` procesa el formulario con `js/api.js` y `js/auth.js`, autentica contra la API y redirige según el rol. El criterio de acceso quedó unificado por **correo electrónico**, y la documentación de identidad visual ya lo refleja.

Queda un residuo: `frontend-admin/js/auth.js` es un archivo vacío (0 bytes) que corresponde eliminar.

### 4.6 El login depende de la hoja de estilos de otro panel

`frontend/index.html` carga sus estilos desde `frontend-tallerista/css/styles.css`. La ruta es relativa, por lo que funciona según dónde se sirva el sitio; lo que persiste es que la pantalla de acceso —que no pertenece a ningún rol— depende de la hoja de estilos de un panel específico.

**Acción recomendada:** crear una hoja de estilos propia para el login, en una carpeta común.

### 4.7 La API expone detalles de la base de datos ante un error — **Resuelto**

Los controladores dejan pasar las excepciones de base de datos (`PDOException`) hacia el manejador de `index.php`, que responde con un mensaje genérico ("Ocurrio un error interno con la base de datos.") y registra el detalle en el log (`Testing-05.md`, CP-14 a CP-18; `Testing-06.md`, CP-30).

Antes de la corrección, los controladores capturaban las excepciones con `catch (Exception $e)`, que también alcanzaba a las de base de datos, y devolvían el mensaje original al cliente: un fallo interno podía enviar al navegador el error de MySQL completo, con nombres de tablas y columnas, y con un código engañoso (404 o 400 en lugar de 500).

### 4.8 El README de la API no refleja el proyecto

`backend/api-completa/README.md` proviene de la plantilla original del curso: indica instalar Laragon o XAMPP, menciona "productos" como datos de ejemplo y propone usuarios de prueba (`admin@utu.edu.uy`) que no existen en el proyecto. No describe el entorno Docker que el proyecto utiliza (Control de Cambios, CC-06) ni las 55 rutas, que hoy se documentan en `api.md`.

**Acción recomendada:** reescribir el README de la API con la puesta en marcha mediante Docker y una remisión a `api.md`.

### 4.9 El README del proyecto no refleja el estado actual — **Resuelto**

El README se actualizó con la estructura real del repositorio, las tecnologías utilizadas y el estado del desarrollo.

### 4.10 Documentación técnica pendiente

| Documento | Estado |
|---|---|
| `docs/04-implementacion/api.md` | **Resuelto:** referencia completa de la API (27/10/2026) |
| Documentación de pruebas | **Resuelto:** carpeta `docs/04-implementacion/Testing/`, con `Testing-01.md` a `Testing-06.md`, todos con la misma estructura |
| `docs/04-implementacion/Manual_de_Usuario.md` | **Resuelto:** manual para los tres roles, actualizado al 04/11/2026 |
| `docs/01-gestion/Acta de cierre.md` | **Pendiente:** solo contiene su título |

### 4.11 Archivos con nomenclatura irregular

- **Resuelto:** `backend/.md` se reemplazó por `backend/.gitignore`.
- **Resuelto:** `Documento de Reconstruccion - Doker desktop.md` se eliminó a pedido del docente (Control de Cambios, CC-10).
- **Resuelto:** `docs/seguridad.md` se renombró a `Identificación de amenazas.md`, hoy en `05-Ciberseguridad/`.
- **Pendiente:** la carpeta `03-diseño` contiene un carácter acentuado, a diferencia de las demás. Los nombres de ruta con tildes pueden generar inconvenientes en enlaces y en determinados entornos.

### 4.12 Ausencia de `.gitignore` y `LICENSE`

- **Resuelto:** existe un `.gitignore` en la raíz que excluye `.env`, y sus reglas de archivos subidos ya escriben `backend` en minúscula (4.19, H-03).
- **Pendiente:** no existe un archivo `LICENSE`, contemplado en la plantilla original del proyecto.

### 4.13 La API no admite todos los formatos que exige NRF11 — **Resuelto**

NRF11 se modificó para admitir únicamente PDF y JPG, en coincidencia con la API (Control de Cambios, CC-13). Las pruebas confirmaron que la API rechaza los demás formatos (`Testing-01.md`, NF-04).

### 4.14 El esfuerzo del Charter no coincide con la planificación — **Resuelto**

El Charter declara 63 puntos, en coincidencia con la planificación de los seis sprints en `Doc.md`.

### 4.15 El administrador puede modificar la cédula del alumno — **Resuelto**

En la entrevista con el cliente se estableció que la cédula del alumno no debe modificarse. El formulario de edición del panel del administrador la presenta como solo lectura (`detalle-alumno.js`), y la API descarta el campo `cedula` en `PATCH /alumnos/{id}` (`AlumnoService.php`: "La cédula no se modifica desde este endpoint"). Verificado en el código.

### 4.16 La dirección de la API está escrita en el código

La dirección `http://localhost:8002` figura 19 veces en 15 archivos del frontend, con seis constantes distintas (`INAU_API_URL`, `ADMIN_API_URL`, `TALLERISTA_API_URL`, `ALUMNO_API_URL`, `PERFIL_API_URL` y `REPORTES_API_URL`). Para desplegar en el servidor fue necesario reemplazarla en todos los archivos (`Documento de Reconstruccion - Servidor.md`).

**Acción recomendada:** que todos los módulos usen la constante de `frontend/js/api.js`, de modo que la dirección se defina en un solo lugar.

### 4.17 Requerimientos y funciones de interfaz, según las pruebas

Estado de los defectos registrados en las pruebas al 05/11/2026:

| Defecto | Descripción | Requerimiento | Estado |
|---|---|---|---|
| DEF-02 | La exportación de informes genera un archivo JSON, no PDF ni Excel | RF13 (CC-11) | **Postergado** (`Testing-06.md`, sección 2.9) |
| DEF-03 | No existe opción para generar el listado de alumnos ni el informe de talleristas | RF19, RF22 | **Cerrado:** lo cumplen los paneles Alumnos y Talleristas (`Testing-06.md`, CP-27) |
| DEF-04 | No existe la consulta de datos sensibles | RF24 (CC-12) | **Cerrado:** lo cumplen los detalles de alumnos y talleristas (`Testing-06.md`, CP-25 y CP-26) |
| DEF-06 | El formulario del tallerista no permite adjuntar archivos al material | RF06 | **Corregido** (`Testing-06.md`, CP-15 y CP-16) |
| DEF-07 | La interfaz del tallerista no ofrece eliminar una nota | RF17 | **Corregido** (`Testing-06.md`, CP-14) |
| DEF-08 | Falta el archivo físico del adjunto de ejemplo | — | **Abierto:** es un dato de prueba, no un error del código |
| DEF-10 | El tallerista y el alumno no pueden cambiar su contraseña desde la interfaz | RF14 | **Corregido** (`Testing-06.md`, CP-08 a CP-13) |
| DEF-12, DEF-13, DEF-15 y DEF-16 | Asistencia, estado de las tareas, archivo entregado y archivos de la consigna en los paneles del alumno y del tallerista | RF05, RF07, RF09 | **Corregidos** (`Testing-05.md` y `Testing-06.md`) |
| DEF-17 | Los encabezados de las tablas del panel del administrador no se leen (texto blanco sobre fondo blanco) | — | **Abierto** (`frontend-admin/css/styles.css`) |

DEF-01 a DEF-08 se registran en `Testing-01.md`; DEF-09 y DEF-10, en `Testing-02.md`; DEF-11 a DEF-13, en `Testing-03.md`; DEF-14 a DEF-16, en `Testing-04.md`, y DEF-17, en `Testing-06.md`. DEF-01, DEF-05, DEF-09, DEF-11 y DEF-14 también están cerrados.

### 4.18 La comprobación de cédula repetida no normaliza el formato — **Resuelto**

La API guarda la cédula con el formato X.XXX.XXX-X y compara solo los dígitos al buscar duplicados, por lo que una cédula ya registrada se detecta aunque se escriba en otro formato y responde `409` (`Testing-06.md`, CP-17 y CP-18, DEF-09).

### 4.19 Hallazgos de endurecimiento de la infraestructura

`Hardening de Infraestructura y Contenedores.md` registra cinco hallazgos. Todos están corregidos y verificados en el servidor de prueba (`Testing-06.md`, sección 2.7, y verificación del 05/11/2026):

| Hallazgo | Descripción | Estado |
|---|---|---|
| H-01 | La API y MySQL quedaban publicados en todas las interfaces de red | **Corregido:** `compose.yaml` publica por defecto en `127.0.0.1`; desde otra computadora, los puertos 8002 y 3308 no responden |
| H-02 | Los archivos subidos podían descargarse sin iniciar sesión mediante una ruta directa | **Corregido:** la ruta directa responde `403` y las respuestas de adjuntos ya no incluyen la ruta interna |
| H-03 | Dos reglas del `.gitignore` escribían `Backend` con mayúscula y no tenían efecto | **Corregido** |
| H-04 | Los contenedores no se reiniciaban solos tras reiniciar el servidor | **Corregido:** `restart: unless-stopped`; verificado reiniciando el servidor |
| H-05 | Los servicios informaban su versión exacta | **Corregido:** `server_tokens off` en Nginx; `ServerTokens Prod`, `ServerSignature Off` y `expose_php = Off` en la API |

> `Hardening de Infraestructura y Contenedores.md` todavía muestra estos hallazgos como pendientes y debe actualizarse.

### 4.20 Los errores de validación no usan un código único

Las rutas de alumnos, talleristas y adjuntos responden `422` ante datos inválidos, mientras que las de autenticación y perfil responden `400` (`api.md`, sección 3.1; observado en `Testing-02.md`).

**Acción recomendada:** unificar el código de respuesta para los errores de validación.

### 4.21 El Plan de Negocios conserva datos desactualizados — **Requiere actualización**

La actualización del 28/10/2026 quedó desfasada por los cambios posteriores:

- La descripción de productos y servicios incluye la "exportación a PDF o Excel", que quedó postergada (RF13).
- La etapa "Integración y pruebas" menciona dos rondas de pruebas y, como pendientes, el listado de alumnos, el informe de talleristas y la consulta de datos sensibles, que ya están cerrados.

Lo resuelto en la actualización anterior: el costo del primer año es de USD 2.667 (CC-03), la API tiene 55 rutas, los tres paneles figuran conectados a la API, las herramientas incluyen Docker en lugar de XAMPP (CC-06) y los vínculos de los anexos apuntan a las ubicaciones actuales. La misión de la empresa ya no afirma brindar "seguridad absoluta", por lo que no contradice el análisis FODA.

### 4.22 La Declaración de Ética no coincide con otros documentos — **Resuelto**

La Declaración de Ética registra 32 usos de herramientas de IA (IA-01 a IA-33), incluidos los del 29/10 al 05/11/2026: correcciones de defectos y de hardening, rondas de pruebas, documentación e informe de ciberseguridad. En la actualización del 28/10/2026:

- El párrafo de la declaración describe todos los usos registrados en la tabla, incluidos la generación de código, la reconstrucción de la entrevista, la redacción de documentación técnica y la ejecución de las pruebas.
- Las fechas coinciden con los demás documentos: la primera ronda de pruebas figura el 24/10/2026 (`Testing-01.md`), el trabajo de frontend comienza con el proyecto (17/07/2026, según el Charter) y la documentación de Docker es posterior a la decisión de adoptarlo (CC-06).
- Se registró el uso de IA del 25/10/2026 (`Doc NMAP.md`) y la redacción de `api.md`.
- Las firmas se actualizaron al 28/10/2026.

Queda un detalle de numeración: la tabla salta de IA-29 a IA-31, sin una entrada IA-30.

### 4.23 Los Términos y Condiciones solo existen en la rama `main`

El 05/11/2026 se incorporaron a `main` las páginas de Términos y Condiciones y de Política de Privacidad, una pantalla de aceptación con casilla, rutas nuevas en la API (`GET /terminos`, `GET /terminos/estado` y `POST /terminos/aceptar`) y una tabla nueva, `aceptaciones_terminos`. Esos cambios no están en `cambios-frontend`, ninguna ronda de pruebas los cubre, y la documentación de esta rama sigue indicando 13 tablas y 55 rutas. Además, el script SQL solo se ejecuta con la base vacía, por lo que en el servidor de prueba la tabla nueva debe crearse manualmente.

**Acción recomendada:** integrar los cambios en la rama de trabajo, crear la tabla en el servidor, probar el flujo de aceptación con los tres roles y actualizar `api.md`, la sección 7 de esta revisión, el README y `Estructura del Repositorio.md`.

### 4.24 El Control de Cambios no registra los últimos cambios de alcance — **Resuelto**

El Control de Cambios registra la postergación de RF13 (CC-15), el cierre de RF19, RF22 y RF24 mediante los paneles del administrador (CC-16) y la inclusión de RF23 en la primera versión (CC-17). Las entradas CC-11 (RF13) y CC-12 (RF24) se actualizaron con su estado final.

### 4.25 No existe forma de crear la cuenta de acceso de un alumno

El modelo establece que el alumno se registra primero como ficha (`alumnos`) y que después, si corresponde, recibe una cuenta de acceso (`usuarios` con rol `alumno`), vinculada mediante `alumnos.usuario_id` (*Análisis del Modelo*, paso 1; anexo de derivación, 1.4 y 5.7).

En el sistema ese segundo paso no existe: `POST /alumnos` crea solo la ficha, y ninguna ruta ni pantalla crea la cuenta ni completa `usuario_id`. Las únicas cuentas de alumno son las de los datos de prueba del script SQL (Sofía Pereira y Mateo Rodríguez); los alumnos creados durante las pruebas quedaron "sin cuenta de acceso" (`Testing-01.md`, CP-04; `Testing-02.md`, CP-06 y CP-08). En consecuencia, la regla "la cédula del alumno debe coincidir con la de su cuenta" (anexo, 5.7) no tiene dónde aplicarse.

**Acción recomendada:** agregar una ruta y una pantalla del administrador para crear la cuenta de un alumno existente, que valide la coincidencia de la cédula y complete `usuario_id` en la misma transacción.

### 4.26 La edición y la baja de un alumno no se sincronizan con su cuenta

El modelo establece que los datos duplicados entre `usuarios` y `alumnos` (`nombre`, `apellido`, `cedula`, `correo`, `telefono` y `estado`) se actualizan mediante una única función que escribe en ambas tablas dentro de la misma transacción (*Modelo de Clases*, sección 5; anexo, 5.7).

La sincronización solo se aplica cuando el propio alumno edita su perfil (`AuthService`). Cuando el administrador edita o da de baja a un alumno (`PATCH /alumnos/{id}` y `DELETE /alumnos/{id}`), `AlumnoService` actualiza únicamente la tabla `alumnos`. Las consecuencias son:

- Un alumno con cuenta dado de baja queda "Inactivo" en su ficha, pero su cuenta sigue "Activa": puede seguir iniciando sesión, porque el inicio de sesión comprueba `usuarios.estado`.
- Si el administrador cambia el correo del alumno, la ficha y la cuenta quedan con correos distintos, y el inicio de sesión sigue usando el anterior.

El caso no se detectó en las pruebas porque la baja de alumnos se probó con alumnos sin cuenta (`Testing-04.md`, CP-38).

**Acción recomendada:** que `AlumnoService` actualice también la cuenta vinculada, cuando exista, dentro de la misma transacción, y verificar en una nueva ronda de pruebas que un alumno con cuenta dado de baja no pueda iniciar sesión.

### 4.27 Tres reglas del modelo solo se controlan en el frontend

El modelo define tres multiplicidades mínimas que la base de datos no puede expresar. En la primera versión las controla la interfaz, pero la API no las verifica:

| Regla del modelo | Control en la interfaz | Comportamiento de la API |
|---|---|---|
| Todo taller tiene al menos un tallerista (`Taller` 0..\* ←→ 1..\* `Tallerista`) | El formulario de alta de taller exige elegir un tallerista | Admite crear un taller sin tallerista y quitar el último asignado |
| Todo taller tiene al menos un horario (`Taller` ◆— 1..\* `Horario`) | El formulario muestra "Agregá al menos un horario." | Admite crear un taller sin horarios |
| Una jornada registra a todos los alumnos inscriptos (`Asistencia.estaCompleta()`) | La pantalla de asistencia exige el estado de todos los alumnos antes de guardar | Admite guardar registros por separado |

**Acción recomendada:** replicar las tres validaciones en la API, conforme a NRF05 (validación en frontend y backend).

---

<br>

## 5. Estado de requisitos funcionales

De los veintiséis requerimientos definidos, veinte integran el alcance de la primera versión y seis fueron postergados por restricción de plazo; de estos, RF23 se incluyó finalmente. El estado se corresponde con la sección 23 de `Doc.md`.

### Requerimientos de la primera versión

| Código | Requisito | Estado actual | Prueba |
|---|---|---|---|
| RF01 | Login y diferenciación por rol | Cumplido. | CP-01 a CP-03 |
| RF02 | Gestión de usuarios y talleres | Cumplido, con validación de cédula y teléfono; la cédula repetida se detecta aunque se escriba en otro formato (4.18). No permite crear la cuenta de acceso de un alumno (4.25), y la edición y la baja de un alumno no se trasladan a su cuenta (4.26). | CP-04, CP-05; T2 CP-06 a CP-08; T6 CP-17 |
| RF03 | Asignación de alumnos y talleristas | Cumplido. | CP-06; T2 CP-09 |
| RF04 | Registrar asistencia | Cumplido, con los cuatro estados. | CP-07; T2 CP-02 |
| RF05 | Consultar y modificar asistencia | Cumplido: el tallerista consulta y modifica, y el alumno consulta sus registros reales y su porcentaje. | CP-07, CP-08; T2 CP-01; T6 CP-01 |
| RF06 | Subir material y tareas | Cumplido, con archivos adjuntos PDF o JPG. | CP-09; T6 CP-15, CP-16 |
| RF07 | Alumno visualiza material y tareas | Cumplido, con el estado de cada tarea y los archivos de la consigna. | CP-10; T6 CP-02, CP-04 a CP-07 |
| RF08 | Alumno envía archivos | Cumplido, con comentario opcional de entrega. | CP-10 |
| RF09 | Tallerista corrige tareas | Cumplido. | CP-11 |
| RF10 | Asignar notas | Cumplido, con validación de rango de 1 a 10. | CP-11 |
| RF11 | Informes de asistencia | Cumplido (reporte de tipo Asistencia). | CP-12 |
| RF12 | Informes de talleres y talleristas | Cumplido (reporte de tipo General). | CP-12 |
| RF13 | Exportación en PDF o Excel | Postergado: la descarga produce un archivo JSON. | CP-13; T6 sección 2.9 |
| RF14 | Gestión de perfil según rol | Cumplido: los tres roles modifican sus datos de contacto y su contraseña desde la interfaz. | CP-15; T2 CP-03 a CP-05; T6 CP-08 a CP-13 |
| RF16 | Eliminar material | Cumplido. | CP-09 |
| RF17 | Eliminar nota asignada | Cumplido, desde la ventana Corregir. | CP-11; T6 CP-14 |
| RF19 | Generar listado de alumnos | Cumplido en el panel Alumnos, con búsqueda. | CP-14; T6 CP-27 |
| RF22 | Informe de talleristas | Cumplido en el panel Talleristas. | CP-14; T6 CP-26, CP-27 |
| RF23 | Alumno visualiza sus notas | Cumplido: postergado por plazo al inicio, se incluyó en la primera versión. | T6 CP-02, CP-06 |
| RF24 | Consultar datos sensibles | Cumplido en los detalles de alumnos y talleristas. | CP-16; T6 CP-25, CP-26 |
| RF25 | Listado de alumnos del taller | Cumplido. | CP-06 |

**Resumen:** de los 20 requerimientos de la primera versión, 19 están cumplidos y 1 postergado (RF13). Además, RF23 quedó cumplido. Los casos sin prefijo corresponden a `Testing-01.md`; los indicados con "T2" y "T6", a `Testing-02.md` y `Testing-06.md`.

> **Observación sobre los informes:** la tabla `reportes` cuenta con rutas en la API para generarlos y consultarlos. La tabla `trazabilidad` existe en la base de datos, pero la API todavía no registra acciones en ella.

### Requerimientos postergados por plazo

| Código | Requisito |
|---|---|
| RF15 | Alumno elimina datos de su perfil |
| RF18 | Eliminar registro de asistencia |
| RF20 | Informe con histórico de calificaciones |
| RF21 | Informe con información detallada de alumnos |
| RF26 | Modificar material o tareas ya publicadas (la API lo admite con `PATCH /contenidos/{id}`, sin pantalla) |

---

<br>

## 6. Estado de requisitos no funcionales

| Código | Requisito | Evaluación |
|---|---|---|
| NRF01 | Diseño responsive | Cumplido: las 27 páginas se adaptan a 375 px de ancho, sin desplazamiento horizontal (`Testing-01.md`, NF-01; vista simulada). |
| NRF02 | Disponibilidad 24 horas | Objetivo de despliegue, aún no demostrable. Los contenedores se reinician solos (4.19, H-04), y bajo carga ningún servicio se cayó (`Testing-03.md`). |
| NRF03 | Rapidez en operaciones | Cumplido: con un solo usuario, todas las rutas respondieron en menos de medio segundo (`Testing-03.md`, sección 2). |
| NRF04 | Navegación clara y consistente | Cumplido en los tres paneles. |
| NRF05 | Validación en frontend y backend | Cumplido en lo principal: la API valida con clases dedicadas por entidad, también cuando se envían datos sin pasar por el formulario (`Testing-02.md`, CP-06 y CP-07). Tres reglas del modelo solo se validan en el frontend (4.27). |
| NRF06 | Separación frontend y backend | Cumplido: API REST con arquitectura en capas y frontend independiente que la consume. |
| NRF07 | Control de acceso por rol | Cumplido: verificación por rol y por pertenencia al taller (`Testing-01.md`, NF-02 y NF-03). |
| NRF08 | Protección de datos personales | Cumplido en lo principal: contraseñas con hash, consultas preparadas, claves obligatorias, errores genéricos, archivos protegidos, límite de intentos de inicio de sesión y cierre de sesiones al cambiar la contraseña. Quedan CSRF, la invalidación del token al cerrar sesión, HTTPS y la baja de alumnos con cuenta (sección 8 y 4.26). |
| NRF09 | Persistencia relacional | Cumplido: un único esquema; los datos se conservan al reiniciar los contenedores (`Testing-01.md`, NF-07). |
| NRF10 | Trazabilidad | La tabla `trazabilidad` existe, pero la API no registra acciones en ella. |
| NRF11 | Restricción de formatos | Cumplido: la API admite solo PDF y JPG, según el requisito vigente (CC-13). |
| NRF12 | Restricción de tamaño | Cumplido: la API y el formulario rechazan adjuntos de más de 10 MB (`Testing-01.md`, NF-05). |
| NRF13 | Código organizado | Cumplido: frontend modular por pantalla y backend en capas. |
| NRF14 | Documentación técnica | Avanzada: restan el Acta de cierre y el README de la API (4.8). |
| NRF15 | Uso de Git | Implementado. |
| NRF16 | Pull Requests obligatorias | Declarado en la documentación y respaldado por el flujo de ramas del repositorio. |

---

<br>

## 7. Base de datos actual

El esquema definitivo, en `backend/api-completa/DataBase/inau_talleres.sql`, define trece tablas:

`usuarios`, `alumnos`, `talleres`, `taller_tallerista`, `horarios_taller`, `inscripciones`, `asistencias`, `registros_asistencia`, `contenidos`, `entregas`, `adjuntos`, `reportes` y `trazabilidad`.

Incluye claves primarias y foráneas, restricciones de unicidad, índices sobre las columnas de filtrado frecuente, restricciones de verificación, datos de prueba y hashes de contraseña válidos. Se corresponde con el modelo de clases documentado en `03-diseño/Modelado/`, con la correspondencia clase-tabla verificada en el Paso 5 del anexo de derivación. Es el esquema que carga el entorno Docker y contra el que trabaja la API.

El adjunto de ejemplo que registra el script no tiene archivo físico en el servidor (`Testing-01.md`, DEF-08; Plan de Contingencia, PC-12).

En la rama `main`, los Términos y Condiciones agregan una decimocuarta tabla, `aceptaciones_terminos` (4.23).

---

<br>

## 8. Seguridad

El documento de identificación de amenazas reconoce tres riesgos principales:

| Amenaza | Probabilidad | Impacto | Riesgo | Clasificación |
|---|---:|---:|---:|---|
| Phishing | 4 | 3 | 12 | Crítico |
| XSS | 3 | 3 | 9 | Tolerable |
| Ransomware | 2 | 4 | 8 | Tolerable |

Los mecanismos de autenticación y criptografía se describen en `05-Ciberseguridad/Mecanismos_Autenticacion_Criptografia_INAU.md`; el endurecimiento de la infraestructura, en `Hardening de Infraestructura y Contenedores.md`, y el escaneo de puertos, en `Doc NMAP.md`.

### Lo que está bien resuelto en la API

- **Control de acceso**: cada ruta declara los roles admitidos, y la verificación alcanza también la pertenencia. Un tallerista no puede leer ni modificar datos de un taller que no dicta (`Testing-01.md`, NF-03).
- **Consultas preparadas** en todos los repositorios, lo que previene la inyección SQL.
- **Listas blancas de campos** en las actualizaciones que arman la consulta dinámicamente; la ruta de cambio de contraseña rechaza campos no permitidos, como `rol` (`Testing-02.md`, NF-01).
- **Contraseñas con hash**, verificadas con la función correspondiente; el token viaja en una cookie que el JavaScript del navegador no puede leer. El cambio de contraseña exige la contraseña actual.
- **Protección frente a XSS** en el frontend: un título con `<script>` se mostró como texto, sin ejecutarse (`Testing-01.md`, NF-06).
- **Claves obligatorias** en `compose.yaml`, sin valores de demostración (4.2).
- **Errores genéricos** ante fallos de la base de datos (4.7).
- **Límite de intentos de inicio de sesión:** cinco por correo y por IP cada cinco minutos (`429`), y 300 pedidos por minuto por IP (`Testing-05.md`, CP-04 a CP-09).
- **Sesiones ligadas al usuario:** en cada pedido, la API comprueba que el usuario exista, esté activo y no haya cambiado su contraseña; cambiarla o desactivar al usuario cierra sus sesiones (`Testing-05.md`, CP-10 a CP-13). La baja de un alumno desde su ficha todavía no desactiva su cuenta (4.26).
- **Endurecimiento de la infraestructura:** H-01 a H-05 corregidos (4.19).

### Lo que queda pendiente

- La protección contra CSRF.
- La invalidación en el servidor de una copia del token al cerrar sesión (`POST /logout` borra la cookie del navegador).
- El registro efectivo en la tabla `trazabilidad`, que NRF10 exige y la API no realiza.
- HTTPS, documentado en la guía del servidor pero no aplicado en el servidor de prueba.
- La desactivación de la cuenta de un alumno al darlo de baja (4.26).
- La actualización de `Mecanismos_Autenticacion_Criptografia_INAU.md` (sección 9) y `Hardening de Infraestructura y Contenedores.md`, que todavía muestran como pendientes medidas ya implementadas.

---

<br>

## 9. Identidad visual

La documentación define una línea común: fondo cálido, superficies blancas, bordes discretos, tipografía del sistema, radio de borde pequeño, identidad cromática propia por rol, estados diferenciados por color, diseño responsive y componentes reutilizables.

Los tres paneles comparten la misma base y se diferencian únicamente por su paleta, criterio documentado y verificable en las tres hojas de estilo.

---

<br>

## 10. Gestión del proyecto

El proyecto cuenta con un acta de reuniones de R-01 a R-14, donde se registra la organización inicial del equipo, la entrevista con el cliente, la distribución de tareas, las dificultades de participación, los cambios de alcance, los avances de documentación, el desarrollo del backend y la división de áreas para la defensa. El Control de Cambios registra diecisiete cambios (CC-01 a CC-17), con su impacto y su estado, incluidos la postergación de RF13, el cierre de RF19, RF22 y RF24 y la inclusión de RF23 (4.24). La declaración sobre las instancias de Sprint Review deja constancia de que no se realizaron Sprint Reviews con el cliente en ninguno de los seis sprints, dado que el único contacto con INAU fue la entrevista inicial (R-02 y R-03). El Acta de cierre está creada, pero sin contenido.

El Charter establece a INAU como cliente y patrocinador, a Emiliano Sánchez como líder y Scrum Master, tres integrantes, una duración de doce semanas organizadas en seis sprints quincenales, un esfuerzo estimado de sesenta y tres puntos y los riesgos principales del proyecto. Su situación inicial del cliente coincide con la de `Doc.md`.

---

<br>

## 11. Conclusión de coherencia

### Lo que está bien alineado

1. La arquitectura frontend → API REST → PHP → MySQL es consistente entre la documentación y lo implementado, y los tres paneles consumen la API.
2. El stack de Bootstrap, HTML, CSS y JavaScript sin framework coincide con la justificación tecnológica.
3. El esquema SQL definitivo se corresponde con el modelo de clases, con trazabilidad verificada paso a paso, y es el único que existe en el repositorio.
4. El alcance incluido, el excluido y el ajuste por plazo son coherentes entre el documento principal, el Charter y el modelo.
5. El control de acceso de la API cumple lo que NRF07 exige y fue verificado en las pruebas, igual que las correcciones de seguridad y de endurecimiento.
6. La estructura por capas de la API coincide con la separación descrita en la justificación tecnológica y en `api.md`.
7. El inicio de sesión por correo es coherente entre la API, el frontend y la documentación de identidad visual.
8. El entorno Docker es reproducible: se desplegó en un servidor de prueba siguiendo la guía del repositorio.
9. El estado de los requerimientos coincide entre `Doc.md` (sección 23), esta revisión y los resultados de las pruebas.
10. El conteo de archivos coincide entre el repositorio, el `README.md` y `Estructura del Repositorio.md`.
11. La Declaración de Ética coincide con el Charter, `Doc.md` y los registros de pruebas.
12. Los seis registros de pruebas comparten la misma estructura, y el Manual de Usuario y `api.md` reflejan las funciones actuales.

### Lo que debe corregirse prioritariamente

1. Redactar el Acta de cierre.
2. Sincronizar la edición y la baja de un alumno con su cuenta de acceso, y permitir crear esa cuenta (4.25 y 4.26).
3. Integrar y probar los Términos y Condiciones de `main` (4.23).
4. Actualizar los documentos que aún muestran pendientes ya resueltos: `Mecanismos_Autenticacion_Criptografia_INAU.md`, `Hardening de Infraestructura y Contenedores.md` y el Plan de Negocios (4.21).
5. Actualizar el README de la API (4.8).
6. Corregir los encabezados de las tablas del panel del administrador (DEF-17).
7. Agregar la protección contra CSRF, la invalidación del token al cerrar sesión y HTTPS.
8. Implementar el registro de trazabilidad.
9. Replicar en la API las tres validaciones que hoy solo hace el frontend (4.27).
10. Retirar `mock-data.js`, las funciones sin uso y el `auth.js` vacío.
11. Centralizar la dirección de la API en un solo archivo.
12. Crear una hoja de estilos propia para el login.
13. Implementar la exportación en PDF o Excel (RF13), en una etapa posterior.

---

<br>

## 12. Orden recomendado de trabajo

Los pasos del orden anterior (clave del `compose`, archivos subidos, errores de la API, endurecimiento, cédula, funciones de interfaz, listados y nueva ronda de pruebas) están completos, salvo la exportación a PDF o Excel, que se postergó. Lo que queda:

```text
1. Acta de cierre
        ↓
2. Cuentas de alumno: sincronización de la ficha y alta de la cuenta (4.25 y 4.26)
        ↓
3. Integrar y probar los Términos y Condiciones de main
        ↓
4. Actualizar Mecanismos, Hardening, Plan de Negocios y README de la API
        ↓
5. Corregir DEF-17 (encabezados de tablas)
        ↓
6. CSRF, invalidación del token al cerrar sesión y HTTPS
        ↓
7. Trazabilidad y validaciones de la API (4.27)
        ↓
8. Retirar los datos simulados, centralizar la dirección de la API y estilos del login
```