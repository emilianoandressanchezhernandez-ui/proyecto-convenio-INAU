"use strict";

/*
    PERFIL.JS

    Responsabilidades:

    - Cargar los datos del usuario actual.
    - Mostrar la información en el formulario.
    - Validar los cambios.
    - Guardar los datos temporalmente en localStorage.
    - Actualizar la tarjeta y la navbar.
*/


/* =========================
   VARIABLE PRINCIPAL
========================= */

let usuarioPerfilActual = null;


/* =========================
   INICIALIZACIÓN
========================= */

function inicializarPerfil() {
    try {
        validarDatosPerfil();

        usuarioPerfilActual =
            obtenerUsuarioParaPerfil();

        mostrarDatosPerfil(
            usuarioPerfilActual
        );

        configurarFormularioPerfil();

    } catch (error) {
        console.error(
            "Error al inicializar el perfil:",
            error
        );

        mostrarAlertaPerfil(
            "No se pudieron cargar los datos del perfil.",
            "danger"
        );

        deshabilitarFormularioPerfil();
    }
}


/* =========================
   VALIDACIÓN INICIAL
========================= */

function validarDatosPerfil() {
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
}


/* =========================
   OBTENER USUARIO
========================= */

function obtenerUsuarioParaPerfil() {
    /*
        Utilizamos la función de main.js para obtener
        el usuario guardado o el usuario simulado.
    */

    if (typeof obtenerUsuarioActual === "function") {
        return obtenerUsuarioActual();
    }

    return window.DATOS_SIMULADOS.usuarioActual;
}


/* =========================
   MOSTRAR DATOS
========================= */

function mostrarDatosPerfil(usuario) {
    colocarValorInput(
        "nombre",
        usuario.nombre
    );

    colocarValorInput(
        "apellido",
        usuario.apellido
    );

    colocarValorInput(
        "cedula",
        usuario.cedula
    );

    colocarValorInput(
        "correo",
        usuario.correo
    );

    colocarValorInput(
        "telefono",
        usuario.telefono
    );

    colocarTextoPerfil(
        "perfil-nombre",
        obtenerNombreCompletoPerfil(usuario)
    );

    colocarTextoPerfil(
        "perfil-rol",
        usuario.rol || "Tallerista"
    );

    colocarTextoPerfil(
        "usuario-id",
        usuario.id ?? "--"
    );

    colocarTextoPerfil(
        "fecha-registro",
        formatearFechaPerfil(
            usuario.fechaRegistro
        )
    );

    colocarTextoPerfil(
        "ultimo-acceso",
        formatearFechaHoraPerfil(
            usuario.ultimoAcceso
        )
    );
}


/* =========================
   FORMULARIO
========================= */

function configurarFormularioPerfil() {
    const formulario = document.getElementById(
        "form-perfil"
    );

    if (!formulario) {
        throw new Error(
            "No se encontró el formulario del perfil."
        );
    }

    formulario.addEventListener(
        "submit",
        guardarCambiosPerfil
    );
}


function guardarCambiosPerfil(event) {
    /*
        Evita que el formulario recargue la página.
    */

    event.preventDefault();

    ocultarAlertaPerfil();

    const datosFormulario =
        obtenerDatosFormularioPerfil();

    const errorValidacion =
        validarFormularioPerfil(
            datosFormulario
        );

    if (errorValidacion) {
        mostrarAlertaPerfil(
            errorValidacion,
            "warning"
        );

        return;
    }

    /*
        Conservamos las propiedades que el usuario
        no puede modificar, como ID, rol y fechas.
    */

    const usuarioActualizado = {
        ...usuarioPerfilActual,

        nombre: datosFormulario.nombre,
        apellido: datosFormulario.apellido,
        cedula: datosFormulario.cedula,
        correo: datosFormulario.correo,
        telefono: datosFormulario.telefono
    };

    localStorage.setItem(
        "usuarioActual",
        JSON.stringify(usuarioActualizado)
    );

    /*
        Sincronizamos los datos actuales para que los cambios
        se vean sin tener que recargar la página.
    */

    usuarioPerfilActual =
        usuarioActualizado;

    window.DATOS_SIMULADOS.usuarioActual =
        usuarioActualizado;

    actualizarDatosVisibles(
        usuarioActualizado
    );

    limpiarCamposContrasena();

    mostrarAlertaPerfil(
        obtenerMensajeGuardado(
            datosFormulario.password
        ),
        "success"
    );
}


/* =========================
   LEER FORMULARIO
========================= */

function obtenerDatosFormularioPerfil() {
    return {
        correo: obtenerValorInput("correo"),
        telefono: obtenerValorInput("telefono"),
        password: obtenerValorInput("password"),
        confirmarPassword:
            obtenerValorInput("confirmar-password")
    };
}


/* =========================
   VALIDACIONES
========================= */

