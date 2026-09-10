<?php

/**
 * SERVICE DE AUTENTICACIÓN
 * ==================================================================
 * Reglas de autenticación y gestión del perfil del usuario logueado.
 *
 * - login por correo + contraseña
 * - una cuenta con estado "Inactivo" no puede entrar
 * - el usuario puede consultar su perfil
 * - desde su perfil solo puede modificar correo y teléfono
 *
 * Si el usuario es alumno, correo y teléfono también se actualizan
 * en la tabla alumnos dentro de la misma transacción.
 *
 * NO hay register(): las cuentas las crea el administrador.
 * ==================================================================
 */
class AuthService
{
    private UserRepository $repository;
    private AlumnoRepository $alumnoRepository;

    public function __construct()
    {
        $this->repository = new UserRepository();
        $this->alumnoRepository = new AlumnoRepository();
    }

    /**
     * Iniciar sesión: verifica la contraseña y entrega el token
     * al controller.
     */
    public function login(LoginDTO $dto)
    {
        $user = $this->repository->findByCorreo($dto->getCorreo());

        /**
         * El mensaje es el mismo si el correo no existe o si la
         * contraseña está mal, para no revelar qué correos existen.
         */
        if ($user === null || !$user->checkPassword($dto->getClave())) {
            Response::error('Correo o contraseña incorrectos.', 401);
        }

        if (!$user->isActivo()) {
            Response::error('Tu cuenta está deshabilitada.', 403);
        }

        $this->repository->actualizarUltimoAcceso($user->getId());

        return [
            'token' => Token::create($user),
            'usuario' => $user->toArray(),
        ];
    }

    /**
     * Devuelve los datos del usuario logueado.
     */
    public function getProfile(int $id): array
    {
        $user = $this->repository->findById($id);

        if ($user === null) {
            Response::error('El usuario ya no existe.', 404);
        }

        return $user->toArray();
    }

    /**
     * Actualiza correo y/o teléfono del usuario logueado.
     *
     * Si se trata de un alumno, mantiene sincronizados los datos
     * duplicados de usuarios y alumnos mediante una transacción.
     */
    public function updateProfile(int $id, array $datos): array
    {
        $user = $this->repository->findById($id);

        if ($user === null) {
            Response::error('El usuario ya no existe.', 404);
        }

        if (array_key_exists('correo', $datos)) {
            $datos['correo'] = trim($datos['correo']);

            if (
                $this->repository->correoPerteneceAOtroUsuario(
                    $datos['correo'],
                    $id
                )
            ) {
                Response::error(
                    'El correo ya está siendo utilizado por otro usuario.',
                    409
                );
            }
        }

        $usuarioActual = $user->toArray();
        $alumno = null;

        /**
         * Los alumnos tienen correo y teléfono duplicados en la tabla
         * alumnos. Localizamos primero el registro antes de comenzar
         * la transacción.
         */
        if (($usuarioActual['rol'] ?? null) === 'alumno') {
            $alumno = $this->alumnoRepository->obtenerPorUsuarioId($id);

            if ($alumno === null) {
                Response::error(
                    'No se encontró el perfil de alumno asociado al usuario.',
                    409
                );
            }
        }

        $db = Database::connection();

        try {
            $db->beginTransaction();

            $this->repository->actualizarPerfil($id, $datos);

            if ($alumno !== null) {
                $datosAlumno = [];

                if (array_key_exists('correo', $datos)) {
                    $datosAlumno['correo'] = $datos['correo'];
                }

                if (array_key_exists('telefono', $datos)) {
                    $datosAlumno['telefono'] = $datos['telefono'];
                }

                $this->alumnoRepository->actualizar(
                    (int) $alumno['id'],
                    $datosAlumno
                );
            }

            $db->commit();
        } catch (Throwable $e) {
            if ($db->inTransaction()) {
                $db->rollBack();
            }

            Response::error(
                'No se pudo actualizar el perfil.',
                500
            );
        }

        return $this->getProfile($id);
    }
}
