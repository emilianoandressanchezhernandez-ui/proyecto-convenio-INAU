
/*
    MIS-TALLERES.JS - FRONTEND TALLERISTA

    Integración con la API real.

    Responsabilidades:
    - Obtener los talleres del tallerista autenticado.
    - Mostrar las tarjetas dinámicamente.
    - Buscar por nombre y estado.
    - Mostrar estado vacío.
    - Mostrar indicador de carga y errores.

    No utiliza DATOS_SIMULADOS ni localStorage.
*/


// ======================================
// VARIABLES
// ======================================

let talleresAsignados = [];


// ======================================
// INICIALIZACIÓN
// ======================================

async function inicializarMisTalleres() {
    const contenedor = document.getElementById(
        "contenedor-talleres"
    );

    if (!contenedor) {
        return;
    }

    configurarBuscador();

    mostrarCargaTalleres(true);
    ocultarErrorTalleres();

    try {
        // El backend identifica al tallerista
        // por su sesión autenticada.
        const talleres = await solicitarMisTalleresAPI(
            "/mis-talleres"
        );

        if (!Array.isArray(talleres)) {
            throw new Error(
                "La API no devolvió una lista de talleres."
            );
        }

        talleresAsignados = talleres;

        renderizarTalleres(talleresAsignados);

    } catch (error) {
        console.error(
            "Error al cargar Mis Talleres:",
            error
        );

        talleresAsignados = [];

        contenedor.innerHTML = "";

        const estadoVacio = document.getElementById(
            "estado-vacio"
        );

        if (estadoVacio) {
            estadoVacio.classList.add("d-none");
        }

        mostrarErrorTalleres(
            "No se pudieron cargar los talleres reales. " +
            error.message
        );

    } finally {
        mostrarCargaTalleres(false);
    }
}


// ======================================
// CONSULTA A LA API
// ======================================

async function solicitarMisTalleresAPI(ruta) {
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

    if (!respuesta.ok) {
        let mensaje = `Error HTTP ${respuesta.status}`;

        try {
            const errorAPI = await respuesta.json();

            if (errorAPI.mensaje) {
                mensaje = errorAPI.mensaje;
            }
        } catch (error) {
            // La API no devolvió un error en JSON.
        }

        throw new Error(mensaje);
    }

    const resultado = await respuesta.json();

    if (resultado.ok === false) {
        throw new Error(
            resultado.mensaje ||
            "La API no pudo obtener los talleres."
        );
    }

    return resultado.datos;
}


// ======================================
// BUSCADOR
// ======================================

function configurarBuscador() {
    const inputBuscador = document.getElementById(
        "buscador-talleres"
    );

    const botonBuscar = document.getElementById(
        "btn-buscar"
    );

    if (!inputBuscador || !botonBuscar) {
        return;
    }

    botonBuscar.addEventListener(
        "click",
        buscarTalleres
    );

    inputBuscador.addEventListener(
        "keydown",
        event => {
            if (event.key === "Enter") {
                buscarTalleres();
            }
        }
    );

    // Actualizar resultados al escribir o borrar.
    inputBuscador.addEventListener(
        "input",
        buscarTalleres
    );
}


function buscarTalleres() {
    const inputBuscador = document.getElementById(
        "buscador-talleres"
    );

    if (!inputBuscador) {
        return;
    }

    const textoBuscado = inputBuscador.value
        .trim()
        .toLocaleLowerCase("es");

    if (textoBuscado === "") {
        renderizarTalleres(talleresAsignados);
        return;
    }

    const resultados = talleresAsignados.filter(
        taller => {
            const camposBuscables = [
                taller.nombre,
                taller.estado
            ];

            return camposBuscables.some(campo =>
                String(campo ?? "")
                    .toLocaleLowerCase("es")
                    .includes(textoBuscado)
            );
        }
    );

    renderizarTalleres(resultados);
}


// ======================================
// RENDERIZADO
// ======================================

