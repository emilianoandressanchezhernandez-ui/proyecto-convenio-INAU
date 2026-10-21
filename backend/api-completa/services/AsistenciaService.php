<?php

class AsistenciaService
{
    private AsistenciaRepository $repository;
    private TallerRepository $tallerRepository;
    private AlumnoRepository $alumnoRepository;
    private AsignacionRepository $asignacionRepository;

    public function __construct()
    {
        $this->repository = new AsistenciaRepository();
        $this->tallerRepository = new TallerRepository();
        $this->alumnoRepository = new AlumnoRepository();
        $this->asignacionRepository = new AsignacionRepository();
    }

    public function getByTaller(
        int $tallerId,
        array $usuario
    ): array {
        $this->getTaller($tallerId);

        $this->validarAccesoTaller(
            $tallerId,
            $usuario
        );

        return $this->repository->findByTaller($tallerId);
    }

    public function getById(
        int $id,
        array $usuario
    ): array {
        $asistencia = $this->repository->findById($id);

        if (!$asistencia) {
            throw new Exception('Asistencia no encontrada.');
        }

        $this->validarAccesoTaller(
            (int) $asistencia['taller_id'],
            $usuario
        );

        $asistencia['registros'] =
            $this->repository->getRegistros($id);

        return $asistencia;
    }

    public function create(
        int $tallerId,
        array $data,
        array $usuario
    ): array {
        $errors = AsistenciaValidator::validateCreate($data);

        if (!empty($errors)) {
            throw new InvalidArgumentException(
                json_encode(
                    $errors,
                    JSON_UNESCAPED_UNICODE
                )
            );
        }

        $this->getActiveTaller($tallerId);

        $this->validarAccesoTaller(
            $tallerId,
            $usuario
        );

        $fecha = $data['fecha'];

        $existing = $this->repository->findByTallerAndFecha(
            $tallerId,
            $fecha
        );

        if ($existing) {
            throw new Exception(
                'Ya existe un registro de asistencia para ese taller y fecha.'
            );
        }

        $id = $this->repository->create(
            $tallerId,
            $fecha
        );

        return $this->repository->findById($id);
    }

    public function saveRegistro(
        int $asistenciaId,
        array $data,
        array $usuario
    ): array {
        $asistencia = $this->repository->findById(
            $asistenciaId
        );

        if (!$asistencia) {
            throw new Exception(
                'Asistencia no encontrada.'
            );
        }

        $tallerId = (int) $asistencia['taller_id'];

        $this->validarAccesoTaller(
            $tallerId,
            $usuario
        );

        $errors = AsistenciaValidator::validateRegistro($data);

        if (!empty($errors)) {
            throw new InvalidArgumentException(
                json_encode(
                    $errors,
                    JSON_UNESCAPED_UNICODE
                )
            );
        }

        $this->getActiveTaller($tallerId);

        $alumnoId = (int) $data['alumno_id'];

        $alumno = $this->alumnoRepository->obtenerPorId(
            $alumnoId
        );

        if (!$alumno) {
            throw new Exception(
                'Alumno no encontrado.'
            );
        }

        if ($alumno['estado'] !== 'Activo') {
            throw new Exception(
                'El alumno está inactivo.'
            );
        }

        $inscripcion =
            $this->asignacionRepository->findAlumnoAssignment(
                $tallerId,
                $alumnoId
            );

        if (!$inscripcion) {
            throw new Exception(
                'El alumno no está inscripto en este taller.'
            );
        }

        if (
            $asistencia['fecha'] <
            $inscripcion['fecha_inscripcion']
        ) {
            throw new Exception(
                'No se puede registrar asistencia antes de la fecha de inscripción del alumno.'
            );
        }

        $estado = $data['estado'];
        $observaciones = $data['observaciones'] ?? null;
        $usuarioRegistroId = (int) $usuario['id'];

        $registro = $this->repository->findRegistro(
            $asistenciaId,
            $alumnoId
        );

        if ($registro) {
            $this->repository->updateRegistro(
                $asistenciaId,
                $alumnoId,
                $estado,
                $observaciones,
                $usuarioRegistroId
            );
        } else {
            $this->repository->createRegistro(
                $asistenciaId,
                $alumnoId,
                $estado,
                $observaciones,
                $usuarioRegistroId
            );
        }

        return $this->repository->findRegistro(
            $asistenciaId,
            $alumnoId
        );
    }

    private function validarAccesoTaller(
        int $tallerId,
        array $usuario
    ): void {
        if (!isset($usuario['id'], $usuario['rol'])) {
            throw new Exception(
                'No se pudo identificar al usuario autenticado.'
            );
        }

        if ($usuario['rol'] === 'admin') {
            return;
        }

        if ($usuario['rol'] === 'tallerista') {
            $pertenece =
                $this->asignacionRepository
                ->talleristaPerteneceATaller(
                    $tallerId,
                    (int) $usuario['id']
                );

            if (!$pertenece) {
                throw new RuntimeException(
                    'No tienes permiso para acceder a las asistencias de este taller.',
                    403
                );
            }

            return;
        }

        throw new RuntimeException(
            'No tienes permiso para realizar esta acción.',
            403
        );
    }

    private function getTaller(int $tallerId): array
    {
        $taller = $this->tallerRepository->findById(
            $tallerId
        );

        if (!$taller) {
            throw new Exception(
                'Taller no encontrado.'
            );
        }

        return $taller;
    }

    private function getActiveTaller(int $tallerId): array
    {
        $taller = $this->getTaller($tallerId);

        if ($taller['estado'] !== 'Activo') {
            throw new Exception(
                'No se puede registrar asistencia en un taller finalizado.'
            );
        }

        return $taller;
    }
}
