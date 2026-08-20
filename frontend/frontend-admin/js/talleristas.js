<<<<<<< HEAD
/*
    TALLERISTAS.JS - FRONTEND ADMIN
    Responsabilidades:
    - Listar los talleristas registrados.
    - Calcular y mostrar estadisticas (total, activos, con/sin talleres).
    - Buscar por nombre o correo.
    - Dar de alta un tallerista nuevo.
*/

let talleristasActuales = [];

function inicializarTalleristas() {
    talleristasActuales = obtenerListado(
        "talleristas",
        window.DATOS_SIMULADOS.talleristas
    );

    renderizarTablaTalleristas(talleristasActuales);
    mostrarEstadisticasTalleristas(talleristasActuales);
    configurarBuscador();
    configurarAltaTallerista();
}


// ==============================
// BUSCADOR
// ==============================

function configurarBuscador() {

    const input = document.getElementById("buscar-tallerista");

    if (!input) {
        return;
    }

    input.addEventListener("input", () => {
        filtrarTalleristas(input.value);
    });
}

function filtrarTalleristas(textoBusqueda) {

    const texto = normalizarTexto(textoBusqueda);

    if (!texto) {
        renderizarTablaTalleristas(talleristasActuales);
        return;
    }

    const filtrados = talleristasActuales.filter((tallerista) => {
        const nombreCompleto = normalizarTexto(
            `${tallerista.nombre} ${tallerista.apellido}`
        );
        const correo = normalizarTexto(tallerista.correo);

        return nombreCompleto.includes(texto) || correo.includes(texto);
    });

    renderizarTablaTalleristas(filtrados);

    // Las estadisticas (arriba) no cambian con la busqueda:
    // siguen representando el total real del sistema, no el filtro actual.
}


// ==============================
// TABLA
// ==============================

function renderizarTablaTalleristas(talleristas) {

    const tabla = document.getElementById("tabla-talleristas");
=======
"use strict";

/*
    TALLERISTAS.JS - FRONTEND ADMIN

    Este archivo se encarga de:

    - Obtener los talleristas desde mock-data.js.
    - Calcular las estadísticas.
    - Buscar talleristas.
    - Renderizar la tabla.
    - Generar enlaces al detalle.
*/


/* =========================
   VARIABLES
========================= */

let talleristasDisponibles = [];


/* =========================
   INICIALIZACIÓN
========================= */

function inicializarTalleristas() {

    try {

        validarDatosTalleristas();

        talleristasDisponibles =
            obtenerTalleristas();

        mostrarEstadisticasTalleristas();

        configurarBuscadorTalleristas();

        renderizarTalleristas(
            talleristasDisponibles
        );

    } catch (error) {

        console.error(
            "Error al inicializar los talleristas:",
            error
        );
    }
}


/* =========================
   VALIDACIÓN
========================= */

function validarDatosTalleristas() {

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
        window.DATOS_SIMULADOS.talleres
    )) {
        throw new Error(
            "No se encontró la lista de talleres."
        );
    }
}


/* =========================
   OBTENER TALLERISTAS
========================= */

function obtenerTalleristas() {

    /*
        Creamos una copia del array para no modificar
        directamente los datos originales.
    */

    return [
        ...window.DATOS_SIMULADOS.talleristas
    ];
}


/* =========================
   ESTADÍSTICAS
========================= */

function mostrarEstadisticasTalleristas() {

    const total =
        talleristasDisponibles.length;

    const activos =
        talleristasDisponibles.filter(
            (tallerista) => {
                return tallerista.estado === "Activo";
            }
        ).length;

    const conTalleres =
        talleristasDisponibles.filter(
            (tallerista) => {
                return (
                    Array.isArray(
                        tallerista.talleresAsignados
                    ) &&
                    tallerista.talleresAsignados.length > 0
                );
            }
        ).length;

    const sinTalleres =
        total - conTalleres;

    colocarTexto(
        "total-talleristas",
        total
    );

    colocarTexto(
        "talleristas-activos",
        activos
    );

    colocarTexto(
        "talleristas-con-talleres",
        conTalleres
    );

    colocarTexto(
        "talleristas-sin-talleres",
        sinTalleres
    );
}


/* =========================
   BUSCADOR
========================= */

