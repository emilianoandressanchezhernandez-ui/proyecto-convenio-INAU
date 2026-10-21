
"use strict";

/*
    DASHBOARD.JS - FRONTEND ADMIN

    Integración con API PHP + MySQL.

    Responsabilidades:
    - Mostrar un saludo personalizado.
    - Consultar talleristas, alumnos y talleres reales.
    - Calcular el promedio global de asistencia.
    - Manejar errores sin mostrar estadísticas falsas.
*/

let cargandoDashboard = false;

// ======================================================
// INICIALIZACIÓN
// ======================================================

async function inicializarDashboard() {
    if (cargandoDashboard) {
        return;
    }

    cargandoDashboard = true;

    ocultarAlerta("alerta-dashboard");

    mostrarSaludo();
    mostrarEstadisticasCargando();

    try {
        await cargarEstadisticasGenerales();
    } catch (error) {
        console.error(
            "Error al inicializar el dashboard:",
            error
        );

        mostrarAlerta(
            "alerta-dashboard",
            error.message ||
            "No se pudieron cargar los datos del dashboard.",
            "danger"
        );
    } finally {
        cargandoDashboard = false;
    }
}

// ======================================================
// SALUDO
// ======================================================

function mostrarSaludo() {
    const usuario = obtenerUsuarioActual();

    const nombre = usuario?.nombre ||
        "Administrador";

    colocarTexto(
        "titulo-bienvenida",
        `Bienvenido, ${nombre}`
    );
}

// ======================================================
// ESTADÍSTICAS INICIALES
// ======================================================

function mostrarEstadisticasCargando() {
    colocarTexto("stat-talleristas", "...");
    colocarTexto("stat-alumnos", "...");
    colocarTexto("stat-talleres", "...");
    colocarTexto("stat-asistencia-promedio", "...");
}

// ======================================================
// CONSULTAS GENERALES
// ======================================================

async function cargarEstadisticasGenerales() {
    const resultados = await Promise.allSettled([
        inauApi("/talleristas"),
        inauApi("/alumnos"),
        inauApi("/talleres")
    ]);

    const nombres = [
        "talleristas",
        "alumnos",
        "talleres"
    ];

    const datos = resultados.map((resultado, indice) => {
        if (
            resultado.status === "fulfilled" &&
            Array.isArray(resultado.value)
        ) {
            return resultado.value;
        }

        console.warn(
            `No se pudieron consultar ${nombres[indice]}:`,
            resultado.status === "rejected"
                ? resultado.reason
                : resultado.value
        );

        return null;
    });

    const talleristas = datos[0];
    const alumnos = datos[1];
    const talleres = datos[2];

    // Cantidad total de talleristas registrados.
    colocarTexto(
        "stat-talleristas",
        talleristas === null
            ? "—"
            : talleristas.length
    );

    // Cantidad total de alumnos registrados.
    colocarTexto(
        "stat-alumnos",
        alumnos === null
            ? "—"
            : alumnos.length
    );

    // Cantidad total de talleres, incluidos finalizados.
    colocarTexto(
        "stat-talleres",
        talleres === null
            ? "—"
            : talleres.length
    );

    // El promedio depende de la lista de talleres.
    if (talleres === null) {
        colocarTexto(
            "stat-asistencia-promedio",
            "—"
        );

        mostrarAlerta(
            "alerta-dashboard",
            "No se pudieron consultar todos los datos del dashboard.",
            "danger"
        );

        return;
    }

    const resultadoAsistencias =
        await calcularAsistenciaPromedioReal(talleres);

    colocarTexto(
        "stat-asistencia-promedio",
        resultadoAsistencias.completo
            ? resultadoAsistencias.promedio === null
                ? "Sin datos"
                : `${resultadoAsistencias.promedio}%`
            : "—"
    );

    // Advertir si alguna consulta fue incompleta.
    const huboErroresGenerales = datos.some(
        dato => dato === null
    );

    if (
        huboErroresGenerales ||
        !resultadoAsistencias.completo
    ) {
        mostrarAlerta(
            "alerta-dashboard",
            "Algunas estadísticas no pudieron consultarse completamente. Revisá la consola del navegador.",
            "danger"
        );
    }
}

// ======================================================
// ASISTENCIA PROMEDIO REAL
// ======================================================

async function calcularAsistenciaPromedioReal(talleres) {
    if (!Array.isArray(talleres)) {
        return {
            promedio: null,
            completo: false
        };
    }

    if (talleres.length === 0) {
        return {
            promedio: null,
            completo: true
        };
    }

    // Obtener las jornadas de asistencia de cada taller.
    const respuestasTalleres = await Promise.allSettled(
        talleres.map(taller =>
            inauApi(
                `/talleres/${Number(taller.id)}/asistencias`
            )
        )
    );

    let completo = true;
    const jornadas = [];

    respuestasTalleres.forEach((resultado, indice) => {
        if (
            resultado.status !== "fulfilled" ||
            !Array.isArray(resultado.value)
        ) {
            completo = false;

            console.warn(
                "No se pudieron consultar las asistencias del taller:",
                talleres[indice].id,
                resultado.status === "rejected"
                    ? resultado.reason
                    : resultado.value
            );

            return;
        }

        resultado.value.forEach(jornada => {
            jornadas.push(jornada);
        });
    });

    if (jornadas.length === 0) {
        return {
            promedio: null,
            completo
        };
    }

    // Consultar registros individuales de cada jornada.
    const respuestasJornadas = await Promise.allSettled(
        jornadas.map(jornada =>
            inauApi(
                `/asistencias/${Number(jornada.id)}`
            )
        )
    );

    let totalRegistros = 0;
    let totalPresentes = 0;

    respuestasJornadas.forEach((resultado, indice) => {
        if (resultado.status !== "fulfilled") {
            completo = false;

            console.warn(
                "No se pudo consultar la jornada:",
                jornadas[indice].id,
                resultado.reason
            );

            return;
        }

        const detalle = resultado.value;

        const registros = Array.isArray(
            detalle?.registros
        )
            ? detalle.registros
            : Array.isArray(detalle?.asistencias)
                ? detalle.asistencias
                : null;

        if (!registros) {
            completo = false;

            console.warn(
                "La jornada no devolvió registros válidos:",
                jornadas[indice].id
            );

            return;
        }

        registros.forEach(registro => {
            const estado = String(
                registro.estado ??
                registro.estado_asistencia ??
                ""
            ).trim().toLowerCase();

            // Ignorar registros sin estado.
            if (!estado) {
                return;
            }

            totalRegistros++;

            if (estado === "presente") {
                totalPresentes++;
            }
        });
    });

    if (totalRegistros === 0) {
        return {
            promedio: null,
            completo
        };
    }

    return {
        promedio: Math.round(
            (totalPresentes / totalRegistros) * 100
        ),
        completo
    };
}
