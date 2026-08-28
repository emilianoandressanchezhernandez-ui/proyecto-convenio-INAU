
## Alcance incluido (primera versión):

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

## Alcance excluido (queda para etapas futuras):

1. Foros de comunicación y publicación de contenido para talleres.
2. Compatibilidad para la subida de archivos tipo PNG y MP4 (más allá del tipo básico soportado en v1).
3. Control detallado e historial de asistencia con métricas semanales, mensuales, anuales, etc.
4. Listado e historial ampliado de tareas entregadas (más allá del envío/corrección básica ya incluida en v1).
5. Sistema de notificaciones automáticas ante eventos relevantes (correcciones de tareas, faltas de asistencia, nuevas entregas).
6. Mensajería interna entre administradores y talleristas (No en tiempo real).

---

<br>

## Requerimientos funcionales:

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



<br>

## Requerimientos no funcionales:

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
| NRF13 | El código del sistema debe estar organizado, ser reutilizable y mantenible.	                                           |
| NRF14 | El sistema debe contar con documentación técnica dentro del repositorio.                                                 |
| NRF15 | El equipo debe utilizar Git para registrar y revisar los cambios del código.                                             |
