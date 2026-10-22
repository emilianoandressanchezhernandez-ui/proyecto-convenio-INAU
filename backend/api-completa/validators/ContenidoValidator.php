<?php

class ContenidoValidator
{
    public static function validateCreate(array $data): array
    {
        $errors = [];

        $tiposPermitidos = [
            'Material',
            'Tarea'
        ];

        if (empty($data['tipo'])) {
            $errors['tipo'] = 'El tipo es obligatorio.';
        } elseif (!in_array($data['tipo'], $tiposPermitidos, true)) {
            $errors['tipo'] = 'El tipo debe ser Material o Tarea.';
        }

        if (empty($data['titulo'])) {
            $errors['titulo'] = 'El título es obligatorio.';
        } elseif (!is_string($data['titulo'])) {
            $errors['titulo'] = 'El título debe ser texto.';
        } elseif (strlen(trim($data['titulo'])) > 150) {
            $errors['titulo'] = 'El título no puede superar los 150 caracteres.';
        }

        if (
            isset($data['descripcion']) &&
            $data['descripcion'] !== null &&
            !is_string($data['descripcion'])
        ) {
            $errors['descripcion'] = 'La descripción debe ser texto.';
        }

        if (
            isset($data['fecha_limite']) &&
            $data['fecha_limite'] !== null &&
            $data['fecha_limite'] !== '' &&
            !self::validDate($data['fecha_limite'])
        ) {
            $errors['fecha_limite'] =
                'La fecha límite debe tener formato YYYY-MM-DD.';
        }

        return $errors;
    }

    public static function validateUpdate(array $data): array
    {
        return self::validateCreate($data);
    }

    private static function validDate(string $date): bool
    {
        $dateObject = DateTime::createFromFormat('Y-m-d', $date);

        return $dateObject !== false
            && $dateObject->format('Y-m-d') === $date;
    }
}
