
/*
    PERFIL.JS - FRONTEND ALUMNO

    Integración con la API real.

    GET /perfil:
    - Datos personales del alumno autenticado.

    PATCH /perfil:
    - Actualización de correo y teléfono.

    La API todavía no permite guardar:
    - Fotografía de perfil.
    - Biografía.
    - Cambio de contraseña.

    No se utilizan datos simulados ni localStorage
    para leer o guardar el perfil.
*/

"use strict";

let usuarioPerfilActual = null;
let guardandoPerfil = false;


// ======================================
// INICIALIZACIÓN
// ======================================

async function inicializarPerfil() {
    try {
        prepararFuncionesNoDisponiblesPerfil();
        configurarFormularioPerfil();

        const resultado = await solicitarPerfilAlumno(
            "GET",
            "/perfil"
        );

        usuarioPerfilActual = resultado;

        if (typeof sincronizarUsuarioAlumno === "function") {
            sincronizarUsuarioAlumno(usuarioPerfilActual);
        }

        mostrarDatosPerfil(usuarioPerfilActual);
        ocultarAlertaPerfil();

    } catch (error) {
        console.error(
            "Error al cargar el perfil del alumno:",
            error
        );

        mostrarAlertaPerfil(
            error.message ||
            "No se pudo cargar la información del perfil.",
            "danger"
        );

        deshabilitarFormularioPerfil();
    }
}


// ======================================
// PETICIONES A LA API
// ======================================

async function solicitarPerfilAlumno(
    metodo,
    ruta,
    datos = null
) {
    const opciones = {
        method: metodo,
        credentials: "include",
        cache: "no-store",
        headers: {
            Accept: "application/json"
        }
    };

    if (datos !== null) {
        opciones.headers["Content-Type"] =
            "application/json";

        opciones.body = JSON.stringify(datos);
    }

    const respuesta = await fetch(
        `${ALUMNO_API_URL}${ruta}`,
        opciones
    );

    if (respuesta.status === 401) {
        if (typeof redirigirAlLogin === "function") {
            redirigirAlLogin();
        }

        throw new Error(
            "La sesión expiró. Iniciá sesión nuevamente."
        );
    }

    let resultado;

    try {
        resultado = await respuesta.json();
    } catch (error) {
        throw new Error(
            "El servidor no devolvió una respuesta JSON válida."
        );
    }

    if (!respuesta.ok || !resultado.ok) {
        throw new Error(
            resultado.mensaje ||
            `La solicitud falló (HTTP ${respuesta.status}).`
        );
    }

    const perfil = resultado.datos?.usuario ??
        resultado.datos;

    if (
        !perfil ||
        typeof perfil !== "object" ||
        Array.isArray(perfil)
    ) {
        throw new Error(
            "La API no devolvió un perfil válido."
        );
    }

    return perfil;
}


// ======================================
// MOSTRAR INFORMACIÓN PERSONAL
// ======================================

function mostrarDatosPerfil(usuario) {
    colocarValorPerfil("nombre", usuario.nombre);
    colocarValorPerfil("apellido", usuario.apellido);
    colocarValorPerfil("cedula", usuario.cedula);

    colocarValorPerfil(
        "fecha-nacimiento",
        formatearFechaPerfil(
            usuario.fecha_nacimiento
        )
    );

    colocarValorPerfil("correo", usuario.correo);
    colocarValorPerfil("telefono", usuario.telefono);

    colocarValorPerfil(
        "referente-adulto",
        usuario.referente_adulto
    );

    colocarValorPerfil(
        "centro-referencia",
        usuario.centro_referencia
    );

    const nombreCompleto = [
        usuario.nombre,
        usuario.apellido
    ].filter(Boolean).join(" ");

    colocarTextoPerfil(
        "perfil-nombre",
        nombreCompleto || "Alumno"
    );

    colocarTextoPerfil(
        "perfil-rol",
        "Alumno"
    );

    // Mostrar el identificador de la ficha del alumno.
    colocarTextoPerfil(
        "usuario-id",
        usuario.alumno_id
    );

    colocarTextoPerfil(
        "fecha-ingreso",
        formatearFechaPerfil(
            usuario.fecha_ingreso
        )
    );

    colocarTextoPerfil(
        "ultimo-acceso",
        formatearFechaHoraPerfil(
            usuario.ultimoAcceso
        )
    );

    mostrarFotoPerfil();

    document.title = nombreCompleto
        ? `INAU - Mi Perfil - ${nombreCompleto}`
        : "INAU - Mi Perfil";
}


