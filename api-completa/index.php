<?php

/**
 * ==================================================================
 * INDEX.PHP - API COMPLETA: CON ROUTER - LA PUERTA DE ENTRADA
 * ==================================================================
 * TODOS los pedidos entran por aca. No hay un login.php, un
 * productos.php y un borrar.php sueltos: hay UN solo archivo que
 * recibe todo y se lo pasa al router.
 *
 * Es hermana de api-simple/: las dos apps son independientes entre si y
 * responden exactamente igual, pero aca hay mas capas resolviendo
 * cosas por vos en un solo lugar en vez de repetirlas en cada
 * controller - el Router (en vez de un switch), la clase Controller
 * (en vez de funciones sueltas) y el AuthMiddleware (en vez de pedir
 * el login a mano en cada metodo).
 *
 * Lo que hace, en orden:
 *
 *   1. Carga los archivos de cada capa
 *   2. Mira QUE METODO usaron (GET, POST, PATCH, DELETE)
 *   3. Mira QUE DIRECCION pidieron (/productos/3)
 *   4. Se lo entrega al router, que sabe quien lo atiende
 *
 * ------------------------------------------------------------------
 * EL RECORRIDO Y LAS RESPONSABILIDADES:
 *
 *   ROUTER      ¿quien atiende este pedido?
 *      |
 *   MIDDLEWARE  ¿esta logueado? ¿tiene el rol necesario?
 *      |
 *   CONTROLLER  recibe y responde HTTP
 *      |
 *   VALIDATOR   ¿los datos vienen bien?
 *      |
 *   DTO         transporta los datos validos
 *      |
 *   SERVICE     las reglas del negocio
 *      |
 *   REPOSITORY  buscar y guardar
 *
 * Cada pieza conoce solo lo necesario. El controller usa validator, DTO
 * y service; el repository no sabe que existe HTTP y el controller no
 * sabe que es una tabla SQL.
 *
 * ------------------------------------------------------------------
 * NOTA SOBRE EL IDIOMA
 *
 * El codigo (clases, metodos, variables) va en INGLES, que es la
 * convencion en programacion y lo que te vas a encontrar en Laravel,
 * en Symfony y en cualquier proyecto. Las explicaciones y los mensajes
 * quedan en espanol.
 * ==================================================================
 */


// ------------------------------------------------------------------
// 1) CARGAR LOS ARCHIVOS
// Estan agrupados por capa. El orden importa: primero las clases
// padre, despues las hijas.
// ------------------------------------------------------------------

require_once __DIR__ . '/config.php';


/**
 * LIBRERIAS EXTERNAS (las que instalamos con Composer)
 *
 * Esta unica linea carga TODAS las librerias que instalamos.
 */

require_once __DIR__ . '/vendor/autoload.php';


// ------------------------------------------------------------------
// Core: herramientas generales de la API.
// ------------------------------------------------------------------

require_once __DIR__ . '/core/Database.php';
require_once __DIR__ . '/core/Response.php';
require_once __DIR__ . '/core/Token.php';
require_once __DIR__ . '/core/AuthMiddleware.php';
require_once __DIR__ . '/core/Router.php';


// ------------------------------------------------------------------
// Models: las cosas del problema.
// ------------------------------------------------------------------

require_once __DIR__ . '/models/User.php';
require_once __DIR__ . '/models/Alumno.php';


// ------------------------------------------------------------------
// Validators: revisan la forma de los datos de cada endpoint.
// ------------------------------------------------------------------

require_once __DIR__ . '/validators/AuthValidator.php';
require_once __DIR__ . '/validators/AlumnoValidator.php';
require_once __DIR__ . '/validators/TalleristaValidator.php';
require_once __DIR__ . '/validators/TallerValidator.php';
require_once __DIR__ . '/validators/AsignacionValidator.php';
require_once __DIR__ . '/validators/AsistenciaValidator.php';
require_once __DIR__ . '/validators/ContenidoValidator.php';
require_once __DIR__ . '/validators/EntregaValidator.php';
require_once __DIR__ . '/validators/AdjuntoValidator.php';


// ------------------------------------------------------------------
// DTOs: transportan datos ya validados y normalizados.
// ------------------------------------------------------------------

