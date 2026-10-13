
/*
    PERFIL.JS - FRONTEND ALUMNO

    Responsabilidades:
    - Mostrar los datos del perfil del alumno.
    - Permitir actualizar el correo, teléfono y biografía en modo de prueba.
    - Permitir previsualizar y quitar una foto de perfil.
    - Validar los campos y la confirmación de contraseña.

    IMPORTANTE:
    - Los cambios se guardan en localStorage, no en la base de datos.
    - La API actual permite actualizar correo y teléfono mediante PATCH /perfil.
    - La biografía, la foto y el cambio de contraseña aún no tienen persistencia
      implementada en el backend. La contraseña nunca se guarda en el navegador.
*/

"use strict";

const MAX_TAMANO_FOTO_PERFIL = 2 * 1024 * 1024; // 2 MB
const TIPOS_FOTO_PERFIL_PERMITIDOS = ["image/jpeg", "image/png"];

let usuarioPerfilActual = null;


// ==============================
// INICIALIZACIÓN
// ==============================

function inicializarPerfil() {
    try {
        validarDatosPerfil();

        usuarioPerfilActual = obtenerUsuarioPerfil();
        mostrarDatosPerfil(usuarioPerfilActual);
        configurarFormularioPerfil();
        configurarFotoPerfil();
        configurarBiografiaPerfil();

    } catch (error) {
        console.error("Error al inicializar el perfil del alumno:", error);
        mostrarAlertaPerfil(
            "No se pudieron cargar los datos del perfil. Recargá la página e intentá nuevamente.",
            "danger"
        );
        deshabilitarFormularioPerfil();
    }
}

function validarDatosPerfil() {
    if (!window.DATOS_SIMULADOS || typeof window.DATOS_SIMULADOS !== "object") {
        throw new Error("No se encontraron los datos simulados.");
    }

    if (!window.DATOS_SIMULADOS.usuarioActual || typeof window.DATOS_SIMULADOS.usuarioActual !== "object") {
        throw new Error("No se encontró el alumno actual.");
    }
}

function obtenerUsuarioPerfil() {
    if (typeof obtenerUsuarioActual === "function") {
        return obtenerUsuarioActual();
    }

    return window.DATOS_SIMULADOS.usuarioActual;
}


// ==============================
// MOSTRAR LOS DATOS
// ==============================

function mostrarDatosPerfil(usuario) {
    colocarValorPerfil("nombre", usuario.nombre);
    colocarValorPerfil("apellido", usuario.apellido);
    colocarValorPerfil("cedula", usuario.cedula);
    colocarValorPerfil("fecha-nacimiento", formatearFechaPerfil(usuario.fechaNacimiento));
    colocarValorPerfil("correo", usuario.correo);
    colocarValorPerfil("telefono", usuario.telefono);
    colocarValorPerfil("referente-adulto", usuario.referenteAdulto);
    colocarValorPerfil("centro-referencia", usuario.centroReferencia);
    colocarValorPerfil("biografia", usuario.biografia || "");

    const nombreCompleto = [usuario.nombre, usuario.apellido].filter(Boolean).join(" ");
    colocarTextoPerfil("perfil-nombre", nombreCompleto || "Alumno");
    colocarTextoPerfil("perfil-rol", usuario.rol || "Alumno");

    // En la muestra, id representa la ficha de alumnos. usuarioId es el ID
    // separado de la cuenta de acceso, de acuerdo al modelo SQL del proyecto.
    colocarTextoPerfil("usuario-id", usuario.id ?? "--");
    colocarTextoPerfil(
        "fecha-ingreso",
        formatearFechaPerfil(usuario.fechaIngreso || usuario.fechaRegistro)
    );
    colocarTextoPerfil("ultimo-acceso", formatearFechaHoraPerfil(usuario.ultimoAcceso));

    mostrarFotoPerfil(usuario.fotoPerfil);
    document.title = `INAU - Mi Perfil${nombreCompleto ? ` - ${nombreCompleto}` : ""}`;
}

