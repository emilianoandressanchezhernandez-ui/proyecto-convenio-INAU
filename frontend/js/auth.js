
"use strict";

const DESTINOS_INAU = Object.freeze({
    admin: "frontend-admin/dashboard.html",
    tallerista: "frontend-tallerista/dashboard.html",
    alumno: "frontend-alumno/dashboard.html"
});

/*
 * CONTROL DE ACEPTACIÓN
 *
 * false: modo preparación. No bloquea el acceso.
 * true: modo obligatorio, únicamente después de aprobar
 * los documentos y proteger los endpoints del backend.
 *
 * NO ACTIVAR TODAVÍA.
 */
const TERMINOS_OBLIGATORIOS = true;

/**
 * Redirige al dashboard correspondiente.
 */
function redirigirSegunRol(usuario) {
    const destino = DESTINOS_INAU[usuario?.rol];

    if (!destino) {
        throw new Error("La cuenta no tiene un rol reconocido.");
    }

    window.location.assign(destino);
}

/**
 * Consulta el estado de aceptación del usuario.
 */
async function consultarEstadoTerminos() {
    try {
        const estado = await window.inauApi("/terminos/estado");

        console.info("[INAU] Estado de términos:", estado);

        return estado;

    } catch (error) {
        console.warn(
            "[INAU] No se pudo consultar el estado de términos:",
            error.message
        );

        return null;
    }
}

/**
 * Determina a dónde enviar al usuario después del login.
 */
async function continuarSegunTerminos(usuario) {
    if (!DESTINOS_INAU[usuario?.rol]) {
        throw new Error("La cuenta no tiene un rol reconocido.");
    }

    const estado = await consultarEstadoTerminos();

    // Modo preparación: mantener el acceso habitual.
    if (!TERMINOS_OBLIGATORIOS) {
        redirigirSegunRol(usuario);
        return;
    }

    // Si la verificación es obligatoria, no permitir
    // continuar cuando no se puede comprobar el estado.
    if (!estado || typeof estado.aceptado !== "boolean") {
        throw new Error(
            "No se pudo comprobar la aceptación de los términos."
        );
    }

    if (!estado.aceptado) {
        window.location.assign("aceptar-terminos.html");
        return;
    }

    redirigirSegunRol(usuario);
}

document.addEventListener("DOMContentLoaded", async () => {
    const formulario = document.getElementById("form-login");
    const alerta = document.getElementById("alerta-error");
    const boton = document.getElementById("btn-login");

    const mostrarError = mensaje => {
        alerta.textContent = mensaje;
        alerta.classList.remove("d-none");
    };

    /**
     * Inicio de sesión.
     */
    formulario.addEventListener("submit", async evento => {
        evento.preventDefault();

        alerta.classList.add("d-none");
        boton.disabled = true;
        boton.textContent = "Ingresando...";

        try {
            const correo = document
                .getElementById("correo")
                .value
                .trim();

            const clave = document
                .getElementById("password")
                .value;

            const datos = await window.inauApi("/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ correo, clave })
            });

            await continuarSegunTerminos(datos?.usuario);

        } catch (error) {
            mostrarError(error.message);

        } finally {
            boton.disabled = false;
            boton.textContent = "Ingresar";
        }
    });

    /**
     * Comprobar si ya existe una sesión válida.
     */
    try {
        const datos = await window.inauApi("/perfil");

        await continuarSegunTerminos(
            datos?.usuario || datos
        );

    } catch (error) {
        if (error.status !== 401) {
            console.warn(
                "[INAU] Comprobación de sesión:",
                error.message
            );
        }
    }
});
