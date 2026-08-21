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
        );
    }
}


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
    }
}


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
}