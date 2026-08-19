"use strict";

/*
    DASHBOARD.JS - FRONTEND ADMIN

    Este archivo se encarga únicamente del dashboard.

    Por ahora trabaja con los datos simulados de mock-data.js.

    Más adelante:
    mock-data.js
        ↓
    Fetch API
        ↓
    PHP
        ↓
    MySQL
*/


/* =========================
   INICIALIZACIÓN
========================= */

function inicializarDashboard() {

    try {

        validarDatosDashboard();

        const usuarioActual =
            window.DATOS_SIMULADOS.usuarioActual;

        const datosDashboard =
            obtenerDatosDashboard();

        mostrarBienvenida(usuarioActual);

        mostrarEstadisticas(datosDashboard);

    } catch (error) {

        console.error(
            "Error al inicializar el dashboard:",
            error
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

    if (!Array.isArray(
        window.DATOS_SIMULADOS.talleristas
    )) {
        throw new Error(
            "No se encontró la lista de talleristas."
        );
    }

    if (!Array.isArray(
        window.DATOS_SIMULADOS.alumnos
    )) {
        throw new Error(
            "No se encontró la lista de alumnos."
        );
    }

    if (!Array.isArray(
        window.DATOS_SIMULADOS.talleres
    )) {
        throw new Error(
            "No se encontró la lista de talleres."
        );
    }
}


/* =========================
   OBTENER DATOS
========================= */

function obtenerDatosDashboard() {

    const talleristas =
        window.DATOS_SIMULADOS.talleristas;

    const alumnos =
        window.DATOS_SIMULADOS.alumnos;

    const talleres =
        window.DATOS_SIMULADOS.talleres;

    return {
        cantidadTalleristas:
            talleristas.length,

        cantidadAlumnos:
            alumnos.length,

        cantidadTalleres:
            talleres.length,

        asistenciaPromedio:
            calcularAsistenciaPromedio(talleres)
    };
}


/* =========================
   ASISTENCIA PROMEDIO
========================= */

function calcularAsistenciaPromedio(talleres) {

    if (talleres.length === 0) {
        return 0;
    }

    const sumaAsistencias =
        talleres.reduce(
            (total, taller) => {
                return (
                    total +
                    Number(
                        taller.asistenciaPromedio || 0
                    )
                );
            },
            0
        );

    return sumaAsistencias /
        talleres.length;
}


/* =========================
   MOSTRAR BIENVENIDA
========================= */

function mostrarBienvenida(usuario) {

    const elementoTitulo =
        document.getElementById(
            "titulo-bienvenida"
        );

    if (!elementoTitulo) {
        return;
    }

    const nombre =
        usuario?.nombre ||
        "Administrador";

    elementoTitulo.textContent =
        `Bienvenido, ${nombre}`;
}


/* =========================
   MOSTRAR ESTADÍSTICAS
========================= */

function mostrarEstadisticas(datos) {

    colocarTexto(
        "cantidad-talleristas",
        datos.cantidadTalleristas
    );

    colocarTexto(
        "cantidad-alumnos",
        datos.cantidadAlumnos
    );

    colocarTexto(
        "cantidad-talleres",
        datos.cantidadTalleres
    );

    colocarTexto(
        "asistencia-promedio",
        `${datos.asistenciaPromedio.toFixed(1)}%`
    );
}


/* =========================
   FUNCIÓN AUXILIAR
========================= */

function colocarTexto(
    elementoId,
    contenido
) {

    const elemento =
        document.getElementById(
            elementoId
        );

    if (!elemento) {

        console.warn(
            `No se encontró el elemento con ID: ${elementoId}`
        );

        return;
    }

    elemento.textContent =
        contenido ?? "-";
}