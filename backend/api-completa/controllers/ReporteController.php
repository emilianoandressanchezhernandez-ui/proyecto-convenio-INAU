<?php

class ReporteController extends Controller
{
    private ReporteService $service;

    public function __construct()
    {
        $this->service = new ReporteService();
    }

    // --------------------------------------------------------------
    // Listar todos los reportes
    // GET /reportes
    // Solo administrador
    // --------------------------------------------------------------

    public function index(): void
    {
        try {
            $reportes = $this->service->getAll();

            Response::success(
                $reportes,
                'Reportes obtenidos correctamente.'
            );
        } catch (Exception $e) {
            error_log($e->getMessage());

            Response::error(
                'No se pudieron obtener los reportes.',
                500
            );
        }
    }

    // --------------------------------------------------------------
    // Consultar un reporte
    // GET /reportes/{id}
    // Solo administrador
    // --------------------------------------------------------------

    public function show(int $id): void
    {
        try {
            $reporte = $this->service->getById($id);

            Response::success(
                $reporte,
                'Reporte obtenido correctamente.'
            );
        } catch (Exception $e) {
            $status = $e->getMessage() ===
                'Reporte no encontrado.'
                ? 404
                : 500;

            if ($status === 500) {
                error_log($e->getMessage());
            }

            Response::error(
                $status === 404
                    ? 'Reporte no encontrado.'
                    : 'No se pudo consultar el reporte.',
                $status
            );
        }
    }

    // --------------------------------------------------------------
    // Generar y guardar un reporte
    // POST /reportes
    // Solo administrador
    // --------------------------------------------------------------

    public function store(): void
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

            $data = $this->getJsonBody();

            $reporte = $this->service->create(
                $data,
                $usuario
            );

            Response::success(
                $reporte,
                'Reporte generado correctamente.',
                201
            );
        } catch (InvalidArgumentException $e) {
            $errores = json_decode(
                $e->getMessage(),
                true
            );

            Response::error(
                'Los datos ingresados no son válidos.',
                422,
                is_array($errores)
                    ? $errores
                    : [$e->getMessage()]
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
            $status = $e->getMessage() ===
                'Taller no encontrado.'
                ? 404
                : 500;

            if ($status === 500) {
                error_log($e->getMessage());
            }

            Response::error(
                $status === 404
                    ? 'Taller no encontrado.'
                    : 'No se pudo generar el reporte.',
                $status
            );
        }
    }

    // --------------------------------------------------------------
    // Listar reportes accesibles para el usuario
    // GET /mis-reportes
    // Administrador o tallerista
    // --------------------------------------------------------------

    public function misReportes(): void
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

            $reportes = $this->service->getMisReportes(
                $usuario
            );

            Response::success(
                $reportes,
                'Reportes del usuario obtenidos correctamente.'
            );
        } catch (RuntimeException $e) {
            Response::error(
                $e->getMessage(),
                $e->getCode() === 403 ? 403 : 400
            );
        } catch (Exception $e) {
            error_log($e->getMessage());

            Response::error(
                'No se pudieron consultar los reportes del usuario.',
                500
            );
        }
    }

    // --------------------------------------------------------------
    // Consultar un reporte autorizado
    // GET /mis-reportes/{id}
    // Administrador o tallerista asignado
    // --------------------------------------------------------------

    public function miReporte(int $id): void
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

            $reporte = $this->service->getMiReporteById(
                $id,
                $usuario
            );

            Response::success(
                $reporte,
                'Reporte obtenido correctamente.'
            );
        } catch (RuntimeException $e) {
            Response::error(
                $e->getMessage(),
                $e->getCode() === 403 ? 403 : 400
            );
        } catch (Exception $e) {
            $status = $e->getMessage() ===
                'Reporte no encontrado.'
                ? 404
                : 500;

            if ($status === 500) {
                error_log($e->getMessage());
            }

            Response::error(
                $status === 404
                    ? 'Reporte no encontrado.'
                    : 'No se pudo consultar el reporte.',
                $status
            );
        }
    }
}
