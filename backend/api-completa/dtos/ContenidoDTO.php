<?php

class ContenidoDTO
{
    public string $tipo;
    public string $titulo;
    public ?string $descripcion;
    public ?string $fechaLimite;

    public function __construct(array $data)
    {
        $this->tipo = trim($data['tipo']);
        $this->titulo = trim($data['titulo']);
        $this->descripcion = isset($data['descripcion'])
            ? trim($data['descripcion'])
            : null;

        $this->fechaLimite = !empty($data['fecha_limite'])
            ? $data['fecha_limite']
            : null;
    }

    public function toArray(): array
    {
        return [
            'tipo' => $this->tipo,
            'titulo' => $this->titulo,
            'descripcion' => $this->descripcion,
            'fecha_limite' => $this->fechaLimite
        ];
    }
}
