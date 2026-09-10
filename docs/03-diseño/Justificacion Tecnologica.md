# Justificación Tecnológica y Arquitectura

## Sistema de Gestión de Talleres en Convenio con INAU

---

## 1. Stack tecnológico

### 1.1 Frontend

| Tecnología | Uso | Justificación |
|---|---|---|
| **HTML5** | Estructura de las páginas | Estándar semántico, sin dependencias adicionales, compatible con cualquier navegador moderno. |
| **CSS3** | Personalización visual | Permite el diseño institucional sin necesidad de preprocesadores, manteniendo el proyecto liviano. |
| **Bootstrap 5.3** | Diseño responsive y componentes | La propuesta del proyecto admitía Tailwind o Bootstrap; se optó por Bootstrap por su curva de aprendizaje más accesible y su sistema de componentes predefinidos, que reduce el tiempo de desarrollo — factor crítico dado el plazo de 12 semanas. Resuelve directamente NRF01. |
| **Bootstrap Icons** | Iconografía | Consistencia visual sin necesidad de gestionar íconos sueltos, integrado con el mismo framework. |
| **JavaScript Vanilla** | Comportamiento dinámico | Establecido en la propuesta original del proyecto. Evita la curva de aprendizaje de un framework, priorizando que el equipo comprenda y mantenga su propio código. |
| **localStorage** | Persistencia temporal | Solución provisional para demostración mientras no existe backend. No reemplaza la base de datos, no ofrece seguridad real y no almacena contraseñas. |
| **Mock data** | Simulación de datos | Permite construir y validar la lógica de las tres interfaces sin depender de que el backend esté terminado. |

### 1.2 Backend (previsto)

| Tecnología | Uso | Justificación |
|---|---|---|
| **PHP** | Lógica del servidor | Establecido en la propuesta original del proyecto. Compatible con el entorno de desarrollo utilizado (XAMPP) y con amplia documentación disponible. |
| **MySQL** | Base de datos | Establecido en la propuesta original. El modelo de datos requiere relaciones N:M, lo que justifica un motor relacional. Cumple NRF09. |
| **API REST** | Comunicación frontend-backend | Requisito explícito de la propuesta original ("organización del sistema bajo arquitectura de endpoints REST"). Permite mantener las capas desacopladas (NRF06). |
| **Fetch API** | Consumo de la API desde el cliente | API nativa del navegador, sin necesidad de librerías externas, coherente con la decisión de dependencias mínimas. |
| **Filesystem del servidor** | Almacenamiento de adjuntos | Establecido en la propuesta original. Evita la complejidad de un servicio de almacenamiento externo para una primera versión. |

> **Nota:** la propuesta original del proyecto presenta una ambigüedad entre PHP puro, indicado en su stack tecnológico, y Laravel, mencionado en su plantilla de README. Esta definición se encuentra pendiente de resolución con el docente y el equipo.

### 1.3 Herramientas de desarrollo

| Herramienta | Justificación |
|---|---|
| **Git / GitHub** | Requisito obligatorio del proyecto. Permite trazabilidad de cambios y trabajo simultáneo del equipo de 5 integrantes. Cumple NRF15 y NRF16. |
| **Visual Studio Code** | Entorno gratuito, liviano y ampliamente documentado, adecuado para un equipo en formación. |
| **XAMPP / servidor local** | Simula un entorno PHP + MySQL en el equipo de cada integrante durante el desarrollo, sin requerir hosting hasta el despliegue. |

---

## 2. Arquitectura del sistema

### 2.1 Visión general

El sistema se compone de **interfaces web diferenciadas por rol** y un **backend centralizado** que concentra la lógica de negocio, la persistencia de datos y la exposición de endpoints REST.

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ Panel           │  │ Panel           │  │ Panel           │
│ Administrador   │  │ Tallerista      │  │ Alumno          │
└────────┬────────┘  └────────┬────────┘  └────────┬────────┘
         │                    │                    │
         └────────────────────┼────────────────────┘
                              │ Fetch API
                    ┌─────────▼─────────┐
                    │   API REST (PHP)  │
                    │  Lógica de negocio│
                    │  Autenticación    │
                    │  Permisos por rol │
                    └─────────┬─────────┘
                              │
              ┌───────────────┴───────────────┐
              │                               │
      ┌───────▼───────┐             ┌─────────▼────────┐
      │    MySQL      │             │    Filesystem    │
      │ (datos)       │             │  (adjuntos)      │
      └───────────────┘             └──────────────────┘
