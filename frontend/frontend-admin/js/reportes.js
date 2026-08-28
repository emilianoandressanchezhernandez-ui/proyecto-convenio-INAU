/*
    REPORTES.JS - FRONTEND ADMIN
    Responsabilidades:
    - Listar los reportes generados.
    - Calcular y mostrar estadisticas generales del sistema.
    - Filtrar por periodo y por taller.
    - Generar un reporte nuevo (usando el filtro de taller ya seleccionado).
*/

let todosLosReportes = [];
let reportesActuales = [];

function inicializarReportes() {
    todosLosReportes = obtenerListado(
        "reportes",
        window.DATOS_SIMULADOS.reportes
    );
    reportesActuales = todosLosReportes;

    cargarSelectorDeTalleres("filtro-taller");
    cargarSelectorDePeriodos();

    renderizarTablaReportes(reportesActuales);
    mostrarEstadisticasGenerales();
    configurarFiltro();
    configurarGeneracion();
}


// ==============================
// TABLA
// ==============================

function renderizarTablaReportes(reportes) {

    const tabla = document.getElementById("tabla-reportes");

    if (!tabla) {
        return;
    }

    if (reportes.length === 0) {
        tabla.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted py-5">
                    No se encontraron reportes.
                </td>
            </tr>
        `;
        return;
    }

    const ordenados = [...reportes].sort(
        (a, b) => b.fechaGeneracion.localeCompare(a.fechaGeneracion)
    );

    tabla.innerHTML = ordenados.map((reporte) => `
        <tr>
            <td>${escaparHTML(reporte.nombre)}</td>
            <td>${formatearFechaHora(reporte.fechaGeneracion)}</td>
            <td>${escaparHTML(reporte.tipo)}</td>
            <td>${escaparHTML(reporte.estado)}</td>
            <td>
                <a href="detalle-reporte.html?id=${reporte.id}" class="btn btn-sm btn-outline-primary">
                    Ver
                </a>
            </td>
        </tr>
    `).join("");
}


// ==============================
// ESTADISTICAS (siempre del sistema completo, no del filtro)
// ==============================

function mostrarEstadisticasGenerales() {

    const d = window.DATOS_SIMULADOS;

    const talleres = obtenerListado("talleres", d.talleres);
    const alumnos = obtenerListado("alumnos", d.alumnos);
    const asistencias = obtenerListado("asistencias", d.asistencias);

    const talleresActivos = talleres.filter(
        (t) => t.estado === "Activo"
    ).length;

    const asistenciaPromedio = calcularAsistenciaPromedioGeneral(asistencias);

    colocarTexto("stat-talleres-activos", talleresActivos);
    colocarTexto("stat-alumnos", alumnos.length);
    colocarTexto("stat-asistencia-promedio", `${asistenciaPromedio}%`);
    colocarTexto("stat-reportes-generados", todosLosReportes.length);
}

function calcularAsistenciaPromedioGeneral(asistencias) {

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
// SELECTOR DE PERIODOS
// ==============================

// Arma la lista de periodos (mes/año) a partir de las fechas reales
// en las que ya se generaron reportes, en vez de tener una lista fija.
function cargarSelectorDePeriodos() {

    const select = document.getElementById("filtro-periodo");

    if (!select) {
        return;
    }

    const periodos = new Set();

    todosLosReportes.forEach((reporte) => {
        const [anio, mes] = reporte.fechaGeneracion.split(" ")[0].split("-");
        periodos.add(`${anio}-${mes}`);
    });

    const opciones = [...periodos]
        .sort()
        .reverse()
        .map((periodo) => `<option value="${periodo}">${periodo}</option>`)
        .join("");

    select.innerHTML = `<option value="">Todos los períodos</option>${opciones}`;
}


// ==============================
// FILTRO
// ==============================

function configurarFiltro() {

    const selectPeriodo = document.getElementById("filtro-periodo");
    const selectTaller = document.getElementById("filtro-taller");

    if (selectPeriodo) {
        selectPeriodo.addEventListener("change", aplicarFiltro);
    }

    if (selectTaller) {
        selectTaller.addEventListener("change", aplicarFiltro);
    }
}

function aplicarFiltro() {

    const periodo = document.getElementById("filtro-periodo").value;
    const tallerId = document.getElementById("filtro-taller").value;

    let filtrados = todosLosReportes;

    if (periodo) {
        filtrados = filtrados.filter((r) =>
            r.fechaGeneracion.startsWith(periodo)
        );
    }

    if (tallerId) {
        filtrados = filtrados.filter(
            (r) => r.tallerId === Number(tallerId)
        );
    }

    reportesActuales = filtrados;

    renderizarTablaReportes(reportesActuales);
}


// ==============================
// GENERAR REPORTE NUEVO
// ==============================

function configurarGeneracion() {

    const boton = document.getElementById("btn-generar-reporte");

    if (boton) {
        boton.addEventListener("click", generarReporte);
    }
}

// Genera un reporte usando el filtro de taller ya seleccionado en la
// pantalla: si hay un taller elegido, genera un reporte de asistencia
// de ese taller puntual. Si no hay ninguno elegido, genera un resumen
// general de todo el sistema.
function generarReporte() {

    const tallerId = document.getElementById("filtro-taller").value;

    const nuevoReporte = tallerId
        ? generarReporteDeTaller(Number(tallerId))
        : generarReporteGeneral();

    todosLosReportes.push(nuevoReporte);
    guardarDato("reportes", todosLosReportes);

    cargarSelectorDePeriodos();
    aplicarFiltro();
    mostrarEstadisticasGenerales();
}

function generarReporteDeTaller(tallerId) {

    const d = window.DATOS_SIMULADOS;

    const talleres = obtenerListado("talleres", d.talleres);
    const taller = talleres.find((t) => t.id === tallerId);

    const asistencias = obtenerListado("asistencias", d.asistencias)
        .filter((clase) => clase.tallerId === tallerId);

    let totalRegistros = 0;
    let presentes = 0;
    let ausentes = 0;

    asistencias.forEach((clase) => {
        clase.registros.forEach((registro) => {
            totalRegistros++;
            if (registro.estado === "Presente") presentes++;
            if (registro.estado === "Ausente") ausentes++;
        });
    });

    return {
        id: generarId(todosLosReportes),
        nombre: `Reporte de Asistencia - ${taller.nombre}`,
        tipo: "Asistencia",
        tallerId: tallerId,
        fechaInicio: taller.fechaInicio,
        fechaFin: taller.fechaFin,
        fechaGeneracion: obtenerFechaHoraActual(),
        contenido: {
            totalClases: asistencias.length,
            asistenciasRegistradas: totalRegistros,
            presentes,
            ausentes,
            justificados: totalRegistros - presentes - ausentes
        },
        formato: "PDF",
        generadoPor: d.usuarioActual.id,
        estado: "Generado"
    };
}

function generarReporteGeneral() {

    const d = window.DATOS_SIMULADOS;

    const talleres = obtenerListado("talleres", d.talleres);
    const alumnos = obtenerListado("alumnos", d.alumnos);
    const talleristas = obtenerListado("talleristas", d.talleristas);

    return {
        id: generarId(todosLosReportes),
        nombre: "Reporte General del Sistema",
        tipo: "General",
        tallerId: null,
        fechaInicio: null,
        fechaFin: null,
        fechaGeneracion: obtenerFechaHoraActual(),
        contenido: {
            totalTalleres: talleres.length,
            talleresActivos: talleres.filter((t) => t.estado === "Activo").length,
            totalAlumnos: alumnos.length,
            totalTalleristas: talleristas.length
        },
        formato: "PDF",
        generadoPor: d.usuarioActual.id,
        estado: "Generado"
    };
}

function obtenerFechaHoraActual() {

    const ahora = new Date();
    const fecha = ahora.toISOString().split("T")[0];
    const hora = ahora.toTimeString().slice(0, 5);

    return `${fecha} ${hora}`;
}