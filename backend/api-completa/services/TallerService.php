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

        // Obtener los horarios reales.
        $taller['horarios'] = $this->repository->findHorarios($id);

        // Obtener los talleristas asignados.
        $talleristasAsignados =
            $this->asignacionRepository->getTalleristasByTaller($id);

        // Exponer únicamente los datos necesarios para la vista.
        $taller['talleristas'] = array_map(
            static function (array $tallerista): array {
                return [
                    'id' => (int) $tallerista['tallerista_id'],
                    'nombre' => $tallerista['nombre'],
                    'apellido' => $tallerista['apellido'],
                    'especialidad' => $tallerista['especialidad']
                ];
            },
            $talleristasAsignados
        );

        return $taller;
    }


    // ==============================================================
    // CREAR TALLER COMPLETO
    // Datos generales + horarios + tallerista inicial
    // ==============================================================

    public function create(array $data): array
    {
        // 1. Validar los datos generales del taller.

        $errores = TallerValidator::validarCreacion($data);

        if (!empty($errores)) {
            throw new InvalidArgumentException(
                json_encode($errores, JSON_UNESCAPED_UNICODE)
            );
        }

        // 2. Validar los horarios recibidos.

        $horarios = $data['horarios'] ?? [];

        if (!is_array($horarios) || !array_is_list($horarios)) {
            throw new InvalidArgumentException(
                'Los horarios deben enviarse como una lista.'
            );
        }

        $diasValidos = [
            'Lunes',
            'Martes',
            'Miércoles',
            'Jueves',
            'Viernes',
            'Sábado',
            'Domingo'
        ];

        foreach ($horarios as $indice => $horario) {

            if (!is_array($horario)) {
                throw new InvalidArgumentException(
                    'El horario ' . ($indice + 1) . ' no es válido.'
                );
            }

            $dia = $horario['dia'] ?? '';
            $horaInicio = $horario['hora_inicio'] ?? '';
            $horaFin = $horario['hora_fin'] ?? '';

            if (
                !is_string($dia) ||
                !in_array($dia, $diasValidos, true)
            ) {
                throw new InvalidArgumentException(
                    'El horario ' . ($indice + 1) .
                        ' tiene un día inválido.'
                );
            }

            if (
                !is_string($horaInicio) ||
                !is_string($horaFin) ||
                !preg_match(
                    '/^(?:[01]\d|2[0-3]):[0-5]\d$/',
                    $horaInicio
                ) ||
                !preg_match(
                    '/^(?:[01]\d|2[0-3]):[0-5]\d$/',
                    $horaFin
                )
            ) {
                throw new InvalidArgumentException(
                    'El horario ' . ($indice + 1) .
                        ' debe utilizar horas en formato HH:MM.'
                );
            }

            if ($horaFin <= $horaInicio) {
                throw new InvalidArgumentException(
                    'En el horario ' . ($indice + 1) .
                        ', la hora de fin debe ser posterior a la de inicio.'
                );
            }
        }

        // 3. Validar el tallerista inicial.

        $talleristaId = $data['tallerista_id'] ?? null;

        if ($talleristaId !== null) {

            $erroresAsignacion =
                AsignacionValidator::validateTalleristaAssignment([
                    'tallerista_id' => $talleristaId
                ]);

            if (!empty($erroresAsignacion)) {
                throw new InvalidArgumentException(
                    json_encode(
                        $erroresAsignacion,
                        JSON_UNESCAPED_UNICODE
                    )
                );
            }
        }

        // 4. Construir los datos generales.

        $dto = new TallerDTO($data);
        $taller = $dto->toArray();

        // 5. Iniciar una transacción.
        // Database::connection() comparte la misma conexión PDO
        // con todos los repositorios durante esta petición.

        $db = Database::connection();

        $db->beginTransaction();

        try {

            // Crear el taller.

            $id = $this->repository->create($taller);

            // Guardar los horarios.

            foreach ($horarios as $horario) {
                $this->repository->createHorario(
                    $id,
                    $horario
                );
            }

            // Asignar el tallerista inicial.
            // Se reutilizan las validaciones del servicio existente.

            if ($talleristaId !== null) {

                $asignacionService = new AsignacionService();

                $asignacionService->assignTallerista(
                    $id,
                    [
                        'tallerista_id' => $talleristaId
                    ]
                );
            }

            // Confirmar todos los cambios.

            $db->commit();

            // Devolver el taller con sus horarios.

            return $this->getById($id);
        } catch (Throwable $error) {

            // Si ocurre un error, revertir toda la operación.

            if ($db->inTransaction()) {
                $db->rollBack();
            }

            throw $error;
        }
    }

    // ==============================================================
    // TALLERES DEL USUARIO AUTENTICADO
    // ==============================================================

    public function getMisTalleres(array $usuario): array
    {
        if (!isset($usuario['id'], $usuario['rol'])) {
            throw new Exception(
                'No se pudo identificar al usuario autenticado.'
            );
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

    // ==============================================================
    // ACTUALIZAR TALLER
    // ==============================================================

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

        $fechaInicio = $data['fecha_inicio']
            ?? $actual['fecha_inicio'];

        $fechaFin = $data['fecha_fin']
            ?? $actual['fecha_fin'];

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

    // ==============================================================
    // FINALIZAR TALLER
    // ==============================================================

    public function finish(int $id): void
    {
        $taller = $this->repository->findById($id);

        if (!$taller) {
            throw new Exception('Taller no encontrado.');
        }

        $this->repository->finish($id);
    }
}
