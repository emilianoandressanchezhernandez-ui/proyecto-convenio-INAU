<?php

class TallerService
{
    private TallerRepository $repository;
    private AsignacionRepository $asignacionRepository;
    private AlumnoRepository $alumnoRepository;

    public function __construct()
    {
        $this->repository = new TallerRepository();
        $this->asignacionRepository = new AsignacionRepository();
        $this->alumnoRepository = new AlumnoRepository();
    }

    public function getAll(): array
    {
        return $this->repository->findAll();
    }

    public function getById(int $id): array
    {
        $taller = $this->repository->findById($id);

        if (!$taller) {
            throw new Exception('Taller no encontrado.');
        }

        $taller['horarios'] = $this->repository->findHorarios($id);

        return $taller;
    }

    public function create(array $data): array
    {
        $errores = TallerValidator::validarCreacion($data);

        if (!empty($errores)) {
            throw new InvalidArgumentException(
                json_encode($errores, JSON_UNESCAPED_UNICODE)
            );
        }

        $dto = new TallerDTO($data);
        $taller = $dto->toArray();

        $id = $this->repository->create($taller);

        return $this->repository->findById($id);
    }


    public function getMisTalleres(array $usuario): array
    {
        if (!isset($usuario['id'], $usuario['rol'])) {
            throw new Exception('No se pudo identificar al usuario autenticado.');
        }

        $usuarioId = (int) $usuario['id'];
        $rol = $usuario['rol'];

        if ($rol === 'admin') {
            return $this->repository->findAll();
        }

        if ($rol === 'tallerista') {
            return $this->asignacionRepository
                ->getTalleresByTallerista($usuarioId);
        }

        if ($rol === 'alumno') {
            $alumno = $this->alumnoRepository
                ->obtenerPorUsuarioId($usuarioId);

            if (!$alumno) {
                throw new Exception(
                    'No se encontró el alumno asociado a esta cuenta.'
                );
            }

            return $this->asignacionRepository
                ->getTalleresByAlumno((int) $alumno['id']);
        }

        throw new Exception('Rol de usuario no válido.');
    }
    public function update(int $id, array $data): array
    {
        $actual = $this->repository->findById($id);

        if (!$actual) {
            throw new Exception('Taller no encontrado.');
        }

        $errores = TallerValidator::validarActualizacion($data);

        if (!empty($errores)) {
            throw new InvalidArgumentException(
                json_encode($errores, JSON_UNESCAPED_UNICODE)
            );
        }

        // Para validar correctamente el rango de fechas en un PATCH,
        // usamos las fechas nuevas si llegaron y las actuales si no.
        $fechaInicio = $data['fecha_inicio'] ?? $actual['fecha_inicio'];
        $fechaFin = $data['fecha_fin'] ?? $actual['fecha_fin'];

        if ($fechaFin < $fechaInicio) {
            throw new InvalidArgumentException(
                json_encode(
                    [
                        'fecha_fin' =>
                        'La fecha de fin no puede ser anterior a la fecha de inicio.'
                    ],
                    JSON_UNESCAPED_UNICODE
                )
            );
        }

        $this->repository->update($id, $data);

        return $this->repository->findById($id);
    }

    public function finish(int $id): void
    {
        $taller = $this->repository->findById($id);

        if (!$taller) {
            throw new Exception('Taller no encontrado.');
        }

        $this->repository->finish($id);
    }
}
