# Justificación Tecnológica y Arquitectura - Sistema de Gestión de Talleres en Convenio con INAU

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
| **Mock data** | Simulación de datos | Permitió construir y validar las tres interfaces antes de contar con la API. Fue reemplazado por llamadas reales, salvo un resto en la asistencia del alumno (ver sección 7). |

<br>

### 1.2 Backend

| Tecnología | Uso | Justificación |
|---|---|---|
| **PHP 8.3** | Lógica del servidor | Establecido en la propuesta original del proyecto. Se utiliza orientado a objetos y sin framework, organizado en capas (Router → Middleware → Controller → Service → Repository), lo que mantiene el código comprensible para el equipo. |
| **MySQL** | Base de datos | Establecido en la propuesta original. El modelo de datos requiere relaciones N:M, lo que justifica un motor relacional. Cumple NRF09. |
| **PDO (pdo_mysql)** | Acceso a la base de datos | Consultas preparadas en todos los accesos, lo que previene la inyección SQL. Contribuye a NRF08. |
| **Composer + firebase/php-jwt** | Autenticación | Gestión de dependencias y emisión de tokens JWT para la autenticación, sin implementar criptografía propia. |
| **Symfony Rate Limiter** | Limitación de intentos | Restringe los intentos repetidos de inicio de sesión, como defensa ante ataques de fuerza bruta. |
| **API REST** | Comunicación frontend-backend | Requisito explícito de la propuesta original ("organización del sistema bajo arquitectura de endpoints REST"). Permite mantener las capas desacopladas (NRF06). |
| **Fetch API** | Consumo de la API desde el cliente | API nativa del navegador, sin necesidad de librerías externas, coherente con la decisión de dependencias mínimas. |
| **Filesystem del servidor** | Almacenamiento de adjuntos | Establecido en la propuesta original. Los archivos se guardan en un volumen de Docker (`uploads`), sin depender de un servicio de almacenamiento externo. |

<br>

### 1.3 Herramientas de desarrollo

| Herramienta | Justificación |
|---|---|
| **Git / GitHub** | Requisito obligatorio del proyecto. Permite trazabilidad de cambios y trabajo simultáneo del equipo. Cumple NRF15 y NRF16. |
| **Visual Studio Code** | Entorno gratuito, liviano y ampliamente documentado, adecuado para un equipo en formación. |
| **Docker Desktop / Docker Compose** | Levanta la API y la base de datos en contenedores, de modo que todo el equipo trabaja con el mismo entorno y el proyecto queda preparado para su despliegue (ver los documentos de reconstrucción en `docs/04-implementacion/`). |

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

Cada panel replica la misma estructura modular, y comparte con los demás una carpeta común:

| Archivo | Responsabilidad |
|---|---|
| `frontend/js/api.js` | Cliente común para las llamadas a la API. |
| `frontend/js/auth.js` | Inicio de sesión y redirección al panel correspondiente según el rol. |
| `main.js` | Punto de entrada de cada panel: detecta la página actual mediante `data-page`, gestiona navbar y cierre de sesión, e invoca el inicializador correspondiente. |
| `mock-data.js` | Datos simulados de la etapa inicial; hoy solo quedan restos. No manipula el DOM. |
| `utils.js` | Funciones genéricas reutilizables (lectura de parámetros de URL, formateo, etc.), sin conocimiento de ninguna pantalla concreta. |
| `<pantalla>.js` | Un archivo por vista, con responsabilidad única sobre esa pantalla. |

Esta organización cumple NRF13 y permite que distintos integrantes trabajen en pantallas separadas sin generar conflictos de archivos.

---

<br>

## 3. Decisiones arquitectónicas

**Login único con redirección por rol.** En lugar de tres pantallas de acceso independientes, existe un único `frontend/index.html`, donde el usuario ingresa con correo y contraseña. La API valida las credenciales y el frontend lo redirige al panel que corresponde a su rol. Reduce duplicación de código y cumple RF01.

**Paneles independientes por rol.** Se optó por tres interfaces separadas en lugar de una sola con visibilidad condicional. Para un equipo en formación, mantener paneles separados reduce el riesgo de errores de permisos frente a gestionar condicionales dentro de una única base de código.

**Frontend primero, con datos simulados.** El desarrollo avanzó sobre mock data antes de implementar el backend, lo que permitió validar flujos y experiencia de usuario sin bloquear el trabajo a la espera de la API. La estructura de los datos simulados replicaba la del modelo de datos, lo que facilitó su sustitución por llamadas reales.

**Navegación mediante parámetros de URL.** Las pantallas de detalle reciben identificadores por URL (`detalle-taller.html?id=1`, `asistencia.html?tallerId=1`), imitando desde el inicio el comportamiento de una aplicación conectada a endpoints REST, lo que simplificó la migración a la API.

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
| NRF07 — Control de acceso por rol | Autenticación con token JWT en cookie HttpOnly y verificación de rol en cada ruta, más paneles separados |
| NRF08 — Protección de datos personales | Hash de contraseñas, consultas preparadas, control de permisos por endpoint |
| NRF09 — Persistencia relacional | MySQL |
| NRF10 — Trazabilidad | Tabla `trazabilidad`, más el registro del usuario responsable en `registros_asistencia` y de la fecha de carga en `adjuntos` |
| NRF11 — Restricción de formatos | Validación de extensión y MIME type (PDF y JPG) |
| NRF12 — Restricción de tamaño | Límite configurado en PHP (`upload_max_filesize`) y validado en el endpoint |
| NRF13 — Código organizado | Estructura modular por pantalla en el frontend y arquitectura en capas en el backend |
| NRF14 — Documentación técnica | Carpeta `docs/` versionada |
| NRF15 — Uso de Git | Repositorio GitHub con historial de commits |
| NRF16 — Pull Requests | Flujo de ramas con revisión previa al merge |

---

<br>

## 7. Estado actual de la implementación

| Componente | Estado |
|---|---|
| Panel administrador | Conectado a la API. Pendientes: exportación de informes en PDF o Excel, listado de alumnos, informe de talleristas y consulta de datos sensibles |
| Panel tallerista | Conectado a la API. Incluye la gestión de material y tareas y la corrección de entregas; pendientes: adjuntar archivos al material y eliminar notas desde la interfaz |
| Panel alumno | Completo y conectado a la API, salvo la asistencia, que conserva datos simulados |
| Login (`frontend/index.html`) | Acceso por correo y contraseña, autenticación contra la API y redirección por rol |
| Base de datos | Script con las trece tablas y datos de prueba en `backend/api-completa/DataBase/inau_talleres.sql`, ejecutado en el entorno Docker |
| Backend | Implementado: API REST con 53 rutas, organizada en capas, con autenticación JWT y control de acceso por rol |
| Documentación técnica | Análisis, diseño, modelado y pruebas completos (`Testing/Testing-01.md`, ejecutado el 24/10/2026 en un servidor Ubuntu). `api.md` pendiente de contenido |

El backend se desarrolló con las herramientas previstas, por lo que las decisiones de esta justificación se mantienen.