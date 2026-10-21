<?php

class TalleristaService
{
    private TalleristaRepository $repository;

    public function __construct()
    {
        $this->repository = new TalleristaRepository();
    }

    public function getAll(): array
    {
        return $this->repository->findAll();
    }

    public function getById(int $id): array
    {
        $tallerista = $this->repository->findById($id);

        if (!$tallerista) {
            throw new Exception('Tallerista no encontrado.');
        }

        return $tallerista;
    }

    public function create(array $data): array
    {
        $errores = TalleristaValidator::validarCreacion($data);

        if (!empty($errores)) {
            throw new InvalidArgumentException(
                json_encode($errores, JSON_UNESCAPED_UNICODE)
            );
        }

        $cedula = trim($data['cedula']);
        $correo = trim($data['correo']);

        if ($this->repository->findByCedula($cedula)) {
            throw new Exception('Ya existe un usuario con esa cédula.');
        }

        if ($this->repository->findByCorreo($correo)) {
            throw new Exception('Ya existe un usuario con ese correo.');
        }

        $dto = new TalleristaDTO($data);
        $tallerista = $dto->toArray();

        // Nunca guardamos la contraseña original.
        $tallerista['clave_hash'] = password_hash(
            $tallerista['clave'],
            PASSWORD_DEFAULT
        );

        unset($tallerista['clave']);

        $id = $this->repository->create($tallerista);

        return $this->repository->findById($id);
    }

    public function update(int $id, array $data): array
    {
        $actual = $this->repository->findById($id);

        if (!$actual) {
            throw new Exception('Tallerista no encontrado.');
        }

        $errores = TalleristaValidator::validarActualizacion($data);

        if (!empty($errores)) {
            throw new InvalidArgumentException(
                json_encode($errores, JSON_UNESCAPED_UNICODE)
            );
        }

        // La cédula no se modifica desde este endpoint.
        unset($data['cedula']);
        unset($data['rol']);

        if (array_key_exists('correo', $data)) {
            $correo = trim($data['correo']);
            $usuarioConCorreo = $this->repository->findByCorreo($correo);

            if (
                $usuarioConCorreo !== null &&
                (int) $usuarioConCorreo['id'] !== $id
            ) {
                throw new Exception('Ya existe un usuario con ese correo.');
            }

            $data['correo'] = $correo;
        }

        if (array_key_exists('clave', $data)) {
            $data['clave_hash'] = password_hash(
                $data['clave'],
                PASSWORD_DEFAULT
            );

            unset($data['clave']);
        }

        $this->repository->update($id, $data);

        return $this->repository->findById($id);
    }

    public function deactivate(int $id): void
    {
        $tallerista = $this->repository->findById($id);

        if (!$tallerista) {
            throw new Exception('Tallerista no encontrado.');
        }

        $this->repository->deactivate($id);
    }
}
