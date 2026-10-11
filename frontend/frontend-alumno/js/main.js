
/*
    MAIN.JS - FRONTEND ALUMNO

    Archivo común a todas las páginas del panel del alumno.
    Se encarga de:
    - Mostrar el nombre del alumno en la barra de navegación.
    - Configurar el cierre de sesión.
    - Detectar la página actual e invocar su inicializador.

    Los datos siguen siendo simulados. La autenticación y la integración
    completa con la API deben resolverse cuando se conecte el backend.
*/

"use strict";

// Espera a que el HTML esté cargado antes de buscar elementos o inicializar
// la pantalla específica.
document.addEventListener("DOMContentLoaded", inicializarAplicacion);

function inicializarAplicacion() {
    mostrarUsuarioEnNavbar();
    configurarLogout();
    inicializarPaginaActual();
}


// ==============================
// DETECCIÓN E INICIALIZACIÓN DE LA PÁGINA
// ==============================

function obtenerPaginaActual() {
    // Es preferible usar data-page porque no depende del nombre del archivo.
    const paginaDefinida = document.body?.dataset?.page;

    if (paginaDefinida) {
        return paginaDefinida;
    }

    // Alternativa por si en el futuro una página no incluye data-page.
    const archivoActual = window.location.pathname.split("/").pop();

    if (!archivoActual) {
        return "dashboard";
    }

    return archivoActual.replace(/\.html$/i, "") || "dashboard";
}

function inicializarPaginaActual() {
    const paginaActual = obtenerPaginaActual();

    // Estos nombres deben coincidir con las funciones que se definirán en
    // cada archivo específico (dashboard.js, tareas.js, perfil.js, etc.).
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

    // Durante el desarrollo puede que aún falte un archivo de página.
    // Verificamos que exista la función antes de llamarla para evitar errores.
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
// USUARIO ACTUAL
// ==============================

function obtenerUsuarioActual() {
    const usuarioPredeterminado = window.DATOS_SIMULADOS?.usuarioActual || {
        id: null,
        usuarioId: null,
        nombre: "Alumno",
        apellido: "",
        rol: "Alumno"
    };

    // utils.js proporciona obtenerDato(). Se usa como lectura centralizada
    // para no repetir el manejo de JSON/localStorage en todo el panel.
    const datosGuardados = typeof obtenerDato === "function"
        ? obtenerDato("usuarioActual")
        : null;

    if (
        !datosGuardados ||
        typeof datosGuardados !== "object" ||
        Array.isArray(datosGuardados)
    ) {
        return usuarioPredeterminado;
    }

    // Conservamos los campos predeterminados que no estén en la sesión
    // guardada (por ejemplo, fecha de ingreso o referente adulto).
    const usuarioActual = {
        ...usuarioPredeterminado,
        ...datosGuardados
    };

    /*
        El modelo SQL distingue:
        - usuarios.id: identificador de la cuenta.
        - alumnos.id: identificador de la ficha del alumno.

        En los datos de demostración, Sofía tiene alumnos.id = 1 y
        usuarios.id = 4. Si la sesión guardada contiene solamente id = 4,
        evitamos reemplazar accidentalmente el ID de alumno por el ID
        de usuario.

        Si la sesión ya trae alumnoId, lo usamos como ID de la ficha.
    */
    if (
        datosGuardados.alumnoId !== undefined &&
        datosGuardados.alumnoId !== null
    ) {
        usuarioActual.id = Number(datosGuardados.alumnoId);
    } else if (
        usuarioPredeterminado.usuarioId !== undefined &&
        usuarioPredeterminado.usuarioId !== null &&
        datosGuardados.id !== undefined &&
        Number(datosGuardados.id) === Number(usuarioPredeterminado.usuarioId) &&
        datosGuardados.usuarioId === undefined
    ) {
        usuarioActual.id = usuarioPredeterminado.id;
        usuarioActual.usuarioId = Number(datosGuardados.id);
    }

    // Sincroniza los datos en memoria para que los módulos de página usen
    // la misma información que se muestra en la barra de navegación.
    if (window.DATOS_SIMULADOS) {
        window.DATOS_SIMULADOS.usuarioActual = usuarioActual;
    }

    return usuarioActual;
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

    const textoUsuario = nombreCompleto || "Alumno";

    // Conserva el ícono de Bootstrap Icons si el enlace/span lo contiene.
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
        // Evita agregar el mismo listener si la configuración se ejecuta
        // más de una vez.
        if (boton.dataset.logoutConfigurado === "true") {
            return;
        }

        boton.dataset.logoutConfigurado = "true";
        boton.addEventListener("click", cerrarSesion);
    });
}

function cerrarSesion() {
    const confirmarSalida = window.confirm("¿Deseás cerrar sesión?");

    if (!confirmarSalida) {
        return;
    }

    // Eliminamos solo los datos de autenticación conocidos. No usamos
    // localStorage.clear(), porque borraría también los datos simulados
    // y los cambios guardados en otras pantallas del panel.
    try {
        localStorage.removeItem("usuarioActual");
        localStorage.removeItem("sesionActiva");
    } catch (error) {
        console.error(
            "No se pudo limpiar la sesión del navegador:",
            error
        );
    }

    // Desde frontend/frontend-alumno/ subimos dos niveles para volver al login.
    window.location.href = "../../index.html";
}
