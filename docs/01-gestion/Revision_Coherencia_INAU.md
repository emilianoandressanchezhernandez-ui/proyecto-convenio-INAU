# Revisión integral de coherencia — Proyecto TheNewfutures / INAU

**Fecha de revisión:** 22 de septiembre de 2026
**Fuente:** rama `main` del repositorio `proyecto-convenio-INAU`.
**Alcance:** documentación, estructura de repositorio, HTML, CSS, JavaScript, PHP y SQL presentes en el repositorio.

> Esta revisión distingue entre lo que está realmente presente en el repositorio, lo que la documentación declara y lo que todavía está planificado. No se considera una implementación como terminada solo porque esté descrita en un documento.

---

## 1. Diagnóstico general

El proyecto tiene una **arquitectura general coherente** y una separación clara entre frontend, backend y documentación. Desde la revisión anterior el cambio más importante es que **el backend dejó de ser una previsión**: `main` incorpora una API REST en PHP con 47 rutas, organizada en capas, con autenticación por token y control de acceso por rol.

El frontend del tallerista sigue siendo el bloque más maduro; el del administrador tiene todas sus pantallas con lógica; el del alumno conserva las vistas HTML y CSS pero no tiene JavaScript. La documentación está reorganizada por etapa y casi completa.

Los problemas pendientes se concentran en tres frentes: **dos esquemas SQL divergentes conviviendo en el repositorio**, **dos claves secretas publicadas en el código de la API**, y la falta de integración entre el frontend y la API.

### Estado general

| Área | Estado | Observación |
|---|---|---|
| Análisis del problema | Completo | Entrevista, análisis, requerimientos, historias de usuario y backlog. |
| Alcance | Definido | Alcance incluido, excluido y ajuste por plazo documentados de forma coherente. |
| Frontend tallerista | Avanzado | Nueve páginas con lógica completa y datos simulados, incluida la gestión de material y la corrección de entregas. |
| Frontend administrador | Avanzado | Once páginas y quince módulos de JavaScript funcionales con datos simulados. |
| Frontend alumno | Inicial | Siete páginas HTML y hoja de estilos; no existe carpeta `js/`. |
| Login | Pendiente de integración | La API resuelve la autenticación; el frontend todavía no la consume. |
| Backend PHP | Implementado | 47 rutas en arquitectura por capas, con autenticación JWT y verificación de rol por ruta. |
| Base de datos | Completa como diseño | Trece tablas con claves, restricciones, índices y datos de prueba. Conviven dos scripts divergentes (ver 4.1). |
| API REST | Implementada | Sin documentar: `docs/04-implementacion/api.md` está vacío. |
| Modelo de datos documental | Completo | Modelo de clases, MER, anexo de derivación y análisis del modelo. |
| Planificación documental | Integrada en Doc.md | El backlog priorizado de los seis sprints está en `Doc.md` (§22). El archivo `planificacion.md` solo contenía un resumen general redundante y se elimina (ver 4.10). |
| Seguridad | Mixta | El control de acceso de la API es sólido; hay dos claves secretas publicadas en el repositorio (ver 4.2). |
| Infraestructura | Definida como propuesta | Documentación de entorno Docker; el stack todavía no está reflejado en el repositorio. |
| Identidad visual | Definida | Documentación completa y hojas de estilo por panel. |
| Uso ético de IA | Documentado | Declaración con registro de herramientas utilizadas y firmas. |

---

## 2. Estructura actual real del repositorio

