
/*
 * MAIN.JS - FRONTEND ADMIN
 * Archivo común a todas las páginas del panel administrador.
 * Verifica la sesión real antes de inicializar cada pantalla,
 * muestra el usuario autenticado, configura el logout
 * y conserva el enrutado.
 */

const ADMIN_API_URL = "http://localhost:8002";
const ADMIN_LOGIN_URL = "../../index.html";

// Ocultar el contenido mientras se verifica la sesión.
document.documentElement.style.visibility = "hidden";

document.addEventListener("DOMContentLoaded", inicializarAplicacion);

async function inicializarAplicacion() {
    try {
        const usuario = await verificarSesionAdministrador();

        if (!usuario) return;

        // Usuario autenticado obtenido de la API.
        window.USUARIO_AUTENTICADO = usuario;

        // Compatibilidad temporal con mock-data.js.
        // No modifica ni elimina los demás datos simulados.
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
}


// ==============================
// VERIFICACIÓN DE SESIÓN
// ==============================

async function verificarSesionAdministrador() {

    const response = await fetch(`${ADMIN_API_URL}/perfil`, {
        method: "GET",
        credentials: "include",
        headers: {
            Accept: "application/json"
        },
        cache: "no-store"
    });

    // No existe una sesión válida.
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

    const usuario = resultado.datos?.usuario ?? resultado.datos;

    if (!usuario || typeof usuario !== "object" || !usuario.rol) {
        throw new Error("La API no devolvió un usuario válido.");
    }

    // Comprobar que el usuario sea administrador.
    if (usuario.rol !== "admin") {

        const destinos = {
            tallerista: "../frontend-tallerista/dashboard.html",
            alumno: "../frontend-alumno/dashboard.html"
        };

        window.location.replace(
            destinos[usuario.rol] || ADMIN_LOGIN_URL
        );

        return null;
    }

    return usuario;
}


function redirigirAlLogin() {
    window.location.replace(ADMIN_LOGIN_URL);
}


// ==============================
// DETECCIÓN DE PÁGINA Y ENRUTADO
// ==============================

function obtenerPaginaActual() {

    const paginaDefinida = document.body.dataset.page;

    if (paginaDefinida) {
        return paginaDefinida;
    }

    /*
     * Si el HTML no tiene data-page, se deduce
     * el nombre de la página desde la URL.
     */

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

    /*
     * Se conservan todos los inicializadores
     * de las páginas del administrador.
     */

    const inicializadores = {
        "dashboard": "inicializarDashboard",
        "talleristas": "inicializarTalleristas",
        "detalle-tallerista": "inicializarDetalleTallerista",
        "alumnos": "inicializarAlumnos",
        "detalle-alumno": "inicializarDetalleAlumno",
        "talleres": "inicializarTalleres",
        "detalle-taller": "inicializarDetalleTaller",
        "asistencias": "inicializarAsistencias",
        "reportes": "inicializarReportes",
        "detalle-reporte": "inicializarDetalleReporte",
        "perfil": "inicializarPerfil"
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

    /*
     * La identidad se obtiene de la API.
     * localStorage ya no determina quién
     * tiene una sesión válida.
     */

    return window.USUARIO_AUTENTICADO || null;
}


function mostrarUsuarioEnNavbar() {

    const elementoUsuario = document.getElementById("nombre-usuario");

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

    const textoUsuario = nombreCompleto || "Administrador";

    // Conservar el icono existente en el navbar.
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

        // Invalidar la sesión en el backend.
        const response = await fetch(`${ADMIN_API_URL}/logout`, {
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

        /*
         * Borramos únicamente las claves de sesión
         * antiguas. No usamos localStorage.clear()
         * para conservar los demás datos.
         */

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
