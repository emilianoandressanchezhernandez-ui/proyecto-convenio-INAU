# Documentación de la API

<br>

## Sistema de Gestión de Talleres en Convenio con INAU

**Proyecto:** TheNewfutures — Sistema de Gestión de Talleres en Convenio con INAU    
**Fecha de elaboración:** 27 de octubre de 2026  
**Última actualización:** 27 de octubre de 2026  

**Qué es este documento.** Constituye la referencia técnica de la API REST(por sus siglas en inglés: Representational State Transfer) del sistema. Describe las rutas disponibles, los niveles de acceso requeridos, el formato de las peticiones y respuestas, y las reglas de validación aplicadas.

---

<br>

## 1. Información general

La API constituye la capa de backend del sistema. Recibe las peticiones de los tres paneles web (administrador, tallerista y alumno), aplica las reglas de negocio y de control de acceso, y gestiona la persistencia en la base de datos MySQL. Todas las respuestas se emiten en formato JSON.

<br>

| Elemento | Valor |
|---|---|
| Tipo de API | REST, con intercambio de datos en formato JSON (UTF-8) |
| Lenguaje y entorno | PHP 8.3 sobre Apache, ejecutado en un contenedor Docker |
| Base de datos | MySQL 8.4, ejecutada en un contenedor Docker |
| Cantidad de rutas | 55 |
| URL base en desarrollo | `http://localhost:8002` |
| URL base en el servidor | `http://<dirección del servidor>/api`, publicada por Nginx como proxy inverso hacia `127.0.0.1:8002` |
| Autenticación | Token JWT transmitido en una cookie `HttpOnly` (sección 2) |
| Definición de rutas | `backend/api-completa/routes.php` |

<br>

### Organización del código

La API sigue una arquitectura en capas, las capas en el siguiente orden:

<br>

| Capa | Carpeta | Responsabilidad |
|---|---|---|
| Enrutamiento | `core/Router.php`, `routes.php` | Asocia cada método y ruta con su controlador y el nivel de acceso requerido |
| Control de acceso | `core/AuthMiddleware.php` | Verifica el token y el rol del usuario antes de ejecutar la ruta |
| Controladores | `controllers/` | Reciben la petición, invocan la validación y el servicio correspondiente, y emiten la respuesta |
| Validadores | `validators/` | Verifican los datos recibidos antes de procesarlos |
| Servicios | `services/` | Aplican las reglas de negocio |
| Repositorios | `repositories/` | Ejecutan las consultas a la base de datos mediante sentencias preparadas |
| Respuestas | `core/Response.php` | Emite las respuestas en el formato JSON común (sección 3) |
---

<br>

## 2. Autenticación y niveles de acceso

### 2.1 Inicio y cierre de sesión

El usuario inicia sesión mediante `POST /login`, enviando su correo y su contraseña. Si las credenciales son correctas, la API genera un token JWT (JSON Web Token, o Token Web JSON) firmado y lo envía en una cookie denominada `access_token`, con los atributos `HttpOnly` y `SameSite=Lax`. El token no se incluye en el cuerpo de la respuesta, por lo que el frontend no necesita almacenarlo: el navegador envía la cookie automáticamente en cada petición posterior.

El token tiene una validez configurable mediante la variable de entorno `TOKEN_LIFETIME`, cuyo valor predeterminado es de 3600 segundos (una hora). La ruta `POST /logout` elimina la cookie del navegador; es pública para permitir eliminar incluso una cookie vencida o inválida.


### 2.2 Niveles de acceso

Cada ruta declara en `routes.php` el nivel de acceso requerido. Antes de ejecutarla, `core/AuthMiddleware.php` verifica el token y, cuando corresponde, el rol del usuario.

| Nivel | Quién puede usar la ruta | Respuesta si no se cumple |
|---|---|---|
| Público | Cualquier persona, sin iniciar sesión | — |
| `auth` | Cualquier usuario con sesión iniciada, sin importar su rol | `401` "Tenes que iniciar sesion." |
| `admin` | Solo el administrador | `403` "No tenes permisos para hacer esto." |
| `tallerista` | Solo el tallerista | `403` "No tenes permisos para hacer esto." |
| `alumno` | Solo el alumno | `403` "No tenes permisos para hacer esto." |

Una ruta puede admitir varios roles; en ese caso, la tabla de la sección 4 los indica separados por una barra (por ejemplo, `admin \| tallerista`). Además del control por rol, los servicios verifican la pertenencia al taller: un tallerista solo accede a los talleres que tiene asignados y un alumno, solo a aquellos en los que está inscripto.