// ======================================
// FORMATEAR FECHAS
// ======================================

function formatearFechaPerfil(fechaISO) {
    if (!fechaISO) {
        return "Sin información";
    }

    if (typeof formatearFecha === "function") {
        const resultado = formatearFecha(fechaISO);

        return resultado === "-"
            ? "Sin información"
            : resultado;
    }

    const coincidencia =
        /^(\d{4})-(\d{2})-(\d{2})/.exec(
            String(fechaISO)
        );

    if (!coincidencia) {
        return "Sin información";
    }

    return (
        `${coincidencia[3]}/` +
        `${coincidencia[2]}/` +
        `${coincidencia[1]}`
    );
}

function formatearFechaHoraPerfil(fechaHora) {
    if (!fechaHora) {
        return "Sin información";
    }

    if (typeof formatearFechaHora === "function") {
        const resultado = formatearFechaHora(fechaHora);

        return resultado === "-"
            ? "Sin información"
            : resultado;
    }

    const texto = String(fechaHora).replace(
        "T",
        " "
    );

    const partes = texto.split(" ");

    const fecha = formatearFechaPerfil(
        partes[0]
    );

    if (partes[1]) {
        return `${fecha} ${partes[1].slice(0, 5)}`;
    }

    return fecha;
}


// ======================================
// CONFIGURAR FORMULARIO
// ======================================

function configurarFormularioPerfil() {
    const formulario = document.getElementById(
        "form-perfil"
    );

    if (!formulario) {
        throw new Error(
            "No se encontró el formulario del perfil."
        );
    }

    if (
        formulario.dataset.perfilConfigurado === "true"
    ) {
        return;
    }

    formulario.dataset.perfilConfigurado = "true";

    formulario.addEventListener(
        "submit",
        guardarCambiosPerfil
    );
}


// ======================================
// GUARDAR CORREO Y TELÉFONO
// ======================================

async function guardarCambiosPerfil(evento) {
    evento.preventDefault();

    if (guardandoPerfil || !usuarioPerfilActual) {
        return;
    }

    ocultarAlertaPerfil();

    const correo = obtenerValorPerfil("correo");
    const telefono = obtenerValorPerfil("telefono");

    const error = validarDatosFormularioPerfil({
        correo,
        telefono
    });

    if (error) {
        mostrarAlertaPerfil(error, "warning");
        return;
    }

    const formulario = document.getElementById(
        "form-perfil"
    );

    const botonGuardar = formulario?.querySelector(
        'button[type="submit"]'
    );

    guardandoPerfil = true;

    if (botonGuardar) {
        botonGuardar.disabled = true;
    }

    try {
        const perfilActualizado =
            await solicitarPerfilAlumno(
                "PATCH",
                "/perfil",
                {
                    correo,
                    telefono
                }
            );

        usuarioPerfilActual = perfilActualizado;

        // Mantener actualizada la identidad compartida.
        if (
            typeof sincronizarUsuarioAlumno ===
            "function"
        ) {
            sincronizarUsuarioAlumno(
                perfilActualizado
            );
        }

        mostrarDatosPerfil(perfilActualizado);

        if (
            typeof mostrarUsuarioEnNavbar ===
            "function"
        ) {
            mostrarUsuarioEnNavbar();
        }

        mostrarAlertaPerfil(
            "Los datos de contacto se guardaron correctamente.",
            "success"
        );

    } catch (error) {
        console.error(
            "Error al actualizar el perfil:",
            error
        );

        mostrarAlertaPerfil(
            error.message ||
            "No se pudieron guardar los cambios.",
            "danger"
        );

    } finally {
        guardandoPerfil = false;

        if (botonGuardar) {
            botonGuardar.disabled = false;
        }
    }
}


// ======================================
// VALIDACIONES
// ======================================

function validarDatosFormularioPerfil(datos) {
    if (!datos.correo) {
        return "Debés completar el correo electrónico.";
    }

    const correoValido =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!correoValido.test(datos.correo)) {
        return "El correo electrónico no tiene un formato válido.";
    }

    if (!datos.telefono) {
        return "Debés completar el teléfono.";
    }

    if (!validarTelefonoPerfil(datos.telefono)) {
        return (
            "El teléfono debe contener entre 8 y 15 dígitos. " +
            "Podés utilizar espacios, guiones, paréntesis o +."
        );
    }

    return null;
}

function validarTelefonoPerfil(telefono) {
    const limpio = String(telefono).replace(
        /[\s\-()+]/g,
        ""
    );

    return /^\d{8,15}$/.test(limpio);
}


