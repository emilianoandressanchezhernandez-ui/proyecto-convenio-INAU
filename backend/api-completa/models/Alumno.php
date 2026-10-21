<?php

class Alumno
{
    private ?int $id;
    private ?int $usuarioId;
    private string $nombre;
    private string $apellido;
    private string $cedula;
    private ?string $correo;
    private ?string $telefono;
    private ?string $direccion;
    private ?string $referenteAdulto;
    private ?string $centroReferencia;
    private string $fechaNacimiento;
    private string $estado;
    private string $fechaRegistro;
    private ?string $ultimaAsistencia;
    private ?string $observaciones;

    public function __construct(
        ?int $id,
        ?int $usuarioId,
        string $nombre,
        string $apellido,
        string $cedula,
        ?string $correo,
        ?string $telefono,
        ?string $direccion,
        ?string $referenteAdulto,
        ?string $centroReferencia,
        string $fechaNacimiento,
        string $estado,
        string $fechaRegistro,
        ?string $ultimaAsistencia,
        ?string $observaciones
    ) {
        $this->id = $id;
        $this->usuarioId = $usuarioId;
        $this->nombre = $nombre;
        $this->apellido = $apellido;
        $this->cedula = $cedula;
        $this->correo = $correo;
        $this->telefono = $telefono;
        $this->direccion = $direccion;
        $this->referenteAdulto = $referenteAdulto;
        $this->centroReferencia = $centroReferencia;
        $this->fechaNacimiento = $fechaNacimiento;
        $this->estado = $estado;
        $this->fechaRegistro = $fechaRegistro;
        $this->ultimaAsistencia = $ultimaAsistencia;
        $this->observaciones = $observaciones;
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
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
            'fecha_registro' => $this->fechaRegistro,
            'ultima_asistencia' => $this->ultimaAsistencia,
            'observaciones' => $this->observaciones
        ];
    }
}