```text
proyecto-convenio-INAU/
│
├── index.html
├── README.md
│
├── backend/
│   ├── .md
│   ├── DataBase/
│   │   └── inau_talleres.sql        → esquema definitivo del proyecto
│   └── api/                         → API REST en PHP (47 rutas)
│       ├── index.php  routes.php  config.php
│       ├── core/                    → Router, AuthMiddleware, Token, Database
│       ├── controllers/  services/  repositories/
│       ├── validators/  dtos/  models/
│       ├── docker/  compose.yaml
│       └── database.sql             → segundo esquema, divergente (ver 4.1)
│
├── docs/
│   ├── Estructura del Repositorio.md
│   │
│   ├── 01-gestion/
│   │   ├── Acta de Reuniones.md
│   │   ├── Charter.md
│   │   ├── Declaración de Etica en el uso de IA.md
│   │   └── Revision_Coherencia_INAU.md
│   │
│   ├── 02-analisis/
│   │   ├── Doc.md
│   │   └── requerimientos.md
│   │
│   ├── 03-diseño/
│   │   ├── Identidad Visual.md
│   │   ├── Justificacion Tecnologica.md
│   │   └── Modelado/
│   │       ├── Análisis del Modelo.md
│   │       ├── anexo-derivacion-uml.md
│   │       └── modelo-clases-uml-mer.md
│   │
│   ├── 04-implementacion/
│   │   ├── PrimeraVista.md
│   │   ├── api.md
│   │   ├── inau-infraestructura-docker.md
│   │   └── testing.md
│   │
│   └── ciberseguridad/
│       └── Identificación de amenazas.md
│
└── frontend/
    ├── frontend-admin/
    ├── frontend-alumno/
    └── frontend-tallerista/
```

### Conteo real

| Componente | HTML | JS | CSS |
|---|---:|---:|---:|
| Administrador | 11 | 15 | 1 |
| Tallerista | 9 | 12 | 1 |
| Alumno | 7 | 0 | 1 |
| Login (raíz) | 1 | 0 | usa CSS del panel tallerista |
| Backend (PHP) | — | — | 72 archivos en total |

**Total: 151 archivos en el repositorio.**

El README todavía describe un estado anterior y debe actualizarse.

---

## 3. Coherencia funcional por rol

### Administrador

Dispone de pantallas para dashboard, talleristas, detalle de tallerista, alumnos, detalle de alumno, talleres, detalle de taller, asistencias, reportes, detalle de reporte y perfil.

Las pantallas cargan módulos específicos junto con `mock-data.js`. El JavaScript actual permite trabajar de forma simulada con listados, búsquedas, detalles, estadísticas y formularios con ventanas modales.

**Conclusión:** frontend administrativo avanzado, pendiente de la migración a la API.

### Tallerista

Dispone de dashboard, perfil, mis talleres, detalle del taller, asistencia, informes, detalle de informe, material y corrección de tareas.

Existe una arquitectura modular por pantalla y datos simulados más completos que los del resto de los paneles.

**Conclusión:** es la parte más madura del frontend.

### Alumno

Hay siete páginas: dashboard, mis talleres, detalle del taller, tareas, detalle de tarea, asistencia y perfil.

**No existe la carpeta `js/`**, pero las siete páginas referencian cuatro archivos JavaScript cada una (`mock-data.js`, `utils.js`, `main.js` y el módulo propio de la pantalla). En consecuencia, ninguna página del panel del alumno funciona actualmente.

**Conclusión:** la interfaz está diseñada, pero su funcionalidad no está implementada.

### API

Expone 47 rutas que cubren autenticación y perfil, alumnos, talleristas, talleres, asignaciones e inscripciones, asistencias, contenidos, entregas y adjuntos. Cada ruta declara qué rol puede usarla, y la verificación se aplica tanto por rol como por pertenencia: un tallerista solo accede a los talleres que tiene asignados.

**Conclusión:** la cobertura funcional es amplia y el control de acceso está correctamente implementado. Lo pendiente es su documentación y la integración con el frontend.

---

## 4. Principales incoherencias detectadas

### 4.1 Conviven dos esquemas SQL distintos

El repositorio contiene dos scripts de base de datos con contenidos divergentes:

| Archivo | Estado |
|---|---|
| `backend/DataBase/inau_talleres.sql` | Esquema definitivo, derivado del modelo de clases |
| `backend/api/database.sql` | Versión anterior: usa `usuario_registro_id` en lugar de `usuario_registro`, `fecha_registro` en lugar de `fecha_ingreso`, y conserva adjuntos de tipo `text/html` que contradicen NRF11 |

Ambos crean la base `inau_talleres` y ambos comienzan con `DROP DATABASE IF EXISTS`, de modo que ejecutar el equivocado destruye la estructura correcta sin aviso. El segundo se encuentra junto al código PHP, que es donde lo buscaría quien trabaje en el backend, y es además el que monta el entorno Docker de la API.