function formatearFechaPerfil(fechaISO) {
    if (!fechaISO) return "Sin información";

    if (typeof formatearFecha === "function") {
        const fecha = formatearFecha(fechaISO);
        return fecha === "-" ? "Sin información" : fecha;
    }

    const coincidencia = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(fechaISO));
    return coincidencia
        ? `${coincidencia[3]}/${coincidencia[2]}/${coincidencia[1]}`
        : "Sin información";
}

function formatearFechaHoraPerfil(valorFecha) {
    if (!valorFecha) return "Sin información";

    if (typeof formatearFechaHora === "function") {
        const fecha = formatearFechaHora(valorFecha);
        return fecha === "-" ? "Sin información" : fecha;
    }

    const texto = String(valorFecha).replace("T", " ");
    const partes = texto.split(" ");
    const fecha = formatearFechaPerfil(partes[0]);
    return partes[1] ? `${fecha} ${partes[1].slice(0, 5)}` : fecha;
}


// ==============================
// GUARDAR CONTACTO Y BIOGRAFÍA
// ==============================

function configurarFormularioPerfil() {
    const formulario = document.getElementById("form-perfil");
    if (!formulario) throw new Error("No se encontró el formulario del perfil.");

    if (formulario.dataset.perfilConfigurado === "true") return;

    formulario.dataset.perfilConfigurado = "true";
    formulario.addEventListener("submit", guardarCambiosPerfil);
}

function guardarCambiosPerfil(evento) {
    evento.preventDefault();
    ocultarAlertaPerfil();

    const correo = obtenerValorPerfil("correo");
    const telefono = obtenerValorPerfil("telefono");
    const biografia = obtenerValorPerfil("biografia");
    const password = obtenerValorPerfil("password", false);
    const confirmarPassword = obtenerValorPerfil("confirmar-password", false);

    const error = validarDatosFormularioPerfil({
        correo,
        telefono,
        biografia,
        password,
        confirmarPassword
    });

    if (error) {
        mostrarAlertaPerfil(error, "warning");
        return;
    }

    const usuarioActualizado = {
        ...usuarioPerfilActual,
        correo,
        telefono,
        biografia
    };

    if (!guardarUsuarioPerfil(usuarioActualizado)) {
        mostrarAlertaPerfil(
            "No se pudieron guardar los cambios en este navegador. Revisá el espacio disponible e intentá nuevamente.",
            "danger"
        );
        return;
    }

    usuarioPerfilActual = usuarioActualizado;
    limpiarCamposContrasenaPerfil();
    mostrarDatosPerfil(usuarioPerfilActual);

    if (typeof mostrarUsuarioEnNavbar === "function") {
        mostrarUsuarioEnNavbar();
    }

    if (password || confirmarPassword) {
        mostrarAlertaPerfil(
            "El correo, teléfono y biografía se guardaron en este navegador. El cambio de contraseña es solo una validación de prueba: no se modificó la contraseña real.",
            "warning"
        );
        return;
    }

    mostrarAlertaPerfil(
        "Los cambios del perfil se guardaron en este navegador (modo de prueba).",
        "success"
    );
}

function validarDatosFormularioPerfil(datos) {
    if (!datos.correo) {
        return "Debés completar el correo electrónico.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo)) {
        return "El correo electrónico no tiene un formato válido.";
    }

    if (!datos.telefono) {
        return "Debés completar el teléfono.";
    }

    if (!validarTelefonoPerfil(datos.telefono)) {
        return "El teléfono debe contener entre 8 y 15 dígitos. Podés usar espacios, guiones, paréntesis o el signo +.";
    }

    if (datos.biografia.length > 300) {
        return "La biografía no puede superar los 300 caracteres.";
    }

    const escribioPassword = datos.password !== "";
    const escribioConfirmacion = datos.confirmarPassword !== "";

    if (escribioPassword || escribioConfirmacion) {
        if (!escribioPassword || !escribioConfirmacion) {
            return "Para probar el cambio de contraseña, completá ambos campos.";
        }

        if (datos.password.length < 8) {
            return "La nueva contraseña debe tener al menos 8 caracteres.";
        }

        if (datos.password !== datos.confirmarPassword) {
            return "La contraseña y su confirmación no coinciden.";
        }
    }

    return null;
}

