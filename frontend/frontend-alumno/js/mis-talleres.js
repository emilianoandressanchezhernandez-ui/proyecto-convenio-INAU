
/*
    MIS-TALLERES.JS - FRONTEND ALUMNO

    Responsabilidades:
    - Consultar los talleres del alumno autenticado.
    - Mostrar únicamente sus talleres inscriptos.
    - Permitir buscar por nombre o estado.
    - Renderizar tarjetas con información real.
    - Permitir acceder al detalle del taller.
    - Mostrar estados vacíos y errores.

    API:
    GET /mis-talleres

    No utiliza datos simulados ni localStorage.
*/

"use strict";

let talleresDelAlumnoActuales = [];


// =====================================
// INICIALIZACIÓN
// =====================================

async function inicializarMisTalleres() {

    const contenedor = document.getElementById(
        "contenedor-talleres"
    );

    if (!contenedor) {
        return;
    }

    configurarBuscadorMisTalleres();

    try {
        ocultarErrorMisTalleres();

        const respuesta = await fetch(
            `${ALUMNO_API_URL}/mis-talleres`,
            {
                method: "GET",
                credentials: "include",
                headers: {
                    Accept: "application/json"
                },
                cache: "no-store"
            }
        );

        // Sesión vencida o inexistente.
        if (respuesta.status === 401) {
            redirigirAlLogin();
            return;
        }

        if (!respuesta.ok) {
            throw new Error(
                `No se pudieron obtener los talleres (HTTP ${respuesta.status}).`
            );
        }

        const resultado = await respuesta.json();

        if (
            !resultado.ok ||
            !Array.isArray(resultado.datos)
        ) {
            throw new Error(
                resultado.mensaje ||
                "La API no devolvió una lista válida de talleres."
            );
        }

        talleresDelAlumnoActuales = resultado.datos;

        buscarTalleresMisTalleres();

    } catch (error) {

        console.error(
            "Error al cargar los talleres del alumno:",
            error
        );

        talleresDelAlumnoActuales = [];

        renderizarTalleresMisTalleres([]);

        mostrarErrorMisTalleres(
            error.message ||
            "No se pudieron cargar tus talleres."
        );
    }
}


// =====================================
// BUSCADOR
// =====================================

function configurarBuscadorMisTalleres() {

    const input = document.getElementById(
        "buscador-talleres"
    );

    const boton = document.getElementById(
        "btn-buscar"
    );

    if (!input || !boton) {
        return;
    }

    // Evitar eventos duplicados.
    if (
        boton.dataset.busquedaConfigurada === "true"
    ) {
        return;
    }

    boton.dataset.busquedaConfigurada = "true";

    boton.addEventListener(
        "click",
        buscarTalleresMisTalleres
    );

    input.addEventListener("keydown", evento => {

        if (evento.key === "Enter") {
            evento.preventDefault();
            buscarTalleresMisTalleres();
        }
    });

    // Actualizar resultados al escribir o borrar.
    input.addEventListener(
        "input",
        buscarTalleresMisTalleres
    );
}


// =====================================
// FILTRAR TALLERES
// =====================================

function buscarTalleresMisTalleres() {

    const input = document.getElementById(
        "buscador-talleres"
    );

    const busqueda = normalizarTextoMisTalleres(
        input?.value || ""
    );

    const filtrados = talleresDelAlumnoActuales.filter(
        taller => {

            return [
                taller.nombre,
                taller.estado
            ].some(valor =>

                normalizarTextoMisTalleres(valor)
                    .includes(busqueda)

            );
        }
    );

    renderizarTalleresMisTalleres(filtrados);
}

