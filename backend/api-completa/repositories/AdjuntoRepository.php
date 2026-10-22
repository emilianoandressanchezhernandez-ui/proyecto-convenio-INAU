<?php

class AdjuntoRepository extends Repository
{
    public function findById(int $id): ?array
    {
        $sql = "
            SELECT
                id,
                contenido_id,
                entrega_id,
                nombre_original,
                nombre_archivo,
                ruta,
                tipo_mime,
                tamano_bytes,
                fecha_subida
            FROM adjuntos
            WHERE id = :id
            LIMIT 1
        ";

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            'id' => $id
        ]);

        $adjunto = $stmt->fetch(PDO::FETCH_ASSOC);

        return $adjunto ?: null;
    }

    public function findByEntrega(int $entregaId): array
    {
        $sql = "
            SELECT
                id,
                contenido_id,
                entrega_id,
                nombre_original,
                nombre_archivo,
                ruta,
                tipo_mime,
                tamano_bytes,
                fecha_subida
            FROM adjuntos
            WHERE entrega_id = :entrega_id
            ORDER BY fecha_subida DESC, id DESC
        ";

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            'entrega_id' => $entregaId
        ]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function findByContenido(int $contenidoId): array
    {
        $sql = "
            SELECT
                id,
                contenido_id,
                entrega_id,
                nombre_original,
                nombre_archivo,
                ruta,
                tipo_mime,
                tamano_bytes,
                fecha_subida
            FROM adjuntos
            WHERE contenido_id = :contenido_id
            ORDER BY fecha_subida DESC, id DESC
        ";

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            'contenido_id' => $contenidoId
        ]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function createForEntrega(
        int $entregaId,
        string $nombreOriginal,
        string $nombreArchivo,
        string $ruta,
        string $tipoMime,
        int $tamanoBytes
    ): int {
        $sql = "
            INSERT INTO adjuntos (
                contenido_id,
                entrega_id,
                nombre_original,
                nombre_archivo,
                ruta,
                tipo_mime,
                tamano_bytes,
                fecha_subida
            ) VALUES (
                NULL,
                :entrega_id,
                :nombre_original,
                :nombre_archivo,
                :ruta,
                :tipo_mime,
                :tamano_bytes,
                NOW()
            )
        ";

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            'entrega_id' => $entregaId,
            'nombre_original' => $nombreOriginal,
            'nombre_archivo' => $nombreArchivo,
            'ruta' => $ruta,
            'tipo_mime' => $tipoMime,
            'tamano_bytes' => $tamanoBytes
        ]);

        return (int) $this->db->lastInsertId();
    }

    public function createForContenido(
        int $contenidoId,
        string $nombreOriginal,
        string $nombreArchivo,
        string $ruta,
        string $tipoMime,
        int $tamanoBytes
    ): int {
        $sql = "
            INSERT INTO adjuntos (
                contenido_id,
                entrega_id,
                nombre_original,
                nombre_archivo,
                ruta,
                tipo_mime,
                tamano_bytes,
                fecha_subida
            ) VALUES (
                :contenido_id,
                NULL,
                :nombre_original,
                :nombre_archivo,
                :ruta,
                :tipo_mime,
                :tamano_bytes,
                NOW()
            )
        ";

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            'contenido_id' => $contenidoId,
            'nombre_original' => $nombreOriginal,
            'nombre_archivo' => $nombreArchivo,
            'ruta' => $ruta,
            'tipo_mime' => $tipoMime,
            'tamano_bytes' => $tamanoBytes
        ]);

        return (int) $this->db->lastInsertId();
    }

    public function delete(int $id): bool
    {
        $sql = "
            DELETE FROM adjuntos
            WHERE id = :id
        ";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            'id' => $id
        ]);
    }
}
