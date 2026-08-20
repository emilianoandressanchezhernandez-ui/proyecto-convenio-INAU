/*
    DETALLE-REPORTE.JS - FRONTEND ADMIN
    Responsabilidades:
    - Mostrar los datos generales del reporte seleccionado.
    - Mostrar un resumen del estado actual del sistema (en vivo).
    - Listar el resumen por taller (en vivo).
    - Permitir exportar (descarga de texto) e imprimir.
*/

let reporteActual = null;

function inicializarDetalleReporte() {
    try {
        validarDatosSimulados();

        const id = obtenerParametroURL("id");
        reporteActual = buscarReportePorId(id);

        mostrarDatosReporte(reporteActual);
        mostrarResumenGeneral();
        renderizarResumenPorTaller();
        configurarAcciones();

    } catch (error) {
        console.error("Error al cargar el detalle del reporte:", error);
        mostrarAlerta("alerta-detalle-reporte", error.message, "danger");
    }
}


// ==============================
// VALIDACION Y BUSQUEDA
// ==============================

function validarDatosSimulados() {

    if (!window.DATOS_SIMULADOS) {
        throw new Error("No se pudieron cargar los datos simulados.");
    }

    if (!Array.isArray(window.DATOS_SIMULADOS.reportes)) {
        throw new Error("La lista de reportes no está disponible.");
    }
}

function buscarReportePorId(id) {

    if (!id) {
        throw new Error("No se especificó qué reporte mostrar.");
    }

    const reportes = obtenerListado(
        "reportes",
        window.DATOS_SIMULADOS.reportes
    );

    const reporte = reportes.find(
        (r) => r.id === Number(id)
    );

    if (!reporte) {
        throw new Error("No se encontró ningún reporte con ese id.");
    }

    return reporte;
}


// ==============================
// DATOS DEL REPORTE
// ==============================

function mostrarDatosReporte(reporte) {

    colocarTexto("nombre-reporte", reporte.nombre);
    colocarTexto("reporte-nombre", reporte.nombre);
    colocarTexto("reporte-tipo", reporte.tipo);
    colocarTexto("fecha-generacion", formatearFechaHora(reporte.fechaGeneracion));
    colocarTexto("periodo", obtenerPeriodoLegible(reporte));
    colocarTexto("estado", reporte.estado);
}

function obtenerPeriodoLegible(reporte) {

    if (!reporte.fechaInicio || !reporte.fechaFin) {
        return "General (todo el sistema)";
    }

    return `${formatearFecha(reporte.fechaInicio)} al ${formatearFecha(reporte.fechaFin)}`;
}


// ==============================
// RESUMEN GENERAL (en vivo, no depende del tipo de reporte)
// ==============================

function mostrarResumenGeneral() {

    const d = window.DATOS_SIMULADOS;

    const talleres = obtenerListado("talleres", d.talleres);
    const alumnos = obtenerListado("alumnos", d.alumnos);
    const talleristas = obtenerListado("talleristas", d.talleristas);
    const asistencias = obtenerListado("asistencias", d.asistencias);

    colocarTexto("total-talleres", talleres.length);
    colocarTexto("total-alumnos", alumnos.length);
    colocarTexto("promedio-asistencia", `${calcularAsistenciaPromedio(asistencias)}%`);
    colocarTexto("total-talleristas", talleristas.length);
}

function calcularAsistenciaPromedio(asistencias) {

    let totalRegistros = 0;
    let totalPresentes = 0;

    asistencias.forEach((clase) => {
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


// ==============================
// RESUMEN POR TALLER (en vivo)
// ==============================

function renderizarResumenPorTaller() {

    const tabla = document.getElementById("tabla-resumen");

    if (!tabla) {
        return;
    }

    const d = window.DATOS_SIMULADOS;
    const talleres = obtenerListado("talleres", d.talleres);

    if (talleres.length === 0) {
        tabla.innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-muted py-4">
                    No hay talleres registrados.
                </td>
            </tr>
        `;
        return;
    }

    tabla.innerHTML = talleres.map((taller) => {

        const inscripcion = d.inscripciones.find(
            (i) => i.tallerId === taller.id
        );
        const cantidadAlumnos = inscripcion ? inscripcion.alumnoIds.length : 0;

        const clases = d.asistencias.filter(
            (c) => c.tallerId === taller.id
        );
        const asistenciaTaller = calcularAsistenciaPromedio(clases);

        const talleristas = obtenerListado("talleristas", d.talleristas);
        const tallerista = talleristas.find((t) => t.id === taller.talleristaId);
        const nombreTallerista = tallerista
            ? `${tallerista.nombre} ${tallerista.apellido}`
            : "Sin asignar";

        return `
            <tr>
                <td>${escaparHTML(taller.nombre)}</td>
                <td>${escaparHTML(nombreTallerista)}</td>
                <td>${cantidadAlumnos}</td>
                <td>${asistenciaTaller}%</td>
            </tr>
        `;
    }).join("");
}


// ==============================
// ACCIONES
// ==============================

function configurarAcciones() {

    const botonExportar = document.getElementById("btn-exportar");
    const botonImprimir = document.getElementById("btn-imprimir");

    if (botonExportar) {
        botonExportar.addEventListener("click", exportarReporte);
    }

    if (botonImprimir) {
        botonImprimir.addEventListener("click", () => {
            window.print();
        });
    }
}

// Descarga provisional como archivo de texto, tal como ya hace el
// panel de tallerista con sus informes (ver docs/primeraVista.md 6.5).
// La generacion real de PDF/Excel queda para cuando exista el backend.
function exportarReporte() {

    const contenido = `
REPORTE: ${reporteActual.nombre}
Tipo: ${reporteActual.tipo}
Fecha de generación: ${reporteActual.fechaGeneracion}
Período: ${obtenerPeriodoLegible(reporteActual)}
Estado: ${reporteActual.estado}

Contenido:
${JSON.stringify(reporteActual.contenido, null, 2)}
    `.trim();

    const blob = new Blob([contenido], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = `${reporteActual.nombre}.txt`;
    enlace.click();

    URL.revokeObjectURL(url);
}