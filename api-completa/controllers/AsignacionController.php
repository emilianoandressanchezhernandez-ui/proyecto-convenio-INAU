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
            $status = $e->getMessage() === 'Taller no encontrado.'
                ? 404
                : 400;

            Response::error(
                $e->getMessage(),
                $status
            );
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
            $errors = json_decode($e->getMessage(), true);

            Response::error(
                'Los datos ingresados no son válidos.',
                422,
                is_array($errors)
                    ? $errors
                    : [$e->getMessage()]
            );
        } catch (Exception $e) {
            $status = in_array(
                $e->getMessage(),
                [
                    'Taller no encontrado.',
                    'Tallerista no encontrado.'
                ],
                true
            ) ? 404 : 400;

            Response::error(
                $e->getMessage(),
                $status
            );
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
            $status = $e->getMessage() === 'Taller no encontrado.'
                ? 404
                : 400;

            Response::error(
                $e->getMessage(),
                $status
            );
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
                return;
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
            $status = $e->getCode() === 403
                ? 403
                : 400;

            Response::error(
                $e->getMessage(),
                $status
            );
        } catch (Exception $e) {
            $status = $e->getMessage() === 'Taller no encontrado.'
                ? 404
                : 400;

            Response::error(
                $e->getMessage(),
                $status
            );
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
            $errors = json_decode($e->getMessage(), true);

            Response::error(
                'Los datos ingresados no son válidos.',
                422,
                is_array($errors)
                    ? $errors
                    : [$e->getMessage()]
            );
        } catch (Exception $e) {
            $status = in_array(
                $e->getMessage(),
                [
                    'Taller no encontrado.',
                    'Alumno no encontrado.'
                ],
                true
            ) ? 404 : 400;

            Response::error(
                $e->getMessage(),
                $status
            );
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
            $status = $e->getMessage() === 'Taller no encontrado.'
                ? 404
                : 400;

            Response::error(
                $e->getMessage(),
                $status
            );
        }
    }
}
