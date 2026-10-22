# Revisión integral de coherencia — Proyecto TheNewfutures / INAU

**Fecha de revisión:** 21 de octubre de 2026
**Fuente:** rama `cambios-frontend` del repositorio `proyecto-convenio-INAU`.
**Alcance:** documentación, estructura de repositorio, HTML, CSS, JavaScript, PHP y SQL presentes en el repositorio.

> Esta revisión distingue entre lo que está realmente presente en el repositorio, lo que la documentación declara y lo que todavía está planificado. No se considera una implementación como terminada solo porque esté descrita en un documento.

---

## 1. Diagnóstico general

El proyecto tiene una **arquitectura general coherente** y una separación clara entre frontend, backend y documentación. Desde la revisión anterior el cambio más importante es que **el frontend quedó integrado con la API**: los tres paneles consumen la API REST en PHP, que ahora expone 53 rutas, y el inicio de sesión se resuelve por correo y contraseña con redirección según el rol.

Los paneles del administrador y del tallerista están completos y conectados a la API; el del alumno también, salvo la asistencia, que conserva datos simulados. El entorno se levanta con Docker y su puesta en marcha quedó documentada y probada. La documentación está organizada por etapa y casi completa.

Los problemas pendientes se concentran en tres frentes: **la API expone detalles de la base de datos ante un error**, **el `compose` todavía provee una clave secreta por defecto**, y **la documentación técnica de la API, las pruebas y el cierre siguen vacíos**.

### Estado general

| Área | Estado | Observación |
|---|---|---|
| Análisis del problema | Completo | Entrevista, análisis, requerimientos, historias de usuario y backlog. |
| Alcance | Definido | Alcance incluido, excluido y ajuste por plazo documentados de forma coherente. |
| Frontend tallerista | Completo | Nueve páginas conectadas a la API, incluida la gestión de material y tareas y la corrección de entregas. |
| Frontend administrador | Completo | Once páginas conectadas a la API, incluida la generación de reportes. |
| Frontend alumno | Avanzado | Siete páginas conectadas a la API, salvo la asistencia, que conserva datos simulados. |
| Login | Completo | Acceso por correo y contraseña en `frontend/index.html`, autenticación contra la API y redirección por rol. |
| Backend PHP | Implementado | 53 rutas en arquitectura por capas, con autenticación JWT y verificación de rol por ruta. |
| Base de datos | Completa | Trece tablas con claves, restricciones, índices y datos de prueba. Un único esquema, con una copia duplicada pendiente de eliminar (ver 4.1). |
| API REST | Implementada | Sin documentar: `docs/04-implementacion/api.md` está vacío. |
| Modelo de datos documental | Completo | Modelo de clases, MER, anexo de derivación y análisis del modelo, alineados con el SQL actual. |
| Planificación documental | Resuelto | El backlog priorizado de los seis sprints está en `Doc.md`; `planificacion.md` fue eliminado. |
| Seguridad | Mixta | El control de acceso de la API es sólido; quedan una clave por defecto en el `compose` (ver 4.2) y la filtración de errores (ver 4.7). |
| Infraestructura | Implementada | Entorno Docker en `backend/api-completa`, con su puesta en marcha probada en Docker Desktop y documentada para un servidor. |
| Identidad visual | Definida | Documentación completa y hojas de estilo por panel. |
| Uso ético de IA | Documentado | Declaración con registro de herramientas utilizadas y firmas. |
| Gestión | Avanzada | Actas de reuniones R-01 a R-12 y declaración sobre las instancias de Sprint Review; el Acta de cierre está sin contenido. |

---

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

**Total: 172 archivos en el repositorio.**

---

## 3. Coherencia funcional por rol

### Administrador

Dispone de pantallas para dashboard, talleristas, detalle de tallerista, alumnos, detalle de alumno, talleres, detalle de taller, asistencias, reportes, detalle de reporte y perfil.

Las pantallas obtienen y modifican los datos a través de la API: listados, búsquedas, detalles, estadísticas, formularios con ventanas modales y generación de reportes.

**Conclusión:** frontend administrativo completo y conectado a la API.

### Tallerista

