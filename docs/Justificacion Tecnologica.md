# Justificación Tecnológica y Arquitectura

## Sistema de Gestión de Talleres en Convenio con INAU

---

## 1. Introducción

Este documento fundamenta las decisiones tecnológicas y arquitectónicas adoptadas para el desarrollo del sistema, en base a las tecnologías establecidas en la propuesta original del proyecto, los requerimientos funcionales y no funcionales definidos para la primera versión, y el estado actual del repositorio `proyecto-convenio-INAU`.

---

## 2. Stack tecnológico

### 2.1 Frontend

| Tecnología | Uso | Justificación |
|---|---|---|
| **HTML5** | Estructura de las páginas | Estándar semántico, sin dependencias adicionales, compatible con cualquier navegador moderno. |
| **CSS3** | Personalización visual | Permite el diseño institucional sin necesidad de preprocesadores, manteniendo el proyecto liviano. |
| **Bootstrap 5.3** | Diseño responsive y componentes | La propuesta del proyecto admitía Tailwind o Bootstrap; se optó por Bootstrap por su curva de aprendizaje más accesible y su sistema de componentes predefinidos, que reduce el tiempo de desarrollo — factor crítico dado el plazo de 12 semanas. Resuelve directamente NRF01. |
| **Bootstrap Icons** | Iconografía | Consistencia visual sin necesidad de gestionar íconos sueltos, integrado con el mismo framework. |
| **JavaScript Vanilla** | Comportamiento dinámico | Establecido en la propuesta original del proyecto. Evita la curva de aprendizaje de un framework, priorizando que el equipo comprenda y mantenga su propio código. |
| **localStorage** | Persistencia temporal | Solución provisional para demostración mientras no existe backend. No reemplaza la base de datos, no ofrece seguridad real y no almacena contraseñas. |
| **Mock data** | Simulación de datos | Permite construir y validar la lógica de las tres interfaces sin depender de que el backend esté terminado. |

### 2.2 Backend (previsto)

| Tecnología | Uso | Justificación |
|---|---|---|
| **PHP** | Lógica del servidor | Establecido en la propuesta original del proyecto. Compatible con el entorno de desarrollo utilizado (XAMPP) y con amplia documentación disponible. |
| **MySQL** | Base de datos | Establecido en la propuesta original. El modelo de datos requiere relaciones N:M (ej. `taller_participante`), lo que justifica un motor relacional. Cumple NRF09. |
| **API REST** | Comunicación frontend-backend | Requisito explícito de la propuesta original ("organización del sistema bajo arquitectura de endpoints REST"). Permite mantener las capas desacopladas (NRF06). |
| **Fetch API** | Consumo de la API desde el cliente | API nativa del navegador, sin necesidad de librerías externas, coherente con la decisión de dependencias mínimas. |
| **Filesystem del servidor** | Almacenamiento de adjuntos | Establecido en la propuesta original. Evita la complejidad de un servicio de almacenamiento externo para una primera versión. |

> **Nota:** la propuesta original presenta una ambigüedad entre PHP puro (sección 2.1) y Laravel (plantilla de README, sección 10.2). Esta definición se encuentra pendiente de resolución con el docente y el equipo.

### 2.3 Herramientas de desarrollo

| Herramienta | Justificación |
|---|---|
| **Git / GitHub** | Requisito obligatorio del proyecto. Permite trazabilidad de cambios y trabajo simultáneo del equipo de 5 integrantes. Cumple NRF15 y NRF16. |
| **Visual Studio Code** | Entorno gratuito, liviano y ampliamente documentado, adecuado para un equipo en formación. |
| **XAMPP / servidor local** | Simula un entorno PHP + MySQL en el equipo de cada integrante durante el desarrollo, sin requerir hosting hasta el despliegue. |

---

## 3. Arquitectura del sistema

### 3.1 Visión general

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

### 3.2 Estructura del repositorio

```text
proyecto-convenio-INAU/
│
├── index.html                    → Pantalla de login única
├── README.md
│
├── backend/                      → Reservado (sin implementación)
│   └── .gitkeep
│
├── docs/                         → Documentación técnica
│   ├── Acta de Reuniones.md
│   ├── Charter.md
│   ├── Declaración de Etica en el uso de IA.md
│   ├── Doc.md
│   ├── PrimeraVista.md
│   ├── api.md
│   ├── modelado.md
│   ├── planificacion.md
│   ├── requerimientos.md
│   ├── seguridad.md
│   └── testing.md
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
    │   └── 7 páginas HTML
    │
    └── frontend-alumno/
        ├── css/styles.css
        └── 7 páginas HTML
```

**Diferencia respecto a la plantilla original:** la propuesta del proyecto ubicaba `frontend-admin/` y `frontend-tallerista/` en la raíz del repositorio. El equipo optó por agruparlos dentro de una carpeta `frontend/` común, para mantener la raíz más limpia y facilitar la distinción entre las capas del sistema (frontend, backend, documentación). Se agregó además `frontend-alumno/`, correspondiente al tercer rol incorporado tras el relevamiento con el cliente.

### 3.3 Organización del código JavaScript

Cada panel replica la misma estructura modular:

| Archivo | Responsabilidad |
|---|---|
| `main.js` | Punto de entrada común: detecta la página actual mediante `data-page`, gestiona navbar y cierre de sesión, e invoca el inicializador correspondiente. |
| `mock-data.js` | Datos simulados que reemplazan temporalmente a la base de datos. No manipula el DOM. |
| `utils.js` | Funciones genéricas reutilizables (lectura de parámetros de URL, formateo, etc.), sin conocimiento de ninguna pantalla concreta. |
| `<pantalla>.js` | Un archivo por vista, con responsabilidad única sobre esa pantalla. |

