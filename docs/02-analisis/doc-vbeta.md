# Proyecto Sistema de Gestión de Talleres en Convenio con INAU — TheNewfutures

## 1. El problema y qué se va a construir

**El cliente.** INAU es un organismo público que realiza actividades socioeducativas y gestiona talleres mediante convenio.

**El problema.** Hoy no existe una plataforma única que centralice la información de talleres, participantes y asistencias. Eso complica la coordinación entre talleristas y administración, y el acceso ordenado a la información.

**La solución.** Una plataforma web, con diseño adaptable a computadora, tablet y teléfono, donde cada rol tenga sus propias funciones:

- **Alumnos:** acceden a sus talleres, tareas, material e información académica.
- **Talleristas:** publican material, corrigen entregas, ponen notas y registran asistencia de su taller.
- **Administradores:** supervisan y gestionan todo el sistema.

El cliente la describió como algo parecido a la plataforma *Crea*. Se construye **de forma incremental**: la primera versión trae autenticación, gestión de usuarios y talleres, asistencia, material y tareas, informes y perfiles; los foros y la comunicación interna quedan para etapas posteriores.

---

## 2. Participantes de la entrevista

| Rol | Participante | Responsabilidad |
|---|---|---|
| Usuario experto | Lemuel Szwec González, tallerista | Explica el proceso operativo actual y las necesidades del rol tallerista. |
| Equipo de desarrollo | Emiliano Sánchez, líder de equipo | Relevar necesidades y transformarlas en backlog. |

---

## 3. Anotaciones de la entrevista con el cliente

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

## 4. Roles: qué puede hacer cada uno

**Alumno.** Ve el material, las tareas y las notas de sus talleres, y sus datos personales. Envía los archivos de sus entregas. Puede cambiar su contraseña y editar partes de su perfil (foto, biografía). No puede modificar una entrega ya enviada.

**Tallerista.** Ve solo la información de su taller (material, tareas, lista de alumnos, asistencias). Publica material, asigna y corrige tareas, pone notas, registra asistencia y genera informes para la administración. Puede modificar y eliminar el material, las notas y los registros de asistencia de su taller.

**Administrador.** Ve y gestiona todo el sistema: crea, modifica, elimina y consulta cualquier información. No puede modificar directamente ciertos datos personales de los usuarios (como la cédula).

---

## 5. Alcance de la primera versión

**Qué entra en la v1.** El detalle exacto está en la tabla de requerimientos funcionales (sección 6); en resumen: login por rol, gestión de usuarios y talleres, asignación de alumnos/talleristas, registro y consulta de asistencia, carga y corrección de material y tareas, generación y exportación de informes, y gestión de perfil.

**Qué queda afuera (etapas futuras):**

1. Foros de comunicación y publicación de contenido por taller.
2. Soporte de archivos PNG y MP4 (más allá del tipo básico de v1).
3. Asistencia con métricas detalladas (semanal, mensual, anual).
4. Listado e historial ampliado de tareas entregadas.
5. Notificaciones automáticas ante eventos (correcciones, faltas, entregas).
6. Mensajería interna entre administración y talleristas (no en tiempo real).
7. Comunicación asincrónica del tallerista con sus alumnos.

---

## 6. Requerimientos funcionales (RF)

Cada fila es algo que el sistema debe hacer.

| Código | Requerimiento funcional |
|---|---|
| **RF01** | Iniciar sesión con usuario y contraseña, diferenciando el acceso según el rol (alumno, tallerista, administrador). |
| **RF02** | El administrador gestiona usuarios (alumnos y talleristas) y talleres: crear, modificar, eliminar y consultar. |
| **RF03** | El administrador asigna alumnos y talleristas a los talleres correspondientes. |
| **RF04** | El tallerista registra la asistencia de los alumnos de su taller, indicando fecha. |
| **RF05** | Consultar y modificar la asistencia registrada por taller y fecha. |
| **RF06** | El tallerista sube material y tareas asociados a su taller. |
| **RF07** | El alumno visualiza el material y las tareas de su taller. |
| **RF08** | El alumno envía/sube los archivos correspondientes a una tarea asignada. |
| **RF09** | El tallerista corrige las tareas enviadas por los alumnos. |
| **RF10** | El tallerista asigna una nota a cada alumno por tarea. |
| **RF11** | Generar informes de asistencia por taller. |
| **RF12** | Generar informes de talleres con sus talleristas asignados. |
| **RF13** | Exportar los informes generados en formato PDF o Excel. |
| **RF14** | Cada usuario gestiona su perfil según su rol (modificar contraseña y datos personales). |
| **RF15** | El alumno elimina ciertos datos de su perfil (foto, biografía). |
| **RF16** | El tallerista elimina material de su taller. |
| **RF17** | El tallerista elimina la nota asignada a un alumno. |
| **RF18** | El tallerista elimina un registro de asistencia de su taller. |
| **RF19** | Generar un listado de alumnos. |
| **RF20** | Generar un informe del histórico de calificaciones de los alumnos. |
| **RF21** | Generar un informe con información detallada de los alumnos. |
| **RF22** | Generar un informe con información detallada de los talleristas. |
| **RF23** | El alumno visualiza las notas asignadas por el tallerista. |
| **RF24** | El administrador consulta los datos sensibles utilizados en la plataforma. |
| **RF25** | El tallerista consulta el listado de alumnos inscritos en su taller. |
| **RF26** | El tallerista modifica el material o las tareas ya subidas a su taller. |