Dispone de dashboard, perfil, mis talleres, detalle del taller, asistencia, informes, detalle de informe, material y corrección de tareas.

Mantiene la arquitectura modular por pantalla, ahora alimentada por la API: solo accede a los talleres que tiene asignados.

**Conclusión:** frontend completo y conectado a la API.

### Alumno

Hay siete páginas: dashboard, mis talleres, detalle del taller, tareas, detalle de tarea, asistencia y perfil, con su carpeta `js/` de diez módulos.

Las páginas consultan sus talleres, material y tareas, y envían entregas a través de la API. La excepción es la asistencia, que todavía se calcula a partir de `mock-data.js`.

**Conclusión:** panel funcional y conectado a la API, con la asistencia pendiente de integración.

### API

Expone 53 rutas que cubren autenticación y perfil, alumnos, talleristas, talleres, asignaciones e inscripciones, asistencias, reportes, contenidos, entregas y adjuntos. Cada ruta declara qué rol puede usarla, y la verificación se aplica tanto por rol como por pertenencia: un tallerista solo accede a los talleres que tiene asignados. Los reportes los genera el administrador (tipos General y Asistencia) y el tallerista consulta los de sus talleres.

**Conclusión:** la cobertura funcional es amplia, el control de acceso está correctamente implementado y el frontend ya la consume. Lo pendiente es su documentación.

---

## 4. Principales incoherencias detectadas

### 4.1 Script de base de datos duplicado

El segundo esquema divergente que señalaba la revisión anterior (`backend/api/database.sql`) ya no existe, y la API trabaja contra el esquema definitivo. El script incluye además `SET NAMES utf8mb4;` al inicio, lo que evita que una importación por consola corrompa tildes y eñes.

Lo que queda es una duplicación: el mismo script figura en dos ubicaciones, con contenido idéntico salvo espacios en blanco.

| Archivo | Estado |
|---|---|
| `backend/api-completa/DataBase/inau_talleres.sql` | Script en uso: es el que carga el entorno Docker |
| `backend/DataBase/inau_talleres.sql` | Copia sin uso |

Ambos comienzan con `DROP DATABASE IF EXISTS`, y mantener dos copias abre la puerta a que vuelvan a divergir.

**Acción recomendada:** eliminar `backend/DataBase/` y conservar únicamente el script de `backend/api-completa/DataBase/`.

### 4.2 Clave secreta por defecto en el `compose`

La API firma sus tokens de sesión con una clave que debe permanecer secreta. De los dos caminos por los que esa clave llegaba publicada, uno está resuelto:

| Archivo | Situación |
|---|---|
| `backend/api-completa/.env.example` | **Resuelto:** `SECRET_KEY` queda vacía, y `config.php` impide arrancar sin configurarla |
| `backend/api-completa/compose.yaml` | **Pendiente:** define `SECRET_KEY:-f6e5…`, una clave por defecto, de modo que `docker compose up` arranca sin pedir configuración |

El valor por defecto del `compose` evita que actúe la comprobación de `config.php`: el contenedor siempre recibe una clave, y esa clave es pública. Cualquiera con acceso al repositorio puede generar un token de administrador válido para un entorno levantado así **sin conocer ninguna contraseña**.

**Acción recomendada:** hacer que `compose.yaml` exija la variable en lugar de proveer un valor por defecto. Dado que la clave ya figura en el historial de Git, ningún entorno debe seguir usándola.

### 4.3 Datos simulados residuales en el frontend

La divergencia de identificadores entre `mock-data.js` y el SQL que señalaba la revisión anterior dejó de tener efecto, porque los paneles obtienen sus datos de la API. Sin embargo, las 27 páginas de los tres paneles siguen cargando `mock-data.js`, cuando el único módulo que todavía lo usa es la asistencia del alumno. El encabezado de `frontend-admin/js/mock-data.js` sigue afirmando que no existe conexión con PHP ni MySQL.

**Acción recomendada:** retirar la carga de `mock-data.js` de las páginas que ya no lo usan y eliminar esos archivos al integrar la asistencia del alumno.

