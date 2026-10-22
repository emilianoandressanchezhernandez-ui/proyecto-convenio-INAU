<?php

/**
 * VALIDADOR DE AUTENTICACIÓN
 * ==================================================================
 * Valida los datos relacionados con autenticación y perfil.
 * ==================================================================
 */
class AuthValidator
{
    /** Valida exclusivamente POST /login. */
    public static function validateLogin(array $data): array
    {
        $errors = [];

        if (
            !isset($data['correo']) ||
            !is_string($data['correo']) ||
            trim($data['correo']) === ''
        ) {
            $errors[] = 'Falta el correo.';
        }

        if (
            !isset($data['clave']) ||
            !is_string($data['clave']) ||
            $data['clave'] === ''
        ) {
            $errors[] = 'Falta la contraseña.';
        }

        return $errors;
    }

    /** Valida los datos modificables mediante PATCH /perfil. */
    public static function validateProfileUpdate(array $data): array
    {
        $errors = [];

        $permitidos = ['correo', 'telefono'];

        foreach ($data as $campo => $valor) {
            if (!in_array($campo, $permitidos, true)) {
                $errors[] = "El campo '{$campo}' no se puede modificar desde el perfil.";
            }
        }

        if (
            !array_key_exists('correo', $data) &&
            !array_key_exists('telefono', $data)
        ) {
            $errors[] = 'Debes enviar correo y/o teléfono.';
            return $errors;
        }

        if (array_key_exists('correo', $data)) {
            if (
                !is_string($data['correo']) ||
                trim($data['correo']) === ''
            ) {
                $errors[] = 'El correo no puede estar vacío.';
            } elseif (!filter_var(trim($data['correo']), FILTER_VALIDATE_EMAIL)) {
                $errors[] = 'El correo no tiene un formato válido.';
            }
        }

        if (array_key_exists('telefono', $data)) {
            if (
                $data['telefono'] !== null &&
                !is_string($data['telefono'])
            ) {
                $errors[] = 'El teléfono debe ser texto.';
            }
        }

        return $errors;
    }
}
