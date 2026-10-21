<?php

class AlumnoDTO
{
    public ?int $usuarioId;
    public string $nombre;
    public string $apellido;
    public string $cedula;
    public ?string $correo;
    public ?string $telefono;
    public ?string $direccion;
    public ?string $referenteAdulto;
    public ?string $centroReferencia;
    public string $fechaNacimiento;
    public string $estado;
    public ?string $observaciones;

    public function __construct(array $datos)
    {
        $this->usuarioId = isset($datos['usuario_id'])
            ? (int) $datos['usuario_id']
            : null;

        $this->nombre = trim($datos['nombre'] ?? '');
        $this->apellido = trim($datos['apellido'] ?? '');
        $this->cedula = trim($datos['cedula'] ?? '');

        $this->correo = isset($datos['correo']) && $datos['correo'] !== ''
            ? trim($datos['correo'])
            : null;

        $this->telefono = isset($datos['telefono']) && $datos['telefono'] !== ''
            ? trim($datos['telefono'])
            : null;

        $this->direccion = isset($datos['direccion']) && $datos['direccion'] !== ''
            ? trim($datos['direccion'])
            : null;

        $this->referenteAdulto = isset($datos['referente_adulto']) && $datos['referente_adulto'] !== ''
            ? trim($datos['referente_adulto'])
            : null;

        $this->centroReferencia = isset($datos['centro_referencia']) && $datos['centro_referencia'] !== ''
            ? trim($datos['centro_referencia'])
            : null;

        $this->fechaNacimiento = trim($datos['fecha_nacimiento'] ?? '');

        $this->estado = $datos['estado'] ?? 'Activo';

        $this->observaciones = isset($datos['observaciones']) && $datos['observaciones'] !== ''
            ? trim($datos['observaciones'])
            : null;
    }

    public function toArray(): array
    {
        return [
            'usuario_id' => $this->usuarioId,
            'nombre' => $this->nombre,
            'apellido' => $this->apellido,
            'cedula' => $this->cedula,
            'correo' => $this->correo,
            'telefono' => $this->telefono,
            'direccion' => $this->direccion,
            'referente_adulto' => $this->referenteAdulto,
            'centro_referencia' => $this->centroReferencia,
            'fecha_nacimiento' => $this->fechaNacimiento,
            'estado' => $this->estado,
            'observaciones' => $this->observaciones
        ];
    }
}
