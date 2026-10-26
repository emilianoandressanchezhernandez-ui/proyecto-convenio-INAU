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
            $telefono = $data['telefono'];

            if ($telefono !== null && !is_string($telefono)) {
                $errors[] = 'El teléfono debe ser texto.';
            } elseif (is_string($telefono) && trim($telefono) !== '') {
                $telefono = trim($telefono);
                $cantidadDigitos = preg_match_all('/[0-9]/', $telefono);

                if (!preg_match('/^\+?[0-9\s-]+$/', $telefono)) {
                    $errors[] = 'El teléfono solo puede contener números, espacios, guiones y un + al inicio.';
                } elseif ($cantidadDigitos < 8 || $cantidadDigitos > 15) {
                    $errors[] = 'El teléfono debe tener entre 8 y 15 dígitos.';
                }
            }
        }

        return $errors;
    }


    /** Valida PATCH /perfil/clave. */
    public static function validatePasswordChange(array $data): array
    {
        $errors = [];

        $permitidos = ['clave_actual', 'clave_nueva'];

        foreach ($data as $campo => $valor) {
            if (!in_array($campo, $permitidos, true)) {
                $errors[] = "El campo '{$campo}' no está permitido.";
            }
        }

        if (
            !isset($data['clave_actual']) ||
            !is_string($data['clave_actual']) ||
            $data['clave_actual'] === ''
        ) {
            $errors[] = 'La contraseña actual es obligatoria.';
        }

        if (
            !isset($data['clave_nueva']) ||
            !is_string($data['clave_nueva']) ||
            $data['clave_nueva'] === ''
        ) {
            $errors[] = 'La nueva contraseña es obligatoria.';
        } elseif (
            strlen($data['clave_nueva']) < 8
        ) {
            $errors[] = 'La nueva contraseña debe tener al menos 8 caracteres.';
        } elseif (
            strlen($data['clave_nueva']) > 128
        ) {
            $errors[] = 'La nueva contraseña es demasiado larga.';
        }

        if (
            isset($data['clave_actual'], $data['clave_nueva']) &&
            is_string($data['clave_actual']) &&
            is_string($data['clave_nueva']) &&
            $data['clave_actual'] === $data['clave_nueva']
        ) {
            $errors[] = 'La nueva contraseña debe ser diferente de la actual.';
        }

        return $errors;
    }
}
