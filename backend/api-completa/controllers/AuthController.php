<?php

/**
 * CONTROLLER DE AUTENTICACIÓN
 * ==================================================================
 * Login, logout y perfil.
 *
 * No hay register(): las cuentas las crea el administrador.
 * ==================================================================
 */
class AuthController extends Controller
{
    private AuthService $service;

    public function __construct()
    {
        $this->service = new AuthService();
    }

    /**
     * POST /login
     * Recibe: { "correo": "...", "clave": "..." }
     *
     * Límite de intentos: máximo 5 intentos cada 5 minutos
     * por cada combinación de IP + correo. Si se supera, responde 429.
     * Un login correcto borra los intentos acumulados.
     */
    public function login($id = null)
    {
        $data = $this->getJsonBody();

        $errors = AuthValidator::validateLogin($data);

        if (count($errors) > 0) {
            Response::error('Revisá los datos.', 400, $errors);
        }

        $dto = new LoginDTO($data);

        // Contar este intento. Si ya hubo 5 en los últimos 5 minutos
        // para esta IP y este correo, RateLimiter responde 429 y corta.
        $limiter = RateLimiter::check(
            5,
            300,
            'login',
            RateLimiter::clientIp() . '|' . $dto->getCorreo(),
            'Demasiados intentos de inicio de sesión. Esperá unos minutos e intentá de nuevo.'
        );

        // Si la contraseña es incorrecta, el service responde 401 y corta;
        // por eso la línea siguiente solo se ejecuta si el login fue correcto.
        $session = $this->service->login($dto);

        // Login correcto: se borran los intentos acumulados.
        $limiter->reset();

        Token::sendCookie($session['token']);

        unset($session['token']);

        Response::success($session, 'Sesión iniciada.');
    }

    /** POST /logout */
    public function logout($id = null)
    {
        Token::clearCookie();

        Response::success(null, 'Sesión cerrada.');
    }

    /**
     * GET /perfil
     * Devuelve los datos del usuario logueado.
     */
    public function profile($id = null)
    {
        $user = $this->service->getProfile(
            $this->user()['id']
        );

        Response::success($user);
    }

    /**
     * PATCH /perfil
     * Permite modificar correo y/o teléfono.
     */
    public function updateProfile($id = null)
    {
        $data = $this->getJsonBody();

        $errors = AuthValidator::validateProfileUpdate($data);

        if (count($errors) > 0) {
            Response::error(
                'Revisá los datos.',
                400,
                $errors
            );
        }

        $user = $this->service->updateProfile(
            $this->user()['id'],
            $data
        );

        Response::success(
            $user,
            'Perfil actualizado.'
        );
    }

    /**
     * PATCH /perfil/clave
     * Cambia la contraseña del usuario autenticado.
     */
    public function changePassword($id = null)
    {
        $data = $this->getJsonBody();

        $errors = AuthValidator::validatePasswordChange($data);

        if (count($errors) > 0) {
            Response::error(
                'Revisá los datos.',
                400,
                $errors
            );
            return;
        }

        $this->service->changePassword(
            (int) $this->user()['id'],
            $data['clave_actual'],
            $data['clave_nueva']
        );

        Response::success(
            null,
            'Contraseña actualizada correctamente.'
        );
    }
}
