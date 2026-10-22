
/*
    REPORTES.JS - FRONTEND ADMIN

    Integración con la API real:
    - Listar reportes guardados en MySQL.
    - Mostrar estadísticas reales del sistema.
    - Filtrar por período y taller.
    - Generar reportes generales y de asistencia.
*/

const REPORTES_API_URL = "http://localhost:8002";

let todosLosReportes = [];
let reportesActuales = [];
let talleresReportes = [];


// ======================================
// COMUNICACIÓN CON LA API
// ======================================

async function solicitarReportesAPI(ruta, opciones = {}) {
    const respuesta = await fetch(
        REPORTES_API_URL + ruta,
        {
            ...opciones,
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...(opciones.headers || {})
            }
        }
    );

    const resultado = await respuesta.json();

    if (!respuesta.ok || resultado.ok === false) {
        throw new Error(
            resultado.mensaje ||
            "No se pudo completar la operación."
        );
    }

    return resultado.datos;
}


// ======================================
// INICIALIZACIÓN
// ======================================

async function inicializarReportes() {
    configurarFiltro();
    configurarGeneracion();

    await cargarDatosReportes();
}

async function cargarDatosReportes() {
    const tabla = document.getElementById("tabla-reportes");

    if (tabla) {
        tabla.innerHTML = `
            <tr>
                <td colspan="5"
                    class="text-center text-muted py-5">
                    Cargando reportes...
                </td>
            </tr>
        `;
    }

    try {
        const [reportes, talleres, alumnos] = await Promise.all([
            solicitarReportesAPI("/reportes"),
            solicitarReportesAPI("/talleres"),
            solicitarReportesAPI("/alumnos")
        ]);

        todosLosReportes = Array.isArray(reportes)
            ? reportes
            : [];

        talleresReportes = Array.isArray(talleres)
            ? talleres
            : [];

        const listaAlumnos = Array.isArray(alumnos)
            ? alumnos
            : [];

        cargarSelectorTalleresReportes();
        cargarSelectorDePeriodos();

        aplicarFiltro();

        mostrarEstadisticasGenerales(
            talleresReportes,
            listaAlumnos
        );

        await actualizarAsistenciaPromedio();

    } catch (error) {
        console.error(
            "Error al cargar reportes:",
            error
        );

        if (tabla) {
            tabla.innerHTML = `
                <tr>
                    <td colspan="5"
                        class="text-center text-danger py-5">
                        No se pudieron cargar los reportes.
                    </td>
                </tr>
            `;
        }
    }
}


// ======================================
// SELECTOR DE TALLERES
// ======================================

function cargarSelectorTalleresReportes() {
    const select = document.getElementById(
        "filtro-taller"
    );

    if (!select) {
        return;
    }

    const seleccionAnterior = select.value;

    const ordenados = [...talleresReportes].sort(
        (a, b) => String(a.nombre).localeCompare(
            String(b.nombre),
            "es"
        )
    );

    select.innerHTML = `
        <option value="">Todos los talleres</option>
        ${ordenados.map(taller => `
            <option value="${Number(taller.id)}">
                ${escaparHTMLReporte(taller.nombre)}
            </option>
        `).join("")}
    `;

    if (
        seleccionAnterior &&
        ordenados.some(
            taller => String(taller.id) === seleccionAnterior
        )
    ) {
        select.value = seleccionAnterior;
    }
}


// ======================================
// TABLA DE REPORTES
// ======================================

