# Plan de Negocios
## TheNewfutures – Sistema de Gestión de Talleres en Convenio con INAU
**Asignatura:** Emprendedurismo  
**Equipo:** Emiliano Sánchez, Gabriel Rendon y Thiago Ferragut  
**Proyecto:** 3.º BT Informática 2026


## 1. Resumen ejecutivo

**Nombre del negocio/producto:** TheNewfutures – Sistema de Gestión de Talleres en Convenio con INAU.

**Idea de negocio:** Desarrollar una plataforma web adaptable a computadoras, tablets y teléfonos que centralice la gestión de talleres socioeducativos en convenio con INAU. El sistema contempla funciones diferenciadas para administradores, talleristas y alumnos: administración de talleres y usuarios, registro de asistencia, publicación de material y tareas, corrección de entregas, calificaciones e informes.

**Propuesta de valor:** Resolver la falta de centralización, accesibilidad y organización de la información de los talleres mediante una plataforma web con accesos diferenciados por rol. El beneficio propuesto es reunir en un único sistema los procesos que el proyecto identificó como necesarios, permitiendo consultar y gestionar la información desde distintos dispositivos.

**Misión del producto:** Centralizar y organizar la gestión de los talleres en convenio con INAU, facilitando el acceso a la información y las tareas de administradores, talleristas y alumnos.

**Visión del producto:** Desarrollar una plataforma web responsive que permita a administradores y talleristas gestionar talleres, participantes, asistencias e informes de forma organizada, segura y accesible desde distintos dispositivos. La comunicación interna y los foros quedan previstos para etapas posteriores.

**Misión de la empresa:** Ofrecer software a medida, dando un espacio amigable, ordenado, seguro y accesible. Brindamos seguridad absoluta, fiabilidad y control total sobre los datos del programa, adaptandonos constantemente a los cambios deseados por el cliente.

**Visión de la empresa:** Ser la mejor empresa en creación, mantenimiento y modificación de softwares, webs, aplicaciones y espacios de trabajo, llegando a negociar con empresas de alcance mundial, haciendonos reconocidos por nuestras excelentes prácticas y servicios.

**Oportunidad de negocio:** La oportunidad parte de una necesidad reconocida en la entrevista del proyecto: contar con un espacio unificado donde se pueda consultar y gestionar información de talleres, alumnos, asistencias, tareas e informes. (El proyecto no incluye una validación comercial, ventas ni contratos que permitan afirmar que el servicio está comercializado.)

**Equipo emprendedor:** Emiliano Sánchez: líder del equipo y Scrum Master. Gabriel Rendon: subcoordinador, con tareas de documentación, modelado y apoyo al backend. Thiago Ferragut: desarrollo de backend y participación en tareas de integración.


## 2. Descripción del negocio

**Nombre de la empresa/producto:** TheNewfutures – Sistema de Gestión de Talleres en Convenio con INAU.

**Tipo de empresa:** Emprendimiento tecnológico orientado al desarrollo de software y soluciones web.

**Sector:** Tecnologías de la información y desarrollo de aplicaciones web para la gestión socioeducativa.

**Productos o servicios:** La solución prevista es una plataforma web para la gestión de talleres, usuarios, alumnos, talleristas y asignaciones; registro, consulta y modificación de asistencias; publicación y modificación de material y tareas; entrega y corrección de tareas con calificaciones; gestión de perfiles; y generación de listados e informes, con exportación a PDF o Excel.

El alcance inicial excluye los foros, la mensajería interna, las notificaciones automáticas y el análisis avanzado del historial de asistencia. Esas funciones se encuentran previstas para etapas futuras o fuera de la primera versión.


### Análisis FODA

| Factor | Análisis |
| --- | --- |
| Fortalezas | La necesidad del proyecto se relevó mediante una entrevista. La solución define tres roles y funciones para organizar talleres, asistencias, materiales, tareas e informes. Se documentaron los requerimientos, la arquitectura, la identidad visual y la estructura del sistema. |
| Oportunidades | Existe una necesidad concreta identificada en la gestión de talleres en convenio con INAU. El diseño responsive busca permitir el acceso desde computadoras, tablets y teléfonos. La centralización de varios procesos en una plataforma es el beneficio principal planteado. |
| Debilidades | La solución no presenta seguridad absoluta, el proyecto tiene detalles a corregir, funcionalidades excluidas. |
| Amenazas | La competencia son los proyectos de los compañeros de clase (caso hipotético al ser un proyecto academico y no profesional). Además, identificamos riesgos por tiempo insuficiente, dificultades de integración, cambios en los requerimientos y problemas de coordinación o disponibilidad del equipo. |

**Competencia y diferenciación:** La competencia son los otros proyectos de los compañeros de clase. Como no se proporcionaron sus descripciones, no corresponde atribuirles características ni afirmar que TheNewfutures sea objetivamente superior. La diferenciación que sí puede fundamentarse es su enfoque específico en talleres en convenio con INAU y la centralización de usuarios, talleres, asistencias, material, tareas, calificaciones e informes con accesos según el rol.


## 3. Plan de producción y operaciones


### Proceso de producción o prestación del servicio