// ======================================
// FUNCIONES TODAVÍA NO DISPONIBLES
// ======================================

function prepararFuncionesNoDisponiblesPerfil() {

    // Fotografía de perfil:
    // no existe persistencia en el backend.

    const inputFoto = document.getElementById(
        "input-foto-perfil"
    );

    const botonEliminarFoto = document.getElementById(
        "btn-eliminar-foto"
    );

    if (inputFoto) {
        inputFoto.disabled = true;
    }

    if (botonEliminarFoto) {
        botonEliminarFoto.disabled = true;
        botonEliminarFoto.title =
            "Función no disponible por el momento.";
    }

    const etiquetaFoto = document.querySelector(
        'label[for="input-foto-perfil"]'
    );

    if (etiquetaFoto) {
        etiquetaFoto.classList.add("d-none");
    }

    // Biografía:
    // no existe persistencia en el backend.

    const biografia = document.getElementById(
        "biografia"
    );

    if (biografia) {
        biografia.value = "";
        biografia.disabled = true;

        biografia.placeholder =
            "Función no disponible por el momento.";

        const ayuda = biografia.parentElement
            ?.querySelector(".form-text");

        if (ayuda) {
            ayuda.textContent =
                "La biografía estará disponible cuando " +
                "se implemente su almacenamiento en el servidor.";
        }
    }

    const botonEliminarBiografia =
        document.getElementById(
            "btn-eliminar-biografia"
        );

    if (botonEliminarBiografia) {
        botonEliminarBiografia.disabled = true;
    }

    // Cambio de contraseña:
    // no se permite desde PATCH /perfil.

    const password = document.getElementById(
        "password"
    );

    const confirmarPassword =
        document.getElementById(
            "confirmar-password"
        );

    if (password) {
        password.value = "";
        password.disabled = true;
        password.placeholder =
            "No disponible por el momento";
    }

    if (confirmarPassword) {
        confirmarPassword.value = "";
        confirmarPassword.disabled = true;
        confirmarPassword.placeholder =
            "No disponible por el momento";
    }
}


// ======================================
// FOTO PREDETERMINADA
// ======================================

function mostrarFotoPerfil() {
    const contenedor = document.getElementById(
        "logo-circle-perfil"
    );

    if (!contenedor) {
        return;
    }

    contenedor.replaceChildren();

    const icono = document.createElement("i");

    icono.className = "bi bi-person-fill";
    icono.setAttribute("aria-hidden", "true");

    contenedor.appendChild(icono);
}


// ======================================
// AUXILIARES
// ======================================

function obtenerValorPerfil(elementoId) {
    const elemento = document.getElementById(
        elementoId
    );

    if (!elemento) {
        return "";
    }

    return String(elemento.value ?? "").trim();
}

function colocarValorPerfil(elementoId, valor) {
    const elemento = document.getElementById(
        elementoId
    );

    if (elemento) {
        elemento.value = valor ?? "";
    }
}

function colocarTextoPerfil(elementoId, valor) {
    const elemento = document.getElementById(
        elementoId
    );

    if (!elemento) {
        return;
    }

    elemento.textContent =
        valor === null ||
            valor === undefined ||
            valor === ""
            ? "Sin información"
            : String(valor);
}


// ======================================
// ALERTAS
// ======================================

function mostrarAlertaPerfil(
    mensaje,
    tipo = "info"
) {
    const alerta = document.getElementById(
        "alerta-perfil"
    );

    if (!alerta) {
        return;
    }

    const tiposPermitidos = [
        "success",
        "danger",
        "warning",
        "info"
    ];

    const tipoSeguro = tiposPermitidos.includes(
        tipo
    ) ? tipo : "info";

    alerta.className = `alert alert-${tipoSeguro}`;
    alerta.setAttribute("role", "alert");
    alerta.textContent = mensaje;
    alerta.classList.remove("d-none");
}

function ocultarAlertaPerfil() {
    const alerta = document.getElementById(
        "alerta-perfil"
    );

    if (!alerta) {
        return;
    }

    alerta.textContent = "";
    alerta.className = "alert d-none";
}


// ======================================
// BLOQUEAR FORMULARIO ANTE ERRORES
// ======================================

function deshabilitarFormularioPerfil() {
    const formulario = document.getElementById(
        "form-perfil"
    );

    if (!formulario) {
        return;
    }

    formulario.querySelectorAll(
        "input, textarea, button"
    ).forEach((control) => {
        control.disabled = true;
    });
}
