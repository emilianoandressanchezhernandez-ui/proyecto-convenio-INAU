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

    if (!tabla) {
        return;
    }

    tabla.innerHTML = "";

    if (talleristas.length === 0) {

        tabla.innerHTML = `
            <tr>
                <td
                    colspan="5"
                    class="text-center text-muted py-5"
                >
                    No se encontraron talleristas.
                </td>
            </tr>
        `;

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
}