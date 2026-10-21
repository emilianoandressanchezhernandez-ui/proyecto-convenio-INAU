<?php

class AdjuntoService
{
    private AdjuntoRepository $repository;
    private EntregaRepository $entregaRepository;
    private AlumnoRepository $alumnoRepository;
    private ContenidoRepository $contenidoRepository;
    private AsignacionRepository $asignacionRepository;

    public function __construct()
    {
        $this->repository = new AdjuntoRepository();
        $this->entregaRepository = new EntregaRepository();
        $this->alumnoRepository = new AlumnoRepository();
        $this->contenidoRepository = new ContenidoRepository();
        $this->asignacionRepository = new AsignacionRepository();
    }

    // ==============================================================
    // ADJUNTOS DE ENTREGAS
    // ==============================================================

    public function getByEntrega(
        int $entregaId,
        array $user
    ): array {
        $entrega = $this->getEntrega($entregaId);

        $this->validarAccesoLecturaEntrega(
            $entrega,
            $user
        );

        return $this->repository->findByEntrega(
            $entregaId
        );
    }

    public function uploadForEntrega(
        int $entregaId,
        array $file,
        array $user
    ): array {
        $entrega = $this->getEntrega($entregaId);

        $this->validateAlumnoOwnership(
            $entrega,
            $user
        );

        /*
         * El frontend maneja un solo archivo por entrega.
         */
        $adjuntosExistentes =
            $this->repository->findByEntrega(
                $entregaId
            );

        if (!empty($adjuntosExistentes)) {
            throw new Exception(
                'La entrega ya tiene un archivo adjunto.'
            );
        }

        $archivo = $this->guardarArchivo(
            $file,
            'entregas'
        );

        try {
            $id = $this->repository
                ->createForEntrega(
                    $entregaId,
                    $archivo['nombre_original'],
                    $archivo['nombre_archivo'],
                    $archivo['ruta'],
                    $archivo['tipo_mime'],
                    $archivo['tamano_bytes']
                );
        } catch (Throwable $e) {
            $this->eliminarArchivoFisico(
                $archivo['ruta_fisica']
            );

            throw $e;
        }

        return $this->recuperarAdjuntoCreado(
            $id,
            $archivo['ruta_fisica']
        );
    }

    // ==============================================================
    // ADJUNTOS DE CONTENIDOS
    // ==============================================================

    public function getByContenido(
        int $contenidoId,
        array $user
    ): array {
        $contenido = $this->getContenido(
            $contenidoId
        );

        $this->validarAccesoLecturaContenido(
            $contenido,
            $user
        );

        return $this->repository->findByContenido(
            $contenidoId
        );
    }

    public function uploadForContenido(
        int $contenidoId,
        array $file,
        array $user
    ): array {
        $contenido = $this->getContenido(
            $contenidoId
        );

        $this->validarAccesoGestionContenido(
            $contenido,
            $user
        );

        $archivo = $this->guardarArchivo(
            $file,
            'contenidos'
        );

        try {
            $id = $this->repository
                ->createForContenido(
                    $contenidoId,
                    $archivo['nombre_original'],
                    $archivo['nombre_archivo'],
                    $archivo['ruta'],
                    $archivo['tipo_mime'],
                    $archivo['tamano_bytes']
                );
        } catch (Throwable $e) {
            $this->eliminarArchivoFisico(
                $archivo['ruta_fisica']
            );

            throw $e;
        }

        return $this->recuperarAdjuntoCreado(
            $id,
            $archivo['ruta_fisica']
        );
    }

    // ==============================================================
    // DESCARGA
    // ==============================================================

    public function getFile(
        int $id,
        array $user
    ): array {
        $adjunto = $this->getAdjunto($id);

        /*
         * El adjunto pertenece a una entrega.
         */
        if ($adjunto['entrega_id'] !== null) {
            $entrega = $this->getEntrega(
                (int) $adjunto['entrega_id']
            );

            $this->validarAccesoLecturaEntrega(
                $entrega,
                $user
            );
        }

        /*
         * El adjunto pertenece a un contenido.
         */ elseif ($adjunto['contenido_id'] !== null) {
            $contenido = $this->getContenido(
                (int) $adjunto['contenido_id']
            );

            $this->validarAccesoLecturaContenido(
                $contenido,
                $user
            );
        } else {
            throw new Exception(
                'El adjunto no tiene un recurso asociado.'
            );
        }

        $rutaFisica = $this->obtenerRutaFisica(
            $adjunto
        );

        if (!is_file($rutaFisica)) {
            throw new Exception(
                'El archivo no existe en el servidor.'
            );
        }

        return [
            'adjunto' => $adjunto,
            'ruta_fisica' => $rutaFisica
        ];
    }

