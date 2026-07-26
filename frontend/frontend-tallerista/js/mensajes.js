/*
    MENSAJES.JS
    Responsabilidades:
    - Obtener las conversaciones del tallerista.
    - Mostrar mensajes enviados y recibidos.
    - Marcar mensajes como leídos.
    - Enviar nuevos mensajes.
    - Guardar los cambios en localStorage.
*/

// VARIABLES

let usuarioMensajesActual = null;
let conversacionesMensajes = [];
let conversacionSeleccionadaId = null;

// INICIALIZACIÓN 

function inicializarMensajes() {
    try {
        validarDatosMensajes();

        usuarioMensajesActual =
            obtenerUsuarioMensajeria();

        conversacionesMensajes =
            cargarConversacionesMensajes();

        configurarFormularioMensaje();
        renderizarListaConversaciones();
        actualizarResumenMensajesNoLeidos();

    } catch (error) {
        console.error(
            "Error al inicializar los mensajes:",
            error
        );

        mostrarAlertaMensajes(
            "No se pudieron cargar las conversaciones.",
            "danger"
        );

        deshabilitarChat();
    }
}

// VALIDACIÓN

function validarDatosMensajes() {
    if (!window.DATOS_SIMULADOS) {
        throw new Error(
            "No se encontraron los datos simulados."
        );
    }

    if (!window.DATOS_SIMULADOS.usuarioActual) {
        throw new Error(
            "No se encontró el usuario actual."
        );
    }

    if (
        !Array.isArray(
            window.DATOS_SIMULADOS.administradores
        )
    ) {
        throw new Error(
            "La lista de administradores no está disponible."
        );
    }

    if (
        !Array.isArray(
            window.DATOS_SIMULADOS.conversaciones
        )
    ) {
        throw new Error(
            "La lista de conversaciones no está disponible."
        );
    }
}

// USUARIO

function obtenerUsuarioMensajeria() {
    if (typeof obtenerUsuarioActual === "function") {
        return obtenerUsuarioActual();
    }

    return window.DATOS_SIMULADOS.usuarioActual;
}

// LOCAL STORAGE

function cargarConversacionesMensajes() {
    const contenidoGuardado = localStorage.getItem(
        "conversacionesSimuladas"
    );

    if (contenidoGuardado) {
        try {
            const conversacionesGuardadas =
                JSON.parse(contenidoGuardado);

            if (
                Array.isArray(
                    conversacionesGuardadas
                )
            ) {
                return conversacionesGuardadas;
            }

        } catch (error) {
            console.warn(
                "No se pudieron leer las conversaciones guardadas:",
                error
            );
        }
    }

    /*
        Creamos una copia de los datos originales.
        Así evitamos modificar directamente el contenido de mock-data.js.
    */

    return JSON.parse(
        JSON.stringify(
            window.DATOS_SIMULADOS.conversaciones
        )
    );
}

function guardarConversacionesMensajes() {
    localStorage.setItem(
        "conversacionesSimuladas",
        JSON.stringify(conversacionesMensajes)
    );
}

// OBTENER CONVERSACIONES

function obtenerConversacionesDelUsuario() {
    return conversacionesMensajes.filter(
        (conversacion) => {
            return (
                conversacion.talleristaId ===
                usuarioMensajesActual.id
            );
        }
    );
}

function obtenerConversacionPorId(
    conversacionId
) {
    return conversacionesMensajes.find(
        (conversacion) => {
            return (
                conversacion.id === conversacionId &&
                conversacion.talleristaId ===
                    usuarioMensajesActual.id
            );
        }
    );
}

// LISTA DE CONVERSACIONES

