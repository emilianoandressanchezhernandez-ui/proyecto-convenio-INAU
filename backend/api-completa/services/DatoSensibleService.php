<?php

/**
 * DATOS SENSIBLES (RF24)
 * ------------------------------------------------------------------
 * Arma el inventario de los datos sensibles que guarda la plataforma:
 * qué dato es, de quién, cuántos registros lo contienen, quién puede
 * verlo y cómo se protege.
 *
 * No devuelve ningún valor personal. Las descripciones de acceso y
 * protección corresponden al funcionamiento actual del sistema.
 */
class DatoSensibleService
{
    private DatoSensibleRepository $repository;

    public function __construct()
    {
        $this->repository = new DatoSensibleRepository();
    }

    public function getInventario(): array
    {
        $c = $this->repository->contarRegistros();

        $datos = [
            [
                'dato' => 'Contraseñas',
                'titulares' => 'Todas las cuentas',
                'registros' => $c['cuentas'],
                'total' => $c['cuentas'],
                'acceso' => 'Nadie. El sistema no guarda la contraseña, solo un hash que no se puede revertir, y nunca lo envía al navegador.',
                'proteccion' => 'Hash con password_hash(). Mínimo de 8 caracteres. Límite de 5 intentos de inicio de sesión cada 5 minutos. Cambiarla cierra las demás sesiones.'
            ],
            [
                'dato' => 'Cédula, nombre y apellido',
                'titulares' => 'Alumnos',
                'registros' => $c['alumnos'],
                'total' => $c['alumnos'],
                'acceso' => 'Administrador. Tallerista, solo de los alumnos de sus talleres. Cada alumno, la suya.',
                'proteccion' => 'Formato validado y único (se detectan duplicados aunque se escriban en otro formato). No se puede modificar después del alta.'
            ],
            [
                'dato' => 'Correo electrónico',
                'titulares' => 'Alumnos',
                'registros' => $c['alumnos_correo'],
                'total' => $c['alumnos'],
                'acceso' => 'Administrador. Tallerista, solo de los alumnos de sus talleres. Cada alumno, el suyo.',
                'proteccion' => 'Formato validado. Solo el administrador o el propio alumno pueden modificarlo.'
            ],
            [
                'dato' => 'Teléfono',
                'titulares' => 'Alumnos',
                'registros' => $c['alumnos_telefono'],
                'total' => $c['alumnos'],
                'acceso' => 'Administrador. Tallerista, solo de los alumnos de sus talleres. Cada alumno, el suyo.',
                'proteccion' => 'Formato validado. Solo el administrador o el propio alumno pueden modificarlo.'
            ],
            [
                'dato' => 'Fecha de nacimiento',
                'titulares' => 'Alumnos',
                'registros' => $c['alumnos'],
                'total' => $c['alumnos'],
                'acceso' => 'Administrador. Cada alumno, la suya. El tallerista no la ve.',
                'proteccion' => 'Fecha validada. Solo el administrador puede modificarla.'
            ],
            [
                'dato' => 'Dirección',
                'titulares' => 'Alumnos',
                'registros' => $c['alumnos_direccion'],
                'total' => $c['alumnos'],
                'acceso' => 'Administrador. Cada alumno, la suya. El tallerista no la ve.',
                'proteccion' => 'Solo el administrador puede modificarla.'
            ],
            [
                'dato' => 'Referente adulto',
                'titulares' => 'Alumnos',
                'registros' => $c['alumnos_referente'],
                'total' => $c['alumnos'],
                'acceso' => 'Administrador. Cada alumno, el suyo. El tallerista no lo ve.',
                'proteccion' => 'Solo el administrador puede modificarlo.'
            ],
            [
                'dato' => 'Observaciones',
                'titulares' => 'Alumnos',
                'registros' => $c['alumnos_observaciones'],
                'total' => $c['alumnos'],
                'acceso' => 'Solo el administrador.',
                'proteccion' => 'No se envían al panel del tallerista ni al del alumno.'
            ],
            [
                'dato' => 'Cédula, correo y teléfono',
                'titulares' => 'Talleristas',
                'registros' => $c['talleristas'],
                'total' => $c['talleristas'],
                'acceso' => 'Administrador. Cada tallerista, los suyos. Los alumnos solo ven el nombre y la especialidad de su tallerista.',
                'proteccion' => 'Cédula y correo validados y únicos. La cédula no se puede modificar después del alta.'
            ],
            [
                'dato' => 'Asistencia',
                'titulares' => 'Alumnos',
                'registros' => $c['registros_asistencia'],
                'total' => null,
                'acceso' => 'Administrador. Tallerista, solo de sus talleres. Cada alumno, la suya.',
                'proteccion' => 'Solo el tallerista del taller o el administrador pueden registrarla o modificarla.'
            ],
            [
                'dato' => 'Notas y comentarios de corrección',
                'titulares' => 'Alumnos',
                'registros' => $c['entregas_corregidas'],
                'total' => $c['entregas'],
                'acceso' => 'Administrador. Tallerista, solo de sus talleres. Cada alumno, las suyas.',
                'proteccion' => 'Solo el tallerista del taller o el administrador pueden asignarlas o eliminarlas.'
            ],
            [
                'dato' => 'Archivos entregados',
                'titulares' => 'Alumnos',
                'registros' => $c['archivos_entregas'],
                'total' => null,
                'acceso' => 'Administrador. Tallerista, solo de sus talleres. Cada alumno, los suyos.',
                'proteccion' => 'Solo PDF o JPG de hasta 10 MB. Se descargan únicamente por la ruta oficial, que exige sesión; el acceso directo a la carpeta de archivos está bloqueado.'
            ]
        ];

        return [
            'resumen' => [
                'cuentas' => $c['cuentas'],
                'alumnos' => $c['alumnos'],
                'talleristas' => $c['talleristas'],
                'archivos_entregas' => $c['archivos_entregas']
            ],
            'datos' => $datos
        ];
    }
}
