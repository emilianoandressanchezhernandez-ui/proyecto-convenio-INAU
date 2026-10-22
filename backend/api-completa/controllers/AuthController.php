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
     */
    public function login($id = null)
    {
        $data = $this->getJsonBody();

        $errors = AuthValidator::validateLogin($data);

        if (count($errors) > 0) {
            Response::error('Revisá los datos.', 400, $errors);
        }

        $dto = new LoginDTO($data);

        $session = $this->service->login($dto);

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
}
