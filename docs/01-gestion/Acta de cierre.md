# Documento de Cierre de Proyecto (Acta de Cierre)

<br>

## Sistema de Gestión de Talleres en Convenio con INAU — TheNewfutures

**Proyecto:** TheNewfutures – Plataforma de gestión de talleres en convenio con INAU  
**Cliente o patrocinador:** Instituto del Niño y Adolescente del Uruguay (INAU), referente del convenio  
**Responsable del proyecto:** Emiliano Sánchez, Líder / Scrum Master  
**Fecha de inicio:** 17/07/2026  
**Fecha de cierre:** 05/11/2026  
**Motivo del cierre:** objetivos de la primera versión alcanzados, con una función postergada (RF13)

---

<br>

## 1. Objetivo y resultado

**Objetivo acordado:**  
Desarrollar una plataforma web responsive que centralice la gestión de talleres, participantes, asistencias, tareas e informes, con acceso diferenciado para alumnos, talleristas y administradores (`Charter.md`).

**Resultado obtenido:**  
Se entregó una primera versión operativa, instalada en un servidor de prueba. El administrador gestiona alumnos, talleristas y talleres, hace las asignaciones, consulta los datos personales y genera informes de asistencia y de talleres. El tallerista registra y corrige la asistencia, publica material y tareas con archivos adjuntos, corrige las entregas y asigna o elimina notas. El alumno consulta el material, sus tareas, su asistencia y sus notas, y entrega sus trabajos. Los tres roles pueden modificar su perfil y su contraseña.

De los 20 requerimientos funcionales de la primera versión, 19 están cumplidos y 1 está postergado: la exportación de informes a PDF o Excel (RF13), que hoy descarga los informes en formato JSON. Además, se incorporó RF23 (el alumno visualiza sus notas), que al inicio estaba postergado (`Doc.md`, sección 23).

---

<br>

## 2. Entregables

| Entregable | Estado | Evidencia u observación |
| --- | --- | --- |
| Aplicación web con los paneles de administrador, tallerista y alumno | Entregado | Paneles responsive conectados a la API. Verificados en `Testing-01.md` a `Testing-06.md`. |
| API REST en PHP | Entregado | 55 rutas, autenticación con JWT y control de acceso por rol (`api.md`). |
| Base de datos MySQL | Entregado | 13 tablas derivadas del modelo de clases (`modelo-clases-uml-mer.md`). |
| Exportación de informes a PDF o Excel (RF13) | No entregado | Postergado para no entregar una función mal integrada. Los informes se descargan en JSON (CC-14). |
| Entorno Docker y despliegue en servidor | Entregado | `inau-infraestructura-docker.md` y `Documento de Reconstruccion - Servidor.md`. Medidas de hardening aplicadas y verificadas (`Testing-06.md`, CP-19 a CP-24). |
| Código fuente | Entregado | Repositorio `proyecto-convenio-INAU` en GitHub. |
| Manual de usuario | Entregado | `Manual_de_Usuario.md`, escrito para usuarios no técnicos. |
| Documentación de análisis, diseño y gestión | Entregada | Carpetas `01-gestion`, `02-analisis` y `03-diseño` del repositorio. |
| Registros de prueba | Entregados | Seis rondas, del 24/10/2026 al 04/11/2026. La última aprobó sus 38 casos. |
| Capacitación de los usuarios | No realizada | El cliente no se presentó. Se entrega el Manual_de_Usuario.md como guía de uso. |

---

<br>

## 3. Balance del proyecto

| Aspecto | Planificado | Resultado final | Observación |
| --- | --- | --- | --- |
| Alcance | 20 requerimientos funcionales en la primera versión; 6 postergados por plazo (CC-01) | 19 cumplidos y 1 postergado (RF13); RF23 se incorporó | RF19, RF22 y RF24 se cumplen con los paneles del administrador (CC-15). Los demás cambios figuran en `Control_de_Cambios.md`. |
| Plazo | 12 semanas, 6 sprints quincenales, desde el 17/07/2026 | 6 sprints ejecutados; las pruebas y correcciones finales terminaron el 04/11/2026 | Tres sprints quedaron completados parcialmente; sus pendientes se resolvieron al cierre, salvo RF13. La versión quedó disponible antes del plazo esperado por el cliente (fines de noviembre de 2026). |
| Esfuerzo o costo | 63 puntos; USD 2.667 el primer año (216 h a USD 12/h, más hosting y dominio) | 63 puntos planificados en los 6 sprints | RF23 se incorporó sin puntos, porque ya estaba implementado (CC-16). No se registraron las horas reales, por lo que no puede compararse el costo final con el estimado. |
| Calidad | Gestionar talleres, alumnos y asistencias de forma organizada, segura y accesible (criterio de éxito del `Charter.md`) | 38 de 38 casos aprobados en la última ronda; hallazgos de seguridad H-01 a H-05 corregidos | Queda abierto un defecto visual de severidad baja (DEF-17). Pruebas manuales, sin pruebas automatizadas. |

