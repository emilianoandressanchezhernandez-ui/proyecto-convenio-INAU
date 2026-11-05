# Control de Cambios — TheNewfutures / INAU

## Sistema de Gestión de Talleres en Convenio con INAU

<br>

## ¿Para qué sirve este documento?

Registra **qué cambió en el proyecto, por qué, quién lo detectó y qué impacto tuvo** en alcance, tiempo o costo. Como no hubo Sprint Reviews con el cliente, los cambios surgieron de las reuniones del equipo, de hallazgos técnicos y de restricciones de plazo o de equipo.

---

<br>

## Registro de cambios

| ID | Fecha | Origen | Descripción del cambio | Impacto | Decisión | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| CC-01 | 18/08/2026 (R-07) | Restricción de plazo | La primera estimación del backlog (91 puntos) supera la capacidad del equipo para el plazo: 6 sprints × 11 puntos = 66 puntos. | Alcance: se excluyen de la primera versión RF15, RF18, RF20, RF21, RF23 y RF26 (−15 puntos). El total baja a 76 puntos. | Aceptado: las seis funciones se postergan a una fase futura. | Aplicado |
| CC-02 | 02/09/2026 | Estimación del equipo | Al desglosar las épicas en historias de usuario, el esfuerzo resulta menor que el estimado por épica. | Alcance: 76 → 63 puntos (EP2 −5, EP3 −1, EP4 −5, EP5 −2). Tiempo: el total entra en la capacidad de 66 puntos, con 3 puntos de margen. | Aceptado: se planifica con 63 puntos, por ser la estimación más detallada. | Aplicado |
| CC-03 | 09/09/2026 (R-09) | Hallazgo técnico | Al contrastar el modelo de clases con la base de datos aparecen tres contradicciones: no existía el rol alumno, no había estructura para los archivos adjuntos y un taller admitía un único tallerista. | Diseño: se incorporan el rol alumno, la clase `Adjunto` y la clase asociativa `AsignacionTallerista`. Sin impacto en puntos. | Aceptado: se corrigen el modelo y el esquema de la base de datos. | Aplicado |
| CC-04 | 09/10/2026 | Restricción externa | El cliente no participa en las Sprint Reviews, aunque al aprobar el proyecto había pedido hacerlo. | Alcance: queda fijado desde la entrevista inicial, sin validación del cliente entre sprints. | Aceptado: se continúa con el alcance relevado y se deja constancia en la declaración sobre las instancias de Sprint Review. | Aplicado |
| CC-05 | 11/09/2026 | Decisión técnica del equipo | El entorno de ejecución pasa de un servidor local (XAMPP) a contenedores Docker. | Herramientas: todo el equipo trabaja con el mismo entorno, preparado para trasladarse a un servidor. Costo: sin cambios, Docker es gratuito. | Aceptado. | Aplicado |
| CC-06 | 22/09/2026 (detectado) – 21/10/2026 (aplicado) | Hallazgo técnico | El acceso al sistema estaba planteado por cédula, pero la API autentica por correo electrónico. | Diseño: se unifica el inicio de sesión por correo y contraseña; se ajusta la Identidad Visual. Sin impacto en puntos. | Aceptado: acceso por correo electrónico, dato único por usuario. | Aplicado |
| CC-07 | 20/10/2026 | Hallazgo en la implementación | Se necesita que el alumno pueda acompañar su entrega con una aclaración para el tallerista. | Diseño: se agrega el atributo opcional `comentarioAlumno` al modelo y la columna `comentario_alumno` al SQL. Complementa RF08, sin puntos nuevos. | Aceptado. | Aplicado |
| CC-08 | 22/09/2026 (detectado) – 20/10/2026 (aplicado) | Hallazgo técnico | Convivían dos esquemas SQL divergentes y la API estaba escrita contra el que no correspondía. | Técnico: se unifica el esquema y la API pasa a trabajar contra el definitivo. | Aceptado. | Aplicado |
| CC-09 | 22/10/2026 | Pedido del docente | Se elimina el documento de reconstrucción del entorno en Docker Desktop. | Documentación: los comandos básicos de puesta en marcha pasan al documento de Infraestructura Docker. | Aceptado. | Aplicado |
| CC-10 | 23/10/2026 | Hallazgo técnico | RF13 (exportación de informes a PDF o Excel) no está terminado: la descarga actual genera un archivo JSON. | Tiempo: el Sprint 5 pasa de "Completado" a "En proceso" y, al cierre, a "Completado parcialmente". Alcance: RF13 queda fuera de la primera versión (ver CC-15). | Aceptado: se completa antes del cierre del proyecto. **Actualización (04/11/2026):** completarlo requiere cambios en el código y el equipo decide postergarlo (CC-15). | Postergado |
| CC-11 | 23/10/2026 | Hallazgo técnico | RF24 (consulta de datos sensibles por parte del administrador) no está implementado. | Tiempo: el Sprint 6 pasa de "Completado" a "En proceso" y, al cierre, vuelve a "Completado". Alcance: RF24 se mantiene dentro de la primera versión. | Aceptado: se completa antes del cierre del proyecto. **Actualización (04/11/2026):** RF24 se cumple con los detalles de alumnos y talleristas del panel del administrador (CC-16). | Aplicado |
| CC-12 | 22/10/2026 | Hallazgo técnico | NRF11 admite PDF, imágenes JPG y documentos de oficina (DOCX, XLSX, PPTX), pero la API acepta únicamente PDF y JPG. | Alcance: hay que ampliar los formatos que acepta la API o restringir el requisito. | Aceptado: se restringen los formatos de la primera versión a PDF y JPG. En la entrevista no se fijaron formatos, y los documentos de oficina quedan para una fase futura junto con el soporte multiformato. | Aplicado |
| CC-13 | 23/10/2026 | Decisión técnica del equipo | Se elimina la carpeta independiente `backend/DataBase/`, que conservaba una copia sin uso del script de la base de datos. | Técnico: queda un único script, en `backend/api-completa/DataBase/inau_talleres.sql`, que es el que carga el entorno Docker; se evita que las dos copias vuelvan a divergir. Documentación: se actualizaron el README y la Estructura del Repositorio; la Revisión de Coherencia se actualiza al final. | Aceptado. | Aplicado |
| CC-14 | 04/11/2026 | Decisión técnica del equipo | Se posterga RF13 (exportación de informes a PDF o Excel) para no entregar una función mal integrada. | Alcance: RF13 sale de la primera versión; los informes se siguen descargando en JSON. Tiempo: el Sprint 5 queda "Completado parcialmente". Diseño: `exportarInforme()`, `exportarPDF()` y `exportarExcel()` pasan a figurar como (v2) en el modelo. | Aceptado: RF13 se traslada a una fase futura (`Testing-06.md`, sección 2.9). | Postergado |
| CC-15 | 04/11/2026 | Hallazgo en la revisión | RF19, RF22 y RF24 ya están cubiertos por los paneles Alumnos y Talleristas del administrador. | Alcance: sin cambios; los tres requerimientos se dan por cumplidos (DEF-03 y DEF-04 cerrados). Implementación: el detalle del alumno incorpora la dirección, el referente adulto y el centro de referencia. Tiempo: el Sprint 6 pasa a "Completado". | Aceptado: se cumplen con los paneles existentes (`Testing-06.md`, CP-25 a CP-28). | Aplicado |
| CC-16 | 04/11/2026 | Hallazgo en la revisión | RF23 (visualización de notas), excluido en CC-01, ya está implementado. | Alcance: RF23 pasa a formar parte de la primera versión. Diseño: `visualizarNotas()` deja de figurar como (v2) en el modelo. | Aceptado: se incluye en la primera versión (`Testing-06.md`, CP-02 y CP-06). | Aplicado |


**Estados:** *Propuesto*, cambio identificado y pendiente de decisión; *Aceptado*, aprobado por el equipo; *Aplicado*, ya incorporado al proyecto; *Postergado*, trasladado a una fase futura; *Rechazado*, descartado; *Incompleto*, aceptado pero todavía no terminado.

---

<br>

> **Nota:** todo cambio con impacto en alcance, tiempo o costo debe quedar registrado aquí, aunque el equipo lo haya resuelto verbalmente en una reunión. Esto evita discusiones futuras sobre qué se acordó y por qué, y es evidencia concreta del trabajo de gestión del proyecto para la defensa final. Los cambios que surjan de la próxima entrevista con el cliente se agregarán a este registro.