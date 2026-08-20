/*
    PERFIL.JS - FRONTEND ADMIN
    Responsabilidades:
    - Mostrar los datos del administrador logueado.
    - Permitir editar correo y telefono (nombre y cedula quedan protegidos,
      mismo criterio que ya usa el perfil de tallerista).
    - Permitir cambiar la contraseña (simulado, no se persiste la clave real).
*/

let enEdicion = false;

function inicializarPerfil() {
    try {
        validarDatosSimulados();

        const usuario = obtenerUsuarioActual();
        mostrarDatosPerfil(usuario);

        configurarEdicion();
        configurarCambioPassword();

    } catch (error) {
        console.error("Error al cargar el perfil:", error);
        mostrarAlerta("alerta-perfil", error.message, "danger");
    }
}


// ==============================
// VALIDACION
// ==============================

function validarDatosSimulados() {

    if (!window.DATOS_SIMULADOS) {
        throw new Error("No se pudieron cargar los datos simulados.");
    }

    if (!window.DATOS_SIMULADOS.usuarioActual) {
        throw new Error("No se encontró el usuario actual.");
    }
}


// ==============================
// MOSTRAR DATOS
// ==============================

function mostrarDatosPerfil(usuario) {

    const nombreCompleto = `${usuario.nombre} ${usuario.apellido}`;

    colocarTexto("nombre-completo", nombreCompleto);
    colocarTexto("perfil-nombre", nombreCompleto);
    colocarTexto("perfil-cedula", usuario.cedula);
    colocarTexto("perfil-correo", usuario.correo);
    colocarTexto("perfil-telefono", usuario.telefono);
    colocarTexto("perfil-rol", usuario.rol || "Administrador");
    colocarTexto("perfil-registro", formatearFecha(usuario.fechaRegistro));
}


// ==============================
// EDITAR (solo correo y telefono)
// ==============================

function configurarEdicion() {

    const boton = document.getElementById("btn-editar-perfil");

    if (boton) {
        boton.addEventListener("click", alternarEdicion);
    }
}

function alternarEdicion() {

    if (enEdicion) {
        guardarEdicionPerfil();
        return;
    }

    entrarModoEdicion();
}

function entrarModoEdicion() {

    const usuario = obtenerUsuarioActual();

    document.getElementById("perfil-correo").innerHTML =
        `<input type="email" id="input-correo" class="form-control" value="${escaparHTML(usuario.correo)}">`;

    document.getElementById("perfil-telefono").innerHTML =
        `<input type="text" id="input-telefono" class="form-control" value="${escaparHTML(usuario.telefono)}">`;

    const boton = document.getElementById("btn-editar-perfil");
    boton.innerHTML = `<i class="bi bi-check-circle-fill"></i> Guardar Cambios`;

    enEdicion = true;
}

function guardarEdicionPerfil() {

    const correo = document.getElementById("input-correo").value.trim();
    const telefono = document.getElementById("input-telefono").value.trim();

    const error = validarEdicionPerfil(correo, telefono);

    if (error) {
        mostrarAlerta("alerta-perfil", error, "danger");
        return;
    }

    const usuarioActualizado = {
        ...obtenerUsuarioActual(),
        correo,
        telefono
    };

    guardarDato("usuarioActual", usuarioActualizado);
    window.DATOS_SIMULADOS.usuarioActual = usuarioActualizado;

    mostrarDatosPerfil(usuarioActualizado);
    mostrarUsuarioEnNavbar();

    const boton = document.getElementById("btn-editar-perfil");
    boton.innerHTML = `<i class="bi bi-pencil-fill"></i> Editar Perfil`;

    enEdicion = false;

    ocultarAlerta("alerta-perfil");
    mostrarAlerta("alerta-perfil", "Los datos del perfil se guardaron correctamente.", "success");
}

function validarEdicionPerfil(correo, telefono) {

    if (!correo || !telefono) {
        return "Debés completar el correo y el teléfono.";
    }

    const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);

    if (!correoValido) {
        return "El correo electrónico no tiene un formato válido.";
    }

    return null;
}


// ==============================
// CAMBIO DE CONTRASEÑA (simulado)
// ==============================

function configurarCambioPassword() {

    const boton = document.getElementById("btn-guardar-password");

    if (boton) {
        boton.addEventListener("click", guardarCambioPassword);
    }
}

function guardarCambioPassword() {

    const actual = document.getElementById("password-actual").value;
    const nueva = document.getElementById("password-nueva").value;
    const confirmar = document.getElementById("password-confirmar").value;

    const error = validarCambioPassword(actual, nueva, confirmar);

    if (error) {
        mostrarAlerta("alerta-perfil", error, "danger");
        return;
    }

    // No se persiste la contraseña en ningun lado: cuando exista backend,
    // este cambio se va a enviar de forma segura y se va a guardar con
    // hash del lado del servidor, no en el navegador.

    document.getElementById("password-actual").value = "";
    document.getElementById("password-nueva").value = "";
    document.getElementById("password-confirmar").value = "";

    mostrarAlerta(
        "alerta-perfil",
        "La contraseña se actualizó correctamente (simulado).",
        "success"
    );
}

function validarCambioPassword(actual, nueva, confirmar) {

    if (!actual || !nueva || !confirmar) {
        return "Debés completar los 3 campos de contraseña.";
    }

    if (nueva.length < 8) {
        return "La nueva contraseña debe tener al menos 8 caracteres.";
    }

    if (nueva !== confirmar) {
        return "Las contraseñas no coinciden.";
    }

    return null;
}