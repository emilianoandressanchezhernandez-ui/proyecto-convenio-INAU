# Revisión integral de coherencia — Proyecto TheNewfutures / INAU

**Fecha de revisión:** 27 de octubre de 2026
**Fuente:** rama `cambios-frontend` del repositorio `proyecto-convenio-INAU`.
**Alcance:** documentación, estructura de repositorio, HTML, CSS, JavaScript, PHP y SQL presentes en el repositorio, y resultados de las pruebas del sistema (`Testing-01.md` y `Testing-02.md`).

> Esta revisión distingue entre lo que está realmente presente en el repositorio, lo que la documentación declara y lo que todavía está planificado. No se considera una implementación como terminada solo porque esté descrita en un documento. Cuando un punto fue verificado en las pruebas del sistema, se indica el caso correspondiente.

---

## 1. Diagnóstico general

El proyecto tiene una **arquitectura general coherente** y una separación clara entre frontend, backend y documentación. Los tres paneles consumen la API REST en PHP, que expone 55 rutas; el inicio de sesión se resuelve por correo y contraseña con redirección según el rol, y la asistencia del alumno ya se obtiene de la API.

El sistema se desplegó en un servidor de prueba (Ubuntu Server en una máquina virtual, con Docker y Nginx) y se sometió a dos rondas de pruebas: la primera, el 24/10/2026, con 23 casos (15 aprobados, 3 parciales y 5 fallidos), y la segunda, el 26/10/2026, con 10 casos sobre las funciones nuevas (8 aprobados, 1 parcial y 1 fallido). La documentación está completa, salvo el Acta de cierre.

Los problemas pendientes se concentran en tres frentes: **la seguridad del despliegue** (clave secreta por defecto en el `compose`, archivos subidos accesibles sin sesión y filtración de errores de la base de datos), **cuatro requerimientos sin implementar** (RF13, RF19, RF22 y RF24) y **funciones disponibles en la API que la interfaz no ofrece** (adjuntar archivos al material, eliminar notas y cambiar la contraseña del tallerista y del alumno).

### Estado general

| Área | Estado | Observación |
|---|---|---|
| Análisis del problema | Completo | Entrevista, análisis, requerimientos, historias de usuario y backlog. |
| Alcance | Definido | Alcance incluido, excluido y ajuste por plazo documentados de forma coherente. |
| Frontend tallerista | Conectado a la API | Nueve páginas. Pendiente en la interfaz: adjuntar archivos al material, eliminar notas y cambiar la contraseña (ver 4.17). |
| Frontend administrador | Conectado a la API | Once páginas, incluido el cambio de contraseña. Pendientes: exportación de informes, listado de alumnos, informe de talleristas y consulta de datos sensibles (ver 4.17). |
| Frontend alumno | Conectado a la API | Siete páginas, incluida la asistencia. Pendiente en la interfaz: cambiar la contraseña (ver 4.17). |
| Login | Completo | Acceso por correo y contraseña en `frontend/index.html`, autenticación contra la API y redirección por rol. |
| Backend PHP | Implementado | 55 rutas en arquitectura por capas, con autenticación JWT y verificación de rol por ruta. |
| Base de datos | Completa | Trece tablas con claves, restricciones, índices y datos de prueba, en un único script. |
| API REST | Implementada y documentada | Referencia completa en `docs/04-implementacion/api.md`. |
| Pruebas | Realizadas | `Testing-01.md` (24/10/2026) y `Testing-02.md` (26/10/2026), ejecutadas en el servidor de prueba. |
| Modelo de datos documental | Completo | Modelo de clases, MER, anexo de derivación y análisis del modelo, alineados con el SQL actual. |
| Planificación documental | Resuelto | El backlog priorizado de los seis sprints está en `Doc.md`. |
| Seguridad | Mixta | El control de acceso de la API es sólido; quedan la clave por defecto del `compose` (4.2), la filtración de errores (4.7) y los archivos subidos accesibles sin sesión (4.19). |
| Infraestructura | Implementada | Entorno Docker en `backend/api-completa`, desplegado en un servidor de prueba según `Documento de Reconstruccion - Servidor.md`. Hallazgos de endurecimiento en 4.19. |
| Ciberseguridad (documentación) | Completa | Cinco documentos en `05-Ciberseguridad`: amenazas, mecanismos de autenticación, hardening, escaneo con Nmap y plan de contingencia. |
| Identidad visual | Definida | Documentación completa y hojas de estilo por panel. |
| Uso ético de IA | Documentado, con correcciones pendientes | Declaración con registro de herramientas y firmas; el párrafo inicial y algunas fechas no coinciden con otros documentos (ver 4.22). |
| Emprendedurismo | Con datos desactualizados | El Plan de Negocios conserva cifras anteriores (ver 4.21). |
| Gestión | Avanzada | Actas de reuniones R-01 a R-13, Control de Cambios (CC-01 a CC-14) y declaración sobre las Sprint Review; el Acta de cierre está sin contenido. |

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

