<<<<<<< HEAD
/*
    DASHBOARD.JS - FRONTEND ADMIN
    Responsabilidades:
    - Mostrar un saludo personalizado.
    - Calcular y mostrar las estadisticas generales del sistema.
*/

function inicializarDashboard() {
    try {
        validarDatosDashboard();

        mostrarSaludo();
        mostrarEstadisticasGenerales();

    } catch (error) {
        console.error("Error al inicializar el dashboard:", error);
        mostrarAlerta(
            "alerta-dashboard",
            "No se pudieron cargar los datos del dashboard.",
            "danger"
=======
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
>>>>>>> c6e8eca1d4807b7378ed01f8fbdac06d3f9fc044
        );
    }
}


<<<<<<< HEAD
// ==============================
// VALIDACION
// ==============================

function validarDatosDashboard() {

    const datos = window.DATOS_SIMULADOS;

    if (!datos) {
        throw new Error("No se encontraron los datos simulados.");
    }

    if (!Array.isArray(datos.talleristas)) {
        throw new Error("La lista de talleristas no está disponible.");
    }

    if (!Array.isArray(datos.alumnos)) {
        throw new Error("La lista de alumnos no está disponible.");
    }

    if (!Array.isArray(datos.talleres)) {
        throw new Error("La lista de talleres no está disponible.");
    }

    if (!Array.isArray(datos.asistencias)) {
        throw new Error("La lista de asistencias no está disponible.");
=======
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
>>>>>>> c6e8eca1d4807b7378ed01f8fbdac06d3f9fc044
    }
}


<<<<<<< HEAD
// ==============================
// SALUDO
// ==============================

function mostrarSaludo() {
    const usuario = obtenerUsuarioActual();
    const nombre = usuario.nombre || "Administrador";

    colocarTexto("titulo-bienvenida", `Bienvenido, ${nombre}`);
}


// ==============================
// ESTADISTICAS
// ==============================

function mostrarEstadisticasGenerales() {

    const datos = window.DATOS_SIMULADOS;

    const totalTalleristas = datos.talleristas.length;
    const totalAlumnos = datos.alumnos.length;
    const totalTalleres = datos.talleres.length;
    const asistenciaPromedio = calcularAsistenciaPromedio(datos.asistencias);

    colocarTexto("stat-talleristas", totalTalleristas);
    colocarTexto("stat-alumnos", totalAlumnos);
    colocarTexto("stat-talleres", totalTalleres);
    colocarTexto("stat-asistencia-promedio", `${asistenciaPromedio}%`);
}

function calcularAsistenciaPromedio(asistencias) {

    if (asistencias.length === 0) {
        return 0;
    }

    let totalRegistros = 0;
    let totalPresentes = 0;

    asistencias.forEach((clase) => {
        if (!Array.isArray(clase.registros)) {
            return;
        }

        clase.registros.forEach((registro) => {
            totalRegistros++;
            if (registro.estado === "Presente") {
                totalPresentes++;
            }
        });
    });

    if (totalRegistros === 0) {
        return 0;
    }

    return Math.round((totalPresentes / totalRegistros) * 100);
=======
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
>>>>>>> c6e8eca1d4807b7378ed01f8fbdac06d3f9fc044
}