La divergencia tiene consecuencia directa: el código de la API está escrito contra el segundo esquema, por lo que **no funciona contra el esquema definitivo del proyecto**. Los endpoints afectados son los de alumnos y los de registro de asistencia, y por arrastre, todo el acceso del alumno a los contenidos de su taller (RF07), dado que esas rutas resuelven primero la ficha del alumno.

**Acción recomendada:** conservar un único script. Si se prefiere mantenerlo junto al código de la API, reemplazar el contenido de `backend/api/database.sql` por el del esquema definitivo y eliminar el duplicado. Además, el script carece de `SET NAMES utf8mb4;` al inicio, por lo que una importación por consola corrompe tildes y eñes.

### 4.2 Dos claves secretas publicadas en el repositorio

La API firma sus tokens de sesión con una clave que debe permanecer secreta. Hay dos caminos por los que esa clave llega publicada al repositorio:

| Archivo | Situación |
|---|---|
| `backend/api/.env.example` | Contiene una clave real de 64 caracteres, no un marcador |
| `backend/api/compose.yaml` | Define una clave por defecto, de modo que `docker compose up` arranca sin pedir configuración |

`config.php` incluye una comprobación que impide arrancar con la clave de ejemplo, pero esa comprobación busca el texto `cambiame-por-una-clave-generada-al-azar`, que no es el valor que trae el archivo. La protección existe y no se activa.

El efecto es que cualquiera con acceso al repositorio puede generar un token de administrador válido **sin conocer ninguna contraseña**, y con él leer y modificar datos del sistema.

**Acción recomendada:** sustituir el valor de `.env.example` por el marcador que espera `config.php`, y hacer que `compose.yaml` exija la variable en lugar de proveer un valor por defecto. Dado que ambas claves ya figuran en el historial de Git, ningún entorno debe seguir usándolas: corresponde generar claves nuevas.

### 4.3 Los identificadores del mock data no coinciden con los del SQL

En `frontend-admin/js/mock-data.js` el tallerista Martín Rodríguez tiene `id: 5`, y los talleres apuntan a `talleristaId: 5`. En los datos de prueba del SQL, ese mismo tallerista tiene `id: 3`.

Esto no afecta el funcionamiento actual, dado que ambas fuentes son independientes, pero producirá inconsistencias al sustituir los datos simulados por llamadas a la API. La divergencia verificada corresponde al tallerista principal; no se descarta que existan otras en alumnos, talleres o contenidos.

**Acción recomendada:** dejar constancia de la divergencia como comentario al inicio de cada `mock-data.js`, de modo que el aviso aparezca frente a quien realice la migración a la API.

### 4.4 El panel del alumno referencia archivos inexistentes

Las siete páginas del panel del alumno incluyen etiquetas `<script>` hacia `js/mock-data.js`, `js/utils.js`, `js/main.js` y su módulo correspondiente. Ninguno de esos archivos existe.

**Acción recomendada:** implementar la carpeta `js/` del panel siguiendo la misma estructura modular de los otros dos, o retirar temporalmente las referencias si la implementación se posterga.

### 4.5 El login del frontend no consume la API

`index.html` existe con el diseño terminado, pero no hay ningún archivo JavaScript que procese el formulario: el `auth.js` del panel del administrador está vacío. La API, en cambio, ya resuelve el inicio de sesión, el cierre de sesión y la validación del token.

Queda pendiente conectar ambos extremos para completar RF01.

**Nota sobre el mecanismo:** la API autentica por **correo electrónico**, mientras que la pantalla de acceso y la documentación de identidad visual plantean el ingreso por **cédula**. Conviene unificar el criterio antes de implementar la integración.

### 4.6 El login utiliza una ruta absoluta hacia el CSS de otro panel

`index.html` carga sus estilos desde `/frontend/frontend-tallerista/css/styles.css`. Presenta dos inconvenientes: la ruta absoluta solo funciona si el sitio se sirve desde la raíz del dominio, y la pantalla de acceso —que no pertenece a ningún rol— depende de la hoja de estilos de un panel específico.

**Acción recomendada:** crear una hoja de estilos propia para el login, en una carpeta común, con ruta relativa.