> El detalle de los mecanismos de seguridad (hash de contraseñas, firma del token y limitaciones pendientes) se describe en `docs/05-Ciberseguridad/Mecanismos_Autenticacion_Criptografia_INAU.md`.

---

<br>

## 3. Formato de respuestas

Todas las respuestas se emiten en formato JSON mediante `core/Response.php`, con una estructura común.

**Respuesta exitosa:** contiene `ok` con valor `true`, un mensaje descriptivo y los datos solicitados en `datos`.

```json
{
    "ok": true,
    "mensaje": "Alumno creado correctamente.",
    "datos": {
        "id": 5,
        "nombre": "Dup",
        "apellido": "Testing",
        "cedula": "49999991",
        "...": "..."
    }
}
```

**Respuesta con error:** contiene `ok` con valor `false`, un mensaje general y, cuando corresponde, el detalle de los errores en `errores`.

```json
{
    "ok": false,
    "mensaje": "Los datos ingresados no son válidos.",
    "errores": {
        "cedula": "La cédula debe contener exactamente 8 dígitos."
    }
}
```

### 3.1 Códigos de estado

| Código | Significado | Ejemplo de mensaje |
|---|---|---|
| `200` | Operación realizada correctamente | "Sesión iniciada." |
| `201` | Recurso creado | "Alumno creado correctamente." |
| `400` | Petición incorrecta o datos inválidos | "La contraseña actual es incorrecta." |
| `401` | No hay una sesión válida, o las credenciales son incorrectas | "Tenes que iniciar sesion." / "Correo o contraseña incorrectos." |
| `403` | El usuario no tiene permiso para la operación | "No tenes permisos para hacer esto." |
| `404` | La ruta o el recurso no existe | "No existe esa dirección, o no se puede usar con GET." |
| `422` | Los datos no superan la validación | "Los datos ingresados no son válidos." |
| `500` | Error interno del servidor | "Ocurrio un error interno." |

Ante un error interno, el detalle técnico se registra en los registros del servidor y no se muestra al cliente.

> **Observación:** los errores de validación no utilizan un único código. Las rutas de alumnos, talleristas y adjuntos responden `422`, mientras que las de autenticación y perfil responden `400`.

---

<br>

## 4. Referencia de rutas

La API expone 55 rutas, agrupadas por recurso. La columna "Acceso" indica el nivel requerido según la sección 2.2.

<br>

### 4.1 Autenticación y perfil (5)

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `POST` | `/login` | Público | Iniciar sesión |
| `POST` | `/logout` | Público | Cerrar sesión |
| `GET` | `/perfil` | `auth` | Consultar el perfil del usuario autenticado |
| `PATCH` | `/perfil` | `auth` | Modificar el correo o el teléfono del usuario autenticado |
| `PATCH` | `/perfil/clave` | `auth` | Cambiar la contraseña del usuario autenticado |

### 4.2 Alumnos (5)

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/alumnos` | `admin` | Listar todos los alumnos |
| `GET` | `/alumnos/{id}` | `admin` | Obtener un alumno |
| `POST` | `/alumnos` | `admin` | Crear un alumno |
| `PATCH` | `/alumnos/{id}` | `admin` | Modificar un alumno |
| `DELETE` | `/alumnos/{id}` | `admin` | Dar de baja un alumno |

### 4.3 Talleristas (5)

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/talleristas` | `admin` | Listar todos los talleristas |
| `GET` | `/talleristas/{id}` | `admin` | Obtener un tallerista |
| `POST` | `/talleristas` | `admin` | Crear un tallerista |
| `PATCH` | `/talleristas/{id}` | `admin` | Modificar un tallerista |
| `DELETE` | `/talleristas/{id}` | `admin` | Dar de baja un tallerista |

### 4.4 Talleres (6)

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/talleres` | `admin` | Listar todos los talleres |
| `GET` | `/mis-talleres` | `auth` | Listar los talleres relacionados con el usuario autenticado |
| `GET` | `/talleres/{id}` | `auth` | Obtener un taller |
| `POST` | `/talleres` | `admin` | Crear un taller |
| `PATCH` | `/talleres/{id}` | `admin` | Modificar un taller |
| `DELETE` | `/talleres/{id}` | `admin` | Finalizar un taller |

### 4.5 Asignaciones e inscripciones (6)

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/talleres/{id}/talleristas` | `admin` | Listar los talleristas asignados a un taller |
| `POST` | `/talleres/{id}/talleristas` | `admin` | Asignar un tallerista a un taller |
| `DELETE` | `/talleres/{id}/talleristas/{talleristaId}` | `admin` | Quitar un tallerista de un taller |
| `GET` | `/talleres/{id}/alumnos` | `admin \| tallerista` | Listar los alumnos inscriptos en un taller |
| `POST` | `/talleres/{id}/alumnos` | `admin` | Inscribir un alumno en un taller |
| `DELETE` | `/talleres/{id}/alumnos/{alumnoId}` | `admin` | Quitar la inscripción de un alumno |