**Total: 178 archivos en el repositorio**, coincidente con el resumen de `Estructura del Repositorio.md` y del `README.md`.

---

<br>

## 3. Coherencia funcional por rol

### Administrador

Dispone de pantallas para dashboard, talleristas, detalle de tallerista, alumnos, detalle de alumno, talleres, detalle de taller, asistencias, reportes, detalle de reporte y perfil.

Las pantallas obtienen y modifican los datos a través de la API: listados, búsquedas, detalles, estadísticas, formularios con ventanas modales, generación de reportes y cambio de contraseña. Las altas validan la cédula (8 dígitos) y el teléfono (8 a 15 dígitos) en el formulario y en la API (`Testing-02.md`, CP-06 y CP-07).

**Conclusión:** frontend administrativo conectado a la API. Faltan la exportación de informes en PDF o Excel, el listado de alumnos, el informe de talleristas y la consulta de datos sensibles.

### Tallerista

Dispone de dashboard, perfil, mis talleres, detalle del taller, asistencia, informes, detalle de informe, material y corrección de tareas.

Mantiene la arquitectura modular por pantalla, alimentada por la API: solo accede a los talleres que tiene asignados (`Testing-01.md`, NF-03).

**Conclusión:** frontend conectado a la API. La interfaz no ofrece adjuntar archivos al material, eliminar notas ni cambiar la contraseña, aunque la API lo admite.

### Alumno

Hay siete páginas: dashboard, mis talleres, detalle del taller, tareas, detalle de tarea, asistencia y perfil, con su carpeta `js/` de diez módulos.

Las páginas consultan sus talleres, material, tareas y asistencias, y envían entregas a través de la API. La asistencia se obtiene de `GET /mis-asistencias` y muestra los registros reales (`Testing-02.md`, CP-01).

**Conclusión:** panel conectado a la API. La interfaz no ofrece el cambio de contraseña, aunque la API lo admite.

### API

Expone 55 rutas que cubren autenticación y perfil (incluido el cambio de contraseña), alumnos, talleristas, talleres, asignaciones e inscripciones, asistencias, reportes, contenidos, entregas y adjuntos. Cada ruta declara qué rol puede usarla, y la verificación se aplica tanto por rol como por pertenencia: un tallerista solo accede a los talleres que tiene asignados. Los reportes los genera el administrador (tipos General y Asistencia) y el tallerista consulta los de sus talleres.

**Conclusión:** la cobertura funcional es amplia, el control de acceso está correctamente implementado y verificado en las pruebas, y la API está documentada en `api.md`.

---

<br>

## 4. Principales incoherencias detectadas

### 4.1 Script de base de datos duplicado — **Resuelto**

La copia sin uso `backend/DataBase/inau_talleres.sql` se eliminó (Control de Cambios, CC-14). El único script es `backend/api-completa/DataBase/inau_talleres.sql`, que carga el entorno Docker e incluye `SET NAMES utf8mb4;` al inicio.

### 4.2 Clave secreta por defecto en el `compose`

La API firma sus tokens de sesión con una clave que debe permanecer secreta. De los dos caminos por los que esa clave llegaba publicada, uno está resuelto:

| Archivo | Situación |
|---|---|
| `backend/api-completa/.env.example` y `.env.docker.example` | **Resuelto:** `SECRET_KEY` queda vacía, y `config.php` impide arrancar sin configurarla |
| `backend/api-completa/compose.yaml` | **Pendiente:** define `SECRET_KEY:-f6e5…`, una clave por defecto, de modo que `docker compose up` arranca sin pedir configuración |

El valor por defecto del `compose` evita que actúe la comprobación de `config.php`: el contenedor siempre recibe una clave, y esa clave es pública. Cualquiera con acceso al repositorio puede generar un token de administrador válido para un entorno levantado así **sin conocer ninguna contraseña**.

