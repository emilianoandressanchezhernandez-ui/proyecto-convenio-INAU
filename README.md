# Proyecto Convenio INAU

**TheNewfutures — Sistema de Gestión de Talleres en Convenio con INAU**

Aplicación web para la gestión de talleres socioeducativos realizados en convenio con INAU: administración de talleres y participantes, control de asistencia, publicación de material y tareas, corrección de entregas y generación de informes.

## Integrantes

- Emiliano Sánchez (Coordinador)
- Gabriel Rendon (Subcoordinador)
- Ignacio Viera
- Maximiliano Leal
- Thiago Ferragut

---

## Estructura del repositorio

```text
proyecto-convenio-INAU/
│
├── index.html
├── README.md
│
├── backend/
│   ├── .md
│   └── DataBase/
│       └── inau_talleres.sql
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
│   │   ├── planificacion.md
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
        └── css/
            └── styles.css
```

<br>

### Resumen por carpeta

| Carpeta | Contenido | Archivos |
| --- | --- | --- |
| Raíz | `index.html` (pantalla de acceso) y `README.md` | 2 |
| `backend/` | Marcador de carpeta | 1 |
| `backend/DataBase/` | Script de creación de la base de datos con datos de prueba | 1 |
| `docs/` | Índice de la estructura del repositorio | 1 |
| `docs/01-gestion/` | Actas de reuniones, charter, declaración de uso ético de IA y revisión de coherencia | 4 |
| `docs/02-analisis/` | Documento principal del proyecto, requerimientos y planificación | 3 |
| `docs/03-diseño/` | Identidad visual y justificación tecnológica | 2 |
| `docs/03-diseño/Modelado/` | Modelo de clases y MER, anexo de derivación y análisis del modelo | 3 |
| `docs/04-implementacion/` | Estado de desarrollo, infraestructura, documentación de API y de pruebas | 4 |
| `docs/ciberseguridad/` | Identificación de amenazas (asignatura electiva) | 1 |
| `frontend/frontend-admin/` | Panel del administrador: 11 páginas, 1 hoja de estilos, 15 scripts | 28 |
| `frontend/frontend-tallerista/` | Panel del tallerista: 9 páginas, 1 hoja de estilos, 12 scripts | 23 |
| `frontend/frontend-alumno/` | Panel del alumno: 7 páginas y 1 hoja de estilos | 8 |
| **Total** | | **81** |

<br>

## Tecnologías

| Capa | Tecnología |
| --- | --- |
| Frontend | HTML5, CSS3, Bootstrap 5.3, JavaScript sin framework |
| Backend | PHP con API REST *(previsto)* |
| Base de datos | MySQL 8.0 |
| Control de versiones | Git y GitHub |

<br>

## Estado del desarrollo

| Componente | Estado |
| --- | --- |
| Panel del administrador | Páginas, estilos y lógica completos, con datos simulados |
| Panel del tallerista | Páginas, estilos y lógica completos, con datos simulados |
| Panel del alumno | Páginas y estilos definidos; lógica pendiente |
| Pantalla de acceso | Interfaz terminada; autenticación pendiente |
| Base de datos | Script definido con trece tablas; pendiente de despliegue |
| Backend | Desarrollo iniciado |

<br>

## Documentación

La documentación se organiza en carpetas numeradas según la etapa del proyecto:

| Carpeta | Contenido |
| --- | --- |
| `01-gestion` | Gestión del proyecto: actas, charter, declaración de uso de IA y control de coherencia |
| `02-analisis` | Relevamiento, requerimientos, historias de usuario y planificación de sprints |
| `03-diseño` | Modelo de clases, modelo entidad-relación, identidad visual y justificación tecnológica |
| `04-implementacion` | Estado del desarrollo, entorno de ejecución, API y pruebas |
| `ciberseguridad` | Trabajo de la asignatura electiva |