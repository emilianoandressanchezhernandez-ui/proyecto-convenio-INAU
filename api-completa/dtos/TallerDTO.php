<?php

class TallerDTO
{
    public string $nombre;
    public ?string $tematica;
    public ?string $descripcion;
    public ?string $centro;
    public ?string $direccion;
    public ?string $salon;
    public string $fecha_inicio;
    public string $fecha_fin;
    public string $estado;
    public ?string $observaciones;

    public function __construct(array $data)
    {
        $this->nombre = trim($data['nombre'] ?? '');

        $this->tematica =
            isset($data['tematica']) && $data['tematica'] !== ''
            ? trim($data['tematica'])
            : null;

        $this->descripcion =
            isset($data['descripcion']) && $data['descripcion'] !== ''
            ? trim($data['descripcion'])
            : null;

        $this->centro =
            isset($data['centro']) && $data['centro'] !== ''
            ? trim($data['centro'])
            : null;

        $this->direccion =
            isset($data['direccion']) && $data['direccion'] !== ''
            ? trim($data['direccion'])
            : null;

        $this->salon =
            isset($data['salon']) && $data['salon'] !== ''
            ? trim($data['salon'])
            : null;

        $this->fecha_inicio = trim($data['fecha_inicio'] ?? '');
        $this->fecha_fin = trim($data['fecha_fin'] ?? '');

        $this->estado = $data['estado'] ?? 'Activo';

        $this->observaciones =
            isset($data['observaciones']) && $data['observaciones'] !== ''
            ? trim($data['observaciones'])
            : null;
    }

    public function toArray(): array
    {
        return [
            'nombre' => $this->nombre,
            'tematica' => $this->tematica,
            'descripcion' => $this->descripcion,
            'centro' => $this->centro,
            'direccion' => $this->direccion,
            'salon' => $this->salon,
            'fecha_inicio' => $this->fecha_inicio,
            'fecha_fin' => $this->fecha_fin,
            'estado' => $this->estado,
            'observaciones' => $this->observaciones
        ];
    }
}