### 4.7 La API expone detalles de la base de datos ante un error

Los controladores capturan las excepciones con `catch (Exception $e)`, que también alcanza a las de base de datos, y devuelven el mensaje original al cliente. El resultado es que un fallo interno envía al navegador el error de MySQL completo, con nombres de tablas y columnas, y además lo informa con un código engañoso: 404 o 400 en lugar de 500.

`index.php` ya contiene el manejo correcto —registra el detalle en el log y responde con un mensaje genérico—, pero nunca llega a ejecutarse porque los controladores atrapan la excepción antes.

**Acción recomendada:** hacer que los controladores dejen pasar las excepciones de base de datos hacia el manejador de `index.php`.

### 4.8 El README de la API documenta usuarios de prueba inexistentes

La tabla de credenciales de `backend/api/README.md` proviene de la plantilla original del curso: propone `admin@utu.edu.uy` y `alumno@utu.edu.uy`, con un rol `usuario` que no existe en el modelo. Los datos de prueba reales del proyecto son otros.

### 4.9 El README del proyecto no refleja el estado actual

Describe un estado anterior: no incluye el panel del alumno, indica menos archivos de los existentes, no refleja las páginas incorporadas al panel del tallerista y no menciona la API.

### 4.10 Documentación técnica pendiente o perdida

Tres documentos permanecen vacíos:

```text
docs/04-implementacion/api.md
docs/04-implementacion/testing.md
```

`api.md` y `testing.md` corresponden a fases posteriores, aunque `api.md` ya cuenta con material disponible: la API está implementada con 47 rutas.
 
Caso aparte es `planificacion.md`: figuraba con 0 bytes, pero su contenido **no se perdió**. La planificación real —el backlog priorizado de los seis sprints— está en `Doc.md` (§22); el archivo solo había alojado un resumen general del proyecto, redundante con `Doc.md`. Por eso se resuelve **eliminarlo** en lugar de recuperarlo, y retirar su referencia del README y de la estructura documental.

### 4.11 Archivos con nomenclatura irregular o ausentes

- `backend/.md` es un archivo cuyo nombre consiste únicamente en la extensión. Si su función es preservar la carpeta en el control de versiones, corresponde renombrarlo a `.gitkeep`.
- `docs/seguridad.md` existía con contenido antes de la reorganización de carpetas y no aparece en la estructura actual. Corresponde recuperarlo y ubicarlo en `04-implementacion/`.
- La carpeta `03-diseño` contiene un carácter acentuado, a diferencia de las demás. Los nombres de ruta con tildes pueden generar inconvenientes en enlaces y en determinados entornos.

### 4.12 Ausencia de `.gitignore` y `LICENSE`

Ambos archivos están contemplados en la plantilla original del proyecto y no se encuentran en el repositorio. El `.gitignore` resulta especialmente relevante ahora que la API existe: sin él, nada impide que el archivo `.env` con la clave secreta y las credenciales de base de datos termine versionado.

---

## 5. Estado de requisitos funcionales

De los veintiséis requerimientos definidos, veinte integran el alcance de la primera versión y seis fueron postergados por restricción de plazo.

### Requerimientos de la primera versión

