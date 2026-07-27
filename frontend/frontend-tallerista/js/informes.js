/*
    INFORMES.JS
    Responsabilidades:
    - Obtener los informes del tallerista.
    - Filtrar opcionalmente por taller.
    - Mostrar las estadísticas generales.
    - Filtrar por fecha y texto.
    - Crear las filas de la tabla.
    - Preparar los enlaces al detalle.
*/

// VARIABLES

let informesDisponibles = [];
let tallerFiltrado = null;

// INICIALIZACIÓN

function inicializarInformes() {
    try {
        validarDatosInformes();

        const usuarioActual =
            window.DATOS_SIMULADOS.usuarioActual;

        const tallerId =
            obtenerTallerIdOpcional();

        if (tallerId !== null) {
            tallerFiltrado = buscarTallerAsignado(
                tallerId,
                usuarioActual.id
            );
        }

        informesDisponibles =
            obtenerInformesDelTallerista(
                usuarioActual.id,
                tallerId
            );

        configurarContextoPagina();
        actualizarResumenInformes();
        configurarFiltros();
        aplicarFiltros();

    } catch (error) {
        console.error(
            "Error al cargar los informes:",
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

// VALIDACIÓN 

function validarDatosInformes() {
    if (!window.DATOS_SIMULADOS) {
        throw new Error(
            "No se pudieron cargar los datos simulados."
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

    if (!Array.isArray(window.DATOS_SIMULADOS.informes)) {
        throw new Error(
            "La lista de informes no está disponible."
        );
    }
}

// PARÁMETROS DE LA URL

function obtenerTallerIdOpcional() {
    const parametrosURL = new URLSearchParams(
        window.location.search
    );

    const idRecibido =
        parametrosURL.get("tallerId");

    /*
        En esta pantalla el tallerId es opcional.
        Sin tallerId:
        informes.html
        Con tallerId:
        informes.html?tallerId=1
    */

    if (!idRecibido) {
        return null;
    }

    const tallerId = Number(idRecibido);

    if (!Number.isInteger(tallerId) || tallerId <= 0) {
        throw new Error(
            "El identificador del taller no es válido."
        );
    }

    return tallerId;
}

function buscarTallerAsignado(
    tallerId,
    talleristaId
) {
    const taller = window.DATOS_SIMULADOS.talleres.find(
        (registro) => {
            return (
                registro.id === tallerId &&
                registro.talleristaId === talleristaId
            );
        }
    );

    if (!taller) {
        throw new Error(
            "El taller solicitado no existe o no está asignado al usuario."
        );
    }

    return taller;
}

// OBTENER INFORMES

function obtenerInformesDelTallerista(
    talleristaId,
    tallerId
) {
    let informes =
        window.DATOS_SIMULADOS.informes.filter(
            (informe) => {
                return informe.talleristaId === talleristaId;
            }
        );

    if (tallerId !== null) {
        informes = informes.filter(
            (informe) => {
                return informe.tallerId === tallerId;
            }
        );
    }

    // Ordenamos desde el informe más reciente al más antiguo

    return informes.sort((informeA, informeB) => {
        return informeB.fecha.localeCompare(
            informeA.fecha
        );
    });
}

// CONTEXTO DE LA PÁGINA

function configurarContextoPagina() {
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
        if (enlaceVolver) {
            enlaceVolver.href = "dashboard.html";
        }

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
            `detalle-taller.html?id=${encodeURIComponent(tallerFiltrado.id)}`;
    }

    document.title =
        `INAU - Informes - ${tallerFiltrado.nombre}`;
}

// RESUMEN

function actualizarResumenInformes() {
    colocarTexto(
        "total-informes",
        informesDisponibles.length
    );

    colocarTexto(
        "informes-mes",
        contarInformesDelMesActual()
    );

    colocarTexto(
        "ultima-actualizacion-informes",
        obtenerUltimaActualizacion()
    );
}

function contarInformesDelMesActual() {
    const fechaActual = new Date();

    const anioActual =
        fechaActual.getFullYear();

    const mesActual =
        fechaActual.getMonth() + 1;

    return informesDisponibles.filter(
        (informe) => {
            const [anio, mes] = informe.fecha
                .split("-")
                .map(Number);

            return (
                anio === anioActual &&
                mes === mesActual
            );
        }
    ).length;
}

function obtenerUltimaActualizacion() {
    if (informesDisponibles.length === 0) {
        return "Sin registros";
    }

    const informeMasReciente =
        [...informesDisponibles].sort(
            (informeA, informeB) => {
                return new Date(
                    informeB.ultimaActualizacion
                ) - new Date(
                    informeA.ultimaActualizacion
                );
            }
        )[0];

    return formatearFechaHora(
        informeMasReciente.ultimaActualizacion
    );
}

// FILTROS

function configurarFiltros() {
    const fechaDesde = document.getElementById(
        "fecha-desde"
    );

    const fechaHasta = document.getElementById(
        "fecha-hasta"
    );

    const buscador = document.getElementById(
        "buscar-informe"
    );

    fechaDesde?.addEventListener(
        "change",
        aplicarFiltros
    );

    fechaHasta?.addEventListener(
        "change",
        aplicarFiltros
    );

    buscador?.addEventListener(
        "input",
        aplicarFiltros
    );
}

function aplicarFiltros() {
    const fechaDesde =
        document.getElementById("fecha-desde")
            ?.value || "";

    const fechaHasta =
        document.getElementById("fecha-hasta")
            ?.value || "";

    const textoBuscado = normalizarTexto(
        document.getElementById("buscar-informe")
            ?.value || ""
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
            "Corrige el rango de fechas para continuar."
        );

        return;
    }

    ocultarAlertaInformes();

    const resultados =
        informesDisponibles.filter(
            (informe) => {
                const cumpleFechaDesde =
                    !fechaDesde ||
                    informe.fecha >= fechaDesde;

                const cumpleFechaHasta =
                    !fechaHasta ||
                    informe.fecha <= fechaHasta;

                const nombreTaller =
                    obtenerNombreTaller(
                        informe.tallerId
                    );

                const camposBuscables = [
                    informe.titulo,
                    informe.tipo,
                    informe.estado,
                    nombreTaller
                ];

                const cumpleBusqueda =
                    textoBuscado === "" ||
                    camposBuscables.some(
                        (campo) => {
                            return normalizarTexto(
                                campo
                            ).includes(
                                textoBuscado
                            );
                        }
                    );

                return (
                    cumpleFechaDesde &&
                    cumpleFechaHasta &&
                    cumpleBusqueda
                );
            }
        );

    renderizarInformes(resultados);
}

// TABLA

function renderizarInformes(
    informes,
    mensajeVacio = "No se encontraron informes con los filtros seleccionados."
) {
    const cuerpoTabla = document.getElementById(
        "tabla-informes"
    );

    if (!cuerpoTabla) {
        return;
    }

    cuerpoTabla.innerHTML = "";

    if (informes.length === 0) {
        cuerpoTabla.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    class="text-center text-muted py-5"
                >
                    ${escaparHTML(mensajeVacio)}
                </td>
            </tr>
        `;

        return;
    }

    informes.forEach((informe) => {
        cuerpoTabla.insertAdjacentHTML(
            "beforeend",
            crearFilaInforme(informe)
        );
    });
}


function crearFilaInforme(informe) {
    const nombreTaller =
        obtenerNombreTaller(informe.tallerId);

    const claseEstado =
        obtenerClaseEstadoInforme(
            informe.estado
        );

    const urlDetalle =
        `detalle-informe.html?id=${encodeURIComponent(informe.id)}`;

    return `
        <tr>
            <td>
                ${escaparHTML(
                    formatearFecha(informe.fecha)
                )}
            </td>

            <td class="fw-semibold">
                ${escaparHTML(informe.titulo)}
            </td>

            <td>
                ${escaparHTML(nombreTaller)}
            </td>

            <td>
                ${escaparHTML(informe.tipo)}
            </td>

            <td>
                <span class="badge ${claseEstado}">
                    ${escaparHTML(informe.estado)}
                </span>
            </td>

            <td>
                <a
                    href="${urlDetalle}"
                    class="btn btn-outline-primary btn-sm"
                >
                    <i class="bi bi-eye me-1"></i>
                    Ver
                </a>
            </td>
        </tr>
    `;
}

// FUNCIONES AUXILIARES

function obtenerNombreTaller(tallerId) {
    const taller =
        window.DATOS_SIMULADOS.talleres.find(
            (registro) => {
                return registro.id === tallerId;
            }
        );

    return taller
        ? taller.nombre
        : "Taller no disponible";
}

function obtenerClaseEstadoInforme(estado) {
    const clases = {
        Finalizado: "text-bg-success",
        "En revisión": "text-bg-info",
        Pendiente: "text-bg-warning",
        Borrador: "text-bg-secondary"
    };

    return clases[estado] || "text-bg-secondary";
}

function formatearFecha(fechaISO) {
    const partes = fechaISO.split("-");

    if (partes.length !== 3) {
        return fechaISO;
    }

    const [anio, mes, dia] = partes;

    return `${dia}/${mes}/${anio}`;
}

function formatearFechaHora(fechaHoraISO) {
    const fecha = new Date(fechaHoraISO);

    if (Number.isNaN(fecha.getTime())) {
        return "Sin información";
    }

    return fecha.toLocaleString(
        "es-UY",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}

function normalizarTexto(valor) {
    return String(valor ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

function colocarTexto(elementoId, contenido) {
    const elemento = document.getElementById(
        elementoId
    );

    if (!elemento) {
        return;
    }

    elemento.textContent = contenido ?? "-";
}

function escaparHTML(valor) {
    const caracteres = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    };

    return String(valor ?? "").replace(
        /[&<>"']/g,
        (caracter) => caracteres[caracter]
    );
}

// ALERTAS

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

    alerta.classList.remove(
        "d-none",
        "alert-success",
        "alert-danger",
        "alert-warning",
        "alert-info"
    );

    alerta.classList.add(
        `alert-${tipo}`
    );

    alerta.textContent = mensaje;
}

function ocultarAlertaInformes() {
    const alerta = document.getElementById(
        "alerta-informes"
    );

    if (!alerta) {
        return;
    }

    alerta.textContent = "";
    alerta.classList.add("d-none");

    alerta.classList.remove(
        "alert-success",
        "alert-danger",
        "alert-warning",
        "alert-info"
    );
}