
/*
 * TALLERISTAS.JS - FRONTEND ADMIN
 *
 * Funciones:
 * - Listar talleristas reales desde MySQL.
 * - Buscar por nombre o correo.
 * - Calcular estadísticas reales.
 * - Consultar las asignaciones a talleres.
 * - Registrar talleristas mediante POST /talleristas.
 * - Conservar la navegación al detalle.
 */

"use strict";

let talleristasActuales = [];
let guardandoTallerista = false;
let eventosTalleristasConfigurados = false;

let asignacionesTalleristas = new Map();
let asignacionesTalleristasCargadas = false;


// ==============================
// INICIALIZACIÓN
// ==============================

async function inicializarTalleristas() {

    if (!eventosTalleristasConfigurados) {
        configurarBuscador();
        configurarAltaTallerista();

        eventosTalleristasConfigurados = true;
    }

    await cargarTalleristas();
}


// ==============================
// CONSULTAR TALLERISTAS
// ==============================

async function cargarTalleristas() {

    const tabla = document.getElementById(
        "tabla-talleristas"
    );

    if (tabla) {
        tabla.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-5">
                    Cargando talleristas...
                </td>
            </tr>
        `;
    }

    ocultarAlertaTalleristas();

    try {

        // GET /talleristas
        const datos = await inauApi("/talleristas");

        if (!Array.isArray(datos)) {
            throw new Error(
                "La API no devolvió una lista válida de talleristas."
            );
        }

        talleristasActuales = datos.map(
            normalizarTallerista
        );

        asignacionesTalleristas = new Map();
        asignacionesTalleristasCargadas = false;

        // Mostrar primero los datos personales.
        mostrarEstadisticasTalleristas(
            talleristasActuales
        );

        const buscador = document.getElementById(
            "buscar-tallerista"
        );

        filtrarTalleristas(buscador?.value || "");

        // Consultar asignaciones reales.
        await cargarAsignacionesTalleristas();

        // Actualizar estadísticas.
        mostrarEstadisticasTalleristas(
            talleristasActuales
        );

    } catch (error) {

        console.error(
            "Error al cargar talleristas:",
            error
        );

        talleristasActuales = [];
        asignacionesTalleristas = new Map();
        asignacionesTalleristasCargadas = false;

        colocarTexto("stat-total", "—");
        colocarTexto("stat-activos", "—");
        colocarTexto("stat-con-talleres", "—");
        colocarTexto("stat-sin-talleres", "—");

        if (tabla) {
            tabla.innerHTML = `
                <tr>
                    <td colspan="5"
                        class="text-center text-danger py-5">
                        No se pudieron cargar los talleristas.
                    </td>
                </tr>
            `;
        }

        mostrarErrorTalleristas(
            error.message ||
            "No se pudo conectar con la API."
        );
    }
}


// ==============================
// NORMALIZAR DATOS
// ==============================

function normalizarTallerista(datos) {

    return {
        id: Number(datos.id),

        nombre: datos.nombre ?? "",
        apellido: datos.apellido ?? "",

        cedula: datos.cedula ?? "",
        correo: datos.correo ?? "",
        telefono: datos.telefono ?? "",

        especialidad: datos.especialidad ?? "",
        rol: datos.rol ?? "tallerista",

        estado: datos.estado ?? "Activo",

        fechaRegistro: datos.fecha_registro ?? "",
        ultimoAcceso: datos.ultimo_acceso ?? null
    };
}


// ==============================
// CONSULTAR ASIGNACIONES REALES
// ==============================

async function cargarAsignacionesTalleristas() {

    asignacionesTalleristas = new Map();
    asignacionesTalleristasCargadas = false;

    try {

        // GET /talleres
        const talleres = await inauApi("/talleres");

        if (!Array.isArray(talleres)) {
            throw new Error(
                "No se pudo consultar la lista de talleres."
            );
        }

        // Todos comienzan sin asignaciones.
        talleristasActuales.forEach(tallerista => {
            asignacionesTalleristas.set(
                tallerista.id,
                new Set()
            );
        });

        // GET /talleres/{id}/talleristas
        const resultados = await Promise.all(

            talleres.map(async taller => {

                const talleristas = await inauApi(
                    `/talleres/${taller.id}/talleristas`
                );

                if (!Array.isArray(talleristas)) {
                    throw new Error(
                        `No se pudieron consultar los talleristas del taller ${taller.id}.`
                    );
                }

                return {
                    tallerId: Number(taller.id),
                    talleristas
                };
            })

        );

        resultados.forEach(resultado => {

            resultado.talleristas.forEach(asignacion => {

                const talleristaId = Number(
                    asignacion.tallerista_id
                );

                if (asignacionesTalleristas.has(talleristaId)) {

                    asignacionesTalleristas
                        .get(talleristaId)
                        .add(resultado.tallerId);
                }

            });

        });

        asignacionesTalleristasCargadas = true;

    } catch (error) {

        console.error(
            "Error al consultar asignaciones:",
            error
        );

        asignacionesTalleristas = new Map();
        asignacionesTalleristasCargadas = false;

        mostrarErrorTalleristas(
            "Se cargaron los talleristas, pero no se pudieron consultar sus asignaciones."
        );
    }
}


// ==============================
// BUSCADOR
// ==============================

function configurarBuscador() {

    const input = document.getElementById(
        "buscar-tallerista"
    );

    if (!input) {
        return;
    }

    input.addEventListener("input", () => {
        filtrarTalleristas(input.value);
    });
}


function filtrarTalleristas(textoBusqueda) {

    const texto = normalizarTexto(textoBusqueda);

    if (!texto) {
        renderizarTablaTalleristas(
            talleristasActuales
        );

        return;
    }

    const filtrados = talleristasActuales.filter(
        tallerista => {

            const nombreCompleto = normalizarTexto(
                `${tallerista.nombre} ${tallerista.apellido}`
            );

            const correo = normalizarTexto(
                tallerista.correo
            );

            return nombreCompleto.includes(texto) ||
                correo.includes(texto);
        }
    );

    renderizarTablaTalleristas(filtrados);

    // Las estadísticas representan el total real,
    // no los resultados de la búsqueda.
}


// ==============================
// TABLA
// ==============================

function renderizarTablaTalleristas(talleristas) {

    const tabla = document.getElementById(
        "tabla-talleristas"
    );

    if (!tabla) {
        return;
    }

    if (talleristas.length === 0) {

        tabla.innerHTML = `
            <tr>
                <td colspan="5"
                    class="text-center text-muted py-5">
                    No se encontraron talleristas.
                </td>
            </tr>
        `;

        return;
    }

    tabla.innerHTML = talleristas.map(tallerista => {

        return `
            <tr>
                <td>
                    ${escaparHTML(tallerista.nombre)}
                    ${escaparHTML(tallerista.apellido)}
                </td>

                <td>
                    ${escaparHTML(tallerista.correo)}
                </td>

                <td>
                    ${escaparHTML(tallerista.telefono || "—")}
                </td>

                <td>
                    ${escaparHTML(tallerista.estado)}
                </td>

                <td>
                    <a
                        href="detalle-tallerista.html?id=${tallerista.id}"
                        class="btn btn-sm btn-outline-primary"
                    >
                        Ver
                    </a>
                </td>
            </tr>
        `;

    }).join("");
}


// ==============================
// ESTADÍSTICAS
// ==============================

function mostrarEstadisticasTalleristas(talleristas) {

    const total = talleristas.length;

    const activos = talleristas.filter(
        tallerista => tallerista.estado === "Activo"
    ).length;

    colocarTexto("stat-total", total);
    colocarTexto("stat-activos", activos);

    // Si todavía no tenemos asignaciones,
    // no inventamos estadísticas.
    if (!asignacionesTalleristasCargadas) {

        colocarTexto("stat-con-talleres", "—");
        colocarTexto("stat-sin-talleres", "—");

        return;
    }

    const conTalleres = talleristas.filter(tallerista => {

        const asignaciones = asignacionesTalleristas.get(
            tallerista.id
        );

        return asignaciones && asignaciones.size > 0;

    }).length;

    const sinTalleres = total - conTalleres;

    colocarTexto("stat-con-talleres", conTalleres);
    colocarTexto("stat-sin-talleres", sinTalleres);
}


// ==============================
// CONFIGURAR ALTA DE TALLERISTA
// ==============================

function configurarAltaTallerista() {

    const botonAbrir = document.getElementById(
        "btn-nuevo-tallerista"
    );

    const formulario = document.getElementById(
        "form-nuevo-tallerista"
    );

    botonAbrir?.addEventListener(
        "click",
        abrirModalNuevoTallerista
    );

    // El botón Guardar del HTML es de tipo submit
    // y está asociado al formulario con form="...".
    formulario?.addEventListener(
        "submit",
        async event => {
            event.preventDefault();
            await guardarNuevoTallerista();
        }
    );
}


// ==============================
// ABRIR MODAL
// ==============================

function abrirModalNuevoTallerista() {

    const formulario = document.getElementById(
        "form-nuevo-tallerista"
    );

    if (!formulario) {
        return;
    }

    formulario.reset();

    ocultarAlerta("alerta-nuevo-tallerista");

    bootstrap.Modal.getOrCreateInstance(
        document.getElementById("modal-nuevo-tallerista")
    ).show();
}


// ==============================
// GUARDAR NUEVO TALLERISTA
// ==============================

async function guardarNuevoTallerista() {

    if (guardandoTallerista) {
        return;
    }

    const nombre = document.getElementById(
        "nuevo-tallerista-nombre"
    ).value.trim();

    const apellido = document.getElementById(
        "nuevo-tallerista-apellido"
    ).value.trim();

    const cedula = document.getElementById(
        "nuevo-tallerista-cedula"
    ).value.trim();

    const correo = document.getElementById(
        "nuevo-tallerista-correo"
    ).value.trim();

    const telefono = document.getElementById(
        "nuevo-tallerista-telefono"
    ).value.trim();

    const especialidad = document.getElementById(
        "nuevo-tallerista-especialidad"
    ).value.trim();

    const clave = document.getElementById(
        "nuevo-tallerista-clave"
    ).value;

    const datos = {
        nombre,
        apellido,
        cedula,
        correo,
        telefono,
        especialidad,
        clave
    };

    const error = validarNuevoTallerista(datos);

    if (error) {
        mostrarAlerta(
            "alerta-nuevo-tallerista",
            error,
            "danger"
        );

        return;
    }

    const botonGuardar = document.getElementById(
        "btn-guardar-nuevo-tallerista"
    );

    guardandoTallerista = true;

    if (botonGuardar) {
        botonGuardar.disabled = true;
        botonGuardar.textContent = "Guardando...";
    }

    try {

        // Los nombres coinciden con TalleristaDTO.php.
        const nuevoTallerista = {
            nombre,
            apellido,
            cedula,
            correo,
            telefono: telefono || null,
            especialidad: especialidad || null,
            clave,
            estado: "Activo"
        };

        // POST /talleristas
        await inauApi("/talleristas", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(nuevoTallerista)
        });

        // Borrar la contraseña del formulario
        // inmediatamente después del alta.
        document.getElementById(
            "nuevo-tallerista-clave"
        ).value = "";

        bootstrap.Modal.getOrCreateInstance(
            document.getElementById("modal-nuevo-tallerista")
        ).hide();

        // Actualizar listado y estadísticas desde MySQL.
        await cargarTalleristas();

    } catch (error) {

        console.error(
            "Error al registrar tallerista:",
            error
        );

        mostrarAlerta(
            "alerta-nuevo-tallerista",
            error.message ||
            "No se pudo registrar el tallerista.",
            "danger"
        );

    } finally {

        guardandoTallerista = false;

        if (botonGuardar) {
            botonGuardar.disabled = false;
            botonGuardar.textContent = "Guardar";
        }
    }
}


// ==============================
// VALIDAR NUEVO TALLERISTA
// ==============================

function validarNuevoTallerista(datos) {

    if (
        !datos.nombre ||
        !datos.apellido ||
        !datos.cedula ||
        !datos.correo
    ) {
        return (
            "Nombre, apellido, cédula y correo " +
            "son obligatorios."
        );
    }

    const cedulaDuplicada = talleristasActuales.some(
        tallerista => tallerista.cedula === datos.cedula
    );

    if (cedulaDuplicada) {
        return (
            "Ya existe un tallerista registrado " +
            "con esa cédula."
        );
    }

    const correoDuplicado = talleristasActuales.some(
        tallerista =>
            tallerista.correo.toLowerCase() ===
            datos.correo.toLowerCase()
    );

    if (correoDuplicado) {
        return (
            "Ya existe un tallerista registrado " +
            "con ese correo."
        );
    }

    if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo)
    ) {
        return "El correo electrónico no es válido.";
    }

    if (!datos.clave) {
        return "La contraseña es obligatoria.";
    }

    // Coincide con la validación mínima del backend.
    if (datos.clave.length < 8) {
        return (
            "La contraseña debe tener al menos 8 caracteres."
        );
    }

    return null;
}


// ==============================
// ALERTAS GENERALES
// ==============================

function mostrarErrorTalleristas(mensaje) {

    const alerta = document.getElementById(
        "alerta-talleristas"
    );

    if (!alerta) {
        return;
    }

    alerta.textContent = mensaje;
    alerta.classList.remove("d-none");
}


function ocultarAlertaTalleristas() {

    const alerta = document.getElementById(
        "alerta-talleristas"
    );

    if (!alerta) {
        return;
    }

    alerta.textContent = "";
    alerta.classList.add("d-none");
}
