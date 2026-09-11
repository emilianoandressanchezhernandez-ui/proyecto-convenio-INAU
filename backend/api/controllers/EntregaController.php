<?php

class EntregaController extends Controller
{
    private EntregaService $service;

    public function __construct()
    {
        $this->service = new EntregaService();
    }

    public function byContenido(int $contenidoId): void
    {
        try {
            $usuario = $this->getUsuarioAutenticado();

            if (!$usuario) {
                return;
            }

            $entregas = $this->service->getByContenido(
                $contenidoId,
                $usuario
            );

            Response::success(
                $entregas,
                'Entregas obtenidas correctamente.'
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

            if (!$usuario) {
                return;
            }

            $entrega = $this->service->getById(
                $id,
                $usuario
            );

            Response::success(
                $entrega,
                'Entrega obtenida correctamente.'
            );
        } catch (RuntimeException $e) {
            $this->handleRuntimeException($e);
        } catch (Exception $e) {
            $this->handleException($e);
        }
    }

    public function create(int $contenidoId): void
    {
        try {
            $usuario = $this->getUsuarioAutenticado();

            if (!$usuario) {
                return;
            }

            $entrega = $this->service->create(
                $contenidoId,
                (int) $usuario['id']
            );

            Response::success(
                $entrega,
                'Entrega realizada correctamente.',
                201
            );
        } catch (RuntimeException $e) {
            $this->handleRuntimeException($e);
        } catch (Exception $e) {
            $this->handleException($e);
        }
    }

    public function corregir(int $id): void
    {
        try {
            $usuario = $this->getUsuarioAutenticado();

            if (!$usuario) {
                return;
            }

            $data = $this->getJsonBody();

            $entrega = $this->service->corregir(
                $id,
                $data,
                $usuario
            );

            Response::success(
                $entrega,
                'Entrega corregida correctamente.'
            );
        } catch (InvalidArgumentException $e) {
            $this->handleValidationException($e);
        } catch (RuntimeException $e) {
            $this->handleRuntimeException($e);
        } catch (Exception $e) {
            $this->handleException($e);
        }
    }

    public function asignarNota(int $id): void
    {
        try {
            $usuario = $this->getUsuarioAutenticado();

            if (!$usuario) {
                return;
            }

            $data = $this->getJsonBody();

            $entrega = $this->service->asignarNota(
                $id,
                $data,
                $usuario
            );

            Response::success(
                $entrega,
                'Nota asignada correctamente.'
            );
        } catch (InvalidArgumentException $e) {
            $this->handleValidationException($e);
        } catch (RuntimeException $e) {
            $this->handleRuntimeException($e);
        } catch (Exception $e) {
            $this->handleException($e);
        }
    }

    public function eliminarNota(int $id): void
    {
        try {
            $usuario = $this->getUsuarioAutenticado();

            if (!$usuario) {
                return;
            }

            $entrega = $this->service->eliminarNota(
                $id,
                $usuario
            );

            Response::success(
                $entrega,
                'Nota eliminada correctamente.'
            );
        } catch (RuntimeException $e) {
            $this->handleRuntimeException($e);
        } catch (Exception $e) {
            $this->handleException($e);
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

    private function handleValidationException(
        InvalidArgumentException $e
    ): void {
        Response::error(
            'Datos inválidos.',
            422,
            json_decode(
                $e->getMessage(),
                true
            ) ?? []
        );
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

    private function handleException(Exception $e): void
    {
        $message = $e->getMessage();

        $status = (
            str_contains($message, 'no encontrado') ||
            str_contains($message, 'no encontrada')
        ) ? 404 : 400;

        Response::error(
            $message,
            $status
        );
    }
}
