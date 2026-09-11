# Revisión integral de coherencia — Proyecto TheNewfutures / INAU

**Fecha de revisión:** 9 de septiembre de 2026
**Fuente:** rama `cambios-frontend` del repositorio `proyecto-convenio-INAU`.
**Alcance:** documentación, estructura de repositorio, HTML, CSS, JavaScript y SQL presentes en el repositorio.

> Esta revisión distingue entre lo que está realmente presente en el repositorio, lo que la documentación declara y lo que todavía está planificado. No se considera una implementación como terminada solo porque esté descrita en un documento.

---

## 1. Diagnóstico general

El proyecto tiene una **arquitectura general coherente** y una separación clara entre frontend, backend previsto y documentación. El frontend del tallerista es el bloque más avanzado; el frontend administrador posee una cantidad importante de páginas y JavaScript; el frontend alumno tiene las vistas HTML y CSS, pero no tiene JavaScript; el backend está iniciado pero sin avances incorporados al repositorio, aunque ya existe un esquema SQL completo.

La documentación se reorganizó recientemente en carpetas por etapa del proyecto y la mayoría de sus piezas están completas. El principal problema pendiente es la **sincronización entre los datos de prueba del frontend y los de la base de datos**, además de la implementación del login y del panel del alumno.

### Estado general

| Área | Estado | Observación |
|---|---|---|
| Análisis del problema | Completo | Entrevista, análisis, requerimientos, historias de usuario y backlog. |
| Alcance | Definido | Alcance incluido, excluido y ajuste por plazo documentados de forma coherente. |
| Frontend tallerista | Avanzado | Nueve páginas con lógica completa y datos simulados, incluida la gestión de material y la corrección de entregas. |
| Frontend administrador | Avanzado | Once páginas y quince módulos de JavaScript funcionales con datos simulados. |
| Frontend alumno | Inicial | Siete páginas HTML y hoja de estilos; no existe carpeta `js/`. |
| Login | Pendiente | `index.html` existe con diseño terminado, pero la autenticación no está implementada. |
| Backend PHP | Iniciado | Sin avances incorporados al repositorio a la fecha. |
| Base de datos | Completa como diseño | Trece tablas con claves, restricciones, índices y datos de prueba. |
| API REST | Pendiente | `docs/04-implementacion/api.md` está vacío. |
| Modelo de datos documental | Completo | Modelo de clases, MER, anexo de derivación y análisis del modelo. |
| Planificación documental | Completa | Backlog priorizado en seis sprints. |
| Testing documental | Pendiente | `docs/04-implementacion/testing.md` está vacío. |
| Seguridad | Parcial | Existe análisis de amenazas; falta vincularlo con pruebas e implementación real. |
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
│   └── DataBase/
│       └── inau_talleres.sql
│
├── docs/
│   ├── Documentación de infraestructura.md
│   ├── Estructura del Repositorio.md
│   ├── PrimeraVista.md
│   │
│   ├── 01-gestion/
│   │   ├── Acta de Reuniones.md
│   │   ├── Charter.md
│   │   └── Declaración de Etica en el uso de IA.md
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
│   │   ├── api.md
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

**Total: 80 archivos en el repositorio.**

El README todavía describe un estado anterior y debe actualizarse.

---

## 3. Coherencia funcional por rol

### Administrador

Dispone de pantallas para dashboard, talleristas, detalle de tallerista, alumnos, detalle de alumno, talleres, detalle de taller, asistencias, reportes, detalle de reporte y perfil.

Las pantallas cargan módulos específicos junto con `mock-data.js`. El JavaScript actual permite trabajar de forma simulada con listados, búsquedas, detalles, estadísticas y formularios con ventanas modales.

**Conclusión:** frontend administrativo avanzado, pendiente de validación módulo por módulo y de la migración posterior a la API.

### Tallerista

Dispone de dashboard, perfil, mis talleres, detalle del taller, asistencia, informes, detalle de informe, material y corrección de tareas.

Existe una arquitectura modular por pantalla y datos simulados más completos que los del resto de los paneles.

**Conclusión:** es la parte más madura del proyecto.

### Alumno

