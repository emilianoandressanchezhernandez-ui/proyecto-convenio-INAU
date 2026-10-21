<?php

class AsignacionRepository extends Repository
{
    // --------------------------------------------------------------
    // Talleristas
    // --------------------------------------------------------------

    public function getTalleristasByTaller(int $tallerId): array
    {
        $sql = "SELECT
                    tt.id AS asignacion_id,
                    tt.taller_id,
                    tt.tallerista_id,
                    tt.fecha_asignacion,
                    u.nombre,
                    u.apellido,
                    u.cedula,
                    u.correo,
                    u.telefono,
                    u.especialidad,
                    u.estado
                FROM taller_tallerista tt
                INNER JOIN usuarios u
                    ON u.id = tt.tallerista_id
                WHERE tt.taller_id = :taller_id
                  AND u.rol = 'tallerista'
                ORDER BY u.apellido ASC, u.nombre ASC";

        $query = $this->db->prepare($sql);

        $query->execute([
            'taller_id' => $tallerId
        ]);

        return $query->fetchAll(PDO::FETCH_ASSOC);
    }

    public function findTalleristaAssignment(
        int $tallerId,
        int $talleristaId
    ): ?array {
        $sql = "SELECT
                    id,
                    taller_id,
                    tallerista_id,
                    fecha_asignacion
                FROM taller_tallerista
                WHERE taller_id = :taller_id
                  AND tallerista_id = :tallerista_id
                LIMIT 1";

        $query = $this->db->prepare($sql);

        $query->execute([
            'taller_id' => $tallerId,
            'tallerista_id' => $talleristaId
        ]);

        $row = $query->fetch(PDO::FETCH_ASSOC);

        return $row ?: null;
    }

    public function assignTallerista(
        int $tallerId,
        int $talleristaId,
        string $fechaAsignacion
    ): int {
        $sql = "INSERT INTO taller_tallerista (
                    taller_id,
                    tallerista_id,
                    fecha_asignacion
                ) VALUES (
                    :taller_id,
                    :tallerista_id,
                    :fecha_asignacion
                )";

        $query = $this->db->prepare($sql);

        $query->execute([
            'taller_id' => $tallerId,
            'tallerista_id' => $talleristaId,
            'fecha_asignacion' => $fechaAsignacion
        ]);

        return (int) $this->db->lastInsertId();
    }

    public function removeTallerista(
        int $tallerId,
        int $talleristaId
    ): bool {
        $sql = "DELETE FROM taller_tallerista
                WHERE taller_id = :taller_id
                  AND tallerista_id = :tallerista_id";

        $query = $this->db->prepare($sql);

        return $query->execute([
            'taller_id' => $tallerId,
            'tallerista_id' => $talleristaId
        ]);
    }

    // --------------------------------------------------------------
    // Alumnos
    // --------------------------------------------------------------

    public function getAlumnosByTaller(int $tallerId): array
    {
        $sql = "SELECT
                    i.id AS inscripcion_id,
                    i.taller_id,
                    i.alumno_id,
                    i.fecha_inscripcion,
                    a.nombre,
                    a.apellido,
                    a.cedula,
                    a.correo,
                    a.telefono,
                    a.estado
                FROM inscripciones i
                INNER JOIN alumnos a
                    ON a.id = i.alumno_id
                WHERE i.taller_id = :taller_id
                ORDER BY a.apellido ASC, a.nombre ASC";

        $query = $this->db->prepare($sql);

        $query->execute([
            'taller_id' => $tallerId
        ]);

        return $query->fetchAll(PDO::FETCH_ASSOC);
    }

    public function findAlumnoAssignment(
        int $tallerId,
        int $alumnoId
    ): ?array {
        $sql = "SELECT
                    id,
                    taller_id,
                    alumno_id,
                    fecha_inscripcion
                FROM inscripciones
                WHERE taller_id = :taller_id
                  AND alumno_id = :alumno_id
                LIMIT 1";

        $query = $this->db->prepare($sql);

        $query->execute([
            'taller_id' => $tallerId,
            'alumno_id' => $alumnoId
        ]);

        $row = $query->fetch(PDO::FETCH_ASSOC);

        return $row ?: null;
    }

    public function assignAlumno(
        int $tallerId,
        int $alumnoId
    ): int {
        $sql = "INSERT INTO inscripciones (
                    taller_id,
                    alumno_id,
                    fecha_inscripcion
                ) VALUES (
                    :taller_id,
                    :alumno_id,
                    CURRENT_DATE
                )";

        $query = $this->db->prepare($sql);

        $query->execute([
            'taller_id' => $tallerId,
            'alumno_id' => $alumnoId
        ]);

        return (int) $this->db->lastInsertId();
    }

    public function removeAlumno(
        int $tallerId,
        int $alumnoId
    ): bool {
        $sql = "DELETE FROM inscripciones
                WHERE taller_id = :taller_id
                  AND alumno_id = :alumno_id";

        $query = $this->db->prepare($sql);

        return $query->execute([
            'taller_id' => $tallerId,
            'alumno_id' => $alumnoId
        ]);
    }

    // --------------------------------------------------------------
    // Consultas de pertenencia
    // --------------------------------------------------------------

    public function talleristaPerteneceATaller(
        int $tallerId,
        int $talleristaId
    ): bool {
        return $this->findTalleristaAssignment(
            $tallerId,
            $talleristaId
        ) !== null;
    }

    public function alumnoPerteneceATaller(
        int $tallerId,
        int $alumnoId
    ): bool {
        return $this->findAlumnoAssignment(
            $tallerId,
            $alumnoId
        ) !== null;
    }

    // --------------------------------------------------------------
    // Talleres asignados a un tallerista
    // --------------------------------------------------------------

    public function getTalleresByTallerista(int $talleristaId): array
    {
        $sql = "SELECT
                    t.id,
                    t.nombre,
                    t.tematica,
                    t.descripcion,
                    t.centro,
                    t.direccion,
                    t.salon,
                    t.fecha_inicio,
                    t.fecha_fin,
                    t.estado,
                    t.observaciones,
                    tt.fecha_asignacion
                FROM taller_tallerista tt
                INNER JOIN talleres t
                    ON t.id = tt.taller_id
                WHERE tt.tallerista_id = :tallerista_id
                ORDER BY t.nombre ASC";

        $query = $this->db->prepare($sql);

        $query->execute([
            'tallerista_id' => $talleristaId
        ]);

        return $query->fetchAll(PDO::FETCH_ASSOC);
    }

    // --------------------------------------------------------------
    // Talleres en los que está inscripto un alumno
    // --------------------------------------------------------------

    public function getTalleresByAlumno(int $alumnoId): array
    {
        $sql = "SELECT
                    t.id,
                    t.nombre,
                    t.tematica,
                    t.descripcion,
                    t.centro,
                    t.direccion,
                    t.salon,
                    t.fecha_inicio,
                    t.fecha_fin,
                    t.estado,
                    t.observaciones,
                    i.fecha_inscripcion
                FROM inscripciones i
                INNER JOIN talleres t
                    ON t.id = i.taller_id
                WHERE i.alumno_id = :alumno_id
                ORDER BY t.nombre ASC";

        $query = $this->db->prepare($sql);

        $query->execute([
            'alumno_id' => $alumnoId
        ]);

        return $query->fetchAll(PDO::FETCH_ASSOC);
    }
}
