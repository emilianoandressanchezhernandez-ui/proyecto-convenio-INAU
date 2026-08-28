/*
    MAIN.JS - FRONTEND ADMIN
    Archivo comun a todas las paginas del panel administrador.
    Se encarga de: mostrar el usuario en el navbar, manejar el logout,
    y disparar la funcion de inicializacion propia de cada pantalla.
*/

document.addEventListener("DOMContentLoaded", inicializarAplicacion);

function inicializarAplicacion() {
    mostrarUsuarioEnNavbar();
    configurarLogout();
    inicializarPaginaActual();
}


// ==============================
// DETECCION DE PAGINA Y ENRUTADO
// ==============================

function obtenerPaginaActual() {

    const paginaDefinida = document.body.dataset.page;

    if (paginaDefinida) {
        return paginaDefinida;
    }

    /*
        Si el HTML no tiene data-page, se deduce el nombre de la pagina
        a partir del archivo actual en la URL.
        Ejemplo: talleristas.html -> talleristas
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
        Cada pagina de admin tiene asociada una funcion de inicializacion.
        Esas funciones se van a definir dentro del archivo JS especifico
        de cada pantalla (talleristas.js, alumnos.js, etc).
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
        "perfil": "inicializarPerfil",
    };

    const nombreFuncion = inicializadores[paginaActual];
    const funcionInicializadora = window[nombreFuncion];

    /*
        Solo ejecuta la funcion si ya existe.
        Esto evita errores mientras el resto de los archivos JS
        todavia estan vacios (se van a ir completando de a uno).
    */

    if (typeof funcionInicializadora === "function") {
        funcionInicializadora();
    }
}


// ==============================
// USUARIO
// ==============================

function obtenerUsuarioActual() {

    const usuarioPredeterminado =
        window.DATOS_SIMULADOS?.usuarioActual || {
            nombre: "Administrador",
            apellido: "",
            rol: "Administrador"
        };

    const usuarioGuardado = localStorage.getItem("usuarioActual");

    if (!usuarioGuardado) {
        return usuarioPredeterminado;
    }

    try {
        const datosGuardados = JSON.parse(usuarioGuardado);

        /*
            Se combinan los datos originales con los datos guardados
            (por ejemplo, si el admin edito su correo o telefono en perfil.js).
            Asi no se pierden propiedades como el id o la fecha de registro.
        */

        const usuarioActual = {
            ...usuarioPredeterminado,
            ...datosGuardados
        };

        // Se sincroniza mock-data.js para que el resto de los archivos
        // usen tambien el usuario ya actualizado.

        if (window.DATOS_SIMULADOS) {
            window.DATOS_SIMULADOS.usuarioActual = usuarioActual;
        }

        return usuarioActual;

    } catch (error) {
        console.error("No se pudo leer el usuario guardado:", error);
        return usuarioPredeterminado;
    }
}

function mostrarUsuarioEnNavbar() {

    const elementoUsuario = document.getElementById("nombre-usuario");

    if (!elementoUsuario) {
        return;
    }

    const usuario = obtenerUsuarioActual();

    const nombreCompleto = [usuario.nombre, usuario.apellido]
        .filter(Boolean)
        .join(" ");

    const textoUsuario = nombreCompleto || "Administrador";

    // Algunas paginas tienen un icono dentro del elemento nombre-usuario.
    // Se conserva para no perderlo al cambiar el texto.

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
// CIERRE DE SESION
// ==============================

function configurarLogout() {

    const botonesLogout = document.querySelectorAll(
        "#btn-logout, #btn-cerrar-sesion"
    );

    botonesLogout.forEach((boton) => {
        boton.addEventListener("click", cerrarSesion);
    });
}

function cerrarSesion() {

    const confirmarSalida = confirm("¿Desea cerrar sesión?");

    if (!confirmarSalida) {
        return;
    }

    /*
        Se elimina solamente la informacion de sesion.
        No se usa localStorage.clear() porque eso borraria
        tambien otros datos de la aplicacion (altas, ediciones, etc).
    */

    localStorage.removeItem("usuarioActual");
    localStorage.removeItem("sesionActiva");

    window.location.href = "../../index.html";
}