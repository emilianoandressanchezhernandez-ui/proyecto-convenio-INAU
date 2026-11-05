<?php

class TerminosController extends Controller
{
    private TerminosService $service;

    public function __construct()
    {
        $this->service = new TerminosService();
    }

    /**
     * GET /terminos
     * Consulta publica de la version vigente.
     */
    public function index($id = null): void
    {
        try {
            $terminos = $this->service->getTerminosActuales();

            Response::success(
                $terminos,
                'Version vigente de los terminos obtenida.'
            );
        } catch (Throwable $e) {
            error_log($e->getMessage());

            Response::error(
                'No se pudieron consultar los terminos.',
                500
            );
        }
    }

    /**
     * GET /terminos/estado
     * Consulta la aceptacion del usuario autenticado.
     */
    public function estado($id = null): void
    {
        try {
            $usuario = AuthMiddleware::user();

            if (!$usuario) {
                Response::error(
                    'Tenes que iniciar sesion.',
                    401
                );
            }

            $estado = $this->service->getEstado(
                (int) $usuario['id']
            );

            Response::success(
                $estado,
                'Estado de aceptacion obtenido.'
            );
        } catch (Throwable $e) {
            error_log($e->getMessage());

            Response::error(
                'No se pudo consultar la aceptacion.',
                500
            );
        }
    }

    /**
     * POST /terminos/aceptar
     * Registra la aceptacion de la version vigente.
     */
    public function aceptar($id = null): void
    {
        try {
            $usuario = AuthMiddleware::user();

            if (!$usuario) {
                Response::error(
                    'Tenes que iniciar sesion.',
                    401
                );
            }

            $data = $this->getJsonBody();

            $version = $data['version'] ?? null;
            $acepta = $data['acepta'] ?? null;

            if (
                !is_string($version) ||
                !is_bool($acepta)
            ) {
                Response::error(
                    'Debes indicar una version y una aceptacion valida.',
                    422
                );
            }

            $estado = $this->service->aceptar(
                (int) $usuario['id'],
                $version,
                $acepta
            );

            Response::success(
                $estado,
                'Terminos aceptados correctamente.'
            );
        } catch (InvalidArgumentException $e) {
            $mensajesPermitidos = [
                'Debés aceptar los términos para registrar la aceptación.',
                'La versión de los términos no es la vigente.'
            ];

            if (in_array($e->getMessage(), $mensajesPermitidos, true)) {
                Response::error($e->getMessage(), 422);
            }

            error_log($e->getMessage());

            Response::error(
                'No se pudo validar la aceptacion.',
                500
            );
        } catch (Throwable $e) {
            error_log($e->getMessage());

            Response::error(
                'No se pudo registrar la aceptacion.',
                500
            );
        }
    }
}