### 4.6 Asistencias (5)

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/mis-asistencias` | `alumno` | Consultar las asistencias propias del alumno |
| `GET` | `/talleres/{id}/asistencias` | `admin \| tallerista` | Listar las asistencias de un taller |
| `POST` | `/talleres/{id}/asistencias` | `admin \| tallerista` | Crear una asistencia para un taller |
| `GET` | `/asistencias/{id}` | `admin \| tallerista` | Obtener una asistencia |
| `POST` | `/asistencias/{id}/registros` | `admin \| tallerista` | Guardar el registro de asistencia de un alumno |

### 4.7 Reportes (5)

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/reportes` | `admin` | Listar todos los reportes |
| `GET` | `/reportes/{id}` | `admin` | Obtener un reporte |
| `POST` | `/reportes` | `admin` | Generar un reporte |
| `GET` | `/mis-reportes` | `admin \| tallerista` | Listar los reportes disponibles para el usuario |
| `GET` | `/mis-reportes/{id}` | `admin \| tallerista` | Obtener uno de los reportes disponibles para el usuario |

### 4.8 Contenidos: material y tareas (5)

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/talleres/{id}/contenidos` | `admin \| tallerista \| alumno` | Listar el material y las tareas de un taller |
| `POST` | `/talleres/{id}/contenidos` | `admin \| tallerista` | Publicar material o una tarea |
| `GET` | `/contenidos/{id}` | `admin \| tallerista \| alumno` | Obtener un contenido |
| `PATCH` | `/contenidos/{id}` | `admin \| tallerista` | Modificar un contenido |
| `DELETE` | `/contenidos/{id}` | `admin \| tallerista` | Eliminar un contenido |

### 4.9 Entregas, corrección y notas (7)

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/contenidos/{id}/mi-entrega` | `alumno` | Consultar la entrega propia de una tarea; devuelve `null` si aún no se realizó |
| `GET` | `/contenidos/{id}/entregas` | `admin \| tallerista` | Listar las entregas de una tarea |
| `POST` | `/contenidos/{id}/entregas` | `alumno` | Realizar la entrega de una tarea |
| `GET` | `/entregas/{id}` | `admin \| tallerista \| alumno` | Consultar una entrega |
| `PATCH` | `/entregas/{id}/correccion` | `admin \| tallerista` | Agregar o modificar el comentario de corrección |
| `PATCH` | `/entregas/{id}/nota` | `admin \| tallerista` | Asignar o modificar la nota |
| `DELETE` | `/entregas/{id}/nota` | `admin \| tallerista` | Eliminar la nota; la entrega y el comentario se conservan |