function renderizarListaConversaciones() {
    const lista = document.getElementById(
        "lista-conversaciones"
    );

    if (!lista) {
        return;
    }

    const conversaciones =
        obtenerConversacionesDelUsuario()
            .sort((conversacionA, conversacionB) => {
                return (
                    new Date(
                        conversacionB.ultimaActualizacion
                    ) -
                    new Date(
                        conversacionA.ultimaActualizacion
                    )
                );
            });

    lista.innerHTML = "";

    if (conversaciones.length === 0) {
        lista.innerHTML = `
            <div class="text-center text-muted py-4">
                <i class="bi bi-inbox display-5"></i>

                <p class="mt-3 mb-0">
                    No hay conversaciones disponibles.
                </p>
            </div>
        `;

        deshabilitarChat();
        return;
    }

    conversaciones.forEach((conversacion) => {
        lista.insertAdjacentHTML(
            "beforeend",
            crearElementoConversacion(
                conversacion
            )
        );
    });

    configurarEventosConversaciones();
}

function crearElementoConversacion(
    conversacion
) {
    const administrador =
        buscarAdministradorPorId(
            conversacion.administradorId
        );

    const nombreAdministrador =
        obtenerNombreAdministrador(
            administrador
        );

    const ultimoMensaje =
        obtenerUltimoMensaje(
            conversacion
        );

    const mensajesNoLeidos =
        contarMensajesNoLeidos(
            conversacion
        );

    const estaSeleccionada =
        conversacion.id ===
        conversacionSeleccionadaId;

    return `
        <button
            type="button"
            class="list-group-item list-group-item-action conversacion-item ${estaSeleccionada ? "active" : ""}"
            data-conversacion-id="${conversacion.id}"
        >
            <div class="d-flex justify-content-between align-items-start gap-2">
                <div class="overflow-hidden">
                    <h6 class="fw-bold mb-1">
                        ${escaparHTMLMensajes(
                            nombreAdministrador
                        )}
                    </h6>

                    <p class="small text-muted text-truncate mb-0">
                        ${escaparHTMLMensajes(
                            obtenerVistaPreviaMensaje(
                                ultimoMensaje
                            )
                        )}
                    </p>
                </div>

                ${
                    mensajesNoLeidos > 0
                        ? `
                            <span class="badge text-bg-danger rounded-pill">
                                ${mensajesNoLeidos}
                            </span>
                        `
                        : ""
                }
            </div>
        </button>
    `;
}

function configurarEventosConversaciones() {
    const elementos = document.querySelectorAll(
        ".conversacion-item"
    );

    elementos.forEach((elemento) => {
        elemento.addEventListener(
            "click",
            () => {
                const conversacionId = Number(
                    elemento.dataset.conversacionId
                );

                seleccionarConversacion(
                    conversacionId
                );
            }
        );
    });
}

// SELECCIONAR CONVERSACIÓN

function seleccionarConversacion(
    conversacionId
) {
    const conversacion =
        obtenerConversacionPorId(
            conversacionId
        );

    if (!conversacion) {
        mostrarAlertaMensajes(
            "La conversación seleccionada no existe.",
            "danger"
        );

        return;
    }

    conversacionSeleccionadaId =
        conversacion.id;

    marcarMensajesComoLeidos(
        conversacion
    );

    guardarConversacionesMensajes();

    renderizarListaConversaciones();
    renderizarConversacion(conversacion);

    habilitarChat();
    actualizarResumenMensajesNoLeidos();

    const inputMensaje = document.getElementById(
        "mensaje"
    );

    inputMensaje?.focus();
}

// MARCAR COMO LEÍDO
function marcarMensajesComoLeidos(
    conversacion
) {
    if (!Array.isArray(conversacion.mensajes)) {
        return;
    }

    conversacion.mensajes.forEach(
        (mensaje) => {
            const esMensajeRecibido =
                mensaje.remitenteRol ===
                "Administrador";

            if (esMensajeRecibido) {
                mensaje.leido = true;
            }
        }
    );
}

// MOSTRAR CONVERSACIÓN

