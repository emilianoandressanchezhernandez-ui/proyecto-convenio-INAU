# Proyecto Sistema de Gestión de Talleres en Convenio con INAU - TheNewfutures.

<br>

## 1. Situación inicial del cliente.

**Organismo:** INAU (Instituto del Niño y Adolescente del Uruguay), a través de talleres socioeducativos en convenio.

**Cliente / patrocinador:** En convenio con INAU.\
**Usuario experto consultado:** Lemuel Szwec González, tallerista.\
**Rubro:** Actividades socioeducativas: talleres dictados en convenio, con alumnos, talleristas y administración.\
**Tamaño:** [completar: cantidad de centros o talleres en funcionamiento]\
**Cantidad aproximada de usuarios:** [Pendiente_Consultar]\
**Servicio:** Talleres en los que el tallerista publica material y tareas, registra la asistencia y evalúa las entregas, y la administración supervisa la actividad de todos los talleres.\
**Nivel tecnológico actual:** [Pendiente_Consultar]\
**Registro actual:** La información de talleres, participantes y asistencias no está centralizada: el cliente señala falta de organización y accesibilidad en la plataforma que usa actualmente. [completar: qué se usa hoy, por ejemplo planillas, papel, mensajería o una plataforma general]\
**Necesidad:** Un espacio unificado, accesible desde computadora, tablet o teléfono, con funciones específicas para alumnos, talleristas y administradores, similar a la plataforma CREA.\
**Plazo esperado:** Primera versión funcionando para fines de año.

---

<br>

## 2. Necesidad presentada por el cliente.

>El problema principal a resolver es la falta de organización y accesibilidad en la plataforma actual. Se requiere un espacio unificado donde estudiantes, talleristas y administradores dispongan de funciones específicas que permitan optimizar, asegurar y promover la accesibilidad, disponibilidad y estructuración de la información.
>
>-Se busca implementar una plataforma integral con las facultades mencionadas, mediante la cual:
>
>-Los alumnos puedan acceder a sus talleres, tareas, información académica y foros de discusión.
>
>-Los talleristas puedan publicar material didáctico e información, evaluar entregas y llevar el control de asistencias.
>
>-Los administradores cuenten con la capacidad de supervisar y gestionar de manera global la actividad dentro del sistema.
>

---

<br>

## 3. Primer análisis del equipo de desarrollo.

| Área a aclarar | Preguntas iniciales del equipo |
| --- | --- |
| Roles y usuarios | ¿Qué roles existen dentro de la plataforma? ¿Qué puede ver, cargar, modificar y eliminar cada uno? |
| Talleres | ¿Cómo se organiza un taller? ¿Un tallerista puede tener varios talleres o un taller varios talleristas? |
| Participantes | ¿Cómo se identifica a cada alumno dentro del sistema? ¿Se inscriben a un taller o a varios? |
| Asistencia | ¿Cómo se registra actualmente la asistencia? ¿Por clase, por día, por taller? |
| Material y tareas | ¿Qué tipo de contenido suben los talleristas (documentos, imágenes, videos)? ¿Cómo entregan los alumnos sus tareas? |
| Foros | ¿Qué se espera que contenga un foro? ¿Es por taller, general, o incluye a las familias? |
| Usuarios técnicos | ¿Quiénes van a usar el sistema en el día a día: solo talleristas y administración, o también otro personal? |
| Infraestructura | ¿Desde qué dispositivos se accederá (celular, tablet, computadora)? ¿Hay conectividad estable en los lugares donde se dictan los talleres? |
| Seguridad y datos | ¿Qué datos personales de alumnos y talleristas se manejan? ¿Cuáles se consideran sensibles? |
| Plazo | ¿Cuándo necesitan tener una primera versión funcionando? |

<br>

## 4. Participantes de la entrevista

| Rol | Participante | Responsabilidad |
| --- | --- | --- |
| Usuario experto | Lemuel Szwec González, tallerista | Explica el proceso operativo actual y las necesidades del rol tallerista dentro de la plataforma. |
| Equipo de desarrollo | Emiliano Sánchez, líder de equipo | Relevar necesidades y transformar la información en backlog. |

<br>

## 5. Entrevista al cliente (reconstrucción)

> **Nota:** esta es una **reconstrucción aproximada** de la entrevista, armada a partir de las notas tomadas durante la reunión. **No es una transcripción literal:** reordena en forma de diálogo lo que quedó registrado. Donde la entrevista no definió algo, así se deja constancia; no se agrega información que no se haya relevado. Participan **Emiliano Sánchez** (entrevistador) y **Lemuel Szwec González** (tallerista, experto consultado).

### Roles y usuarios

**Entrevistador:** ¿Qué roles van a existir dentro de la plataforma, y qué puede hacer cada uno?

**Lemuel:** Son tres: alumno, tallerista y administrador. El **alumno** ve el material, las tareas y la información de sus talleres, sus notas y sus datos personales; puede enviar entregas, cambiar su contraseña y editar algo de su perfil (foto, biografía), pero no modificar una entrega ya enviada. El **tallerista** ve solo lo de su taller —material, tareas, lista de alumnos, asistencias y ciertos datos del estudiante—: publica material, asigna y corrige tareas, pone notas, registra asistencia y manda informes a la administración, y puede ajustar o borrar material, calificaciones y asistencias de su taller. El **administrador** ve y gestiona todo, con una excepción: no modifica directamente datos personales como la cédula.

### Talleres

**Entrevistador:** ¿Cómo se organiza un taller? ¿Un tallerista puede tener varios talleres, o un taller varios talleristas?

**Lemuel:** Cada taller tiene su material, sus tareas, su lista de alumnos y su asistencia, y el tallerista trabaja solo sobre el suyo. La relación exacta entre talleristas y talleres no la cerramos en la reunión; queda para definir con el equipo.

### Participantes

**Entrevistador:** ¿Cómo se identifica a cada alumno? ¿Se inscribe a un taller o a varios?

**Lemuel:** El alumno accede a "sus talleres", en plural, así que la idea es que pueda estar en más de uno. La forma exacta de identificarlo dentro del sistema no la detallamos.

### Asistencia

**Entrevistador:** ¿Cómo se registra la asistencia? ¿Por clase, por día, por taller?

