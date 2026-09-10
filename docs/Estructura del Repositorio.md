# Estructura del repositorio — proyecto-convenio-INAU

<br>

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

## Resumen por carpeta

| Carpeta | Contenido | Archivos |
| --- | --- | --- |
| Raíz | `index.html` (pantalla de acceso) y `README.md` | 2 |
| `backend/` | Marcador de carpeta | 1 |
| `backend/DataBase/` | Script de creación de la base de datos con datos de prueba | 1 |
| `docs/` | Índice de la estructura del repositorio | 1 |
| `docs/01-gestion/` | Actas de reuniones, project charter, declaración de uso ético de IA y revisión de coherencia | 4 |
| `docs/02-analisis/` | Documento principal del proyecto, requerimientos y planificación | 3 |
| `docs/03-diseño/` | Identidad visual y justificación tecnológica | 2 |
| `docs/03-diseño/Modelado/` | Modelo de clases y MER, anexo de derivación y análisis del modelo | 3 |
| `docs/04-implementacion/` | Estado del desarrollo, entorno de infraestructura, documentación de API y de pruebas | 4 |
| `docs/ciberseguridad/` | Identificación de amenazas (asignatura electiva) | 1 |
| `frontend/frontend-admin/` | Panel del administrador: 11 páginas, 1 hoja de estilos, 15 scripts | 28 |
| `frontend/frontend-tallerista/` | Panel del tallerista: 9 páginas, 1 hoja de estilos, 12 scripts | 23 |
| `frontend/frontend-alumno/` | Panel del alumno: 7 páginas y 1 hoja de estilos | 8 |
| **Total** | | **81** |

<br>

## Criterio de organización

La documentación se agrupa en cinco carpetas que reflejan la etapa del proyecto a la que corresponde cada documento: gestión, análisis, diseño e implementación, más una carpeta independiente para la asignatura electiva. La numeración de las cuatro primeras garantiza que el listado respete el orden lógico del proceso en lugar del orden alfabético.

Los documentos de modelado se ubican en una subcarpeta propia dentro de `03-diseño`, dado que constituyen un conjunto de tres piezas que se referencian entre sí: el modelo, su derivación justificada y el análisis de cómo resuelve la operativa.

La revisión de coherencia se ubica en `01-gestion` por tratarse de un control de calidad sobre el conjunto del proyecto, y no de un artefacto técnico de una etapa determinada.

El trabajo de identificación de amenazas corresponde a una asignatura distinta del proyecto principal. Se conserva en el repositorio para mantener la trazabilidad del trabajo del equipo, pero en una carpeta separada para no confundirlo con la documentación del sistema.

El script de base de datos se ubica dentro de `backend/`, junto al código que lo consumirá, en lugar de dejarlo en la raíz del repositorio.

<br>

## Estado de la implementación

| Componente | Estado |
| --- | --- |
| Panel del administrador | Páginas, estilos y lógica completos, con datos simulados |
| Panel del tallerista | Páginas, estilos y lógica completos, con datos simulados |
| Panel del alumno | Páginas y estilos definidos; lógica pendiente de implementar |
| Pantalla de acceso | Interfaz terminada; autenticación pendiente |
| Base de datos | Script definido; pendiente de ejecución en el servidor |
| Backend | Desarrollo iniciado; sin avances incorporados al repositorio |