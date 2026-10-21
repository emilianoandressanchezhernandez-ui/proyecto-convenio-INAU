# Estructura del repositorio — proyecto-convenio-INAU

<br>

```text
proyecto-convenio-INAU/
│
├── README.md
│
├── backend/
│   ├── .md
│   ├── DataBase/
│   │   └── inau_talleres.sql        → copia del script (pendiente de unificar)
│   └── api-completa/                → API REST en PHP (53 rutas)
│       ├── index.php · routes.php · config.php · README.md
│       ├── compose.yaml · composer.json · composer.lock
│       ├── .env.example · .env.docker.example · .htaccess · .dockerignore
│       ├── DataBase/
│       │   └── inau_talleres.sql    → script que carga el entorno Docker
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
│   │   ├── Acta de Reuniones.md
│   │   ├── Actas de Sprint Review.md
│   │   ├── Charter.md
│   │   ├── Declaración de Etica en el uso de IA.md
│   │   └── Revision_Coherencia_INAU.md
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
│   │   ├── Documento de Reconstruccion - Doker desktop.md
│   │   ├── Documento de Reconstruccion - Servidor.md
│   │   ├── PrimeraVista.md
│   │   ├── api.md
│   │   ├── inau-infraestructura-docker.md
│   │   └── testing.md
│   │
│   └── 05-Ciberseguridad/
│       ├── Identificación de amenazas.md
│       └── Mecanismos_Autenticacion_Criptografia_INAU.md
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

## Resumen por carpeta

| Carpeta | Contenido | Archivos |
| --- | --- | --- |
| Raíz | `README.md` | 1 |
| `backend/` | Marcador de carpeta | 1 |
| `backend/DataBase/` | Copia del script de la base de datos (pendiente de unificar) | 1 |
| `backend/api-completa/` | API REST en PHP, configuración Docker y script de la base de datos con datos de prueba | 74 |
| `docs/` | Índice de la estructura del repositorio | 1 |
| `docs/01-gestion/` | Actas de reuniones, de Sprint Review y de cierre; project charter; declaración de uso ético de IA; revisión de coherencia | 6 |
| `docs/02-analisis/` | Documento principal del proyecto, entrevista y requerimientos | 3 |
| `docs/03-diseño/` | Identidad visual y justificación tecnológica | 2 |
| `docs/03-diseño/Modelado/` | Modelo de clases y MER, anexo de derivación y análisis del modelo | 3 |
| `docs/04-implementacion/` | Reconstrucción en Docker Desktop y en servidor, estado inicial, infraestructura, documentación de API y de pruebas | 6 |
| `docs/05-Ciberseguridad/` | Identificación de amenazas y mecanismos de autenticación y criptografía (asignatura electiva) | 2 |
| `frontend/` | Pantalla de acceso y scripts compartidos (`api.js`, `auth.js`) | 3 |
| `frontend/frontend-admin/` | Panel del administrador: 11 páginas, 1 hoja de estilos, 15 scripts | 28 |
| `frontend/frontend-tallerista/` | Panel del tallerista: 9 páginas, 1 hoja de estilos, 12 scripts | 23 |
| `frontend/frontend-alumno/` | Panel del alumno: 7 páginas, 1 hoja de estilos, 10 scripts | 18 |
| **Total** | | **172** |

<br>

## Criterio de organización

La documentación se agrupa en cinco carpetas numeradas: las cuatro primeras reflejan la etapa del proyecto a la que corresponde cada documento (gestión, análisis, diseño e implementación) y la quinta, `05-Ciberseguridad`, reúne el trabajo de la asignatura electiva. La numeración garantiza que el listado respete el orden lógico del proceso en lugar del orden alfabético.

Los documentos de modelado se ubican en una subcarpeta propia dentro de `03-diseño`, dado que constituyen un conjunto de tres piezas que se referencian entre sí: el modelo, su derivación justificada y el análisis de cómo resuelve la operativa.

La revisión de coherencia se ubica en `01-gestion` por tratarse de un control de calidad sobre el conjunto del proyecto, y no de un artefacto técnico de una etapa determinada.

El trabajo de ciberseguridad (identificación de amenazas y mecanismos de autenticación y criptografía) corresponde a una asignatura distinta del proyecto principal. Se conserva en el repositorio para mantener la trazabilidad del trabajo del equipo, pero en la carpeta separada `05-Ciberseguridad` para no confundirlo con la documentación del sistema.

El script de base de datos que se utiliza se ubica en `backend/api-completa/DataBase/`, junto al código que lo consume y desde donde lo carga el entorno Docker, en lugar de dejarlo en la raíz del repositorio. Existe además una copia idéntica en `backend/DataBase/`, pendiente de unificar.

<br>

## Estado de la implementación

| Componente | Estado |
| --- | --- |
| Panel del administrador | Completo y conectado a la API |
| Panel del tallerista | Completo y conectado a la API. Incluye la gestión de material y tareas y la corrección de entregas |
| Panel del alumno | Completo y conectado a la API, salvo la asistencia, que conserva datos simulados |
| Pantalla de acceso (`frontend/index.html`) | Acceso por correo y contraseña, autenticación contra la API y redirección por rol |
| Base de datos | Script con las trece tablas y datos de prueba en `backend/api-completa/DataBase/inau_talleres.sql`, ejecutado en el entorno Docker |
| Backend | Implementado: API REST con 53 rutas, organizada en capas, con autenticación JWT y control de acceso por rol |