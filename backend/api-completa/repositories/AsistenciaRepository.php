<?php

class AsistenciaRepository extends Repository
{
    public function findByTallerAndFecha(
        int $tallerId,
        string $fecha
    ): ?array {
        $sql = "SELECT
                    id,
                    taller_id,
                    fecha
                FROM asistencias
                WHERE taller_id = :taller_id
                  AND fecha = :fecha
                LIMIT 1";

        $query = $this->db->prepare($sql);

        $query->execute([
            'taller_id' => $tallerId,
            'fecha' => $fecha
        ]);

        $row = $query->fetch(PDO::FETCH_ASSOC);

        return $row ?: null;
    }

    public function findById(int $id): ?array
    {
        $sql = "SELECT
                    id,
                    taller_id,
                    fecha
                FROM asistencias
                WHERE id = :id
                LIMIT 1";

        $query = $this->db->prepare($sql);

        $query->execute([
            'id' => $id
        ]);

        $row = $query->fetch(PDO::FETCH_ASSOC);

        return $row ?: null;
    }

    public function findByTaller(int $tallerId): array
    {
        $sql = "SELECT
                    id,
                    taller_id,
                    fecha
                FROM asistencias
                WHERE taller_id = :taller_id
                ORDER BY fecha DESC";

        $query = $this->db->prepare($sql);

        $query->execute([
            'taller_id' => $tallerId
        ]);

        return $query->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create(
        int $tallerId,
        string $fecha
    ): int {
        $sql = "INSERT INTO asistencias (
                    taller_id,
                    fecha
                ) VALUES (
                    :taller_id,
                    :fecha
                )";

        $query = $this->db->prepare($sql);

        $query->execute([
            'taller_id' => $tallerId,
            'fecha' => $fecha
        ]);

        return (int) $this->db->lastInsertId();
    }

    public function findRegistro(
        int $asistenciaId,
        int $alumnoId
    ): ?array {
        $sql = "SELECT
                    id,
                    asistencia_id,
                    alumno_id,
                    estado,
                    observaciones,
                    usuario_registro AS usuario_registro_id
                FROM registros_asistencia
                WHERE asistencia_id = :asistencia_id
                  AND alumno_id = :alumno_id
                LIMIT 1";

        $query = $this->db->prepare($sql);

        $query->execute([
            'asistencia_id' => $asistenciaId,
            'alumno_id' => $alumnoId
        ]);

        $row = $query->fetch(PDO::FETCH_ASSOC);

        return $row ?: null;
    }

    public function getRegistros(int $asistenciaId): array
    {
        $sql = "SELECT
                    ra.id,
                    ra.asistencia_id,
                    ra.alumno_id,
                    ra.estado,
                    ra.observaciones,
                    ra.usuario_registro AS usuario_registro_id,
                    a.nombre,
                    a.apellido,
                    a.cedula
                FROM registros_asistencia ra
                INNER JOIN alumnos a
                    ON a.id = ra.alumno_id
                WHERE ra.asistencia_id = :asistencia_id
                ORDER BY a.apellido ASC, a.nombre ASC";

        $query = $this->db->prepare($sql);

        $query->execute([
            'asistencia_id' => $asistenciaId
        ]);

        return $query->fetchAll(PDO::FETCH_ASSOC);
    }

    public function createRegistro(
        int $asistenciaId,
        int $alumnoId,
        string $estado,
        ?string $observaciones,
        int $usuarioRegistroId
    ): int {
        $sql = "INSERT INTO registros_asistencia (
                    asistencia_id,
                    alumno_id,
                    estado,
                    observaciones,
                    usuario_registro
                ) VALUES (
                    :asistencia_id,
                    :alumno_id,
                    :estado,
                    :observaciones,
                    :usuario_registro_id
                )";

        $query = $this->db->prepare($sql);

        $query->execute([
            'asistencia_id' => $asistenciaId,
            'alumno_id' => $alumnoId,
            'estado' => $estado,
            'observaciones' => $observaciones,
            'usuario_registro_id' => $usuarioRegistroId
        ]);

        return (int) $this->db->lastInsertId();
    }

    public function updateRegistro(
        int $asistenciaId,
        int $alumnoId,
        string $estado,
        ?string $observaciones,
        int $usuarioRegistroId
    ): bool {
        $sql = "UPDATE registros_asistencia
                SET estado = :estado,
                    observaciones = :observaciones,
                    usuario_registro = :usuario_registro_id
                WHERE asistencia_id = :asistencia_id
                  AND alumno_id = :alumno_id";

        $query = $this->db->prepare($sql);

        return $query->execute([
            'estado' => $estado,
            'observaciones' => $observaciones,
            'usuario_registro_id' => $usuarioRegistroId,
            'asistencia_id' => $asistenciaId,
            'alumno_id' => $alumnoId
        ]);
    }


    /**
     * Obtiene el historial de asistencias de un alumno.
     *
     * Solo devuelve registros correspondientes al alumno indicado.
     * El ID debe obtenerse desde la sesión autenticada en el Service.
     */
    public function findByAlumno(int $alumnoId): array
    {
        $sql = "
            SELECT
                ra.id,
                ra.alumno_id,
                a.id AS asistencia_id,
                a.taller_id,
                t.nombre AS taller_nombre,
                a.fecha,
                ra.estado,
                ra.observaciones
            FROM registros_asistencia ra
            INNER JOIN asistencias a
                ON a.id = ra.asistencia_id
            INNER JOIN talleres t
                ON t.id = a.taller_id
            WHERE ra.alumno_id = :alumno_id
            ORDER BY a.fecha DESC, a.id DESC
        ";

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            'alumno_id' => $alumnoId
        ]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
