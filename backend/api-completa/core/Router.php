<?php

/**
 * CLASE ROUTER (enrutador)
 * ==================================================================
 * Es el "recepcionista" de la API: mira qué dirección pidieron y
 * decide QUÉ CONTROLLER y QUÉ MÉTODO la atienden.
 *
 * Antes esto era un switch gigante adentro de index.php. El problema
 * del switch es que crece y crece: con 20 direcciones se vuelve
 * ilegible. Con el router, todas las rutas quedan juntas en una sola
 * tabla (mirá el archivo routes.php) y se leen de un vistazo.
 *
 * Se usa así:
 *
 *     $router->add('GET', '/productos/{id}', 'ProductController', 'getProduct');
 *
 * Que se lee: "si piden GET /productos/5, creá un ProductController
 * y llamá a su método getProduct(5)".
 *
 * También puede recibir más de un parámetro:
 *
 *     /talleres/{id}/alumnos/{alumnoId}
 *
 * Por ejemplo:
 *
 *     /talleres/1/alumnos/3
 *
 * enviará los valores 1 y 3 al método del controller.
 *
 * Hay un quinto parámetro opcional para el middleware (ver más abajo
 * y AuthMiddleware.php):
 *
 *     $router->add(
 *         'DELETE',
 *         '/productos/{id}',
 *         'ProductController',
 *         'deleteProduct',
 *         'admin'
 *     );
 * ==================================================================
 */
class Router
{
    /** Acá se van guardando todas las rutas (endpoints) de la API. */
    private array $routes = [];

    public function add(
        $method,
        $path,
        $controller,
        $action,
        $middleware = null
    ) {
        $this->routes[] = [
            'method' => $method,

            // Guardamos la dirección ya partida en pedazos:
            // '/productos/{id}' -> ['productos', '{id}']
            'parts' => explode('/', trim($path, '/')),

            'controller' => $controller,
            'action' => $action,
            'middleware' => $middleware,
        ];
    }

    /**
     * Busca la ruta que coincide con el pedido y la ejecuta.
     */
    public function dispatch($method, $path)
    {
        // Partimos la dirección que pidieron, igual que las guardadas.
        $requestedParts = explode('/', trim($path, '/'));

        foreach ($this->routes as $route) {

            // ¿Es el mismo método? (GET, POST, PATCH, DELETE...)
            if ($route['method'] !== $method) {
                continue;
            }

            // ¿Tienen la misma cantidad de pedazos?
            if (count($route['parts']) !== count($requestedParts)) {
                continue;
            }

            $matches = true;

            // Acá guardamos TODOS los parámetros encontrados.
            $parameters = [];

            foreach ($route['parts'] as $position => $part) {

                /**
                 * Si empieza con { y termina con }, es un comodín.
                 *
                 * Puede llamarse:
                 *
                 * {id}
                 * {alumnoId}
                 * {talleristaId}
                 *
                 * El nombre no importa para ejecutar el método.
                 * Guardamos el valor según el orden en que aparece.
                 */
                if (
                    str_starts_with($part, '{') &&
                    str_ends_with($part, '}')
                ) {
                    $parameters[] = $requestedParts[$position];
                    continue;
                }

                // Si no es comodín, tiene que coincidir exactamente.
                if ($part !== $requestedParts[$position]) {
                    $matches = false;
                    break;
                }
            }

            if ($matches) {

                /**
                 * Antes de ejecutar el controller, se comprueban
                 * autenticación y permisos.
                 */
                AuthMiddleware::handle($route['middleware']);

                /**
                 * El nombre del controller y del método están guardados
                 * como texto, así que podemos instanciarlos dinámicamente.
                 */
                $class = $route['controller'];
                $action = $route['action'];

                $controller = new $class();

                /**
                 * ...$parameters pasa todos los parámetros encontrados
                 * al método del controller.
                 *
                 * Ejemplo:
                 *
                 * $parameters = [1, 3];
                 *
                 * $controller->$action(...$parameters);
                 *
                 * equivale a:
                 *
                 * $controller->$action(1, 3);
                 */
                $controller->$action(...$parameters);

                return;
            }
        }

        // Si recorrimos toda la tabla y ninguna coincidió...
        Response::error(
            'No existe esa dirección, o no se puede usar con ' .
                $method .
                '.',
            404
        );
    }
}