    // ==============================================================
    // ELIMINACIÓN
    // ==============================================================

    public function delete(
        int $id,
        array $user
    ): void {
        $adjunto = $this->getAdjunto($id);

        /*
         * Archivo de una entrega:
         * solamente el alumno propietario puede eliminarlo.
         */
        if ($adjunto['entrega_id'] !== null) {
            $entrega = $this->getEntrega(
                (int) $adjunto['entrega_id']
            );

            $this->validateAlumnoOwnership(
                $entrega,
                $user
            );
        }

        /*
         * Archivo de un contenido:
         * admin o tallerista asignado pueden eliminarlo.
         */ elseif ($adjunto['contenido_id'] !== null) {
            $contenido = $this->getContenido(
                (int) $adjunto['contenido_id']
            );

            $this->validarAccesoGestionContenido(
                $contenido,
                $user
            );
        } else {
            throw new Exception(
                'El adjunto no tiene un recurso asociado.'
            );
        }

        $rutaFisica = $this->obtenerRutaFisica(
            $adjunto
        );

        $this->repository->delete($id);

        $this->eliminarArchivoFisico(
            $rutaFisica
        );
    }

    // ==============================================================
    // AUTORIZACIÓN DE ENTREGAS
    // ==============================================================

    private function validarAccesoLecturaEntrega(
        array $entrega,
        array $user
    ): void {
        $this->validarUsuario($user);

        if ($user['rol'] === 'admin') {
            return;
        }

        if ($user['rol'] === 'alumno') {
            $this->validateAlumnoOwnership(
                $entrega,
                $user
            );

            return;
        }

        if ($user['rol'] === 'tallerista') {
            $contenido = $this->getContenido(
                (int) $entrega['contenido_id']
            );

            $pertenece =
                $this->asignacionRepository
                ->talleristaPerteneceATaller(
                    (int) $contenido['taller_id'],
                    (int) $user['id']
                );

            if ($pertenece) {
                return;
            }
        }

        throw new RuntimeException(
            'No tienes permiso para acceder a los adjuntos de esta entrega.',
            403
        );
    }

    private function validateAlumnoOwnership(
        array $entrega,
        array $user
    ): void {
        if (($user['rol'] ?? null) !== 'alumno') {
            throw new RuntimeException(
                'Solo un alumno puede modificar los archivos de una entrega.',
                403
            );
        }

        $usuarioId = (int) (
            $user['id'] ?? 0
        );

        if ($usuarioId <= 0) {
            throw new RuntimeException(
                'Usuario autenticado inválido.',
                403
            );
        }

        $alumno = $this->alumnoRepository
            ->obtenerPorUsuarioId(
                $usuarioId
            );

        if (!$alumno) {
            throw new RuntimeException(
                'No se encontró el alumno asociado al usuario.',
                403
            );
        }

        if (
            (int) $entrega['alumno_id'] !==
            (int) $alumno['id']
        ) {
            throw new RuntimeException(
                'No tienes permiso para acceder o modificar esta entrega.',
                403
            );
        }
    }

    // ==============================================================
    // AUTORIZACIÓN DE CONTENIDOS
    // ==============================================================

    private function validarAccesoLecturaContenido(
        array $contenido,
        array $user
    ): void {
        $this->validarUsuario($user);

        if ($user['rol'] === 'admin') {
            return;
        }

        if ($user['rol'] === 'tallerista') {
            $pertenece =
                $this->asignacionRepository
                ->talleristaPerteneceATaller(
                    (int) $contenido['taller_id'],
                    (int) $user['id']
                );

            if ($pertenece) {
                return;
            }

            throw new RuntimeException(
                'No tienes permiso para acceder a los adjuntos de este contenido.',
                403
            );
        }

        if ($user['rol'] === 'alumno') {
            $alumno = $this->alumnoRepository
                ->obtenerPorUsuarioId(
                    (int) $user['id']
                );

            if (!$alumno) {
                throw new RuntimeException(
                    'No se encontró el alumno asociado al usuario.',
                    403
                );
            }

            $pertenece =
                $this->asignacionRepository
                ->alumnoPerteneceATaller(
                    (int) $contenido['taller_id'],
                    (int) $alumno['id']
                );

            if ($pertenece) {
                return;
            }

            throw new RuntimeException(
                'No tienes permiso para acceder a los adjuntos de este contenido.',
                403
            );
        }

        throw new RuntimeException(
            'No tienes permiso para acceder a los adjuntos de este contenido.',
            403
        );
    }

