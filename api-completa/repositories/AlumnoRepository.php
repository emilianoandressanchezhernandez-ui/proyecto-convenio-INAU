<?php

class AlumnoRepository extends Repository
{
    public function obtenerTodos(): array
    {
        $sql = "
            SELECT
                id,
                usuario_id,
                nombre,
                apellido,
                cedula,
                correo,
                telefono,
                direccion,
                referente_adulto,
                centro_referencia,
                fecha_nacimiento,
                estado,
                fecha_registro,
                ultima_asistencia,
                observaciones
            FROM alumnos
            ORDER BY apellido ASC, nombre ASC
        ";

        $stmt = $this->db->query($sql);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function obtenerPorId(int $id): ?array
    {
        $sql = "
            SELECT
                id,
                usuario_id,
                nombre,
                apellido,
                cedula,
                correo,
                telefono,
                direccion,
                referente_adulto,
                centro_referencia,
                fecha_nacimiento,
                estado,
                fecha_registro,
                ultima_asistencia,
                observaciones
            FROM alumnos
            WHERE id = :id
            LIMIT 1
        ";

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            'id' => $id
        ]);

        $alumno = $stmt->fetch(PDO::FETCH_ASSOC);

        return $alumno ?: null;
    }

    public function obtenerPorUsuarioId(int $usuarioId): ?array
    {
        $sql = "
            SELECT
                id,
                usuario_id,
                nombre,
                apellido,
                cedula,
                correo,
                telefono,
                direccion,
                referente_adulto,
                centro_referencia,
                fecha_nacimiento,
                estado,
                fecha_registro,
                ultima_asistencia,
                observaciones
            FROM alumnos
            WHERE usuario_id = :usuario_id
            LIMIT 1
        ";

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            'usuario_id' => $usuarioId
        ]);

        $alumno = $stmt->fetch(PDO::FETCH_ASSOC);

        return $alumno ?: null;
    }

    public function obtenerPorCedula(string $cedula): ?array
    {
        $sql = "
            SELECT
                id,
                cedula
            FROM alumnos
            WHERE cedula = :cedula
            LIMIT 1
        ";

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            'cedula' => $cedula
        ]);

        $alumno = $stmt->fetch(PDO::FETCH_ASSOC);

        return $alumno ?: null;
    }

    public function crear(array $datos): int
    {
        $sql = "
            INSERT INTO alumnos (
                usuario_id,
                nombre,
                apellido,
                cedula,
                correo,
                telefono,
                direccion,
                referente_adulto,
                centro_referencia,
                fecha_nacimiento,
                estado,
                fecha_registro,
                observaciones
            ) VALUES (
                :usuario_id,
                :nombre,
                :apellido,
                :cedula,
                :correo,
                :telefono,
                :direccion,
                :referente_adulto,
                :centro_referencia,
                :fecha_nacimiento,
                :estado,
                :fecha_registro,
                :observaciones
            )
        ";

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            'usuario_id' => $datos['usuario_id'] ?? null,
            'nombre' => $datos['nombre'],
            'apellido' => $datos['apellido'],
            'cedula' => $datos['cedula'],
            'correo' => $datos['correo'] ?? null,
            'telefono' => $datos['telefono'] ?? null,
            'direccion' => $datos['direccion'] ?? null,
            'referente_adulto' => $datos['referente_adulto'] ?? null,
            'centro_referencia' => $datos['centro_referencia'] ?? null,
            'fecha_nacimiento' => $datos['fecha_nacimiento'],
            'estado' => $datos['estado'] ?? 'Activo',
            'fecha_registro' => date('Y-m-d'),
            'observaciones' => $datos['observaciones'] ?? null
        ]);

        return (int) $this->db->lastInsertId();
    }

    public function actualizar(int $id, array $datos): bool
    {
        $campos = [];
        $parametros = [
            'id' => $id
        ];

        $camposPermitidos = [
            'nombre',
            'apellido',
            'correo',
            'telefono',
            'direccion',
            'referente_adulto',
            'centro_referencia',
            'fecha_nacimiento',
            'estado',
            'observaciones'
        ];

        foreach ($camposPermitidos as $campo) {
            if (array_key_exists($campo, $datos)) {
                $campos[] = "{$campo} = :{$campo}";
                $parametros[$campo] = $datos[$campo];
            }
        }

        if (empty($campos)) {
            return false;
        }

        $sql = "
            UPDATE alumnos
            SET " . implode(', ', $campos) . "
            WHERE id = :id
        ";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute($parametros);
    }

    public function desactivar(int $id): bool
    {
        $sql = "
            UPDATE alumnos
            SET estado = 'Inactivo'
            WHERE id = :id
        ";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            'id' => $id
        ]);
    }
}
