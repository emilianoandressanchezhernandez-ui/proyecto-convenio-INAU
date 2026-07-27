# Sistema de Gestión de Talleres en Convenio con INAU - GestorTaller

<br>

## 1. Situación inicial del cliente.

**Organismo público vinculado a actividades socioeducativas (INAU) que gestiona talleres mediante convenio. Actualmente, la gestión de talleres, participantes y asistencias requiere una herramienta digital que centralice la información y mejore la coordinación entre talleristas y la administración.**

---

<br>

## 2. Necesidad presentada por el cliente

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

<br>

## 4. Información obtenida en la entrevista

| Categoría           | Información relevada                                                                    |
| ------------------- | --------------------------------------------------------------------------------------- |
| Problema principal  |  Falta sistema digital de organización y accesibilidad, al que alumnos, talleristas y   | 
|                     |  administradores puedan usar.                                                           |
| Objetivo de negocio |  Se espera alcanzar una plataforma con las funciones mencionadas, mejorando el control, |
|                     |  accesibilidad y monitoreo, para alumnos, talleristas y administradores.                |
| Plazo esperado      | Aproximadamente Finales de año.                                                         |
| Usuarios            |  Administradores, Talleristas, Alumnos                                                  |
| Seguridad           | Acceso por roles, protección de datos sensibles de los usuarios.                        |

---

<br>

## 5. Nombre propuesto del producto

**GestorTalleres - Convenio con INAU**

**Sistema de Gestión de Talleres en Convenio con INAU**

---

<br>

## 6. Visión del producto

**Desarrollar una solución web con diseño adaptativo (responsive) que centralice la gestión operativa de los talleres ejecutados en convenio con el INAU.**

**El sistema otorgará a administradores y talleristas las capacidades necesarias para la administración integral de talleres, participantes, controles de asistencia, generación de informes y comunicación interna. Asimismo, proporcionará a los alumnos acceso directo a sus talleres, tareas, información académica y foros de consulta, garantizando un entorno organizado, seguro y accesible desde diversos dispositivos.**

**Estas capacidades se incorporarán de forma incremental: la primera versión del sistema comprende las funcionalidades definidas en el alcance inicial (autenticación, gestión de usuarios y talleres, asistencia, material y tareas, informes y perfiles), mientras que la comunicación interna y los foros de consulta se desarrollarán en etapas posteriores.**

---

<br>

## 7. Alcance incluido (primera versión):

1. Sistema de autenticación con acceso diferenciado para administradores, alumnos y talleristas.
2. Gestión de usuarios, talleristas, alumnos y talleres.
3. Asignación de alumnos y talleristas a los talleres.
4. Registro, consulta y modificación de asistencias por taller y fecha.
5. Carga de material y tareas por parte del tallerista (sin especificar tipos de archivo extra, imágenes o datos adicionales).
6. Visualización de material y tareas por parte del alumno, y envío/carga de los archivos correspondientes a la tarea asignada.
7. Corrección de tareas y asignación de notas por parte del tallerista.
8. Consulta y generación de informes de asistencia y talleres.
9. Exportación de informes en formatos PDF y Excel.
10. Gestión de perfiles de usuario según el rol.
11. Plataforma web responsive accesible desde distintos dispositivos.

---

<br>

## 8. Alcance excluido (queda para etapas futuras):

1. Foros de comunicación y publicación de contenido para talleres.
2. Compatibilidad para la subida de archivos tipo PNG y MP4 (más allá del tipo básico soportado en v1).
3. Control detallado e historial de asistencia con métricas semanales, mensuales, anuales, etc.
4. Listado e historial ampliado de tareas entregadas (más allá del envío/corrección básica ya incluida en v1).
5. Sistema de notificaciones automáticas ante eventos relevantes (correcciones de tareas, faltas de asistencia, nuevas entregas).
6. Mensajería interna entre administradores y talleristas (No en tiempo real).

---

<br>

## 9. Requerimientos funcionales:

