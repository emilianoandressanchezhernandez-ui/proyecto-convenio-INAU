<?php

/**
 * REPOSITORIO DE USUARIOS
 * ==================================================================
 * Se encarga de consultar y actualizar datos de la tabla usuarios.
 *
 * No existe autoregistro público. Las cuentas son administradas
 * desde el sistema por los roles correspondientes.
 * ==================================================================
 */
class UserRepository extends Repository
{
    /**
     * Busca un usuario por correo.
     * Se utiliza principalmente durante el login.
     */
    public function findByCorreo($correo)
    {
        $sql = 'SELECT * FROM usuarios WHERE correo = :correo';

        $query = $this->db->prepare($sql);

        $query->execute([
            ':correo' => trim($correo)
        ]);

        $row = $query->fetch();

        return $row === false
            ? null
            : $this->buildUser($row);
    }

    /**
     * Busca un usuario por su ID.
     */
    public function findById($id)
    {
        $sql = 'SELECT * FROM usuarios WHERE id = :id';

        $query = $this->db->prepare($sql);

        $query->execute([
            ':id' => $id
        ]);

        $row = $query->fetch();

        return $row === false
            ? null
            : $this->buildUser($row);
    }

    /**
     * Actualiza el último acceso al momento del login.
     */
    public function actualizarUltimoAcceso($id)
    {
        $sql = '
            UPDATE usuarios
            SET ultimo_acceso = NOW()
            WHERE id = :id
        ';

        $query = $this->db->prepare($sql);

        $query->execute([
            ':id' => $id
        ]);
    }

    /**
     * Comprueba si un correo pertenece a otro usuario.
     *
     * Se excluye al propio usuario para permitir que conserve
     * su correo actual sin generar un falso conflicto.
     */
    public function correoPerteneceAOtroUsuario(
        string $correo,
        int $usuarioId
    ): bool {
        $sql = "
            SELECT id
            FROM usuarios
            WHERE correo = :correo
              AND id <> :usuario_id
            LIMIT 1
        ";

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            'correo' => trim($correo),
            'usuario_id' => $usuarioId
        ]);

        return $stmt->fetch() !== false;
    }

    /**
     * Actualiza los datos modificables desde el perfil.
     *
     * Por seguridad, este método solamente acepta correo y teléfono.
     */
    public function actualizarPerfil(int $id, array $datos): bool
    {
        $campos = [];
        $parametros = [
            'id' => $id
        ];

        if (array_key_exists('correo', $datos)) {
            $campos[] = 'correo = :correo';
            $parametros['correo'] = trim($datos['correo']);
        }

        if (array_key_exists('telefono', $datos)) {
            $campos[] = 'telefono = :telefono';
            $parametros['telefono'] = $datos['telefono'];
        }

        if (empty($campos)) {
            return false;
        }

        $sql = "
            UPDATE usuarios
            SET " . implode(', ', $campos) . "
            WHERE id = :id
        ";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute($parametros);
    }

    /**
     * Convierte una fila de la base de datos en un objeto User.
     */
    private function buildUser($row)
    {
        return new User(
            $row['id'],
            $row['nombre'],
            $row['apellido'],
            $row['cedula'],
            $row['correo'],
            $row['telefono'],
            $row['clave_hash'],
            $row['rol'],
            $row['especialidad'],
            $row['estado'],
            $row['fecha_registro'],
            $row['ultimo_acceso']
        );
    }
}