    private function validarAccesoGestionContenido(
        array $contenido,
        array $user
    ): void {
        $this->validarUsuario($user);

        if ($user['rol'] === 'admin') {
            return;
        }

        if ($user['rol'] === 'tallerista') {
            $pertenece =
                $this->asignacionRepository
                ->talleristaPerteneceATaller(
                    (int) $contenido['taller_id'],
                    (int) $user['id']
                );

            if ($pertenece) {
                return;
            }
        }

        throw new RuntimeException(
            'No tienes permiso para gestionar los adjuntos de este contenido.',
            403
        );
    }

    // ==============================================================
    // ARCHIVOS
    // ==============================================================

    private function guardarArchivo(
        array $file,
        string $carpeta
    ): array {
        $errors = AdjuntoValidator::validateUpload(
            $file
        );

        if (!empty($errors)) {
            throw new InvalidArgumentException(
                json_encode(
                    $errors,
                    JSON_UNESCAPED_UNICODE
                )
            );
        }

        $mimeType = AdjuntoValidator::getMimeType(
            $file
        );

        if (!$mimeType) {
            throw new Exception(
                'No se pudo identificar el tipo del archivo.'
            );
        }

        $extension = AdjuntoValidator::getExtension(
            $mimeType
        );

        if (!$extension) {
            throw new Exception(
                'El tipo de archivo no está permitido.'
            );
        }

        $uploadDir =
            __DIR__ .
            '/../uploads/' .
            $carpeta .
            '/';

        if (!is_dir($uploadDir)) {
            $created = mkdir(
                $uploadDir,
                0775,
                true
            );

            if (
                !$created &&
                !is_dir($uploadDir)
            ) {
                throw new Exception(
                    'No se pudo crear la carpeta de archivos.'
                );
            }
        }

        $nombreArchivo =
            bin2hex(
                random_bytes(16)
            ) .
            '.' .
            $extension;

        $rutaFisica =
            $uploadDir .
            $nombreArchivo;

        $moved = move_uploaded_file(
            $file['tmp_name'],
            $rutaFisica
        );

        if (!$moved) {
            throw new Exception(
                'No se pudo guardar el archivo subido.'
            );
        }

        return [
            'nombre_original' => basename(
                $file['name']
            ),
            'nombre_archivo' => $nombreArchivo,
            'ruta' => '/uploads/' . $carpeta . '/',
            'ruta_fisica' => $rutaFisica,
            'tipo_mime' => $mimeType,
            'tamano_bytes' => (int) $file['size']
        ];
    }

    private function eliminarArchivoFisico(
        string $rutaFisica
    ): void {
        if (is_file($rutaFisica)) {
            unlink($rutaFisica);
        }
    }

    private function obtenerRutaFisica(
        array $adjunto
    ): string {
        return
            __DIR__ .
            '/..' .
            $adjunto['ruta'] .
            $adjunto['nombre_archivo'];
    }

    // ==============================================================
    // HELPERS
    // ==============================================================

    private function getAdjunto(int $id): array
    {
        $adjunto = $this->repository->findById(
            $id
        );

        if (!$adjunto) {
            throw new Exception(
                'Adjunto no encontrado.'
            );
        }

        return $adjunto;
    }

    private function getEntrega(
        int $entregaId
    ): array {
        $entrega = $this->entregaRepository
            ->findById(
                $entregaId
            );

        if (!$entrega) {
            throw new Exception(
                'Entrega no encontrada.'
            );
        }

        return $entrega;
    }

    private function getContenido(
        int $contenidoId
    ): array {
        $contenido = $this->contenidoRepository
            ->findById(
                $contenidoId
            );

        if (!$contenido) {
            throw new Exception(
                'Contenido no encontrado.'
            );
        }

        return $contenido;
    }

    private function validarUsuario(
        array $user
    ): void {
        if (!isset($user['id'], $user['rol'])) {
            throw new RuntimeException(
                'Usuario autenticado inválido.',
                403
            );
        }
    }

    private function recuperarAdjuntoCreado(
        int $id,
        string $rutaFisica
    ): array {
        $adjunto = $this->repository->findById(
            $id
        );

        if (!$adjunto) {
            $this->eliminarArchivoFisico(
                $rutaFisica
            );

            throw new Exception(
                'No se pudo recuperar el adjunto creado.'
            );
        }

        return $adjunto;
    }
}