**Lemuel:** El tallerista pasa lista en su taller, indicando la fecha, y después puede consultar o corregir lo cargado. Lo básico es registrar quién asistió en cada jornada. Un control más fino, con historial y métricas, sería deseable pero para más adelante, no para la primera versión.

### Material y tareas

**Entrevistador:** ¿Qué tipo de contenido suben los talleristas? ¿Cómo entregan los alumnos?

**Lemuel:** El tallerista sube material y asigna tareas; al principio no fijamos restricciones finas de formato o tamaño. El alumno entra, ve lo que hay y sube el archivo de su entrega. Soportar varios formatos —PDF, imágenes, video— estaría bueno, pero no es imprescindible en el arranque.

### Foros

**Entrevistador:** ¿Qué esperan de un foro? ¿Por taller, general, o incluye a las familias?

**Lemuel:** Lo pensamos por taller: un espacio con imágenes y novedades que puedan ver los usuarios y también sus familias. De todos modos, lo tenemos como funcionalidad deseable para una etapa futura.

### Usuarios técnicos

**Entrevistador:** ¿Quiénes van a usar el sistema en el día a día?

**Lemuel:** Los tres roles: administradores, talleristas y alumnos. Si hubiera otro personal, no lo definimos en la reunión.

### Infraestructura

**Entrevistador:** ¿Desde qué dispositivos se va a acceder? ¿Hay conectividad estable donde se dictan los talleres?

**Lemuel:** Lo importante es que se pueda usar desde cualquier dispositivo —computadora, tablet o teléfono—, adaptándose a la pantalla. Los detalles de infraestructura y de conectividad no los relevamos en esta entrevista.

### Seguridad y datos

**Entrevistador:** ¿Qué datos personales se manejan? ¿Cuáles consideran sensibles?

**Lemuel:** Datos de las cuentas —usuarios y contraseñas—, datos de contacto de los talleristas e información personal de cada usuario, incluida la cédula. Son sensibles y hay que protegerlos: acceso por rol, y el administrador debe poder consultar qué datos sensibles se usan. No fijamos un nivel de seguridad específico, pero la protección de datos es obligatoria.

### Plazo y criterio de aceptación

**Entrevistador:** ¿Cuándo necesitan una primera versión? ¿Cuándo la darían por buena?

**Lemuel:** Para finales de año. La damos por válida cuando funcione en la operativa del día a día y cumpla con lo pedido.

### Visión general

**Entrevistador:** En una frase, ¿a qué les gustaría que se pareciera?

**Lemuel:** A algo tipo la plataforma Crea: que el alumno entre a sus talleres y tareas; que el tallerista publique material, evalúe, lleve asistencia y se comunique; y que la administración tenga visión completa de todo. Hoy el proceso falla justo en eso: en que la información esté accesible, disponible y ordenada en un solo lugar.

> **Temas que quedaron sin definir en la entrevista** (registrados como pendientes): la metodología con la que se trabaja hoy, la relación exacta tallerista–taller, la forma de identificar al alumno, la infraestructura y conectividad, el riesgo operativo, las reglas de negocio y las restricciones legales.

---

<br>

## 6. Información obtenida en la entrevista

| Categoría | Información relevada |
| ---| --- |
| Problema principal | Falta de una plataforma digital que otorgue acceso a alumnos, talleristas y administradores, dificultando la accesibilidad, disponibilidad y organización de los talleres. |
| Objetivo de negocio | Alcanzar una plataforma con las funciones mencionadas, mejorando el control, accesibilidad y organización, para alumnos, talleristas y administradores. |
| Alcance inicial | Que los talleristas puedan subir material y tareas, pasar asistencia; que los alumnos puedan ver y enviar lo que hicieron; y que el administrador tenga acceso a ver todo lo que sucede. |
| Plazo esperado | Finales de año. |
| Usuarios | Administradores, Talleristas, Alumnos. |
| Infraestructura | No se especificó. |
| Seguridad | Acceso por roles, protección de datos sensibles de los usuarios. |
| Riesgo operativo | No se especificó. |
| Restricción técnica | No se especificó. |


<br>

## 7. Nombre propuesto del producto

**TheNewfutures - Convenio con INAU**

**Sistema de Gestión de Talleres en Convenio con INAU**

---

<br>

## 8. Visión del producto

**Desarrollar una solución web con diseño adaptativo (responsive) que centralice la gestión operativa de los talleres ejecutados en convenio con el INAU.**

**El sistema otorgará a administradores y talleristas las capacidades necesarias para la administración integral de talleres, participantes, controles de asistencia, generación de informes y comunicación interna. Asimismo, proporcionará a los alumnos acceso directo a sus talleres, tareas, información académica y foros de consulta, garantizando un entorno organizado, seguro y accesible desde diversos dispositivos.**

**Estas capacidades se incorporarán de forma incremental: la primera versión del sistema comprende las funcionalidades definidas en el alcance inicial (autenticación, gestión de usuarios y talleres, asistencia, material y tareas, informes y perfiles), mientras que la comunicación interna y los foros de consulta se desarrollarán en etapas posteriores.**

---

<br>


## 9. Alcance incluido (primera versión):

1. Sistema de autenticación con acceso diferenciado para administradores, alumnos y talleristas.
2. Gestión de usuarios, talleristas, alumnos y talleres.
3. Asignación de alumnos y talleristas a los talleres.
4. Registro, consulta y modificación de asistencias por taller y fecha.
5. Carga y modificación de material y tareas por parte del tallerista (sin especificar tipos de archivo extra, imágenes o datos adicionales).
6. Visualización de material y tareas por parte del alumno, y envío/carga de los archivos correspondientes a la tarea asignada.
7. Eliminación de material, calificaciones y registros de asistencia del taller por parte del tallerista.
8. Corrección de tareas y asignación de notas por parte del tallerista.
9. Consulta y generación de informes de asistencia y talleres.
10. Generación de listados e informes de alumnos y talleristas, incluyendo el histórico de calificaciones.
11. Exportación de informes en formatos PDF y Excel.
12. Gestión de perfiles de usuario según el rol.
13. Plataforma web responsive accesible desde distintos dispositivos.
14. Visualización de las notas asignadas al alumno.
15. Consulta de datos sensibles utilizados en la plataforma por parte del administrador.
16. Consulta del listado de alumnos inscritos en el taller por parte del tallerista.

>Nota: este alcance corresponde a la definición inicial, previa al ajuste por plazo.
>Seis funciones fueron postergadas posteriormente; ver la sección 14, Paso 2.