require_once __DIR__ . '/dtos/LoginDTO.php';
require_once __DIR__ . '/dtos/AlumnoDTO.php';
require_once __DIR__ . '/dtos/TalleristaDTO.php';
require_once __DIR__ . '/dtos/TallerDTO.php';
require_once __DIR__ . '/dtos/ContenidoDTO.php';



// ------------------------------------------------------------------
// Repositories: acceso a los datos.
// La clase padre Repository debe cargarse antes que sus hijas.
// ------------------------------------------------------------------

require_once __DIR__ . '/repositories/Repository.php';
require_once __DIR__ . '/repositories/UserRepository.php';
require_once __DIR__ . '/repositories/AlumnoRepository.php';
require_once __DIR__ . '/repositories/TalleristaRepository.php';
require_once __DIR__ . '/repositories/TallerRepository.php';
require_once __DIR__ . '/repositories/AsignacionRepository.php';
require_once __DIR__ . '/repositories/AsistenciaRepository.php';
require_once __DIR__ . '/repositories/ContenidoRepository.php';
require_once __DIR__ . '/repositories/EntregaRepository.php';
require_once __DIR__ . '/repositories/AdjuntoRepository.php';

// ------------------------------------------------------------------
// Services: reglas del negocio.
// ------------------------------------------------------------------

require_once __DIR__ . '/services/AuthService.php';
require_once __DIR__ . '/services/AlumnoService.php';
require_once __DIR__ . '/services/TalleristaService.php';
require_once __DIR__ . '/services/TallerService.php';
require_once __DIR__ . '/services/AsignacionService.php';
require_once __DIR__ . '/services/AsistenciaService.php';
require_once __DIR__ . '/services/ContenidoService.php';
require_once __DIR__ . '/services/EntregaService.php';
require_once __DIR__ . '/services/AdjuntoService.php';

// ------------------------------------------------------------------
// Controllers: puerta de entrada desde HTTP.
// La clase padre Controller debe cargarse antes que sus hijas.
// ------------------------------------------------------------------

require_once __DIR__ . '/controllers/Controller.php';
require_once __DIR__ . '/controllers/AuthController.php';
require_once __DIR__ . '/controllers/AlumnoController.php';
require_once __DIR__ . '/controllers/TalleristaController.php';
require_once __DIR__ . '/controllers/TallerController.php';
require_once __DIR__ . '/controllers/AsignacionController.php';
require_once __DIR__ . '/controllers/AsistenciaController.php';
require_once __DIR__ . '/controllers/ContenidoController.php';
require_once __DIR__ . '/controllers/EntregaController.php';
require_once __DIR__ . '/controllers/AdjuntoController.php';


// NOTA:
// A medida que se construya cada entidad (Talleristas, Talleres,
// Asistencias, Reportes, Contenidos, Entregas, etc.) se agregaran
// aca sus archivos correspondientes.


// ------------------------------------------------------------------
// 2) PERMISOS PARA EL NAVEGADOR (CORS)
// ------------------------------------------------------------------

$origin = $_SERVER['HTTP_ORIGIN'] ?? null;

if ($origin === FRONTEND_ORIGIN) {
    header('Access-Control-Allow-Origin: ' . FRONTEND_ORIGIN);
    header('Access-Control-Allow-Credentials: true');
    header('Vary: Origin');
}

header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');


// El navegador puede enviar OPTIONS antes de determinadas peticiones.
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}


// ------------------------------------------------------------------
// 3) OBTENER METODO Y DIRECCION SOLICITADOS
// ------------------------------------------------------------------

$method = $_SERVER['REQUEST_METHOD'];

$path = parse_url(
    $_SERVER['REQUEST_URI'],
    PHP_URL_PATH
);


// ------------------------------------------------------------------
// 4) ENTREGAR LA PETICION AL ROUTER
// ------------------------------------------------------------------

try {

    $router = require __DIR__ . '/routes.php';

    $router->dispatch($method, $path);
} catch (PDOException $exception) {

    // El detalle se guarda en los logs, no se muestra al cliente.
    error_log($exception->getMessage());

    Response::error(
        'Ocurrio un error interno con la base de datos.',
        500
    );
} catch (Throwable $exception) {

    error_log($exception->getMessage());

    Response::error(
        'Ocurrio un error interno.',
        500
    );
}
