<?php

class AlumnoController extends Controller
{
    private AlumnoService $service;

    public function __construct()
    {
        $this->service = new AlumnoService();
    }

    public function index(): void
    {
        try {
            $alumnos = $this->service->obtenerTodos();

            Response::success(
                $alumnos,
                'Alumnos obtenidos correctamente.'
            );
        } catch (Exception $e) {
            Response::error(
                'No se pudieron obtener los alumnos.',
                500,
                [$e->getMessage()]
            );
        }
    }

    public function show(int $id): void
    {
        try {
            $alumno = $this->service->obtenerPorId($id);

            Response::success(
                $alumno,
                'Alumno obtenido correctamente.'
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
            $datos = $this->getJsonBody();

            $alumno = $this->service->crear($datos);

            Response::success(
                $alumno,
                'Alumno creado correctamente.',
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
            $datos = $this->getJsonBody();

            $alumno = $this->service->actualizar($id, $datos);

            Response::success(
                $alumno,
                'Alumno actualizado correctamente.'
            );
        } catch (InvalidArgumentException $e) {
            $errores = json_decode($e->getMessage(), true);

            Response::error(
                'Los datos ingresados no son válidos.',
                422,
                is_array($errores) ? $errores : [$e->getMessage()]
            );
        } catch (Exception $e) {
            $codigo = $e->getMessage() === 'Alumno no encontrado.'
                ? 404
                : 400;

            Response::error(
                $e->getMessage(),
                $codigo
            );
        }
    }

    public function destroy(int $id): void
    {
        try {
            $this->service->eliminar($id);

            Response::success(
                null,
                'Alumno desactivado correctamente.'
            );
        } catch (Exception $e) {
            $codigo = $e->getMessage() === 'Alumno no encontrado.'
                ? 404
                : 400;

            Response::error(
                $e->getMessage(),
                $codigo
            );
        }
    }
}
