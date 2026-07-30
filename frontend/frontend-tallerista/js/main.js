document.addEventListener("DOMContentLoaded", inicializarAplicacion);

function inicializarAplicacion() {
    mostrarUsuarioEnNavbar();
    configurarLogout();
    inicializarPaginaActual();
}

function obtenerPaginaActual() {

    const paginaDefinida = document.body.dataset.page;

    if (paginaDefinida) {
        return paginaDefinida;
    }

    /*
        Si el HTML todavía no tiene data-page, obtiene la página desde la URL
        Ejemplo:
        mis-talleres.html -> mis-talleres
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
        Cada página tiene asociada una función de inicialización.
        Las funciones se crearán dentro de los archivos JavaScript específicos de cada sección.
    */
    const inicializadores = {
        "dashboard": "inicializarDashboard",
        "perfil": "inicializarPerfil",
        "mis-talleres": "inicializarMisTalleres",
        "detalle-taller": "inicializarDetalleTaller",
        "asistencia": "inicializarAsistencia",
        "informes": "inicializarInformes",
        "detalle-informe": "inicializarDetalleInforme",
    };

    const nombreFuncion = inicializadores[paginaActual];

    const funcionInicializadora = window[nombreFuncion];

    /*
        Solo ejecuta la función si ya existe.
        Esto evita errores mientras los demás archivos JavaScript todavía están vacíos.
    */

    if (typeof funcionInicializadora === "function") {
        funcionInicializadora();
    }
}

// USUARIO

function obtenerUsuarioActual() {
    const usuarioPredeterminado =
        window.DATOS_SIMULADOS?.usuarioActual || {
            nombre: "Tallerista",
            apellido: "",
            rol: "Tallerista"
        };

    const usuarioGuardado = localStorage.getItem(
        "usuarioActual"
    );

    if (!usuarioGuardado) {
        return usuarioPredeterminado;
    }

    try {
        const datosGuardados = JSON.parse(
            usuarioGuardado
        );

        /*
            Combinamos los datos originales con los datos modificados en el perfil.
            Así no se pierden propiedades como el ID, el rol o la fecha de registro.
        */

        const usuarioActual = {
            ...usuarioPredeterminado,
            ...datosGuardados
        };

        // Sincronizamos mock-data.js para que los demás archivos utilicen también el usuario actualizado

        if (window.DATOS_SIMULADOS) {
            window.DATOS_SIMULADOS.usuarioActual =
                usuarioActual;
        }

        return usuarioActual;

    } catch (error) {
        console.error(
            "No se pudo leer el usuario guardado:",
            error
        );

        return usuarioPredeterminado;
    }
}


function mostrarUsuarioEnNavbar() {

    const elementoUsuario =
        document.getElementById("nombre-usuario");

    if (!elementoUsuario) {
        return;
    }

    const usuario = obtenerUsuarioActual();

    const nombreCompleto = [
        usuario.nombre,
        usuario.apellido
    ]
        .filter(Boolean)
        .join(" ");

    const textoUsuario =
        nombreCompleto || "Tallerista";

    // Algunas páginas tienen un ícono dentro del elemento nombre-usuario. Lo conservamos para no eliminarlo al cambiar el texto

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

// CIERRE DE SESIÓN

function configurarLogout() {

    const botonesLogout = document.querySelectorAll(
        "#btn-logout, #btn-cerrar-sesion"
    );

    botonesLogout.forEach((boton) => {
        boton.addEventListener("click", cerrarSesion);
    });
}

function cerrarSesion() {

    const confirmarSalida = confirm(
        "¿Desea cerrar sesión?"
    );

    if (!confirmarSalida) {
        return;
    }

    /*
        Eliminamos solamente la información relacionada con la sesión.
        No utilizamos localStorage.clear(), porque eso también borraría otros datos de la aplicación.
    */

    localStorage.removeItem("usuarioActual");
    localStorage.removeItem("sesionActiva");

    window.location.href = "../../index.html";
}