function normalizarTextoMisTalleres(valor) {

    return String(valor ?? "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}


// =====================================
// MOSTRAR TARJETAS
// =====================================

function renderizarTalleresMisTalleres(talleres) {

    const contenedor = document.getElementById(
        "contenedor-talleres"
    );

    const estadoVacio = document.getElementById(
        "estado-vacio"
    );

    if (!contenedor || !estadoVacio) {
        return;
    }

    contenedor.replaceChildren();

    if (!Array.isArray(talleres) || !talleres.length) {
        estadoVacio.classList.remove("d-none");
        return;
    }

    estadoVacio.classList.add("d-none");

    talleres.forEach(taller => {

        contenedor.appendChild(
            crearTarjetaTallerMisTalleres(taller)
        );

    });
}


// =====================================
// CONSTRUIR TARJETA
// =====================================

function crearTarjetaTallerMisTalleres(taller) {

    const columna = document.createElement("div");

    columna.className = "col-md-6 col-xl-4";


    // Tarjeta principal.
    const tarjeta = document.createElement("article");

    tarjeta.className =
        "card taller-card h-100 shadow-sm";


    const cuerpo = document.createElement("div");

    cuerpo.className =
        "card-body d-flex flex-column";


    // =================================
    // ENCABEZADO
    // =================================

    const encabezado = document.createElement("div");

    encabezado.className =
        "d-flex align-items-start gap-3 mb-3";


    const iconoContenedor = document.createElement("div");

    iconoContenedor.className =
        "icono-acceso flex-shrink-0";

    iconoContenedor.setAttribute(
        "aria-hidden",
        "true"
    );


    // El icono se declara una sola vez.
    const icono = document.createElement("i");

    icono.className = "bi bi-journal-code";

    iconoContenedor.appendChild(icono);


    const tituloContenedor = document.createElement("div");

    tituloContenedor.className = "flex-grow-1";


    const titulo = document.createElement("h2");

    titulo.className = "h5 fw-bold mb-2";

    titulo.textContent =
        taller.nombre || "Taller sin nombre";


    const insignia = document.createElement("span");

    insignia.className =
        `badge ${obtenerClaseEstadoTaller(taller.estado)}`;

    insignia.textContent =
        taller.estado || "Sin estado";


    tituloContenedor.append(
        titulo,
        insignia
    );

    encabezado.append(
        iconoContenedor,
        tituloContenedor
    );

    cuerpo.appendChild(encabezado);


    // =================================
    // TEMÁTICA
    // =================================

    if (taller.tematica) {

        const tematica = document.createElement("p");

        tematica.className =
            "small fw-semibold mb-2";

        tematica.textContent = taller.tematica;

        cuerpo.appendChild(tematica);
    }


    // =================================
    // DESCRIPCIÓN
    // =================================

    if (taller.descripcion) {

        const descripcion = document.createElement("p");

        descripcion.className =
            "text-muted small mb-3";

        descripcion.textContent = taller.descripcion;

        cuerpo.appendChild(descripcion);
    }


    // =================================
    // UBICACIÓN
    // =================================

    const ubicacion = [
        taller.centro,
        taller.salon,
        taller.direccion
    ]
        .filter(Boolean)
        .join(" · ");

    if (ubicacion) {

        agregarLineaDetalleTaller(
            cuerpo,
            "bi-geo-alt",
            "Lugar",
            ubicacion
        );
    }


    // =================================
    // PERÍODO DEL TALLER
    // =================================

    if (
        taller.fecha_inicio ||
        taller.fecha_fin
    ) {

        const inicio = formatearFechaMisTalleres(
            taller.fecha_inicio
        );

        const fin = formatearFechaMisTalleres(
            taller.fecha_fin
        );

        let periodo = "";

        if (
            taller.fecha_inicio &&
            taller.fecha_fin
        ) {

            periodo = `${inicio} al ${fin}`;

        } else if (taller.fecha_inicio) {

            periodo = `Desde ${inicio}`;

        } else {

            periodo = `Hasta ${fin}`;
        }

        agregarLineaDetalleTaller(
            cuerpo,
            "bi-calendar-event",
            "Período",
            periodo
        );
    }


    // =================================
    // FECHA DE INSCRIPCIÓN
    // =================================

    if (taller.fecha_inscripcion) {

        agregarLineaDetalleTaller(
            cuerpo,
            "bi-calendar-check",
            "Inscripto desde",
            formatearFechaMisTalleres(
                taller.fecha_inscripcion
            )
        );
    }


    // =================================
    // ENLACE AL DETALLE
    // =================================

    const enlace = document.createElement("a");

    enlace.className =
        "btn btn-primary w-100 mt-auto";

    enlace.href =
        `detalle-taller.html?id=${encodeURIComponent(taller.id)}`;

    enlace.setAttribute(
        "aria-label",
        `Ver detalles de ${taller.nombre || "taller"}`
    );


    const iconoEnlace = document.createElement("i");

    iconoEnlace.className = "bi bi-eye me-1";

    iconoEnlace.setAttribute(
        "aria-hidden",
        "true"
    );


    enlace.append(
        iconoEnlace,
        document.createTextNode("Ver detalles")
    );


    // Ensamblar tarjeta.
    cuerpo.appendChild(enlace);

    tarjeta.appendChild(cuerpo);

    columna.appendChild(tarjeta);

    return columna;
}


// =====================================
// AUXILIARES PARA TARJETAS
// =====================================

function agregarLineaDetalleTaller(
    contenedor,
    claseIcono,
    etiqueta,
    valor
) {

    if (
        valor === null ||
        valor === undefined ||
        valor === "" ||
        valor === "-"
    ) {
        return;
    }

    const linea = document.createElement("p");

    linea.className =
        "small mb-2 d-flex align-items-start gap-2";


    const icono = document.createElement("i");

    icono.className =
        `bi ${claseIcono} mt-1 flex-shrink-0`;

    icono.setAttribute(
        "aria-hidden",
        "true"
    );


    const texto = document.createElement("span");

    const etiquetaFuerte = document.createElement("strong");

    etiquetaFuerte.textContent = `${etiqueta}: `;

    texto.append(
        etiquetaFuerte,
        document.createTextNode(String(valor))
    );


    linea.append(icono, texto);

    contenedor.appendChild(linea);
}


// =====================================
// FORMATEAR FECHAS
// =====================================

function formatearFechaMisTalleres(fecha) {

    if (!fecha) {
        return "-";
    }

    // Usar la función existente de utils.js.
    if (typeof formatearFecha === "function") {
        return formatearFecha(fecha);
    }

    const coincidencia =
        /^(\d{4})-(\d{2})-(\d{2})/.exec(
            String(fecha)
        );

    if (coincidencia) {

        const anio = coincidencia[1];
        const mes = coincidencia[2];
        const dia = coincidencia[3];

        return `${dia}/${mes}/${anio}`;
    }

    return String(fecha);
}


// =====================================
// ESTADO DEL TALLER
// =====================================

function obtenerClaseEstadoTaller(estado) {

    const clases = {
        activo: "text-bg-success",
        inactivo: "text-bg-secondary",
        finalizado: "text-bg-dark",
        suspendido: "text-bg-warning"
    };

    const estadoNormalizado =
        normalizarTextoMisTalleres(estado);

    return clases[estadoNormalizado] ||
        "text-bg-secondary";
}


// =====================================
// MENSAJES DE ERROR
// =====================================

function mostrarErrorMisTalleres(mensaje) {

    const alerta = document.getElementById(
        "alerta-talleres"
    );

    if (!alerta) {
        return;
    }

    alerta.textContent = mensaje;
    alerta.classList.remove("d-none");
}

function ocultarErrorMisTalleres() {

    const alerta = document.getElementById(
        "alerta-talleres"
    );

    if (!alerta) {
        return;
    }

    alerta.textContent = "";
    alerta.classList.add("d-none");
}