**Acción recomendada:** hacer que `compose.yaml` exija la variable en lugar de proveer un valor por defecto. Dado que la clave ya figura en el historial de Git, ningún entorno debe seguir usándola.

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

### 4.7 La API expone detalles de la base de datos ante un error

Los controladores capturan las excepciones con `catch (Exception $e)` —50 bloques en total—, que también alcanza a las de base de datos, y devuelven el mensaje original al cliente. El resultado es que un fallo interno puede enviar al navegador el error de MySQL completo, con nombres de tablas y columnas, y además informarlo con un código engañoso: 404 o 400 en lugar de 500.

`index.php` ya contiene el manejo correcto —registra el detalle en el log y responde con un mensaje genérico—, pero no llega a ejecutarse porque los controladores atrapan la excepción antes.

**Acción recomendada:** hacer que los controladores dejen pasar las excepciones de base de datos (`PDOException`) hacia el manejador de `index.php`.

### 4.8 El README de la API no refleja el proyecto

`backend/api-completa/README.md` proviene de la plantilla original del curso: indica instalar Laragon o XAMPP, menciona "productos" como datos de ejemplo y propone usuarios de prueba (`admin@utu.edu.uy`) que no existen en el proyecto. No describe el entorno Docker que el proyecto utiliza (Control de Cambios, CC-06) ni las 55 rutas, que hoy se documentan en `api.md`.

**Acción recomendada:** reescribir el README de la API con la puesta en marcha mediante Docker y una remisión a `api.md`.

### 4.9 El README del proyecto no refleja el estado actual — **Resuelto**

El README se actualizó con la estructura real del repositorio, las tecnologías utilizadas y el estado del desarrollo.

### 4.10 Documentación técnica pendiente

| Documento | Estado |
|---|---|
| `docs/04-implementacion/api.md` | **Resuelto:** referencia completa de la API (27/10/2026) |
| Documentación de pruebas | **Resuelto:** carpeta `docs/04-implementacion/Testing/`, con `Testing-01.md` y `Testing-02.md` |
| `docs/01-gestion/Acta de cierre.md` | **Pendiente:** solo contiene su título |

### 4.11 Archivos con nomenclatura irregular

- **Resuelto:** `backend/.md` se reemplazó por `backend/.gitignore`.
- **Resuelto:** `Documento de Reconstruccion - Doker desktop.md` se eliminó a pedido del docente (Control de Cambios, CC-10).
- **Resuelto:** `docs/seguridad.md` se renombró a `Identificación de amenazas.md`, hoy en `05-Ciberseguridad/`.
- **Pendiente:** la carpeta `03-diseño` contiene un carácter acentuado, a diferencia de las demás. Los nombres de ruta con tildes pueden generar inconvenientes en enlaces y en determinados entornos.

### 4.12 Ausencia de `.gitignore` y `LICENSE`

- **Resuelto:** existe un `.gitignore` en la raíz que excluye `.env`. Dos de sus reglas no tienen efecto porque escriben `Backend` con mayúscula (ver 4.19, H-03).
- **Pendiente:** no existe un archivo `LICENSE`, contemplado en la plantilla original del proyecto.

### 4.13 La API no admite todos los formatos que exige NRF11 — **Resuelto**

NRF11 se modificó para admitir únicamente PDF y JPG, en coincidencia con la API (Control de Cambios, CC-13). Las pruebas confirmaron que la API rechaza los demás formatos (`Testing-01.md`, NF-04).

### 4.14 El esfuerzo del Charter no coincide con la planificación — **Resuelto**

El Charter declara 63 puntos, en coincidencia con la planificación de los seis sprints en `Doc.md`.

### 4.15 El administrador puede modificar la cédula del alumno — **Parcialmente resuelto**

En la entrevista con el cliente se estableció que la cédula del alumno no debe modificarse. El formulario de edición del panel del administrador ya presenta la cédula como solo lectura (`detalle-alumno.js`; observado en `Testing-01.md`). Sin embargo, la API sigue aceptando el campo `cedula` en `PATCH /alumnos/{id}`.

**Acción recomendada:** rechazar el cambio de cédula también en la API.

### 4.16 La dirección de la API está escrita en el código

