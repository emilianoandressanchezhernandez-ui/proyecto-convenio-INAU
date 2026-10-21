<?php

class AdjuntoController extends Controller
{
    private AdjuntoService $service;

    public function __construct()
    {
        $this->service = new AdjuntoService();
    }

    // ==============================================================
    // ADJUNTOS DE ENTREGAS
    // ==============================================================

    public function byEntrega($entregaId): void
    {
        try {
            $adjuntos = $this->service->getByEntrega(
                (int) $entregaId,
                $this->user()
            );

            Response::success(
                $adjuntos,
                'Adjuntos obtenidos correctamente.'
            );
        } catch (Exception $e) {
            $this->handleException($e);
        }
    }

    public function uploadForEntrega($entregaId): void
    {
        try {
            $file = $this->getUploadedFile();

            $adjunto = $this->service->uploadForEntrega(
                (int) $entregaId,
                $file,
                $this->user()
            );

            Response::success(
                $adjunto,
                'Archivo subido correctamente.',
                201
            );
        } catch (InvalidArgumentException $e) {
            $this->handleValidationException($e);
        } catch (Exception $e) {
            $this->handleException($e);
        }
    }

    // ==============================================================
    // ADJUNTOS DE CONTENIDOS
    // ==============================================================

    public function byContenido($contenidoId): void
    {
        try {
            $adjuntos = $this->service->getByContenido(
                (int) $contenidoId,
                $this->user()
            );

            Response::success(
                $adjuntos,
                'Adjuntos del contenido obtenidos correctamente.'
            );
        } catch (Exception $e) {
            $this->handleException($e);
        }
    }

    public function uploadForContenido($contenidoId): void
    {
        try {
            $file = $this->getUploadedFile();

            $adjunto = $this->service->uploadForContenido(
                (int) $contenidoId,
                $file,
                $this->user()
            );

            Response::success(
                $adjunto,
                'Archivo del contenido subido correctamente.',
                201
            );
        } catch (InvalidArgumentException $e) {
            $this->handleValidationException($e);
        } catch (Exception $e) {
            $this->handleException($e);
        }
    }

    // ==============================================================
    // DESCARGA
    // ==============================================================

    public function archivo($id): void
    {
        try {
            $resultado = $this->service->getFile(
                (int) $id,
                $this->user()
            );

            $adjunto = $resultado['adjunto'];
            $rutaFisica = $resultado['ruta_fisica'];

            $nombreOriginal = basename(
                $adjunto['nombre_original']
            );

            header(
                'Content-Type: ' .
                    $adjunto['tipo_mime']
            );

            header(
                'Content-Length: ' .
                    filesize($rutaFisica)
            );

            header(
                'Content-Disposition: attachment; filename="' .
                    addcslashes(
                        $nombreOriginal,
                        '"\\'
                    ) .
                    '"'
            );

            header(
                'X-Content-Type-Options: nosniff'
            );

            readfile($rutaFisica);
            exit;
        } catch (Exception $e) {
            $this->handleException($e);
        }
    }

    // ==============================================================
    // ELIMINACIÓN
    // ==============================================================

    public function delete($id): void
    {
        try {
            $this->service->delete(
                (int) $id,
                $this->user()
            );

            Response::success(
                null,
                'Adjunto eliminado correctamente.'
            );
        } catch (Exception $e) {
            $this->handleException($e);
        }
    }

    // ==============================================================
    // HELPERS
    // ==============================================================

    private function getUploadedFile(): array
    {
        if (
            !isset($_FILES['archivo']) ||
            !is_array($_FILES['archivo'])
        ) {
            throw new InvalidArgumentException(
                json_encode(
                    [
                        'archivo' =>
                        'Debe enviar un archivo.'
                    ],
                    JSON_UNESCAPED_UNICODE
                )
            );
        }

        return $_FILES['archivo'];
    }

    private function handleValidationException(
        InvalidArgumentException $e
    ): void {
        $errors = json_decode(
            $e->getMessage(),
            true
        );

        Response::error(
            'El archivo no es válido.',
            422,
            is_array($errors) ? $errors : []
        );
    }

    private function handleException(
        Exception $e
    ): void {
        $message = strtolower(
            $e->getMessage()
        );

        if (
            str_contains($message, 'no encontrado') ||
            str_contains($message, 'no encontrada') ||
            str_contains(
                $message,
                'no existe en el servidor'
            )
        ) {
            $status = 404;
        } elseif (
            $e->getCode() === 403 ||
            str_contains($message, 'permiso') ||
            str_contains(
                $message,
                'solo un alumno'
            ) ||
            str_contains(
                $message,
                'usuario autenticado'
            )
        ) {
            $status = 403;
        } else {
            $status = 400;
        }

        Response::error(
            $e->getMessage(),
            $status
        );
    }
}