| Código | Requisito | Estado actual |
|---|---|---|
| RF01 | Login y diferenciación por rol | API implementada; integración con el frontend pendiente. |
| RF02 | Gestión de usuarios y talleres | API implementada; frontend con datos simulados. |
| RF03 | Asignación de alumnos y talleristas | API implementada; frontend con datos simulados. |
| RF04 | Registrar asistencia | API implementada; frontend avanzado con almacenamiento local. |
| RF05 | Consultar y modificar asistencia | API implementada; frontend avanzado. |
| RF06 | Subir material y tareas | API implementada, incluida la carga de adjuntos; frontend tallerista listo. |
| RF07 | Alumno visualiza material y tareas | API implementada; el panel del alumno no tiene JavaScript. |
| RF08 | Alumno envía archivos | API implementada; el panel del alumno no tiene JavaScript. |
| RF09 | Tallerista corrige tareas | API implementada; frontend implementado en `correccion-tarea.js`. |
| RF10 | Asignar notas | API implementada, con validación de rango; frontend implementado. |
| RF11 | Informes de asistencia | Frontend avanzado con datos simulados; sin endpoints de informes en la API. |
| RF12 | Informes de talleres y talleristas | Frontend avanzado; sin endpoints de informes en la API. |
| RF13 | Exportación en PDF o Excel | No implementada: la descarga actual produce un archivo de texto provisional. |
| RF14 | Gestión de perfil según rol | API implementada, con sincronización entre `usuarios` y `alumnos`; frontend con simulación. |
| RF16 | Eliminar material | API implementada; frontend implementado en `material.js`. |
| RF17 | Eliminar nota asignada | API implementada; frontend implementado. |
| RF19 | Generar listado de alumnos | Contemplado en el módulo de reportes del frontend; sin endpoint en la API. |
| RF22 | Informe de talleristas | Contemplado en el módulo de reportes del frontend; sin endpoint en la API. |
| RF24 | Consultar datos sensibles | No implementado. |
| RF25 | Listado de alumnos del taller | API y frontend implementados. |

> **Observación sobre los informes:** las tablas `reportes` y `trazabilidad` existen en la base de datos, pero la API no expone rutas para ellas. RF11, RF12, RF13, RF19 y RF22 dependen de esa capa, que resta implementar.

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
| NRF04 | Navegación clara y consistente | Avanzado en los paneles implementados. |
| NRF05 | Validación en frontend y backend | Cumplido: la API valida con clases dedicadas por entidad, además de la validación del frontend. |
| NRF06 | Separación frontend y backend | Cumplido: API REST con arquitectura en capas y frontend independiente. |
| NRF07 | Control de acceso por rol | Cumplido en la API: verificación por rol y por pertenencia al taller en cada ruta. |
| NRF08 | Protección de datos personales | Parcial: contraseñas con hash y consultas preparadas, pero hay claves publicadas (4.2) y filtración de errores (4.7). |
| NRF09 | Persistencia relacional | Esquema completo; conviven dos scripts divergentes (4.1). |
| NRF10 | Trazabilidad | La tabla `trazabilidad` existe, pero la API no registra acciones en ella. |
| NRF11 | Restricción de formatos | Documentada y respetada en el esquema definitivo; contradicha por los datos de prueba de `backend/api/database.sql`. |
| NRF12 | Restricción de tamaño | Configurada en el entorno Docker; validación en la API pendiente de verificar. |
| NRF13 | Código organizado | Cumplido: frontend modular por pantalla y backend en capas. |
| NRF14 | Documentación técnica | Avanzada; restan `api.md` y `testing.md`. |
| NRF15 | Uso de Git | Implementado. |
| NRF16 | Pull Requests obligatorias | Declarado en la documentación y respaldado por el flujo de ramas del repositorio. |

---

## 7. Base de datos actual

El esquema definitivo define trece tablas:

`usuarios`, `alumnos`, `talleres`, `taller_tallerista`, `horarios_taller`, `inscripciones`, `asistencias`, `registros_asistencia`, `contenidos`, `entregas`, `adjuntos`, `reportes` y `trazabilidad`.

Incluye claves primarias y foráneas, restricciones de unicidad, índices sobre las columnas de filtrado frecuente, restricciones de verificación, datos de prueba y hashes de contraseña válidos. Se corresponde con el modelo de clases documentado en `03-diseño/Modelado/`, con la correspondencia clase-tabla verificada en el Paso 5 del anexo de derivación.

La salvedad es la señalada en 4.1: el repositorio conserva un segundo script divergente, y es ese el que el código de la API espera encontrar.

---

## 8. Seguridad

El documento de identificación de amenazas reconoce tres riesgos principales:

| Amenaza | Probabilidad | Impacto | Riesgo | Clasificación |
|---|---:|---:|---:|---|
| Phishing | 4 | 3 | 12 | Crítico |
| XSS | 3 | 3 | 9 | Tolerable |
| Ransomware | 2 | 4 | 8 | Tolerable |

### Lo que está bien resuelto en la API

