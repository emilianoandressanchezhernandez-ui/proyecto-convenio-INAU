<?php

/**
 * ==================================================================
 * EL MAPA DE LA API
 * ==================================================================
 * Todas las direcciones que existen, juntas y en una sola pantalla.
 * Si alguien pregunta "¿qué se le puede pedir a esta API?", se le
 * muestra este archivo y listo.
 *
 * Cada línea se lee así:
 *
 *   método HTTP | dirección | qué clase atiende | qué método
 *
 * ------------------------------------------------------------------
 * La MISMA dirección puede hacer cosas distintas según el método.
 * Por ejemplo:
 *
 *   GET  /alumnos     -> lista alumnos
 *   POST /alumnos     -> crea un alumno
 *
 * Y {id} es un comodín:
 *
 *   /alumnos/1
 *   /alumnos/2
 *   /alumnos/15
 *
 * Ese número le llega al método del controller como parámetro.
 *
 * ------------------------------------------------------------------
 * EL QUINTO PARÁMETRO: EL MIDDLEWARE
 *
 * Ahí se declara quién puede entrar a la ruta:
 *
 *   (nada)             -> ruta pública
 *   'auth'             -> cualquier usuario autenticado
 *   'admin'            -> solo administrador
 *   'tallerista'       -> solo tallerista
 *   'alumno'           -> solo alumno
 *   'admin|tallerista' -> administrador o tallerista
 * ==================================================================
 */

$router = new Router();


// ---- Entrar al sistema -------------------------------------------

// No existe autoregistro público.
// Las cuentas son administradas desde el sistema.

$router->add(
    'POST',
    '/login',
    'AuthController',
    'login'
);

// Logout queda público para poder eliminar incluso una cookie
// vencida o inválida.

$router->add(
    'POST',
    '/logout',
    'AuthController',
    'logout'
);

// Consultar el perfil del usuario actualmente autenticado.

$router->add(
    'GET',
    '/perfil',
    'AuthController',
    'profile',
    'auth'
);

// Modificar correo y/o teléfono del usuario actualmente autenticado.

$router->add(
    'PATCH',
    '/perfil',
    'AuthController',
    'updateProfile',
    'auth'
);


// ---- Alumnos -----------------------------------------------------

// Listar todos los alumnos.

$router->add(
    'GET',
    '/alumnos',
    'AlumnoController',
    'index',
    'admin'
);

// Obtener un alumno por su ID.

$router->add(
    'GET',
    '/alumnos/{id}',
    'AlumnoController',
    'show',
    'admin'
);

// Crear un alumno.

$router->add(
    'POST',
    '/alumnos',
    'AlumnoController',
    'store',
    'admin'
);

// Modificar un alumno existente.

$router->add(
    'PATCH',
    '/alumnos/{id}',
    'AlumnoController',
    'update',
    'admin'
);

// Dar de baja un alumno.

$router->add(
    'DELETE',
    '/alumnos/{id}',
    'AlumnoController',
    'destroy',
    'admin'
);


// ---- Talleristas -------------------------------------------------

// Listar todos los talleristas.

$router->add(
    'GET',
    '/talleristas',
    'TalleristaController',
    'index',
    'admin'
);

// Obtener un tallerista por su ID.

$router->add(
    'GET',
    '/talleristas/{id}',
    'TalleristaController',
    'show',
    'admin'
);

// Crear un tallerista.

$router->add(
    'POST',
    '/talleristas',
    'TalleristaController',
    'store',
    'admin'
);

// Modificar un tallerista existente.

$router->add(
    'PATCH',
    '/talleristas/{id}',
    'TalleristaController',
    'update',
    'admin'
);

// Dar de baja un tallerista.

$router->add(
    'DELETE',
    '/talleristas/{id}',
    'TalleristaController',
    'destroy',
    'admin'
);


// ---- Talleres ----------------------------------------------------

// Listar todos los talleres.

$router->add(
    'GET',
    '/talleres',
    'TallerController',
    'index',
    'admin'
);

// Obtener los talleres relacionados con el usuario autenticado.

$router->add(
    'GET',
    '/mis-talleres',
    'TallerController',
    'misTalleres',
    'auth'
);

// Obtener un taller por su ID.

$router->add(
    'GET',
    '/talleres/{id}',
    'TallerController',
    'show',
    'admin'
);

// Crear un taller.

$router->add(
    'POST',
    '/talleres',
    'TallerController',
    'store',
    'admin'
);

// Modificar un taller existente.

$router->add(
    'PATCH',
    '/talleres/{id}',
    'TallerController',
    'update',
    'admin'
);

// Finalizar un taller.

$router->add(
    'DELETE',
    '/talleres/{id}',
    'TallerController',
    'destroy',
    'admin'
);


// ------------------------------------------------------------------
// ASIGNACIONES DE TALLERISTAS
// Solo el administrador puede gestionar las asignaciones.
// ------------------------------------------------------------------

$router->add(
    'GET',
    '/talleres/{id}/talleristas',
    'AsignacionController',
    'talleristas',
    'admin'
);

$router->add(
    'POST',
    '/talleres/{id}/talleristas',
    'AsignacionController',
    'assignTallerista',
    'admin'
);

$router->add(
    'DELETE',
    '/talleres/{id}/talleristas/{talleristaId}',
    'AsignacionController',
    'removeTallerista',
    'admin'
);