La dirección `http://localhost:8002` figura en 15 archivos del frontend, con seis constantes distintas (`INAU_API_URL`, `ADMIN_API_URL`, `TALLERISTA_API_URL`, `ALUMNO_API_URL`, `PERFIL_API_URL` y `REPORTES_API_URL`). Para desplegar en el servidor fue necesario reemplazarla en todos los archivos (`Documento de Reconstruccion - Servidor.md`).

**Acción recomendada:** que todos los módulos usen la constante de `frontend/js/api.js`, de modo que la dirección se defina en un solo lugar.

### 4.17 Requerimientos y funciones de interfaz pendientes, según las pruebas

Las pruebas del sistema confirmaron funciones que no están implementadas o que la API admite pero la interfaz no ofrece:

| Defecto | Descripción | Requerimiento |
|---|---|---|
| DEF-02 | La exportación de informes genera un archivo JSON, no PDF ni Excel | RF13 (CC-11) |
| DEF-03 | No existe opción para generar el listado de alumnos ni el informe de talleristas | RF19, RF22 |
| DEF-04 | No existe la consulta de datos sensibles | RF24 (CC-12) |
| DEF-06 | El formulario del tallerista no permite adjuntar archivos al material | RF06 |
| DEF-07 | La interfaz del tallerista no ofrece eliminar una nota | RF17 |
| DEF-10 | El tallerista y el alumno no pueden cambiar su contraseña desde la interfaz | RF14 |

Los defectos DEF-01 a DEF-08 se registran en `Testing-01.md`; DEF-09 y DEF-10, en `Testing-02.md`. DEF-01 (asistencia del alumno con datos simulados) quedó cerrado en la segunda ronda, y DEF-05 se cerró al modificarse NRF11.

### 4.18 La comprobación de cédula repetida no normaliza el formato

La API acepta la cédula con o sin puntos y guion, pero la comprobación de duplicados compara el texto tal como se escribe: `4.999.999-1` y `49999991` se registraron como dos alumnos distintos (`Testing-02.md`, CP-08, DEF-09).

**Acción recomendada:** normalizar la cédula (solo dígitos) antes de guardarla y de buscar duplicados.

### 4.19 Hallazgos de endurecimiento de la infraestructura

`Hardening de Infraestructura y Contenedores.md` registra cinco hallazgos, verificados en el servidor de prueba:

| Hallazgo | Descripción | Estado |
|---|---|---|
| H-01 | La API y MySQL quedaban publicados en todas las interfaces de red | Corregido en el `.env` del servidor y verificado con Nmap (`Doc NMAP.md`, sección 10); `compose.yaml` conserva los valores por defecto |
| H-02 | Los archivos subidos pueden descargarse sin iniciar sesión mediante una ruta directa | Pendiente |
| H-03 | Dos reglas del `.gitignore` escriben `Backend` con mayúscula y no tienen efecto | Pendiente |
| H-04 | Los contenedores no se reinician solos tras reiniciar el servidor | Pendiente |
| H-05 | Los servicios informan su versión exacta | Pendiente |

### 4.20 Los errores de validación no usan un código único

Las rutas de alumnos, talleristas y adjuntos responden `422` ante datos inválidos, mientras que las de autenticación y perfil responden `400` (`api.md`, sección 3.1; observado en `Testing-02.md`).

**Acción recomendada:** unificar el código de respuesta para los errores de validación.

### 4.21 El Plan de Negocios conserva datos desactualizados

`06-Emprendedurismo/Plan de Negocios.md` no coincide con el resto de la documentación:

| Dato en el Plan de Negocios | Dato vigente |
|---|---|
| Costo del primer año: USD 4.395 | USD 2.667, recalculado con tres integrantes (CC-03; Charter y `Doc.md`) |
| "La revisión de coherencia del 22/09/2026 registra 47 rutas" | 55 rutas |
| "El panel del alumno sigue pendiente de completar" | Panel conectado a la API |
| "XAMPP/servidor local para desarrollo" | Docker (CC-06) |
| Vínculo a `docs/01-gestion/Acta de Reuniones.md` | El archivo está en `docs/01-gestion/Documentos del equipo/` |

Además, la misión de la empresa afirma brindar "seguridad absoluta", mientras que el análisis FODA del mismo documento reconoce que la solución no la presenta.

### 4.22 La Declaración de Ética no coincide con otros documentos