function configurarBuscadorTalleristas() {

    const buscador =
        document.getElementById(
            "buscar-tallerista"
        );

    if (!buscador) {
        return;
    }

    buscador.addEventListener(
        "input",
        buscarTalleristas
    );
}


function buscarTalleristas(event) {

    const textoBuscado =
        event.target.value
            .trim()
            .toLowerCase();

    if (textoBuscado === "") {

        renderizarTalleristas(
            talleristasDisponibles
        );

        return;
    }

    const resultados =
        talleristasDisponibles.filter(
            (tallerista) => {

                const nombreCompleto =
                    `${tallerista.nombre} ${tallerista.apellido}`;

                return (
                    nombreCompleto
                        .toLowerCase()
                        .includes(textoBuscado) ||

                    tallerista.correo
                        .toLowerCase()
                        .includes(textoBuscado)
                );
            }
        );

    renderizarTalleristas(
        resultados
    );
}


/* =========================
   TABLA
========================= */

function renderizarTalleristas(
    talleristas
) {

    const tabla =
        document.getElementById(
            "tabla-talleristas"
        );
>>>>>>> c6e8eca1d4807b7378ed01f8fbdac06d3f9fc044

    if (!tabla) {
        return;
    }

<<<<<<< HEAD
    if (talleristas.length === 0) {
        tabla.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted py-5">
=======
    tabla.innerHTML = "";

    if (talleristas.length === 0) {

        tabla.innerHTML = `
            <tr>
                <td
                    colspan="5"
                    class="text-center text-muted py-5"
                >
>>>>>>> c6e8eca1d4807b7378ed01f8fbdac06d3f9fc044
                    No se encontraron talleristas.
                </td>
            </tr>
        `;
<<<<<<< HEAD
        return;
    }

    tabla.innerHTML = talleristas.map((tallerista) => `
        <tr>
            <td>${escaparHTML(tallerista.nombre)} ${escaparHTML(tallerista.apellido)}</td>
            <td>${escaparHTML(tallerista.correo)}</td>
            <td>${escaparHTML(tallerista.telefono)}</td>
            <td>${escaparHTML(tallerista.estado)}</td>
            <td>
                <a href="detalle-tallerista.html?id=${tallerista.id}" class="btn btn-sm btn-outline-primary">
                    Ver
                </a>
            </td>
        </tr>
    `).join("");
}


// ==============================
// ESTADISTICAS
// ==============================

function mostrarEstadisticasTalleristas(talleristas) {

    const total = talleristas.length;

    const activos = talleristas.filter(
        (t) => t.estado === "Activo"
    ).length;

    const conTalleres = talleristas.filter(
        (t) => t.talleresAsignados && t.talleresAsignados.length > 0
    ).length;

    const sinTalleres = total - conTalleres;

    colocarTexto("stat-total", total);
    colocarTexto("stat-activos", activos);
    colocarTexto("stat-con-talleres", conTalleres);
    colocarTexto("stat-sin-talleres", sinTalleres);
}


// ==============================
// ALTA DE TALLERISTA
// ==============================

function configurarAltaTallerista() {

    const botonAbrir = document.getElementById("btn-nuevo-tallerista");
    const botonGuardar = document.getElementById("btn-guardar-nuevo-tallerista");

    if (botonAbrir) {
        botonAbrir.addEventListener("click", abrirModalNuevoTallerista);
    }

    if (botonGuardar) {
        botonGuardar.addEventListener("click", guardarNuevoTallerista);
    }
}

function abrirModalNuevoTallerista() {

    document.getElementById("form-nuevo-tallerista").reset();
    ocultarAlerta("alerta-nuevo-tallerista");

    const modal = bootstrap.Modal.getOrCreateInstance(
        document.getElementById("modal-nuevo-tallerista")
    );

    modal.show();
}

function guardarNuevoTallerista() {

    const nombre = document.getElementById("nuevo-tallerista-nombre").value.trim();
    const apellido = document.getElementById("nuevo-tallerista-apellido").value.trim();
    const cedula = document.getElementById("nuevo-tallerista-cedula").value.trim();
    const correo = document.getElementById("nuevo-tallerista-correo").value.trim();
    const telefono = document.getElementById("nuevo-tallerista-telefono").value.trim();
    const especialidad = document.getElementById("nuevo-tallerista-especialidad").value.trim();

    const error = validarNuevoTallerista({ nombre, apellido, cedula, correo, telefono, especialidad });

    if (error) {
        mostrarAlerta("alerta-nuevo-tallerista", error, "danger");
        return;
    }

    const nuevoTallerista = {
        id: generarId(talleristasActuales),
        nombre,
        apellido,
        cedula,
        correo,
        telefono,
        especialidad,
        estado: "Activo",
        fechaRegistro: new Date().toISOString().split("T")[0],
        talleresAsignados: []
    };

    talleristasActuales.push(nuevoTallerista);
    guardarDato("talleristas", talleristasActuales);

    renderizarTablaTalleristas(talleristasActuales);
    mostrarEstadisticasTalleristas(talleristasActuales);

    const modal = bootstrap.Modal.getOrCreateInstance(
        document.getElementById("modal-nuevo-tallerista")
    );
    modal.hide();
}

function validarNuevoTallerista(datos) {

    const camposObligatorios = [
        datos.nombre, datos.apellido, datos.cedula,
        datos.correo, datos.telefono, datos.especialidad
    ];

    const hayCampoVacio = camposObligatorios.some((campo) => !campo);

    if (hayCampoVacio) {
        return "Todos los campos son obligatorios.";
    }

    const cedulaDuplicada = talleristasActuales.some(
        (t) => t.cedula === datos.cedula
    );

    if (cedulaDuplicada) {
        return "Ya existe un tallerista registrado con esa cédula.";
    }

    return null;
=======

        return;
    }

    talleristas.forEach(
        (tallerista) => {

            tabla.insertAdjacentHTML(
                "beforeend",
                crearFilaTallerista(
                    tallerista
                )
            );
        }
    );
}