function validarTelefonoPerfil(telefono) {
    const limpio = String(telefono).replace(/[\s\-()+]/g, "");
    return /^\d{8,15}$/.test(limpio);
}

function guardarUsuarioPerfil(usuario) {
    let resultado;

    if (typeof guardarDato === "function") {
        resultado = guardarDato("usuarioActual", usuario);
    } else {
        try {
            localStorage.setItem("usuarioActual", JSON.stringify(usuario));
            resultado = true;
        } catch (error) {
            console.error("No se pudo guardar el perfil en localStorage:", error);
            resultado = false;
        }
    }

    if (resultado === false) return false;

    window.DATOS_SIMULADOS.usuarioActual = usuario;
    return true;
}

function limpiarCamposContrasenaPerfil() {
    colocarValorPerfil("password", "");
    colocarValorPerfil("confirmar-password", "");
}


// ==============================
// FOTO DE PERFIL
// ==============================

function configurarFotoPerfil() {
    const inputFoto = document.getElementById("input-foto-perfil");
    const botonEliminar = document.getElementById("btn-eliminar-foto");

    if (inputFoto && inputFoto.dataset.fotoConfigurada !== "true") {
        inputFoto.dataset.fotoConfigurada = "true";
        inputFoto.addEventListener("change", procesarFotoSeleccionadaPerfil);
    }

    if (botonEliminar && botonEliminar.dataset.fotoConfigurada !== "true") {
        botonEliminar.dataset.fotoConfigurada = "true";
        botonEliminar.addEventListener("click", eliminarFotoPerfil);
    }
}

function procesarFotoSeleccionadaPerfil(evento) {
    const input = evento.currentTarget;
    const archivo = input.files?.[0];

    if (!archivo) return;

    if (!TIPOS_FOTO_PERFIL_PERMITIDOS.includes(archivo.type)) {
        input.value = "";
        mostrarAlertaPerfil("La foto debe ser una imagen JPG o PNG.", "warning");
        return;
    }

    if (archivo.size <= 0 || archivo.size > MAX_TAMANO_FOTO_PERFIL) {
        input.value = "";
        mostrarAlertaPerfil("La foto debe pesar más de 0 bytes y no superar los 2 MB.", "warning");
        return;
    }

    const lector = new FileReader();

    lector.addEventListener("load", () => {
        if (typeof lector.result !== "string" || !lector.result.startsWith("data:image/")) {
            input.value = "";
            mostrarAlertaPerfil("No se pudo leer la imagen seleccionada.", "danger");
            return;
        }

        const usuarioActualizado = {
            ...usuarioPerfilActual,
            fotoPerfil: lector.result
        };

        if (!guardarUsuarioPerfil(usuarioActualizado)) {
            input.value = "";
            mostrarAlertaPerfil(
                "No se pudo guardar la foto en este navegador. Probá con una imagen más pequeña.",
                "danger"
            );
            return;
        }

        usuarioPerfilActual = usuarioActualizado;
        mostrarFotoPerfil(usuarioPerfilActual.fotoPerfil);
        mostrarAlertaPerfil(
            "La foto se guardó en este navegador (modo de prueba). Todavía no se subió al servidor.",
            "success"
        );
        input.value = "";
    });

    lector.addEventListener("error", () => {
        input.value = "";
        mostrarAlertaPerfil("No se pudo leer el archivo de imagen.", "danger");
    });

    lector.readAsDataURL(archivo);
}

function eliminarFotoPerfil() {
    if (!usuarioPerfilActual?.fotoPerfil) {
        mostrarFotoPerfil(null);
        mostrarAlertaPerfil("No hay una foto de perfil para quitar.", "info");
        return;
    }

    const usuarioActualizado = {
        ...usuarioPerfilActual,
        fotoPerfil: null
    };

    if (!guardarUsuarioPerfil(usuarioActualizado)) {
        mostrarAlertaPerfil("No se pudo quitar la foto guardada.", "danger");
        return;
    }

    usuarioPerfilActual = usuarioActualizado;
    mostrarFotoPerfil(null);
    mostrarAlertaPerfil("La foto se quitó de este navegador (modo de prueba).", "success");
}

