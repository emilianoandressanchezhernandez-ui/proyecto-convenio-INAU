# Proyecto Convenio INAU

<br>

**TheNewfutures — Sistema de Gestión de Talleres en Convenio con INAU**

Aplicación web para la gestión de talleres socioeducativos realizados en convenio con INAU: administración de talleres y participantes, control de asistencia, publicación de material y tareas, corrección de entregas y generación de informes.


## Integrantes

- Emiliano Sánchez (Líder / Scrum Master)
- Gabriel Rendon (Subcoordinador)
- Thiago Ferragut

---


## Estructura del repositorio

```text
proyecto-convenio-INAU/
│
├── README.md
│
├── backend/
│   └── api-completa/                → API REST en PHP (53 rutas)
│       ├── index.php · routes.php · config.php · README.md
│       ├── compose.yaml · composer.json · composer.lock
│       ├── .env.example · .env.docker.example · .htaccess · .dockerignore
│       ├── DataBase/
│       │   └── inau_talleres.sql    → script de la base de datos (esquema y datos de prueba)
│       ├── controllers/   (11)
│       ├── core/          (6)
│       ├── dtos/          (7)
│       ├── models/        (2)
│       ├── repositories/  (11)
│       ├── services/      (10)
│       ├── validators/    (10)
│       ├── docker/php-apache/  (Dockerfile, app.conf, entrypoint.sh, uploads.ini)
│       └── storage/       → archivos subidos
│
├── docs/
│   ├── Estructura del Repositorio.md
│   │
│   ├── 01-gestion/
│   │   ├── Acta de cierre.md
│   │   ├── Charter.md
│   │   ├── Control_de_Cambios.md
│   │   ├── Revision_Coherencia_INAU.md
│   │   └── Documentos del equipo/
│   │       ├── Acta de Reuniones.md
│   │       ├── Actas de Sprint Review.md
│   │       └── Declaración de Etica en el uso de IA.md
│   │
│   ├── 02-analisis/
│   │   ├── Doc.md
│   │   ├── Entrevista.md
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
│   │   ├── Documento de Reconstruccion - Servidor.md
│   │   ├── PrimeraVista.md
│   │   ├── api.md
│   │   ├── inau-infraestructura-docker.md
│   │   └── testing.md
│   │
│   └── 05-Ciberseguridad/
│       ├── Doc NMAP.md
│       ├── Hardening de Infraestructura y Contenedores.md
│       ├── Identificación de amenazas.md
│       ├── Mecanismos_Autenticacion_Criptografia_INAU.md
│       └── Plan de Contingencia.md
│
└── frontend/
    ├── index.html                   → pantalla de acceso
    ├── js/
    │   ├── api.js
    │   └── auth.js
    │
    ├── frontend-admin/
    │   ├── .gitkeep
    │   ├── alumnos.html
    │   ├── asistencias.html
    │   ├── dashboard.html
    │   ├── detalle-alumno.html
    │   ├── detalle-reporte.html
    │   ├── detalle-taller.html
    │   ├── detalle-tallerista.html
    │   ├── perfil.html
    │   ├── reportes.html
    │   ├── talleres.html
    │   ├── talleristas.html
    │   ├── css/
    │   │   └── styles.css
    │   └── js/
    │       ├── alumnos.js
    │       ├── asistencias.js
    │       ├── auth.js
    │       ├── dashboard.js
    │       ├── detalle-alumno.js
    │       ├── detalle-reporte.js
    │       ├── detalle-taller.js
    │       ├── detalle-tallerista.js
    │       ├── main.js
    │       ├── mock-data.js
    │       ├── perfil.js
    │       ├── reportes.js
    │       ├── talleres.js
    │       ├── talleristas.js
    │       └── utils.js
    │
    ├── frontend-tallerista/
    │   ├── .gitkeep
    │   ├── asistencia.html
    │   ├── correccion-tarea.html
    │   ├── dashboard.html
    │   ├── detalle-informe.html
    │   ├── detalle-taller.html
    │   ├── informes.html
    │   ├── material.html
    │   ├── mis-talleres.html
    │   ├── perfil.html
    │   ├── css/
    │   │   └── styles.css
    │   └── js/
    │       ├── asistencia.js
    │       ├── correccion-tarea.js
    │       ├── dashboard.js
    │       ├── detalle-informe.js
    │       ├── detalle-taller.js
    │       ├── informes.js
    │       ├── main.js
    │       ├── material.js
    │       ├── mis-talleres.js
    │       ├── mock-data.js
    │       ├── perfil.js
    │       └── utils.js
    │
    └── frontend-alumno/
        ├── asistencia.html
        ├── dashboard.html
        ├── detalle-taller.html
        ├── detalle-tarea.html
        ├── mis-talleres.html
        ├── perfil.html
        ├── tareas.html
        ├── css/
        │   └── styles.css
        └── js/
            ├── asistencia.js
            ├── dashboard.js
            ├── detalle-taller.js
            ├── detalle-tarea.js
            ├── main.js
            ├── mis-talleres.js
            ├── mock-data.js
            ├── perfil.js
            ├── tareas.js
            └── utils.js
```