Hay siete páginas: dashboard, mis talleres, detalle del taller, tareas, detalle de tarea, asistencia y perfil.

**No existe la carpeta `js/`**, pero las siete páginas referencian cuatro archivos JavaScript cada una (`mock-data.js`, `utils.js`, `main.js` y el módulo propio de la pantalla). En consecuencia, ninguna página del panel del alumno funciona actualmente.

**Conclusión:** la interfaz está diseñada, pero su funcionalidad no está implementada.

---

## 4. Principales incoherencias detectadas

### 4.1 Los datos de prueba de adjuntos violan NRF11

NRF11 restringe los formatos de archivos adjuntos a PDF, imágenes JPG y documentos de oficina. Sin embargo, los datos de prueba del script SQL incluyen dos adjuntos de tipo `text/html`:

```text
pagina-sofia.html   → MIME: text/html
pagina-mateo.html   → MIME: text/html
```

Son archivos que el propio sistema rechazaría al aplicar la validación de formato.

**Acción recomendada:** reemplazar esos registros por adjuntos de un formato permitido, manteniendo la coherencia entre los datos de prueba y los requerimientos.

### 4.2 Los identificadores del mock data no coinciden con los del SQL

En `frontend-admin/js/mock-data.js` el tallerista Martín Rodríguez tiene `id: 5`, y los talleres apuntan a `talleristaId: 5`. En los datos de prueba del SQL, ese mismo tallerista tiene `id: 3`.

Esto no afecta el funcionamiento actual, dado que ambas fuentes son independientes, pero producirá inconsistencias al sustituir los datos simulados por llamadas a la API.

**Acción recomendada:** definir los datos de prueba desde una única fuente y hacer que el mock data reproduzca exactamente los mismos registros que el SQL.

### 4.3 El panel del alumno referencia archivos inexistentes

Las siete páginas del panel del alumno incluyen etiquetas `<script>` hacia `js/mock-data.js`, `js/utils.js`, `js/main.js` y su módulo correspondiente. Ninguno de esos archivos existe.

**Acción recomendada:** implementar la carpeta `js/` del panel siguiendo la misma estructura modular de los otros dos, o retirar temporalmente las referencias si la implementación se posterga.

### 4.4 El login utiliza una ruta absoluta hacia el CSS de otro panel

`index.html` carga sus estilos desde `/frontend/frontend-tallerista/css/styles.css`. Presenta dos inconvenientes: la ruta absoluta solo funciona si el sitio se sirve desde la raíz del dominio, y la pantalla de acceso —que no pertenece a ningún rol— depende de la hoja de estilos de un panel específico.

**Acción recomendada:** crear una hoja de estilos propia para el login, en una carpeta común, con ruta relativa.

### 4.5 El login no tiene implementación de autenticación

`index.html` existe con el diseño terminado, pero no hay ningún archivo JavaScript que procese el formulario. El `auth.js` presente en el panel del administrador está vacío.

Esto bloquea RF01 y, en consecuencia, la diferenciación de acceso por rol.

### 4.6 PrimeraVista.md conserva definiciones superadas

El documento `PrimeraVista.md`, que registra el estado del proyecto en julio, contiene definiciones que fueron modificadas posteriormente:

| Definición en PrimeraVista | Estado actual |
|---|---|
| Estados de taller: planificado, en curso, finalizado, suspendido | Activo y finalizado |
| Modelo de datos preliminar con `mensajes_internos` e `historial_actividad` | Trece tablas sin mensajería, con `trazabilidad` |
| Dos roles con acceso al sistema | Tres roles |

**Acción recomendada:** conservar el documento como registro histórico, agregando una nota inicial que aclare su fecha y remita a la documentación vigente en `03-diseño/`.

### 4.7 El README no refleja el estado actual

Describe un estado anterior: no incluye el panel del alumno, indica menos archivos de los existentes y no refleja las páginas incorporadas al panel del tallerista.

### 4.8 Documentación técnica pendiente

Dos documentos permanecen vacíos:

```text
docs/04-implementacion/api.md
docs/04-implementacion/testing.md
```

Ambos son entregables explícitos del proyecto.

