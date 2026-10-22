<?php

class TalleristaController extends Controller
{
    private TalleristaService $service;

    public function __construct()
    {
        $this->service = new TalleristaService();
    }

    public function index(): void
    {
        try {
            $talleristas = $this->service->getAll();

            Response::success(
                $talleristas,
                'Talleristas obtenidos correctamente.'
            );
        } catch (Exception $e) {
            Response::error(
                'No se pudieron obtener los talleristas.',
                500,
                [$e->getMessage()]
            );
        }
    }

    public function show(int $id): void
    {
        try {
            $tallerista = $this->service->getById($id);

            Response::success(
                $tallerista,
                'Tallerista obtenido correctamente.'
            );
        } catch (Exception $e) {
            Response::error(
                $e->getMessage(),
                404
            );
        }
    }

    public function store(): void
    {
        try {
            $data = $this->getJsonBody();

            $tallerista = $this->service->create($data);

            Response::success(
                $tallerista,
                'Tallerista creado correctamente.',
                201
            );
        } catch (InvalidArgumentException $e) {
            $errores = json_decode($e->getMessage(), true);

            Response::error(
                'Los datos ingresados no son válidos.',
                422,
                is_array($errores) ? $errores : [$e->getMessage()]
            );
        } catch (Exception $e) {
            Response::error(
                $e->getMessage(),
                400
            );
        }
    }

    public function update(int $id): void
    {
        try {
            $data = $this->getJsonBody();

            $tallerista = $this->service->update($id, $data);

            Response::success(
                $tallerista,
                'Tallerista actualizado correctamente.'
            );
        } catch (InvalidArgumentException $e) {
            $errores = json_decode($e->getMessage(), true);

            Response::error(
                'Los datos ingresados no son válidos.',
                422,
                is_array($errores) ? $errores : [$e->getMessage()]
            );
        } catch (Exception $e) {
            $status = $e->getMessage() === 'Tallerista no encontrado.'
                ? 404
                : 400;

            Response::error(
                $e->getMessage(),
                $status
            );
        }
    }

    public function destroy(int $id): void
    {
        try {
            $this->service->deactivate($id);

            Response::success(
                null,
                'Tallerista desactivado correctamente.'
            );
        } catch (Exception $e) {
            $status = $e->getMessage() === 'Tallerista no encontrado.'
                ? 404
                : 400;

            Response::error(
                $e->getMessage(),
                $status
            );
        }
    }
}
