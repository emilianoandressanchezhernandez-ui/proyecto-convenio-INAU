<?php

class ReporteValidator
{
    public static function validateCreate(array $data): array
    {
        $errors = [];

        // Tipos de reportes permitidos.
        $tiposPermitidos = [
            'General',
            'Asistencia'
        ];

        if (
            !isset($data['tipo']) ||
            !is_string($data['tipo']) ||
            !in_array($data['tipo'], $tiposPermitidos, true)
        ) {
            $errors['tipo'] =
                'El tipo de reporte debe ser General o Asistencia.';

            return $errors;
        }

        // Un reporte general no pertenece a un taller específico.
        if ($data['tipo'] === 'General') {
            if (
                isset($data['taller_id']) &&
                $data['taller_id'] !== null
            ) {
                $errors['taller_id'] =
                    'Un reporte general no debe indicar un taller.';
            }
        }

        // Un reporte de asistencia requiere un taller válido.
        if ($data['tipo'] === 'Asistencia') {
            if (
                !isset($data['taller_id']) ||
                filter_var(
                    $data['taller_id'],
                    FILTER_VALIDATE_INT,
                    ['options' => ['min_range' => 1]]
                ) === false
            ) {
                $errors['taller_id'] =
                    'Seleccioná un taller válido para el reporte.';
            }
        }

        return $errors;
    }
}
