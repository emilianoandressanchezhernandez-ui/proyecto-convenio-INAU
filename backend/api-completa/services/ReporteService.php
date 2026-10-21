<?php

class ReporteService
{
    private ReporteRepository $repository;
    private TallerRepository $tallerRepository;
    private AsignacionRepository $asignacionRepository;

    public function __construct()
    {
        $this->repository = new ReporteRepository();
        $this->tallerRepository = new TallerRepository();
        $this->asignacionRepository = new AsignacionRepository();
    }

    // --------------------------------------------------------------
    // Listar todos los reportes
    // --------------------------------------------------------------

    public function getAll(): array
    {
        return $this->repository->findAll();
    }

    // --------------------------------------------------------------
    // Obtener un reporte por ID
    // --------------------------------------------------------------

    public function getById(int $id): array
    {
        $reporte = $this->repository->findById($id);

        if (!$reporte) {
            throw new Exception('Reporte no encontrado.');
        }

        return $reporte;
    }

    // --------------------------------------------------------------
    // Generar un reporte nuevo
    // --------------------------------------------------------------

    public function create(
        array $data,
        array $usuario
    ): array {
        // Validar los datos recibidos.
        $errors = ReporteValidator::validateCreate($data);

        if (!empty($errors)) {
            throw new InvalidArgumentException(
                json_encode(
                    $errors,
                    JSON_UNESCAPED_UNICODE
                )
            );
        }

        // Comprobar el usuario autenticado.
        if (
            !isset($usuario['id'], $usuario['rol']) ||
            $usuario['rol'] !== 'admin'
        ) {
            throw new RuntimeException(
                'No tienes permiso para generar reportes.',
                403
            );
        }

        $tipo = $data['tipo'];
        $usuarioId = (int) $usuario['id'];

        if ($tipo === 'General') {
            $datosReporte = $this->generarReporteGeneral(
                $usuarioId
            );
        } else {
            $tallerId = (int) $data['taller_id'];

            $datosReporte = $this->generarReporteAsistencia(
                $tallerId,
                $usuarioId
            );
        }

        // Guardar el reporte generado en MySQL.
        $id = $this->repository->create($datosReporte);

        // Devolver el registro almacenado.
        return $this->getById($id);
    }

    // --------------------------------------------------------------
    // Reporte general del sistema
    // --------------------------------------------------------------

    private function generarReporteGeneral(
        int $usuarioId
    ): array {
        $estadisticas =
            $this->repository->getEstadisticasGenerales();

        $promedio =
            $this->repository->getPromedioAsistenciaGeneral();

        $contenido = [
            'totalTalleres' =>
            (int) ($estadisticas['totalTalleres'] ?? 0),

            'talleresActivos' =>
            (int) ($estadisticas['talleresActivos'] ?? 0),

            'totalAlumnos' =>
            (int) ($estadisticas['totalAlumnos'] ?? 0),

            'totalTalleristas' =>
            (int) ($estadisticas['totalTalleristas'] ?? 0),

            'asistenciaPromedio' => $promedio
        ];

        return [
            'nombre' => 'Reporte General del Sistema',
            'tipo' => 'General',
            'taller_id' => null,
            'fecha_inicio' => null,
            'fecha_fin' => null,
            'contenido' => $contenido,
            'formato' => 'JSON',
            'generado_por' => $usuarioId,
            'estado' => 'Generado'
        ];
    }

    // --------------------------------------------------------------
    // Reporte de asistencia de un taller
    // --------------------------------------------------------------

    private function generarReporteAsistencia(
        int $tallerId,
        int $usuarioId
    ): array {
        // Se permite generar reportes históricos
        // de talleres activos y finalizados.
        $taller = $this->tallerRepository->findById(
            $tallerId
        );

        if (!$taller) {
            throw new Exception('Taller no encontrado.');
        }

        $estadisticas =
            $this->repository->getEstadisticasAsistencia(
                $tallerId
            );

        $totalRegistros =
            $estadisticas['asistenciasRegistradas'];

        $presentes = $estadisticas['presentes'];

        $promedio = $totalRegistros > 0
            ? (int) round(
                ($presentes / $totalRegistros) * 100
            )
            : null;

        $contenido = [
            'tallerId' => $tallerId,
            'tallerNombre' => $taller['nombre'],
            'totalClases' =>
            $estadisticas['totalClases'],
            'asistenciasRegistradas' => $totalRegistros,
            'presentes' => $presentes,
            'ausentes' =>
            $estadisticas['ausentes'],
            'justificados' =>
            $estadisticas['justificados'],
            'tardanzas' =>
            $estadisticas['tardanzas'],
            'asistenciaPromedio' => $promedio
        ];

        return [
            'nombre' =>
            'Reporte de Asistencia - ' . $taller['nombre'],
            'tipo' => 'Asistencia',
            'taller_id' => $tallerId,
            'fecha_inicio' => $taller['fecha_inicio'],
            'fecha_fin' => $taller['fecha_fin'],
            'contenido' => $contenido,
            'formato' => 'JSON',
            'generado_por' => $usuarioId,
            'estado' => 'Generado'
        ];
    }


    // --------------------------------------------------------------
    // Consultar un reporte autorizado para el usuario
    // --------------------------------------------------------------

    public function getMiReporteById(
        int $id,
        array $usuario
    ): array {
        $rol = $usuario['rol'] ?? null;
        $usuarioId = (int) ($usuario['id'] ?? 0);

        if ($usuarioId <= 0) {
            throw new RuntimeException(
                'Usuario no identificado.',
                403
            );
        }

        // El administrador puede consultar cualquier reporte.
        if ($rol === 'admin') {
            return $this->getById($id);
        }

        // Solamente los talleristas pueden utilizar
        // esta consulta además del administrador.
        if ($rol !== 'tallerista') {
            throw new RuntimeException(
                'No tienes permisos para consultar este reporte.',
                403
            );
        }

        $reporte = $this->getById($id);

        $tallerId = (int) ($reporte['taller_id'] ?? 0);

        // Los reportes generales no corresponden
        // a un taller específico.
        if ($tallerId <= 0) {
            throw new RuntimeException(
                'No tienes permisos para consultar este reporte.',
                403
            );
        }

        // Verificar la asignación real en MySQL.
        $pertenece = $this->asignacionRepository
            ->talleristaPerteneceATaller(
                $tallerId,
                $usuarioId
            );

        if (!$pertenece) {
            throw new RuntimeException(
                'No tienes permisos para consultar este reporte.',
                403
            );
        }

        return $reporte;
    }


    // --------------------------------------------------------------
    // Listar los reportes accesibles para el usuario
    // --------------------------------------------------------------

    public function getMisReportes(array $usuario): array
    {
        $rol = $usuario['rol'] ?? null;
        $usuarioId = (int) ($usuario['id'] ?? 0);

        if ($usuarioId <= 0) {
            throw new RuntimeException(
                'Usuario no identificado.',
                403
            );
        }

        // El administrador puede consultar todos los reportes.
        if ($rol === 'admin') {
            return $this->getAll();
        }

        // Solo los talleristas pueden consultar
        // reportes de sus talleres asignados.
        if ($rol !== 'tallerista') {
            throw new RuntimeException(
                'No tienes permisos para consultar reportes.',
                403
            );
        }

        return $this->repository->findByTallerista(
            $usuarioId
        );
    }
}
