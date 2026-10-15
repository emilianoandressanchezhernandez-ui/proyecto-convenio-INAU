# Sistema de Gestión de Talleres en Convenio con INAU — TheNewfutures

<br>

## Participantes de la entrevista

| Rol | Participante | Responsabilidad |
| --- | --- | --- |
| Usuario experto | Lemuel Szwec González, tallerista | Explica el proceso operativo actual y las necesidades del rol tallerista dentro de la plataforma. |
| Equipo de desarrollo | Emiliano Sánchez, líder de equipo | Relevar necesidades y transformar la información en backlog. |

<br>

## Entrevista al cliente — Reconstrucción aproximada

> **Nota sobre este documento.** Lo que sigue es una **reconstrucción aproximada** de la entrevista de relevamiento, armada a partir de las notas tomadas durante la reunión (ver "Anotaciones originales de la entrevista", más abajo en este mismo documento). **No es una transcripción literal:** reordena en forma de diálogo lo que quedó registrado en esas notas. Donde la entrevista no definió algo, así se deja constancia; no se agrega información que no se haya relevado. El diálogo se da entre los participantes ya listados: Emiliano Sánchez (entrevistador) y Lemuel Szwec González (experto consultado).

---

### 1. Roles y usuarios

**Entrevistador:** ¿Qué roles van a existir dentro de la plataforma, y qué puede hacer cada uno?

**Lemuel:** Son tres: alumno, tallerista y administrador.

- El **alumno** entra a ver el material, las tareas y la información de sus talleres, además de sus notas y sus datos personales. Puede enviar los archivos de sus entregas, cambiar su contraseña y editar algunas cosas de su perfil, como la foto o la biografía. Lo que no puede es modificar una entrega una vez que la mandó.
- El **tallerista** ve solo lo de su propio taller: el material, las tareas, la lista de alumnos inscritos, las asistencias y ciertos datos del estudiante. Publica material, asigna y corrige tareas, pone las notas, registra la asistencia y manda informes a la administración. También puede ajustar o borrar material, calificaciones y registros de asistencia de su taller.
- El **administrador** ve todo y supervisa que la plataforma se use bien. Puede crear, modificar, eliminar y consultar cualquier información, con una excepción: no toca directamente datos personales como el número de cédula.

### 2. Talleres

**Entrevistador:** ¿Cómo se organiza un taller? ¿Un tallerista puede tener varios talleres, o un taller varios talleristas?

**Lemuel:** Cada taller tiene su material, sus tareas, su lista de alumnos y su registro de asistencia, y el tallerista trabaja únicamente sobre el suyo. La relación exacta entre talleristas y talleres —si uno puede estar a cargo de varios, o un taller tener más de un tallerista— no la cerramos en la reunión; queda para definir con el equipo.

### 3. Participantes

**Entrevistador:** ¿Cómo se identifica a cada alumno dentro del sistema? ¿Se inscribe a un taller o a varios?

**Lemuel:** El alumno accede a "sus talleres", en plural, así que la idea es que pueda estar en más de uno. La forma exacta de identificarlo dentro del sistema no la detallamos en la entrevista.

### 4. Asistencia

**Entrevistador:** ¿Cómo se registra hoy la asistencia? ¿Por clase, por día, por taller?

**Lemuel:** El tallerista pasa lista en su taller, indicando la fecha, y después puede consultar o corregir lo que cargó. Lo básico es eso: registrar quién asistió en cada jornada. Un control más fino —historial con métricas semanales, mensuales o anuales— sería deseable, pero lo vemos como algo para más adelante, no para la primera versión.

### 5. Material y tareas

**Entrevistador:** ¿Qué tipo de contenido suben los talleristas? ¿Cómo entregan los alumnos sus tareas?

**Lemuel:** El tallerista sube material de estudio y asigna tareas. Para empezar no nos pusimos a definir restricciones finas de formatos o tamaños; eso lo iremos ajustando. El alumno, por su lado, entra, ve lo que hay y sube el archivo de su entrega. Más adelante estaría bueno soportar varios formatos —PDF, imágenes, video—, pero no es imprescindible en el arranque.

### 6. Foros

**Entrevistador:** ¿Qué esperan de un foro? ¿Es por taller, general, o incluye a las familias?

**Lemuel:** Lo pensamos por taller: un espacio donde publicar imágenes y novedades que puedan ver los usuarios y también sus familias. De todos modos, lo tenemos como una funcionalidad deseable para una etapa futura, no para la primera versión.

### 7. Usuarios técnicos

**Entrevistador:** ¿Quiénes van a usar el sistema en el día a día? ¿Solo talleristas y administración, u otro personal también?

**Lemuel:** En el día a día son los tres roles: administradores, talleristas y alumnos. Si hubiera otro personal involucrado, no lo definimos en la reunión.

### 8. Infraestructura

**Entrevistador:** ¿Desde qué dispositivos se va a acceder? ¿Hay conectividad estable donde se dictan los talleres?

**Lemuel:** Lo importante es que se pueda usar desde cualquier dispositivo —computadora, tablet o teléfono—, así que tiene que adaptarse a la pantalla. Los detalles de infraestructura y de conectividad en los lugares donde se dictan los talleres no los relevamos en esta entrevista.

### 9. Seguridad y datos

**Entrevistador:** ¿Qué datos personales de alumnos y talleristas se manejan? ¿Cuáles consideran sensibles?

**Lemuel:** Se manejan los datos de las cuentas —usuarios y contraseñas—, los datos de contacto de los talleristas y la información personal de cada usuario, incluida la cédula. Esos datos personales son sensibles y hay que protegerlos: el acceso tiene que ser por rol, y el administrador tiene que poder consultar qué datos sensibles se están usando. No fijamos un nivel de seguridad específico, pero sí dejamos claro que la protección de los datos es obligatoria.

### 10. Plazo

**Entrevistador:** ¿Cuándo necesitan tener una primera versión funcionando?

**Lemuel:** Para finales de año. Vamos a dar por válido el sistema cuando funcione en la operativa del día a día y cumpla con lo que pedimos.

### Visión general que dejó la entrevista

**Entrevistador:** En una frase, ¿a qué les gustaría que se pareciera el sistema?

**Lemuel:** A algo tipo la plataforma Crea: que el alumno entre a sus talleres, tareas e información; que el tallerista publique material, evalúe, lleve la asistencia y se comunique; y que la administración tenga una visión completa de todo lo que pasa. Hoy el proceso falla justamente en eso: en que la información esté accesible, disponible y ordenada en un solo lugar.

> **Temas que quedaron sin definir en la entrevista** (registrados como pendientes): la metodología con la que se realizan hoy las tareas, la relación exacta tallerista–taller, la forma de identificar al alumno, los detalles de infraestructura y conectividad, el riesgo operativo, las reglas de negocio y las restricciones legales.

---

<br>

## Anotaciones originales de la entrevista

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