### 4.9 Archivos con nomenclatura irregular

- `backend/.md` es un archivo cuyo nombre consiste únicamente en la extensión. Si su función es preservar la carpeta en el control de versiones, corresponde renombrarlo a `.gitkeep`, como en el resto del repositorio.
- `docs/seguridad.md` existía en la rama principal con contenido, pero no aparece tras la reorganización de carpetas. Corresponde recuperarlo y ubicarlo en `04-implementacion/`.
- La carpeta `03-diseño` contiene un carácter acentuado, a diferencia de las demás. Los nombres de ruta con tildes pueden generar inconvenientes en enlaces y en determinados entornos.

### 4.10 Ausencia de `.gitignore` y `LICENSE`

Ambos archivos están contemplados en la plantilla original del proyecto y no se encuentran en el repositorio. El `.gitignore` resulta especialmente relevante ante la incorporación del entorno Docker, que requiere excluir el archivo `.env` con las credenciales de base de datos.

---

## 5. Estado de requisitos funcionales

De los veintiséis requerimientos definidos, veinte integran el alcance de la primera versión y seis fueron postergados por restricción de plazo.

### Requerimientos de la primera versión

| Código | Requisito | Estado actual |
|---|---|---|
| RF01 | Login y diferenciación por rol | Pendiente: interfaz sí, autenticación no. |
| RF02 | Gestión de usuarios y talleres | Parcial: frontend con datos simulados; persistencia pendiente. |
| RF03 | Asignación de alumnos y talleristas | Parcial: interfaz y datos simulados; persistencia pendiente. |
| RF04 | Registrar asistencia | Avanzado en frontend tallerista, con almacenamiento local. |
| RF05 | Consultar y modificar asistencia | Avanzado en frontend; backend pendiente. |
| RF06 | Subir material y tareas | Implementado en frontend tallerista; persistencia de archivos pendiente. |
| RF07 | Alumno visualiza material y tareas | HTML preparado; JavaScript pendiente. |
| RF08 | Alumno envía archivos | HTML preparado; lógica y backend pendientes. |
| RF09 | Tallerista corrige tareas | Implementado en `correccion-tarea.js`; persistencia pendiente. |
| RF10 | Asignar notas | Implementado en frontend; backend pendiente. |
| RF11 | Informes de asistencia | Frontend avanzado con datos simulados; generación real pendiente. |
| RF12 | Informes de talleres y talleristas | Frontend avanzado; backend pendiente. |
| RF13 | Exportación en PDF o Excel | No implementada: la descarga actual produce un archivo de texto provisional. |
| RF14 | Gestión de perfil según rol | Parcial: funciona con simulación en administrador y tallerista. |
| RF16 | Eliminar material | Implementado en `material.js`; persistencia pendiente. |
| RF17 | Eliminar nota asignada | Implementado en frontend; persistencia pendiente. |
| RF19 | Generar listado de alumnos | Contemplado en el módulo de reportes; generación real pendiente. |
| RF22 | Informe de talleristas | Contemplado en el módulo de reportes; generación real pendiente. |
| RF24 | Consultar datos sensibles | No implementado. |
| RF25 | Listado de alumnos del taller | Implementado en el detalle del taller del panel tallerista. |

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
| NRF03 | Rapidez en operaciones | Diseño liviano e índices definidos en el SQL; falta medición objetiva. |
| NRF04 | Navegación clara y consistente | Avanzado en los paneles implementados. |
| NRF05 | Validación en frontend y backend | Frontend avanzado; backend pendiente. |
| NRF06 | Separación frontend y backend | Arquitectura prevista y carpetas separadas. |
| NRF07 | Control de acceso por rol | Previsto; autenticación y backend pendientes. |
| NRF08 | Protección de datos personales | Documentada; implementación pendiente del backend. |
| NRF09 | Persistencia relacional | Esquema SQL completo; base de datos no desplegada. |
| NRF10 | Trazabilidad | Tabla `trazabilidad` diseñada; registro real pendiente. |
| NRF11 | Restricción de formatos | Documentada, pero contradicha por los datos de prueba (ver 4.1). |
| NRF12 | Restricción de tamaño | Documentada como configuración prevista; pendiente del backend. |
| NRF13 | Código organizado | Avanzado, especialmente en los paneles de administrador y tallerista. |
| NRF14 | Documentación técnica | Avanzada; restan `api.md` y `testing.md`. |
| NRF15 | Uso de Git | Implementado. |
| NRF16 | Pull Requests obligatorias | Declarado en la documentación y respaldado por el flujo de ramas del repositorio. |