---

<br>

## 4. Pendientes y continuidad

| Pendiente, defecto o mejora | Prioridad | Responsable o destino | Decisión |
| --- | --- | --- | --- |
| Exportación de informes a PDF o Excel (RF13) | Alta | Fase futura | Postergar (CC-14). |
| HTTPS en el servidor | Alta | Antes de un uso con datos reales | Aplicar la configuración documentada en `Documento de Reconstruccion - Servidor.md`. |
| Protección contra CSRF | Media | Fase futura | Agregar tokens anti-CSRF o verificación del origen (`api.md`, sección 7). |
| Funciones postergadas por plazo (RF15, RF18, RF20, RF21 y RF26) | Media | Fase futura | Postergar (CC-01). RF26 ya existe en la API, sin pantalla. |
| Términos y Condiciones y Política de Privacidad | Media | Equipo | Integrar en la rama de trabajo, crear la tabla en el servidor y probar con los tres roles. |
| Dirección IP fija para el servidor | Media | Responsable del servidor | Fijarla, porque hoy la asigna el router. |
| Encabezados de las tablas del administrador ilegibles (DEF-17) | Baja | Mantenimiento | Corregir la regla `.table thead th` en `frontend-admin/css/styles.css`. |
| Horas mostradas en UTC | Baja | Mantenimiento | Mostrarlas en hora de Uruguay. |
| Tallerista "Sin asignar" en un taller finalizado | Baja | Mantenimiento | Revisar. |
| Archivo faltante del adjunto de ejemplo (DEF-08) | Baja | Equipo | Dato de prueba, no error del código: limpiar los datos de prueba. |
| Datos de prueba del servidor | Baja | Equipo | Restaurar la contraseña de Carlos y depurar los registros de prueba. |
| Alcance excluido: foros, notificaciones, mensajería interna, soporte multiformato y asistencia avanzada | — | Futuro proyecto | Fuera de la primera versión (`Charter.md`). |

---

<br>

## 5. Lecciones aprendidas

- **Funcionó bien:** dividir las épicas en historias de usuario permitió ajustar la estimación de 91 a 63 puntos y planificar sprints que entraban en la capacidad del equipo. Las rondas de prueba con un registro numerado de defectos permitieron seguir cada corrección hasta su verificación.
- **Debe mejorarse:** el cliente no participó en las Sprint Reviews, por lo que el alcance no pudo validarse durante el desarrollo y todo dependió de la entrevista inicial (CC-04). Además, el retiro de dos integrantes que no cumplían sus tareas debió decidirse antes (`Doc.md`, sección 24).
- **Recomendación futura:** acordar con el cliente las fechas de revisión desde la aprobación del proyecto, y probar el despliegue en el servidor desde los primeros sprints y no solo al final.

---

<br>

## 6. Declaración de aceptación

El equipo declara que entregó los entregables indicados y da por cerrada la primera versión del proyecto, con las observaciones y pendientes registrados en esta acta. La exportación de informes a PDF o Excel, las funciones postergadas por plazo y el alcance excluido quedan fuera de este proyecto. Cualquier trabajo posterior se gestionará como mantenimiento, soporte o un nuevo proyecto.

| Rol | Nombre | Conformidad | Fecha |
| --- | --- | --- | --- |
| Responsable del proyecto / Scrum Master | Emiliano Sánchez | Emiliano Sánchez | 05/11/2026 |
| Subcoordinador | Gabriel Rendon | Gabriel Rendon | 05/11/2026 |
| Desarrollador frontend y backend | Thiago Ferragut | Thiago Ferragut | 05/11/2026 |

<br>

> **Nota:** el cliente no participó en el proyecto después de la entrevista inicial de relevamiento y no se presentó a la instancia de cierre, por lo que esta acta no cuenta con su conformidad. Los entregables, las observaciones y los pendientes quedan registrados en este documento para su revisión y aceptación cuando el cliente lo disponga (ver *Declaración sobre las instancias de Sprint Review* y Control de Cambios, CC-04).