
/*
 * MAIN.JS - FRONTEND ALUMNO
 *
 * Archivo común a las páginas del panel alumno.
 *
 * Funciones:
 * - Verificar sesión mediante la API real.
 * - Comprobar el rol alumno.
 * - Mostrar el usuario autenticado.
 * - Conservar los inicializadores de cada página.
 * - Mantener compatibilidad temporal con mock-data.js.
 * - Cerrar sesión mediante POST /logout.
 *
 * IMPORTANTE:
 * usuarios.id y alumnos.id son identificadores diferentes.
 */

"use strict";

const ALUMNO_API_URL = "http://localhost:8002";
const ALUMNO_LOGIN_URL = "../../index.html";

// Evitar mostrar contenido antes de verificar la sesión.
document.documentElement.style.visibility = "hidden";

document.addEventListener("DOMContentLoaded", inicializarAplicacion);


// ==============================
// INICIALIZACIÓN GENERAL
// ==============================

async function inicializarAplicacion() {
    try {
        const usuario = await verificarSesionAlumno();

        if (!usuario) {
            return;
        }

        window.USUARIO_AUTENTICADO = usuario;

        sincronizarUsuarioAlumno(usuario);

        mostrarUsuarioEnNavbar();
        configurarLogout();

        document.documentElement.style.visibility = "visible";

        inicializarPaginaActual();

    } catch (error) {
        console.error(
            "No se pudo verificar la sesión:",
            error
        );

        mostrarErrorDeSesion();
    }
}


// ==============================
// VERIFICACIÓN DE SESIÓN
// ==============================

async function verificarSesionAlumno() {

    const response = await fetch(
        `${ALUMNO_API_URL}/perfil`,
        {
            method: "GET",
            credentials: "include",
            headers: {
                Accept: "application/json"
            },
            cache: "no-store"
        }
    );

    // Sin sesión válida.
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
            resultado.mensaje ||
            "No se pudo recuperar el perfil."
        );
    }

    // La API actual devuelve el usuario en datos.
    // También admitimos datos.usuario.
    const usuario =
        resultado.datos?.usuario ?? resultado.datos;

    if (
        !usuario ||
        typeof usuario !== "object" ||
        Array.isArray(usuario) ||
        !usuario.rol
    ) {
        throw new Error(
            "La API no devolvió un usuario válido."
        );
    }

    if (usuario.rol !== "alumno") {

        const destinos = {
            admin: "../frontend-admin/dashboard.html",
            tallerista: "../frontend-tallerista/dashboard.html"
        };

        window.location.replace(
            destinos[usuario.rol] || ALUMNO_LOGIN_URL
        );

        return null;
    }

    return usuario;
}


function redirigirAlLogin() {
    window.location.replace(ALUMNO_LOGIN_URL);
}


// ==============================
// MANEJO DE ERRORES
// ==============================

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
        "Comprobá que la API esté funcionando y volvé a intentar.";

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
// DETECCIÓN DE PÁGINA
// ==============================

function obtenerPaginaActual() {

    const paginaDefinida = document.body?.dataset?.page;

    if (paginaDefinida) {
        return paginaDefinida;
    }

    const archivoActual = window.location.pathname
        .split("/")
        .pop();

    if (!archivoActual) {
        return "dashboard";
    }

    return archivoActual.replace(/\.html$/i, "") ||
        "dashboard";
}


// ==============================
// INICIALIZADORES
// ==============================

function inicializarPaginaActual() {

    const paginaActual = obtenerPaginaActual();

    // Se conservan los siete inicializadores originales.
    const inicializadores = {
        "dashboard": "inicializarDashboard",
        "mis-talleres": "inicializarMisTalleres",
        "detalle-taller": "inicializarDetalleTaller",
        "tareas": "inicializarTareas",
        "detalle-tarea": "inicializarDetalleTarea",
        "asistencia": "inicializarAsistencia",
        "perfil": "inicializarPerfil"
    };

    const nombreFuncion = inicializadores[paginaActual];

    if (!nombreFuncion) {
        console.warn(
            `No hay un inicializador registrado para la página "${paginaActual}".`
        );
        return;
    }

    const funcionInicializadora = window[nombreFuncion];

    if (typeof funcionInicializadora === "function") {
        funcionInicializadora();
    } else {
        console.info(
            `El inicializador "${nombreFuncion}" todavía no está disponible.`
        );
    }
}