---

## 7. Base de datos actual

El script SQL define trece tablas:

`usuarios`, `alumnos`, `talleres`, `taller_tallerista`, `horarios_taller`, `inscripciones`, `asistencias`, `registros_asistencia`, `contenidos`, `entregas`, `adjuntos`, `reportes` y `trazabilidad`.

Incluye claves primarias y foráneas, restricciones de unicidad, índices sobre las columnas de filtrado frecuente, restricciones de verificación, datos de prueba y hashes de contraseña válidos.

El esquema se corresponde con el modelo de clases documentado en `03-diseño/Modelado/`, con la correspondencia clase-tabla verificada en el Paso 5 del anexo de derivación. La única salvedad son los datos de prueba señalados en 4.1 y 4.2.

---

## 8. Seguridad

El documento de identificación de amenazas reconoce tres riesgos principales:

| Amenaza | Probabilidad | Impacto | Riesgo | Clasificación |
|---|---:|---:|---:|---|
| Phishing | 4 | 3 | 12 | Crítico |
| XSS | 3 | 3 | 9 | Tolerable |
| Ransomware | 2 | 4 | 8 | Tolerable |

Las buenas prácticas propuestas incluyen validación de entradas, sanitización, preferencia por `textContent` sobre `innerHTML`, autenticación segura, HTTPS, permisos por rol, actualización de dependencias y documentación de medidas.

En el JavaScript actual se observa el uso de funciones de escape y de `textContent` en varios módulos, lo que indica que parte de estas decisiones ya se aplica en el frontend. La seguridad efectiva del sistema, no obstante, dependerá principalmente del backend.

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

1. La arquitectura general frontend → API REST → PHP → MySQL es consistente entre todos los documentos.
2. El stack de Bootstrap, HTML, CSS y JavaScript sin framework coincide con la justificación tecnológica.
3. El uso de datos simulados antes del backend está correctamente planteado y documentado.
4. La estructura modular del JavaScript es coherente con la arquitectura descrita.
5. El esquema SQL se corresponde con el modelo de clases, con trazabilidad verificada paso a paso.
6. El alcance incluido, el excluido y el ajuste por plazo son coherentes entre el documento principal, el Charter y el modelo.
7. Las decisiones de seguridad están documentadas y algunas ya aparecen aplicadas en el frontend.

### Lo que debe corregirse prioritariamente

1. Corregir los datos de prueba de adjuntos, que contradicen NRF11.
2. Alinear los identificadores del mock data con los del SQL.
3. Implementar el JavaScript del panel del alumno o retirar sus referencias.
4. Implementar la autenticación del login.
5. Corregir la ruta del CSS del login.
6. Actualizar el README.
7. Agregar una nota de vigencia a `PrimeraVista.md`.
8. Completar `api.md` y `testing.md`.
9. Recuperar `seguridad.md` y ubicarlo en `04-implementacion/`.
10. Crear `.gitignore` y `LICENSE`.

---

## 12. Orden recomendado de trabajo

```text
1. Corregir datos de prueba del SQL (adjuntos)
        ↓
2. Alinear mock data con SQL
        ↓
3. Actualizar README y nota de vigencia en PrimeraVista
        ↓
4. Crear .gitignore y LICENSE; recuperar seguridad.md
        ↓
5. Implementar login (auth.js + CSS propio)
        ↓
6. Implementar JavaScript del panel alumno
        ↓
7. Implementar backend PHP y endpoints
        ↓
8. Desplegar MySQL y conectar
        ↓
9. Reemplazar datos simulados por Fetch API
        ↓
10. Completar api.md con los endpoints implementados
        ↓
11. Testing integral y completar testing.md
```