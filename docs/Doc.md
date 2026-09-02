# Proyecto Sistema de Gestión de Talleres en Convenio con INAU

<br>

## 1. Situación inicial del cliente.

**Organismo público vinculado a actividades socioeducativas (INAU) que gestiona talleres mediante convenio. Actualmente, la gestión de talleres, participantes y asistencias requiere una herramienta digital que centralice la información y mejore la coordinación entre talleristas y la administración.**

---

<br>

## 2. Necesidad presentada por el cliente.

>**El problema principal a resolver es la falta de organización y accesibilidad en la plataforma actual. Se requiere un espacio unificado donde estudiantes, talleristas y administradores dispongan de funciones específicas que permitan optimizar, asegurar y promover la accesibilidad, disponibilidad y estructuración de la información.**
>
>**-Se busca implementar una plataforma integral con las facultades mencionadas, mediante la cual:**
>
>**-Los alumnos puedan acceder a sus talleres, tareas, información académica y foros de discusión.**
>
>**-Los talleristas puedan publicar material didáctico e información, evaluar entregas y llevar el control de asistencias.**
>
>**-Los administradores cuenten con la capacidad de supervisar y gestionar de manera global la actividad dentro del sistema.**
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
| Equipo de desarrollo | Maximiliano Leal, desarrollador FE | Relevar necesidades y transformar la información en backlog. |



<br>

## 5. Anotaciones de la entrevista con el cliente

### 1. Definición del Problema y Necesidad Principal

El problema principal a resolver es la falta de una plataforma web centralizada que otorgue acceso a estudiantes, talleristas y administradores a funciones específicas que faciliten, mejoren, aseguren la privacidad y avancen en términos de accesibilidad, disponibilidad y organización.

Actualmente, el proceso presenta fallas en la accesibilidad y facilidad al momento de ejecutar las tareas operativas. Se busca optimizar su funcionalidad integral.


### 2. Visión del Sistema

Se proyecta alcanzar una plataforma con características similares a la plataforma Crea, estructurada para que:

- *Alumnos:* Accedan a sus talleres, tareas, información académica y foros.
- *Talleristas:* Publiquen material, compartan información, evalúen, gestionen entregas y lleven el control de asistencia.
- *Administradores:* Tengan visibilidad y control global de las actividades y eventos dentro del sistema.

(Nota: En el proceso actual no se especificó la metodología exacta con la que se realizan estas tareas hoy en día).


### 3. Definición de Roles y Permisos de Usuario

#### 3.1. Alumno

- *Visualización:* Materiales, tareas e información de sus respectivos talleres; sus notas asignadas por el tallerista y su información personal.
- *Acciones/Carga:* Consultas y envío de archivos requeridos para la entrega de tareas.
- *Modificación:* Cambio de contraseña y edición limitada de ciertos elementos del perfil. Sin acceso a modificar los archivos de entregas una vez enviados.
- *Eliminación:* Edición/eliminación de ciertos datos de su perfil (ej. foto de perfil, biografía).

#### 3.2. Tallerista

- *Visualización:* Únicamente la información correspondiente a su taller (materiales, tareas, listado de alumnos inscritos, asistencias y ciertos datos del estudiante).
- *Acciones/Carga:* Publicar material didáctico, asignar y corregir tareas, comunicarse con los alumnos, registrar asistencia de su taller e ingresar notas e informes para la administración.
- *Modificación:* Ajuste de materiales de su taller, registros de asistencia y calificaciones asignadas a los alumnos.
- *Eliminación:* Borrado de materiales, calificaciones e historial de asistencias de su taller.

#### 3.3. Administrador

- *Visualización:* Acceso integral a toda la información del sistema, observando y supervisando el orden y el uso adecuado de la plataforma.
- *Acciones/Carga:* Gestión completa para subir, modificar, eliminar y consultar cualquier información (con excepción de la modificación directa de datos personales de los usuarios como el número de cédula).


### 4. Alcance del Proyecto

#### 4.1. Alcance de la Primera Versión (MVP)

- Operatividad general y funcional de la plataforma.
- Capacidades para que los talleristas suban material y asignen tareas (sin especificar inicialmente restricciones de imágenes, datos o archivos extra).
- Módulo para el pase de lista / control de asistencias por parte de los talleristas.
- Interfaz para que los alumnos visualicen los contenidos y envíen sus entregas.
- Panel de administración con acceso y supervisión global del sistema.

#### 4.2. Funcionalidades Deseables (Fases Futuras)

- *Foros por Taller:* Espacios interactivos donde se puedan publicar imágenes y novedades para ser visualizados por los usuarios y sus familiares.
- *Soporte Multiformato:* Compatibilidad para la subida de archivos tipo PDF, PNG, MP4 y JPG.
- *Módulo Avanzado de Asistencia:* Control detallado e historial de asistencia con métricas semanales, mensuales, anuales, etc.
- *Canal de Comunicación Interna:* Envío de informes directos de los talleristas hacia la administración.


### 5. Requerimientos de Información y Auditoría

#### 5.1. Registros Obligatorios

El sistema deberá registrar:

- Usuarios y contraseñas.
- Asistencias.
- Elementos enviados y subidos.
- Informes generados.
- Traza de archivos subidos, modificados o eliminados.
- Datos de contacto de los talleristas e información personal de cada usuario.

#### 5.2. Consultas y Protección de Datos

- Consulta de datos sensibles utilizados.


### 6. Generación de Reportes

El sistema debe permitir la emisión de los siguientes reportes:

- Listas de alumnos.
- Mapeo de talleres y sus respectivos talleristas asignados.
- Histórico de calificaciones de alumnos.
- Información detallada de alumnos y talleristas.
- Reportes emitidos por los talleristas.
- Registros de asistencias.
- Listado e historial de tareas entregadas.


### 7. Requerimientos No Funcionales

- *Notificaciones:* El sistema deberá emitir notificaciones automáticas ante eventos relevantes (correcciones de tareas, faltas de asistencia, nuevas entregas, etc.).
- *Integración / Módulos no especificados:* (No especificado en la entrevista).
- *Seguridad y Protección de Datos:* Aunque no se definió un nivel de seguridad específico, se exige el cumplimiento obligatorio de medidas para la protección de los datos de los usuarios.
- *Rendimiento:* Se requiere un tiempo de respuesta rápido en la ejecución de tareas habituales.
- *Multiplataforma y Accesibilidad:* Diseño adaptable a todos los dispositivos, permitiendo el acceso remoto desde cualquier ubicación.
- *Disponibilidad:* Sistema disponible en modalidad 24/7.
- *Marco Legal y Reglas de Negocio:*
 - Las reglas de negocio no fueron especificadas en la entrevista.
 - Las restricciones legales no fueron detalladas en la entrevista.


### 8. Criterios de Aceptación y Plazos

- *Criterio de Aceptación:* El cliente validará el sistema cuando este sea plenamente funcional en la operativa del día a día, cumpliendo con las características requeridas.
- *Plazo de Entrega:* Finales del año en curso.

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
| **NRF11** | El sistema debe restringir los formatos de archivos adjuntos a PDF, imágenes JPG y documentos de oficina (DOCX, XLSX, PPTX), acorde a los tipos soportados en v1. |
| **NRF12** | El sistema debe restringir el tamaño de los archivos adjuntos permitidos. |
| **NRF13** | El código del sistema debe estar organizado, ser reutilizable y mantenible. |
| **NRF14** | El sistema debe contar con documentación técnica dentro del repositorio. |
| **NRF15** | El equipo debe utilizar Git para registrar y revisar los cambios del código. |
| **NRF16** | Todo cambio en el repositorio debe integrarse mediante Pull Request, con revisión previa de al menos otro integrante del equipo. |



<br>

## 13. Épicas

| Código | Épica | Descripción |
| --- | --- | ---|
| **EP1** | Autenticación y control de acceso | Permitir el ingreso seguro y diferenciado a la plataforma según el rol del usuario. |
| **EP2** | Gestión de usuarios y talleres | Administrar los usuarios (alumnos, talleristas) y su relación con los talleres, incluyendo la consulta de datos sensibles y del listado de alumnos por taller. |
| **EP3** | Gestión de asistencia | Registrar, controlar y eliminar la asistencia de los alumnos a los talleres. |
| **EP4** | Gestión de material y tareas | Permitir la carga, modificación, entrega, corrección, eliminación y visualización de material, tareas y notas de cada taller. |
| **EP5** | Reportes e informes | Generar y exportar información consolidada de asistencia, talleres, alumnos y talleristas, incluyendo el histórico de calificaciones. |
| **EP6** | Gestión de perfil de usuario | Permitir a cada usuario administrar su propia información personal.|


<br>


## 14. Estimación por Épica


| Código | Épica | Estimación en puntos |
| --- | --- | --- |
| **EP1** | Autenticación y control de acceso | 8 |
| **EP2** | Gestión de usuarios y talleres | 18 |
| **EP3** | Gestión de asistencia | 10 |
| **EP4** | Gestión de material y tareas | 30 |
| **EP5** | Reportes e informes | 22 |
| **EP6** | Gestión de perfil de usuario | 3 |
| **EP Totales** | **6 EP** | **91** |

<br>


## 15. Estimación por Épicas, ajustadas

| Código | Épica | RF que la conforman | Puntos |
|---|---|---|---|
| **EP1** | Autenticación y control de acceso | RF01 | 8 |
| **EP2** | Gestión de usuarios y talleres | RF02, RF03, RF24, RF25 | 18 |
| **EP3** | Gestión de asistencia | RF04, RF05 | 7 |
| **EP4** | Gestión de material y tareas | RF06, RF07, RF08, RF09, RF10, RF16, RF17 | 24 |
| **EP5** | Reportes e informes | RF11, RF12, RF13, RF19, RF22 | 17 |
| **EP6** | Gestión de perfil de usuario | RF14 | 2 |
| **Total** | | **20 RF** | **76** |


---

<br>


## 16. Ajuste de alcance para respetar plazo.

