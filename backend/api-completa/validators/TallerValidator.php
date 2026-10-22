<?php

class TallerValidator
{
    public static function validarCreacion(array $data): array
    {
        $errores = [];

        if (empty(trim($data['nombre'] ?? ''))) {
            $errores['nombre'] = 'El nombre es obligatorio.';
        }

        if (empty(trim($data['fecha_inicio'] ?? ''))) {
            $errores['fecha_inicio'] = 'La fecha de inicio es obligatoria.';
        } elseif (!self::fechaValida($data['fecha_inicio'])) {
            $errores['fecha_inicio'] =
                'La fecha de inicio debe tener formato YYYY-MM-DD.';
        }

        if (empty(trim($data['fecha_fin'] ?? ''))) {
            $errores['fecha_fin'] = 'La fecha de fin es obligatoria.';
        } elseif (!self::fechaValida($data['fecha_fin'])) {
            $errores['fecha_fin'] =
                'La fecha de fin debe tener formato YYYY-MM-DD.';
        }

        if (
            self::fechaValida($data['fecha_inicio'] ?? '') &&
            self::fechaValida($data['fecha_fin'] ?? '') &&
            $data['fecha_fin'] < $data['fecha_inicio']
        ) {
            $errores['fecha_fin'] =
                'La fecha de fin no puede ser anterior a la fecha de inicio.';
        }

        if (
            isset($data['estado']) &&
            !in_array($data['estado'], ['Activo', 'Finalizado'], true)
        ) {
            $errores['estado'] =
                'El estado debe ser Activo o Finalizado.';
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
            array_key_exists('fecha_inicio', $data) &&
            !self::fechaValida($data['fecha_inicio'])
        ) {
            $errores['fecha_inicio'] =
                'La fecha de inicio debe tener formato YYYY-MM-DD.';
        }

        if (
            array_key_exists('fecha_fin', $data) &&
            !self::fechaValida($data['fecha_fin'])
        ) {
            $errores['fecha_fin'] =
                'La fecha de fin debe tener formato YYYY-MM-DD.';
        }

        if (
            isset($data['estado']) &&
            !in_array($data['estado'], ['Activo', 'Finalizado'], true)
        ) {
            $errores['estado'] =
                'El estado debe ser Activo o Finalizado.';
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