---

<br>

## 10. Alcance excluido (queda para etapas futuras):

1. Foros de comunicación y publicación de contenido para talleres.
2. Compatibilidad para la subida de archivos tipo PNG y MP4 (más allá del tipo básico soportado en v1).
3. Control detallado e historial de asistencia con métricas semanales, mensuales, anuales, etc.
4. Listado e historial ampliado de tareas entregadas (más allá del envío/corrección básica ya incluida en v1).
5. Sistema de notificaciones automáticas ante eventos relevantes (correcciones de tareas, faltas de asistencia, nuevas entregas).
6. Mensajería interna entre administradores y talleristas (No en tiempo real).
7. Comunicación asincrónica del tallerista con los alumnos de su taller.

---

<br>

## 11. Requerimientos funcionales:


|Código | Requerimiento funcional |
|---|---|
| **RF01** | El sistema debe permitir iniciar sesión con usuario y contraseña, diferenciando el acceso según el rol (alumno, tallerista, administrador). |
| **RF02** | El sistema debe permitir al administrador gestionar usuarios (alumnos y talleristas) y talleres: crear, modificar, eliminar y consultar. |
| **RF03** | El sistema debe permitir al administrador asignar alumnos y talleristas a los talleres correspondientes. |
| **RF04** | El sistema debe permitir al tallerista registrar la asistencia de los alumnos de su taller, indicando fecha. |
| **RF05** | El sistema debe permitir consultar y modificar la asistencia registrada por taller y fecha. |
| **RF06** | El sistema debe permitir al tallerista subir material y tareas asociados a su taller. |
| **RF07** | El sistema debe permitir al alumno visualizar el material y las tareas de su taller. |
| **RF08** | El sistema debe permitir al alumno enviar/subir los archivos correspondientes a una tarea asignada. |
| **RF09** | El sistema debe permitir al tallerista corregir las tareas enviadas por los alumnos. |
| **RF10** | El sistema debe permitir al tallerista asignar una nota a cada alumno por tarea. |
| **RF11** | El sistema debe permitir generar informes de asistencia por taller. |
| **RF12** | El sistema debe permitir generar informes de talleres con sus talleristas asignados. |
| **RF13** | El sistema debe permitir exportar los informes generados en formato PDF o Excel. |
| **RF14** | El sistema debe permitir a cada usuario gestionar su perfil según su rol (modificar contraseña y datos personales). |
| **RF15** | El sistema debe permitir al alumno eliminar ciertos datos de su perfil (foto, biografía). |
| **RF16** | El sistema debe permitir al tallerista eliminar material de su taller. |
| **RF17** | El sistema debe permitir al tallerista eliminar la nota asignada a un alumno. |
| **RF18** | El sistema debe permitir al tallerista eliminar un registro de asistencia de su taller. |
| **RF19** | El sistema debe permitir generar un listado de alumnos. |
| **RF20** | El sistema debe permitir generar un informe del histórico de calificaciones de los alumnos. |
| **RF21** | El sistema debe permitir generar un informe con información detallada de los alumnos. |
| **RF22** | El sistema debe permitir generar un informe con información detallada de los talleristas. |
| **RF23** | El sistema debe permitir al alumno visualizar las notas asignadas por el tallerista. |
| **RF24** | El sistema debe permitir al administrador consultar los datos sensibles utilizados en la plataforma. |
| **RF25** | El sistema debe permitir al tallerista consultar el listado de alumnos inscritos en su taller. |
| **RF26** | El sistema debe permitir al tallerista modificar el material o las tareas ya subidas a su taller. |


<br>


## 12. Requerimientos no funcionales:

|Código | Requerimiento no funcional |
|---|---|
| **NRF01** | El sistema debe presentar un diseño responsive, adaptándose a computadora, tablet y teléfono. |
| **NRF02** | El sistema debe estar disponible las 24 horas del día una vez desplegado. |
| **NRF03** | El sistema debe responder con rapidez en las operaciones habituales. |
| **NRF04** | El sistema debe presentar una navegación clara y consistente para el usuario. |
| **NRF05** | El sistema debe validar los formularios tanto en el frontend como en el backend. |
| **NRF06** | El sistema debe mantener una arquitectura separada entre frontend y backend. |
| **NRF07** | El sistema debe controlar el acceso a las funcionalidades según el rol del usuario. |
| **NRF08** | El sistema debe proteger los datos personales de los usuarios. |
| **NRF09** | El sistema debe garantizar la persistencia confiable de los datos en una base de datos relacional. |
| **NRF10** | El sistema debe registrar la trazabilidad de las acciones importantes realizadas por los usuarios. |
| **NRF11** | El sistema debe restringir los formatos de archivos adjuntos a PDF e imágenes JPG, acorde a los tipos soportados en v1. |
| **NRF12** | El sistema debe restringir el tamaño de los archivos adjuntos permitidos. |
| **NRF13** | El código del sistema debe estar organizado, ser reutilizable y mantenible. |
| **NRF14** | El sistema debe contar con documentación técnica dentro del repositorio. |
| **NRF15** | El equipo debe utilizar Git para registrar y revisar los cambios del código. |
| **NRF16** | Todo cambio en el repositorio debe integrarse mediante Pull Request, con revisión previa de al menos otro integrante del equipo. |



<br>

## 13. Épicas

> Una **épica** es un grupo grande de funciones relacionadas. Para organizar el trabajo, todo el sistema se dividió en 6 épicas.

| Código | Épica | Descripción |
| --- | --- | ---|
| EP1 | Autenticación y control de acceso | Permitir el ingreso seguro y diferenciado a la plataforma según el rol del usuario. |
| EP2 | Gestión de usuarios y talleres | Administrar los usuarios (alumnos, talleristas) y su relación con los talleres, incluyendo la consulta de datos sensibles y del listado de alumnos por taller. |
| EP3 | Gestión de asistencia | Registrar, controlar y eliminar la asistencia de los alumnos a los talleres. |
| EP4 | Gestión de material y tareas | Permitir la carga, modificación, entrega, corrección, eliminación y visualización de material, tareas y notas de cada taller. |
| EP5 | Reportes e informes | Generar y exportar información consolidada de asistencia, talleres, alumnos y talleristas, incluyendo el histórico de calificaciones. |
| EP6 | Gestión de perfil de usuario | Permitir a cada usuario administrar su propia información personal. |