function renderizarConversacion(
    conversacion
) {
    const contenedor = document.getElementById(
        "contenedor-mensajes"
    );

    const titulo = document.getElementById(
        "titulo-conversacion"
    );

    const estado = document.getElementById(
        "estado-chat"
    );

    if (!contenedor) {
        return;
    }

    const administrador =
        buscarAdministradorPorId(
            conversacion.administradorId
        );

    const nombreAdministrador =
        obtenerNombreAdministrador(
            administrador
        );

    if (titulo) {
        titulo.textContent =
            nombreAdministrador;
    }

    if (estado) {
        estado.textContent = "Disponible";

        estado.classList.remove(
            "text-bg-secondary"
        );

        estado.classList.add(
            "text-bg-success"
        );
    }

    const mensajes = Array.isArray(
        conversacion.mensajes
    )
        ? [...conversacion.mensajes]
        : [];

    mensajes.sort((mensajeA, mensajeB) => {
        return (
            new Date(mensajeA.fechaHora) -
            new Date(mensajeB.fechaHora)
        );
    });

    contenedor.innerHTML = "";

    if (mensajes.length === 0) {
        contenedor.innerHTML = `
            <div class="text-center text-muted py-5">
                <i class="bi bi-chat-dots display-4"></i>

                <p class="mt-3 mb-0">
                    Todavía no hay mensajes en esta conversación.
                </p>
            </div>
        `;

        return;
    }

    mensajes.forEach((mensaje) => {
        contenedor.insertAdjacentHTML(
            "beforeend",
            crearBurbujaMensaje(
                mensaje,
                administrador
            )
        );
    });

    desplazarChatAlFinal();
}

function crearBurbujaMensaje(
    mensaje,
    administrador
) {
    const mensajeEnviado =
        mensaje.remitenteRol === "Tallerista" &&
        mensaje.remitenteId ===
            usuarioMensajesActual.id;

    const claseMensaje = mensajeEnviado
        ? "mensaje-enviado"
        : "mensaje-recibido";

    const autor = mensajeEnviado
        ? "Tú"
        : obtenerNombreAdministrador(
            administrador
        );

    return `
        <div class="${claseMensaje}">
        <p class="mensaje-contenido mb-1">${escaparHTMLMensajes(mensaje.contenido)}</p>

            <span class="mensaje-meta">
                ${escaparHTMLMensajes(autor)}
                ·
                ${escaparHTMLMensajes(
                    formatearFechaHoraMensaje(
                        mensaje.fechaHora
                    )
                )}
            </span>
        </div>
    `;
}

// FORMULARIO

function configurarFormularioMensaje() {
    const formulario = document.getElementById(
        "form-mensaje"
    );

    if (!formulario) {
        return;
    }

    formulario.addEventListener(
        "submit",
        enviarMensaje
    );
}

function enviarMensaje(event) {
    event.preventDefault();

    ocultarAlertaMensajes();

    if (conversacionSeleccionadaId === null) {
        mostrarAlertaMensajes(
            "Debes seleccionar una conversación.",
            "warning"
        );

        return;
    }

    const inputMensaje = document.getElementById(
        "mensaje"
    );

    if (!inputMensaje) {
        return;
    }

    const contenido =
        inputMensaje.value.trim();

    if (!contenido) {
        mostrarAlertaMensajes(
            "No puedes enviar un mensaje vacío.",
            "warning"
        );

        return;
    }

    if (contenido.length > 500) {
        mostrarAlertaMensajes(
            "El mensaje no puede superar los 500 caracteres.",
            "warning"
        );

        return;
    }

    const conversacion =
        obtenerConversacionPorId(
            conversacionSeleccionadaId
        );

    if (!conversacion) {
        mostrarAlertaMensajes(
            "No se encontró la conversación.",
            "danger"
        );

        return;
    }

    const fechaActual =
        new Date().toISOString();

    const nuevoMensaje = {
        id: generarIdMensaje(),
        remitenteId:
            usuarioMensajesActual.id,
        remitenteRol: "Tallerista",
        contenido: contenido,
        fechaHora: fechaActual,
        leido: true
    };

    if (!Array.isArray(conversacion.mensajes)) {
        conversacion.mensajes = [];
    }

    conversacion.mensajes.push(
        nuevoMensaje
    );

    conversacion.ultimaActualizacion =
        fechaActual;

    guardarConversacionesMensajes();

    inputMensaje.value = "";

    renderizarListaConversaciones();
    renderizarConversacion(
        conversacion
    );

    inputMensaje.focus();
}


