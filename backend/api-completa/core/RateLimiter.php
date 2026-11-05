<?php

// FilesystemAdapter es una forma de cache de Symfony.
// En vez de guardar el conteo nosotros en un JSON, Symfony guarda su propio
// estado dentro de storage/cache.
use Symfony\Component\Cache\Adapter\FilesystemAdapter;

// RateLimiterFactory crea limitadores. No limita por si sola: fabrica un
// limiter configurado con una regla, por ejemplo "60 pedidos por minuto".
use Symfony\Component\RateLimiter\RateLimiterFactory;

// CacheStorage conecta el rate limiter con un lugar donde guardar estado.
// El rate limiter necesita recordar requests anteriores para saber si la IP
// ya paso el limite.
use Symfony\Component\RateLimiter\Storage\CacheStorage;

/**
 * RATE LIMITER CON LIBRERIA
 * ------------------------------------------------------------------
 * Objetivo: evitar que una misma IP haga demasiadas peticiones seguidas.
 *
 * Si una IP supera el limite, la API responde:
 *
 *   429 Too Many Requests
 *
 * Este archivo NO implementa el algoritmo a mano. Para eso usamos la libreria
 * symfony/rate-limiter, instalada con Composer.
 *
 * Nuestra clase solo hace de "adaptador" entre Symfony y nuestra API:
 * - configura el limite;
 * - identifica al cliente por IP (o por la clave que se le indique);   // CAMBIO
 * - consume 1 permiso por request;
 * - responde JSON si ya no quedan permisos.
 */
class RateLimiter
{
    /**
     * Revisa si la request actual puede pasar.
     *
     * Ejemplos:
     *
     *   RateLimiter::check(300, 60, 'api');
     *
     *   Maximo 300 peticiones cada 60 segundos por IP.
     *
     *   RateLimiter::check(5, 300, 'login', $ip . '|' . $correo, 'Mensaje');   // CAMBIO
     *
     *   Maximo 5 intentos cada 5 minutos para esa IP y ese correo,
     *   con un mensaje propio.
     *
     * Devuelve el limiter para que quien lo llama pueda reiniciarlo
     * con $limiter->reset() (por ejemplo, despues de un login correcto).
     */
    public static function check(                                            // CAMBIO
        $maxRequests = 60,
        $seconds = 60,
        $id = 'api',
        $key = null,
        $message = 'Demasiadas peticiones. Espera unos segundos antes de intentar de nuevo.'
    ) {
        /**
         * 1) STORAGE: donde Symfony guarda el estado del limite.
         *
         * HTTP no recuerda nada entre una request y otra. Entonces el limiter
         * necesita guardar algo como: "esta IP ya hizo X pedidos".
         *
         * Usamos FilesystemAdapter porque es simple para aprender y funciona
         * sin Redis ni base de datos extra.
         *
         * Importante: no estamos leyendo ni escribiendo archivos a mano.
         * Symfony Cache se encarga de eso por nosotros.
         */
        $storage = new CacheStorage(
            new FilesystemAdapter(
                'rate_limiter',              // nombre interno del grupo de cache
                0,                           // tiempo por defecto; 0 deja que Symfony decida
                __DIR__ . '/../storage/cache' // carpeta donde Symfony guarda su cache
            )
        );

        /**
         * 2) FACTORY: configuracion del limite.
         *
         * id:
         *   Nombre del limiter. Sirve para que un limite no se mezcle con
         *   otro (por ejemplo, 'api' y 'login' llevan contadores separados).   // CAMBIO
         *
         * policy: sliding_window
         *   "Ventana deslizante". Mira los pedidos recientes de forma mas
         *   pareja que una ventana fija. Para una API es una buena opcion base.
         *
         * limit:
         *   Cantidad maxima de pedidos permitidos.
         *
         * interval:
         *   Periodo de tiempo donde se cuenta ese limite.
         */
        $factory = new RateLimiterFactory([
            'id' => $id,                                                     // CAMBIO
            'policy' => 'sliding_window',
            'limit' => $maxRequests,
            'interval' => $seconds . ' seconds',
        ], $storage);

        /**
         * 3) KEY: a quien estamos limitando.
         *
         * Si no se indica una clave, se usa la IP real del cliente.          // CAMBIO
         * Con factory->create($clave), Symfony crea un contador separado
         * para cada clave.
         */
        $clientKey = $key ?? self::clientIp();                               // CAMBIO
        $limiter = $factory->create($clientKey);                             // CAMBIO

        /**
         * 4) CONSUMIR 1 PERMISO.
         *
         * Cada request consume 1 "token" o permiso.
         * Si todavia quedan permisos, isAccepted() devuelve true.
         * Si ya se acabo el limite, devuelve false.
         */
        $limit = $limiter->consume(1);

        /**
         * 5) HEADERS INFORMATIVOS.
         *
         * No son obligatorios, pero ayudan a depurar y son comunes en APIs.
         */
        header('X-RateLimit-Limit: ' . $limit->getLimit());
        header('X-RateLimit-Remaining: ' . $limit->getRemainingTokens());

        // Si Symfony acepta la request, la API sigue. Se devuelve el      // CAMBIO
        // limiter por si quien llamo necesita reiniciarlo.
        if ($limit->isAccepted()) {
            return $limiter;                                                 // CAMBIO
        }

        /**
         * 6) SI NO QUEDAN PERMISOS.
         *
         * Symfony nos dice cuando conviene intentar de nuevo.
         * Lo convertimos a segundos para mandarlo en Retry-After y en el JSON.
         */
        $retryAfter = max(1, $limit->getRetryAfter()->getTimestamp() - time());

        // Header estandar: cuantos segundos deberia esperar el cliente.
        header('Retry-After: ' . $retryAfter);

        // Nuestra respuesta JSON normal, pero con status HTTP 429.
        Response::error(
            $message,                                                        // CAMBIO
            429,
            ['retry_after' => $retryAfter]
        );
    }

    /**
     * IP REAL DEL CLIENTE.                                                   // CAMBIO (método nuevo)
     *
     * En el servidor, Nginx recibe el pedido y se lo pasa a la API.
     * Por eso REMOTE_ADDR es la IP interna de Docker (la misma para todos)
     * y la IP del usuario llega en la cabecera X-Real-IP.
     *
     * Solo se confia en esa cabecera si el pedido viene del proxy. Si
     * alguien se conecta directo a la API, se usa su REMOTE_ADDR, asi no
     * puede inventar una IP falsa para saltarse el limite.
     */
    public static function clientIp(): string
    {
        $remote = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $realIp = $_SERVER['HTTP_X_REAL_IP'] ?? '';

        if (self::isTrustedProxy($remote) && filter_var($realIp, FILTER_VALIDATE_IP)) {
            return $realIp;
        }

        return $remote;
    }

    /**
     * PROXY DE CONFIANZA.                                                    // CAMBIO (método nuevo)
     *
     * Acepta localhost y la red interna de Docker (172.16.0.0/12),
     * que es desde donde llegan los pedidos que reenvia Nginx.
     */
    private static function isTrustedProxy(string $ip): bool
    {
        if ($ip === '127.0.0.1' || $ip === '::1') {
            return true;
        }

        $long = ip2long($ip);

        return $long !== false && ($long & 0xFFF00000) === ip2long('172.16.0.0');
    }
}