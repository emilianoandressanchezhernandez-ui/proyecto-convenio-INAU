<?php

/**
 * DTO DE LOGIN
 * ==================================================================
 * Transporta correo y clave, ya validados, hasta AuthService.
 * ==================================================================
 */
class LoginDTO
{
    private string $correo;
    private string $clave;

    public function __construct(array $data)
    {
        $this->correo = strtolower(trim($data['correo']));
        $this->clave  = $data['clave'];
    }

    public function getCorreo(): string
    {
        return $this->correo;
    }

    public function getClave(): string
    {
        return $this->clave;
    }
}