function renderizarTablaReportes(reportes) {
    const tabla = document.getElementById(
        "tabla-reportes"
    );

    if (!tabla) {
        return;
    }

    if (!reportes.length) {
        tabla.innerHTML = `
            <tr>
                <td colspan="5"
                    class="text-center text-muted py-5">
                    No se encontraron reportes.
                </td>
            </tr>
        `;
        return;
    }

    const ordenados = [...reportes].sort(
        (a, b) => {
            const fechaA = a.fecha_generacion || "";
            const fechaB = b.fecha_generacion || "";

            return fechaB.localeCompare(fechaA) ||
                Number(b.id) - Number(a.id);
        }
    );

    tabla.innerHTML = ordenados.map(reporte => `
        <tr>
            <td>
                ${escaparHTMLReporte(reporte.nombre)}
            </td>

            <td>
                ${formatearFechaReporte(
        reporte.fecha_generacion
    )}
            </td>

            <td>
                ${escaparHTMLReporte(reporte.tipo)}
            </td>

            <td>
                ${escaparHTMLReporte(reporte.estado)}
            </td>

            <td>
                <a
                    href="detalle-reporte.html?id=${Number(reporte.id)}"
                    class="btn btn-sm btn-outline-primary"
                >
                    Ver
                </a>
            </td>
        </tr>
    `).join("");
}


// ======================================
// ESTADÍSTICAS GENERALES
// ======================================

function mostrarEstadisticasGenerales(
    talleres,
    alumnos
) {
    const talleresActivos = talleres.filter(
        taller => taller.estado === "Activo"
    ).length;

    colocarTextoReporte(
        "stat-talleres-activos",
        talleresActivos
    );

    colocarTextoReporte(
        "stat-alumnos",
        alumnos.length
    );

    colocarTextoReporte(
        "stat-reportes-generados",
        todosLosReportes.length
    );
}


// ======================================
// ASISTENCIA PROMEDIO REAL
// ======================================

async function actualizarAsistenciaPromedio() {
    const elemento = document.getElementById(
        "stat-asistencia-promedio"
    );

    if (!elemento) {
        return;
    }

    elemento.textContent = "--";

    try {
        // Consultar las jornadas reales de cada taller.
        const resultados = await Promise.all(
            talleresReportes.map(taller =>
                solicitarReportesAPI(
                    `/talleres/${Number(taller.id)}/asistencias`
                )
            )
        );

        const jornadas = resultados.flatMap(
            lista => Array.isArray(lista) ? lista : []
        );

        if (!jornadas.length) {
            elemento.textContent = "0%";
            return;
        }

        // Cada jornada tiene sus registros individuales.
        const detalles = await Promise.all(
            jornadas.map(jornada =>
                solicitarReportesAPI(
                    `/asistencias/${Number(jornada.id)}`
                )
            )
        );

        let totalRegistros = 0;
        let totalPresentes = 0;

        detalles.forEach(detalle => {
            const registros = Array.isArray(detalle.registros)
                ? detalle.registros
                : [];

            registros.forEach(registro => {
                if (!registro.estado) {
                    return;
                }

                totalRegistros++;

                if (registro.estado === "Presente") {
                    totalPresentes++;
                }
            });
        });

        const promedio = totalRegistros > 0
            ? Math.round(
                totalPresentes / totalRegistros * 100
            )
            : 0;

        elemento.textContent = `${promedio}%`;

    } catch (error) {
        console.error(
            "No se pudo calcular la asistencia promedio:",
            error
        );

        elemento.textContent = "--";
    }
}


// ======================================
// SELECTOR DE PERÍODOS
// ======================================

function cargarSelectorDePeriodos() {
    const select = document.getElementById(
        "filtro-periodo"
    );

    if (!select) {
        return;
    }

    const seleccionAnterior = select.value;
    const periodos = new Set();

    todosLosReportes.forEach(reporte => {
        const fecha = reporte.fecha_generacion || "";

        if (fecha.length >= 7) {
            periodos.add(fecha.slice(0, 7));
        }
    });

    const opciones = [...periodos]
        .sort()
        .reverse();

    select.innerHTML = `
        <option value="">Todos los períodos</option>
        ${opciones.map(periodo => `
            <option value="${periodo}">
                ${formatearPeriodoReporte(periodo)}
            </option>
        `).join("")}
    `;

    if (opciones.includes(seleccionAnterior)) {
        select.value = seleccionAnterior;
    }
}

