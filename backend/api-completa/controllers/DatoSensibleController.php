<?php

/**
 * DATOS SENSIBLES (RF24)
 * ------------------------------------------------------------------
 * GET /datos-sensibles  (solo administrador)
 * Devuelve el inventario de datos sensibles, sin valores personales.
 */
class DatoSensibleController extends Controller
{
    private DatoSensibleService $service;

    public function __construct()
    {
        $this->service = new DatoSensibleService();
    }

    public function index(): void
    {
        try {
            $inventario = $this->service->getInventario();

            Response::success(
                $inventario,
                'Inventario de datos sensibles obtenido correctamente.'
            );
        } catch (PDOException $e) {
            // Error de base de datos: lo maneja index.php
            // (guarda el detalle en el log y responde un mensaje genérico).
            throw $e;
        } catch (Exception $e) {
            error_log($e->getMessage());

            Response::error(
                'No se pudo obtener el inventario de datos sensibles.',
                500
            );
        }
    }
}
