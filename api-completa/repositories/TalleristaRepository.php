<?php

class TalleristaRepository extends Repository
{
    public function findAll(): array
    {
        $sql = "SELECT id, nombre, apellido, cedula, correo, telefono,
                       rol, especialidad, estado, fecha_registro, ultimo_acceso
                FROM usuarios
                WHERE rol = 'tallerista'
                ORDER BY apellido ASC, nombre ASC";

        $query = $this->db->query($sql);

        return $query->fetchAll(PDO::FETCH_ASSOC);
    }

    public function findById(int $id): ?array
    {
        $sql = "SELECT id, nombre, apellido, cedula, correo, telefono,
                       rol, especialidad, estado, fecha_registro, ultimo_acceso
                FROM usuarios
                WHERE id = :id AND rol = 'tallerista'
                LIMIT 1";

        $query = $this->db->prepare($sql);
        $query->execute(['id' => $id]);

        $row = $query->fetch(PDO::FETCH_ASSOC);

        return $row ?: null;
    }

    public function findByCedula(string $cedula): ?array
    {
        $sql = "SELECT id, cedula
                FROM usuarios
                WHERE cedula = :cedula
                LIMIT 1";

        $query = $this->db->prepare($sql);
        $query->execute(['cedula' => $cedula]);

        $row = $query->fetch(PDO::FETCH_ASSOC);

        return $row ?: null;
    }

    public function findByCorreo(string $correo): ?array
    {
        $sql = "SELECT id, correo
                FROM usuarios
                WHERE correo = :correo
                LIMIT 1";

        $query = $this->db->prepare($sql);
        $query->execute(['correo' => $correo]);

        $row = $query->fetch(PDO::FETCH_ASSOC);

        return $row ?: null;
    }

    public function create(array $data): int
    {
        $sql = "INSERT INTO usuarios (
                    nombre,
                    apellido,
                    cedula,
                    correo,
                    telefono,
                    clave_hash,
                    rol,
                    especialidad,
                    estado,
                    fecha_registro
                ) VALUES (
                    :nombre,
                    :apellido,
                    :cedula,
                    :correo,
                    :telefono,
                    :clave_hash,
                    'tallerista',
                    :especialidad,
                    :estado,
                    :fecha_registro
                )";

        $query = $this->db->prepare($sql);

        $query->execute([
            'nombre' => $data['nombre'],
            'apellido' => $data['apellido'],
            'cedula' => $data['cedula'],
            'correo' => $data['correo'],
            'telefono' => $data['telefono'] ?? null,
            'clave_hash' => $data['clave_hash'],
            'especialidad' => $data['especialidad'] ?? null,
            'estado' => $data['estado'] ?? 'Activo',
            'fecha_registro' => date('Y-m-d')
        ]);

        return (int) $this->db->lastInsertId();
    }

    public function update(int $id, array $data): bool
    {
        $fields = [];
        $params = ['id' => $id];

        $allowedFields = [
            'nombre',
            'apellido',
            'correo',
            'telefono',
            'especialidad',
            'estado'
        ];

        foreach ($allowedFields as $field) {
            if (array_key_exists($field, $data)) {
                $fields[] = "{$field} = :{$field}";
                $params[$field] = $data[$field];
            }
        }

        if (isset($data['clave_hash'])) {
            $fields[] = 'clave_hash = :clave_hash';
            $params['clave_hash'] = $data['clave_hash'];
        }

        if (empty($fields)) {
            return false;
        }

        $sql = "UPDATE usuarios
                SET " . implode(', ', $fields) . "
                WHERE id = :id AND rol = 'tallerista'";

        $query = $this->db->prepare($sql);

        return $query->execute($params);
    }

    public function deactivate(int $id): bool
    {
        $sql = "UPDATE usuarios
                SET estado = 'Inactivo'
                WHERE id = :id AND rol = 'tallerista'";

        $query = $this->db->prepare($sql);

        return $query->execute(['id' => $id]);
    }
}
