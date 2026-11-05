<?php

class TerminosService
{
    // Versión de los términos vigente en el sistema.
    public const VERSION_ACTUAL = '1.0';

    private TerminosRepository $repository;

    public function __construct()
    {
        $this->repository = new TerminosRepository();
    }

    /**
     * Devuelve la información de la versión vigente.
     */
    public function getTerminosActuales(): array
    {
        return [
            'version' => self::VERSION_ACTUAL,
            'titulo' => 'Términos y Condiciones de Uso',
            'sistema' => 'Sistema de Gestión de Talleres - INAU'
        ];
    }

    /**
     * Consulta si el usuario aceptó la versión vigente.
     */
    public function getEstado(int $usuarioId): array
    {
        $aceptacion = $this->repository->obtenerAceptacion(
            $usuarioId,
            self::VERSION_ACTUAL
        );

        return [
            'version_actual' => self::VERSION_ACTUAL,
            'aceptado' => $aceptacion !== null,
            'requiere_aceptacion' => $aceptacion === null,
            'fecha_aceptacion' => $aceptacion['fecha_aceptacion'] ?? null
        ];
    }

    /**
     * Registra la aceptación voluntaria y explícita
     * de los términos vigentes.
     */
    public function aceptar(
        int $usuarioId,
        string $version,
        bool $acepta
    ): array {
        if (!$acepta) {
            throw new InvalidArgumentException(
                'Debés aceptar los términos para registrar la aceptación.'
            );
        }

        if ($version !== self::VERSION_ACTUAL) {
            throw new InvalidArgumentException(
                'La versión de los términos no es la vigente.'
            );
        }

        $this->repository->registrarAceptacion(
            $usuarioId,
            self::VERSION_ACTUAL
        );

        return $this->getEstado($usuarioId);
    }
}
