<?php

class AsistenciaController extends Controller
{
    private AsistenciaService $service;

    public function __construct()
    {
        $this->service = new AsistenciaService();
    }

    /**
     * GET /mis-asistencias
     */
    public function misAsistencias($id = null): void
    {
        try {
            $usuario = $this->getUsuarioAutenticado();

            $asistencias = $this->service->getMisAsistencias(
                $usuario
            );

            Response::success(
                $asistencias,
                'Tus asistencias se obtuvieron correctamente.'
            );
        } catch (RuntimeException $e) {
            $this->handleRuntimeException($e);
        } catch (Exception $e) {
            $this->handleException($e);
        }
    }

    public function byTaller(int $tallerId): void
    {
        try {
            $usuario = $this->getUsuarioAutenticado();

            $asistencias = $this->service->getByTaller(
                $tallerId,
                $usuario
            );

            Response::success(
                $asistencias,
                'Asistencias obtenidas correctamente.'
            );
        } catch (RuntimeException $e) {
            $this->handleRuntimeException($e);
        } catch (Exception $e) {
            $this->handleException($e);
        }
    }

    public function show(int $id): void
    {
        try {
            $usuario = $this->getUsuarioAutenticado();

            $asistencia = $this->service->getById(
                $id,
                $usuario
            );

            Response::success(
                $asistencia,
                'Asistencia obtenida correctamente.'
            );
        } catch (RuntimeException $e) {
            $this->handleRuntimeException($e);
        } catch (Exception $e) {
            $this->handleException($e);
        }
    }

    public function create(int $tallerId): void
    {
        try {
            $usuario = $this->getUsuarioAutenticado();
            $data = $this->getJsonBody();

            $asistencia = $this->service->create(
                $tallerId,
                $data,
                $usuario
            );

            Response::success(
                $asistencia,
                'Asistencia creada correctamente.',
                201
            );
        } catch (InvalidArgumentException $e) {
            $this->handleValidationException($e);
        } catch (RuntimeException $e) {
            $this->handleRuntimeException($e);
        } catch (Exception $e) {
            $this->handleException($e);
        }
    }

    public function saveRegistro(int $asistenciaId): void
    {
        try {
            $usuario = $this->getUsuarioAutenticado();
            $data = $this->getJsonBody();

            $registro = $this->service->saveRegistro(
                $asistenciaId,
                $data,
                $usuario
            );

            Response::success(
                $registro,
                'Asistencia del alumno guardada correctamente.'
            );
        } catch (InvalidArgumentException $e) {
            $this->handleValidationException($e);
        } catch (RuntimeException $e) {
            $this->handleRuntimeException($e);
        } catch (Exception $e) {
            $this->handleException($e);
        }
    }

    private function getUsuarioAutenticado(): array
    {
        $usuario = AuthMiddleware::user();

        if (!$usuario) {
            Response::error(
                'No se pudo identificar al usuario autenticado.',
                401
            );
        }

        return $usuario;
    }

    // --------------------------------------------------------------
    // Manejo seguro de errores
    // --------------------------------------------------------------

    private function handleValidationException(
        InvalidArgumentException $e
    ): void {
        $errors = json_decode($e->getMessage(), true);

        Response::error(
            'Datos inválidos.',
            422,
            is_array($errors) ? $errors : []
        );
    }

    private function handleRuntimeException(
        RuntimeException $e
    ): void {
        $message = $e->getMessage();

        $forbidden = [
            'Esta consulta está disponible únicamente para alumnos.',
            'No tienes permiso para acceder a las asistencias de este taller.',
            'No tienes permiso para realizar esta acción.'
        ];

        if (
            $e->getCode() === 403 &&
            in_array($message, $forbidden, true)
        ) {
            Response::error($message, 403);
        }

        if (
            $e->getCode() === 404 &&
            $message ===
            'No se encontró el perfil de alumno asociado a tu cuenta.'
        ) {
            Response::error($message, 404);
        }

        $this->handleException($e);
    }

    private function handleException(Exception $e): void
    {
        $message = $e->getMessage();

        $notFound = [
            'Taller no encontrado.',
            'Asistencia no encontrada.',
            'Alumno no encontrado.'
        ];

        if (in_array($message, $notFound, true)) {
            Response::error($message, 404);
        }

        $conflicts = [
            'Ya existe un registro de asistencia para ese taller y fecha.',
            'El alumno está inactivo.',
            'El alumno no está inscripto en este taller.',
            'No se puede registrar asistencia antes de la fecha de inscripción del alumno.',
            'No se puede registrar asistencia en un taller finalizado.'
        ];

        if (in_array($message, $conflicts, true)) {
            Response::error($message, 409);
        }

        error_log($e->getMessage());

        Response::error(
            'No se pudo completar la operación de asistencia.',
            500
        );
    }
}
