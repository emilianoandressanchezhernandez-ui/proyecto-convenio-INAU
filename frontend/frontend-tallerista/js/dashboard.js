
/*
    DASHBOARD.JS - FRONTEND TALLERISTA

    Integración con la API real.

    Responsabilidades:
    - Mostrar un saludo personalizado.
    - Contar los talleres asignados.
    - Contar los alumnos activos sin duplicados.
    - Contar los registros "Presente" del día.

    Los datos se obtienen desde PHP y MySQL.
    No utiliza DATOS_SIMULADOS ni localStorage.
*/


// ======================================
// INICIALIZACIÓN
// ======================================

async function inicializarDashboard() {
    const usuario = obtenerUsuarioActual();

    if (!usuario) {
        mostrarErrorDashboard(
            "No se pudo identificar al tallerista."
        );
        return;
    }

    mostrarSaludo(usuario);

    colocarTextoDashboard(
        "cantidad-talleres-dashboard",
        "--"
    );

    colocarTextoDashboard(
        "cantidad-alumnos-dashboard",
        "--"
    );

    colocarTextoDashboard(
        "presentes-hoy-dashboard",
        "--"
    );

    try {
        // La API identifica al tallerista mediante su sesión.
        const talleres = await solicitarDashboardAPI(
            "/mis-talleres"
        );

        if (!Array.isArray(talleres)) {
            throw new Error(
                "La API no devolvió una lista de talleres."
            );
        }

        colocarTextoDashboard(
            "cantidad-talleres-dashboard",
            talleres.length
        );

        // Si no tiene talleres asignados.
        if (talleres.length === 0) {
            colocarTextoDashboard(
                "cantidad-alumnos-dashboard",
                0
            );

            colocarTextoDashboard(
                "presentes-hoy-dashboard",
                0
            );

            return;
        }


        // ======================================
        // ALUMNOS ÚNICOS
        // ======================================

        const listasAlumnos = await Promise.all(
            talleres.map(taller =>
                solicitarDashboardAPI(
                    `/talleres/${Number(taller.id)}/alumnos`
                )
            )
        );

        const idsAlumnos = new Set();

        listasAlumnos.forEach(lista => {
            if (!Array.isArray(lista)) {
                return;
            }

            lista.forEach(alumno => {
                /*
                    IMPORTANTE:

                    El backend devuelve alumno_id,
                    no alumno.id.

                    Se cuentan únicamente alumnos activos
                    y se evita duplicarlos entre talleres.
                */

                if (
                    alumno.alumno_id !== undefined &&
                    alumno.alumno_id !== null &&
                    alumno.estado === "Activo"
                ) {
                    idsAlumnos.add(
                        Number(alumno.alumno_id)
                    );
                }
            });
        });

        colocarTextoDashboard(
            "cantidad-alumnos-dashboard",
            idsAlumnos.size
        );


        // ======================================
        // ASISTENCIAS DEL DÍA
        // ======================================

        const listasJornadas = await Promise.all(
            talleres.map(taller =>
                solicitarDashboardAPI(
                    `/talleres/${Number(taller.id)}/asistencias`
                )
            )
        );

        const fechaHoy = obtenerFechaActualDashboard();

        const jornadasHoy = listasJornadas
            .flatMap(lista =>
                Array.isArray(lista) ? lista : []
            )
            .filter(jornada =>
                String(jornada.fecha).slice(0, 10) === fechaHoy
            );

        // Si hoy no hay jornadas registradas,
        // el contador de presentes debe ser 0.
        if (jornadasHoy.length === 0) {
            colocarTextoDashboard(
                "presentes-hoy-dashboard",
                0
            );

            return;
        }

        // Obtener los registros de cada jornada de hoy.
        const detalles = await Promise.all(
            jornadasHoy.map(jornada =>
                solicitarDashboardAPI(
                    `/asistencias/${Number(jornada.id)}`
                )
            )
        );

        let presentesHoy = 0;

        detalles.forEach(detalle => {
            const registros = Array.isArray(detalle.registros)
                ? detalle.registros
                : [];

            presentesHoy += registros.filter(
                registro => registro.estado === "Presente"
            ).length;
        });

        colocarTextoDashboard(
            "presentes-hoy-dashboard",
            presentesHoy
        );

    } catch (error) {
        console.error(
            "Error al cargar el Dashboard del tallerista:",
            error
        );

        mostrarErrorDashboard(
            "No se pudieron cargar los datos reales del Dashboard. " +
            error.message
        );
    }
}


// ======================================
// PETICIONES A LA API
// ======================================

async function solicitarDashboardAPI(ruta) {
    const respuesta = await fetch(
        `${TALLERISTA_API_URL}${ruta}`,
        {
            method: "GET",
            credentials: "include",
            headers: {
                Accept: "application/json"
            }
        }
    );

    const resultado = await respuesta.json();

    if (!respuesta.ok || resultado.ok === false) {
        throw new Error(
            resultado.mensaje ||
            `No se pudo consultar ${ruta}`
        );
    }

    return resultado.datos;
}


// ======================================
// SALUDO PERSONALIZADO
// ======================================

function mostrarSaludo(usuario) {
    const nombre = usuario.nombre || "Tallerista";

    colocarTextoDashboard(
        "titulo-bienvenida",
        `Bienvenido, ${nombre}`
    );
}


// ======================================
// FECHA ACTUAL LOCAL
// ======================================

function obtenerFechaActualDashboard() {
    const fechaActual = new Date();

    const anio = fechaActual.getFullYear();

    const mes = String(
        fechaActual.getMonth() + 1
    ).padStart(2, "0");

    const dia = String(
        fechaActual.getDate()
    ).padStart(2, "0");

    return `${anio}-${mes}-${dia}`;
}


// ======================================
// MOSTRAR VALORES
// ======================================

function colocarTextoDashboard(elementoId, contenido) {
    const elemento = document.getElementById(elementoId);

    if (!elemento) {
        console.warn(
            `No se encontró el elemento: ${elementoId}`
        );
        return;
    }

    elemento.textContent = contenido ?? "-";
}


// ======================================
// MOSTRAR ERRORES
// ======================================

function mostrarErrorDashboard(mensaje) {
    const alerta = document.getElementById(
        "alerta-dashboard"
    );

    if (!alerta) {
        return;
    }

    alerta.textContent = mensaje;
    alerta.classList.remove("d-none");
}
