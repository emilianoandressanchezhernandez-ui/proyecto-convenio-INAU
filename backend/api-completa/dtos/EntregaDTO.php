<?php

class EntregaDTO
{
    public int $alumnoId;

    public function __construct(array $data)
    {
        $this->alumnoId = (int) $data['alumno_id'];
    }

    public function toArray(): array
    {
        return [
            'alumno_id' => $this->alumnoId
        ];
    }
}
