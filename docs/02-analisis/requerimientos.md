# Proyecto Sistema de Gestión de Talleres en Convenio con INAU - Requerimientos 

<br>

## Alcance incluido (primera versión):

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

## Alcance excluido (queda para etapas futuras):

1. Foros de comunicación y publicación de contenido para talleres.
2. Compatibilidad para la subida de archivos tipo PNG y MP4 (más allá del tipo básico soportado en v1).
3. Control detallado e historial de asistencia con métricas semanales, mensuales, anuales, etc.
4. Listado e historial ampliado de tareas entregadas (más allá del envío/corrección básica ya incluida en v1).
5. Sistema de notificaciones automáticas ante eventos relevantes (correcciones de tareas, faltas de asistencia, nuevas entregas).
6. Mensajería interna entre administradores y talleristas (No en tiempo real).
7. Comunicación asincrónica del tallerista con los alumnos de su taller.

---

<br>

## Requerimientos funcionales:


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


## Requerimientos no funcionales:

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