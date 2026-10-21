
/*
 * MAIN.JS - FRONTEND TALLERISTA
 * Verifica la sesión real antes de inicializar cada pantalla.
 * Conserva el enrutado y la compatibilidad temporal con datos simulados.
 */

const TALLERISTA_API_URL = "http://localhost:8002";
const TALLERISTA_LOGIN_URL = "../../index.html";

// Evita mostrar contenido mientras se verifica la sesión.
document.documentElement.style.visibility = "hidden";

document.addEventListener("DOMContentLoaded", inicializarAplicacion);

async function inicializarAplicacion() {
    try {
        const usuario = await verificarSesionTallerista();
        if (!usuario) return;

        window.USUARIO_AUTENTICADO = usuario;

        // Compatibilidad transitoria con los datos simulados.
        if (window.DATOS_SIMULADOS) {
            window.DATOS_SIMULADOS.usuarioActual = {
                ...window.DATOS_SIMULADOS.usuarioActual,
                ...usuario
            };
        }

        mostrarUsuarioEnNavbar();
        configurarLogout();

        document.documentElement.style.visibility = "visible";
        inicializarPaginaActual();

    } catch (error) {
        console.error("No se pudo verificar la sesión:", error);
        mostrarErrorDeSesion();
    }
}


// ==============================
// VERIFICACIÓN DE SESIÓN
// ==============================

async function verificarSesionTallerista() {

    const response = await fetch(`${TALLERISTA_API_URL}/perfil`, {
        method: "GET",
        credentials: "include",
        headers: {
            Accept: "application/json"
        },
        cache: "no-store"
    });

    if (response.status === 401) {
        redirigirAlLogin();
        return null;
    }

    if (!response.ok) {
        throw new Error(
            `GET /perfil devolvió HTTP ${response.status}`
        );
    }

    const resultado = await response.json();

    if (!resultado.ok) {
        throw new Error(
            resultado.mensaje || "No se pudo recuperar el perfil."
        );
    }

    // Compatible con ambas estructuras de respuesta.
    const usuario = resultado.datos?.usuario ?? resultado.datos;

    if (!usuario || typeof usuario !== "object" || !usuario.rol) {
        throw new Error("La API no devolvió un usuario válido.");
    }

    if (usuario.rol !== "tallerista") {

        const destinos = {
            admin: "../frontend-admin/dashboard.html",
            alumno: "../frontend-alumno/dashboard.html"
        };

        window.location.replace(
            destinos[usuario.rol] || TALLERISTA_LOGIN_URL
        );

        return null;
    }

    return usuario;
}


function redirigirAlLogin() {
    window.location.replace(TALLERISTA_LOGIN_URL);
}


function mostrarErrorDeSesion() {

    document.documentElement.style.visibility = "visible";
    document.body.replaceChildren();

    const mensaje = document.createElement("main");
    mensaje.className = "container py-5";

    const titulo = document.createElement("h1");
    titulo.className = "h4";
    titulo.textContent = "No se pudo comprobar la sesión";

    const detalle = document.createElement("p");
    detalle.textContent =
        "Comprobá que la API esté encendida y volvé a intentar.";

    const reintentar = document.createElement("button");
    reintentar.className = "btn btn-primary";
    reintentar.textContent = "Reintentar";

    reintentar.addEventListener("click", () => {
        window.location.reload();
    });

    mensaje.append(titulo, detalle, reintentar);
    document.body.append(mensaje);
}


// ==============================
// DETECCIÓN DE PÁGINA Y ENRUTADO
// ==============================

function obtenerPaginaActual() {

    const paginaDefinida = document.body.dataset.page;

    if (paginaDefinida) {
        return paginaDefinida;
    }

    const archivoActual = window.location.pathname
        .split("/")
        .pop();

    if (!archivoActual) {
        return "dashboard";
    }

    return archivoActual.replace(".html", "");
}


function inicializarPaginaActual() {

    const paginaActual = obtenerPaginaActual();

    // Conservamos los nueve inicializadores originales.
    const inicializadores = {
        "dashboard": "inicializarDashboard",
        "perfil": "inicializarPerfil",
        "mis-talleres": "inicializarMisTalleres",
        "detalle-taller": "inicializarDetalleTaller",
        "asistencia": "inicializarAsistencia",
        "informes": "inicializarInformes",
        "detalle-informe": "inicializarDetalleInforme",
        "material": "inicializarMaterial",
        "correccion-tarea": "inicializarCorreccionTarea"
    };

    const nombreFuncion = inicializadores[paginaActual];

    const funcionInicializadora = nombreFuncion
        ? window[nombreFuncion]
        : undefined;

    if (typeof funcionInicializadora === "function") {
        funcionInicializadora();
    }
}


// ==============================
// USUARIO
// ==============================

function obtenerUsuarioActual() {

    // La API determina la identidad del usuario.
    // localStorage ya no controla la autenticación.
    return window.USUARIO_AUTENTICADO || null;
}


function mostrarUsuarioEnNavbar() {

    const elementoUsuario =
        document.getElementById("nombre-usuario");

    if (!elementoUsuario) {
        return;
    }

    const usuario = obtenerUsuarioActual();

    if (!usuario) {
        return;
    }

    const nombreCompleto = [
        usuario.nombre,
        usuario.apellido
    ]
        .filter(Boolean)
        .join(" ");

    const textoUsuario = nombreCompleto || "Tallerista";

    // Se conserva el ícono del navbar.
    const icono = elementoUsuario.querySelector("i");

    if (icono) {
        elementoUsuario.replaceChildren();

        elementoUsuario.append(
            icono,
            document.createTextNode(` ${textoUsuario}`)
        );

        return;
    }

    elementoUsuario.textContent = textoUsuario;
}


// ==============================
// CIERRE DE SESIÓN
// ==============================

function configurarLogout() {

    const botonesLogout = document.querySelectorAll(
        "#btn-logout, #btn-cerrar-sesion"
    );

    botonesLogout.forEach((boton) => {
        boton.addEventListener("click", cerrarSesion);
    });
}


async function cerrarSesion(evento) {

    evento?.preventDefault();

    const confirmarSalida = confirm("¿Desea cerrar sesión?");

    if (!confirmarSalida) {
        return;
    }

    const botones = document.querySelectorAll(
        "#btn-logout, #btn-cerrar-sesion"
    );

    botones.forEach((boton) => {
        boton.disabled = true;
    });

    try {

        const response = await fetch(`${TALLERISTA_API_URL}/logout`, {
            method: "POST",
            credentials: "include",
            headers: {
                Accept: "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(
                `POST /logout devolvió HTTP ${response.status}`
            );
        }

        // No se borran los datos locales de otras funcionalidades.
        localStorage.removeItem("usuarioActual");
        localStorage.removeItem("sesionActiva");

        window.USUARIO_AUTENTICADO = null;

        redirigirAlLogin();

    } catch (error) {

        console.error(
            "No se pudo cerrar sesión en el servidor:",
            error
        );

        alert(
            "No se pudo cerrar sesión. Verificá la conexión e intentá otra vez."
        );

        botones.forEach((boton) => {
            boton.disabled = false;
        });
    }
}
