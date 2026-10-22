<?php

class AlumnoService
{
    private AlumnoRepository $repository;

    public function __construct()
    {
        $this->repository = new AlumnoRepository();
    }

    public function obtenerTodos(): array
    {
        return $this->repository->obtenerTodos();
    }

    public function obtenerPorId(int $id): array
    {
        $alumno = $this->repository->obtenerPorId($id);

        if (!$alumno) {
            throw new Exception('Alumno no encontrado.');
        }

        return $alumno;
    }

    public function crear(array $datos): array
    {
        $errores = AlumnoValidator::validarCreacion($datos);

        if (!empty($errores)) {
            throw new InvalidArgumentException(
                json_encode($errores, JSON_UNESCAPED_UNICODE)
            );
        }

        $alumnoExistente = $this->repository->obtenerPorCedula(
            trim($datos['cedula'])
        );

        if ($alumnoExistente) {
            throw new Exception('Ya existe un alumno con esa cédula.');
        }

        $dto = new AlumnoDTO($datos);

        $id = $this->repository->crear(
            $dto->toArray()
        );

        return $this->repository->obtenerPorId($id);
    }

    public function actualizar(int $id, array $datos): array
    {
        $alumno = $this->repository->obtenerPorId($id);

        if (!$alumno) {
            throw new Exception('Alumno no encontrado.');
        }

        $errores = AlumnoValidator::validarActualizacion($datos);

        if (!empty($errores)) {
            throw new InvalidArgumentException(
                json_encode($errores, JSON_UNESCAPED_UNICODE)
            );
        }

        // La cédula no se modifica desde este endpoint.
        unset($datos['cedula']);

        $actualizado = $this->repository->actualizar(
            $id,
            $datos
        );

        if (!$actualizado && !empty($datos)) {
            throw new Exception('No se pudo actualizar el alumno.');
        }

        return $this->repository->obtenerPorId($id);
    }

    public function eliminar(int $id): void
    {
        $alumno = $this->repository->obtenerPorId($id);

        if (!$alumno) {
            throw new Exception('Alumno no encontrado.');
        }

        /*
         * No hacemos DELETE físico porque el alumno puede estar
         * relacionado con talleres, asistencias y entregas.
         *
         * Lo damos de baja cambiando su estado a Inactivo.
         */
        $this->repository->desactivar($id);
    }
}