// ------------------------------------------------------------------
// INSCRIPCIONES DE ALUMNOS
// El administrador gestiona las inscripciones.
// El tallerista puede consultar alumnos de sus propios talleres.
// ------------------------------------------------------------------

$router->add(
    'GET',
    '/talleres/{id}/alumnos',
    'AsignacionController',
    'alumnos',
    'admin|tallerista'
);

$router->add(
    'POST',
    '/talleres/{id}/alumnos',
    'AsignacionController',
    'assignAlumno',
    'admin'
);

$router->add(
    'DELETE',
    '/talleres/{id}/alumnos/{alumnoId}',
    'AsignacionController',
    'removeAlumno',
    'admin'
);


// ------------------------------------------------------------------
// ASISTENCIAS
// El administrador y el tallerista pueden consultar y registrar.
// El Service controla que el tallerista pertenezca al taller.
// ------------------------------------------------------------------

$router->add(
    'GET',
    '/talleres/{id}/asistencias',
    'AsistenciaController',
    'byTaller',
    'admin|tallerista'
);

$router->add(
    'POST',
    '/talleres/{id}/asistencias',
    'AsistenciaController',
    'create',
    'admin|tallerista'
);

$router->add(
    'GET',
    '/asistencias/{id}',
    'AsistenciaController',
    'show',
    'admin|tallerista'
);

$router->add(
    'POST',
    '/asistencias/{id}/registros',
    'AsistenciaController',
    'saveRegistro',
    'admin|tallerista'
);


// ------------------------------------------------------------------
// CONTENIDOS
// Materiales y tareas publicados dentro de los talleres.
// ------------------------------------------------------------------

$router->add(
    'GET',
    '/talleres/{id}/contenidos',
    'ContenidoController',
    'byTaller',
    'admin|tallerista|alumno'
);

$router->add(
    'POST',
    '/talleres/{id}/contenidos',
    'ContenidoController',
    'create',
    'admin|tallerista'
);

$router->add(
    'GET',
    '/contenidos/{id}',
    'ContenidoController',
    'show',
    'admin|tallerista|alumno'
);

$router->add(
    'PATCH',
    '/contenidos/{id}',
    'ContenidoController',
    'update',
    'admin|tallerista'
);

$router->add(
    'DELETE',
    '/contenidos/{id}',
    'ContenidoController',
    'delete',
    'admin|tallerista'
);


// ------------------------------------------------------------------
// ENTREGAS Y CORRECCIONES
// Los alumnos realizan entregas y los talleristas las corrigen.
// ------------------------------------------------------------------

// Listar las entregas realizadas para una tarea.

$router->add(
    'GET',
    '/contenidos/{id}/entregas',
    'EntregaController',
    'byContenido',
    'admin|tallerista'
);

// Realizar una entrega para una tarea.

$router->add(
    'POST',
    '/contenidos/{id}/entregas',
    'EntregaController',
    'create',
    'alumno'
);

// Consultar una entrega.

$router->add(
    'GET',
    '/entregas/{id}',
    'EntregaController',
    'show',
    'admin|tallerista|alumno'
);

// Agregar o modificar el comentario de corrección.

$router->add(
    'PATCH',
    '/entregas/{id}/correccion',
    'EntregaController',
    'corregir',
    'admin|tallerista'
);

// Asignar o modificar la nota de una entrega.

$router->add(
    'PATCH',
    '/entregas/{id}/nota',
    'EntregaController',
    'asignarNota',
    'admin|tallerista'
);

// Eliminar la nota de una entrega.
// La entrega y el comentario de corrección se conservan.

$router->add(
    'DELETE',
    '/entregas/{id}/nota',
    'EntregaController',
    'eliminarNota',
    'admin|tallerista'
);


// ------------------------------------------------------------------
// ADJUNTOS
// Archivos asociados a contenidos o entregas.
// ------------------------------------------------------------------

// Listar los adjuntos de una entrega.

$router->add(
    'GET',
    '/entregas/{id}/adjuntos',
    'AdjuntoController',
    'byEntrega',
    'admin|tallerista|alumno'
);

// Subir un archivo a una entrega.
// Solo puede hacerlo el alumno propietario.

$router->add(
    'POST',
    '/entregas/{id}/adjuntos',
    'AdjuntoController',
    'uploadForEntrega',
    'alumno'
);

// Listar los adjuntos de un contenido.

$router->add(
    'GET',
    '/contenidos/{id}/adjuntos',
    'AdjuntoController',
    'byContenido',
    'admin|tallerista|alumno'
);

// Subir un archivo a un contenido.
// El Service comprueba que el tallerista pertenezca al taller.

$router->add(
    'POST',
    '/contenidos/{id}/adjuntos',
    'AdjuntoController',
    'uploadForContenido',
    'admin|tallerista'
);

// Descargar un adjunto.
// Puede pertenecer a un contenido o a una entrega.

$router->add(
    'GET',
    '/adjuntos/{id}/archivo',
    'AdjuntoController',
    'archivo',
    'admin|tallerista|alumno'
);

// Eliminar un adjunto.
// El Service aplica permisos diferentes según su origen.

$router->add(
    'DELETE',
    '/adjuntos/{id}',
    'AdjuntoController',
    'delete',
    'admin|tallerista|alumno'
);

return $router;
