<?php

class TalleristaDTO
{
    public string $nombre;
    public string $apellido;
    public string $cedula;
    public string $correo;
    public ?string $telefono;
    public string $clave;
    public ?string $especialidad;
    public string $estado;

    public function __construct(array $data)
    {
        $this->nombre = trim($data['nombre'] ?? '');
        $this->apellido = trim($data['apellido'] ?? '');
        $this->cedula = trim($data['cedula'] ?? '');
        $this->correo = trim($data['correo'] ?? '');

        $this->telefono =
            isset($data['telefono']) && $data['telefono'] !== ''
            ? trim($data['telefono'])
            : null;

        $this->clave = $data['clave'] ?? '';

        $this->especialidad =
            isset($data['especialidad']) && $data['especialidad'] !== ''
            ? trim($data['especialidad'])
            : null;

        $this->estado = $data['estado'] ?? 'Activo';
    }

    public function toArray(): array
    {
        return [
            'nombre' => $this->nombre,
            'apellido' => $this->apellido,
            'cedula' => $this->cedula,
            'correo' => $this->correo,
            'telefono' => $this->telefono,
            'clave' => $this->clave,
            'especialidad' => $this->especialidad,
            'estado' => $this->estado
        ];
    }
}
