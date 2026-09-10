<?php

class EntregaValidator
{
    public static function validateComentario(array $data): array
    {
        $errors = [];

        if (!array_key_exists('comentario', $data)) {
            $errors['comentario'] =
                'El comentario es obligatorio.';
        } elseif (
            $data['comentario'] !== null &&
            !is_string($data['comentario'])
        ) {
            $errors['comentario'] =
                'El comentario debe ser texto.';
        }

        return $errors;
    }

    public static function validateNota(array $data): array
    {
        $errors = [];

        if (!isset($data['nota'])) {
            $errors['nota'] =
                'La nota es obligatoria.';
        } elseif (
            !filter_var(
                $data['nota'],
                FILTER_VALIDATE_INT,
                [
                    'options' => [
                        'min_range' => 1,
                        'max_range' => 10
                    ]
                ]
            )
        ) {
            $errors['nota'] =
                'La nota debe ser un número entero entre 1 y 10.';
        }

        return $errors;
    }
}