function renderizarTalleres(talleres) {
    const contenedor = document.getElementById(
        "contenedor-talleres"
    );

    const estadoVacio = document.getElementById(
        "estado-vacio"
    );

    if (!contenedor || !estadoVacio) {
        return;
    }

    contenedor.innerHTML = "";

    if (talleres.length === 0) {
        estadoVacio.classList.remove("d-none");
        return;
    }

    estadoVacio.classList.add("d-none");

    talleres.forEach(taller => {
        const tarjeta = crearTarjetaTaller(taller);
        contenedor.appendChild(tarjeta);
    });
}


// ======================================
// CREAR TARJETA
// ======================================

function crearTarjetaTaller(taller) {
    const columna = document.createElement("div");
    columna.className = "col-md-6 col-xl-4";

    const articulo = document.createElement("article");
    articulo.className = "card h-100 shadow-sm";

    const cuerpo = document.createElement("div");
    cuerpo.className =
        "card-body d-flex flex-column text-center";

    const iconoContenedor = document.createElement("div");
    iconoContenedor.className = "mb-3";

    const icono = document.createElement("i");
    icono.className =
        "bi bi-journal-code display-4 text-primary";

    iconoContenedor.appendChild(icono);

    const titulo = document.createElement("h2");
    titulo.className = "h4 fw-bold mb-3";
    titulo.textContent = taller.nombre || "Sin nombre";

    const estadoContenedor = document.createElement("div");
    estadoContenedor.className = "mb-4";

    const etiquetaEstado = document.createElement("span");
    etiquetaEstado.className =
        `badge ${obtenerClaseEstado(taller.estado)}`;

    etiquetaEstado.textContent =
        taller.estado || "Sin estado";

    estadoContenedor.appendChild(etiquetaEstado);

    const enlaceDetalle = document.createElement("a");
    enlaceDetalle.className =
        "btn btn-primary w-100 mt-auto";

    const idTaller = Number(taller.id);

    if (Number.isInteger(idTaller) && idTaller > 0) {
        enlaceDetalle.href =
            `detalle-taller.html?id=${encodeURIComponent(idTaller)}`;
    } else {
        enlaceDetalle.removeAttribute("href");
        enlaceDetalle.classList.add("disabled");
        enlaceDetalle.setAttribute("aria-disabled", "true");
    }

    const iconoDetalle = document.createElement("i");
    iconoDetalle.className = "bi bi-eye me-1";

    enlaceDetalle.appendChild(iconoDetalle);
    enlaceDetalle.appendChild(
        document.createTextNode(" Ver detalles")
    );

    cuerpo.appendChild(iconoContenedor);
    cuerpo.appendChild(titulo);
    cuerpo.appendChild(estadoContenedor);
    cuerpo.appendChild(enlaceDetalle);

    articulo.appendChild(cuerpo);
    columna.appendChild(articulo);

    return columna;
}


// ======================================
// ESTADOS VISUALES
// ======================================

function obtenerClaseEstado(estado) {
    const clases = {
        Activo: "text-bg-success",
        Inactivo: "text-bg-secondary",
        Finalizado: "text-bg-dark",
        Suspendido: "text-bg-warning"
    };

    return clases[estado] || "text-bg-secondary";
}


// ======================================
// INDICADOR DE CARGA
// ======================================

function mostrarCargaTalleres(mostrar) {
    const spinner = document.getElementById(
        "loading-spinner"
    );

    if (!spinner) {
        return;
    }

    spinner.classList.toggle("d-none", !mostrar);
}


// ======================================
// ERRORES
// ======================================

function mostrarErrorTalleres(mensaje) {
    const alerta = document.getElementById(
        "alerta-talleres"
    );

    if (!alerta) {
        return;
    }

    alerta.textContent = mensaje;
    alerta.classList.remove("d-none");
}


function ocultarErrorTalleres() {
    const alerta = document.getElementById(
        "alerta-talleres"
    );

    if (!alerta) {
        return;
    }

    alerta.textContent = "";
    alerta.classList.add("d-none");
}