/* =========================
   CREAR FILA
========================= */

function crearFilaTallerista(
    tallerista
) {

    const nombreCompleto =
        `${tallerista.nombre} ${tallerista.apellido}`;

    const claseEstado =
        obtenerClaseEstado(
            tallerista.estado
        );

    const cantidadTalleres =
        obtenerCantidadTalleres(
            tallerista
        );

    const urlDetalle =
        `detalle-tallerista.html?id=${encodeURIComponent(
            tallerista.id
        )}`;

    return `
        <tr>

            <td>
                <div class="fw-semibold">
                    ${escaparHTML(nombreCompleto)}
                </div>
            </td>

            <td>
                ${escaparHTML(tallerista.correo)}
            </td>

            <td>
                ${escaparHTML(tallerista.telefono)}
            </td>

            <td>
                <span class="badge ${claseEstado}">
                    ${escaparHTML(tallerista.estado)}
                </span>
            </td>

            <td>

                <div class="d-flex gap-2">

                    <a
                        href="${urlDetalle}"
                        class="btn btn-sm btn-outline-primary"
                    >
                        <i class="bi bi-eye"></i>
                        Ver
                    </a>

                    <span
                        class="text-muted small align-self-center"
                        title="Cantidad de talleres asignados"
                    >
                        ${cantidadTalleres}
                        taller${cantidadTalleres === 1 ? "" : "es"}
                    </span>

                </div>

            </td>

        </tr>
    `;
}


/* =========================
   CANTIDAD DE TALLERES
========================= */

function obtenerCantidadTalleres(
    tallerista
) {

    if (
        !Array.isArray(
            tallerista.talleresAsignados
        )
    ) {
        return 0;
    }

    return tallerista.talleresAsignados.length;
}


/* =========================
   ESTADO
========================= */

function obtenerClaseEstado(
    estado
) {

    const clases = {
        Activo: "text-bg-success",
        Inactivo: "text-bg-secondary"
    };

    return (
        clases[estado] ||
        "text-bg-secondary"
    );
}


/* =========================
   AUXILIARES
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
            `No se encontró el elemento: ${elementoId}`
        );

        return;
    }

    elemento.textContent =
        contenido ?? "-";
}


function escaparHTML(
    valor
) {

    const caracteres = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    };

    return String(
        valor ?? ""
    ).replace(
        /[&<>"']/g,
        (caracter) => {
            return caracteres[caracter];
        }
    );
>>>>>>> c6e8eca1d4807b7378ed01f8fbdac06d3f9fc044
}