// ==============================
// USUARIO REAL Y DATOS SIMULADOS
// ==============================


function sincronizarUsuarioAlumno(usuario) {

    /*
     * La identidad real viene de la API.
     *
     * usuario.id corresponde a usuarios.id.
     * usuario.alumno_id corresponde a alumnos.id.
     */

    const usuarioId = Number(usuario.id);
    const alumnoId = Number(usuario.alumno_id);

    // Validar que ambos identificadores sean correctos.
    if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
        throw new Error(
            "La API no devolvió un ID de usuario válido."
        );
    }

    if (!Number.isInteger(alumnoId) || alumnoId <= 0) {
        throw new Error(
            "La API no devolvió un ID de alumno válido."
        );
    }

    // Compatibilidad temporal con las pantallas no integradas.
    const datosSimulados =
        window.DATOS_SIMULADOS?.usuarioActual;

    const usuarioNormalizado = {
        ...usuario,
        usuarioId,
        alumnoId,
        id: alumnoId,
        rol: "alumno"
    };

    // Conservar el perfil real recibido desde PHP.
    window.USUARIO_AUTENTICADO = usuario;

    // Identidad normalizada para los módulos del alumno.
    window.ALUMNO_ACTUAL = usuarioNormalizado;

    /*
     * Los módulos todavía no integrados pueden seguir
     * utilizando DATOS_SIMULADOS durante la etapa 5.
     *
     * La identidad siempre proviene de la API.
     */
    if (window.DATOS_SIMULADOS) {

        const mismaCuenta =
            datosSimulados &&
            Number(datosSimulados.usuarioId) === usuarioId;

        window.DATOS_SIMULADOS.usuarioActual = {
            ...(mismaCuenta ? datosSimulados : {}),
            ...usuarioNormalizado
        };
    }
}

function obtenerUsuarioActual() {

    // Se utiliza la identidad validada por PHP.
    // Nunca se autentica al usuario con localStorage.
    return window.ALUMNO_ACTUAL ||
        window.USUARIO_AUTENTICADO ||
        null;
}


// ==============================
// NAVBAR
// ==============================

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

    const textoUsuario = nombreCompleto || "Alumno";

    // Conservar el icono existente.
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
// CONFIGURAR LOGOUT
// ==============================

function configurarLogout() {

    const botonesLogout = document.querySelectorAll(
        "#btn-logout, #btn-cerrar-sesion"
    );

    botonesLogout.forEach((boton) => {

        // Evitar registrar el mismo evento dos veces.
        if (boton.dataset.logoutConfigurado === "true") {
            return;
        }

        boton.dataset.logoutConfigurado = "true";

        boton.addEventListener("click", cerrarSesion);
    });
}


// ==============================
// CERRAR SESIÓN REAL
// ==============================

async function cerrarSesion(evento) {

    evento?.preventDefault();

    const confirmarSalida = window.confirm(
        "¿Deseás cerrar sesión?"
    );

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

        const response = await fetch(
            `${ALUMNO_API_URL}/logout`,
            {
                method: "POST",
                credentials: "include",
                headers: {
                    Accept: "application/json"
                }
            }
        );

        if (!response.ok) {
            throw new Error(
                `POST /logout devolvió HTTP ${response.status}`
            );
        }

        /*
         * Se borran solamente los datos antiguos de sesión.
         * No eliminamos los demás registros simulados.
         */
        localStorage.removeItem("usuarioActual");
        localStorage.removeItem("sesionActiva");

        window.USUARIO_AUTENTICADO = null;
        window.ALUMNO_ACTUAL = null;

        redirigirAlLogin();

    } catch (error) {

        console.error(
            "No se pudo cerrar sesión:",
            error
        );

        alert(
            "No se pudo cerrar sesión. Comprobá la conexión e intentá otra vez."
        );

        botones.forEach((boton) => {
            boton.disabled = false;
        });
    }
}