- El párrafo de la declaración afirma que la IA no se utilizó para generar contenidos, mientras que la tabla registra generación de código, la reconstrucción de la entrevista y la ejecución de las pruebas.
- La fila de la primera ronda de pruebas indica el 23/10/2026; `Testing-01.md` registra el 24/10/2026.
- La fila del frontend (desde el 07/06/2026) es anterior a la fecha de inicio del proyecto que indica el Charter (17/07/2026).
- La fila de la documentación de Docker (04/09/2026) es anterior a la decisión de adoptar Docker (CC-06, 11/09/2026).
- `Doc NMAP.md` registra una verificación asistida por IA el 25/10/2026 que la tabla no incluye.

---

<br>

## 5. Estado de requisitos funcionales

De los veintiséis requerimientos definidos, veinte integran el alcance de la primera versión y seis fueron postergados por restricción de plazo. El estado se corresponde con la sección 23 de `Doc.md`.

### Requerimientos de la primera versión

| Código | Requisito | Estado actual | Prueba |
|---|---|---|---|
| RF01 | Login y diferenciación por rol | Cumplido. | CP-01 a CP-03 |
| RF02 | Gestión de usuarios y talleres | Cumplido, con validación de cédula y teléfono; la cédula repetida en distinto formato no se detecta (4.18). | CP-04, CP-05; T2 CP-06 a CP-08 |
| RF03 | Asignación de alumnos y talleristas | Cumplido. | CP-06; T2 CP-09 |
| RF04 | Registrar asistencia | Cumplido, con los cuatro estados. | CP-07; T2 CP-02 |
| RF05 | Consultar y modificar asistencia | Cumplido: el tallerista consulta y modifica, y el alumno consulta sus registros reales. | CP-07, CP-08; T2 CP-01 |
| RF06 | Subir material y tareas | Parcial: la API admite adjuntos, pero el formulario del tallerista no permite adjuntar archivos. | CP-09 |
| RF07 | Alumno visualiza material y tareas | Cumplido. | CP-10 |
| RF08 | Alumno envía archivos | Cumplido, con comentario opcional de entrega. | CP-10 |
| RF09 | Tallerista corrige tareas | Cumplido. | CP-11 |
| RF10 | Asignar notas | Cumplido, con validación de rango de 1 a 10. | CP-11 |
| RF11 | Informes de asistencia | Cumplido (reporte de tipo Asistencia). | CP-12 |
| RF12 | Informes de talleres y talleristas | Cumplido (reporte de tipo General). | CP-12 |
| RF13 | Exportación en PDF o Excel | Pendiente: la descarga produce un archivo JSON. | CP-13 |
| RF14 | Gestión de perfil según rol | Parcial: los tres roles modifican sus datos de contacto; el cambio de contraseña está en la API para los tres roles, pero solo el administrador lo tiene en la interfaz. | CP-15; T2 CP-03 a CP-05 |
| RF16 | Eliminar material | Cumplido. | CP-09 |
| RF17 | Eliminar nota asignada | Parcial: la API lo admite, pero la interfaz no ofrece la opción. | CP-11 |
| RF19 | Generar listado de alumnos | Pendiente: no existe la opción. | CP-14 |
| RF22 | Informe de talleristas | Pendiente: no existe la opción. | CP-14 |
| RF24 | Consultar datos sensibles | Pendiente: no existe la funcionalidad. | CP-16 |
| RF25 | Listado de alumnos del taller | Cumplido. | CP-06 |

**Resumen:** 13 cumplidos, 3 parciales (RF06, RF14 y RF17) y 4 pendientes (RF13, RF19, RF22 y RF24). Los casos sin prefijo corresponden a `Testing-01.md`; los indicados con "T2", a `Testing-02.md`.

> **Observación sobre los informes:** la tabla `reportes` cuenta con rutas en la API para generarlos y consultarlos. La tabla `trazabilidad` existe en la base de datos, pero la API todavía no registra acciones en ella.

### Requerimientos postergados por plazo

| Código | Requisito |
|---|---|
| RF15 | Alumno elimina datos de su perfil |
| RF18 | Eliminar registro de asistencia |
| RF20 | Informe con histórico de calificaciones |
| RF21 | Informe con información detallada de alumnos |
| RF23 | Alumno visualiza sus notas |
| RF26 | Modificar material o tareas ya publicadas |

---

<br>

