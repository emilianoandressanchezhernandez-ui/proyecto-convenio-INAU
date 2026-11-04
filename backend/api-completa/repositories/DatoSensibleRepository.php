<?php

/**
 * DATOS SENSIBLES (RF24)
 * ------------------------------------------------------------------
 * Cuenta cuántos registros contienen cada tipo de dato sensible.
 * Nunca lee ni devuelve los valores: solo cantidades.
 */
class DatoSensibleRepository extends Repository
{
    public function contarRegistros(): array
    {
        $sql = "SELECT
            (SELECT COUNT(*) FROM usuarios) AS cuentas,

            (SELECT COUNT(*) FROM alumnos) AS alumnos,
            (SELECT COUNT(*) FROM alumnos
                WHERE correo IS NOT NULL AND TRIM(correo) <> '') AS alumnos_correo,
            (SELECT COUNT(*) FROM alumnos
                WHERE telefono IS NOT NULL AND TRIM(telefono) <> '') AS alumnos_telefono,
            (SELECT COUNT(*) FROM alumnos
                WHERE direccion IS NOT NULL AND TRIM(direccion) <> '') AS alumnos_direccion,
            (SELECT COUNT(*) FROM alumnos
                WHERE referente_adulto IS NOT NULL AND TRIM(referente_adulto) <> '') AS alumnos_referente,
            (SELECT COUNT(*) FROM alumnos
                WHERE observaciones IS NOT NULL AND TRIM(observaciones) <> '') AS alumnos_observaciones,

            (SELECT COUNT(*) FROM usuarios
                WHERE rol = 'tallerista') AS talleristas,

            (SELECT COUNT(*) FROM registros_asistencia) AS registros_asistencia,
            (SELECT COUNT(*) FROM entregas) AS entregas,
            (SELECT COUNT(*) FROM entregas
                WHERE nota IS NOT NULL
                   OR (comentario IS NOT NULL AND TRIM(comentario) <> '')) AS entregas_corregidas,
            (SELECT COUNT(*) FROM adjuntos
                WHERE entrega_id IS NOT NULL) AS archivos_entregas";

        $query = $this->db->query($sql);

        $fila = $query->fetch(PDO::FETCH_ASSOC);

        // Convertir todos los valores a números enteros.
        return array_map('intval', $fila ?: []);
    }
}
