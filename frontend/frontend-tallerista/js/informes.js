
/*
    INFORMES.JS - FRONTEND TALLERISTA

    Integrado con PHP + MySQL.

    GET /mis-talleres
    GET /mis-reportes

    Muestra informes reales, estadísticas y filtros.
    No utiliza datos simulados.
*/

let informesDisponibles = [];
let tallerFiltrado = null;
let talleresInformes = new Map();


// ========================================
// INICIALIZACIÓN
// ========================================

async function inicializarInformes() {
    configurarFiltrosInformes();

    mostrarAlertaInformes(
        "Cargando informes desde la base de datos...",
        "info"
    );

    try {
        const tallerId = obtenerTallerIdInformes();

        const [talleres, reportes] = await Promise.all([
            solicitarInformesAPI("/mis-talleres"),
            solicitarInformesAPI("/mis-reportes")
        ]);

        if (!Array.isArray(talleres)) {
            throw new Error(
                "No se pudo obtener la lista de talleres."
            );
        }

        if (!Array.isArray(reportes)) {
            throw new Error(
                "La API no devolvió una lista de reportes."
            );
        }

        talleresInformes = new Map(
            talleres.map(taller => [
                Number(taller.id),
                taller
            ])
        );

        if (tallerId !== null) {
            tallerFiltrado = talleresInformes.get(
                tallerId
            );

            if (!tallerFiltrado) {
                throw new Error(
                    "El taller solicitado no está asignado a tu usuario."
                );
            }
        }

        informesDisponibles = reportes
            .filter(reporte => {
                const id = Number(reporte.taller_id);

                // El tallerista solo visualiza reportes
                // correspondientes a sus talleres.
                return talleresInformes.has(id);
            })
            .filter(reporte => {
                if (tallerId === null) {
                    return true;
                }

                return Number(reporte.taller_id) === tallerId;
            })
            .sort((a, b) => {
                const fechaA = String(
                    a.fecha_generacion || ""
                );

                const fechaB = String(
                    b.fecha_generacion || ""
                );

                return fechaB.localeCompare(fechaA) ||
                    Number(b.id) - Number(a.id);
            });

        configurarContextoInformes();

        actualizarResumenInformes();

        aplicarFiltrosInformes();

        ocultarAlertaInformes();

    } catch (error) {
        console.error(
            "Error al cargar informes:",
            error
        );

        mostrarAlertaInformes(
            error.message,
            "danger"
        );

        renderizarInformes(
            [],
            "No se pudieron cargar los informes."
        );
    }
}


// ========================================
// API
// ========================================

async function solicitarInformesAPI(ruta) {
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

    let resultado;

    try {
        resultado = await respuesta.json();
    } catch {
        throw new Error(
            `La API devolvió una respuesta inválida en ${ruta}.`
        );
    }

    if (!respuesta.ok || resultado.ok === false) {
        throw new Error(
            resultado.mensaje ||
            `Error HTTP ${respuesta.status} al consultar ${ruta}.`
        );
    }

    return resultado.datos;
}


// ========================================
// PARÁMETRO OPCIONAL DEL TALLER
// ========================================

function obtenerTallerIdInformes() {
    const parametros = new URLSearchParams(
        window.location.search
    );

    const valor = parametros.get("tallerId");

    if (valor === null || valor === "") {
        return null;
    }

    if (!/^[1-9]\d*$/.test(valor)) {
        throw new Error(
            "El identificador del taller no es válido."
        );
    }

    const id = Number(valor);

    if (!Number.isSafeInteger(id)) {
        throw new Error(
            "El identificador del taller no es válido."
        );
    }

    return id;
}


// ========================================
// CONTEXTO DE LA PÁGINA
// ========================================