## 6. Estado de requisitos no funcionales

| Código | Requisito | Evaluación |
|---|---|---|
| NRF01 | Diseño responsive | Cumplido: las 27 páginas se adaptan a 375 px de ancho, sin desplazamiento horizontal (`Testing-01.md`, NF-01; vista simulada). |
| NRF02 | Disponibilidad 24 horas | Objetivo de despliegue, aún no demostrable; los contenedores no se reinician solos (4.19, H-04). |
| NRF03 | Rapidez en operaciones | Índices definidos en el SQL; falta medición objetiva. |
| NRF04 | Navegación clara y consistente | Cumplido en los tres paneles. |
| NRF05 | Validación en frontend y backend | Cumplido: la API valida con clases dedicadas por entidad, también cuando se envían datos sin pasar por el formulario (`Testing-02.md`, CP-06 y CP-07). |
| NRF06 | Separación frontend y backend | Cumplido: API REST con arquitectura en capas y frontend independiente que la consume. |
| NRF07 | Control de acceso por rol | Cumplido: verificación por rol y por pertenencia al taller (`Testing-01.md`, NF-02 y NF-03). |
| NRF08 | Protección de datos personales | Parcial: contraseñas con hash y consultas preparadas, pero quedan la clave por defecto del `compose` (4.2), la filtración de errores (4.7) y los archivos subidos accesibles sin sesión (4.19, H-02). |
| NRF09 | Persistencia relacional | Cumplido: un único esquema; los datos se conservan al reiniciar los contenedores (`Testing-01.md`, NF-07). |
| NRF10 | Trazabilidad | La tabla `trazabilidad` existe, pero la API no registra acciones en ella. |
| NRF11 | Restricción de formatos | Cumplido: la API admite solo PDF y JPG, según el requisito vigente (CC-13). |
| NRF12 | Restricción de tamaño | Cumplido: la API y el formulario rechazan adjuntos de más de 10 MB (`Testing-01.md`, NF-05). |
| NRF13 | Código organizado | Cumplido: frontend modular por pantalla y backend en capas. |
| NRF14 | Documentación técnica | Avanzada: resta el Acta de cierre. |
| NRF15 | Uso de Git | Implementado. |
| NRF16 | Pull Requests obligatorias | Declarado en la documentación y respaldado por el flujo de ramas del repositorio. |

---

<br>

## 7. Base de datos actual

El esquema definitivo, en `backend/api-completa/DataBase/inau_talleres.sql`, define trece tablas:

`usuarios`, `alumnos`, `talleres`, `taller_tallerista`, `horarios_taller`, `inscripciones`, `asistencias`, `registros_asistencia`, `contenidos`, `entregas`, `adjuntos`, `reportes` y `trazabilidad`.

Incluye claves primarias y foráneas, restricciones de unicidad, índices sobre las columnas de filtrado frecuente, restricciones de verificación, datos de prueba y hashes de contraseña válidos. Se corresponde con el modelo de clases documentado en `03-diseño/Modelado/`, con la correspondencia clase-tabla verificada en el Paso 5 del anexo de derivación. Es el esquema que carga el entorno Docker y contra el que trabaja la API.

El adjunto de ejemplo que registra el script no tiene archivo físico en el servidor (`Testing-01.md`, DEF-08; Plan de Contingencia, PC-12).

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

### Lo que queda pendiente

- La clave secreta por defecto del `compose` (4.2), que anula en la práctica el control de acceso descrito arriba en cualquier entorno levantado sin configurarla.
- Los archivos subidos accesibles sin sesión (4.19, H-02).
- La filtración de detalles de la base de datos ante un error (4.7).
- La limitación de intentos de inicio de sesión, cuya clase existe pero no está conectada (`Mecanismos_Autenticacion_Criptografia_INAU.md`, sección 9).
- El registro efectivo en la tabla `trazabilidad`, que NRF10 exige y la API no realiza.
- HTTPS, documentado en la guía del servidor pero no aplicado en el servidor de prueba.

---

<br>

## 9. Identidad visual

La documentación define una línea común: fondo cálido, superficies blancas, bordes discretos, tipografía del sistema, radio de borde pequeño, identidad cromática propia por rol, estados diferenciados por color, diseño responsive y componentes reutilizables.

Los tres paneles comparten la misma base y se diferencian únicamente por su paleta, criterio documentado y verificable en las tres hojas de estilo.

