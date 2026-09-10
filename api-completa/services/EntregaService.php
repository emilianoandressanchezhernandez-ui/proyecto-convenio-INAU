<?php

class EntregaService
{
    private EntregaRepository $repository;
    private ContenidoRepository $contenidoRepository;
    private AlumnoRepository $alumnoRepository;
    private AsignacionRepository $asignacionRepository;
    private TallerRepository $tallerRepository;

    public function __construct()
    {
        $this->repository = new EntregaRepository();
        $this->contenidoRepository = new ContenidoRepository();
        $this->alumnoRepository = new AlumnoRepository();
        $this->asignacionRepository = new AsignacionRepository();
        $this->tallerRepository = new TallerRepository();
    }

    public function getById(
        int $id,
        array $usuario
    ): array {
        $entrega = $this->getEntrega($id);

        $contenido = $this->getTarea(
            (int) $entrega['contenido_id']
        );

        $this->validarAccesoEntrega(
            $entrega,
            $contenido,
            $usuario
        );

        return $this->agregarEstadoPlazo(
            $entrega,
            $contenido
        );
    }

    public function getByContenido(
        int $contenidoId,
        array $usuario
    ): array {
        $contenido = $this->getTarea($contenidoId);

        $this->validarAccesoGestion(
            (int) $contenido['taller_id'],
            $usuario
        );

        $entregas = $this->repository->findByContenido(
            $contenidoId
        );

        foreach ($entregas as &$entrega) {
            $entrega = $this->agregarEstadoPlazo(
                $entrega,
                $contenido
            );
        }

        unset($entrega);

        return $entregas;
    }

    public function create(
        int $contenidoId,
        int $usuarioId
    ): array {
        $contenido = $this->getTarea($contenidoId);

        $taller = $this->getActiveTaller(
            (int) $contenido['taller_id']
        );

        $alumno = $this->alumnoRepository
            ->obtenerPorUsuarioId($usuarioId);

        if (!$alumno) {
            throw new Exception(
                'El usuario autenticado no tiene un alumno asociado.'
            );
        }

        if ($alumno['estado'] !== 'Activo') {
            throw new Exception(
                'El alumno está inactivo.'
            );
        }

        $alumnoId = (int) $alumno['id'];

        $inscripcion = $this->asignacionRepository
            ->findAlumnoAssignment(
                (int) $taller['id'],
                $alumnoId
            );

        if (!$inscripcion) {
            throw new RuntimeException(
                'No tienes permiso para realizar una entrega en este taller.',
                403
            );
        }

        $existing = $this->repository
            ->findByContenidoAndAlumno(
                $contenidoId,
                $alumnoId
            );

        if ($existing) {
            throw new Exception(
                'El alumno ya realizó una entrega para esta tarea.'
            );
        }

        $id = $this->repository->create(
            $contenidoId,
            $alumnoId,
            date('Y-m-d H:i:s')
        );

        $entrega = $this->getEntrega($id);

        return $this->agregarEstadoPlazo(
            $entrega,
            $contenido
        );
    }

    public function corregir(
        int $id,
        array $data,
        array $usuario
    ): array {
        $entrega = $this->getEntrega($id);

        $contenido = $this->getTarea(
            (int) $entrega['contenido_id']
        );

        $tallerId = (int) $contenido['taller_id'];

        $this->validarAccesoGestion(
            $tallerId,
            $usuario
        );

        $this->getActiveTaller($tallerId);

        $errors = EntregaValidator::validateComentario(
            $data
        );

        if (!empty($errors)) {
            throw new InvalidArgumentException(
                json_encode(
                    $errors,
                    JSON_UNESCAPED_UNICODE
                )
            );
        }

        $comentario = $data['comentario'] !== null
            ? trim($data['comentario'])
            : null;

        $this->repository->actualizarComentario(
            $id,
            $comentario
        );

        $entregaActualizada = $this->getEntrega($id);

        return $this->agregarEstadoPlazo(
            $entregaActualizada,
            $contenido
        );
    }