Esta organización cumple NRF13 y permite que distintos integrantes trabajen en pantallas separadas sin generar conflictos de archivos.

---

## 4. Decisiones arquitectónicas

**Login único con redirección por rol.** En lugar de tres pantallas de acceso independientes, existe un único `index.html`. El backend identificará el rol del usuario autenticado y lo redirigirá al panel correspondiente. Reduce duplicación de código y cumple RF01.

**Paneles independientes por rol.** Se optó por tres interfaces separadas en lugar de una sola con visibilidad condicional. Para un equipo en formación, mantener paneles separados reduce el riesgo de errores de permisos frente a gestionar condicionales dentro de una única base de código.

**Frontend primero, con datos simulados.** El desarrollo avanza sobre mock data antes de implementar el backend, lo que permite validar flujos y experiencia de usuario sin bloquear el trabajo a la espera de la API. La estructura de los datos simulados replica la del modelo de datos previsto, facilitando la sustitución posterior por llamadas reales.

**Navegación mediante parámetros de URL.** Las pantallas de detalle reciben identificadores por URL (`detalle-taller.html?id=1`, `asistencia.html?tallerId=1`), imitando el comportamiento de una aplicación conectada a endpoints REST y facilitando la migración futura.

**Persistencia local estrictamente provisional.** `localStorage` se utiliza únicamente para demostración durante el desarrollo. No sustituye a MySQL, no ofrece garantías de seguridad y no almacena credenciales.

---

## 5. Modelo de datos previsto

Tablas mínimas requeridas por la propuesta original:

| Tabla | Contenido |
|---|---|
| `usuarios` | Credenciales y datos de acceso |
| `roles` | Rol asignado a cada usuario |
| `talleristas` | Información específica de talleristas |
| `participantes` | Ficha de cada alumno registrado |
| `talleres` | Información general de cada taller |
| `taller_participante` | Relación N:M entre talleres y alumnos |
| `asistencias` | Registro por alumno, fecha y taller, con trazabilidad |
| `mensajes_internos` | Mensajería entre administrador y talleristas |
| `historial_actividad` | Trazabilidad de acciones relevantes (NRF10) |
| `adjuntos` | Referencias a archivos almacenados en filesystem |

---

## 6. Organización del trabajo

### 6.1 Roles del equipo

| Integrante | Rol |
|---|---|
| Emiliano Sánchez | Líder de proyecto / Scrum Master |
| Gabriel Rendon | Subcoordinador |
| Ignacio Viera | Desarrollo Frontend y Backend |
| Maximiliano Leal | Desarrollo Frontend y Backend |
| Thiago Ferragut | Desarrollo Frontend y Backend |

### 6.2 Control de versiones

- Repositorio único en GitHub para todo el equipo.
- Uso obligatorio de Git para trazabilidad de cambios.
- **Pull Requests obligatorias**: todo cambio se integra mediante PR con revisión previa de al menos otro integrante (NRF16).
- Commits con mensajes claros y consistentes.
- Documentación técnica versionada dentro del repositorio (NRF14).

### 6.3 Metodología

- **Scrum**, con 6 sprints de 2 semanas (12 semanas totales).
- Incremento funcional al cierre de cada sprint.
- **Reporte de avance quincenal**, coincidente con el cierre de cada sprint.

---

## 7. Alineación con los requerimientos no funcionales

| NRF | Solución tecnológica |
|---|---|
| NRF01 — Diseño responsive | Bootstrap 5.3 |
| NRF05 — Validación frontend y backend | Validación en JavaScript + validación en PHP |
| NRF06 — Separación frontend/backend | Arquitectura de API REST |
| NRF07 — Control de acceso por rol | Autenticación con sesión en backend + paneles separados |
| NRF08 — Protección de datos personales | Hash de contraseñas, consultas preparadas, control de permisos por endpoint |
| NRF09 — Persistencia relacional | MySQL |
| NRF10 — Trazabilidad | Tabla `historial_actividad` |
| NRF11 — Restricción de formatos | Validación de extensión y MIME type (PDF, JPG, documentos de oficina) |
| NRF12 — Restricción de tamaño | Límite configurado en PHP (`upload_max_filesize`) y validado en el endpoint |
| NRF13 — Código organizado | Estructura modular por pantalla |
| NRF14 — Documentación técnica | Carpeta `docs/` versionada |
| NRF15 — Uso de Git | Repositorio GitHub con historial de commits |
| NRF16 — Pull Requests | Flujo de ramas con revisión previa al merge |

---

## 8. Estado actual de la implementación

| Componente | Estado |
|---|---|
| Panel administrador | HTML, CSS y JavaScript completos, con mock data funcional |
| Panel tallerista | HTML, CSS y JavaScript completos, con mock data funcional |
| Panel alumno | Estructura HTML y CSS lista; lógica JavaScript pendiente |
| Login (`index.html`) | Interfaz terminada; autenticación pendiente (`auth.js` sin implementar) |
| Backend | No iniciado (carpeta reservada) |
| Base de datos | No iniciada |
| Documentación técnica | `requerimientos.md` y `seguridad.md` con contenido; `api.md`, `modelado.md`, `planificacion.md` y `testing.md` pendientes |
