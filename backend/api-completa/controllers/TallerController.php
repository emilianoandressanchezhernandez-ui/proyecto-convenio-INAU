<?php

class TallerController extends Controller
{
    private TallerService $service;

    public function __construct()
    {
        $this->service = new TallerService();
    }

    public function index(): void
    {
        try {
            $talleres = $this->service->getAll();

            Response::success(
                $talleres,
                'Talleres obtenidos correctamente.'
            );
        } catch (Exception $e) {
            Response::error(
                'No se pudieron obtener los talleres.',
                500,
                [$e->getMessage()]
            );
        }
    }

    public function misTalleres(): void
    {
        try {
            $usuario = AuthMiddleware::user();

            if (!$usuario) {
                Response::error(
                    'No se pudo identificar al usuario autenticado.',
                    401
                );
                return;
            }

            $talleres = $this->service->getMisTalleres($usuario);

            Response::success(
                $talleres,
                'Talleres del usuario obtenidos correctamente.'
            );
        } catch (Exception $e) {
            Response::error(
                $e->getMessage(),
                400
            );
        }
    }



    public function show(int $id): void
    {
        try {
            $usuario = AuthMiddleware::user();

            if (!$usuario) {
                Response::error(
                    'No se pudo identificar al usuario autenticado.',
                    401
                );
                return;
            }

            $rol = $usuario['rol'] ?? null;

            /*
         * El administrador puede consultar cualquier taller.
         *
         * Los talleristas solamente pueden consultar
         * sus talleres asignados.
         *
         * Los alumnos solamente pueden consultar
         * los talleres donde están inscriptos.
         */

            if ($rol !== 'admin') {

                if (!in_array(
                    $rol,
                    ['tallerista', 'alumno'],
                    true
                )) {
                    Response::error(
                        'No tenés permisos para consultar este taller.',
                        403
                    );
                    return;
                }

                // Consultar los talleres del usuario autenticado.
                $misTalleres = $this->service->getMisTalleres(
                    $usuario
                );

                $tieneAcceso = false;

                foreach ($misTalleres as $tallerAsignado) {

                    if ((int) $tallerAsignado['id'] === $id) {
                        $tieneAcceso = true;
                        break;
                    }
                }

                if (!$tieneAcceso) {
                    Response::error(
                        'No tenés permisos para consultar este taller.',
                        403
                    );
                    return;
                }
            }

            // Consultar el detalle real del taller.
            // Este método también devuelve los horarios.
            $taller = $this->service->getById($id);

            Response::success(
                $taller,
                'Taller obtenido correctamente.'
            );
        } catch (Exception $e) {

            Response::error(
                $e->getMessage(),
                404
            );
        }
    }



    public function store(): void
    {
        try {
            $data = $this->getJsonBody();

            $taller = $this->service->create($data);

            Response::success(
                $taller,
                'Taller creado correctamente.',
                201
            );
        } catch (InvalidArgumentException $e) {
            $errores = json_decode($e->getMessage(), true);

            Response::error(
                'Los datos ingresados no son válidos.',
                422,
                is_array($errores)
                    ? $errores
                    : [$e->getMessage()]
            );
        } catch (Exception $e) {
            Response::error(
                $e->getMessage(),
                400
            );
        }
    }

    public function update(int $id): void
    {
        try {
            $data = $this->getJsonBody();

            $taller = $this->service->update($id, $data);

            Response::success(
                $taller,
                'Taller actualizado correctamente.'
            );
        } catch (InvalidArgumentException $e) {
            $errores = json_decode($e->getMessage(), true);

            Response::error(
                'Los datos ingresados no son válidos.',
                422,
                is_array($errores)
                    ? $errores
                    : [$e->getMessage()]
            );
        } catch (Exception $e) {
            $status = $e->getMessage() === 'Taller no encontrado.'
                ? 404
                : 400;

            Response::error(
                $e->getMessage(),
                $status
            );
        }
    }

    public function destroy(int $id): void
    {
        try {
            $this->service->finish($id);

            Response::success(
                null,
                'Taller finalizado correctamente.'
            );
        } catch (Exception $e) {
            $status = $e->getMessage() === 'Taller no encontrado.'
                ? 404
                : 400;

            Response::error(
                $e->getMessage(),
                $status
            );
        }
    }
}