### 4.10 Adjuntos (6)

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/entregas/{id}/adjuntos` | `admin \| tallerista \| alumno` | Listar los adjuntos de una entrega |
| `POST` | `/entregas/{id}/adjuntos` | `alumno` | Subir un archivo a una entrega; solo el alumno propietario |
| `GET` | `/contenidos/{id}/adjuntos` | `admin \| tallerista \| alumno` | Listar los adjuntos de un contenido |
| `POST` | `/contenidos/{id}/adjuntos` | `admin \| tallerista` | Subir un archivo a un contenido; el tallerista debe pertenecer al taller |
| `GET` | `/adjuntos/{id}/archivo` | `admin \| tallerista \| alumno` | Descargar un archivo adjunto |
| `DELETE` | `/adjuntos/{id}` | `admin \| tallerista \| alumno` | Eliminar un adjunto; los permisos dependen de su origen |

---

<br>

## 5. Detalle de rutas principales

Esta sección describe en detalle las rutas que representan los flujos centrales del sistema. Las rutas restantes siguen el mismo formato de petición y respuesta descrito en la sección 3.

<br>

### 5.1 `POST /login`

**Descripción:** inicia la sesión del usuario y envía el token en la cookie `access_token`.  
**Acceso:** público.

**Cuerpo de la petición:**

```json
{
    "correo": "CORREO_DE_PRUEBA",
    "clave": "CONTRASENA_DE_PRUEBA"
}
```

**Respuesta exitosa (`200`):** mensaje "Sesión iniciada." y los datos del usuario en `datos`. La respuesta incluye el encabezado `Set-Cookie` con `access_token`; el cuerpo no contiene el token ni el hash de la contraseña.

**Errores posibles:**

| Código | Causa | Mensaje |
|---|---|---|
| `400` | Falta el correo o la contraseña | "Falta el correo." / "Falta la contraseña." |
| `401` | Correo inexistente o contraseña incorrecta | "Correo o contraseña incorrectos." |
| `403` | La cuenta está inactiva | — |

<br>

### 5.2 `PATCH /perfil/clave`

**Descripción:** cambia la contraseña del usuario autenticado. Exige la contraseña actual.  
**Acceso:** `auth`.

**Cuerpo de la petición:**

```json
{
    "clave_actual": "CONTRASENA_ACTUAL",
    "clave_nueva": "NUEVA_CONTRASENA"
}
```

**Respuesta exitosa (`200`):** "Contraseña actualizada correctamente."

**Errores posibles** (verificados en `Testing-02.md`, casos CP-03, CP-04 y NF-01):

| Código | Causa | Mensaje |
|---|---|---|
| `400` | La contraseña actual no coincide | "La contraseña actual es incorrecta." |
| `400` | La nueva contraseña tiene menos de 8 caracteres | "La nueva contraseña debe tener al menos 8 caracteres." |
| `400` | La nueva contraseña es igual a la actual | "La nueva contraseña debe ser diferente de la actual." |
| `400` | Se envió un campo no permitido | "El campo 'rol' no está permitido." |
| `401` | No hay una sesión válida | "Tenes que iniciar sesion." |

<br>

### 5.3 `POST /alumnos`

**Descripción:** crea un alumno. Los alumnos se registran sin cuenta de acceso.  
**Acceso:** `admin`.

**Cuerpo de la petición:**

```json
{
    "nombre": "NOMBRE",
    "apellido": "APELLIDO",
    "cedula": "12345678",
    "fecha_nacimiento": "2010-05-10",
    "correo": "CORREO_OPCIONAL",
    "telefono": "099123456"
}
```

`nombre`, `apellido`, `cedula` y `fecha_nacimiento` son obligatorios; `correo` y `telefono` son opcionales. La cédula se acepta con o sin puntos y guion (`12345678` o `1.234.567-8`).

**Respuesta exitosa (`201`):** "Alumno creado correctamente.", con el alumno creado en `datos`.

**Errores posibles** (verificados en `Testing-02.md`, casos CP-06 y CP-08):

| Código | Causa | Mensaje |
|---|---|---|
| `422` | La cédula no tiene 8 dígitos o contiene letras | "La cédula debe contener exactamente 8 dígitos." |
| `422` | El teléfono no tiene entre 8 y 15 dígitos o contiene letras | "El teléfono debe contener entre 8 y 15 dígitos y no puede incluir letras." |
| `422` | Falta un campo obligatorio o la fecha no tiene formato válido | Mensaje del campo correspondiente (sección 6) |
| `400` | Ya existe un alumno con la misma cédula | "Ya existe un alumno con esa cédula." |


<br>

### 5.4 Registro de asistencia

El registro de asistencia se realiza en dos pasos: primero se crea la asistencia del taller para una fecha y luego se guarda el estado de cada alumno.

**Paso 1. `POST /talleres/{id}/asistencias`.** Acceso: `admin | tallerista`.

```json
{
    "fecha": "2026-10-26"
}
```

Respuesta exitosa (`201`): "Asistencia creada correctamente." Si ya existe una asistencia para ese taller y esa fecha, la API responde con el error "Ya existe un registro de asistencia para ese taller y fecha."

**Paso 2. `POST /asistencias/{id}/registros`.** Acceso: `admin | tallerista`.

```json
{
    "alumno_id": 1,
    "estado": "Presente",
    "observaciones": null
}
```

Respuesta exitosa (`200`): "Asistencia del alumno guardada correctamente." El campo `estado` admite `Presente`, `Ausente`, `Justificado` y `Tardanza`. Si se envía de nuevo el registro de un alumno, se modifica su estado.

<br>


### 5.5 Entrega de una tarea con archivo

La entrega se realiza en dos pasos: primero se crea la entrega y luego se adjunta el archivo.

**Paso 1. `POST /contenidos/{id}/entregas`.** Acceso: `alumno`.

```json
{
    "comentario": "COMENTARIO_DEL_ALUMNO"
}
```

El campo `comentario` es obligatorio, aunque puede tener el valor `null`. Respuesta exitosa (`201`): "Entrega realizada correctamente."

**Paso 2. `POST /entregas/{id}/adjuntos`.** Acceso: `alumno` (solo el propietario de la entrega).

La petición se envía como `multipart/form-data`, con el archivo en el campo `archivo`. Respuesta exitosa (`201`): "Archivo subido correctamente."

| Código | Causa | Mensaje |
|---|---|---|
| `422` | El formato no es PDF ni JPG | "Solo se permiten archivos PDF o JPG." |
| `422` | El archivo supera los 10 MB | "El archivo no puede superar los 10 MB." |
| `422` | No se envió ningún archivo | "Debe seleccionar un archivo." |

<br>


### 5.6 `PATCH /entregas/{id}/nota`

**Descripción:** asigna o modifica la nota de una entrega.  
**Acceso:** `admin | tallerista`.

```json
{
    "nota": 8
}
```

**Respuesta exitosa (`200`):** "Nota asignada correctamente."

| Código | Causa | Mensaje |
|---|---|---|
| `422` | La nota no es un entero entre 1 y 10 | "La nota debe ser un número entero entre 1 y 10." |
| `422` | No se envió la nota | "La nota es obligatoria." |

La nota se elimina con `DELETE /entregas/{id}/nota` ("Nota eliminada correctamente."); la entrega y el comentario de corrección se conservan.

---

<br>

## 6. Reglas de validación

La API valida todos los datos recibidos, aunque el frontend ya los haya validado.

| Dato | Regla | Mensaje de error |
|---|---|---|
| Cédula | Exactamente 8 dígitos; admite puntos y guion | "La cédula debe contener exactamente 8 dígitos." |
| Teléfono | Entre 8 y 15 dígitos; admite espacios, `+`, `-` y paréntesis, pero no letras | "El teléfono debe contener entre 8 y 15 dígitos y no puede incluir letras." |
| Correo electrónico | Formato de correo válido | "El correo electrónico no es válido." |
| Fecha de nacimiento | Formato `YYYY-MM-DD` | "La fecha de nacimiento debe tener formato YYYY-MM-DD." |
| Estado de alumno | `Activo` o `Inactivo` | "El estado debe ser Activo o Inactivo." |
| Contraseña de tallerista | Mínimo 8 caracteres | "La contraseña debe tener al menos 8 caracteres." |
| Nueva contraseña propia | Entre 8 y 128 caracteres y distinta de la actual | "La nueva contraseña debe tener al menos 8 caracteres." / "La nueva contraseña es demasiado larga." |
| Estado de asistencia | `Presente`, `Ausente`, `Justificado` o `Tardanza` | — |
| Fecha de asistencia | Formato `YYYY-MM-DD` | "La fecha debe tener formato YYYY-MM-DD." |
| Nota | Número entero entre 1 y 10 | "La nota debe ser un número entero entre 1 y 10." |
| Archivo adjunto | PDF o JPG, verificado por tipo MIME; máximo 10 MB | "Solo se permiten archivos PDF o JPG." / "El archivo no puede superar los 10 MB." |
| Campos del perfil | `PATCH /perfil` solo admite correo y teléfono | "El campo '…' no se puede modificar desde el perfil." |

---

<br>

## 7. Limitaciones conocidas

| Limitación | Referencia |
|---|---|
| Los archivos subidos pueden descargarse sin sesión mediante una ruta directa, además de la ruta oficial `GET /adjuntos/{id}/archivo` | `Hardening de Infraestructura y Contenedores.md`, hallazgo H-02 |
| La exportación de reportes genera un archivo JSON, no PDF ni Excel (RF13) | `Testing-01.md`, DEF-02 |
| La comprobación de cédula repetida no normaliza el formato: `1.234.567-8` y `12345678` se aceptan como cédulas distintas | `Testing-02.md`, DEF-09 |
| Los errores de validación se responden con `400` en unas rutas y con `422` en otras | Sección 3.1 de este documento |
| El cambio de contraseña no invalida los tokens ya emitidos, y la limitación de intentos de inicio de sesión no está conectada | `Mecanismos_Autenticacion_Criptografia_INAU.md`, sección 9 |

---

<br>

**Documentos relacionados:** `backend/api-completa/README.md`, `Documento de Reconstruccion - Servidor.md`, `Mecanismos_Autenticacion_Criptografia_INAU.md`, `Hardening de Infraestructura y Contenedores.md`, `Testing-01.md` y `Testing-02.md`.