function mostrarFotoPerfil(foto) {
    const contenedor = document.getElementById("logo-circle-perfil");
    if (!contenedor) return;

    contenedor.replaceChildren();

    if (typeof foto === "string" && foto.startsWith("data:image/")) {
        const imagen = document.createElement("img");
        imagen.src = foto;
        imagen.alt = "Foto de perfil del alumno";
        contenedor.appendChild(imagen);
        return;
    }

    const icono = document.createElement("i");
    icono.className = "bi bi-person-fill";
    icono.setAttribute("aria-hidden", "true");
    contenedor.appendChild(icono);
}


// ==============================
// BIOGRAFÍA
// ==============================

function configurarBiografiaPerfil() {
    const boton = document.getElementById("btn-eliminar-biografia");

    if (!boton || boton.dataset.biografiaConfigurada === "true") return;

    boton.dataset.biografiaConfigurada = "true";
    boton.addEventListener("click", eliminarBiografiaPerfil);
}

function eliminarBiografiaPerfil() {
    colocarValorPerfil("biografia", "");

    const usuarioActualizado = {
        ...usuarioPerfilActual,
        biografia: ""
    };

    if (!guardarUsuarioPerfil(usuarioActualizado)) {
        mostrarAlertaPerfil("No se pudo eliminar la biografía guardada.", "danger");
        return;
    }

    usuarioPerfilActual = usuarioActualizado;
    mostrarAlertaPerfil(
        "La biografía se eliminó de los datos guardados en este navegador (modo de prueba).",
        "success"
    );
}


// ==============================
// AUXILIARES DE FORMULARIO Y ALERTAS
// ==============================

function obtenerValorPerfil(elementoId, recortar = true) {
    const elemento = document.getElementById(elementoId);
    if (!elemento) return "";

    const valor = elemento.value ?? "";
    return recortar ? String(valor).trim() : String(valor);
}

function colocarValorPerfil(elementoId, valor) {
    const elemento = document.getElementById(elementoId);
    if (elemento) elemento.value = valor ?? "";
}

function colocarTextoPerfil(elementoId, valor) {
    const elemento = document.getElementById(elementoId);
    if (elemento) {
        elemento.textContent = valor === null || valor === undefined || valor === ""
            ? "Sin información"
            : String(valor);
    }
}

function mostrarAlertaPerfil(mensaje, tipo = "info") {
    const alerta = document.getElementById("alerta-perfil");
    if (!alerta) return;

    const tiposPermitidos = ["success", "danger", "warning", "info"];
    const tipoSeguro = tiposPermitidos.includes(tipo) ? tipo : "info";

    alerta.className = `alert alert-${tipoSeguro}`;
    alerta.setAttribute("role", "alert");
    alerta.textContent = mensaje;
    alerta.classList.remove("d-none");
}

function ocultarAlertaPerfil() {
    const alerta = document.getElementById("alerta-perfil");
    if (!alerta) return;

    alerta.textContent = "";
    alerta.classList.add("d-none");
    alerta.classList.remove("alert-success", "alert-danger", "alert-warning", "alert-info");
}

function deshabilitarFormularioPerfil() {
    const formulario = document.getElementById("form-perfil");
    if (!formulario) return;

    formulario.querySelectorAll("input, textarea, button").forEach((control) => {
        control.disabled = true;
    });

    const botonFoto = document.getElementById("btn-eliminar-foto");
    const inputFoto = document.getElementById("input-foto-perfil");
    const botonBiografia = document.getElementById("btn-eliminar-biografia");

    if (botonFoto) botonFoto.disabled = true;
    if (inputFoto) inputFoto.disabled = true;
    if (botonBiografia) botonBiografia.disabled = true;
}
