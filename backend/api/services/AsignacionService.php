<?php

class AsignacionService
{
    private AsignacionRepository $repository;
    private TallerRepository $tallerRepository;
    private TalleristaRepository $talleristaRepository;
    private AlumnoRepository $alumnoRepository;

    public function __construct()
    {
        $this->repository = new AsignacionRepository();
        $this->tallerRepository = new TallerRepository();
        $this->talleristaRepository = new TalleristaRepository();
        $this->alumnoRepository = new AlumnoRepository();
    }

    // --------------------------------------------------------------
    // Talleristas
    // --------------------------------------------------------------

    public function getTalleristas(int $tallerId): array
    {
        $this->getActiveTaller($tallerId);

        return $this->repository->getTalleristasByTaller($tallerId);
    }

    public function assignTallerista(int $tallerId, array $data): array
    {
        $errors = AsignacionValidator::validateTalleristaAssignment($data);

        if (!empty($errors)) {
            throw new InvalidArgumentException(
                json_encode($errors, JSON_UNESCAPED_UNICODE)
            );
        }

        $this->getActiveTaller($tallerId);

        $talleristaId = (int) $data['tallerista_id'];

        $tallerista = $this->talleristaRepository->findById($talleristaId);

        if (!$tallerista) {
            throw new Exception('Tallerista no encontrado.');
        }

        if ($tallerista['estado'] !== 'Activo') {
            throw new Exception(
                'No se puede asignar un tallerista inactivo.'
            );
        }

        $existing = $this->repository->findTalleristaAssignment(
            $tallerId,
            $talleristaId
        );

        if ($existing) {
            throw new Exception(
                'El tallerista ya está asignado a este taller.'
            );
        }

        $fechaAsignacion = $data['fecha_asignacion'] ?? date('Y-m-d');

        $id = $this->repository->assignTallerista(
            $tallerId,
            $talleristaId,
            $fechaAsignacion
        );

        return [
            'id' => $id,
            'taller_id' => $tallerId,
            'tallerista_id' => $talleristaId,
            'fecha_asignacion' => $fechaAsignacion
        ];
    }

    public function removeTallerista(
        int $tallerId,
        int $talleristaId
    ): void {
        $this->getTaller($tallerId);

        $existing = $this->repository->findTalleristaAssignment(
            $tallerId,
            $talleristaId
        );

        if (!$existing) {
            throw new Exception(
                'El tallerista no está asignado a este taller.'
            );
        }

        $this->repository->removeTallerista(
            $tallerId,
            $talleristaId
        );
    }


    // --------------------------------------------------------------
    // Alumnos
    // --------------------------------------------------------------

    public function getAlumnos(
        int $tallerId,
        array $usuario
    ): array {
        $this->getTaller($tallerId);

        if (!isset($usuario['id'], $usuario['rol'])) {
            throw new Exception(
                'No se pudo identificar al usuario autenticado.'
            );
        }

        if ($usuario['rol'] === 'tallerista') {
            $talleristaId = (int) $usuario['id'];

            $pertenece = $this->repository->talleristaPerteneceATaller(
                $tallerId,
                $talleristaId
            );

            if (!$pertenece) {
                throw new RuntimeException(
                    'No tienes permiso para consultar los alumnos de este taller.',
                    403
                );
            }
        }

        return $this->repository->getAlumnosByTaller($tallerId);
    }

    public function assignAlumno(int $tallerId, array $data): array
    {
        $errors = AsignacionValidator::validateAlumnoAssignment($data);

        if (!empty($errors)) {
            throw new InvalidArgumentException(
                json_encode($errors, JSON_UNESCAPED_UNICODE)
            );
        }

        $this->getActiveTaller($tallerId);

        $alumnoId = (int) $data['alumno_id'];

        $alumno = $this->alumnoRepository->obtenerPorId($alumnoId);

        if (!$alumno) {
            throw new Exception('Alumno no encontrado.');
        }

        if ($alumno['estado'] !== 'Activo') {
            throw new Exception(
                'No se puede inscribir un alumno inactivo.'
            );
        }

        $existing = $this->repository->findAlumnoAssignment(
            $tallerId,
            $alumnoId
        );

        if ($existing) {
            throw new Exception(
                'El alumno ya está inscripto en este taller.'
            );
        }

        $id = $this->repository->assignAlumno(
            $tallerId,
            $alumnoId
        );

        return [
            'id' => $id,
            'taller_id' => $tallerId,
            'alumno_id' => $alumnoId
        ];
    }

    public function removeAlumno(
        int $tallerId,
        int $alumnoId
    ): void {
        $this->getTaller($tallerId);

        $existing = $this->repository->findAlumnoAssignment(
            $tallerId,
            $alumnoId
        );

        if (!$existing) {
            throw new Exception(
                'El alumno no está inscripto en este taller.'
            );
        }

        $this->repository->removeAlumno(
            $tallerId,
            $alumnoId
        );
    }


    // --------------------------------------------------------------
    // Taller
    // --------------------------------------------------------------

    private function getTaller(int $tallerId): array
    {
        $taller = $this->tallerRepository->findById($tallerId);

        if (!$taller) {
            throw new Exception('Taller no encontrado.');
        }

        return $taller;
    }

    private function getActiveTaller(int $tallerId): array
    {
        $taller = $this->getTaller($tallerId);

        if ($taller['estado'] !== 'Activo') {
            throw new Exception(
                'No se pueden realizar asignaciones en un taller finalizado.'
            );
        }

        return $taller;
    }
}
