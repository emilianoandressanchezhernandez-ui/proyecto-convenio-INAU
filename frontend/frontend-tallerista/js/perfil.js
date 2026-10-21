
/*
    PERFIL.JS - FRONTEND TALLERISTA

    Integración real con PHP y MySQL.

    GET   /perfil
    PATCH /perfil

    Permite:
    - Consultar el perfil real.
    - Actualizar correo y teléfono.
    - Validar los cambios.
    - Mostrar errores del backend.
    - Mantener los cambios después de recargar.

    No utiliza localStorage ni DATOS_SIMULADOS.
*/

let usuarioPerfilActual = null;
let guardandoPerfil = false;


// ========================================
// INICIALIZACIÓN
// ========================================

async function inicializarPerfil() {
    configurarFormularioPerfil();
    deshabilitarFormularioPerfil();

    mostrarAlertaPerfil(
        "Cargando datos del perfil...",
        "info"
    );

    try {
        await cargarPerfilReal();

        habilitarFormularioPerfil();
        ocultarAlertaPerfil();

    } catch (error) {
        console.error(
            "Error al cargar el perfil:",
            error
        );

        mostrarAlertaPerfil(
            "No se pudo cargar el perfil. " + error.message,
            "danger"
        );
    }
}


// ========================================
// PETICIONES A LA API
// ========================================

async function solicitarPerfilAPI(
    metodo = "GET",
    datos = null
) {
    const opciones = {
        method: metodo,
        credentials: "include",
        headers: {
            Accept: "application/json"
        }
    };

    if (datos !== null) {
        opciones.headers["Content-Type"] =
            "application/json";

        opciones.body = JSON.stringify(datos);
    }

    let respuesta;

    try {
        respuesta = await fetch(
            `${TALLERISTA_API_URL}/perfil`,
            opciones
        );
    } catch {
        throw new Error(
            "No se pudo conectar con la API."
        );
    }

    let resultado;

    try {
        resultado = await respuesta.json();
    } catch {
        throw new Error(
            "La API no devolvió una respuesta JSON válida."
        );
    }

    if (!respuesta.ok || resultado.ok === false) {
        let mensaje = resultado.mensaje ||
            `Error HTTP ${respuesta.status}`;

        const errores = resultado.errores;

        if (Array.isArray(errores) && errores.length) {
            mensaje += " " + errores.join(" ");
        } else if (
            errores &&
            typeof errores === "object"
        ) {
            mensaje += " " +
                Object.values(errores).join(" ");
        }

        throw new Error(mensaje);
    }

    return resultado.datos;
}


// ========================================
// CARGAR PERFIL REAL
// ========================================

async function cargarPerfilReal() {
    const usuario = await solicitarPerfilAPI("GET");

    if (
        !usuario ||
        typeof usuario !== "object" ||
        Array.isArray(usuario)
    ) {
        throw new Error(
            "No se recibieron datos válidos del usuario."
        );
    }

    usuarioPerfilActual = usuario;

    mostrarDatosPerfil(usuario);
}


// ========================================
// MOSTRAR INFORMACIÓN
// ========================================

function mostrarDatosPerfil(usuario) {
    colocarValorInputPerfil(
        "nombre",
        usuario.nombre
    );

    colocarValorInputPerfil(
        "apellido",
        usuario.apellido
    );

    colocarValorInputPerfil(
        "cedula",
        usuario.cedula
    );

    colocarValorInputPerfil(
        "correo",
        usuario.correo
    );

    colocarValorInputPerfil(
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
            usuario.fecha_registro ??
            usuario.fechaRegistro
        )
    );

    colocarTextoPerfil(
        "ultimo-acceso",
        formatearFechaHoraPerfil(
            usuario.ultimo_acceso ??
            usuario.ultimoAcceso
        )
    );

    actualizarNombreNavbarPerfil(usuario);
}


// ========================================
// FORMULARIO
// ========================================

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


