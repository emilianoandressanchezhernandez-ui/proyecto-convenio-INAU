
/*
    PERFIL.JS - FRONTEND ADMIN

    Integracion con la API real.

    GET /perfil
    PATCH /perfil

    - Muestra los datos del usuario autenticado.
    - Permite editar correo y telefono.
    - Guarda los cambios en MySQL.
    - No utiliza datos simulados.
    - No simula cambios de contraseña.
*/

const PERFIL_API_URL = "http://localhost:8002";

let usuarioPerfilActual = null;
let perfilEnEdicion = false;
let perfilGuardando = false;


// ======================================
// INICIALIZACION
// ======================================

async function inicializarPerfil() {
    configurarEdicionPerfilReal();
    deshabilitarPasswordPerfil();

    await cargarPerfilReal();
}


// ======================================
// PETICIONES A LA API
// ======================================

async function solicitarPerfilAPI(ruta, opciones = {}) {
    const respuesta = await fetch(
        PERFIL_API_URL + ruta,
        {
            ...opciones,
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...(opciones.headers || {})
            }
        }
    );

    const resultado = await respuesta.json();

    if (!respuesta.ok || resultado.ok === false) {
        const detalles = resultado.errores;

        let mensaje = resultado.mensaje ||
            "No se pudo completar la operación.";

        if (Array.isArray(detalles) && detalles.length) {
            mensaje += " " + detalles.join(" ");
        } else if (
            detalles &&
            typeof detalles === "object"
        ) {
            const mensajes = Object.values(detalles)
                .flat()
                .filter(Boolean);

            if (mensajes.length) {
                mensaje += " " + mensajes.join(" ");
            }
        }

        throw new Error(mensaje);
    }

    return resultado.datos;
}


// ======================================
// CARGAR PERFIL
// ======================================

async function cargarPerfilReal() {
    const boton = document.getElementById(
        "btn-editar-perfil"
    );

    if (boton) {
        boton.disabled = true;
    }

    try {
        ocultarMensajePerfil();

        usuarioPerfilActual = await solicitarPerfilAPI(
            "/perfil"
        );

        if (!usuarioPerfilActual) {
            throw new Error(
                "La API no devolvió los datos del usuario."
            );
        }

        mostrarDatosPerfilReal(usuarioPerfilActual);

        if (boton) {
            boton.disabled = false;
        }

    } catch (error) {
        console.error(
            "Error al cargar el perfil:",
            error
        );

        mostrarMensajePerfil(
            "No se pudo cargar el perfil. " +
            error.message,
            "danger"
        );
    }
}


// ======================================
// MOSTRAR DATOS
// ======================================

function mostrarDatosPerfilReal(usuario) {
    const nombre = usuario.nombre || "";
    const apellido = usuario.apellido || "";

    const nombreCompleto = [
        nombre,
        apellido
    ].filter(Boolean).join(" ") || "-";

    colocarTextoPerfil(
        "nombre-completo",
        nombreCompleto
    );

    colocarTextoPerfil(
        "perfil-nombre",
        nombreCompleto
    );

    colocarTextoPerfil(
        "perfil-cedula",
        usuario.cedula ?? "-"
    );

    colocarTextoPerfil(
        "perfil-correo",
        usuario.correo ?? "-"
    );

    colocarTextoPerfil(
        "perfil-telefono",
        usuario.telefono ?? "-"
    );

    colocarTextoPerfil(
        "perfil-rol",
        formatearRolPerfil(usuario.rol)
    );

    // La fecha puede tener distintos nombres
    // segun el modelo User y la base de datos.
    const fechaRegistro =
        usuario.fecha_registro ??
        usuario.fechaRegistro ??
        usuario.creado_en ??
        usuario.created_at ??
        null;

    colocarTextoPerfil(
        "perfil-registro",
        fechaRegistro
            ? formatearFechaPerfilReal(fechaRegistro)
            : "No disponible"
    );
}


function formatearRolPerfil(rol) {
    const roles = {
        admin: "Administrador",
        administrador: "Administrador",
        tallerista: "Tallerista",
        alumno: "Alumno"
    };

    return roles[String(rol || "").toLowerCase()] ||
        rol ||
        "-";
}


// ======================================
// CONFIGURAR EDICION
// ======================================

function configurarEdicionPerfilReal() {
    const boton = document.getElementById(
        "btn-editar-perfil"
    );

    if (!boton) {
        return;
    }

    boton.addEventListener("click", async () => {
        if (perfilGuardando || !usuarioPerfilActual) {
            return;
        }

        if (!perfilEnEdicion) {
            entrarModoEdicionPerfil();
        } else {
            await guardarEdicionPerfilReal();
        }
    });
}


// ======================================
// ENTRAR EN MODO EDICION
// ======================================

function entrarModoEdicionPerfil() {
    if (!usuarioPerfilActual) {
        return;
    }

    ocultarMensajePerfil();

    const contenedorCorreo =
        document.getElementById("perfil-correo");

    const contenedorTelefono =
        document.getElementById("perfil-telefono");

    // Crear los inputs sin insertar datos
    // del usuario mediante innerHTML.

    const inputCorreo = document.createElement("input");

    inputCorreo.type = "email";
    inputCorreo.id = "input-correo";
    inputCorreo.className = "form-control";
    inputCorreo.value = usuarioPerfilActual.correo || "";
    inputCorreo.autocomplete = "email";

    const inputTelefono = document.createElement("input");

    inputTelefono.type = "tel";
    inputTelefono.id = "input-telefono";
    inputTelefono.className = "form-control";
    inputTelefono.value = usuarioPerfilActual.telefono || "";
    inputTelefono.autocomplete = "tel";

    contenedorCorreo.replaceChildren(inputCorreo);
    contenedorTelefono.replaceChildren(inputTelefono);

    const boton = document.getElementById(
        "btn-editar-perfil"
    );

    if (boton) {
        boton.innerHTML = `
            <i class="bi bi-check-circle-fill"></i>
            Guardar Cambios
        `;
    }

    perfilEnEdicion = true;
    inputCorreo.focus();
}


