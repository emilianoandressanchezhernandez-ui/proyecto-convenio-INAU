# Análisis del Modelo

<br>

## Sistema de Gestión de Talleres en Convenio con INAU

Este documento analiza cómo el modelo definido en *Modelo de Clases UML* resuelve la operativa real del sistema, y documenta la trazabilidad entre las decisiones de diseño y los requerimientos que las originaron.

<br>

## 1. Análisis paso a paso del circuito operativo

A continuación se recorre el circuito de trabajo descrito por el cliente en la entrevista, mostrando cómo cada paso se apoya en la estructura definida. El objetivo es verificar que el modelo soporta la operativa completa sin requerir elementos adicionales.

<br>

### Paso 1 — Alta de talleres y usuarios (EP2)

El administrador crea los talleres mediante `Administrador.crearTaller()` (RF02) y define sus franjas horarias, que se almacenan como instancias de `Horario`. La multiplicidad **1..\*** de esta composición obliga a definir al menos un horario: un taller sin día ni hora asignados no podría dictarse.

En paralelo, el administrador da de alta a talleristas y alumnos mediante `crearUsuario()`. Los talleristas se registran directamente como `Usuario` con rol `tallerista`, mientras que los alumnos se registran primero como ficha (`Alumno`) y solo después, si corresponde, reciben una cuenta de acceso.

**Por qué importa para lo que sigue:** el `estado` del taller (activo o finalizado) es lo que determina si aparece en los listados de los pasos posteriores, y la existencia de la ficha del alumno es condición previa para poder inscribirlo.

**Decisión que se pone a prueba:** la asociación **0..1 ←→ 0..1** entre `Usuario` y `Alumno` permite que este paso funcione aunque el alumno todavía no tenga credenciales. Si el modelo hubiera usado herencia, dar de alta un alumno exigiría generarle cuenta en el mismo acto, incluso para quienes nunca vayan a ingresar al sistema.

<br>

### Paso 2 — Asignación de alumnos y talleristas (EP2)

El administrador vincula participantes al taller mediante `asignarAlumnoATaller()` y `asignarTalleristaATaller()` (RF03). Cada llamada genera una instancia de `Inscripcion` o `AsignacionTallerista` respectivamente, registrando además la fecha en que se produjo el vínculo.

Las restricciones de unicidad sobre ambas clases asociativas impiden inscribir dos veces al mismo alumno en el mismo taller o asignar dos veces al mismo tallerista.

**Por qué importa para lo que sigue:** `Inscripcion` es la fuente que consulta el paso 3 para saber qué alumnos deben figurar en la lista de asistencia, y el paso 5 para determinar a qué contenidos accede cada alumno. `AsignacionTallerista` es la que delimita qué talleres puede gestionar cada tallerista.

**Decisión que se pone a prueba:** la multiplicidad **1..\*** entre `Taller` y `Tallerista` obliga a que todo taller tenga al menos un responsable antes de operar, y la relación muchos a muchos permite que un taller sea dictado por varios talleristas, situación que el diseño inicial de la base de datos no contemplaba.

<br>

### Paso 3 — Registro de asistencia (EP3)

El tallerista abre la pantalla de asistencia y ejecuta `registrarAsistencia()` (RF04), lo que crea una instancia de `Asistencia` para la combinación de taller y fecha seleccionada. El sistema recupera los alumnos inscritos mediante `Taller.obtenerAlumnos()` y, por cada uno, se genera un `RegistroAsistencia` con su estado.

Antes de permitir el guardado, `Asistencia.estaCompleta()` verifica que todos los alumnos inscritos tengan un estado asignado. Si el tallerista debe corregir un registro posteriormente, `modificarRegistro()` localiza el registro existente y actualiza su estado en lugar de crear uno nuevo (RF05).

**Por qué importa para lo que sigue:** los registros de asistencia son la materia prima del informe del paso 7. La restricción de unicidad sobre la combinación de taller y fecha garantiza que ese informe no encuentre jornadas duplicadas.

**Decisión que se pone a prueba:** la separación entre `Asistencia` y `RegistroAsistencia` se justifica en este paso. Si ambas fueran una sola clase, la fecha se repetiría en cada uno de los registros de la jornada, y nada impediría que un mismo día quedara guardado con fechas distintas según el alumno. La estructura de cabecera y detalle mantiene la fecha en un único lugar.

