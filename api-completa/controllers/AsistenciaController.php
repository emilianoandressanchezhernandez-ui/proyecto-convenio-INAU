<?php

class AsistenciaController extends Controller
{
    private AsistenciaService $service;

    public function __construct()
    {
        $this->service = new AsistenciaService();
    }

    public function byTaller(int $tallerId): void
    {
        try {
            $usuario = $this->getUsuarioAutenticado();

            if (!$usuario) {
                return;
            }

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
            $status = $e->getMessage() === 'Taller no encontrado.'
                ? 404
                : 400;

            Response::error(
                $e->getMessage(),
                $status
            );
        }
    }

    public function show(int $id): void
    {
        try {
            $usuario = $this->getUsuarioAutenticado();

            if (!$usuario) {
                return;
            }

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
            $status = $e->getMessage() === 'Asistencia no encontrada.'
                ? 404
                : 400;

            Response::error(
                $e->getMessage(),
                $status
            );
        }
    }

    public function create(int $tallerId): void
    {
        try {
            $usuario = $this->getUsuarioAutenticado();

            if (!$usuario) {
                return;
            }

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
            Response::error(
                'Datos inválidos.',
                422,
                json_decode($e->getMessage(), true) ?? []
            );
        } catch (RuntimeException $e) {
            $this->handleRuntimeException($e);
        } catch (Exception $e) {
            $status = str_contains(
                $e->getMessage(),
                'no encontrado'
            ) ? 404 : 400;

            Response::error(
                $e->getMessage(),
                $status
            );
        }
    }

    public function saveRegistro(int $asistenciaId): void
    {
        try {
            $usuario = $this->getUsuarioAutenticado();

            if (!$usuario) {
                return;
            }

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
            Response::error(
                'Datos inválidos.',
                422,
                json_decode($e->getMessage(), true) ?? []
            );
        } catch (RuntimeException $e) {
            $this->handleRuntimeException($e);
        } catch (Exception $e) {
            $message = $e->getMessage();

            $status = (
                str_contains($message, 'no encontrada') ||
                str_contains($message, 'no encontrado')
            ) ? 404 : 400;

            Response::error(
                $message,
                $status
            );
        }
    }

    private function getUsuarioAutenticado(): ?array
    {
        $usuario = AuthMiddleware::user();

        if (!$usuario) {
            Response::error(
                'No se pudo identificar al usuario autenticado.',
                401
            );

            return null;
        }

        return $usuario;
    }

    private function handleRuntimeException(
        RuntimeException $e
    ): void {
        $status = $e->getCode() === 403
            ? 403
            : 400;

        Response::error(
            $e->getMessage(),
            $status
        );
    }
}
