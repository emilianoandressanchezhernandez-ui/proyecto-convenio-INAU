<?php

class TerminosRepository extends Repository
{
    /**
     * Comprueba si un usuario aceptó una versión concreta
     * de los Términos y Condiciones.
     */
    public function haAceptado(
        int $usuarioId,
        string $version
    ): bool {
        $sql = "
            SELECT id
            FROM aceptaciones_terminos
            WHERE usuario_id = :usuario_id
              AND version_terminos = :version
            LIMIT 1
        ";

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            'usuario_id' => $usuarioId,
            'version' => $version
        ]);

        return $stmt->fetch() !== false;
    }

    /**
     * Registra la aceptación de una versión.
     *
     * La clave UNIQUE (usuario_id, version_terminos)
     * impide registrar la misma aceptación dos veces.
     *
     * INSERT IGNORE permite que la operación sea
     * idempotente si el usuario vuelve a aceptarla.
     */
    public function registrarAceptacion(
        int $usuarioId,
        string $version
    ): void {
        $sql = "
            INSERT IGNORE INTO aceptaciones_terminos (
                usuario_id,
                version_terminos,
                fecha_aceptacion
            )
            VALUES (
                :usuario_id,
                :version,
                NOW()
            )
        ";

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            'usuario_id' => $usuarioId,
            'version' => $version
        ]);
    }

    /**
     * Obtiene la fecha en la que un usuario
     * aceptó una versión de los términos.
     */
    public function obtenerAceptacion(
        int $usuarioId,
        string $version
    ): ?array {
        $sql = "
            SELECT
                id,
                usuario_id,
                version_terminos,
                fecha_aceptacion
            FROM aceptaciones_terminos
            WHERE usuario_id = :usuario_id
              AND version_terminos = :version
            LIMIT 1
        ";

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            'usuario_id' => $usuarioId,
            'version' => $version
        ]);

        $resultado = $stmt->fetch(PDO::FETCH_ASSOC);

        return $resultado === false ? null : $resultado;
    }
}
