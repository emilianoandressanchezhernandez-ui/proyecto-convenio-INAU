<?php

class ContenidoService
{
    private ContenidoRepository $repository;
    private TallerRepository $tallerRepository;
    private AsignacionRepository $asignacionRepository;
    private AlumnoRepository $alumnoRepository;

    public function __construct()
    {
        $this->repository = new ContenidoRepository();
        $this->tallerRepository = new TallerRepository();
        $this->asignacionRepository = new AsignacionRepository();
        $this->alumnoRepository = new AlumnoRepository();
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
        $contenido = $this->repository->findById($id);

        if (!$contenido) {
            throw new Exception('Contenido no encontrado.');
        }

        $this->validarAccesoTaller(
            (int) $contenido['taller_id'],
            $usuario
        );

        return $contenido;
    }

    public function create(
        int $tallerId,
        array $data,
        array $usuario
    ): array {
        $this->validarAccesoGestion(
            $tallerId,
            $usuario
        );

        $errors = ContenidoValidator::validateCreate($data);

        if (!empty($errors)) {
            throw new InvalidArgumentException(
                json_encode(
                    $errors,
                    JSON_UNESCAPED_UNICODE
                )
            );
        }

        $this->getActiveTaller($tallerId);

        $dto = new ContenidoDTO($data);

        $contenido = $dto->toArray();
        $contenido['taller_id'] = $tallerId;
        $contenido['fecha_publicacion'] = date('Y-m-d');

        $id = $this->repository->create($contenido);

        return $this->repository->findById($id);
    }

    public function update(
        int $id,
        array $data,
        array $usuario
    ): array {
        $contenidoActual = $this->repository->findById($id);

        if (!$contenidoActual) {
            throw new Exception('Contenido no encontrado.');
        }

        $tallerId = (int) $contenidoActual['taller_id'];

        $this->validarAccesoGestion(
            $tallerId,
            $usuario
        );

        $this->getActiveTaller($tallerId);

        $errors = ContenidoValidator::validateUpdate($data);

        if (!empty($errors)) {
            throw new InvalidArgumentException(
                json_encode(
                    $errors,
                    JSON_UNESCAPED_UNICODE
                )
            );
        }

        $dto = new ContenidoDTO($data);

        $this->repository->update(
            $id,
            $dto->toArray()
        );

        return $this->repository->findById($id);
    }

    public function delete(
        int $id,
        array $usuario
    ): void {
        $contenido = $this->repository->findById($id);

        if (!$contenido) {
            throw new Exception('Contenido no encontrado.');
        }

        $tallerId = (int) $contenido['taller_id'];

        $this->validarAccesoGestion(
            $tallerId,
            $usuario
        );

        $this->getActiveTaller($tallerId);

        $this->repository->delete($id);
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
                    'No tienes permiso para acceder al contenido de este taller.',
                    403
                );
            }

            return;
        }

        if ($usuario['rol'] === 'alumno') {
            $alumno = $this->alumnoRepository
                ->obtenerPorUsuarioId(
                    (int) $usuario['id']
                );

            if (!$alumno) {
                throw new RuntimeException(
                    'No se encontró el alumno asociado a esta cuenta.',
                    403
                );
            }

            $pertenece =
                $this->asignacionRepository
                ->alumnoPerteneceATaller(
                    $tallerId,
                    (int) $alumno['id']
                );

            if (!$pertenece) {
                throw new RuntimeException(
                    'No tienes permiso para acceder al contenido de este taller.',
                    403
                );
            }

            return;
        }

        throw new RuntimeException(
            'No tienes permiso para acceder al contenido de este taller.',
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
            $pertenece =
                $this->asignacionRepository
                ->talleristaPerteneceATaller(
                    $tallerId,
                    (int) $usuario['id']
                );

            if ($pertenece) {
                return;
            }
        }

        throw new RuntimeException(
            'No tienes permiso para gestionar el contenido de este taller.',
            403
        );
    }

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
                'No se puede modificar contenido de un taller finalizado.'
            );
        }

        return $taller;
    }
}
