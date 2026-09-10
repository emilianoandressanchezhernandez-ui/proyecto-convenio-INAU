<?php

class TallerRepository extends Repository
{
    public function findAll(): array
    {
        $sql = "SELECT id, nombre, tematica, descripcion, centro,
                       direccion, salon, fecha_inicio, fecha_fin,
                       estado, observaciones
                FROM talleres
                ORDER BY fecha_inicio DESC, nombre ASC";

        $query = $this->db->query($sql);

        return $query->fetchAll(PDO::FETCH_ASSOC);
    }

    public function findById(int $id): ?array
    {
        $sql = "SELECT id, nombre, tematica, descripcion, centro,
                       direccion, salon, fecha_inicio, fecha_fin,
                       estado, observaciones
                FROM talleres
                WHERE id = :id
                LIMIT 1";

        $query = $this->db->prepare($sql);
        $query->execute([
            'id' => $id
        ]);

        $row = $query->fetch(PDO::FETCH_ASSOC);

        return $row ?: null;
    }

    public function create(array $data): int
    {
        $sql = "INSERT INTO talleres (
                    nombre,
                    tematica,
                    descripcion,
                    centro,
                    direccion,
                    salon,
                    fecha_inicio,
                    fecha_fin,
                    estado,
                    observaciones
                ) VALUES (
                    :nombre,
                    :tematica,
                    :descripcion,
                    :centro,
                    :direccion,
                    :salon,
                    :fecha_inicio,
                    :fecha_fin,
                    :estado,
                    :observaciones
                )";

        $query = $this->db->prepare($sql);

        $query->execute([
            'nombre' => $data['nombre'],
            'tematica' => $data['tematica'] ?? null,
            'descripcion' => $data['descripcion'] ?? null,
            'centro' => $data['centro'] ?? null,
            'direccion' => $data['direccion'] ?? null,
            'salon' => $data['salon'] ?? null,
            'fecha_inicio' => $data['fecha_inicio'],
            'fecha_fin' => $data['fecha_fin'],
            'estado' => $data['estado'] ?? 'Activo',
            'observaciones' => $data['observaciones'] ?? null
        ]);

        return (int) $this->db->lastInsertId();
    }

    public function update(int $id, array $data): bool
    {
        $fields = [];
        $params = [
            'id' => $id
        ];

        $allowedFields = [
            'nombre',
            'tematica',
            'descripcion',
            'centro',
            'direccion',
            'salon',
            'fecha_inicio',
            'fecha_fin',
            'estado',
            'observaciones'
        ];

        foreach ($allowedFields as $field) {
            if (array_key_exists($field, $data)) {
                $fields[] = "{$field} = :{$field}";
                $params[$field] = $data[$field];
            }
        }

        if (empty($fields)) {
            return false;
        }

        $sql = "UPDATE talleres
                SET " . implode(', ', $fields) . "
                WHERE id = :id";

        $query = $this->db->prepare($sql);

        return $query->execute($params);
    }

    public function finish(int $id): bool
    {
        $sql = "UPDATE talleres
            SET estado = 'Finalizado'
            WHERE id = :id";

        $query = $this->db->prepare($sql);

        return $query->execute([
            'id' => $id
        ]);
    }

    public function findHorarios(int $tallerId): array
    {
        $sql = "SELECT
                id,
                dia,
                hora_inicio,
                hora_fin
            FROM horarios_taller
            WHERE taller_id = :taller_id
            ORDER BY id ASC";

        $query = $this->db->prepare($sql);

        $query->execute([
            'taller_id' => $tallerId
        ]);

        return $query->fetchAll(PDO::FETCH_ASSOC);
    }
}