<br>

### Paso 4 — Publicación de material y tareas (EP4)

El tallerista publica contenidos mediante `subirMaterial()` o `crearTarea()` (RF06). Ambos métodos generan instancias de la jerarquía `Contenido`, diferenciadas por su tipo: el material solo lleva título, descripción y fecha de publicación, mientras que la tarea incorpora además consigna y fecha límite.

Los archivos que acompañan al contenido se almacenan como instancias de `Adjunto`, que antes de guardarse ejecutan `validarFormato()` y `validarTamano()` conforme a NRF11 y NRF12.

**Por qué importa para lo que sigue:** solo las tareas generan entregas. Los materiales quedan disponibles para consulta pero no esperan devolución del alumno, distinción que el paso 5 necesita para saber sobre qué contenidos puede actuar.

**Decisión que se pone a prueba:** la especialización entre `Material` y `Tarea` se justifica acá. Si fueran una sola clase, la fecha límite quedaría vacía en todos los materiales, y el modelo admitiría que un material recibiera entregas. La herencia expresa que comparten la base pero difieren en el comportamiento.

El tallerista puede además retirar contenido que ya no corresponde mostrar mediante `eliminarMaterial()` (RF16). La operación se define en la clase base `Contenido` porque el procedimiento es idéntico para materiales y tareas, aunque el requerimiento solo contempla explícitamente el material.

<br>

### Paso 5 — Consulta y entrega del alumno (EP4)

El alumno accede con su cuenta y consulta el contenido de su taller mediante `visualizarMaterial()` y `visualizarTareas()` (RF07). El sistema determina a qué taller pertenece a través de sus instancias de `Inscripcion`, creadas en el paso 2.

Para completar una tarea, ejecuta `entregarTarea()` (RF08), lo que genera una instancia de `Entrega` vinculada a la tarea y a su propia ficha, con los archivos adjuntos correspondientes. El método `Entrega.fueEntregadaATiempo()` compara la fecha de envío con la fecha límite de la tarea.

**Por qué importa para lo que sigue:** la entrega es el objeto sobre el que operan la corrección y la calificación del paso 6. Sin ella, esas dos acciones no tendrían dónde registrarse.

**Decisión que se pone a prueba:** la restricción de unicidad sobre la combinación de tarea y alumno garantiza que exista una sola entrega por par. Si se admitieran varias, el paso 6 no podría determinar cuál corregir ni a cuál asignarle la nota.

<br>

### Paso 6 — Corrección y calificación (EP4)

El tallerista consulta las entregas recibidas mediante `Tarea.obtenerEntregas()` (RF09) y, sobre cada una, puede ejecutar dos operaciones independientes: `corregirTarea()` registra la devolución cualitativa y `asignarNota()` la calificación numérica (RF10). Si necesita rectificar, `eliminarNota()` restablece la nota a valor nulo sin borrar el resto de la entrega (RF17).

El estado de la entrega refleja en qué punto del proceso se encuentra: pendiente mientras el alumno no ha enviado nada, entregada cuando envió pero aún no fue revisada, y corregida una vez que el tallerista actuó sobre ella.

**Por qué importa para lo que sigue:** las notas asignadas son la base del informe de calificaciones previsto para la fase 2, y el estado de las entregas permite al tallerista identificar qué le resta corregir.

**Decisión que se pone a prueba:** que `corregirTarea()` y `asignarNota()` sean métodos distintos se justifica en este paso. El tallerista puede devolver un comentario sin haber definido aún la nota, o rectificar la calificación sin modificar la devolución escrita. Unificarlos obligaría a proporcionar ambos datos en cada operación.

<br>

### Paso 7 — Generación de informes (EP5)

El administrador solicita informes mediante los métodos correspondientes (RF11, RF12, RF19, RF22), que producen instancias de `Informe`. El informe de asistencia por taller recorre las jornadas del período solicitado y sus registros, aplicando `Asistencia.contarPresentes()` sobre cada una.

Una vez generado, el informe puede exportarse con `exportarPDF()` o `exportarExcel()` (RF13). Cada informe registra qué usuario lo generó, conforme a NRF10.

