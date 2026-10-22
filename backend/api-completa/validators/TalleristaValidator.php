<?php

class TalleristaValidator
{
    public static function validarCreacion(array $data): array
    {
        $errores = [];

        if (empty(trim($data['nombre'] ?? ''))) {
            $errores['nombre'] = 'El nombre es obligatorio.';
        }

        if (empty(trim($data['apellido'] ?? ''))) {
            $errores['apellido'] = 'El apellido es obligatorio.';
        }

        if (empty(trim($data['cedula'] ?? ''))) {
            $errores['cedula'] = 'La cédula es obligatoria.';
        }

        if (empty(trim($data['correo'] ?? ''))) {
            $errores['correo'] = 'El correo es obligatorio.';
        } elseif (!filter_var($data['correo'], FILTER_VALIDATE_EMAIL)) {
            $errores['correo'] = 'El correo electrónico no es válido.';
        }

        if (empty($data['clave'] ?? '')) {
            $errores['clave'] = 'La contraseña es obligatoria.';
        } elseif (strlen($data['clave']) < 8) {
            $errores['clave'] = 'La contraseña debe tener al menos 8 caracteres.';
        }

        if (
            isset($data['estado']) &&
            !in_array($data['estado'], ['Activo', 'Inactivo'], true)
        ) {
            $errores['estado'] = 'El estado debe ser Activo o Inactivo.';
        }

        return $errores;
    }

    public static function validarActualizacion(array $data): array
    {
        $errores = [];

        if (
            array_key_exists('nombre', $data) &&
            empty(trim($data['nombre']))
        ) {
            $errores['nombre'] = 'El nombre no puede estar vacío.';
        }

        if (
            array_key_exists('apellido', $data) &&
            empty(trim($data['apellido']))
        ) {
            $errores['apellido'] = 'El apellido no puede estar vacío.';
        }

        if (
            array_key_exists('correo', $data) &&
            (
                empty(trim($data['correo'])) ||
                !filter_var($data['correo'], FILTER_VALIDATE_EMAIL)
            )
        ) {
            $errores['correo'] = 'El correo electrónico no es válido.';
        }

        if (
            array_key_exists('clave', $data) &&
            strlen($data['clave']) < 8
        ) {
            $errores['clave'] = 'La contraseña debe tener al menos 8 caracteres.';
        }

        if (
            isset($data['estado']) &&
            !in_array($data['estado'], ['Activo', 'Inactivo'], true)
        ) {
            $errores['estado'] = 'El estado debe ser Activo o Inactivo.';
        }

        return $errores;
    }
}
