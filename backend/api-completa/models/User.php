<?php

class User
{
    private int $id;
    private string $nombre;
    private string $apellido;
    private string $cedula;
    private string $correo;
    private ?string $telefono;
    private string $claveHash;
    private string $rol;
    private ?string $especialidad;
    private string $estado;
    private string $fechaRegistro;
    private ?string $ultimoAcceso;

    public function __construct(
        $id,
        $nombre,
        $apellido,
        $cedula,
        $correo,
        $telefono,
        $claveHash,
        $rol,
        $especialidad,
        $estado,
        $fechaRegistro,
        $ultimoAcceso
    ) {
        $this->id = $id;
        $this->nombre = $nombre;
        $this->apellido = $apellido;
        $this->cedula = $cedula;
        $this->correo = $correo;
        $this->telefono = $telefono;
        $this->claveHash = $claveHash;
        $this->rol = $rol;
        $this->especialidad = $especialidad;
        $this->estado = $estado;
        $this->fechaRegistro = $fechaRegistro;
        $this->ultimoAcceso = $ultimoAcceso;
    }

    public function getId(): int
    {
        return $this->id;
    }

    public function getName(): string
    {
        return $this->nombre;
    }

    public function getLastName(): string
    {
        return $this->apellido;
    }

    public function getCedula(): string
    {
        return $this->cedula;
    }

    public function getEmail(): string
    {
        return $this->correo;
    }

    public function getRole(): string
    {
        return $this->rol;
    }

    public function isActivo(): bool
    {
        return $this->estado === 'Activo';
    }

    public function checkPassword(string $plainPassword): bool
    {
        return password_verify($plainPassword, $this->claveHash);
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'nombre' => $this->nombre,
            'apellido' => $this->apellido,
            'cedula' => $this->cedula,
            'correo' => $this->correo,
            'telefono' => $this->telefono,
            'rol' => $this->rol,
            'especialidad' => $this->especialidad,
            'estado' => $this->estado,
            'fechaRegistro' => $this->fechaRegistro,
            'ultimoAcceso' => $this->ultimoAcceso
        ];
    }
}