### 4.4 El panel del alumno referencia archivos inexistentes — **Resuelto**

La carpeta `frontend-alumno/js/` existe con diez módulos y las páginas consumen la API. Queda pendiente únicamente la asistencia, tratada en 4.3.

### 4.5 El login del frontend no consume la API — **Resuelto**

`frontend/index.html` procesa el formulario con `js/api.js` y `js/auth.js`, autentica contra la API y redirige según el rol. El criterio de acceso quedó unificado por **correo electrónico**, y la documentación de identidad visual ya lo refleja.

Queda un residuo: `frontend-admin/js/auth.js` es un archivo vacío (0 bytes) que corresponde eliminar.

### 4.6 El login depende de la hoja de estilos de otro panel

`frontend/index.html` carga sus estilos desde `frontend-tallerista/css/styles.css`. La ruta ya es relativa, por lo que se resolvió el problema de funcionamiento según dónde se sirva el sitio; lo que persiste es que la pantalla de acceso —que no pertenece a ningún rol— depende de la hoja de estilos de un panel específico.

**Acción recomendada:** crear una hoja de estilos propia para el login, en una carpeta común.

### 4.7 La API expone detalles de la base de datos ante un error

Los controladores capturan las excepciones con `catch (Exception $e)` —49 bloques en total—, que también alcanza a las de base de datos, y devuelven el mensaje original al cliente. El resultado es que un fallo interno envía al navegador el error de MySQL completo, con nombres de tablas y columnas, y además lo informa con un código engañoso: 404 o 400 en lugar de 500.

`index.php` ya contiene el manejo correcto —registra el detalle en el log y responde con un mensaje genérico—, pero nunca llega a ejecutarse porque los controladores atrapan la excepción antes.

**Acción recomendada:** hacer que los controladores dejen pasar las excepciones de base de datos (`PDOException`) hacia el manejador de `index.php`.

### 4.8 El README de la API documenta usuarios de prueba inexistentes

La tabla de credenciales de `backend/api-completa/README.md` proviene de la plantilla original del curso: propone `admin@utu.edu.uy` y `alumno@utu.edu.uy`, con un rol `usuario` que no existe en el modelo. Los datos de prueba reales del proyecto son otros.

### 4.9 El README del proyecto no refleja el estado actual — **Resuelto**

El README se actualizó con la estructura real del repositorio, las tecnologías utilizadas y el estado del desarrollo.

### 4.10 Documentación técnica pendiente

Tres documentos permanecen sin contenido:

```text
docs/04-implementacion/api.md
docs/04-implementacion/testing.md
docs/01-gestion/Acta de cierre.md
```

`api.md` ya cuenta con material disponible: la API está implementada con 53 rutas. El Acta de cierre solo contiene su título.

El caso de `planificacion.md` está **resuelto**: el archivo se eliminó, dado que la planificación real —el backlog priorizado de los seis sprints— está en `Doc.md`.

### 4.11 Archivos con nomenclatura irregular

- `backend/.md` es un archivo cuyo nombre consiste únicamente en la extensión. Si su función es preservar la carpeta en el control de versiones, corresponde renombrarlo a `.gitkeep`.
- `Documento de Reconstruccion - Doker desktop.md` tiene un error de escritura en el nombre ("Doker" por "Docker"). Corregirlo exige actualizar las referencias en los documentos que lo citan.
- La carpeta `03-diseño` contiene un carácter acentuado, a diferencia de las demás. Los nombres de ruta con tildes pueden generar inconvenientes en enlaces y en determinados entornos.
- **Resuelto:** `docs/seguridad.md` no se había perdido. En la reorganización de carpetas se renombró a `Identificación de amenazas.md`, hoy en `05-Ciberseguridad/`, con el mismo contenido.

### 4.12 Ausencia de `.gitignore` y `LICENSE`

Ambos archivos están contemplados en la plantilla original del proyecto y no se encuentran en la raíz del repositorio; solo existe un `.gitignore` dentro de `backend/api-completa/storage/`. El `.gitignore` resulta especialmente relevante: sin él, nada impide que el archivo `.env` con la clave secreta y las credenciales de base de datos termine versionado.