---

## 7. Requerimientos no funcionales (NRF)

Exigencias de calidad que el sistema debe cumplir.

| Código | Requerimiento no funcional |
|---|---|
| **NRF01** | Diseño responsive: se adapta a computadora, tablet y teléfono. |
| **NRF02** | Disponible las 24 horas una vez desplegado. |
| **NRF03** | Responde con rapidez en las operaciones habituales. |
| **NRF04** | Navegación clara y consistente. |
| **NRF05** | Valida los formularios tanto en el frontend como en el backend. |
| **NRF06** | Mantiene una arquitectura separada entre frontend y backend. |
| **NRF07** | Controla el acceso a las funcionalidades según el rol del usuario. |
| **NRF08** | Protege los datos personales de los usuarios. |
| **NRF09** | Garantiza la persistencia confiable de los datos en una base de datos relacional. |
| **NRF10** | Registra la trazabilidad de las acciones importantes de los usuarios. |
| **NRF11** | Restringe los formatos de adjuntos a PDF, imágenes JPG y documentos de oficina (DOCX, XLSX, PPTX). |
| **NRF12** | Restringe el tamaño de los archivos adjuntos. |
| **NRF13** | Código organizado, reutilizable y mantenible. |
| **NRF14** | Cuenta con documentación técnica dentro del repositorio. |
| **NRF15** | El equipo usa Git para registrar y revisar los cambios del código. |
| **NRF16** | Todo cambio se integra mediante Pull Request, con revisión de al menos otro integrante. |

---

## 8. Épicas

Las funciones agrupadas en bloques grandes.

| Código | Épica | Descripción |
|---|---|---|
| **EP1** | Autenticación y control de acceso | Ingreso seguro y diferenciado según el rol. |
| **EP2** | Gestión de usuarios y talleres | Administrar usuarios y su relación con los talleres, incluyendo consulta de datos sensibles y del listado de alumnos por taller. |
| **EP3** | Gestión de asistencia | Registrar, controlar y eliminar la asistencia de los alumnos. |
| **EP4** | Gestión de material y tareas | Carga, modificación, entrega, corrección, eliminación y visualización de material, tareas y notas. |
| **EP5** | Reportes e informes | Generar y exportar información consolidada de asistencia, talleres, alumnos y talleristas. |
| **EP6** | Gestión de perfil de usuario | Que cada usuario administre su propia información personal. |

---

## 9. Estimación y ajuste de puntos (91 → 76 → 63)

El esfuerzo del proyecto se estimó en puntos, y esa cifra bajó dos veces. Conviene entender por qué, porque las tres cifras aparecen en documentos distintos.

**Primera estimación — por épica, con todos los RF (91 puntos):**

| Código | Épica | Puntos |
|---|---|---|
| **EP1** | Autenticación y control de acceso | 8 |
| **EP2** | Gestión de usuarios y talleres | 18 |
| **EP3** | Gestión de asistencia | 10 |
| **EP4** | Gestión de material y tareas | 30 |
| **EP5** | Reportes e informes | 22 |
| **EP6** | Gestión de perfil de usuario | 3 |
| **Total** | **6 épicas** | **91** |

**Segunda — por épica, tras excluir 6 RF por plazo (76 puntos):**

