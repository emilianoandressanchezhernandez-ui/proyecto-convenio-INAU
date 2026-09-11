<?php

class EntregaRepository extends Repository
{
    public function findById(int $id): ?array
    {
        $sql = "SELECT
                    id,
                    contenido_id,
                    alumno_id,
                    fecha_entrega,
                    estado,
                    nota,
                    comentario
                FROM entregas
                WHERE id = :id
                LIMIT 1";

        $query = $this->db->prepare($sql);

        $query->execute([
            'id' => $id
        ]);

        $row = $query->fetch(PDO::FETCH_ASSOC);

        return $row ?: null;
    }

    public function findByContenido(int $contenidoId): array
    {
        $sql = "SELECT
                    e.id,
                    e.contenido_id,
                    e.alumno_id,
                    e.fecha_entrega,
                    e.estado,
                    e.nota,
                    e.comentario,
                    a.nombre,
                    a.apellido,
                    a.cedula
                FROM entregas e
                INNER JOIN alumnos a
                    ON a.id = e.alumno_id
                WHERE e.contenido_id = :contenido_id
                ORDER BY a.apellido ASC, a.nombre ASC";

        $query = $this->db->prepare($sql);

        $query->execute([
            'contenido_id' => $contenidoId
        ]);

        return $query->fetchAll(PDO::FETCH_ASSOC);
    }

    public function findByContenidoAndAlumno(
        int $contenidoId,
        int $alumnoId
    ): ?array {
        $sql = "SELECT
                    id,
                    contenido_id,
                    alumno_id,
                    fecha_entrega,
                    estado,
                    nota,
                    comentario
                FROM entregas
                WHERE contenido_id = :contenido_id
                  AND alumno_id = :alumno_id
                LIMIT 1";

        $query = $this->db->prepare($sql);

        $query->execute([
            'contenido_id' => $contenidoId,
            'alumno_id' => $alumnoId
        ]);

        $row = $query->fetch(PDO::FETCH_ASSOC);

        return $row ?: null;
    }

    public function create(
        int $contenidoId,
        int $alumnoId,
        string $fechaEntrega
    ): int {
        $sql = "INSERT INTO entregas (
                    contenido_id,
                    alumno_id,
                    fecha_entrega,
                    estado
                ) VALUES (
                    :contenido_id,
                    :alumno_id,
                    :fecha_entrega,
                    'Entregada'
                )";

        $query = $this->db->prepare($sql);

        $query->execute([
            'contenido_id' => $contenidoId,
            'alumno_id' => $alumnoId,
            'fecha_entrega' => $fechaEntrega
        ]);

        return (int) $this->db->lastInsertId();
    }

    public function actualizarComentario(
        int $id,
        ?string $comentario
    ): bool {
        $sql = "UPDATE entregas
                SET comentario = :comentario,
                    estado = 'Corregida'
                WHERE id = :id";

        $query = $this->db->prepare($sql);

        return $query->execute([
            'comentario' => $comentario,
            'id' => $id
        ]);
    }

    public function asignarNota(
        int $id,
        int $nota
    ): bool {
        $sql = "UPDATE entregas
                SET nota = :nota,
                    estado = 'Corregida'
                WHERE id = :id";

        $query = $this->db->prepare($sql);

        return $query->execute([
            'nota' => $nota,
            'id' => $id
        ]);
    }

    public function eliminarNota(int $id): bool
    {
        $sql = "UPDATE entregas
                SET nota = NULL,
                    estado = CASE
                        WHEN comentario IS NULL
                             OR TRIM(comentario) = ''
                            THEN 'Entregada'
                        ELSE 'Corregida'
                    END
                WHERE id = :id";

        $query = $this->db->prepare($sql);

        return $query->execute([
            'id' => $id
        ]);
    }
}
