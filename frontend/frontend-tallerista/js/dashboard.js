"use strict";

/*
    DASHBOARD.JS

    Responsabilidades:

    - Mostrar un saludo personalizado.
    - Contar los talleres asignados.
    - Contar los alumnos únicos.
    - Contar los alumnos presentes durante el día.
*/


/* =========================
   INICIALIZACIÓN
========================= */

function inicializarDashboard() {
    try {
        validarDatosDashboard();

        const usuarioActual =
            window.DATOS_SIMULADOS.usuarioActual;

        const talleresAsignados =
            obtenerTalleresAsignados(
                usuarioActual.id
            );

        const alumnosUnicos =
            obtenerAlumnosUnicos(
                talleresAsignados
            );

        const presentesHoy =
            contarPresentesDelDia(
                talleresAsignados
            );

        mostrarSaludo(usuarioActual);

        colocarTextoDashboard(
            "cantidad-talleres-dashboard",
            talleresAsignados.length
        );

        colocarTextoDashboard(
            "cantidad-alumnos-dashboard",
            alumnosUnicos.length
        );

        colocarTextoDashboard(
            "presentes-hoy-dashboard",
            presentesHoy
        );

    } catch (error) {
        console.error(
            "Error al inicializar el dashboard:",
            error
        );

        mostrarErrorDashboard(
            "No se pudieron cargar los datos del dashboard."
        );
    }
}


/* =========================
   VALIDACIÓN
========================= */

function validarDatosDashboard() {
    if (!window.DATOS_SIMULADOS) {
        throw new Error(
            "No se encontraron los datos simulados."
        );
    }

    if (!window.DATOS_SIMULADOS.usuarioActual) {
        throw new Error(
            "No se encontró el usuario actual."
        );
    }

    if (!Array.isArray(window.DATOS_SIMULADOS.talleres)) {
        throw new Error(
            "La lista de talleres no está disponible."
        );
    }

    if (!Array.isArray(window.DATOS_SIMULADOS.alumnos)) {
        throw new Error(
            "La lista de alumnos no está disponible."
        );
    }

    if (!Array.isArray(window.DATOS_SIMULADOS.inscripciones)) {
        throw new Error(
            "La lista de inscripciones no está disponible."
        );
    }
}


/* =========================
   SALUDO
========================= */

function mostrarSaludo(usuario) {
    const nombre = usuario.nombre || "Tallerista";

    colocarTextoDashboard(
        "titulo-bienvenida",
        `Bienvenido, ${nombre}`
    );
}


/* =========================
   TALLERES
========================= */

function obtenerTalleresAsignados(talleristaId) {
    return window.DATOS_SIMULADOS.talleres.filter(
        (taller) => {
            return taller.talleristaId === talleristaId;
        }
    );
}


/* =========================
   ALUMNOS ÚNICOS
========================= */

function obtenerAlumnosUnicos(talleres) {
    const idsTalleres = new Set(
        talleres.map((taller) => taller.id)
    );

    /*
        Buscamos las inscripciones correspondientes
        a los talleres del usuario.
    */

    const inscripcionesDelTallerista =
        window.DATOS_SIMULADOS.inscripciones.filter(
            (inscripcion) => {
                return idsTalleres.has(
                    inscripcion.tallerId
                );
            }
        );

    /*
        Un alumno puede estar inscrito en más de un taller.

        Usamos Set para no contarlo varias veces.
    */

    const idsAlumnosUnicos = new Set();

    inscripcionesDelTallerista.forEach(
        (inscripcion) => {
            inscripcion.alumnoIds.forEach(
                (alumnoId) => {
                    idsAlumnosUnicos.add(alumnoId);
                }
            );
        }
    );

    return window.DATOS_SIMULADOS.alumnos.filter(
        (alumno) => {
            return (
                idsAlumnosUnicos.has(alumno.id) &&
                alumno.estado === "Activo"
            );
        }
    );
}


/* =========================
   ASISTENCIAS DEL DÍA
========================= */

function contarPresentesDelDia(talleres) {
    const asistenciasGuardadas =
        leerAsistenciasDashboard();

    const fechaActual =
        obtenerFechaActualDashboard();

    const idsTalleres = new Set(
        talleres.map((taller) => taller.id)
    );

    /*
        Filtramos únicamente los registros:

        - de la fecha actual;
        - pertenecientes a talleres del usuario.
    */

    const asistenciasDelDia =
        asistenciasGuardadas.filter(
            (asistencia) => {
                return (
                    asistencia.fecha === fechaActual &&
                    idsTalleres.has(
                        asistencia.tallerId
                    )
                );
            }
        );

    /*
        Sumamos todos los alumnos marcados
        con estado "Presente".
    */

    return asistenciasDelDia.reduce(
        (totalPresentes, asistencia) => {
            if (!Array.isArray(asistencia.registros)) {
                return totalPresentes;
            }

            const presentesDelTaller =
                asistencia.registros.filter(
                    (registro) => {
                        return registro.estado === "Presente";
                    }
                ).length;

            return (
                totalPresentes +
                presentesDelTaller
            );
        },
        0
    );
}


function leerAsistenciasDashboard() {
    const contenidoGuardado =
        localStorage.getItem(
            "asistenciasSimuladas"
        );

    if (!contenidoGuardado) {
        return [];
    }

    try {
        const asistencias =
            JSON.parse(contenidoGuardado);

        return Array.isArray(asistencias)
            ? asistencias
            : [];

    } catch (error) {
        console.warn(
            "No se pudieron leer las asistencias:",
            error
        );

        return [];
    }
}


function obtenerFechaActualDashboard() {
    const fechaActual = new Date();

    const anio =
        fechaActual.getFullYear();

    const mes = String(
        fechaActual.getMonth() + 1
    ).padStart(2, "0");

    const dia = String(
        fechaActual.getDate()
    ).padStart(2, "0");

    return `${anio}-${mes}-${dia}`;
}


/* =========================
   FUNCIÓN AUXILIAR
========================= */

function colocarTextoDashboard(
    elementoId,
    contenido
) {
    const elemento =
        document.getElementById(elementoId);

    if (!elemento) {
        console.warn(
            `No se encontró el elemento: ${elementoId}`
        );

        return;
    }

    elemento.textContent =
        contenido ?? "-";
}


/* =========================
   ERROR
========================= */

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