| Código | Épica | RF que la conforman | Puntos |
|---|---|---|---|
| **EP1** | Autenticación y control de acceso | RF01 | 8 |
| **EP2** | Gestión de usuarios y talleres | RF02, RF03, RF24, RF25 | 18 |
| **EP3** | Gestión de asistencia | RF04, RF05 | 7 |
| **EP4** | Gestión de material y tareas | RF06, RF07, RF08, RF09, RF10, RF16, RF17 | 24 |
| **EP5** | Reportes e informes | RF11, RF12, RF13, RF19, RF22 | 17 |
| **EP6** | Gestión de perfil de usuario | RF14 | 2 |
| **Total** | | **20 RF** | **76** |

**Tercera — sumando historia por historia (63 puntos):**

| Épica | Estimación por épica | Suma de sus historias | Diferencia |
|---|---:|---:|---:|
| EP1 | 8 | 8 | — |
| EP2 | 18 | 13 | −5 |
| EP3 | 7 | 6 | −1 |
| EP4 | 24 | 19 | −5 |
| EP5 | 17 | 15 | −2 |
| EP6 | 2 | 2 | — |
| **Total** | **76** | **63** | **−13** |

**Por qué bajó y cuál se usa.** La estimación por épica se hizo "de arriba hacia abajo" (un valor al bloque entero antes de conocer su detalle); la del backlog, "de abajo hacia arriba" (sumando cada historia ya desglosada). Al desglosar, las épicas grandes (EP2 y EP4) habían quedado sobreestimadas. **Se adopta 63 puntos** como base de planificación y costos, por ser la estimación más detallada. Además es lo que hace viable el cronograma: con un tope de 11 puntos por sprint, los seis sprints dan 66 de capacidad máxima; 63 entra, 76 no.

**Los 6 RF excluidos para respetar el plazo:**

| RF | Épica | Función excluida |
|---|---|---|
| **RF15** | EP6 | Eliminación de datos de perfil (foto, biografía) por el alumno |
| **RF18** | EP3 | Eliminación de un registro de asistencia |
| **RF20** | EP5 | Informe con histórico de calificaciones |
| **RF21** | EP5 | Informe con información detallada de alumnos |
| **RF23** | EP4 | Visualización de notas por el alumno |
| **RF26** | EP4 | Modificación de material/tareas ya subidas |

---

## 10. Historias de usuario

Formato usado: *"Como [tipo de usuario], quiero [acción], para [beneficio]."* Cada una lleva criterios de aceptación para saber cuándo está terminada.

| Código | Épica | RF | Historia de usuario | Puntos | Prioridad |
|---|---|---|---|---|---|
| HU01 | EP1 | RF01 | Como usuario (alumno, tallerista o administrador), quiero iniciar sesión con usuario y contraseña, para acceder solo a las funciones de mi rol. | 8 | Alta |
| HU02 | EP2 | RF02 | Como administrador, quiero gestionar alumnos, talleristas y talleres, para mantener actualizada la información. | 5 | Alta |
| HU03 | EP2 | RF03 | Como administrador, quiero asignar alumnos y talleristas a un taller, para que cada uno acceda a lo que le corresponde. | 3 | Alta |
| HU04 | EP2 | RF24 | Como administrador, quiero consultar los datos sensibles, para supervisar su uso y protección. | 3 | Baja |
| HU05 | EP2 | RF25 | Como tallerista, quiero consultar el listado de alumnos de mi taller, para saber quiénes lo integran. | 2 | Baja |
| HU06 | EP3 | RF04 | Como tallerista, quiero registrar la asistencia de una fecha, para llevar un control confiable. | 3 | Alta |
| HU07 | EP3 | RF05 | Como tallerista, quiero consultar y modificar la asistencia registrada, para corregir errores sin duplicar. | 3 | Media |
| HU08 | EP4 | RF06 | Como tallerista, quiero subir material y asignar tareas, para que mis alumnos sepan qué entregar. | 3 | Alta |
| HU09 | EP4 | RF07 | Como alumno, quiero ver el material y las tareas de mi taller, para saber qué tengo disponible. | 2 | Alta |
| HU10 | EP4 | RF08 | Como alumno, quiero enviar los archivos de una tarea, para completar mi entrega. | 3 | Alta |
| HU11 | EP4 | RF09 | Como tallerista, quiero corregir las tareas entregadas, para dar seguimiento al desempeño. | 5 | Media |
| HU12 | EP4 | RF10 | Como tallerista, quiero poner una nota por tarea, para registrar la evaluación. | 2 | Baja |
| HU13 | EP4 | RF16 | Como tallerista, quiero eliminar material de mi taller, para retirar lo que ya no corresponde. | 2 | Baja |
| HU14 | EP4 | RF17 | Como tallerista, quiero eliminar una nota asignada, para corregir un registro erróneo. | 2 | Baja |
| HU15 | EP5 | RF11 | Como administrador, quiero un informe de asistencia por taller, para supervisar sin revisar registro por registro. | 3 | Media |
| HU16 | EP5 | RF12 | Como administrador, quiero un informe de talleres con sus talleristas, para ver la organización general. | 3 | Media |
| HU17 | EP5 | RF13 | Como administrador, quiero exportar los informes en PDF o Excel, para compartirlos fuera de la plataforma. | 5 | Media |
| HU18 | EP5 | RF19 | Como administrador, quiero un listado de alumnos, para tener un registro consolidado. | 2 | Baja |
| HU19 | EP5 | RF22 | Como administrador, quiero un informe de talleristas, para tener un registro consolidado del personal. | 2 | Baja |
| HU20 | EP6 | RF14 | Como usuario, quiero modificar mi contraseña y datos de perfil, para mantenerlos actualizados. | 2 | Media |

