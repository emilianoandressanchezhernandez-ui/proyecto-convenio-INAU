# Estructura del repositorio — proyecto-convenio-INAU

<br>

```text
proyecto-convenio-INAU/
│
├── README.md
├── .gitignore                       → reglas de exclusión de Git (excluye .env)
├── .gitattributes                   → normalización de saltos de línea
│
├── backend/
│   ├── .gitignore                   → reglas de exclusión de Git (vacío)
│   └── api-completa/                → API REST en PHP (55 rutas)
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
│   │   └── Testing/
│   │       ├── Testing-01.md
│   │       └── Testing-02.md
│   │
│   ├── 05-Ciberseguridad/
│   │   ├── Doc NMAP.md
│   │   ├── Hardening de Infraestructura y Contenedores.md
│   │   ├── Identificación de amenazas.md
│   │   ├── Mecanismos_Autenticacion_Criptografia_INAU.md
│   │   └── Plan de Contingencia.md
│   │
│   └── 06-Emprendedurismo/
│       └── Plan de Negocios.md
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
| Raíz | `README.md`, `.gitignore` y `.gitattributes` | 3 |
| `backend/` | Reglas de exclusión de Git (archivo vacío) | 1 |
| `backend/api-completa/` | API REST en PHP, configuración Docker y script de la base de datos con datos de prueba | 74 |
| `docs/` | Índice de la estructura del repositorio | 1 |
| `docs/01-gestion/` | Project charter, control de cambios, revisión de coherencia y acta de cierre | 4 |
| `docs/01-gestion/Documentos del equipo/` | Actas de reuniones, declaración sobre las Sprint Review y declaración de uso ético de IA | 3 |
| `docs/02-analisis/` | Documento principal del proyecto, entrevista y requerimientos | 3 |
| `docs/03-diseño/` | Identidad visual y justificación tecnológica | 2 |
| `docs/03-diseño/Modelado/` | Modelo de clases y MER, anexo de derivación y análisis del modelo | 3 |
| `docs/04-implementacion/` | Reconstrucción en servidor, estado inicial, infraestructura y documentación de la API | 4 |
| `docs/04-implementacion/Testing/` | Registros de pruebas, uno por ejecución | 2 |
| `docs/05-Ciberseguridad/` | Identificación de amenazas, mecanismos de autenticación y criptografía, hardening de infraestructura y contenedores, escaneo con Nmap y plan de contingencia (asignatura electiva) | 5 |
| `docs/06-Emprendedurismo/` | Plan de negocios (asignatura Emprendedurismo) | 1 |
| `frontend/` | Pantalla de acceso y scripts compartidos (`api.js`, `auth.js`) | 3 |
| `frontend/frontend-admin/` | Panel del administrador: 11 páginas, 1 hoja de estilos, 15 scripts | 28 |
| `frontend/frontend-tallerista/` | Panel del tallerista: 9 páginas, 1 hoja de estilos, 12 scripts | 23 |
| `frontend/frontend-alumno/` | Panel del alumno: 7 páginas, 1 hoja de estilos, 10 scripts | 18 |
| **Total** | | **178** |

<br>

## Criterio de organización

La documentación se agrupa en seis carpetas numeradas: las cuatro primeras reflejan la etapa del proyecto a la que corresponde cada documento (gestión, análisis, diseño e implementación), la quinta, `05-Ciberseguridad`, reúne el trabajo de la asignatura electiva, y la sexta, `06-Emprendedurismo`, el plan de negocios. La numeración garantiza que el listado respete el orden lógico del proceso en lugar del orden alfabético.

Los documentos de modelado se ubican en una subcarpeta propia dentro de `03-diseño`, dado que constituyen un conjunto de tres piezas que se referencian entre sí: el modelo, su derivación justificada y el análisis de cómo resuelve la operativa.

Las pruebas se ubican en una subcarpeta propia dentro de `04-implementacion`, `Testing/`, con un documento por cada ejecución (`Testing-01.md`, `Testing-02.md`), de modo que las pruebas posteriores se agreguen sin modificar el registro de las anteriores.

La revisión de coherencia y el control de cambios se ubican en `01-gestion` por tratarse de registros sobre el conjunto del proyecto, y no de artefactos técnicos de una etapa determinada. Dentro de esa carpeta, la subcarpeta `Documentos del equipo/` agrupa los registros propios del equipo: las actas de reuniones, la declaración sobre las Sprint Review y la declaración de uso ético de IA.

El trabajo de ciberseguridad (identificación de amenazas, mecanismos de autenticación y criptografía, hardening de infraestructura y contenedores, escaneo con Nmap y plan de contingencia) corresponde a una asignatura distinta del proyecto principal. Se conserva en el repositorio para mantener la trazabilidad del trabajo del equipo, pero en la carpeta separada `05-Ciberseguridad` para no confundirlo con la documentación del sistema. El plan de negocios sigue el mismo criterio en `06-Emprendedurismo`.

Los archivos de configuración del repositorio (`.gitignore` y `.gitattributes`) se ubican en la raíz, para que sus reglas se apliquen a todo el proyecto.

El script de base de datos que se utiliza se ubica en `backend/api-completa/DataBase/`, junto al código que lo consume y desde donde lo carga el entorno Docker, en lugar de dejarlo en la raíz del repositorio.

<br>

## Estado de la implementación

| Componente | Estado |
| --- | --- |
| Panel del administrador | Completo y conectado a la API |
| Panel del tallerista | Completo y conectado a la API. Incluye la gestión de material y tareas y la corrección de entregas |
| Panel del alumno | Completo y conectado a la API, incluida la asistencia |
| Pantalla de acceso (`frontend/index.html`) | Acceso por correo y contraseña, autenticación contra la API y redirección por rol |
| Base de datos | Script con las trece tablas y datos de prueba en `backend/api-completa/DataBase/inau_talleres.sql`, ejecutado en el entorno Docker |
| Backend | Implementado: API REST con 55 rutas, organizada en capas, con autenticación JWT y control de acceso por rol |