function configurarContextoInformes() {
    const titulo = document.getElementById(
        "titulo-pagina-informes"
    );

    const descripcion = document.getElementById(
        "descripcion-pagina-informes"
    );

    const enlaceVolver = document.getElementById(
        "enlace-volver-informes"
    );

    if (!tallerFiltrado) {
        if (titulo) {
            titulo.textContent = "Informes";
        }

        if (descripcion) {
            descripcion.textContent =
                "Consulta los informes reales de tus talleres.";
        }

        if (enlaceVolver) {
            enlaceVolver.href = "dashboard.html";
        }

        document.title = "INAU - Informes";
        return;
    }

    if (titulo) {
        titulo.textContent =
            `Informes de ${tallerFiltrado.nombre}`;
    }

    if (descripcion) {
        descripcion.textContent =
            "Consulta los informes correspondientes a este taller.";
    }

    if (enlaceVolver) {
        enlaceVolver.href =
            `detalle-taller.html?id=${Number(tallerFiltrado.id)}`;
    }

    document.title =
        `INAU - Informes - ${tallerFiltrado.nombre}`;
}


// ========================================
// ESTADÍSTICAS
// ========================================

function actualizarResumenInformes() {
    colocarTextoInformes(
        "total-informes",
        informesDisponibles.length
    );

    colocarTextoInformes(
        "informes-mes",
        contarInformesMesActual()
    );

    colocarTextoInformes(
        "ultima-actualizacion-informes",
        obtenerUltimaActualizacionInformes()
    );
}


function contarInformesMesActual() {
    const hoy = new Date();

    const anio = hoy.getFullYear();

    const mes = String(
        hoy.getMonth() + 1
    ).padStart(2, "0");

    const prefijo = `${anio}-${mes}-`;

    return informesDisponibles.filter(reporte =>
        String(
            reporte.fecha_generacion || ""
        ).startsWith(prefijo)
    ).length;
}


function obtenerUltimaActualizacionInformes() {
    if (informesDisponibles.length === 0) {
        return "Sin registros";
    }

    const fechas = informesDisponibles
        .map(reporte => reporte.fecha_generacion)
        .filter(Boolean)
        .sort((a, b) =>
            String(b).localeCompare(String(a))
        );

    if (fechas.length === 0) {
        return "Sin información";
    }

    return formatearFechaHoraInformes(fechas[0]);
}


// ========================================
// FILTROS
// ========================================

function configurarFiltrosInformes() {
    document.getElementById("fecha-desde")
        ?.addEventListener(
            "change",
            aplicarFiltrosInformes
        );

    document.getElementById("fecha-hasta")
        ?.addEventListener(
            "change",
            aplicarFiltrosInformes
        );

    document.getElementById("buscar-informe")
        ?.addEventListener(
            "input",
            aplicarFiltrosInformes
        );
}


function aplicarFiltrosInformes() {
    const fechaDesde = document.getElementById(
        "fecha-desde"
    )?.value || "";

    const fechaHasta = document.getElementById(
        "fecha-hasta"
    )?.value || "";

    const busqueda = normalizarTextoInformes(
        document.getElementById(
            "buscar-informe"
        )?.value || ""
    );

    if (
        fechaDesde &&
        fechaHasta &&
        fechaDesde > fechaHasta
    ) {
        mostrarAlertaInformes(
            "La fecha inicial no puede ser posterior a la fecha final.",
            "warning"
        );

        renderizarInformes(
            [],
            "Corregí el rango de fechas."
        );

        return;
    }

    ocultarAlertaInformes();

    const resultados = informesDisponibles.filter(
        reporte => {
            const fecha = String(
                reporte.fecha_generacion || ""
            ).slice(0, 10);

            const cumpleDesde =
                !fechaDesde || fecha >= fechaDesde;

            const cumpleHasta =
                !fechaHasta || fecha <= fechaHasta;

            const nombreTaller =
                obtenerNombreTallerInformes(reporte);

            const campos = [
                reporte.nombre,
                reporte.tipo,
                reporte.estado,
                nombreTaller
            ];

            const cumpleTexto =
                !busqueda ||
                campos.some(campo =>
                    normalizarTextoInformes(
                        campo
                    ).includes(busqueda)
                );

            return cumpleDesde &&
                cumpleHasta &&
                cumpleTexto;
        }
    );

    renderizarInformes(resultados);
}


// ========================================
// TABLA
// ========================================

