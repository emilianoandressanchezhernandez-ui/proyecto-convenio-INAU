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
        } elseif (!self::cedulaValida($data['cedula'])) {
            $errores['cedula'] = 'La cédula debe contener exactamente 8 dígitos.';
        }

        if (empty(trim($data['correo'] ?? ''))) {
            $errores['correo'] = 'El correo es obligatorio.';
        } elseif (!filter_var($data['correo'], FILTER_VALIDATE_EMAIL)) {
            $errores['correo'] = 'El correo electrónico no es válido.';
        }

        if (
            isset($data['telefono']) &&
            $data['telefono'] !== null &&
            trim($data['telefono']) !== '' &&
            !self::telefonoValido($data['telefono'])
        ) {
            $errores['telefono'] = 'El teléfono debe contener entre 8 y 15 dígitos y no puede incluir letras.';
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

        if (array_key_exists('cedula', $data)) {
            if (
                !is_string($data['cedula']) ||
                !self::cedulaValida($data['cedula'])
            ) {
                $errores['cedula'] = 'La cédula debe contener exactamente 8 dígitos.';
            }
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
            array_key_exists('telefono', $data) &&
            $data['telefono'] !== null &&
            trim($data['telefono']) !== '' &&
            !self::telefonoValido($data['telefono'])
        ) {
            $errores['telefono'] = 'El teléfono debe contener entre 8 y 15 dígitos y no puede incluir letras.';
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

    private static function cedulaValida(string $cedula): bool
    {
        return (bool) preg_match(
            '/^(?:[0-9]{8}|[0-9]\.[0-9]{3}\.[0-9]{3}-[0-9])$/',
            $cedula
        );
    }

    private static function telefonoValido(string $telefono): bool
    {
        if (!preg_match('/^[0-9+\s()-]+$/', $telefono)) {
            return false;
        }

        $soloDigitos = preg_replace('/\D/', '', $telefono);
        $cantidad = strlen($soloDigitos);

        return $cantidad >= 8 && $cantidad <= 15;
    }
}
