<?php

/**
 * CLASE AUTHMIDDLEWARE
 * ==================================================================
 * Se ejecuta antes del controller y controla si una ruta requiere:
 *
 * - null                 -> ruta publica
 * - auth                 -> cualquier usuario autenticado
 * - admin                -> solo administrador
 * - tallerista           -> solo tallerista
 * - alumno               -> solo alumno
 * - admin|tallerista     -> cualquiera de esos roles
 *
 * El requisito se define directamente en routes.php.
 */

class AuthMiddleware
{
    /**
     * Usuario obtenido del token.
     *
     * Se guarda para que los controllers puedan acceder al usuario
     * autenticado sin tener que volver a leer el token.
     */
    private static ?array $user = null;

    /**
     * Ejecuta el control de acceso de la ruta.
     */
    public static function handle(?string $requirement): void
    {
        // Ruta publica.
        if ($requirement === null) {
            return;
        }

        // Busca y valida el JWT guardado en la cookie.
        $user = Token::read();

        // No hay sesion valida.
        if ($user === null) {
            Response::error(
                'Tenes que iniciar sesion.',
                401
            );
        }

        // Guardamos el usuario autenticado.
        self::$user = $user;

        // "auth" permite entrar a cualquier usuario autenticado.
        if ($requirement === 'auth') {
            return;
        }

        // Permite declarar uno o varios roles:
        // 'admin'
        // 'tallerista'
        // 'alumno'
        // 'admin|tallerista'
        $allowedRoles = explode('|', $requirement);

        if (!in_array($user['rol'], $allowedRoles, true)) {
            Response::error(
                'No tenes permisos para hacer esto.',
                403
            );
        }
    }

    /**
     * Devuelve el usuario autenticado.
     */
    public static function user(): ?array
    {
        return self::$user;
    }
}