| RF | Épica de origen | Función excluida |
|---|---|---|
| **RF15** | EP6 | Eliminación de datos de perfil (foto, biografía) por parte del alumno |
| **RF18** | EP3 | Eliminación de un registro de asistencia |
| **RF20** | EP5 | Generación de informe con histórico de calificaciones |
| **RF21** | EP5 | Generación de informe con información detallada de alumnos |
| **RF23** | EP4 | Visualización de notas por parte del alumno |
| **RF26** | EP4 | Modificación de material/tareas ya subidas |

**Total: 6 funciones excluidas.**


<br>


## 17. Propuesta presentada al cliente

| Elemento | Propuesta |
| --- | --- |
| Producto | TheNewfutures – Plataforma de gestión de talleres en convenio con INAU |
| Duración | 12 semanas (6 sprints de 2 semanas cada uno). |
| Metodología | Scrum, con 6 sprints de 2 semanas. |
| Entregas | Incremento funcional al final de cada sprint. |
| Forma de trabajo | Equipo de 5 integrantes (Emiliano Sánchez — Líder/Scrum Master, Gabriel Rendon — Subcoordinador, Ignacio Viera, Maximiliano Leal, Thiago Ferragut), con reuniones periódicas de seguimiento y reparto de tareas por sprint. |
| Primera versión | Autenticación por rol, gestión de usuarios y talleres (incluyendo consulta de datos sensibles y del listado de alumnos por taller), registro y consulta de asistencia, carga/entrega/corrección/eliminación de material y tareas, reportes de asistencia/talleres/alumnos/talleristas, gestión de perfil. |
| Exclusiones | Foros, soporte multiformato (PNG/MP4), asistencia detallada por métricas, listado e historial ampliado de tareas entregadas, notificaciones automáticas, mensajería administrador-tallerista, eliminación de asistencia, modificación de material ya subido, visualización de notas por el alumno, histórico de calificaciones, ficha detallada de alumnos, eliminación de datos de perfil. |


<br>


## 18. Estimación de costos

> **Nota:** El costo está estimado en forma simplificada, como estimación didáctica. En un proyecto real, el presupuesto dependería de tarifas, tecnología, infraestructura, contratos, licencias, soporte y mantenimiento.

| Concepto | Detalle | Costo |
| --- | --- | --- |
| **Recursos humanos** | 5 integrantes × 6 h semanales × 12 semanas = 360 h, a USD 12/h (perfil junior) | USD 4.320 |
| **Hosting** | Plan compartido con soporte PHP y MySQL, USD 5 mensuales | USD 60 / año |
| **Dominio** | Registro anual `.uy` o `.com` | USD 15 / año |
| **Certificado SSL** | Incluido en el hosting (Let's Encrypt) | USD 0 |
| **Herramientas y licencias** | Git/GitHub, VS Code, XAMPP, Bootstrap, PHP y MySQL: todas libres o gratuitas | USD 0 |
| **Total primer año** | | **USD 4.395** |
| **Mantenimiento anual posterior** | Hosting + dominio | **USD 75 / año** |

**Costo por punto de esfuerzo:** USD 4.320 ÷ 63 puntos ≈ **USD 68,6 por punto**. Este indicador permite estimar funcionalidades futuras: una historia de 3 puntos equivale aproximadamente a USD 206, y una de 5 puntos, a USD 343.

---

## 19. Aprobación ficticia del cliente

Luego de revisar la propuesta, el cliente responde:

> "La propuesta está dentro del presupuesto máximo que habíamos previsto. Nos parece correcto empezar por una versión inicial.
>
> Lo más importante para nosotros es que los talleristas puedan registrar la asistencia y subir el material sin complicaciones, y que la administración pueda ver en todo momento qué está pasando en cada taller. 
>
>Entendemos que algunas funciones, como los foros y las notificaciones automáticas, queden para más adelante.

Aprobamos el proyecto con 6 ciclos de trabajo de 2 semanas. Queremos participar en las revisiones al final de cada ciclo para validar que el sistema se ajuste al trabajo real de los talleres."


<br>

## 20. Formato de historia de usuario

Se utilizará el siguiente formato:

> Como **[tipo de usuario]**, quiero **[acción o necesidad]**, para **[beneficio o resultado esperado]**.

Cada historia incluirá criterios de aceptación para saber cuándo puede considerarse terminada.

---

<br>

## 21. Historias de Usuario iniciales.

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

## 22. Backlog priorizado

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

### 22.2 Backlog priorizado: Resumen de puntos por sprint

| Sprint | Semanas | Puntos | Estado | Reporte quincenal |
| --- | --- | --- | --- | --- |
| 1 | 1-2 | 11 | Dentro del límite (11) | R1 |
| 2 | 3-4 | 11 | Dentro del límite (11) | R2 |
| 3 | 5-6 | 10 | Dentro del límite (11) | R3 |
| 4 | 7-8 | 11 | Dentro del límite (11) | R4 |
| 5 | 9-10 | 11 | Dentro del límite (11) | R5 |
| 6 | 11-12 | 9 | Dentro del límite (11) | R6 |
| **Total** | **12 semanas** | **63** | | **6 reportes** |