**Decisión que se pone a prueba:** el atributo `fechaInscripcion` de la clase `Inscripcion` resulta indispensable en este paso. Un informe de asistencia por rango de fechas debe considerar únicamente las jornadas posteriores a la incorporación de cada alumno al taller; sin ese dato, un alumno inscripto a mitad del período figuraría como ausente en todas las jornadas previas a su ingreso, distorsionando el resultado.

La multiplicidad **0..1** entre `Taller` e `Informe` también se justifica acá: el listado general de alumnos y el informe de talleristas son de alcance global y no corresponden a ningún taller en particular.

<br>

### Paso 8 — Auditoría transversal

Las operaciones de creación, modificación y eliminación ejecutadas en los pasos anteriores generan instancias de `RegistroTrazabilidad` (NRF10), que registran la acción realizada, la entidad afectada, su identificador, el momento en que se produjo y, mediante su asociación con `Usuario`, la identidad de quien la ejecutó.

Este registro no se activa desde las clases del dominio sino desde la capa de servicios, según se justifica en la sección 3.16 del anexo. Por ese motivo `RegistroTrazabilidad` no aporta métodos al modelo: su función es exclusivamente persistir la información resultante.

**Decisión que se pone a prueba:** la referencia genérica mediante entidad e identificador permite auditar operaciones sobre cualquier clase del modelo con una única estructura. La alternativa —una tabla de historial por cada entidad auditada— multiplicaría la estructura sin aportar capacidad adicional.

---

<br>

## 2. Verificación de cobertura del circuito

| Paso | Clases involucradas | RF cubiertos |
|---|---|---|
| 1. Alta de talleres y usuarios | Usuario, Administrador, Tallerista, Alumno, Taller, Horario | RF02 |
| 2. Asignación | Administrador, Inscripcion, AsignacionTallerista | RF03 |
| 3. Registro de asistencia | Tallerista, Asistencia, RegistroAsistencia | RF04, RF05 |
| 4. Publicación de contenidos | Tallerista, Contenido, Material, Tarea, Adjunto | RF06, RF16 |
| 5. Consulta y entrega | Alumno, Contenido, Tarea, Entrega, Adjunto | RF07, RF08 |
| 6. Corrección y calificación | Tallerista, Tarea, Entrega | RF09, RF10, RF17 |
| 7. Informes | Administrador, Informe, Asistencia, Taller, Alumno | RF11, RF12, RF13, RF19, RF22 |
| 8. Auditoría | RegistroTrazabilidad, Usuario | NRF10 |

incluidos los que no provienen de un requerimiento funcional: `RegistroTrazabilidad` y la asociación entre `RegistroAsistencia` y `Usuario`, derivados de NRF10; los métodos `validarFormato()` y `validarTamano()`, derivados de NRF11 y NRF12; y los métodos `estaCompleta()` y `generarNombreSeguro()`, señalados explícitamente como derivados de la operativa.

Los cuatro requerimientos restantes del alcance de la primera versión se ejercitan de forma transversal: RF01 al inicio de cada paso mediante la autenticación, RF14 cuando cualquier usuario edita su perfil, y RF24 y RF25 como consultas del administrador y del tallerista sobre información ya registrada.

**Conclusión del análisis:** el circuito operativo completo se resuelve con las 15 clases del modelo, sin requerir estructuras adicionales. Las decisiones de diseño que en el momento de tomarlas podían parecer sobreabundantes —la separación de la asistencia en dos niveles, la especialización de material y tarea, la fecha de inscripción— encuentran su justificación funcional en un paso concreto del circuito.

<br>

## 3. Trazabilidad de las correcciones hacia el modelo

El modelo presentado no corresponde a la primera versión que el equipo elaboró. Durante la aplicación del método de derivación se detectaron requerimientos que la documentación inicial no había recogido, contradicciones entre la especificación funcional y la base de datos que ya se estaba construyendo, y decisiones de modelado que resultaron insuficientes al avanzar el análisis.

Esta sección documenta esas correcciones, el elemento del modelo que las resuelve y el paso de la derivación en que se detectaron.

### 3.1 Requerimientos ausentes en la documentación inicial

