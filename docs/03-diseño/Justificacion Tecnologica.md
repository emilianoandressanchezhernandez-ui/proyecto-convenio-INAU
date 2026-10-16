# Justificación Tecnológica y Arquitectura - Sistema de Gestión de Talleres en Convenio con INAU

<br>
<br>

## 1. Stack tecnológico

<br>

### 1.1 Frontend

| Tecnología | Uso | Justificación |
|---|---|---|
| **HTML5** | Estructura de las páginas | Estándar semántico, sin dependencias adicionales, compatible con cualquier navegador moderno. |
| **CSS3** | Personalización visual | Permite el diseño institucional sin necesidad de preprocesadores, manteniendo el proyecto liviano. |
| **Bootstrap 5.3** | Diseño responsive y componentes | La propuesta del proyecto admitía Tailwind o Bootstrap; se optó por Bootstrap por su curva de aprendizaje más accesible y su sistema de componentes predefinidos, que reduce el tiempo de desarrollo — factor crítico dado el plazo de 12 semanas. Resuelve directamente NRF01. |
| **Bootstrap Icons** | Iconografía | Consistencia visual sin necesidad de gestionar íconos sueltos, integrado con el mismo framework. |
| **JavaScript Vanilla** | Comportamiento dinámico | Establecido en la propuesta original del proyecto. Evita la curva de aprendizaje de un framework, priorizando que el equipo comprenda y mantenga su propio código. |
| **localStorage** | Persistencia temporal | Solución provisional para la demostración mientras no existe backend (ver sección 3). |
| **Mock data** | Simulación de datos | Datos simulados que permiten construir y validar la lógica de las tres interfaces sin depender del backend (ver sección 3). |

<br>

### 1.2 Backend (previsto)

| Tecnología | Uso | Justificación |
|---|---|---|
| **PHP** | Lógica del servidor | Establecido en la propuesta original del proyecto. Compatible con el entorno de desarrollo utilizado (XAMPP) y con amplia documentación disponible. |
| **MySQL** | Base de datos | Establecido en la propuesta original. El modelo de datos requiere relaciones N:M, lo que justifica un motor relacional. Cumple NRF09. |
| **API REST** | Comunicación frontend-backend | Requisito explícito de la propuesta original ("organización del sistema bajo arquitectura de endpoints REST"). Permite mantener las capas desacopladas (NRF06). |
| **Fetch API** | Consumo de la API desde el cliente | API nativa del navegador, sin necesidad de librerías externas, coherente con la decisión de dependencias mínimas. |
| **Filesystem del servidor** | Almacenamiento de adjuntos | Establecido en la propuesta original. Evita la complejidad de un servicio de almacenamiento externo para una primera versión. |

> **Nota:** la propuesta original del proyecto presenta una ambigüedad entre PHP puro, indicado en su stack tecnológico, y Laravel, mencionado en su plantilla de README. Esta definición se encuentra pendiente de resolución con el docente y el equipo.

<br>

### 1.3 Herramientas de desarrollo

| Herramienta | Justificación |
|---|---|
| **Git / GitHub** | Requisito obligatorio del proyecto. Permite trazabilidad de cambios y trabajo simultáneo del equipo. Cumple NRF15 y NRF16. |
| **Visual Studio Code** | Entorno gratuito, liviano y ampliamente documentado, adecuado para un equipo en formación. |
| **XAMPP / servidor local** | Simula un entorno PHP + MySQL en el equipo de cada integrante durante el desarrollo, sin requerir hosting hasta el despliegue. |

---

<br>


## 2. Arquitectura del sistema

<br>

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


La estructura completa del repositorio —el árbol de carpetas y la justificación de su organización— se documenta en `docs/Estructura del Repositorio.md`.


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

<br>

## 3. Decisiones arquitectónicas

**Login único con redirección por rol.** En lugar de tres pantallas de acceso independientes, existe un único `index.html`. El backend identificará el rol del usuario autenticado y lo redirigirá al panel correspondiente. Reduce duplicación de código y cumple RF01.

**Paneles independientes por rol.** Se optó por tres interfaces separadas en lugar de una sola con visibilidad condicional. Para un equipo en formación, mantener paneles separados reduce el riesgo de errores de permisos frente a gestionar condicionales dentro de una única base de código.

**Frontend primero, con datos simulados.** El desarrollo avanza sobre mock data antes de implementar el backend, lo que permite validar flujos y experiencia de usuario sin bloquear el trabajo a la espera de la API. La estructura de los datos simulados replica la del modelo de datos, facilitando la sustitución posterior por llamadas reales.

**Navegación mediante parámetros de URL.** Las pantallas de detalle reciben identificadores por URL (`detalle-taller.html?id=1`, `asistencia.html?tallerId=1`), imitando el comportamiento de una aplicación conectada a endpoints REST y facilitando la migración futura.

**Persistencia local estrictamente provisional.** `localStorage` se utiliza únicamente para demostración durante el desarrollo. No sustituye a MySQL, no ofrece garantías de seguridad y no almacena credenciales.

---

<br>

## 4. Modelo de datos

El modelo de datos se deriva del modelo de clases mediante el método de derivación en cinco pasos. Consta de trece tablas: once de entidad y dos intermedias. Su detalle tabla por tabla, y la justificación de las diferencias respecto al modelo mínimo de la propuesta original, se encuentran en `docs/03-diseño/Modelado/` —en particular, en el Paso 5 del anexo de derivación.

---

<br>

## 5. Organización del trabajo

<br>

### 5.1 Roles del equipo

La composición del equipo y la asignación de roles se detallan en el Project Charter (`docs/01-gestion/Charter.md`).

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

<br>

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

<br>

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

>Pendiente: Revisar por Diego.