---

<br>

## 10. Gestión del proyecto

El proyecto cuenta con un acta de reuniones de R-01 a R-13, donde se registra la organización inicial del equipo, la entrevista con el cliente, la distribución de tareas, las dificultades de participación, los cambios de alcance, los avances de documentación, el desarrollo del backend y la división de áreas para la defensa. El Control de Cambios registra catorce cambios (CC-01 a CC-14), con su impacto y su estado. La declaración sobre las instancias de Sprint Review deja constancia de que no se realizaron Sprint Reviews con el cliente en ninguno de los seis sprints, dado que el único contacto con INAU fue la entrevista inicial (R-02 y R-03). El Acta de cierre está creada, pero sin contenido.

El Charter establece a INAU como cliente y patrocinador, a Emiliano Sánchez como líder y Scrum Master, tres integrantes, una duración de doce semanas organizadas en seis sprints quincenales, un esfuerzo estimado de sesenta y tres puntos y los riesgos principales del proyecto. Su situación inicial del cliente coincide con la de `Doc.md`.

---

<br>

## 11. Conclusión de coherencia

### Lo que está bien alineado

1. La arquitectura frontend → API REST → PHP → MySQL es consistente entre la documentación y lo implementado, y los tres paneles consumen la API.
2. El stack de Bootstrap, HTML, CSS y JavaScript sin framework coincide con la justificación tecnológica.
3. El esquema SQL definitivo se corresponde con el modelo de clases, con trazabilidad verificada paso a paso, y es el único que existe en el repositorio.
4. El alcance incluido, el excluido y el ajuste por plazo son coherentes entre el documento principal, el Charter y el modelo.
5. El control de acceso de la API cumple lo que NRF07 exige y fue verificado en las pruebas.
6. La estructura por capas de la API coincide con la separación descrita en la justificación tecnológica y en `api.md`.
7. El inicio de sesión por correo es coherente entre la API, el frontend y la documentación de identidad visual.
8. El entorno Docker es reproducible: se desplegó en un servidor de prueba siguiendo la guía del repositorio.
9. El estado de los requerimientos coincide entre `Doc.md` (sección 23), esta revisión y los resultados de las pruebas.
10. El conteo de archivos coincide entre el repositorio, el `README.md` y `Estructura del Repositorio.md`.

### Lo que debe corregirse prioritariamente

1. Retirar la clave secreta por defecto del `compose` y generar claves nuevas.
2. Impedir la descarga de archivos subidos sin sesión (H-02).
3. Evitar que la API exponga detalles de la base de datos ante un error.
4. Implementar la exportación en PDF o Excel, el listado de alumnos, el informe de talleristas y la consulta de datos sensibles.
5. Completar en la interfaz el adjunto de archivos al material, la eliminación de notas y el cambio de contraseña del tallerista y del alumno.
6. Normalizar la cédula para detectar duplicados y rechazar su modificación en la API.
7. Agregar la política de reinicio de los contenedores, limitar los puertos en `compose.yaml` y corregir el `.gitignore`.
8. Retirar `mock-data.js`, las funciones sin uso y el `auth.js` vacío.
9. Centralizar la dirección de la API en un solo archivo.
10. Crear una hoja de estilos propia para el login.
11. Implementar el registro de trazabilidad.
12. Actualizar el README de la API, el Plan de Negocios y la Declaración de Ética.
13. Redactar el Acta de cierre.

---

<br>

## 12. Orden recomendado de trabajo

```text
1. Retirar la clave por defecto del compose y generar claves nuevas
        ↓
2. Proteger los archivos subidos (H-02) y corregir la filtración de errores de la API
        ↓
3. Política de reinicio, puertos en compose.yaml y .gitignore (H-01, H-03, H-04)
        ↓
4. Normalizar y bloquear la cédula en la API
        ↓
5. Completar las funciones de interfaz: adjuntos, eliminar nota y cambio de contraseña
        ↓
6. Implementar la exportación PDF/Excel, los listados y la consulta de datos sensibles
        ↓
7. Retirar los datos simulados y centralizar la dirección de la API
        ↓
8. Implementar la trazabilidad
        ↓
9. Actualizar el README de la API, el Plan de Negocios y la Declaración de Ética
        ↓
10. Nueva ronda de pruebas sobre lo corregido
        ↓
11. Redactar el Acta de cierre
```