---

## 11. Planificación por sprints (backlog)

El trabajo se reparte en 6 sprints de 2 semanas, sin pasar de 11 puntos por sprint.

**Sprint 1 (sem. 1-2):** HU01 (8) · HU03 (3) → **11**
**Sprint 2 (sem. 3-4):** HU02 (5) · HU06 (3) · HU07 (3) → **11**
**Sprint 3 (sem. 5-6):** HU08 (3) · HU09 (2) · HU10 (3) · HU20 (2) → **10**
**Sprint 4 (sem. 7-8):** HU11 (5) · HU12 (2) · HU13 (2) · HU14 (2) → **11**
**Sprint 5 (sem. 9-10):** HU15 (3) · HU16 (3) · HU17 (5) → **11**
**Sprint 6 (sem. 11-12):** HU04 (3) · HU05 (2) · HU18 (2) · HU19 (2) → **9**

| Sprint | Semanas | Puntos | Reporte |
|---|---|---|---|
| 1 | 1-2 | 11 | R1 |
| 2 | 3-4 | 11 | R2 |
| 3 | 5-6 | 10 | R3 |
| 4 | 7-8 | 11 | R4 |
| 5 | 9-10 | 11 | R5 |
| 6 | 11-12 | 9 | R6 |
| **Total** | **12 semanas** | **63** | **6 reportes** |

---

## 12. Propuesta, costos y aprobación del cliente

**Propuesta presentada:** producto *TheNewfutures – Plataforma de gestión de talleres en convenio con INAU*; **12 semanas** (6 sprints de 2 semanas) bajo **Scrum**, con un incremento funcional al final de cada sprint. El alcance de la v1 y las exclusiones son los de las secciones 5 y 6.

**Estimación de costos** (didáctica y simplificada; un proyecto real dependería de tarifas, infraestructura, licencias y mantenimiento):

| Concepto | Detalle | Costo |
|---|---|---|
| Recursos humanos | 5 integrantes × 6 h/sem × 12 sem = 360 h, a USD 12/h (junior) | USD 4.320 |
| Hosting | Plan compartido con PHP y MySQL, USD 5/mes | USD 60 / año |
| Dominio | Registro anual `.uy` o `.com` | USD 15 / año |
| Certificado SSL | Incluido en el hosting (Let's Encrypt) | USD 0 |
| Herramientas y licencias | Git/GitHub, VS Code, XAMPP, Bootstrap, PHP, MySQL (libres) | USD 0 |
| **Total primer año** | | **USD 4.395** |
| Mantenimiento anual posterior | Hosting + dominio | **USD 75 / año** |

**Costo por punto:** USD 4.320 ÷ 63 ≈ **USD 68,6 por punto** (una historia de 3 puntos ≈ USD 206; una de 5 ≈ USD 343).

**Aprobación (ficticia) del cliente:**

> "La propuesta está dentro del presupuesto previsto. Nos parece correcto empezar por una versión inicial. Lo más importante es que los talleristas puedan registrar la asistencia y subir material sin complicaciones, y que la administración vea en todo momento qué pasa en cada taller. Entendemos que foros y notificaciones queden para más adelante. Aprobamos el proyecto con 6 ciclos de 2 semanas, y queremos participar en la revisión al final de cada ciclo."