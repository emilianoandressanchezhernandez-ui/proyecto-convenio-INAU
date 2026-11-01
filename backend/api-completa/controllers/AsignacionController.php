<?php

class AsignacionController extends Controller
{
    private AsignacionService $service;

    public function __construct()
    {
        $this->service = new AsignacionService();
    }

    // --------------------------------------------------------------
    // Talleristas
    // --------------------------------------------------------------

    public function talleristas(int $tallerId): void
    {
        try {
            $talleristas = $this->service->getTalleristas($tallerId);

            Response::success(
                $talleristas,
                'Talleristas del taller obtenidos correctamente.'
            );
        } catch (Exception $e) {
            $this->handleException($e);
        }
    }

    public function assignTallerista(int $tallerId): void
    {
        try {
            $data = $this->getJsonBody();

            $assignment = $this->service->assignTallerista(
                $tallerId,
                $data
            );

            Response::success(
                $assignment,
                'Tallerista asignado correctamente.',
                201
            );
        } catch (InvalidArgumentException $e) {
            $this->handleValidationException($e);
        } catch (Exception $e) {
            $this->handleException($e);
        }
    }

    public function removeTallerista(
        int $tallerId,
        int $talleristaId
    ): void {
        try {
            $this->service->removeTallerista(
                $tallerId,
                $talleristaId
            );

            Response::success(
                null,
                'Tallerista desasignado correctamente.'
            );
        } catch (Exception $e) {
            $this->handleException($e);
        }
    }

    // --------------------------------------------------------------
    // Alumnos
    // --------------------------------------------------------------

    public function alumnos(int $tallerId): void
    {
        try {
            $usuario = AuthMiddleware::user();

            if (!$usuario) {
                Response::error(
                    'No se pudo identificar al usuario autenticado.',
                    401
                );
            }

            $alumnos = $this->service->getAlumnos(
                $tallerId,
                $usuario
            );

            Response::success(
                $alumnos,
                'Alumnos del taller obtenidos correctamente.'
            );
        } catch (RuntimeException $e) {
            if (
                $e->getCode() === 403 &&
                $e->getMessage() ===
                'No tienes permiso para consultar los alumnos de este taller.'
            ) {
                Response::error($e->getMessage(), 403);
            }

            $this->handleException($e);
        } catch (Exception $e) {
            $this->handleException($e);
        }
    }

    public function assignAlumno(int $tallerId): void
    {
        try {
            $data = $this->getJsonBody();

            $assignment = $this->service->assignAlumno(
                $tallerId,
                $data
            );

            Response::success(
                $assignment,
                'Alumno inscripto correctamente.',
                201
            );
        } catch (InvalidArgumentException $e) {
            $this->handleValidationException($e);
        } catch (Exception $e) {
            $this->handleException($e);
        }
    }

    public function removeAlumno(
        int $tallerId,
        int $alumnoId
    ): void {
        try {
            $this->service->removeAlumno(
                $tallerId,
                $alumnoId
            );

            Response::success(
                null,
                'Alumno desinscripto correctamente.'
            );
        } catch (Exception $e) {
            $this->handleException($e);
        }
    }

    // --------------------------------------------------------------
    // Manejo seguro de errores
    // --------------------------------------------------------------

    private function handleValidationException(
        InvalidArgumentException $e
    ): void {
        $errors = json_decode($e->getMessage(), true);

        Response::error(
            'Los datos ingresados no son válidos.',
            422,
            is_array($errors)
                ? $errors
                : ['datos' => $e->getMessage()]
        );
    }

    private function handleException(Exception $e): void
    {
        $message = $e->getMessage();

        $notFound = [
            'Taller no encontrado.',
            'Tallerista no encontrado.',
            'Alumno no encontrado.'
        ];

        if (in_array($message, $notFound, true)) {
            Response::error($message, 404);
        }

        $conflicts = [
            'No se puede asignar un tallerista inactivo.',
            'El tallerista ya está asignado a este taller.',
            'El tallerista no está asignado a este taller.',
            'No se puede inscribir un alumno inactivo.',
            'El alumno ya está inscripto en este taller.',
            'El alumno no está inscripto en este taller.',
            'No se pueden realizar asignaciones en un taller finalizado.'
        ];

        if (in_array($message, $conflicts, true)) {
            Response::error($message, 409);
        }

        error_log($e->getMessage());

        Response::error(
            'No se pudo completar la operación solicitada.',
            500
        );
    }
}