function validarFormularioPerfil(datos) {
    if (
        !datos.correo ||
        !datos.telefono
    ) {
        return "Debes completar el correo y el teléfono.";
    }

    if (!validarCorreoPerfil(datos.correo)) {
        return "El correo electrónico no tiene un formato válido.";
    }

    if (!validarTelefonoPerfil(datos.telefono)) {
        return "El teléfono ingresado no tiene un formato válido.";
    }

    const escribioPassword =
        datos.password !== "";

    const escribioConfirmacion =
        datos.confirmarPassword !== "";

    if (
        escribioPassword ||
        escribioConfirmacion
    ) {
        if (
            !escribioPassword ||
            !escribioConfirmacion
        ) {
            return "Debes completar ambos campos de contraseña.";
        }

        if (datos.password.length < 8) {
            return "La nueva contraseña debe tener al menos 8 caracteres.";
        }

        if (
            datos.password !==
            datos.confirmarPassword
        ) {
            return "Las contraseñas no coinciden.";
        }
    }

    return null;
}

function validarCorreoPerfil(correo) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        correo
    );
}


function validarTelefonoPerfil(telefono) {
    /*
        Elimina espacios, guiones, paréntesis y el signo +.
    */

    const telefonoLimpio = telefono.replace(
        /[\s\-()+]/g,
        ""
    );

    return /^\d{8,15}$/.test(
        telefonoLimpio
    );
}


/* =========================
   ACTUALIZACIÓN VISUAL
========================= */

function actualizarDatosVisibles(usuario) {
    colocarTextoPerfil(
        "perfil-nombre",
        obtenerNombreCompletoPerfil(usuario)
    );

    colocarTextoPerfil(
        "perfil-rol",
        usuario.rol || "Tallerista"
    );

    /*
        Actualizamos también el nombre que aparece
        en la navbar.
    */

    const elementoNavbar = document.getElementById(
        "nombre-usuario"
    );

    if (elementoNavbar) {
        const nombreCompleto =
            obtenerNombreCompletoPerfil(usuario);

        const icono = elementoNavbar.querySelector("i");

        if (icono) {
            elementoNavbar.replaceChildren();

            elementoNavbar.append(
                icono,
                document.createTextNode(
                    ` ${nombreCompleto}`
                )
            );
        } else {
            elementoNavbar.textContent =
                nombreCompleto;
        }
    }
}


/* =========================
   CONTRASEÑA
========================= */

function limpiarCamposContrasena() {
    colocarValorInput(
        "password",
        ""
    );

    colocarValorInput(
        "confirmar-password",
        ""
    );
}


function obtenerMensajeGuardado(password) {
    if (password) {
        /*
            No guardamos contraseñas en localStorage.

            En la etapa del backend, PHP se encargará
            de enviarla de forma segura y almacenarla
            mediante hash.
        */

        return "Los datos se guardaron correctamente. El cambio de contraseña quedó simulado para la futura conexión con el backend.";
    }

    return "Los datos del perfil se guardaron correctamente.";
}


/* =========================
   FORMATO
========================= */

function obtenerNombreCompletoPerfil(usuario) {
    return [
        usuario.nombre,
        usuario.apellido
    ]
        .filter(Boolean)
        .join(" ") || "Tallerista";
}


function formatearFechaPerfil(fechaISO) {
    if (!fechaISO) {
        return "Sin información";
    }

    const partes = fechaISO.split("-");

    if (partes.length !== 3) {
        return fechaISO;
    }

    const [anio, mes, dia] = partes;

    return `${dia}/${mes}/${anio}`;
}


function formatearFechaHoraPerfil(valorFecha) {
    if (!valorFecha) {
        return "Sin información";
    }

    /*
        También permite mostrar el formato utilizado
        inicialmente en mock-data.js:

        2026-07-17 14:30
    */

    const fechaNormalizada = valorFecha.includes(" ")
        ? valorFecha.replace(" ", "T")
        : valorFecha;

    const fecha = new Date(
        fechaNormalizada
    );

    if (Number.isNaN(fecha.getTime())) {
        return valorFecha;
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


/* =========================
   FUNCIONES AUXILIARES
========================= */

function obtenerValorInput(elementoId) {
    const elemento = document.getElementById(
        elementoId
    );

    return elemento
        ? elemento.value.trim()
        : "";
}


function colocarValorInput(
    elementoId,
    contenido
) {
    const elemento = document.getElementById(
        elementoId
    );

    if (!elemento) {
        return;
    }

    elemento.value = contenido ?? "";
}


function colocarTextoPerfil(
    elementoId,
    contenido
) {
    const elemento = document.getElementById(
        elementoId
    );

    if (!elemento) {
        return;
    }

    elemento.textContent =
        contenido ?? "--";
}


/* =========================
   ALERTAS
========================= */

function mostrarAlertaPerfil(
    mensaje,
    tipo = "danger"
) {
    const alerta = document.getElementById(
        "alerta-perfil"
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


function ocultarAlertaPerfil() {
    const alerta = document.getElementById(
        "alerta-perfil"
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


function deshabilitarFormularioPerfil() {
    const formulario = document.getElementById(
        "form-perfil"
    );

    if (!formulario) {
        return;
    }

    const campos = formulario.querySelectorAll(
        "input, button"
    );

    campos.forEach((campo) => {
        campo.disabled = true;
    });
}