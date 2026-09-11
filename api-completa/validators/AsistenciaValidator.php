<?php

class AsistenciaValidator
{
    public static function validateCreate(array $data): array
    {
        $errors = [];

        if (empty($data['fecha'])) {
            $errors['fecha'] = 'La fecha es obligatoria.';
        } elseif (!self::validDate($data['fecha'])) {
            $errors['fecha'] = 'La fecha debe tener formato YYYY-MM-DD.';
        }

        return $errors;
    }

    public static function validateRegistro(array $data): array
    {
        $errors = [];

        if (
            !isset($data['alumno_id']) ||
            !filter_var(
                $data['alumno_id'],
                FILTER_VALIDATE_INT,
                ['options' => ['min_range' => 1]]
            )
        ) {
            $errors['alumno_id'] =
                'El ID del alumno debe ser un número entero válido.';
        }

        $estadosPermitidos = [
            'Presente',
            'Ausente',
            'Justificado',
            'Tardanza'
        ];

        if (empty($data['estado'])) {
            $errors['estado'] = 'El estado de asistencia es obligatorio.';
        } elseif (!in_array($data['estado'], $estadosPermitidos, true)) {
            $errors['estado'] =
                'El estado debe ser Presente, Ausente, Justificado o Tardanza.';
        }

        if (
            isset($data['observaciones']) &&
            $data['observaciones'] !== null &&
            !is_string($data['observaciones'])
        ) {
            $errors['observaciones'] =
                'Las observaciones deben ser texto.';
        }

        return $errors;
    }

    private static function validDate(string $date): bool
    {
        $dateObject = DateTime::createFromFormat('Y-m-d', $date);

        return $dateObject !== false
            && $dateObject->format('Y-m-d') === $date;
    }
}