Al contrastar la entrevista con la lista de requerimientos funcionales se advirtió que varias capacidades mencionadas por el cliente no habían sido formalizadas. En todos los casos existía respaldo textual en el relevamiento.

| Capacidad ausente | Frase de la entrevista que la respalda | Elemento que la resuelve | Estado en v1 |
|---|---|---|---|
| Eliminación de material, calificaciones y asistencia por parte del tallerista | *"Puede eliminar material, notas y asistencia"* | RF16, RF17, RF18 → métodos `eliminarMaterial()`, `eliminarNota()` y `eliminarAsistencia()` | RF16 y RF17 incluidos; RF18 postergado |
| Comunicación del tallerista con los alumnos | *"comunicarse con los alumnos"* | Formalizada como requerimiento | Excluida por complejidad de implementación |
| Cuatro de los siete reportes solicitados | Sección de reportes: listas de alumnos, histórico de calificaciones, información de alumnos y de talleristas | RF19 a RF22 → métodos de generación en `Administrador` | RF19 y RF22 incluidos; RF20 y RF21 postergados |
| Visualización de las notas por parte del alumno | *"puede ver... las notas que le dejó el tallerista asignado"* | RF23 → método `visualizarNotas()` | Postergado |
| Consulta de datos sensibles | *"Se debe consultar: datos sensibles usados"* | RF24 → método `consultarDatosSensibles()` | Incluido |
| Consulta del listado de alumnos por el tallerista | *"quién está en su taller"* | RF25 → método `consultarAlumnosDeTaller()` | Incluido |
| Modificación de material ya publicado | *"Ajuste de materiales de su taller"* | RF26 → método `modificarContenido()` | Postergado |

**Observación metodológica:** estas ausencias no se detectaron al redactar los requerimientos sino al aplicar el Paso 3 de la derivación, que exige localizar el verbo de origen de cada método. Al recorrer la entrevista buscando verbos de acción aparecieron los que ningún requerimiento había recogido. La derivación funcionó, en este sentido, como una verificación de completitud sobre la documentación previa.

**Aclaración sobre el estado:** que un requerimiento quedara postergado no invalida la corrección. La omisión se detectó y se formalizó; su implementación se difirió después, por decisión de alcance. Los elementos correspondientes figuran en el modelo señalados como **(v2)**, de modo que incorporarlos en la fase 2 no requerirá modificar la estructura.


### 3.2 Contradicciones entre la especificación y la base de datos

El equipo había comenzado a construir la base de datos en paralelo a la documentación. Al comparar ambas en el Paso 5 se identificaron tres discrepancias que impedían implementar requerimientos ya aprobados.

| Contradicción | Consecuencia | Elemento que la resuelve |
|---|---|---|
| La base de datos contemplaba únicamente los roles de administrador y tallerista | RF01, RF07 y RF08 resultaban inimplementables: el alumno no podía autenticarse ni acceder a sus tareas | Incorporación del rol `alumno` y de la asociación `Usuario` 0..1 ←→ 0..1 `Alumno` |
| No existía estructura para almacenar archivos adjuntos | RF06 y RF08 permitían subir archivos sin definir dónde guardarlos ni cómo validarlos | Clase `Adjunto`, con los métodos `validarFormato()` y `validarTamano()` derivados de NRF11 y NRF12 |
| Un taller admitía un único tallerista | RF03 emplea el plural al referirse a la asignación de talleristas | Clase asociativa `AsignacionTallerista`, con multiplicidad `Taller` 1..\* ←→ 0..\* `Tallerista` |

**Observación metodológica:** ninguna de las tres contradicciones era visible desde la documentación por separado. La especificación era coherente consigo misma y la base de datos también, pero no entre sí. Solo la verificación de correspondencia entre clases derivadas y tablas existentes, propia del Paso 5, permitió detectarlas.

### 3.3 Decisiones de modelado revisadas durante la derivación

Tres decisiones adoptadas en pasos tempranos se corrigieron al avanzar el análisis, cuando un paso posterior evidenció que la formulación inicial resultaba insuficiente.