```

### 2.2 Estructura del repositorio

```text
proyecto-convenio-INAU/
│
├── index.html                    → Pantalla de login única
├── README.md
│
├── backend/
│   └── DataBase/
│       └── inau_talleres.sql     → Script de creación de la base de datos
│
├── docs/                         → Documentación organizada por etapa
│   ├── 01-gestion/               → Actas de reuniones, charter, declaración de IA
│   ├── 02-analisis/              → Documento principal, requerimientos, planificación
│   ├── 03-diseño/                → Identidad visual, justificación tecnológica
│   │   └── Modelado/             → Modelo de clases y MER, anexo, análisis
│   ├── 04-implementacion/        → Documentación de API y de pruebas
│   └── ciberseguridad/           → Identificación de amenazas
│
└── frontend/
    ├── frontend-admin/
    │   ├── css/styles.css
    │   ├── js/ (main, utils, mock-data, auth + 1 archivo por pantalla)
    │   └── 11 páginas HTML
    │
    ├── frontend-tallerista/
    │   ├── css/styles.css
    │   ├── js/ (main, utils, mock-data + 1 archivo por pantalla)
    │   └── 9 páginas HTML
    │
    └── frontend-alumno/
        ├── css/styles.css
        └── 7 páginas HTML
```

**Diferencia respecto a la plantilla original:** la propuesta del proyecto ubicaba `frontend-admin/` y `frontend-tallerista/` en la raíz del repositorio. El equipo optó por agruparlos dentro de una carpeta `frontend/` común, para mantener la raíz más limpia y facilitar la distinción entre las capas del sistema (frontend, backend, documentación). Se agregó además `frontend-alumno/`, correspondiente al tercer rol incorporado tras el relevamiento con el cliente.

La documentación, por su parte, se organiza en carpetas numeradas según la etapa del proyecto a la que corresponde cada documento, en lugar de mantenerse plana como en la plantilla original. La numeración garantiza que el listado respete el orden lógico del proceso en lugar del alfabético, decisión adoptada ante el volumen de documentos generados durante el análisis.

### 2.3 Organización del código JavaScript

Cada panel replica la misma estructura modular:

| Archivo | Responsabilidad |
|---|---|
| `main.js` | Punto de entrada común: detecta la página actual mediante `data-page`, gestiona navbar y cierre de sesión, e invoca el inicializador correspondiente. |
| `mock-data.js` | Datos simulados que reemplazan temporalmente a la base de datos. No manipula el DOM. |
| `utils.js` | Funciones genéricas reutilizables (lectura de parámetros de URL, formateo, etc.), sin conocimiento de ninguna pantalla concreta. |
| `<pantalla>.js` | Un archivo por vista, con responsabilidad única sobre esa pantalla. |

Esta organización cumple NRF13 y permite que distintos integrantes trabajen en pantallas separadas sin generar conflictos de archivos.

---

## 3. Decisiones arquitectónicas

**Login único con redirección por rol.** En lugar de tres pantallas de acceso independientes, existe un único `index.html`. El backend identificará el rol del usuario autenticado y lo redirigirá al panel correspondiente. Reduce duplicación de código y cumple RF01.

**Paneles independientes por rol.** Se optó por tres interfaces separadas en lugar de una sola con visibilidad condicional. Para un equipo en formación, mantener paneles separados reduce el riesgo de errores de permisos frente a gestionar condicionales dentro de una única base de código.

**Frontend primero, con datos simulados.** El desarrollo avanza sobre mock data antes de implementar el backend, lo que permite validar flujos y experiencia de usuario sin bloquear el trabajo a la espera de la API. La estructura de los datos simulados replica la del modelo de datos, facilitando la sustitución posterior por llamadas reales.

**Navegación mediante parámetros de URL.** Las pantallas de detalle reciben identificadores por URL (`detalle-taller.html?id=1`, `asistencia.html?tallerId=1`), imitando el comportamiento de una aplicación conectada a endpoints REST y facilitando la migración futura.

**Persistencia local estrictamente provisional.** `localStorage` se utiliza únicamente para demostración durante el desarrollo. No sustituye a MySQL, no ofrece garantías de seguridad y no almacena credenciales.

---

## 4. Modelo de datos

El modelo de datos del sistema se deriva del modelo de clases mediante el método de derivación en cinco pasos, documentado en `docs/03-diseño/Modelado/`. Consta de trece tablas: once de entidad y dos intermedias.

| Tabla | Contenido |
|---|---|
| `usuarios` | Credenciales, datos de acceso y rol. Absorbe a administradores, talleristas y cuentas de alumno mediante la columna discriminadora `rol` |
| `alumnos` | Ficha del participante, independiente de su cuenta de acceso |
| `talleres` | Información general de cada taller |
| `taller_tallerista` | Relación N:M entre talleres y talleristas, con la fecha de asignación |
| `horarios_taller` | Franjas de día y hora en que se dicta cada taller |
| `inscripciones` | Relación N:M entre talleres y alumnos, con la fecha de inscripción |
| `asistencias` | Cabecera de cada jornada de asistencia, identificada por taller y fecha |
| `registros_asistencia` | Detalle del estado de cada alumno dentro de una jornada |
| `contenidos` | Material y tareas publicados en cada taller, diferenciados por la columna `tipo` |
| `entregas` | Envío de un alumno para una tarea, con su corrección y calificación |
| `adjuntos` | Archivos asociados a un contenido o a una entrega, con sus metadatos |
| `reportes` | Informes generados, con su tipo, formato y contenido consolidado |
| `trazabilidad` | Registro de las acciones relevantes ejecutadas por los usuarios (NRF10) |

**Diferencia respecto a la propuesta original del proyecto.** El modelo mínimo establecido por la propuesta contemplaba diez tablas, entre ellas `roles`, `talleristas`, `participantes`, `taller_participante`, `mensajes_internos` e `historial_actividad`. El modelo definitivo difiere en cuatro aspectos:

- **`roles` y `talleristas` no se implementan como tablas independientes.** El rol constituye un conjunto cerrado de tres valores sin atributos ni comportamiento propios, por lo que se resuelve como enumeración dentro de `usuarios`. El tallerista, por su parte, aporta un único atributo propio (`especialidad`), lo que no justifica una tabla separada.
- **`mensajes_internos` no se incorpora**, dado que la mensajería quedó fuera del alcance de la primera versión.
- **Se agregan `contenidos` y `entregas`**, necesarias para RF06 a RF10. El modelo mínimo no contemplaba estructura alguna para almacenar material, tareas ni calificaciones.
- **La asistencia se divide en dos niveles**, `asistencias` y `registros_asistencia`, dado que la fecha corresponde a la jornada completa mientras que el estado corresponde a cada alumno en particular.

La justificación completa de estas decisiones se encuentra en el Paso 5 del anexo de derivación.

---

## 5. Organización del trabajo

### 5.1 Roles del equipo

| Integrante | Rol |
|---|---|
| Emiliano Sánchez | Líder de proyecto / Scrum Master |
| Gabriel Rendon | Subcoordinador |
| Ignacio Viera | Desarrollo Frontend y Backend |
| Maximiliano Leal | Desarrollo Frontend y Backend |
| Thiago Ferragut | Desarrollo Frontend y Backend |

### 5.2 Control de versiones

- Repositorio único en GitHub para todo el equipo.
- Uso obligatorio de Git para trazabilidad de cambios.
- **Pull Requests obligatorias**: todo cambio se integra mediante PR con revisión previa de al menos otro integrante (NRF16).
- Commits con mensajes claros y consistentes.
- Documentación técnica versionada dentro del repositorio (NRF14).

### 5.3 Metodología

- **Scrum**, con 6 sprints de 2 semanas (12 semanas totales).
- Incremento funcional al cierre de cada sprint.
- **Reporte de avance quincenal**, coincidente con el cierre de cada sprint.

---

## 6. Alineación con los requerimientos no funcionales

| NRF | Solución tecnológica |
|---|---|
| NRF01 — Diseño responsive | Bootstrap 5.3 |
| NRF05 — Validación frontend y backend | Validación en JavaScript + validación en PHP |
| NRF06 — Separación frontend/backend | Arquitectura de API REST |
| NRF07 — Control de acceso por rol | Autenticación con sesión en backend + paneles separados |
| NRF08 — Protección de datos personales | Hash de contraseñas, consultas preparadas, control de permisos por endpoint |
| NRF09 — Persistencia relacional | MySQL |
| NRF10 — Trazabilidad | Tabla `trazabilidad`, más el registro del usuario responsable en `registros_asistencia` y de la fecha de carga en `adjuntos` |
| NRF11 — Restricción de formatos | Validación de extensión y MIME type (PDF, JPG, documentos de oficina) |
| NRF12 — Restricción de tamaño | Límite configurado en PHP (`upload_max_filesize`) y validado en el endpoint |
| NRF13 — Código organizado | Estructura modular por pantalla |
| NRF14 — Documentación técnica | Carpeta `docs/` versionada |
| NRF15 — Uso de Git | Repositorio GitHub con historial de commits |
| NRF16 — Pull Requests | Flujo de ramas con revisión previa al merge |

---

## 7. Estado actual de la implementación

| Componente | Estado |
|---|---|
| Panel administrador | HTML, CSS y JavaScript completos, con mock data funcional |
| Panel tallerista | HTML, CSS y JavaScript completos, con mock data funcional. Incluye la gestión de material y tareas y la corrección de entregas |
| Panel alumno | Estructura HTML y CSS lista; lógica JavaScript pendiente |
| Login (`index.html`) | Interfaz terminada; autenticación pendiente (`auth.js` sin implementar) |
| Base de datos | Script definido en `backend/DataBase/inau_talleres.sql`, con las trece tablas y datos de prueba. Pendiente de ejecución en el servidor |
| Backend | Desarrollo iniciado; sin avances incorporados al repositorio a la fecha |
| Documentación técnica | Análisis, diseño y modelado completos. `api.md` y `testing.md` pendientes de contenido |

Esta justificación tecnológica seguirá vigente durante el desarrollo del backend, momento en el que se evaluará si las herramientas previstas (PHP, MySQL) siguen siendo las más adecuadas según los avances del equipo.