|Codigo | Requerimiento funcional
|-------|----------------------------------------------------------------------------------------------------------------------------------------------|
| RF01  | El sistema debe permitir iniciar sesión con usuario y contraseña, diferenciando el acceso según el rol (alumno, tallerista, administrador).  |
| RF02  | El sistema debe permitir al administrador gestionar usuarios (alumnos y talleristas) y talleres: crear, modificar, eliminar y consultar.     |
| RF03  | El sistema debe permitir al administrador asignar alumnos y talleristas a los talleres correspondientes.                                     |
| RF04  | El sistema debe permitir al tallerista registrar la asistencia de los alumnos de su taller, indicando fecha.                                 |
| RF05  | El sistema debe permitir consultar y modificar la asistencia registrada por taller y fecha.                                                  |
| RF06 	| El sistema debe permitir al tallerista subir material y tareas asociados a su taller.                                                        |
| RF07  | El sistema debe permitir al alumno visualizar el material y las tareas de su taller.                                                         |
| RF08  | El sistema debe permitir al alumno enviar/subir los archivos correspondientes a una tarea asignada.                                          |
| RF09  | El sistema debe permitir al tallerista corregir las tareas enviadas por los alumnos.                                                         |
| RF10  | El sistema debe permitir al tallerista asignar una nota a cada alumno por tarea.                                                             |
| RF11  | El sistema debe permitir generar informes de asistencia por taller.                                                                          |
| RF12  | El sistema debe permitir generar informes de talleres con sus talleristas asignados.                                                         |
| RF13  | El sistema debe permitir exportar los informes generados en formato PDF o Excel.                                                             |
| RF14  | El sistema debe permitir a cada usuario gestionar su perfil según su rol (modificar contraseña y datos personales).                          |
| RF15  | El sistema debe permitir al alumno eliminar ciertos datos de su perfil (foto, biografía).                                                    |

---

<br>

## 10. Requerimientos no funcionales:

|Codigo | Requerimiento funcional
|-------|--------------------------------------------------------------------------------------------------------------------------|
| NRF01 | El sistema debe presentar un diseño responsive, adaptándose a computadora, tablet y teléfono.                            |
| NRF02 | El sistema debe estar disponible las 24 horas del día una vez desplegado.                                                |
| NRF03 | El sistema debe responder con rapidez en las operaciones habituales.                                                     |
| NRF04 | El sistema debe presentar una navegación clara y consistente para el usuario.                                            |
| NRF05 | El sistema debe validar los formularios tanto en el frontend como en el backend.                                         |
| NRF06 | El sistema debe mantener una arquitectura separada entre frontend y backend.                                             |
| NRF07 | El sistema debe controlar el acceso a las funcionalidades según el rol del usuario.                                      |
| NRF08 | El sistema debe proteger los datos personales de los usuarios.                                                           |
| NRF09 | El sistema debe garantizar la persistencia confiable de los datos en una base de datos relacional.                       |
| NRF10 | El sistema debe registrar la trazabilidad de las acciones importantes realizadas por los usuarios.                       |
| NRF11 | El sistema debe restringir los formatos de archivos adjuntos a PDF e imágenes JPG, acorde a los tipos soportados en v1.  |
| NRF12 | El sistema debe restringir el tamaño de los archivos adjuntos permitidos.                                                |
| NRF13 | El código del sistema debe estar organizado, ser reutilizable y mantenible.	                                             |
| NRF14 | El sistema debe contar con documentación técnica dentro del repositorio.                                                 |
| NRF15 | El equipo debe utilizar Git para registrar y revisar los cambios del código.                                             |

---

<br>

## 11. Epicas

| Código | Épica                             | Descripcióm                                                                            |
| ------ | --------------------------------- | -------------------------------------------------------------------------------------- |
| EP1    | Autenticación y control de acceso | Permitir el ingreso seguro y diferenciado a la plataforma según el rol del usuario.    |
| EP2    | Gestión de usuarios y talleres    | Administrar los usuarios (alumnos, talleristas) y su relación con los talleres.        |
| EP3    | Gestión de asistencia             | Registrar y controlar la asistencia de los alumnos a los talleres.                     |
| EP4    | Gestión de material y tareas      | Permitir la carga, entrega y corrección de material y tareas de cada taller.           |
| EP5    | Reportes e informes               | Generar y exportar información consolidada de asistencia, talleres y trazabilidad.     |
| EP6    | Gestión de perfil de usuario      | Permitir a cada usuario administrar su propia información personal.                    |