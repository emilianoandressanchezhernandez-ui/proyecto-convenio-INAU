# Plan de Negocios

<br>

## TheNewfutures – Sistema de Gestión de Talleres en Convenio con INAU
**Asignatura:** Emprendedurismo  
**Equipo:** Emiliano Sánchez, Gabriel Rendon y Thiago Ferragut  
**Proyecto:** 3.º BT Informática 2026

<br>

## 1. Resumen ejecutivo

**Nombre del negocio/producto:** TheNewfutures – Sistema de Gestión de Talleres en Convenio con INAU.

**Idea de negocio:** desarrollar una plataforma web adaptable a computadoras, tablets y teléfonos que centralice la gestión de los talleres socioeducativos en convenio con INAU. El sistema contempla funciones diferenciadas para administradores, talleristas y alumnos: administración de talleres y usuarios, registro de asistencia, publicación de material y tareas, corrección de entregas, calificaciones e informes.

**Propuesta de valor:** resolver la falta de centralización, accesibilidad y organización de la información de los talleres mediante una plataforma web con accesos diferenciados por rol. El beneficio propuesto consiste en reunir en un único sistema los procesos que el proyecto identificó como necesarios, de modo que la información pueda consultarse y gestionarse desde distintos dispositivos.

**Misión del producto:** centralizar y organizar la gestión de los talleres en convenio con INAU, facilitando el acceso a la información y a las tareas de administradores, talleristas y alumnos.

**Visión del producto:** disponer de una plataforma web responsive que permita a administradores y talleristas gestionar talleres, participantes, asistencias e informes de forma organizada, segura y accesible desde distintos dispositivos. La comunicación interna y los foros quedan previstos para etapas posteriores.

**Misión de la empresa:** ofrecer software a medida que brinde un espacio amigable, ordenado, seguro y accesible, con fiabilidad y control total sobre los datos, adaptándose de forma constante a los cambios requeridos por el cliente.

**Visión de la empresa:** consolidarse como una empresa de referencia en la creación, el mantenimiento y la modificación de software, sitios web, aplicaciones y espacios de trabajo, con capacidad para negociar con empresas de alcance internacional y ser reconocida por la calidad de sus prácticas y servicios.

**Oportunidad de negocio:** la oportunidad parte de una necesidad reconocida en la entrevista del proyecto: contar con un espacio unificado donde se pueda consultar y gestionar la información de talleres, alumnos, asistencias, tareas e informes. El proyecto no incluye una validación comercial, ventas ni contratos que permitan afirmar que el servicio está comercializado.

**Equipo emprendedor:** Emiliano Sánchez, líder del equipo y Scrum Master; Gabriel Rendon, subcoordinador, con tareas de documentación, modelado y apoyo al backend; y Thiago Ferragut, a cargo del desarrollo del frontend y del backend y de las tareas de integración.

<br>

## 2. Descripción del negocio

**Nombre de la empresa/producto:** TheNewfutures – Sistema de Gestión de Talleres en Convenio con INAU.

**Tipo de empresa:** emprendimiento tecnológico orientado al desarrollo de software y de soluciones web.

**Sector:** tecnologías de la información y desarrollo de aplicaciones web para la gestión socioeducativa.

**Productos o servicios:** la solución prevista es una plataforma web para la gestión de talleres, usuarios, alumnos, talleristas y asignaciones; el registro, la consulta y la modificación de asistencias; la publicación y la modificación de material y tareas; la entrega y la corrección de tareas con calificaciones; la gestión de perfiles, y la generación de listados e informes, con exportación a PDF o Excel.

El alcance inicial excluye los foros, la mensajería interna, las notificaciones automáticas y el análisis avanzado del historial de asistencia. Estas funciones se prevén para etapas futuras.


### Análisis FODA

| Factor | Análisis |
| --- | --- |
| Fortalezas | La necesidad del proyecto se relevó mediante una entrevista. La solución define tres roles y las funciones necesarias para organizar talleres, asistencias, materiales, tareas e informes. Se documentaron los requerimientos, la arquitectura, la identidad visual y la estructura del sistema. |
| Oportunidades | Existe una necesidad concreta en la gestión de los talleres en convenio con INAU. El diseño responsive permite el acceso desde computadoras, tablets y teléfonos. La centralización de varios procesos en una única plataforma constituye el principal beneficio planteado. |
| Debilidades | La solución no garantiza una seguridad absoluta, quedan defectos por corregir y algunas funciones quedaron excluidas de la primera versión. |
| Amenazas | La competencia está constituida por los proyectos de los compañeros de clase, planteada como un supuesto dado el carácter académico del proyecto. Se identifican, además, riesgos de tiempo insuficiente, dificultades de integración, cambios en los requerimientos y problemas de coordinación o de disponibilidad del equipo. |

**Competencia y diferenciación:** la competencia está constituida por los demás proyectos de los compañeros de clase. Dado que no se dispone de sus descripciones, no corresponde atribuirles características ni afirmar que TheNewfutures sea objetivamente superior. La diferenciación que sí puede fundamentarse es su enfoque específico en los talleres en convenio con INAU y la centralización de usuarios, talleres, asistencias, material, tareas, calificaciones e informes, con accesos según el rol.

<br>

## 3. Plan de producción y operaciones


### Proceso de producción o prestación del servicio