<br>

## 14. Esfuerzo estimado y cómo se ajustó

> **¿Qué es un "punto"?** Es una medida de esfuerzo relativo —qué tan grande o difícil es una función comparada con otra—, **no una cantidad de horas**. Sirve para planificar cuánto trabajo entra en cada quincena.

El esfuerzo total se estimó al inicio y se corrigió **dos veces** a medida que el plan se afinaba. El recorrido fue **91 → 76 → 63 puntos**, en tres pasos:

### Paso 1 — Primera estimación: 91 puntos

Se le asignó un valor a cada épica como bloque completo, "a ojo", antes de conocer su detalle interno. Con las 26 funciones originales, el total daba 91 puntos.

| Épica | Puntos |
| --- | ---: |
| EP1 — Autenticación y control de acceso | 8 |
| EP2 — Gestión de usuarios y talleres | 18 |
| EP3 — Gestión de asistencia | 10 |
| EP4 — Gestión de material y tareas | 30 |
| EP5 — Reportes e informes | 22 |
| EP6 — Gestión de perfil de usuario | 3 |
| **Total** | **91** |

### Paso 2 — Se recortan 6 funciones para entrar en el plazo: quedan 76 puntos

Para respetar las 12 semanas, 6 funciones se dejaron para más adelante. Estas son:

| Función excluida | Épica |
| --- | --- |
| Eliminación de datos de perfil del alumno (foto, biografía) | EP6 |
| Eliminación de un registro de asistencia | EP3 |
| Informe con histórico de calificaciones | EP5 |
| Informe con información detallada de alumnos | EP5 |
| Visualización de notas por parte del alumno | EP4 |
| Modificación de material o tareas ya subidas | EP4 |

En conjunto, esas 6 funciones representaban **15 puntos** (EP3 −3, EP4 −6, EP5 −5, EP6 −1). Al quitarlas, el total baja de 91 a **76 puntos**, repartidos entre 20 funciones.

### Paso 3 — Se desglosa en historias de usuario y se recalcula: 63 puntos

Al partir cada épica en historias de usuario concretas (ver sección 19), varias resultaron más chicas de lo estimado "a ojo". El total afinado baja a **63 puntos**. La diferencia se concentra en EP2 y EP4, que eran las más grandes y, por lo tanto, las más inciertas al inicio:

| Épica | Estimado a ojo (paso 2) | Sumando sus historias (paso 3) | Diferencia |
|---|---:|---:|---:|
| EP1 — Autenticación y control de acceso | 8 | 8 | — |
| EP2 — Gestión de usuarios y talleres | 18 | 13 | −5 |
| EP3 — Gestión de asistencia | 7 | 6 | −1 |
| EP4 — Gestión de material y tareas | 24 | 19 | −5 |
| EP5 — Reportes e informes | 17 | 15 | −2 |
| EP6 — Gestión de perfil de usuario | 2 | 2 | — |
| **Total** | **76** | **63** | **−13** |

> **Nota:** la fila de EP3 pasa de 10 (paso 1) a 7 (paso 2) al quitarse su función excluida; lo mismo ocurre con EP4, EP5 y EP6. Por eso el paso 3 parte de 76 y no de 91.

### Qué número se usa para planificar

Se planifica con los **63 puntos**, por ser la estimación más detallada. Además es la única que entra en el cronograma: 6 quincenas × 11 puntos de capacidad = **66 puntos máximos**. Los 63 entran en ese margen; los 76 lo excederían y harían inviable el plazo.


<br>


## 15. Propuesta presentada al cliente

| Elemento | Propuesta |
| --- | --- |
| Producto | TheNewfutures – Plataforma de gestión de talleres en convenio con INAU |
| Duración | 12 semanas (6 sprints de 2 semanas cada uno). |
| Metodología | Scrum, con 6 sprints de 2 semanas. |
| Entregas | Incremento funcional al final de cada sprint. |
| Forma de trabajo | Equipo de 3 integrantes (Emiliano Sánchez — Líder/Scrum Master, Gabriel Rendon — Subcoordinador, Thiago Ferragut), con reuniones periódicas de seguimiento y reparto de tareas por sprint. |
| Primera versión | Autenticación por rol, gestión de usuarios y talleres (incluyendo consulta de datos sensibles y del listado de alumnos por taller), registro y consulta de asistencia, carga/entrega/corrección/eliminación de material y tareas, reportes de asistencia/talleres/alumnos/talleristas, gestión de perfil. |
| Exclusiones | Foros, soporte multiformato (PNG/MP4), asistencia detallada por métricas, listado e historial ampliado de tareas entregadas, notificaciones automáticas, mensajería administrador-tallerista, eliminación de asistencia, modificación de material ya subido, visualización de notas por el alumno, histórico de calificaciones, ficha detallada de alumnos, eliminación de datos de perfil. |


<br>


## 16. Estimación de costos

> **Nota:** El costo está estimado en forma simplificada, como estimación didáctica. En un proyecto real, el presupuesto dependería de tarifas, tecnología, infraestructura, contratos, licencias, soporte y mantenimiento.