### 4.13 La API no admite todos los formatos que exige NRF11

NRF11 establece como formatos permitidos PDF, imágenes JPG y documentos de oficina (DOCX, XLSX, PPTX). El validador de adjuntos de la API acepta únicamente PDF y JPG. Los propios datos de prueba del SQL incluyen una entrega en formato `.docx`, que la API rechazaría si se subiera por la interfaz.

**Acción recomendada:** incorporar los tipos de documentos de oficina al validador de adjuntos, o bien ajustar NRF11 si se decide restringir los formatos en la primera versión.

### 4.14 El esfuerzo del Charter no coincide con la planificación — **Resuelto**

El Charter declaraba un esfuerzo de 76 puntos, mientras que `Doc.md` planifica los seis sprints con 63, la estimación afinada al desglosar las historias de usuario. El Charter se actualizó y ya declara 63 puntos.

### 4.15 El administrador puede modificar la cédula del alumno

En la entrevista con el cliente se estableció que la cédula del alumno no debe modificarse. Sin embargo, el formulario de edición del panel del administrador (`editar-alumno-cedula`, en `detalle-alumno.html`) permite cambiarla.

**Acción recomendada:** dejar el campo como solo lectura y rechazar el cambio también en la API.

### 4.16 La dirección de la API está escrita en el código

La dirección `http://localhost:8002` figura en 12 archivos del frontend, con cuatro constantes distintas (`INAU_API_URL`, `TALLERISTA_API_URL`, `ALUMNO_API_URL` y `REPORTES_API_URL`). Desplegar en otro entorno exige reemplazarla archivo por archivo.

**Acción recomendada:** que todos los módulos usen la constante de `frontend/js/api.js`, de modo que la dirección se defina en un solo lugar.

---

## 5. Estado de requisitos funcionales

De los veintiséis requerimientos definidos, veinte integran el alcance de la primera versión y seis fueron postergados por restricción de plazo.

### Requerimientos de la primera versión

| Código | Requisito | Estado actual |
|---|---|---|
| RF01 | Login y diferenciación por rol | API y frontend implementados. |
| RF02 | Gestión de usuarios y talleres | API y frontend implementados. |
| RF03 | Asignación de alumnos y talleristas | API y frontend implementados. |
| RF04 | Registrar asistencia | API y frontend implementados. |
| RF05 | Consultar y modificar asistencia | API y frontend implementados; la vista de asistencia del alumno conserva datos simulados. |
| RF06 | Subir material y tareas | API y frontend implementados, incluida la carga de adjuntos. |
| RF07 | Alumno visualiza material y tareas | API y frontend implementados. |
| RF08 | Alumno envía archivos | API y frontend implementados, con comentario opcional de entrega. |
| RF09 | Tallerista corrige tareas | API y frontend implementados. |
| RF10 | Asignar notas | API implementada, con validación de rango; frontend implementado. |
| RF11 | Informes de asistencia | API implementada (reporte de tipo Asistencia); frontend conectado. |
| RF12 | Informes de talleres y talleristas | API implementada (reporte de tipo General); frontend conectado. |
| RF13 | Exportación en PDF o Excel | No implementada: la descarga actual produce un archivo JSON. |
| RF14 | Gestión de perfil según rol | API y frontend implementados, con sincronización entre `usuarios` y `alumnos`. |
| RF16 | Eliminar material | API y frontend implementados. |
| RF17 | Eliminar nota asignada | API y frontend implementados. |
| RF19 | Generar listado de alumnos | A verificar: no se identificó en el código un informe específico. |
| RF22 | Informe de talleristas | A verificar: no se identificó en el código un informe específico. |
| RF24 | Consultar datos sensibles | No implementado. |
| RF25 | Listado de alumnos del taller | API y frontend implementados. |

> **Observación sobre los informes:** la tabla `reportes` ya cuenta con rutas en la API para generarlos y consultarlos. La tabla `trazabilidad` existe en la base de datos, pero la API todavía no registra acciones en ella. La exportación en PDF o Excel (RF13) resta implementarse.

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

## 6. Estado de requisitos no funcionales