<br>

### Resumen por carpeta

| Carpeta | Contenido | Archivos |
| --- | --- | --- |
| Raíz | `README.md` | 1 |
| `backend/api-completa/` | API REST en PHP, configuración Docker y script de la base de datos con datos de prueba | 74 |
| `docs/` | Índice de la estructura del repositorio | 1 |
| `docs/01-gestion/` | Charter, control de cambios, revisión de coherencia y acta de cierre | 4 |
| `docs/01-gestion/Documentos del equipo/` | Actas de reuniones, declaración sobre las Sprint Review y declaración de uso ético de IA | 3 |
| `docs/02-analisis/` | Documento principal del proyecto, entrevista y requerimientos | 3 |
| `docs/03-diseño/` | Identidad visual y justificación tecnológica | 2 |
| `docs/03-diseño/Modelado/` | Modelo de clases y MER, anexo de derivación y análisis del modelo | 3 |
| `docs/04-implementacion/` | Reconstrucción en servidor, estado inicial, infraestructura, documentación de API y de pruebas | 5 |
| `docs/05-Ciberseguridad/` | Identificación de amenazas, mecanismos de autenticación y criptografía, hardening de infraestructura y contenedores, escaneo con Nmap y plan de contingencia (asignatura electiva) | 5 |
| `frontend/` | Pantalla de acceso y scripts compartidos (`api.js`, `auth.js`) | 3 |
| `frontend/frontend-admin/` | Panel del administrador: 11 páginas, 1 hoja de estilos, 15 scripts | 28 |
| `frontend/frontend-tallerista/` | Panel del tallerista: 9 páginas, 1 hoja de estilos, 12 scripts | 23 |
| `frontend/frontend-alumno/` | Panel del alumno: 7 páginas, 1 hoja de estilos, 10 scripts | 18 |
| **Total** | | **173** |

<br>

## Tecnologías

| Capa | Tecnología |
| --- | --- |
| Frontend | HTML5, CSS3, Bootstrap 5.3, JavaScript sin framework |
| Backend | PHP 8.3 con API REST y autenticación JWT |
| Base de datos | MySQL 8.4 |
| Contenedores | Docker y Docker Compose |
| Control de versiones | Git y GitHub |

<br>

## Estado del desarrollo

| Componente | Estado |
| --- | --- |
| Panel del administrador | Completo y conectado a la API |
| Panel del tallerista | Completo y conectado a la API. Incluye la gestión de material y tareas y la corrección de entregas |
| Panel del alumno | Completo y conectado a la API, salvo la asistencia, que conserva datos simulados |
| Pantalla de acceso (`frontend/index.html`) | Acceso por correo y contraseña, autenticación contra la API y redirección por rol |
| Base de datos | Script con las trece tablas y datos de prueba en `backend/api-completa/DataBase/inau_talleres.sql`, ejecutado en el entorno Docker |
| Backend | Implementado: API REST con 53 rutas, organizada en capas, con autenticación JWT y control de acceso por rol |

<br>

## Documentación

La documentación se organiza en carpetas numeradas según la etapa del proyecto:

| Carpeta | Contenido |
| --- | --- |
| `01-gestion` | Gestión del proyecto: charter, actas, declaración de uso de IA, control de cambios y revisión de coherencia |
| `02-analisis` | Relevamiento, entrevista con el cliente, requerimientos, historias de usuario y planificación de sprints |
| `03-diseño` | Modelo de clases, modelo entidad-relación, identidad visual y justificación tecnológica |
| `04-implementacion` | Estado inicial del desarrollo, entorno de ejecución, reconstrucción y despliegue, API y pruebas |
| `05-Ciberseguridad` | Identificación de amenazas, mecanismos de autenticación y criptografía, hardening, escaneo con Nmap y plan de contingencia |