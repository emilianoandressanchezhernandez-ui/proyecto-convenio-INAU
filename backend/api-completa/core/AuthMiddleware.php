<?php

/**
 * Controla la autenticacion, los permisos por rol
 * y, cuando se habilite, la aceptacion de terminos.
 */
class AuthMiddleware
{
    private static ?array $user = null;

    /**
     * MODO DE PREPARACION.
     *
     * No activar hasta que los documentos esten
     * aprobados y el flujo de aceptacion funcione.
     */
    private const TERMINOS_OBLIGATORIOS = true;

    public static function handle(
        ?string $requirement,
        ?string $method = null,
        ?string $path = null
    ): void {

        // Las rutas publicas no requieren autenticacion.
       public static function handle(?string $requirement): void
    {
        // Ruta publica.
        if ($requirement === null) {
            return;
        }

        // Validar la sesion mediante el JWT.
        $user = Token::read();

        if ($user === null) {
            Response::error(
                'Tenes que iniciar sesion.',
                401
            );
        }

        // Comprobar contra la base que la sesión siga siendo válida:      
        // el usuario existe, está activo y no cambió su contraseña.       
        $actual = (new UserRepository())->findById((int) ($user['id'] ?? 0)); 
                                                                           
        if (                                                               
            $actual === null ||                                            
            !$actual->isActivo() ||                                       
            !hash_equals(                                                 
                $actual->getPasswordFingerprint(),                         
                (string) ($user['kv'] ?? '')                               
            )                                                              
        ) {                                                                
            Token::clearCookie();                                          
                                                                           
            Response::error(                                               
                'Tu sesión ya no es válida. Iniciá sesión de nuevo.',      
                401                                                        
            );                                                             
        }                                                                  
                                                                           
        // El rol se toma de la base, no del token.                        
        $user['rol'] = $actual->getRole();                                 

        // Guardamos el usuario autenticado.
        self::$user = $user;

        // Primero comprobar los permisos por rol.
        if ($requirement !== 'auth') {
            $allowedRoles = explode('|', $requirement);

            if (!in_array(
                $user['rol'] ?? null,
                $allowedRoles,
                true
            )) {
                Response::error(
                    'No tenes permisos para hacer esto.',
                    403
                );
            }
        }

        // Preparado para comprobar la aceptacion.
        // Por ahora no bloquea ningun endpoint.
        if (self::TERMINOS_OBLIGATORIOS) {
            self::verificarAceptacionTerminos(
                $user,
                $method,
                $path
            );
        }
    }

    /**
     * Comprueba que el usuario haya aceptado
     * la version vigente de los terminos.
     */
    private static function verificarAceptacionTerminos(
        array $user,
        ?string $method,
        ?string $path
    ): void {

        // Rutas que deben seguir disponibles
        // aunque el usuario todavia no haya aceptado.
        $rutasPermitidas = [
            'GET /perfil',
            'GET /terminos/estado',
            'POST /terminos/aceptar',
            'POST /logout'
        ];

        $rutaActual = $method . ' ' . $path;

        if (in_array($rutaActual, $rutasPermitidas, true)) {
            return;
        }

        // No permitir pasar si el token no tiene
        // un identificador de usuario valido.
        $usuarioId = filter_var(
            $user['id'] ?? null,
            FILTER_VALIDATE_INT,
            ['options' => ['min_range' => 1]]
        );

        if ($usuarioId === false) {
            Response::error(
                'No se pudo verificar la identidad del usuario.',
                401
            );
        }

        $repository = new TerminosRepository();

        $aceptado = $repository->haAceptado(
            (int) $usuarioId,
            TerminosService::VERSION_ACTUAL
        );

        if (!$aceptado) {
            Response::error(
                'Debes aceptar los terminos vigentes para continuar.',
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
