
"use strict";

/**
 * Control de aceptación de Términos y Condiciones.
 *
 * MODO DE PREPARACIÓN:
 * La aceptación permanece deshabilitada hasta que
 * los documentos reciban aprobación institucional.
 */
const ACEPTACION_HABILITADA = true;

/**
 * Destinos según el rol del usuario.
 *
 * Estas rutas son relativas a la raíz del frontend.
 */
const DESTINOS_POST_ACEPTACION = Object.freeze({
    admin: "frontend-admin/dashboard.html",
    tallerista: "frontend-tallerista/dashboard.html",
    alumno: "frontend-alumno/dashboard.html"
});

/**
 * Redirige al usuario después de una aceptación confirmada.
 */
function redirigirDespuesDeAceptar(usuario) {
    const destino = DESTINOS_POST_ACEPTACION[usuario?.rol];

    if (!destino) {
        throw new Error("La cuenta no tiene un rol reconocido.");
    }

    window.location.assign(destino);
}

document.addEventListener("DOMContentLoaded", async () => {
    const boton = document.getElementById("btn-aceptar");
    const casilla = document.getElementById("acepta-terminos");
    const formulario = document.getElementById("form-aceptacion");

    const botonCerrarSesion = document.getElementById("btn-cerrar-sesion");

    botonCerrarSesion.addEventListener("click", async () => {
        botonCerrarSesion.disabled = true;
        botonCerrarSesion.textContent = "Cerrando sesión...";

        try {
            await window.inauApi("/logout", {
                method: "POST"
            });

            window.location.replace("index.html");

        } catch (error) {
            console.error(
                "[INAU] No se pudo cerrar la sesión:",
                error.message
            );

            alert("No se pudo cerrar la sesión. Intentá nuevamente.");

            botonCerrarSesion.disabled = false;
            botonCerrarSesion.textContent = "Cerrar sesión";
        }
    });

    // La aceptación permanece deshabilitada.
    boton.disabled = true;
    casilla.disabled = true;

    let usuarioActual = null;
    let versionActual = null;

    /**
     * Obtiene la sesión y el estado de aceptación.
     */
    try {
        const datosPerfil = await window.inauApi("/perfil");
        usuarioActual = datosPerfil?.usuario || datosPerfil;

        if (!usuarioActual?.id || !usuarioActual?.rol) {
            throw new Error("No se pudo identificar al usuario.");
        }

        const estado = await window.inauApi("/terminos/estado");

        versionActual = estado.version_actual;

        console.info("[INAU] Usuario autenticado:", {
            id: usuarioActual.id,
            rol: usuarioActual.rol
        });

        console.info("[INAU] Estado de términos:", estado);

        if (estado.aceptado) {
            console.info(
                "[INAU] El usuario ya aceptó la versión vigente."
            );

            // Todavía no redirigimos automáticamente,
            // porque seguimos en modo de preparación.
            if (ACEPTACION_HABILITADA) {
                redirigirDespuesDeAceptar(usuarioActual);
            }

            return;
        }

        console.info(
            "[INAU] El usuario tiene pendiente la aceptación."
        );

        if (ACEPTACION_HABILITADA) {
            casilla.disabled = false;
            boton.disabled = !casilla.checked;
        }

    } catch (error) {
        console.warn(
            "[INAU] No se pudo comprobar el estado:",
            error.message
        );
    }

    /**
     * Habilita el botón únicamente cuando la aceptación
     * esté permitida y el usuario marque la casilla.
     */
    casilla.addEventListener("change", () => {
        boton.disabled =
            !ACEPTACION_HABILITADA ||
            !casilla.checked ||
            !usuarioActual ||
            !versionActual;
    });

    /**
     * Registra la aceptación mediante la API.
     */
    formulario.addEventListener("submit", async evento => {
        evento.preventDefault();

        if (
            !ACEPTACION_HABILITADA ||
            !casilla.checked ||
            !usuarioActual ||
            !versionActual
        ) {
            return;
        }

        boton.disabled = true;
        boton.textContent = "Registrando aceptación...";

        try {
            const estado = await window.inauApi(
                "/terminos/aceptar",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        version: versionActual,
                        acepta: true
                    })
                }
            );

            if (!estado?.aceptado) {
                throw new Error(
                    "No se pudo confirmar el registro de aceptación."
                );
            }

            console.info(
                "[INAU] Aceptación registrada correctamente.",
                estado
            );

            // Solo redirige si la API confirmó el registro.
            redirigirDespuesDeAceptar(usuarioActual);

        } catch (error) {
            console.error(
                "[INAU] Error al registrar aceptación:",
                error.message
            );

            alert(error.message);

            boton.disabled = false;
            boton.textContent = "Aceptar y continuar";
        }
    });
});