| Decisión inicial | Problema detectado | Corrección adoptada |
|---|---|---|
| `Asistencia` como clase única, con fecha y estado | El Paso 2 evidenció que la fecha corresponde a la jornada y el estado a cada alumno: dos granularidades distintas dentro de una sola clase | Separación en `Asistencia` (jornada) y `RegistroAsistencia` (detalle por alumno) |
| `Inscripcion` como relación sin atributos propios | El análisis del circuito operativo mostró que un informe por rango de fechas computaría como ausente a un alumno en jornadas previas a su incorporación | Incorporación del atributo `fechaInscripcion`, que convierte la relación en clase asociativa |
| `Informe` descartado como entidad | RF13 exige exportar informes, operación que requiere que el informe exista como objeto con datos consolidados, tipo y formato de salida | Incorporación de `Informe` como clase del modelo |

**Observación metodológica:** las tres correcciones provienen de pasos posteriores al que había producido la decisión original. Esto confirma que el método de cinco pasos no opera de forma estrictamente secuencial: cada paso funciona como verificación de los anteriores, y el resultado final requiere revisar hacia atrás.

> **Nota sobre el alcance del proyecto:** las postergaciones decididas por restricción de plazo, así como la exclusión de la comunicación entre tallerista y alumnos, no constituyen correcciones del modelo. Son decisiones de gestión del proyecto, documentadas en el documento de requerimientos, y su efecto sobre el modelo se limita al señalamiento **(v2)** de los elementos afectados.

### 3.4 Síntesis

| Categoría | Correcciones | Paso en que se detectaron |
|---|---|---|
| Requerimientos ausentes en la documentación | 7 | Paso 3 |
| Contradicciones entre especificación y base de datos | 3 | Paso 5 |
| Decisiones de modelado revisadas | 3 | Pasos 2, 5 y el análisis del circuito |
| **Total** | **13** | |

Ninguna de las trece correcciones provino de un cambio solicitado por el cliente: todas surgieron de contrastar la documentación del equipo consigo misma y con la implementación en curso. El modelo presentado las incorpora de forma directa, en lugar de documentar primero una versión incompleta y rectificarla después.

Que las trece se detectaran antes de comenzar el desarrollo del backend es el resultado más relevante del análisis: cada una de ellas habría exigido rehacer código ya escrito si se hubiera descubierto durante la implementación.

<br>

---

## 4. Requerimientos no funcionales no representados como clases

No todo requerimiento no funcional se traduce en una clase o en una tabla. La mayoría constituye un atributo de calidad de la arquitectura, de la interfaz o del proceso de desarrollo, y se atiende por vías ajenas al modelo de datos. Se documentan aquí para que la trazabilidad quede completa: ningún requerimiento del proyecto queda sin correspondencia, aunque esa correspondencia no siempre sea una clase.

### 4.1 Requerimientos atendidos fuera del modelo

| NRF | Cómo se atiende | Ámbito |
|---|---|---|
| **NRF01** — Diseño responsive | Bootstrap 5.3 y cuatro puntos de quiebre definidos en las hojas de estilo | Interfaz |
| **NRF02** — Disponibilidad 24 horas | Contratación de hosting con la disponibilidad requerida | Despliegue |
| **NRF03** — Rapidez en operaciones habituales | Índices sobre las columnas de filtrado frecuente: `estado`, `rol`, `tipo` y `fecha` | Implementación física de la base |
| **NRF04** — Navegación clara y consistente | Estructura de componentes común a los tres paneles, documentada en la guía de identidad visual | Interfaz |
| **NRF05** — Validación en frontend y backend | Validaciones en JavaScript para la experiencia de uso, replicadas en PHP como control efectivo | Código de aplicación |
| **NRF06** — Separación entre frontend y backend | Arquitectura de API REST, con el frontend consumiendo endpoints mediante Fetch API | Arquitectura |
| **NRF07** — Control de acceso por rol | Atributo `rol` de `Usuario` más verificación de permisos en cada endpoint | Modelo y aplicación |
| **NRF09** — Persistencia en base de datos relacional | Elección de MySQL como motor | Arquitectura |
| **NRF13** — Código organizado y mantenible | Estructura modular por pantalla, con un archivo por vista | Proceso de desarrollo |
| **NRF14** — Documentación técnica en el repositorio | Carpeta `docs` versionada junto al código | Proceso de desarrollo |
| **NRF15** — Uso de Git | Repositorio en GitHub con historial de commits | Proceso de desarrollo |
| **NRF16** — Pull Requests obligatorias | Flujo de ramas con revisión previa a la integración | Proceso de desarrollo |