// ======================================
// GUARDAR PERFIL EN MYSQL
// ======================================

async function guardarEdicionPerfilReal() {
    const inputCorreo = document.getElementById(
        "input-correo"
    );

    const inputTelefono = document.getElementById(
        "input-telefono"
    );

    if (!inputCorreo || !inputTelefono) {
        return;
    }

    const correo = inputCorreo.value.trim();
    const telefono = inputTelefono.value.trim();

    const error = validarEdicionPerfilReal(
        correo,
        telefono
    );

    if (error) {
        mostrarMensajePerfil(error, "danger");
        return;
    }

    const datosActualizados = {};

    if (correo !== (usuarioPerfilActual.correo || "")) {
        datosActualizados.correo = correo;
    }

    if (
        telefono !==
        (usuarioPerfilActual.telefono || "")
    ) {
        datosActualizados.telefono = telefono;
    }

    if (Object.keys(datosActualizados).length === 0) {
        salirModoEdicionPerfil();

        mostrarMensajePerfil(
            "No se realizaron cambios.",
            "info"
        );

        return;
    }

    const boton = document.getElementById(
        "btn-editar-perfil"
    );

    perfilGuardando = true;

    if (boton) {
        boton.disabled = true;
        boton.innerHTML = `
            <span
                class="spinner-border spinner-border-sm"
                aria-hidden="true"
            ></span>
            Guardando...
        `;
    }

    try {
        ocultarMensajePerfil();

        const usuarioActualizado =
            await solicitarPerfilAPI(
                "/perfil",
                {
                    method: "PATCH",
                    body: JSON.stringify(
                        datosActualizados
                    )
                }
            );

        usuarioPerfilActual = usuarioActualizado;

        salirModoEdicionPerfil();

        mostrarDatosPerfilReal(usuarioPerfilActual);

        mostrarMensajePerfil(
            "Los datos del perfil se guardaron correctamente.",
            "success"
        );

    } catch (error) {
        console.error(
            "Error al guardar el perfil:",
            error
        );

        mostrarMensajePerfil(
            "No se pudieron guardar los cambios. " +
            error.message,
            "danger"
        );

    } finally {
        perfilGuardando = false;

        if (boton) {
            boton.disabled = false;

            boton.innerHTML = perfilEnEdicion
                ? `<i class="bi bi-check-circle-fill"></i>
                   Guardar Cambios`
                : `<i class="bi bi-pencil-fill"></i>
                   Editar Perfil`;
        }
    }
}


// ======================================
// SALIR DEL MODO EDICION
// ======================================

function salirModoEdicionPerfil() {
    perfilEnEdicion = false;

    if (usuarioPerfilActual) {
        mostrarDatosPerfilReal(usuarioPerfilActual);
    }

    const boton = document.getElementById(
        "btn-editar-perfil"
    );

    if (boton) {
        boton.innerHTML = `
            <i class="bi bi-pencil-fill"></i>
            Editar Perfil
        `;
    }
}


// ======================================
// VALIDACIONES
// ======================================

function validarEdicionPerfilReal(correo, telefono) {
    if (!correo) {
        return "Debés completar el correo electrónico.";
    }

    const correoValido =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);

    if (!correoValido) {
        return "El correo electrónico no tiene un formato válido.";
    }

    if (correo.length > 255) {
        return "El correo electrónico es demasiado largo.";
    }

    if (telefono.length > 30) {
        return "El teléfono es demasiado largo.";
    }

    return null;
}


// ======================================
// CAMBIO DE CONTRASEÑA PENDIENTE
// ======================================

function deshabilitarPasswordPerfil() {
    const ids = [
        "password-actual",
        "password-nueva",
        "password-confirmar",
        "btn-guardar-password"
    ];

    ids.forEach(id => {
        const elemento = document.getElementById(id);

        if (elemento) {
            elemento.disabled = true;
            elemento.title =
                "Funcionalidad pendiente de implementación";
        }
    });
}


// ======================================
// MENSAJES
// ======================================

function mostrarMensajePerfil(mensaje, tipo = "danger") {
    const alerta = document.getElementById(
        "alerta-perfil"
    );

    if (!alerta) {
        return;
    }

    alerta.textContent = mensaje;

    alerta.className =
        `alert alert-${tipo}`;

    alerta.classList.remove("d-none");
}


function ocultarMensajePerfil() {
    const alerta = document.getElementById(
        "alerta-perfil"
    );

    if (alerta) {
        alerta.textContent = "";
        alerta.classList.add("d-none");
    }
}


// ======================================
// FUNCIONES AUXILIARES
// ======================================

function colocarTextoPerfil(id, valor) {
    const elemento = document.getElementById(id);

    if (elemento) {
        elemento.textContent = valor ?? "-";
    }
}


function formatearFechaPerfilReal(fecha) {
    if (!fecha) {
        return "-";
    }

    const [anio, mes, dia] = String(fecha)
        .slice(0, 10)
        .split("-");

    if (!anio || !mes || !dia) {
        return String(fecha);
    }

    return `${dia}/${mes}/${anio}`;
}
