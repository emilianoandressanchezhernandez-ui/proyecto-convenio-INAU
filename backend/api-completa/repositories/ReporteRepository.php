<?php

class ReporteRepository extends Repository
{
    // --------------------------------------------------------------
    // Listar todos los reportes (administrador)
    // --------------------------------------------------------------

    public function findAll(): array
    {
        $sql = "SELECT
                    r.id,
                    r.nombre,
                    r.tipo,
                    r.taller_id,
                    r.fecha_inicio,
                    r.fecha_fin,
                    r.fecha_generacion,
                    r.formato,
                    r.generado_por,
                    r.estado,
                    t.nombre AS taller_nombre
                FROM reportes r
                LEFT JOIN talleres t
                    ON t.id = r.taller_id
                ORDER BY r.fecha_generacion DESC, r.id DESC";

        $query = $this->db->query($sql);

        return $query->fetchAll(PDO::FETCH_ASSOC);
    }

    // --------------------------------------------------------------
    // Listar reportes de los talleres asignados a un tallerista
    // --------------------------------------------------------------

    public function findByTallerista(int $talleristaId): array
    {
        $sql = "SELECT
                    r.id,
                    r.nombre,
                    r.tipo,
                    r.taller_id,
                    r.fecha_inicio,
                    r.fecha_fin,
                    r.fecha_generacion,
                    r.formato,
                    r.generado_por,
                    r.estado,
                    t.nombre AS taller_nombre
                FROM reportes r
                INNER JOIN talleres t
                    ON t.id = r.taller_id
                WHERE EXISTS (
                    SELECT 1
                    FROM taller_tallerista tt
                    WHERE tt.taller_id = r.taller_id
                      AND tt.tallerista_id = :tallerista_id
                )
                ORDER BY r.fecha_generacion DESC, r.id DESC";

        $query = $this->db->prepare($sql);

        $query->execute([
            'tallerista_id' => $talleristaId
        ]);

        return $query->fetchAll(PDO::FETCH_ASSOC);
    }

    // --------------------------------------------------------------
    // Consultar un reporte por ID
    // --------------------------------------------------------------

    public function findById(int $id): ?array
    {
        $sql = "SELECT
                    r.*,
                    t.nombre AS taller_nombre
                FROM reportes r
                LEFT JOIN talleres t
                    ON t.id = r.taller_id
                WHERE r.id = :id
                LIMIT 1";

        $query = $this->db->prepare($sql);

        $query->execute([
            'id' => $id
        ]);

        $row = $query->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            return null;
        }

        $row['contenido'] = $row['contenido'] !== null
            ? json_decode($row['contenido'], true)
            : null;

        return $row;
    }

    // --------------------------------------------------------------
    // Guardar un reporte
    // --------------------------------------------------------------

    public function create(array $data): int
    {
        $sql = "INSERT INTO reportes (
                    nombre,
                    tipo,
                    taller_id,
                    fecha_inicio,
                    fecha_fin,
                    fecha_generacion,
                    contenido,
                    formato,
                    generado_por,
                    estado
                ) VALUES (
                    :nombre,
                    :tipo,
                    :taller_id,
                    :fecha_inicio,
                    :fecha_fin,
                    NOW(),
                    :contenido,
                    :formato,
                    :generado_por,
                    :estado
                )";

        $contenido = json_encode(
            $data['contenido'],
            JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR
        );

        $query = $this->db->prepare($sql);

        $query->execute([
            'nombre' => $data['nombre'],
            'tipo' => $data['tipo'],
            'taller_id' => $data['taller_id'],
            'fecha_inicio' => $data['fecha_inicio'],
            'fecha_fin' => $data['fecha_fin'],
            'contenido' => $contenido,
            'formato' => $data['formato'],
            'generado_por' => $data['generado_por'],
            'estado' => $data['estado']
        ]);

        return (int) $this->db->lastInsertId();
    }

    // --------------------------------------------------------------
    // Estadísticas generales del sistema
    // --------------------------------------------------------------

    public function getEstadisticasGenerales(): array
    {
        $sql = "SELECT
                    (SELECT COUNT(*)
                     FROM talleres) AS totalTalleres,

                    (SELECT COUNT(*)
                     FROM talleres
                     WHERE estado = 'Activo') AS talleresActivos,

                    (SELECT COUNT(*)
                     FROM alumnos) AS totalAlumnos,

                    (SELECT COUNT(*)
                     FROM usuarios
                     WHERE rol = 'tallerista') AS totalTalleristas";

        $query = $this->db->query($sql);

        return $query->fetch(PDO::FETCH_ASSOC);
    }

    // --------------------------------------------------------------
    // Datos de asistencia de un taller
    // --------------------------------------------------------------

    public function getEstadisticasAsistencia(int $tallerId): array
    {
        $sql = "SELECT
                    COUNT(DISTINCT asi.id) AS totalClases,
                    COUNT(ra.id) AS asistenciasRegistradas,

                    SUM(
                        CASE
                            WHEN ra.estado = 'Presente' THEN 1
                            ELSE 0
                        END
                    ) AS presentes,

                    SUM(
                        CASE
                            WHEN ra.estado = 'Ausente' THEN 1
                            ELSE 0
                        END
                    ) AS ausentes,

                    SUM(
                        CASE
                            WHEN ra.estado = 'Justificado' THEN 1
                            ELSE 0
                        END
                    ) AS justificados,

                    SUM(
                        CASE
                            WHEN ra.estado = 'Tardanza' THEN 1
                            ELSE 0
                        END
                    ) AS tardanzas
                FROM asistencias asi
                LEFT JOIN registros_asistencia ra
                    ON ra.asistencia_id = asi.id
                WHERE asi.taller_id = :taller_id";

        $query = $this->db->prepare($sql);

        $query->execute([
            'taller_id' => $tallerId
        ]);

        $row = $query->fetch(PDO::FETCH_ASSOC);

        return [
            'totalClases' =>
            (int) ($row['totalClases'] ?? 0),

            'asistenciasRegistradas' =>
            (int) ($row['asistenciasRegistradas'] ?? 0),

            'presentes' =>
            (int) ($row['presentes'] ?? 0),

            'ausentes' =>
            (int) ($row['ausentes'] ?? 0),

            'justificados' =>
            (int) ($row['justificados'] ?? 0),

            'tardanzas' =>
            (int) ($row['tardanzas'] ?? 0)
        ];
    }

    // --------------------------------------------------------------
    // Promedio general de asistencia
    // --------------------------------------------------------------

    public function getPromedioAsistenciaGeneral(): ?int
    {
        $sql = "SELECT
                    COUNT(*) AS total,
                    SUM(
                        CASE
                            WHEN estado = 'Presente' THEN 1
                            ELSE 0
                        END
                    ) AS presentes
                FROM registros_asistencia
                WHERE estado IS NOT NULL
                  AND estado <> ''";

        $query = $this->db->query($sql);

        $row = $query->fetch(PDO::FETCH_ASSOC);

        $total = (int) ($row['total'] ?? 0);
        $presentes = (int) ($row['presentes'] ?? 0);

        if ($total === 0) {
            return null;
        }

        return (int) round(
            ($presentes / $total) * 100
        );
    }
}