### 4.2 Requerimientos no funcionales con representación en el modelo

Cuatro requerimientos no funcionales sí produjeron elementos del modelo. Se detallan porque constituyen la excepción a la regla general de esta sección.

| NRF | Elementos del modelo | Justificación |
|---|---|---|
| **NRF08** — Protección de datos personales | Atributo `claveHash` de `Usuario`; método `generarNombreSeguro()` de `Adjunto` | La contraseña no puede almacenarse en texto plano, y el nombre de archivo original no debe exponerse en el sistema de archivos del servidor |
| **NRF10** — Trazabilidad de acciones |Clase `RegistroTrazabilidad` completa; asociación entre `RegistroAsistencia` y `Usuario`; atributo `fechaSubida` de `Adjunto` | La información de auditoría debe persistirse, lo que exige estructura de datos propia |
| **NRF11** — Restricción de formatos | Atributo `tipoMime` y método `validarFormato()` de `Adjunto` | La validación requiere conocer el tipo del archivo, dato que debe almacenarse |
| **NRF12** — Restricción de tamaño | Atributo `tamanoBytes` y método `validarTamano()` de `Adjunto` | Ídem anterior |

### 4.3 Observación sobre el caso de NRF10

`RegistroTrazabilidad` presenta una particularidad respecto de las restantes clases del modelo: **posee atributos pero no métodos**. La razón es que el registro de trazabilidad no constituye una operación del dominio sino un mecanismo transversal que se activa al ejecutar operaciones sobre cualquier clase.

Incorporar un método de registro en cada clase dispersaría la lógica de auditoría por todo el modelo y contravendría el principio de responsabilidad única. La clase existe, por tanto, únicamente para persistir la información que produce ese mecanismo, cuya implementación corresponde a la capa de servicios.

Es el único caso del modelo en que un requerimiento genera estructura de datos sin generar comportamiento.

---

<br>

## 5. Conclusión

El modelo de clases y el modelo entidad-relación presentados no constituyen un diseño genérico de sistema de gestión académica. Cada clase, atributo, método, relación y tabla fue derivado de una frase concreta de la entrevista, de un requerimiento numerado o de una historia de usuario, y esa derivación quedó documentada en el anexo correspondiente.

La trazabilidad opera en ambos sentidos. Desde los requerimientos hacia el modelo, la tabla de la sección 7 del documento principal permite ubicar qué clases resuelven cada RF, NRF, historia de usuario y épica. Desde el modelo hacia los requerimientos, las justificaciones de los pasos 1 a 5 del anexo permiten identificar el origen de cualquier elemento, incluidos aquellos que no derivan de un requerimiento funcional sino de uno no funcional —detallados en la sección 4.2— y los dos únicos que no provienen de ningún requerimiento escrito: los métodos `estaCompleta()` y `generarNombreSeguro()`, señalados explícitamente en el anexo como derivados de la operativa y de las prácticas de seguridad respectivamente.

El análisis del circuito operativo verificó que las quince clases resuelven la operativa completa sin requerir estructuras adicionales, y mostró en qué punto concreto se justifica cada decisión de diseño. Varias de ellas —la separación de la asistencia en jornada y detalle, la especialización entre material y tarea, la fecha de inscripción— podían parecer sobreabundantes al momento de adoptarse; el recorrido del circuito identificó el paso en que cada una resulta necesaria.

La aplicación del método permitió además detectar trece correcciones sobre la documentación previa: siete requerimientos que la entrevista contenía pero que la especificación no había recogido, tres contradicciones entre la especificación y la base de datos en construcción, y tres decisiones de modelado que resultaron insuficientes al avanzar el análisis. Ninguna de ellas provino de un cambio solicitado por el cliente. Todas se detectaron antes de comenzar el desarrollo del backend, lo que evitó tener que rehacer código ya escrito.

Ese resultado constituye el argumento central del trabajo: el método de derivación en cinco pasos no operó como un requisito formal de documentación, sino como un procedimiento de verificación que expuso omisiones y contradicciones que la lectura directa de la documentación no había revelado.