function renderizarInformes(
    informes,
    mensajeVacio = "No se encontraron informes con los filtros seleccionados."
) {
    const tabla = document.getElementById(
        "tabla-informes"
    );

    if (!tabla) {
        return;
    }

    tabla.replaceChildren();

    if (informes.length === 0) {
        const fila = document.createElement("tr");

        const celda = document.createElement("td");

        celda.colSpan = 6;
        celda.className =
            "text-center text-muted py-5";

        celda.textContent = mensajeVacio;

        fila.appendChild(celda);
        tabla.appendChild(fila);

        return;
    }

    informes.forEach(reporte => {
        tabla.appendChild(
            crearFilaInformeReal(reporte)
        );
    });
}


function crearFilaInformeReal(reporte) {
    const fila = document.createElement("tr");

    const fecha = crearCeldaInformes(
        formatearFechaInformes(
            reporte.fecha_generacion
        )
    );

    const nombre = crearCeldaInformes(
        reporte.nombre || "Sin nombre"
    );

    nombre.classList.add("fw-semibold");

    const taller = crearCeldaInformes(
        obtenerNombreTallerInformes(reporte)
    );

    const tipo = crearCeldaInformes(
        reporte.tipo || "-"
    );

    const estado = document.createElement("td");

    const etiqueta = document.createElement("span");

    etiqueta.className =
        `badge ${obtenerClaseEstadoInformes(reporte.estado)}`;

    etiqueta.textContent = reporte.estado || "-";

    estado.appendChild(etiqueta);

    const accion = document.createElement("td");

    const enlace = document.createElement("a");

    enlace.className =
        "btn btn-outline-primary btn-sm";

    enlace.href =
        `detalle-informe.html?id=${encodeURIComponent(reporte.id)}`;

    enlace.textContent = "Ver";

    accion.appendChild(enlace);

    fila.appendChild(fecha);
    fila.appendChild(nombre);
    fila.appendChild(taller);
    fila.appendChild(tipo);
    fila.appendChild(estado);
    fila.appendChild(accion);

    return fila;
}


function crearCeldaInformes(valor) {
    const celda = document.createElement("td");

    celda.textContent = valor ?? "-";

    return celda;
}


// ========================================
// FUNCIONES AUXILIARES
// ========================================

function obtenerNombreTallerInformes(reporte) {
    if (reporte.taller_nombre) {
        return reporte.taller_nombre;
    }

    const taller = talleresInformes.get(
        Number(reporte.taller_id)
    );

    return taller?.nombre || "Taller no disponible";
}


function obtenerClaseEstadoInformes(estado) {
    const clases = {
        "Generado": "text-bg-success",
        "Finalizado": "text-bg-success",
        "En revisión": "text-bg-info",
        "Pendiente": "text-bg-warning",
        "Borrador": "text-bg-secondary"
    };

    return clases[estado] || "text-bg-secondary";
}


function formatearFechaInformes(valor) {
    if (!valor) {
        return "-";
    }

    const fecha = String(valor).slice(0, 10);
    const partes = fecha.split("-");

    if (partes.length !== 3) {
        return String(valor);
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}


function formatearFechaHoraInformes(valor) {
    if (!valor) {
        return "Sin información";
    }

    const texto = String(valor);

    const fecha = formatearFechaInformes(texto);

    const hora = texto.length >= 16
        ? texto.slice(11, 16)
        : "";

    return hora ? `${fecha} ${hora}` : fecha;
}


function normalizarTextoInformes(valor) {
    return String(valor ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}


function colocarTextoInformes(id, valor) {
    const elemento = document.getElementById(id);

    if (elemento) {
        elemento.textContent = valor ?? "-";
    }
}


// ========================================
// ALERTAS
// ========================================

function mostrarAlertaInformes(
    mensaje,
    tipo = "danger"
) {
    const alerta = document.getElementById(
        "alerta-informes"
    );

    if (!alerta) {
        return;
    }

    alerta.className = `alert alert-${tipo}`;
    alerta.textContent = mensaje;
}


function ocultarAlertaInformes() {
    const alerta = document.getElementById(
        "alerta-informes"
    );

    if (!alerta) {
        return;
    }

    alerta.className = "alert d-none";
    alerta.textContent = "";
}