function formatearPeriodoReporte(periodo) {
    const [anio, mes] = periodo.split("-");

    const nombresMeses = [
        "Enero", "Febrero", "Marzo",
        "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre",
        "Octubre", "Noviembre", "Diciembre"
    ];

    const indiceMes = Number(mes) - 1;

    if (
        indiceMes < 0 ||
        indiceMes >= nombresMeses.length
    ) {
        return periodo;
    }

    return `${nombresMeses[indiceMes]} ${anio}`;
}


// ======================================
// FILTROS
// ======================================

function configurarFiltro() {
    const selectPeriodo = document.getElementById(
        "filtro-periodo"
    );

    const selectTaller = document.getElementById(
        "filtro-taller"
    );

    if (selectPeriodo) {
        selectPeriodo.addEventListener(
            "change",
            aplicarFiltro
        );
    }

    if (selectTaller) {
        selectTaller.addEventListener(
            "change",
            aplicarFiltro
        );
    }
}

function aplicarFiltro() {
    const periodo = document.getElementById(
        "filtro-periodo"
    )?.value || "";

    const tallerId = document.getElementById(
        "filtro-taller"
    )?.value || "";

    let filtrados = [...todosLosReportes];

    if (periodo) {
        filtrados = filtrados.filter(
            reporte => String(
                reporte.fecha_generacion || ""
            ).startsWith(periodo)
        );
    }

    if (tallerId) {
        filtrados = filtrados.filter(
            reporte =>
                Number(reporte.taller_id) === Number(tallerId)
        );
    }

    reportesActuales = filtrados;

    renderizarTablaReportes(reportesActuales);
}


// ======================================
// GENERAR REPORTE REAL
// ======================================

function configurarGeneracion() {
    const boton = document.getElementById(
        "btn-generar-reporte"
    );

    if (boton) {
        boton.addEventListener(
            "click",
            generarReporte
        );
    }
}

async function generarReporte() {
    const boton = document.getElementById(
        "btn-generar-reporte"
    );

    const tallerId = document.getElementById(
        "filtro-taller"
    )?.value || "";

    const datos = tallerId
        ? {
            tipo: "Asistencia",
            taller_id: Number(tallerId)
        }
        : {
            tipo: "General"
        };

    if (boton) {
        boton.disabled = true;
        boton.innerHTML = `
            <span
                class="spinner-border spinner-border-sm"
                aria-hidden="true"
            ></span>
            Generando...
        `;
    }

    try {
        // Se genera y guarda el reporte en MySQL.
        const nuevoReporte = await solicitarReportesAPI(
            "/reportes",
            {
                method: "POST",
                body: JSON.stringify(datos)
            }
        );

        // Actualizar el listado desde la base de datos.
        todosLosReportes = await solicitarReportesAPI(
            "/reportes"
        );

        cargarSelectorDePeriodos();
        aplicarFiltro();

        colocarTextoReporte(
            "stat-reportes-generados",
            todosLosReportes.length
        );

        alert(
            "Reporte generado correctamente.\n\n" +
            nuevoReporte.nombre
        );

    } catch (error) {
        console.error(
            "Error al generar reporte:",
            error
        );

        alert(
            "No se pudo generar el reporte.\n" +
            error.message
        );

    } finally {
        if (boton) {
            boton.disabled = false;
            boton.innerHTML = `
                <i class="bi bi-file-earmark-plus-fill"></i>
                Generar Reporte
            `;
        }
    }
}


// ======================================
// FUNCIONES AUXILIARES
// ======================================

function colocarTextoReporte(id, texto) {
    const elemento = document.getElementById(id);

    if (elemento) {
        elemento.textContent = texto;
    }
}

function escaparHTMLReporte(valor) {
    return String(valor ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function formatearFechaReporte(fecha) {
    if (!fecha) {
        return "Sin fecha";
    }

    // Formato recibido de MySQL: YYYY-MM-DD HH:mm:ss
    const [parteFecha, parteHora = ""] =
        String(fecha).split(" ");

    const [anio, mes, dia] =
        parteFecha.split("-");

    if (!anio || !mes || !dia) {
        return escaparHTMLReporte(fecha);
    }

    const hora = parteHora.slice(0, 5);

    return `${dia}/${mes}/${anio}${hora ? " " + hora : ""}`;
}
