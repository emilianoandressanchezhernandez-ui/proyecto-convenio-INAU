"use strict";

/*
    DETALLE-TALLERISTA.JS

    Se encarga de cargar la información del
    tallerista seleccionado mediante la URL.

    Ejemplo:

    detalle-tallerista.html?id=5

    El ID se obtiene de la URL y se utiliza
    para buscar el tallerista correspondiente
    en mock-data.js.
*/


/* =========================
   INICIALIZACIÓN
========================= */

function inicializarDetalleTallerista() {

    try {

        validarDatos();

        const idTallerista =
            obtenerIdDesdeURL();

        if (!idTallerista) {

            mostrarError(
                "No se especificó un tallerista."
            );

            return;
        }

        const tallerista =
            buscarTalleristaPorId(
                idTallerista
            );

        if (!tallerista) {

            mostrarError(
                "No se encontró el tallerista solicitado."
            );

            return;
        }

        renderizarTallerista(
            tallerista
        );

        renderizarTalleresAsignados(
            tallerista
        );

    } catch (error) {

        console.error(
            "Error al cargar el detalle del tallerista:",
            error
        );
    }
}


/* =========================
   VALIDACIÓN
========================= */

function validarDatos() {

    if (!window.DATOS_SIMULADOS) {

        throw new Error(
            "No se encontraron los datos simulados."
        );
    }

    if (
        !Array.isArray(
            window.DATOS_SIMULADOS.talleristas
        )
    ) {

        throw new Error(
            "No existe la lista de talleristas."
        );
    }

    if (
        !Array.isArray(
            window.DATOS_SIMULADOS.talleres
        )
    ) {

        throw new Error(
            "No existe la lista de talleres."
        );
    }
}


/* =========================
   OBTENER ID
========================= */

function obtenerIdDesdeURL() {

    const parametros =
        new URLSearchParams(
            window.location.search
        );

    const id =
        parametros.get("id");

    if (!id) {
        return null;
    }

    return Number(id);
}


/* =========================
   BUSCAR TALLERISTA
========================= */

function buscarTalleristaPorId(
    id
) {

    return window.DATOS_SIMULADOS.talleristas.find(
        (tallerista) => {
            return Number(tallerista.id) === id;
        }
    ) || null;
}


/* =========================
   RENDERIZAR INFORMACIÓN
========================= */

function renderizarTallerista(
    tallerista
) {

    colocarTexto(
        "nombre-tallerista",
        tallerista.nombre
    );

    colocarTexto(
        "apellido-tallerista",
        tallerista.apellido
    );

    colocarTexto(
        "cedula-tallerista",
        tallerista.cedula
    );

    colocarTexto(
        "correo-tallerista",
        tallerista.correo
    );

    colocarTexto(
        "telefono-tallerista",
        tallerista.telefono
    );

    colocarTexto(
        "especialidad-tallerista",
        tallerista.especialidad
    );

    mostrarEstado(
        tallerista.estado
    );
}


/* =========================
   ESTADO
========================= */

function mostrarEstado(
    estado
) {

    const elemento =
        document.getElementById(
            "estado-tallerista"
        );

    if (!elemento) {
        return;
    }

    elemento.textContent =
        estado || "Sin estado";

    elemento.classList.remove(
        "text-bg-success",
        "text-bg-secondary",
        "text-bg-danger"
    );

    if (estado === "Activo") {

        elemento.classList.add(
            "text-bg-success"
        );

    } else if (estado === "Inactivo") {

        elemento.classList.add(
            "text-bg-secondary"
        );

    } else {

        elemento.classList.add(
            "text-bg-danger"
        );
    }
}


/* =========================
   TALLERES ASIGNADOS
========================= */

function renderizarTalleresAsignados(
    tallerista
) {

    const contenedor =
        document.getElementById(
            "talleres-tallerista"
        );

    if (!contenedor) {
        return;
    }

    contenedor.innerHTML = "";

    const idsTalleres =
        Array.isArray(
            tallerista.talleresAsignados
        )
            ? tallerista.talleresAsignados
            : [];

    if (idsTalleres.length === 0) {

        contenedor.innerHTML = `
            <div class="text-muted py-3">
                Este tallerista no tiene
                talleres asignados.
            </div>
        `;

        return;
    }

    const talleres =
        window.DATOS_SIMULADOS.talleres.filter(
            (taller) => {

                return idsTalleres.includes(
                    Number(taller.id)
                );
            }
        );

    talleres.forEach(
        (taller) => {

            contenedor.insertAdjacentHTML(
                "beforeend",
                crearTarjetaTaller(
                    taller
                )
            );
        }
    );
}


/* =========================
   TARJETA DE TALLER
========================= */

function crearTarjetaTaller(
    taller
) {

    return `
        <div class="border rounded p-3 mb-2">

            <div class="d-flex justify-content-between
                        align-items-start gap-3">

                <div>

                    <h6 class="mb-1">
                        ${escaparHTML(taller.nombre)}
                    </h6>

                    <p class="text-muted mb-0 small">
                        ${escaparHTML(
                            taller.horario || "Horario no disponible"
                        )}
                    </p>

                </div>

                <a
                    href="detalle-taller.html?id=${encodeURIComponent(taller.id)}"
                    class="btn btn-sm btn-outline-primary"
                >
                    Ver taller
                </a>

            </div>

        </div>
    `;
}


/* =========================
   ERROR
========================= */

function mostrarError(
    mensaje
) {

    console.warn(
        mensaje
    );

    const contenedor =
        document.getElementById(
            "contenido-detalle-tallerista"
        );

    if (!contenedor) {
        return;
    }

    contenedor.innerHTML = `
        <div class="alert alert-warning">
            ${escaparHTML(mensaje)}
        </div>
    `;
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