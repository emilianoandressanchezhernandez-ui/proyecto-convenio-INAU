<?php

class ContenidoController extends Controller
{
    private ContenidoService $service;

    public function __construct()
    {
        $this->service = new ContenidoService();
    }

    public function byTaller(int $tallerId): void
    {
        try {
            $usuario = $this->getUsuarioAutenticado();

            if (!$usuario) {
                return;
            }

            $contenidos = $this->service->getByTaller(
                $tallerId,
                $usuario
            );

            Response::success(
                $contenidos,
                'Contenidos obtenidos correctamente.'
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

            $contenido = $this->service->getById(
                $id,
                $usuario
            );

            Response::success(
                $contenido,
                'Contenido obtenido correctamente.'
            );
        } catch (RuntimeException $e) {
            $this->handleRuntimeException($e);
        } catch (Exception $e) {
            $status = $e->getMessage() === 'Contenido no encontrado.'
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

            $contenido = $this->service->create(
                $tallerId,
                $data,
                $usuario
            );

            Response::success(
                $contenido,
                'Contenido creado correctamente.',
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

    public function update(int $id): void
    {
        try {
            $usuario = $this->getUsuarioAutenticado();

            if (!$usuario) {
                return;
            }

            $data = $this->getJsonBody();

            $contenido = $this->service->update(
                $id,
                $data,
                $usuario
            );

            Response::success(
                $contenido,
                'Contenido actualizado correctamente.'
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

    public function delete(int $id): void
    {
        try {
            $usuario = $this->getUsuarioAutenticado();

            if (!$usuario) {
                return;
            }

            $this->service->delete(
                $id,
                $usuario
            );

            Response::success(
                null,
                'Contenido eliminado correctamente.'
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