| Concepto | Detalle | Costo |
| --- | --- | --- |
| **Recursos humanos** | 3 integrantes × 6 h semanales × 12 semanas = 216 h, a USD 12/h (perfil junior) | USD 2.592 |
| **Hosting** | Plan compartido con soporte PHP y MySQL, USD 5 mensuales | USD 60 / año |
| **Dominio** | Registro anual `.uy` o `.com` | USD 15 / año |
| **Certificado SSL** | Incluido en el hosting (Let's Encrypt) | USD 0 |
| **Herramientas y licencias** | Git/GitHub, VS Code, XAMPP, Bootstrap, PHP y MySQL: todas libres o gratuitas | USD 0 |
| **Total primer año** | | **USD 2.667** |
| **Mantenimiento anual posterior** | Hosting + dominio | **USD 75 / año** |

**Costo por punto de esfuerzo:** USD 2.592 ÷ 63 puntos ≈ **USD 41,1 por punto**. Este indicador permite estimar funcionalidades futuras: una historia de 3 puntos equivale aproximadamente a USD 123, y una de 5 puntos, a USD 206.

---

## 17. Aprobación ficticia del cliente

Luego de revisar la propuesta, el cliente responde:

> "La propuesta está dentro del presupuesto máximo que habíamos previsto. Nos parece correcto empezar por una versión inicial.
>
> Lo más importante para nosotros es que los talleristas puedan registrar la asistencia y subir el material sin complicaciones, y que la administración pueda ver en todo momento qué está pasando en cada taller.
>
>Entendemos que algunas funciones, como los foros y las notificaciones automáticas, queden para más adelante.
>

Aprobamos el proyecto con 6 ciclos de trabajo de 2 semanas. Queremos participar en las revisiones al final de cada ciclo para validar que el sistema se ajuste al trabajo real de los talleres."


<br>

## 18. Formato de historia de usuario

Se utilizará el siguiente formato:

> Como **[tipo de usuario]**, quiero **[acción o necesidad]**, para **[beneficio o resultado esperado]**.

Cada historia incluirá criterios de aceptación para saber cuándo puede considerarse terminada.

---

<br>

## 19. Historias de Usuario iniciales.

| Código | Épica | RF | Historia de Usuario | Puntos | Prioridad |
| --- | --- | --- | --- | --- | --- |
| HU01 | EP1 | RF01 | Como usuario del sistema (alumno, tallerista o administrador), quiero iniciar sesión con usuario y contraseña, para acceder únicamente a las funciones que corresponden a mi rol. | 8 | Alta |
| HU02 | EP2 | RF02 | Como administrador, quiero gestionar (crear, modificar, eliminar y consultar) alumnos, talleristas y talleres, para mantener actualizada la información de la plataforma. | 5 | Alta |
| HU03 | EP2 | RF03 | Como administrador, quiero asignar alumnos y talleristas a un taller, para que cada uno acceda únicamente a la información que le corresponde. | 3 | Alta |
| HU04 | EP2 | RF24 | Como administrador, quiero consultar los datos sensibles utilizados en la plataforma, para supervisar su correcto uso y protección. | 3 | Baja |
| HU05 | EP2 | RF25 | Como tallerista, quiero consultar el listado de alumnos inscritos en mi taller, para saber quiénes lo integran. | 2 | Baja |
| HU06 | EP3 | RF04 | Como tallerista, quiero registrar la asistencia de los alumnos de mi taller en una fecha determinada, para llevar un control confiable de la participación. | 3 | Alta |
| HU07 | EP3 | RF05 | Como tallerista, quiero consultar y modificar la asistencia ya registrada, para corregir errores de carga sin duplicar el registro. | 3 | Media |
| HU08 | EP4 | RF06 | Como tallerista, quiero subir material de estudio y asignar tareas a mi taller, para que mis alumnos accedan al contenido y sepan qué deben entregar. | 3 | Alta |
| HU09 | EP4 | RF07 | Como alumno, quiero ver el material y las tareas de mi taller, para saber qué contenido tengo disponible y qué debo entregar. | 2 | Alta |
| HU10 | EP4 | RF08 | Como alumno, quiero enviar los archivos de una tarea asignada, para completar mi entrega dentro de la plataforma. | 3 | Alta |
| HU11 | EP4 | RF09 | Como tallerista, quiero corregir las tareas entregadas por mis alumnos, para dar seguimiento a su desempeño. | 5 | Media |
| HU12 | EP4 | RF10 | Como tallerista, quiero asignar una nota a cada alumno por una tarea entregada, para registrar formalmente su evaluación. | 2 | Baja |
| HU13 | EP4 | RF16 | Como tallerista, quiero eliminar material de mi taller, para retirar contenido que ya no corresponde mostrar. | 2 | Baja |
| HU14 | EP4 | RF17 | Como tallerista, quiero eliminar la nota asignada a un alumno, para corregir un registro erróneo. | 2 | Baja |
| HU15 | EP5 | RF11 | Como administrador, quiero generar un informe de asistencia por taller, para supervisar la participación sin revisar cada registro manualmente. | 3 | Media |
| HU16 | EP5 | RF12 | Como administrador, quiero generar un informe de talleres con sus talleristas asignados, para tener una visión general de la organización de la plataforma. | 3 | Media |
| HU17 | EP5 | RF13 | Como administrador, quiero exportar los informes generados en PDF o Excel, para compartirlos fuera de la plataforma. | 5 | Media |
| HU18 | EP5 | RF19 | Como administrador, quiero generar un listado de alumnos, para tener un registro consolidado de todos los inscritos. | 2 | Baja |
| HU19 | EP5 | RF22 | Como administrador, quiero generar un informe con información detallada de los talleristas, para tener un registro consolidado del personal a cargo de los talleres. | 2 | Baja |
| HU20 | EP6 | RF14 | Como usuario, quiero modificar mi contraseña y algunos datos de mi perfil, para mantener mi información actualizada. | 2 | Media |


---

<br>

## 20. Backlog priorizado

<br>

### Sprint 1 (Semanas 1-2)

| Código | RF | Historia de Usuario | Puntos | Prioridad |
| --- | --- | --- | --- | --- |
| HU01 | RF01 | Como usuario del sistema, quiero iniciar sesión con usuario y contraseña, para acceder únicamente a las funciones de mi rol. | 8 | Alta |
| HU03 | RF03 | Como administrador, quiero asignar alumnos y talleristas a un taller, para que cada uno acceda a lo que le corresponde. | 3 | Alta |

**Subtotal: 11 puntos**


### Sprint 2 (Semanas 3-4)

| Código | RF | Historia de Usuario | Puntos | Prioridad |
| --- | --- | --- | --- | --- |
| HU02 | RF02 | Como administrador, quiero gestionar alumnos, talleristas y talleres, para mantener actualizada la información de la plataforma. | 5 | Alta |
| HU06 | RF04 | Como tallerista, quiero registrar la asistencia de mis alumnos, para llevar un control confiable de la participación. | 3 | Alta |
| HU07 | RF05 | Como tallerista, quiero consultar y modificar la asistencia registrada, para corregir errores sin duplicar. | 3 | Media |

**Subtotal: 11 puntos**


### Sprint 3 (Semanas 5-6)

| Código | RF | Historia de Usuario | Puntos | Prioridad |
| --- | --- | --- | --- | --- |
| HU08 | RF06 | Como tallerista, quiero subir material y tareas a mi taller, para que mis alumnos sepan qué deben entregar. | 3 | Alta |
| HU09 | RF07 | Como alumno, quiero ver el material y las tareas de mi taller, para saber qué debo entregar. | 2 | Alta |
| HU10 | RF08 | Como alumno, quiero enviar los archivos de una tarea, para completar mi entrega. | 3 | Alta |
| HU20 | RF14 | Como usuario, quiero modificar mi contraseña y datos de perfil, para mantenerlos actualizados. | 2 | Media |

**Subtotal: 10 puntos**



### Sprint 4 (Semanas 7-8)

| Código | RF | Historia de Usuario | Puntos | Prioridad |
| --- | --- | --- | --- | --- |
| HU11 | RF09 | Como tallerista, quiero corregir las tareas entregadas, para dar seguimiento al desempeño. | 5 | Media |
| HU12 | RF10 | Como tallerista, quiero asignar una nota por tarea, para registrar la evaluación. | 2 | Baja |
| HU13 | RF16 | Como tallerista, quiero eliminar material de mi taller, para retirar contenido obsoleto. | 2 | Baja |
| HU14 | RF17 | Como tallerista, quiero eliminar la nota asignada a un alumno, para corregir un registro erróneo. | 2 | Baja |

**Subtotal: 11 puntos**


### Sprint 5 (Semanas 9-10)

| Código | RF | Historia de Usuario | Puntos | Prioridad |
| --- | --- | --- | --- | --- |
| HU15 | RF11 | Como administrador, quiero generar un informe de asistencia por taller, para supervisar la participación. | 3 | Media |
| HU16 | RF12 | Como administrador, quiero generar un informe de talleres con sus talleristas, para tener visión general. | 3 | Media |
| HU17 | RF13 | Como administrador, quiero exportar los informes en PDF o Excel, para compartirlos fuera de la plataforma. | 5 | Media |

**Subtotal: 11 puntos**


### Sprint 6 (Semanas 11-12)

| Código | RF | Historia de Usuario | Puntos | Prioridad |
| --- | --- | --- | --- | --- |
| HU04 | RF24 | Como administrador, quiero consultar los datos sensibles, para supervisar su correcto uso. | 3 | Baja |
| HU05 | RF25 | Como tallerista, quiero consultar el listado de alumnos de mi taller, para saber quiénes lo integran. | 2 | Baja |
| HU18 | RF19 | Como administrador, quiero generar un listado de alumnos, para tener un registro consolidado. | 2 | Baja |
| HU19 | RF22 | Como administrador, quiero generar un informe con información de talleristas, para tener un registro consolidado. | 2 | Baja |

**Subtotal: 9 puntos**

---

### 20.1 Backlog priorizado: Resumen de puntos por sprint

| Sprint | Semanas | Puntos | Estado | Reporte quincenal |
| --- | --- | --- | --- | --- |
| 1 | 1-2 | 11 | Dentro del límite (11) | R1 |
| 2 | 3-4 | 11 | Dentro del límite (11) | R2 |
| 3 | 5-6 | 10 | Dentro del límite (11) | R3 |
| 4 | 7-8 | 11 | Dentro del límite (11) | R4 |
| 5 | 9-10 | 11 | Dentro del límite (11) | R5 |
| 6 | 11-12 | 9 | Dentro del límite (11) | R6 |
| **Total** | **12 semanas** | **63** | | **6 reportes** |

---

<br>

## 21. Planificación de sprints

Esta sección detalla el objetivo, el incremento esperado y el resultado de cada sprint. Las historias de usuario asignadas a cada uno, con sus puntos y prioridades, figuran en el backlog priorizado (sección 20).

<br>

### 21.1 Sprint 1 (Semanas 1-2): Acceso al sistema y asignación a talleres

#### Objetivo del sprint

Construir la base del sistema: inicio de sesión con acceso diferenciado por rol y vinculación de alumnos y talleristas con sus talleres.

#### Historias seleccionadas

HU01 y HU03 — **11 puntos** (detalle en la sección 20, Sprint 1).

#### Incremento esperado

Al finalizar el sprint, el sistema permitirá:

- Iniciar sesión con usuario y contraseña.
- Acceder únicamente a las funciones correspondientes al propio rol (alumno, tallerista o administrador).
- Asignar alumnos y talleristas a un taller, de modo que cada uno acceda solo a la información que le corresponde.

#### Sprint Review

Sin Sprint Review: el cliente no estuvo presente durante el desarrollo (ver *Declaración sobre las instancias de Sprint Review*).

#### Resultado del sprint: *Completado.*

---

<br>

### 21.2 Sprint 2 (Semanas 3-4): Gestión de usuarios, talleres y asistencia

#### Objetivo del sprint

Permitir al administrador gestionar alumnos, talleristas y talleres, y al tallerista registrar, consultar y corregir la asistencia de su taller.

#### Historias seleccionadas

HU02, HU06 y HU07 — **11 puntos** (detalle en la sección 20, Sprint 2).

#### Incremento esperado

Al finalizar el sprint, el sistema permitirá:

- Crear, modificar, eliminar y consultar alumnos, talleristas y talleres, manteniendo actualizada la información de la plataforma.
- Registrar la asistencia de los alumnos de un taller en una fecha determinada.
- Consultar y modificar la asistencia ya registrada, para corregir errores de carga sin duplicar el registro.

#### Sprint Review

Sin Sprint Review: el cliente no estuvo presente durante el desarrollo (ver *Declaración sobre las instancias de Sprint Review*).

#### Resultado del sprint: *Completado.*

---

<br>

### 21.3 Sprint 3 (Semanas 5-6): Material, tareas y entregas

#### Objetivo del sprint

Habilitar el circuito básico de contenidos: el tallerista publica material y tareas, el alumno los consulta y envía sus entregas, y cada usuario gestiona su perfil.

#### Historias seleccionadas

HU08, HU09, HU10 y HU20 — **10 puntos** (detalle en la sección 20, Sprint 3).

#### Incremento esperado

Al finalizar el sprint, el sistema permitirá:

- Subir material de estudio y asignar tareas a un taller.
- Que el alumno vea el material y las tareas de su taller y sepa qué debe entregar.
- Que el alumno envíe los archivos de una tarea asignada, completando su entrega dentro de la plataforma.
- Que cada usuario modifique su contraseña y algunos datos de su perfil.

#### Sprint Review

Sin Sprint Review: el cliente no estuvo presente durante el desarrollo (ver *Declaración sobre las instancias de Sprint Review*).

#### Resultado del sprint: *Completado parcialmente.*

---

<br>

### 21.4 Sprint 4 (Semanas 7-8): Corrección, calificación y depuración de contenidos

#### Objetivo del sprint

Completar el ciclo de evaluación: el tallerista corrige entregas, asigna y elimina notas, y retira material que ya no corresponde.

#### Historias seleccionadas

HU11, HU12, HU13 y HU14 — **11 puntos** (detalle en la sección 20, Sprint 4).

#### Incremento esperado

Al finalizar el sprint, el sistema permitirá:

- Corregir las tareas entregadas por los alumnos y dar seguimiento a su desempeño.
- Asignar una nota a cada alumno por tarea entregada, registrando formalmente su evaluación.
- Eliminar material del taller que ya no corresponde mostrar.
- Eliminar la nota asignada a un alumno, para corregir un registro erróneo.

#### Sprint Review

Sin Sprint Review: el cliente no estuvo presente durante el desarrollo (ver *Declaración sobre las instancias de Sprint Review*).

#### Resultado del sprint: 	*Completado parcialmente.* 

---

<br>

### 21.5 Sprint 5 (Semanas 9-10): Informes y exportación

#### Objetivo del sprint

Dar a la administración una visión consolidada: informes de asistencia por taller y de talleres con sus talleristas, exportables a PDF o Excel.

#### Historias seleccionadas

HU15, HU16 y HU17 — **11 puntos** (detalle en la sección 20, Sprint 5).

#### Incremento esperado

Al finalizar el sprint, el sistema permitirá:

- Generar un informe de asistencia por taller, para supervisar la participación sin revisar cada registro manualmente.
- Generar un informe de talleres con sus talleristas asignados, con una visión general de la organización de la plataforma.
- Exportar los informes generados en PDF o Excel, para compartirlos fuera de la plataforma.

#### Sprint Review

Sin Sprint Review: el cliente no estuvo presente durante el desarrollo (ver *Declaración sobre las instancias de Sprint Review*).

#### Resultado del sprint: *En proceso.*

---

<br>

### 21.6 Sprint 6 (Semanas 11-12): Consultas complementarias y cierre

#### Objetivo del sprint

Cerrar el alcance de la primera versión con las consultas restantes: datos sensibles, listado de alumnos por taller, listado general de alumnos e informe de talleristas.

#### Historias seleccionadas

HU04, HU05, HU18 y HU19 — **9 puntos** (detalle en la sección 20, Sprint 6).

#### Incremento esperado

Al finalizar el sprint, el sistema permitirá:

- Consultar los datos sensibles utilizados en la plataforma, para supervisar su correcto uso y protección.
- Que el tallerista consulte el listado de alumnos inscritos en su taller.
- Generar un listado de alumnos, como registro consolidado de todos los inscritos.
- Generar un informe con información detallada de los talleristas, como registro consolidado del personal a cargo de los talleres.

#### Sprint Review

Sin Sprint Review: el cliente no estuvo presente durante el desarrollo (ver *Declaración sobre las instancias de Sprint Review*).

#### Resultado del sprint: *En proceso.*

---

<br>

## 22. Resumen de los sprints

### 22.1 Tabla general de sprints

| Sprint | Objetivo | Incremento entregado | Puntos | Resultado |
| --- | --- | --- | --- | --- |
| Sprint 1 | Acceso al sistema y asignación a talleres | Inicio de sesión por rol y asignación de alumnos y talleristas a talleres | 11 | Completado. |
| Sprint 2 | Gestión de usuarios, talleres y asistencia | Gestión de alumnos, talleristas y talleres; registro y corrección de asistencia | 11 | Completado. |
| Sprint 3 | Material, tareas y entregas | Publicación de material y tareas, consulta y entrega del alumno, gestión de perfil | 10 | Completado parcialmente. |
| Sprint 4 | Corrección, calificación y depuración | Corrección de entregas, asignación y eliminación de notas, eliminación de material | 11 | Completado parcialmente. |
| Sprint 5 | Informes y exportación | Informes de asistencia y de talleres, exportación a PDF o Excel | 11 | En proceso. |
| Sprint 6 | Consultas complementarias y cierre | Consulta de datos sensibles, listados de alumnos e informe de talleristas | 9 | En proceso. |
| **Total** | | | **63** | |

---

### 22.2 Evolución del proyecto

| Momento | Estado |
| --- | --- |
| Inicio | Solo existe una necesidad general del cliente. |
| Después de la entrevista | Se conocen el alcance, los usuarios, los roles y las prioridades. |
| Después de las épicas | El trabajo se organiza en seis grandes bloques funcionales. |
| Después del backlog | El equipo cuenta con veinte historias priorizadas y estimadas en 63 puntos. |
| Después del Sprint 1 | Existe una base funcional con acceso por rol y asignación a talleres. |
| Después del Sprint 2 | Se gestionan usuarios y talleres, y se registra la asistencia. |
| Después del Sprint 3 | Funciona el circuito de material, tareas y entregas. |
| Después del Sprint 4 | Se corrigen entregas y se asignan notas; eliminar una nota desde la interfaz queda pendiente. |
| Después del Sprint 5 | La administración genera informes de asistencia y de talleres; la exportación a PDF o Excel queda en proceso. |
| Después del Sprint 6 | El tallerista consulta el listado de su taller; el listado general, el informe de talleristas y la consulta de datos sensibles quedan en proceso. |
| Cierre | Las seis funciones postergadas por plazo (RF15, RF18, RF20, RF21, RF23 y RF26) quedan para etapas futuras. |

---

<br>

## 23. Estado de los requerimientos al cierre

Estado verificado en las pruebas del sistema del 24/10/2026 (`docs/04-implementacion/Testing/Testing-01.md`) y del 26/10/2026 (`Testing-02.md`, casos citados como "T2").

| Área | Requerimiento | Estado | Observación | Prueba |
| --- | --- | --- | --- | --- |
| Autenticación y acceso por rol | RF01 — Inicio de sesión diferenciado por rol | Cumplido | Acceso por correo y contraseña; cada rol es redirigido a su panel. | CP-01, CP-02, CP-03 |
| Gestión de usuarios y talleres | RF02 — Gestión de alumnos, talleristas y talleres | Cumplido |Alta y edición verificadas; la eliminación no se probó. La cédula (8 dígitos) y el teléfono (8 a 15 dígitos) se validan en el formulario y en la API. La misma cédula escrita con o sin puntos se acepta dos veces (DEF-09).|CP-04, CP-05; T2 CP-06 a CP-08|
| Gestión de usuarios y talleres | RF03 — Asignación de alumnos y talleristas a talleres | Cumplido | — |CP-06; T2 CP-09|
| Registro y corrección de asistencia | RF04 — Registrar asistencia | Cumplido | Los cuatro estados se guardan correctamente. |CP-07; T2 CP-02|
| Registro y corrección de asistencia | RF05 — Consultar y modificar asistencia | Cumplido | El tallerista consulta y modifica la asistencia, y el alumno consulta sus registros reales (DEF-01 corregido). |CP-07, CP-08; T2 CP-01|
| Material, tareas y entregas | RF06 — Subir material y tareas | Parcial | Material y tareas se publican, pero el formulario del tallerista no permite adjuntar archivos; solo es posible mediante la API. | CP-09 |
| Material, tareas y entregas | RF07 — El alumno visualiza material y tareas | Cumplido | — | CP-10 |
| Material, tareas y entregas | RF08 — El alumno envía archivos de una tarea | Cumplido | Entrega con PDF y comentario. | CP-10 |
| Corrección y calificación | RF09 — Corregir tareas | Cumplido | — | CP-11 |
| Corrección y calificación | RF10 — Asignar nota | Cumplido | Se rechazan notas fuera del rango 1 a 10. | CP-11 |
| Corrección y calificación | RF16 — Eliminar material | Cumplido | — | CP-09 |
| Corrección y calificación | RF17 — Eliminar nota | Parcial | La interfaz no ofrece la opción; solo es posible mediante la API. | CP-11 |
| Informes y exportación | RF11 — Informe de asistencia por taller | Cumplido | — | CP-12 |
| Informes y exportación | RF12 — Informe de talleres con sus talleristas | Cumplido | — | CP-12 |
| Informes y exportación | RF13 — Exportar informes en PDF o Excel | Pendiente | La descarga genera un archivo JSON. | CP-13 |
| Informes y exportación | RF19 — Listado de alumnos | Pendiente | No existe la opción para generarlo. | CP-14 |
| Informes y exportación | RF22 — Informe de talleristas | Pendiente | No existe la opción para generarlo. | CP-14 |
| Gestión de perfil | RF14 — Gestionar el perfil | Parcial | Se modifican los datos de contacto. El cambio de contraseña está implementado en la API para los tres roles, pero solo el administrador lo tiene en la interfaz (DEF-10). | CP-15; T2 CP-03 a CP-05 |
| Datos sensibles y listado por taller | RF24 — Consultar datos sensibles | Pendiente | No existe la funcionalidad. | CP-16 |
| Datos sensibles y listado por taller | RF25 — Listado de alumnos del taller | Cumplido | — | CP-06 |
| Funciones postergadas por plazo | RF15, RF18, RF20, RF21, RF23, RF26 | Postergado | Pendiente para una fase futura (Control de Cambios, CC-01). | — |
| Alcance excluido | Foros, notificaciones y mensajería interna | Excluido | Pendiente para una fase futura. | — |
| Alcance excluido | Soporte multiformato y asistencia avanzada | Excluido | Pendiente para una fase futura. | — |

**Resumen:** de los 20 requerimientos de la primera versión, 13 están cumplidos, 3 parciales (RF06, RF14 y RF17) y 4 pendientes (RF13, RF19, RF22 y RF24).

---

<br>

## 24. Lecciones aprendidas (Sprint Retrospective)

| Lección | Explicación |
| --- | --- |
| La necesidad inicial no alcanza para construir el sistema | El cliente planteó una idea general; la entrevista permitió definir roles, permisos, alcance y prioridades. |
| Sin retroalimentación del cliente, el alcance queda fijo | Al no haber Sprint Reviews con el cliente, los requerimientos no pudieron validarse ni ajustarse durante el desarrollo; todo dependió de la entrevista inicial. |
| La estimación gruesa tiende a sobreestimar | La estimación por épicas (91 y luego 76 puntos) se redujo a 63 al descomponer el trabajo en historias de usuario. |
| No todo entra en la primera versión | Seis funciones se postergaron para respetar el plazo de doce semanas. |
| El modelado revela requerimientos faltantes | Al derivar el modelo de clases se detectaron requerimientos presentes en la entrevista que la especificación no había recogido. |
| El cierre no significa que el producto no pueda evolucionar | El sistema queda operativo y se identifican mejoras futuras. |
| Actuar a tiempo ante el incumplimiento de tareas | Durante el proyecto, dos integrantes (Maximiliano Leal e Ignacio Viera) dejaron de cumplir las tareas asignadas y fueron retirados del equipo, que continuó con tres integrantes (ver Control de Cambios, CC-03). La decisión debió tomarse antes, porque la demora afectó la distribución del trabajo y el cronograma. |

---

## 25. Conclusión.

El proyecto partió de una necesidad general del cliente: organizar la gestión de los talleres que se dictan en convenio con INAU. La entrevista permitió convertirla en un alcance concreto, con tres roles diferenciados y veintiséis requerimientos funcionales, y el equipo organizó el trabajo con Scrum en seis sprints quincenales. El plan se ajustó de 91 a 63 puntos para respetar el plazo de doce semanas y la capacidad de un equipo de tres integrantes, y seis funciones se postergaron de forma explícita para una fase futura, según consta en el Control de Cambios.

Como resultado, se cerró el alcance de la primera versión: una API REST en PHP organizada en capas, una base de datos MySQL derivada del modelo de clases, autenticación con JWT y control de acceso por rol, y tres paneles web responsive conectados a la API. El administrador gestiona usuarios y talleres y dispone de informes exportables; el tallerista registra la asistencia, publica material y tareas y corrige las entregas; y el alumno consulta el material y su asistencia, y entrega sus trabajos. Todo el entorno se levanta con Docker y su despliegue en un servidor quedó documentado.

La principal limitación fue la ausencia del cliente durante el desarrollo: sin Sprint Reviews, el alcance dependió por completo de la entrevista inicial. Aun así, la trazabilidad entre entrevista, requerimientos, historias de usuario, modelo y código permite verificar que lo construido responde a lo que el cliente pidió. El sistema queda como una primera versión funcional, con mejoras identificadas en la Revisión de Coherencia y preparada para incorporar las funciones postergadas.