| Código | Requisito | Evaluación |
|---|---|---|
| NRF01 | Diseño responsive | Implementado mediante Bootstrap y hojas de estilo propias. |
| NRF02 | Disponibilidad 24 horas | Objetivo de despliegue, aún no demostrable. |
| NRF03 | Rapidez en operaciones | Índices definidos en el SQL; falta medición objetiva. |
| NRF04 | Navegación clara y consistente | Cumplido en los tres paneles. |
| NRF05 | Validación en frontend y backend | Cumplido: la API valida con clases dedicadas por entidad, además de la validación del frontend. |
| NRF06 | Separación frontend y backend | Cumplido: API REST con arquitectura en capas y frontend independiente que la consume. |
| NRF07 | Control de acceso por rol | Cumplido en la API: verificación por rol y por pertenencia al taller en cada ruta. |
| NRF08 | Protección de datos personales | Parcial: contraseñas con hash y consultas preparadas, pero queda una clave por defecto en el `compose` (4.2) y la filtración de errores (4.7). |
| NRF09 | Persistencia relacional | Cumplido: un único esquema, con una copia duplicada pendiente de eliminar (4.1). |
| NRF10 | Trazabilidad | La tabla `trazabilidad` existe, pero la API no registra acciones en ella. |
| NRF11 | Restricción de formatos | Parcial: la API restringe los formatos, pero solo admite PDF y JPG, sin los documentos de oficina que el requisito incluye (4.13). |
| NRF12 | Restricción de tamaño | Cumplido: la API rechaza adjuntos de más de 10 MB. |
| NRF13 | Código organizado | Cumplido: frontend modular por pantalla y backend en capas. |
| NRF14 | Documentación técnica | Avanzada; restan `api.md`, `testing.md` y el Acta de cierre. |
| NRF15 | Uso de Git | Implementado. |
| NRF16 | Pull Requests obligatorias | Declarado en la documentación y respaldado por el flujo de ramas del repositorio. |

---

## 7. Base de datos actual

El esquema definitivo, en `backend/api-completa/DataBase/inau_talleres.sql`, define trece tablas:

`usuarios`, `alumnos`, `talleres`, `taller_tallerista`, `horarios_taller`, `inscripciones`, `asistencias`, `registros_asistencia`, `contenidos`, `entregas`, `adjuntos`, `reportes` y `trazabilidad`.

Incluye claves primarias y foráneas, restricciones de unicidad, índices sobre las columnas de filtrado frecuente, restricciones de verificación, datos de prueba y hashes de contraseña válidos. Se corresponde con el modelo de clases documentado en `03-diseño/Modelado/`, con la correspondencia clase-tabla verificada en el Paso 5 del anexo de derivación. Es el esquema que carga el entorno Docker y contra el que trabaja la API.

---

## 8. Seguridad

El documento de identificación de amenazas reconoce tres riesgos principales:

| Amenaza | Probabilidad | Impacto | Riesgo | Clasificación |
|---|---:|---:|---:|---|
| Phishing | 4 | 3 | 12 | Crítico |
| XSS | 3 | 3 | 9 | Tolerable |
| Ransomware | 2 | 4 | 8 | Tolerable |

Los mecanismos de autenticación y criptografía que aplica la API se describen en `05-Ciberseguridad/Mecanismos_Autenticacion_Criptografia_INAU.md`.

### Lo que está bien resuelto en la API

- **Control de acceso**: cada ruta declara los roles admitidos, y la verificación alcanza también la pertenencia. Un tallerista no puede leer ni modificar datos de un taller que no dicta.
- **Consultas preparadas** en todos los repositorios, lo que previene la inyección SQL.
- **Listas blancas de campos** en las actualizaciones que arman la consulta dinámicamente.
- **Contraseñas con hash**, verificadas con la función correspondiente; el token viaja en una cookie que el JavaScript del navegador no puede leer.

### Lo que queda pendiente

- La clave secreta por defecto del `compose` (4.2), que anula en la práctica el control de acceso descrito arriba en cualquier entorno levantado sin configurarla.
- La filtración de detalles de la base de datos ante un error (4.7).
- El registro efectivo en la tabla `trazabilidad`, que NRF10 exige y la API no realiza.