| Etapa | Descripción y estado documentado |
| --- | --- |
| 1. Relevamiento | Se identificó la necesidad mediante una entrevista y se documentaron los roles, problemas, requerimientos y alcance de la primera versión. |
| 2. Diseño | Se definieron las interfaces por rol, la identidad visual, la arquitectura tecnológica y el modelo de datos relacional. |
| 3. Desarrollo del frontend | Se utilizan HTML5, CSS3, Bootstrap 5.3 y JavaScript. Los paneles de administrador y tallerista cuentan con interfaces y comportamiento basado en datos simulados; el panel del alumno sigue pendiente de completar. |
| 4. Desarrollo del backend | El proyecto cuenta con una API REST en PHP y un modelo de datos MySQL. La revisión de coherencia del 22/09/2026 registra 47 rutas implementadas. |
| 5. Integración y pruebas | La integración de frontend y backend fue realizada. Las pruebas/testing indican errores menores a corregir. |
| 6. Despliegue | El repositorio contiene documentación de una alternativa de despliegue con servidor, Docker, Nginx y HTTPS. |


### Tecnología y equipamiento

Las tecnologías y herramientas son HTML5, CSS3, Bootstrap 5.3, Bootstrap Icons, JavaScript sin framework, PHP para la API REST, MySQL, Git y GitHub, Visual Studio Code, XAMPP/servidor local para desarrollo y infraestructura con Docker. No se especifica un inventario de equipos físicos ni se confirma un contrato de hosting.


### Materias primas y suministros

Por tratarse de una solución de software, la producción se basa en el trabajo de análisis, diseño, programación, pruebas y documentación, junto con las herramientas informáticas descritas. No existieron proveedores comerciales, compras de materiales físicos ni cotizaciones; por lo tanto, no se agregan nombres ni costos.


### Logística y distribución

La distribución prevista es digital: una vez desplegada, la plataforma se utilizaría a través de un navegador web, con funciones disponibles de acuerdo con el rol de cada usuario. La guía de servidor describe una modalidad de publicación mediante Docker, Nginx y HTTPS, pero el despliegue productivo no está confirmado en las fuentes consultadas.


### Infraestructura

El proyecto contempla desarrollo en un entorno local y documenta una propuesta de servidor para el despliegue. No se especifican local comercial, oficina propia, ubicación física de la empresa ni proveedor de alojamiento contratado.


## 4. Plan de recursos humanos y organización


### Estructura organizacional

| Integrante | Cargo / responsabilidad |
| --- | --- |
| Emiliano Sánchez | Líder del equipo / Scrum Master. Apoya tareas de frontend, backend, base de datos y prepara documentación de ciberseguridad. |
| Gabriel Rendon | Subcoordinador. Responsable de documentación, diagramas UML/MER y participación en el backend. |
| Thiago Ferragut | Desarrollador frontend y backend; las actas le asignan tareas de frontend, base de datos y conexión entre frontend y backend. |


### Reclutamiento y selección

El reclutamiento fue por órden de profesores. No hubo un proceso de reclutamiento ni un plan de contratación de personal adicional.


### Remuneraciones y beneficios

USD 4.395 el primer año (recursos humanos e infraestructura), con un costo de mantenimiento posterior de USD 75 anuales correspondiente a hosting y dominio.


### Aspectos legales y normativos

Identificamo a INAU como cliente/patrocinador del proyecto. La documentación exige proteger los datos personales, controlar el acceso según el rol y limitar las acciones de cada usuario. No se especifican forma jurídica de una empresa, inscripción comercial, permisos, licencias ni contratos de comercialización.


## 5. Anexos

Los siguientes documentos del repositorio respaldan la descripción del problema, el alcance, las tecnologías y el estado del proyecto:

- [README del repositorio: descripción general, integrantes, tecnologías y estado declarado.](https://github.com/emilianoandressanchezhernandez-ui/proyecto-convenio-INAU/blob/main/README.md)
- [Documento principal del proyecto: entrevista, necesidad, visión y alcance.](https://github.com/emilianoandressanchezhernandez-ui/proyecto-convenio-INAU/blob/main/docs/02-analisis/Doc.md)
- [Requerimientos funcionales y no funcionales.](https://github.com/emilianoandressanchezhernandez-ui/proyecto-convenio-INAU/blob/main/docs/02-analisis/requerimientos.md)
- [Charter: cliente/patrocinador, equipo, visión, alcance y riesgos.](https://github.com/emilianoandressanchezhernandez-ui/proyecto-convenio-INAU/blob/main/docs/01-gestion/Charter.md)
- [Acta de reuniones: acuerdos y asignación de tareas.](https://github.com/emilianoandressanchezhernandez-ui/proyecto-convenio-INAU/blob/main/docs/01-gestion/Acta%20de%20Reuniones.md)
- [Justificación tecnológica y arquitectura.](https://github.com/emilianoandressanchezhernandez-ui/proyecto-convenio-INAU/blob/main/docs/03-dise%C3%B1o/Justificacion%20Tecnologica.md)
- [Identidad visual.](https://github.com/emilianoandressanchezhernandez-ui/proyecto-convenio-INAU/blob/main/docs/03-dise%C3%B1o/Identidad%20Visual.md)
- [Revisión de coherencia del repositorio del 22/09/2026.](https://github.com/emilianoandressanchezhernandez-ui/proyecto-convenio-INAU/blob/main/docs/01-gestion/Revision_Coherencia_INAU.md)