- **Control de acceso**: cada ruta declara los roles admitidos, y la verificación alcanza también la pertenencia. Un tallerista no puede leer ni modificar datos de un taller que no dicta.
- **Consultas preparadas** en todos los repositorios, lo que previene la inyección SQL.
- **Listas blancas de campos** en las actualizaciones que arman la consulta dinámicamente.
- **Contraseñas con hash**, verificadas con la función correspondiente; el token viaja en una cookie que el JavaScript del navegador no puede leer.

### Lo que queda pendiente

- Las dos claves secretas publicadas (4.2), que anulan en la práctica todo el control de acceso descrito arriba.
- La filtración de detalles de la base de datos ante un error (4.7).
- El registro efectivo en la tabla `trazabilidad`, que NRF10 exige y la API no realiza.

En el JavaScript del frontend se observa el uso de funciones de escape y de `textContent` en varios módulos, lo que indica que las decisiones anti-XSS ya se aplican.

---

## 9. Identidad visual

La documentación define una línea común: fondo cálido, superficies blancas, bordes discretos, tipografía del sistema, radio de borde pequeño, identidad cromática propia por rol, estados diferenciados por color, diseño responsive y componentes reutilizables.

Los tres paneles comparten la misma base y se diferencian únicamente por su paleta, criterio documentado y verificable en las tres hojas de estilo.

---

## 10. Gestión del proyecto

El proyecto cuenta con un acta de reuniones de R-01 a R-09, donde se registra la organización inicial del equipo, la entrevista con el cliente, la distribución de tareas, las dificultades de participación, los cambios de alcance, los avances de documentación y el comienzo del backend.

El Charter establece a INAU como cliente y patrocinador, a Emiliano Sánchez como líder y Scrum Master, cinco integrantes, una duración de doce semanas organizadas en seis sprints quincenales, un esfuerzo estimado de setenta y seis puntos y los riesgos principales del proyecto.

---

## 11. Conclusión de coherencia

### Lo que está bien alineado

1. La arquitectura frontend → API REST → PHP → MySQL es consistente entre la documentación y lo implementado.
2. El stack de Bootstrap, HTML, CSS y JavaScript sin framework coincide con la justificación tecnológica.
3. El esquema SQL definitivo se corresponde con el modelo de clases, con trazabilidad verificada paso a paso.
4. El alcance incluido, el excluido y el ajuste por plazo son coherentes entre el documento principal, el Charter y el modelo.
5. El control de acceso de la API cumple lo que NRF07 exige y lo que la política de seguridad declara.
6. La estructura por capas de la API coincide con la separación descrita en la justificación tecnológica.

### Lo que debe corregirse prioritariamente

1. Retirar las dos claves secretas publicadas y generar claves nuevas.
2. Unificar los dos esquemas SQL en uno solo.
3. Evitar que la API exponga detalles de la base de datos ante un error.
4. Eliminar `planificacion.md` (su contenido es redundante con `Doc.md`, que ya contiene el backlog de los seis sprints) y retirar su referencia del README y la estructura.
5. Alinear los identificadores del mock data con los del SQL.
6. Implementar el JavaScript del panel del alumno o retirar sus referencias.
7. Integrar el login del frontend con la API, definiendo antes si el acceso es por cédula o por correo.
8. Corregir la ruta del CSS del login.
9. Actualizar el README del proyecto y el de la API.
10. Completar `api.md` y `testing.md`; recuperar `seguridad.md`.
11. Crear `.gitignore` y `LICENSE`; renombrar `backend/.md` a `.gitkeep`.

---

## 12. Orden recomendado de trabajo

```text
1. Retirar las claves publicadas y generar nuevas
        ↓
2. Crear .gitignore antes de cualquier despliegue
        ↓
3. Unificar los dos esquemas SQL
        ↓
4. Corregir la filtración de errores de la API
        ↓
5. Eliminar planificacion.md (redundante con Doc.md) y recuperar seguridad.md
        ↓
6. Actualizar los dos README y la estructura documental
        ↓
7. Integrar el login del frontend con la API
        ↓
8. Implementar el JavaScript del panel alumno
        ↓
9. Reemplazar datos simulados por llamadas a la API
        ↓
10. Implementar los endpoints de informes y la trazabilidad
        ↓
11. Completar api.md con las rutas implementadas
        ↓
12. Testing integral y completar testing.md
```