    public function asignarNota(
        int $id,
        array $data,
        array $usuario
    ): array {
        $entrega = $this->getEntrega($id);

        $contenido = $this->getTarea(
            (int) $entrega['contenido_id']
        );

        $tallerId = (int) $contenido['taller_id'];

        $this->validarAccesoGestion(
            $tallerId,
            $usuario
        );

        $this->getActiveTaller($tallerId);

        $errors = EntregaValidator::validateNota(
            $data
        );

        if (!empty($errors)) {
            throw new InvalidArgumentException(
                json_encode(
                    $errors,
                    JSON_UNESCAPED_UNICODE
                )
            );
        }

        $this->repository->asignarNota(
            $id,
            (int) $data['nota']
        );

        $entregaActualizada = $this->getEntrega($id);

        return $this->agregarEstadoPlazo(
            $entregaActualizada,
            $contenido
        );
    }

    public function eliminarNota(
        int $id,
        array $usuario
    ): array {
        $entrega = $this->getEntrega($id);

        $contenido = $this->getTarea(
            (int) $entrega['contenido_id']
        );

        $tallerId = (int) $contenido['taller_id'];

        $this->validarAccesoGestion(
            $tallerId,
            $usuario
        );

        $this->getActiveTaller($tallerId);

        $this->repository->eliminarNota($id);

        $entregaActualizada = $this->getEntrega($id);

        return $this->agregarEstadoPlazo(
            $entregaActualizada,
            $contenido
        );
    }

    private function agregarEstadoPlazo(
        array $entrega,
        array $contenido
    ): array {
        if (empty($contenido['fecha_limite'])) {
            $entrega['entregada_a_tiempo'] = true;

            return $entrega;
        }

        $fechaEntrega = new DateTime(
            $entrega['fecha_entrega']
        );

        $fechaLimite = new DateTime(
            $contenido['fecha_limite'] . ' 23:59:59'
        );

        $entrega['entregada_a_tiempo'] =
            $fechaEntrega <= $fechaLimite;

        return $entrega;
    }

    private function validarAccesoEntrega(
        array $entrega,
        array $contenido,
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
            $this->validarAccesoGestion(
                (int) $contenido['taller_id'],
                $usuario
            );

            return;
        }

        if ($usuario['rol'] === 'alumno') {
            $alumno = $this->alumnoRepository
                ->obtenerPorUsuarioId(
                    (int) $usuario['id']
                );

            if (
                !$alumno ||
                (int) $alumno['id'] !==
                (int) $entrega['alumno_id']
            ) {
                throw new RuntimeException(
                    'No tienes permiso para acceder a esta entrega.',
                    403
                );
            }

            return;
        }

        throw new RuntimeException(
            'No tienes permiso para acceder a esta entrega.',
            403
        );
    }

    private function validarAccesoGestion(
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
            $pertenece = $this->asignacionRepository
                ->talleristaPerteneceATaller(
                    $tallerId,
                    (int) $usuario['id']
                );

            if ($pertenece) {
                return;
            }
        }

        throw new RuntimeException(
            'No tienes permiso para gestionar las entregas de este taller.',
            403
        );
    }

    private function getEntrega(int $id): array
    {
        $entrega = $this->repository->findById($id);

        if (!$entrega) {
            throw new Exception(
                'Entrega no encontrada.'
            );
        }

        return $entrega;
    }

    private function getTarea(int $contenidoId): array
    {
        $contenido = $this->contenidoRepository
            ->findById($contenidoId);

        if (!$contenido) {
            throw new Exception(
                'Contenido no encontrado.'
            );
        }

        if ($contenido['tipo'] !== 'Tarea') {
            throw new Exception(
                'Solo se pueden realizar entregas en contenidos de tipo Tarea.'
            );
        }

        return $contenido;
    }

    private function getActiveTaller(int $tallerId): array
    {
        $taller = $this->tallerRepository
            ->findById($tallerId);

        if (!$taller) {
            throw new Exception(
                'Taller no encontrado.'
            );
        }

        if ($taller['estado'] !== 'Activo') {
            throw new Exception(
                'No se pueden realizar entregas o correcciones en un taller finalizado.'
            );
        }

        return $taller;
    }
}
