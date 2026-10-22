<?php

class AsignacionValidator
{
    public static function validateTalleristaAssignment(array $data): array
    {
        $errors = [];

        if (
            !isset($data['tallerista_id']) ||
            !filter_var(
                $data['tallerista_id'],
                FILTER_VALIDATE_INT,
                ['options' => ['min_range' => 1]]
            )
        ) {
            $errors['tallerista_id'] =
                'El ID del tallerista debe ser un número entero válido.';
        }

        if (
            isset($data['fecha_asignacion']) &&
            !self::validDate($data['fecha_asignacion'])
        ) {
            $errors['fecha_asignacion'] =
                'La fecha de asignación debe tener formato YYYY-MM-DD.';
        }

        return $errors;
    }

    public static function validateAlumnoAssignment(array $data): array
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

        return $errors;
    }

    private static function validDate(string $date): bool
    {
        $dateObject = DateTime::createFromFormat('Y-m-d', $date);

        return $dateObject !== false &&
            $dateObject->format('Y-m-d') === $date;
    }
}