function generarIdMensaje() {
    return Date.now();
}

// HABILITAR Y DESHABILITAR

function habilitarChat() {
    const inputMensaje = document.getElementById(
        "mensaje"
    );

    const botonEnviar = document.getElementById(
        "btn-enviar-mensaje"
    );

    if (inputMensaje) {
        inputMensaje.disabled = false;
    }

    if (botonEnviar) {
        botonEnviar.disabled = false;
    }
}

function deshabilitarChat() {
    const inputMensaje = document.getElementById(
        "mensaje"
    );

    const botonEnviar = document.getElementById(
        "btn-enviar-mensaje"
    );

    if (inputMensaje) {
        inputMensaje.disabled = true;
    }

    if (botonEnviar) {
        botonEnviar.disabled = true;
    }
}

// ADMINISTRADOR
function buscarAdministradorPorId(
    administradorId
) {
    return window.DATOS_SIMULADOS.administradores.find(
        (administrador) => {
            return (
                administrador.id ===
                administradorId
            );
        }
    );
}

function obtenerNombreAdministrador(
    administrador
) {
    if (!administrador) {
        return "Administración";
    }

    return [
        administrador.nombre,
        administrador.apellido
    ]
        .filter(Boolean)
        .join(" ") || "Administración";
}

// MENSAJES NO LEÍDOS

function contarMensajesNoLeidos(
    conversacion
) {
    if (!Array.isArray(conversacion.mensajes)) {
        return 0;
    }

    return conversacion.mensajes.filter(
        (mensaje) => {
            return (
                mensaje.remitenteRol ===
                    "Administrador" &&
                mensaje.leido === false
            );
        }
    ).length;
}

function actualizarResumenMensajesNoLeidos() {
    const conversaciones =
        obtenerConversacionesDelUsuario();

    const totalNoLeidos =
        conversaciones.reduce(
            (total, conversacion) => {
                return (
                    total +
                    contarMensajesNoLeidos(
                        conversacion
                    )
                );
            },
            0
        );

    /*
        Este valor podrá utilizarse después
        en el dashboard.
    */

    localStorage.setItem(
        "mensajesNoLeidosTallerista",
        String(totalNoLeidos)
    );
}

// FUNCIONES AUXILIARES

function obtenerUltimoMensaje(
    conversacion
) {
    if (
        !Array.isArray(conversacion.mensajes) ||
        conversacion.mensajes.length === 0
    ) {
        return null;
    }

    return [...conversacion.mensajes].sort(
        (mensajeA, mensajeB) => {
            return (
                new Date(mensajeB.fechaHora) -
                new Date(mensajeA.fechaHora)
            );
        }
    )[0];
}

function obtenerVistaPreviaMensaje(
    mensaje
) {
    if (!mensaje) {
        return "Sin mensajes";
    }

    const contenido = String(
        mensaje.contenido || ""
    )
        .replace(/\s+/g, " ")
        .trim();

    if (contenido.length <= 55) {
        return contenido;
    }

    return `${contenido.slice(0, 55)}...`;
}

function formatearFechaHoraMensaje(
    fechaHora
) {
    const fecha = new Date(
        fechaHora
    );

    if (Number.isNaN(fecha.getTime())) {
        return "Sin fecha";
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

function desplazarChatAlFinal() {
    const contenedor = document.getElementById(
        "contenedor-mensajes"
    );

    if (!contenedor) {
        return;
    }

    contenedor.scrollTop =
        contenedor.scrollHeight;
}

function escaparHTMLMensajes(valor) {
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

function mostrarAlertaMensajes(
    mensaje,
    tipo = "danger"
) {
    const alerta = document.getElementById(
        "alerta-mensajes"
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

function ocultarAlertaMensajes() {
    const alerta = document.getElementById(
        "alerta-mensajes"
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