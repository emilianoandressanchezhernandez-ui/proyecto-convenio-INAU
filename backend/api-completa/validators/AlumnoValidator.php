<?php

class AlumnoValidator
{
    public static function validarCreacion(array $datos): array
    {
        $errores = [];

        if (empty(trim($datos['nombre'] ?? ''))) {
            $errores['nombre'] = 'El nombre es obligatorio.';
        }

        if (empty(trim($datos['apellido'] ?? ''))) {
            $errores['apellido'] = 'El apellido es obligatorio.';
        }

        if (empty(trim($datos['cedula'] ?? ''))) {
            $errores['cedula'] = 'La cédula es obligatoria.';
        }

        if (empty(trim($datos['fecha_nacimiento'] ?? ''))) {
            $errores['fecha_nacimiento'] = 'La fecha de nacimiento es obligatoria.';
        } elseif (!self::fechaValida($datos['fecha_nacimiento'])) {
            $errores['fecha_nacimiento'] = 'La fecha de nacimiento debe tener formato YYYY-MM-DD.';
        }

        if (
            isset($datos['correo']) &&
            $datos['correo'] !== '' &&
            !filter_var($datos['correo'], FILTER_VALIDATE_EMAIL)
        ) {
            $errores['correo'] = 'El correo electrónico no es válido.';
        }

        if (
            isset($datos['estado']) &&
            !in_array($datos['estado'], ['Activo', 'Inactivo'], true)
        ) {
            $errores['estado'] = 'El estado debe ser Activo o Inactivo.';
        }

        return $errores;
    }

    public static function validarActualizacion(array $datos): array
    {
        $errores = [];

        if (
            array_key_exists('nombre', $datos) &&
            empty(trim($datos['nombre']))
        ) {
            $errores['nombre'] = 'El nombre no puede estar vacío.';
        }

        if (
            array_key_exists('apellido', $datos) &&
            empty(trim($datos['apellido']))
        ) {
            $errores['apellido'] = 'El apellido no puede estar vacío.';
        }

        if (
            isset($datos['correo']) &&
            $datos['correo'] !== '' &&
            !filter_var($datos['correo'], FILTER_VALIDATE_EMAIL)
        ) {
            $errores['correo'] = 'El correo electrónico no es válido.';
        }

        if (
            isset($datos['fecha_nacimiento']) &&
            !self::fechaValida($datos['fecha_nacimiento'])
        ) {
            $errores['fecha_nacimiento'] = 'La fecha de nacimiento debe tener formato YYYY-MM-DD.';
        }

        if (
            isset($datos['estado']) &&
            !in_array($datos['estado'], ['Activo', 'Inactivo'], true)
        ) {
            $errores['estado'] = 'El estado debe ser Activo o Inactivo.';
        }

        return $errores;
    }

    private static function fechaValida(string $fecha): bool
    {
        $date = DateTime::createFromFormat('Y-m-d', $fecha);

        return $date !== false &&
            $date->format('Y-m-d') === $fecha;
    }
}