async function guardarCambiosPerfil(evento) {
    evento.preventDefault();

    if (guardandoPerfil || !usuarioPerfilActual) {
        return;
    }

    ocultarAlertaPerfil();

    const correo = obtenerValorInputPerfil("correo");
    const telefono = obtenerValorInputPerfil("telefono");

    const error = validarFormularioPerfil(
        correo,
        telefono
    );

    if (error) {
        mostrarAlertaPerfil(error, "warning");
        return;
    }

    const cambios = {};

    const correoAnterior = String(
        usuarioPerfilActual.correo ?? ""
    ).trim();

    const telefonoAnterior = String(
        usuarioPerfilActual.telefono ?? ""
    ).trim();

    if (correo !== correoAnterior) {
        cambios.correo = correo;
    }

    if (telefono !== telefonoAnterior) {
        cambios.telefono = telefono;
    }

    if (Object.keys(cambios).length === 0) {
        mostrarAlertaPerfil(
            "No hay cambios para guardar.",
            "info"
        );
        return;
    }

    const boton = document.getElementById(
        "btn-guardar-perfil"
    );

    guardandoPerfil = true;

    if (boton) {
        boton.disabled = true;
        boton.textContent = "Guardando...";
    }

    try {
        await solicitarPerfilAPI(
            "PATCH",
            cambios
        );

        // Volvemos a consultar los datos
        // realmente almacenados en MySQL.
        await cargarPerfilReal();

        mostrarAlertaPerfil(
            "Los cambios del perfil se guardaron correctamente.",
            "success"
        );

    } catch (error) {
        console.error(
            "Error al actualizar el perfil:",
            error
        );

        mostrarAlertaPerfil(
            "No se pudieron confirmar los cambios. " +
            error.message,
            "danger"
        );

    } finally {
        guardandoPerfil = false;

        if (boton) {
            boton.disabled = false;

            boton.innerHTML =
                '<i class="bi bi-save-fill"></i> Guardar Cambios';
        }
    }
}


// ========================================
// VALIDACIONES
// ========================================

function validarFormularioPerfil(correo, telefono) {
    if (!correo || !telefono) {
        return "Debes completar el correo y el teléfono.";
    }

    const inputCorreo = document.getElementById(
        "correo"
    );

    if (
        inputCorreo &&
        !inputCorreo.checkValidity()
    ) {
        return "El correo electrónico no es válido.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
        return "El correo electrónico no tiene un formato válido.";
    }

    // Validación básica del formato.
    // El backend realiza la validación definitiva.
    const telefonoLimpio = telefono.replace(
        /[\s()+-]/g,
        ""
    );

    if (!/^\d{8,15}$/.test(telefonoLimpio)) {
        return "El teléfono debe contener entre 8 y 15 dígitos.";
    }

    return null;
}


// ========================================
// NOMBRE Y NAVBAR
// ========================================

function obtenerNombreCompletoPerfil(usuario) {
    return [
        usuario.nombre,
        usuario.apellido
    ]
        .filter(Boolean)
        .join(" ") || "Tallerista";
}


function actualizarNombreNavbarPerfil(usuario) {
    const elemento = document.getElementById(
        "nombre-usuario"
    );

    if (!elemento) {
        return;
    }

    const nombre = obtenerNombreCompletoPerfil(
        usuario
    );

    const icono = elemento.querySelector("i");

    if (icono) {
        elemento.replaceChildren(
            icono,
            document.createTextNode(` ${nombre}`)
        );
    } else {
        elemento.textContent = nombre;
    }
}


// ========================================
// FECHAS
// ========================================

function formatearFechaPerfil(valor) {
    if (!valor) {
        return "Sin información";
    }

    const fecha = String(valor).slice(0, 10);
    const partes = fecha.split("-");

    if (partes.length !== 3) {
        return String(valor);
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}


function formatearFechaHoraPerfil(valor) {
    if (!valor) {
        return "Sin información";
    }

    const texto = String(valor);
    const fecha = formatearFechaPerfil(texto);

    const hora = texto.length >= 16
        ? texto.slice(11, 16)
        : "";

    return hora
        ? `${fecha} ${hora}`
        : fecha;
}


// ========================================
// INPUTS Y TEXTOS
// ========================================

function obtenerValorInputPerfil(id) {
    const elemento = document.getElementById(id);

    return elemento
        ? elemento.value.trim()
        : "";
}


function colocarValorInputPerfil(id, valor) {
    const elemento = document.getElementById(id);

    if (elemento) {
        elemento.value = valor ?? "";
    }
}


function colocarTextoPerfil(id, valor) {
    const elemento = document.getElementById(id);

    if (elemento) {
        elemento.textContent = valor ?? "--";
    }
}


// ========================================
// ESTADO DEL FORMULARIO
// ========================================

function deshabilitarFormularioPerfil() {
    const formulario = document.getElementById(
        "form-perfil"
    );

    if (!formulario) {
        return;
    }

    formulario.querySelectorAll(
        "#correo, #telefono, #btn-guardar-perfil"
    ).forEach(elemento => {
        elemento.disabled = true;
    });
}


function habilitarFormularioPerfil() {
    const formulario = document.getElementById(
        "form-perfil"
    );

    if (!formulario) {
        return;
    }

    formulario.querySelectorAll(
        "#correo, #telefono, #btn-guardar-perfil"
    ).forEach(elemento => {
        elemento.disabled = false;
    });
}


// ========================================
// ALERTAS
// ========================================

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

    alerta.className = `alert alert-${tipo}`;
    alerta.textContent = mensaje;
}


function ocultarAlertaPerfil() {
    const alerta = document.getElementById(
        "alerta-perfil"
    );

    if (!alerta) {
        return;
    }

    alerta.className = "alert d-none";
    alerta.textContent = "";
}
