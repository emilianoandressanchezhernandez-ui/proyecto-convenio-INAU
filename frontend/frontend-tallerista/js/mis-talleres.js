/*
    MIS-TALLERES.JS
    Este archivo se encarga de:
    - Obtener los talleres del usuario actual.
    - Mostrar las tarjetas dinámicamente.
    - Buscar talleres.
    - Mostrar el estado vacío.
    - Mostrar posibles errores.
*/

// VARIABLES

/*
    Aquí guardaremos los talleres asignados al usuario.
    Esta variable permitirá buscar sobre los talleres originales sin modificar los datos de mock-data.js.
*/

let talleresAsignados = [];

// INICIALIZACIÓN

function inicializarMisTalleres() {

    const contenedor = document.getElementById(
        "contenedor-talleres"
    );

    /*
        Si el contenedor no existe, detenemos la función.
        Esto evita errores si el archivo se carga accidentalmente en otra página.
    */

    if (!contenedor) {
        return;
    }

    try {
        validarDatosSimulados();

        talleresAsignados = obtenerTalleresDelUsuario();

        configurarBuscador();
        renderizarTalleres(talleresAsignados);

    } catch (error) {

        console.error(
            "Error al cargar los talleres:",
            error
        );

        mostrarError(
            "No se pudieron cargar los talleres."
        );
    }
}

// OBTENCIÓN DE DATOS

function validarDatosSimulados() {

    if (!window.DATOS_SIMULADOS) {
        throw new Error(
            "No se encontró DATOS_SIMULADOS."
        );
    }

    if (!Array.isArray(window.DATOS_SIMULADOS.talleres)) {
        throw new Error(
            "La propiedad talleres no es un array."
        );
    }

    if (!window.DATOS_SIMULADOS.usuarioActual) {
        throw new Error(
            "No se encontró el usuario actual."
        );
    }
}

function obtenerTalleresDelUsuario() {

    const usuarioActual =
        window.DATOS_SIMULADOS.usuarioActual;

    const talleres =
        window.DATOS_SIMULADOS.talleres;

    // filter() devuelve solamente los talleres cuyo talleristaId coincide con el ID del usuario actual

    return talleres.filter((taller) => {
        return taller.talleristaId === usuarioActual.id;
    });
}

// BUSCADOR

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

    // También permitimos buscar al presionar Enter

    inputBuscador.addEventListener(
        "keydown",
        (event) => {

            if (event.key === "Enter") {
                buscarTalleres();
            }
        }
    );

    // Si el usuario borra completamente el texto, volvemos a mostrar todos los talleres

    inputBuscador.addEventListener(
        "input",
        () => {

            if (inputBuscador.value.trim() === "") {
                renderizarTalleres(talleresAsignados);
            }
        }
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
        .toLowerCase();

    if (textoBuscado === "") {
        renderizarTalleres(talleresAsignados);
        return;
    }

    /*
        Buscamos coincidencias en:
        - Nombre.
        - Descripción.
        - Centro.
        - Salón.
        - Estado.
    */

    const resultados = talleresAsignados.filter(
        (taller) => {

            const camposBuscables = [
                taller.nombre,
                taller.estado
            ];

            return camposBuscables.some((campo) => {
                return campo
                    ?.toLowerCase()
                    .includes(textoBuscado);
            });
        }
    );

    renderizarTalleres(resultados);
}

// RENDERIZADO

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

    // Limpiamos las tarjetas anteriores antes de insertar los resultados nuevos

    contenedor.innerHTML = "";

    ocultarError();

    if (talleres.length === 0) {
        estadoVacio.classList.remove("d-none");
        return;
    }

    estadoVacio.classList.add("d-none");

    talleres.forEach((taller) => {

        const tarjeta = crearTarjetaTaller(taller);

        contenedor.insertAdjacentHTML(
            "beforeend",
            tarjeta
        );
    });
}

function crearTarjetaTaller(taller) {
    const claseEstado = obtenerClaseEstado(
        taller.estado
    );

    const urlDetalle =
        `detalle-taller.html?id=${encodeURIComponent(taller.id)}`;

    return `
        <div class="col-md-6 col-xl-4">
            <article class="card h-100 shadow-sm">
                <div class="card-body d-flex flex-column text-center">

                    <div class="mb-3">
                        <i class="bi bi-journal-code display-4 text-primary"></i>
                    </div>

                    <h2 class="h4 fw-bold mb-3">
                        ${taller.nombre}
                    </h2>

                    <div class="mb-4">
                        <span class="badge ${claseEstado}">
                            ${taller.estado}
                        </span>
                    </div>

                    <a
                        href="${urlDetalle}"
                        class="btn btn-primary w-100 mt-auto"
                    >
                        <i class="bi bi-eye me-1"></i>
                        Ver detalles
                    </a>

                </div>
            </article>
        </div>
    `;
}

// FUNCIONES AUXILIARES

function obtenerClaseEstado(estado) {

    const clases = {
        Activo: "text-bg-success",
        Inactivo: "text-bg-secondary",
        Finalizado: "text-bg-dark",
        Suspendido: "text-bg-warning"
    };

    return clases[estado] || "text-bg-secondary";
}

// MENSAJES DE ERROR

function mostrarError(mensaje) {

    const alerta = document.getElementById(
        "alerta-talleres"
    );

    if (!alerta) {
        return;
    }

    alerta.textContent = mensaje;
    alerta.classList.remove("d-none");
}

function ocultarError() {

    const alerta = document.getElementById(
        "alerta-talleres"
    );

    if (!alerta) {
        return;
    }

    alerta.textContent = "";
    alerta.classList.add("d-none");
}