| Etapa | Descripción y estado documentado |
| --- | --- |
| 1. Relevamiento | Se identificó la necesidad mediante una entrevista y se documentaron los roles, los problemas, los requerimientos y el alcance de la primera versión. |
| 2. Diseño | Se definieron las interfaces por rol, la identidad visual, la arquitectura tecnológica y el modelo de datos relacional. |
| 3. Desarrollo del frontend | Se utilizan HTML5, CSS3, Bootstrap 5.3 y JavaScript. Los tres paneles (administrador, tallerista y alumno) están desarrollados y conectados a la API. |
| 4. Desarrollo del backend | El proyecto cuenta con una API REST en PHP de 55 rutas, organizada en capas, con autenticación JWT y control de acceso por rol, y con una base de datos MySQL. |
| 5. Integración y pruebas | La integración del frontend y el backend fue realizada. Se ejecutaron dos rondas de pruebas en un servidor de prueba (24 y 26/10/2026): la mayoría de los requerimientos de la primera versión se cumplen, y quedan pendientes la exportación de informes en PDF o Excel, el listado de alumnos, el informe de talleristas y la consulta de datos sensibles. |
| 6. Despliegue | El sistema se desplegó en un servidor de prueba (Ubuntu Server en una máquina virtual) con Docker y Nginx, siguiendo la guía del repositorio. El uso de HTTPS está documentado, pero no se aplicó en el servidor de prueba. |


### Tecnología y equipamiento

Las tecnologías y herramientas utilizadas son HTML5, CSS3, Bootstrap 5.3, Bootstrap Icons, JavaScript sin framework, PHP para la API REST, MySQL, Git y GitHub, Visual Studio Code y Docker para los entornos de desarrollo y de prueba. No se especifica un inventario de equipos físicos ni se confirma un contrato de alojamiento.


### Materias primas y suministros

Por tratarse de una solución de software, la producción se basa en el trabajo de análisis, diseño, programación, pruebas y documentación, junto con las herramientas informáticas descritas. No existieron proveedores comerciales, compras de materiales físicos ni cotizaciones; por lo tanto, no se incluyen nombres ni costos.


### Logística y distribución

La distribución prevista es digital: una vez desplegada, la plataforma se utilizaría a través de un navegador web, con funciones disponibles de acuerdo con el rol de cada usuario. La guía de servidor describe una modalidad de publicación mediante Docker, Nginx y HTTPS, pero el despliegue en producción no está confirmado.


### Infraestructura

El proyecto se desarrolla en un entorno local y se desplegó en un servidor de prueba (máquina virtual con Ubuntu Server). No se especifican local comercial, oficina propia, ubicación física de la empresa ni proveedor de alojamiento contratado.

<br>

## 4. Plan de recursos humanos y organización


### Estructura organizacional

| Integrante | Cargo / responsabilidad |
| --- | --- |
| Emiliano Sánchez | Líder del equipo y Scrum Master. Apoya las tareas de frontend, backend y base de datos, y elabora la documentación de ciberseguridad. |
| Gabriel Rendon | Subcoordinador. Responsable de la documentación y de los diagramas UML y MER, con participación en el backend. |
| Thiago Ferragut | Desarrollador frontend y backend. Las actas le asignan tareas de frontend, base de datos y conexión entre el frontend y el backend. |


### Reclutamiento y selección

El equipo fue conformado por asignación de los profesores. No se realizó un proceso de reclutamiento ni se prevé la contratación de personal adicional.


### Remuneraciones y beneficios

El costo estimado del primer año es de USD 2.667 (recursos humanos e infraestructura), con un costo de mantenimiento posterior de USD 75 anuales, correspondiente al alojamiento y al dominio.


### Aspectos legales y normativos

Se identifica a INAU como cliente y patrocinador del proyecto. La documentación exige proteger los datos personales, controlar el acceso según el rol y limitar las acciones de cada usuario; la protección de los datos personales debe ajustarse a la Ley N.º 18.331 de Protección de Datos Personales. No se especifican la forma jurídica de la empresa, la inscripción comercial, los permisos, las licencias ni los contratos de comercialización.

<br>

## 5. Anexos

Los siguientes documentos del repositorio respaldan la descripción del problema, el alcance, las tecnologías y el estado del proyecto:

- [README del repositorio: descripción general, integrantes, tecnologías y estado declarado.](https://github.com/emilianoandressanchezhernandez-ui/proyecto-convenio-INAU/blob/main/README.md)
- [Documento principal del proyecto: entrevista, necesidad, visión y alcance.](https://github.com/emilianoandressanchezhernandez-ui/proyecto-convenio-INAU/blob/main/docs/02-analisis/Doc.md)
- [Requerimientos funcionales y no funcionales.](https://github.com/emilianoandressanchezhernandez-ui/proyecto-convenio-INAU/blob/main/docs/02-analisis/requerimientos.md)
- [Charter: cliente/patrocinador, equipo, visión, alcance y riesgos.](https://github.com/emilianoandressanchezhernandez-ui/proyecto-convenio-INAU/blob/main/docs/01-gestion/Charter.md)
- [Acta de reuniones: acuerdos y asignación de tareas.](https://github.com/emilianoandressanchezhernandez-ui/proyecto-convenio-INAU/blob/main/docs/01-gestion/Documentos%20del%20equipo/Acta%20de%20Reuniones.md)
- [Justificación tecnológica y arquitectura.](https://github.com/emilianoandressanchezhernandez-ui/proyecto-convenio-INAU/blob/main/docs/03-dise%C3%B1o/Justificacion%20Tecnologica.md)
- [Identidad visual.](https://github.com/emilianoandressanchezhernandez-ui/proyecto-convenio-INAU/blob/main/docs/03-dise%C3%B1o/Identidad%20Visual.md)
- [Revisión de coherencia del repositorio.](https://github.com/emilianoandressanchezhernandez-ui/proyecto-convenio-INAU/blob/main/docs/01-gestion/Revision_Coherencia_INAU.md)
- [Registros de pruebas del sistema (Testing-01 y Testing-02).](https://github.com/emilianoandressanchezhernandez-ui/proyecto-convenio-INAU/tree/main/docs/04-implementacion/Testing)