En el JavaScript del frontend se observa el uso de funciones de escape y de `textContent` en varios módulos, lo que indica que las decisiones anti-XSS ya se aplican.

---

## 9. Identidad visual

La documentación define una línea común: fondo cálido, superficies blancas, bordes discretos, tipografía del sistema, radio de borde pequeño, identidad cromática propia por rol, estados diferenciados por color, diseño responsive y componentes reutilizables.

Los tres paneles comparten la misma base y se diferencian únicamente por su paleta, criterio documentado y verificable en las tres hojas de estilo.

---

## 10. Gestión del proyecto

El proyecto cuenta con un acta de reuniones de R-01 a R-12, donde se registra la organización inicial del equipo, la entrevista con el cliente, la distribución de tareas, las dificultades de participación, los cambios de alcance, los avances de documentación y el desarrollo del backend. La declaración sobre las instancias de Sprint Review deja constancia de que no se realizaron Sprint Reviews con el cliente en ninguno de los seis sprints, dado que el único contacto con INAU fue la entrevista inicial (R-02 y R-03). El Acta de cierre está creada, pero sin contenido.

El Charter establece a INAU como cliente y patrocinador, a Emiliano Sánchez como líder y Scrum Master, tres integrantes, una duración de doce semanas organizadas en seis sprints quincenales, un esfuerzo estimado de sesenta y tres puntos y los riesgos principales del proyecto.

---

## 11. Conclusión de coherencia

### Lo que está bien alineado

1. La arquitectura frontend → API REST → PHP → MySQL es consistente entre la documentación y lo implementado, y el frontend ya consume la API.
2. El stack de Bootstrap, HTML, CSS y JavaScript sin framework coincide con la justificación tecnológica.
3. El esquema SQL definitivo se corresponde con el modelo de clases, con trazabilidad verificada paso a paso, y es el que usa la API.
4. El alcance incluido, el excluido y el ajuste por plazo son coherentes entre el documento principal, el Charter y el modelo.
5. El control de acceso de la API cumple lo que NRF07 exige y lo que la política de seguridad declara.
6. La estructura por capas de la API coincide con la separación descrita en la justificación tecnológica.
7. El inicio de sesión por correo es coherente entre la API, el frontend y la documentación de identidad visual.
8. El entorno Docker es reproducible y su puesta en marcha está documentada y probada.

### Lo que debe corregirse prioritariamente

1. Retirar la clave secreta por defecto del `compose` y generar claves nuevas.
2. Evitar que la API exponga detalles de la base de datos ante un error.
3. Eliminar el script de base de datos duplicado.
4. Crear `.gitignore` y `LICENSE`; renombrar `backend/.md` a `.gitkeep`.
5. Alinear los formatos de adjuntos de la API con NRF11.
6. Impedir la modificación de la cédula del alumno.
7. Integrar la asistencia del alumno con la API y retirar `mock-data.js` y el `auth.js` vacío.
8. Centralizar la dirección de la API en un solo archivo.
9. Crear una hoja de estilos propia para el login.
10. Implementar la exportación en PDF o Excel y el registro de trazabilidad.
11. Actualizar el README de la API.
12. Completar `api.md`, `testing.md` y el Acta de cierre.

---

## 12. Orden recomendado de trabajo

```text
1. Retirar la clave por defecto del compose y generar claves nuevas
        ↓
2. Crear .gitignore antes de cualquier despliegue
        ↓
3. Corregir la filtración de errores de la API
        ↓
4. Eliminar el script SQL duplicado
        ↓
5. Alinear los formatos de adjuntos con NRF11 y bloquear la cédula del alumno
        ↓
6. Integrar la asistencia del alumno y retirar los datos simulados
        ↓
7. Centralizar la dirección de la API en el frontend
        ↓
8. Implementar la exportación PDF/Excel y la trazabilidad
        ↓
9. Actualizar el README de la API
        ↓
10. Completar api.md con las rutas implementadas
        ↓
11. Testing integral y completar testing.md
        ↓
12. Redactar el Acta de cierre
```