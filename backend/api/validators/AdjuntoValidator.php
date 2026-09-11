<?php

class AdjuntoValidator
{
    private const MAX_SIZE = 10485760; // 10 MB

    private const ALLOWED_MIME_TYPES = [
        'application/pdf',
        'image/jpeg'
    ];

    public static function validateUpload(array $file): array
    {
        $errors = [];

        if (empty($file)) {
            $errors['archivo'] = 'Debe seleccionar un archivo.';
            return $errors;
        }

        if (!isset($file['error'])) {
            $errors['archivo'] = 'El archivo recibido no es válido.';
            return $errors;
        }

        if ($file['error'] !== UPLOAD_ERR_OK) {
            $errors['archivo'] = self::uploadErrorMessage(
                (int) $file['error']
            );

            return $errors;
        }

        if (
            !isset($file['size']) ||
            (int) $file['size'] <= 0
        ) {
            $errors['archivo'] = 'El archivo está vacío.';
        } elseif ((int) $file['size'] > self::MAX_SIZE) {
            $errors['archivo'] =
                'El archivo no puede superar los 10 MB.';
        }

        if (
            empty($file['tmp_name']) ||
            !is_uploaded_file($file['tmp_name'])
        ) {
            $errors['archivo'] =
                'No se pudo validar el archivo subido.';

            return $errors;
        }

        $finfo = new finfo(FILEINFO_MIME_TYPE);

        $mimeType = $finfo->file(
            $file['tmp_name']
        );

        if (
            !$mimeType ||
            !in_array(
                $mimeType,
                self::ALLOWED_MIME_TYPES,
                true
            )
        ) {
            $errors['archivo'] =
                'Solo se permiten archivos PDF o JPG.';
        }

        return $errors;
    }

    public static function getMimeType(array $file): ?string
    {
        if (
            empty($file['tmp_name']) ||
            !is_file($file['tmp_name'])
        ) {
            return null;
        }

        $finfo = new finfo(FILEINFO_MIME_TYPE);

        $mimeType = $finfo->file(
            $file['tmp_name']
        );

        return $mimeType ?: null;
    }

    public static function getExtension(string $mimeType): ?string
    {
        return match ($mimeType) {
            'application/pdf' => 'pdf',
            'image/jpeg' => 'jpg',
            default => null
        };
    }

    private static function uploadErrorMessage(int $error): string
    {
        return match ($error) {
            UPLOAD_ERR_INI_SIZE,
            UPLOAD_ERR_FORM_SIZE =>
            'El archivo supera el tamaño permitido.',

            UPLOAD_ERR_PARTIAL =>
            'El archivo se subió de forma incompleta.',

            UPLOAD_ERR_NO_FILE =>
            'Debe seleccionar un archivo.',

            UPLOAD_ERR_NO_TMP_DIR =>
            'No se encontró la carpeta temporal del servidor.',

            UPLOAD_ERR_CANT_WRITE =>
            'No se pudo guardar el archivo en el servidor.',

            UPLOAD_ERR_EXTENSION =>
            'La subida del archivo fue bloqueada por el servidor.',

            default =>
            'Ocurrió un error al subir el archivo.'
        };
    }
}
