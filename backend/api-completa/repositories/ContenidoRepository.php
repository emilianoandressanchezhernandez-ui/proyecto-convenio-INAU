<?php

class ContenidoRepository extends Repository
{
    public function findByTaller(int $tallerId): array
    {
        $sql = "SELECT
                    id,
                    taller_id,
                    tipo,
                    titulo,
                    descripcion,
                    fecha_publicacion,
                    fecha_limite
                FROM contenidos
                WHERE taller_id = :taller_id
                ORDER BY fecha_publicacion DESC, id DESC";

        $query = $this->db->prepare($sql);

        $query->execute([
            'taller_id' => $tallerId
        ]);

        return $query->fetchAll(PDO::FETCH_ASSOC);
    }

    public function findById(int $id): ?array
    {
        $sql = "SELECT
                    id,
                    taller_id,
                    tipo,
                    titulo,
                    descripcion,
                    fecha_publicacion,
                    fecha_limite
                FROM contenidos
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
        $sql = "INSERT INTO contenidos (
                    taller_id,
                    tipo,
                    titulo,
                    descripcion,
                    fecha_publicacion,
                    fecha_limite
                ) VALUES (
                    :taller_id,
                    :tipo,
                    :titulo,
                    :descripcion,
                    :fecha_publicacion,
                    :fecha_limite
                )";

        $query = $this->db->prepare($sql);

        $query->execute([
            'taller_id' => $data['taller_id'],
            'tipo' => $data['tipo'],
            'titulo' => $data['titulo'],
            'descripcion' => $data['descripcion'],
            'fecha_publicacion' => $data['fecha_publicacion'],
            'fecha_limite' => $data['fecha_limite']
        ]);

        return (int) $this->db->lastInsertId();
    }

    public function update(int $id, array $data): bool
    {
        $sql = "UPDATE contenidos
                SET tipo = :tipo,
                    titulo = :titulo,
                    descripcion = :descripcion,
                    fecha_limite = :fecha_limite
                WHERE id = :id";

        $query = $this->db->prepare($sql);

        return $query->execute([
            'tipo' => $data['tipo'],
            'titulo' => $data['titulo'],
            'descripcion' => $data['descripcion'],
            'fecha_limite' => $data['fecha_limite'],
            'id' => $id
        ]);
    }

    public function delete(int $id): bool
    {
        $sql = "DELETE FROM contenidos
                WHERE id = :id";

        $query = $this->db->prepare($sql);

        return $query->execute([
            'id' => $id
        ]);
    }
}
