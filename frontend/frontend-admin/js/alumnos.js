
/*
 * ALUMNOS.JS - FRONTEND ADMIN
 *
 * Responsabilidades:
 * - Listar alumnos reales desde MySQL.
 * - Mostrar estadísticas de alumnos.
 * - Buscar por nombre o cédula.
 * - Registrar nuevos alumnos mediante la API.
 * - Consultar inscripciones reales y contar talleres.
 * - Conservar modal, validaciones y navegación.
 */

"use strict";

let alumnosActuales = [];
let guardandoAlumno = false;
let eventosAlumnosConfigurados = false;

// Mapa: alumnoId => cantidad de talleres.
let cantidadTalleresPorAlumno = new Map();

// Indica si la consulta de inscripciones fue exitosa.
let talleresAlumnosCargados = false;


// ==============================
// INICIALIZACIÓN
// ==============================

async function inicializarAlumnos() {

    if (!eventosAlumnosConfigurados) {
        configurarBuscador();
        configurarAltaAlumno();

        eventosAlumnosConfigurados = true;
    }

    await cargarAlumnos();
}


// ==============================
// API - CONSULTAR ALUMNOS
// ==============================

async function cargarAlumnos() {

    const tabla = document.getElementById("tabla-alumnos");

    if (tabla) {
        tabla.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-5">
                    Cargando alumnos...
                </td>
            </tr>
        `;
    }

    try {

        // GET /alumnos
        const datos = await inauApi("/alumnos");

        if (!Array.isArray(datos)) {
            throw new Error(
                "La API no devolvió una lista válida de alumnos."
            );
        }

        alumnosActuales = datos.map(normalizarAlumno);

        // Mostrar primero el listado real.
        // Las cantidades aparecerán al cargar inscripciones.
        cantidadTalleresPorAlumno = new Map();
        talleresAlumnosCargados = false;

        mostrarEstadisticasAlumnos(alumnosActuales);

        const buscador = document.getElementById("buscar-alumno");

        filtrarAlumnos(buscador?.value || "");

        // Consultar inscripciones reales.
        await cargarCantidadTalleresAlumnos();

        // Actualizar tabla y estadísticas.
        mostrarEstadisticasAlumnos(alumnosActuales);

        filtrarAlumnos(buscador?.value || "");

    } catch (error) {

        console.error("Error al cargar alumnos:", error);

        alumnosActuales = [];
        cantidadTalleresPorAlumno = new Map();
        talleresAlumnosCargados = false;

        if (tabla) {
            tabla.innerHTML = `
                <tr>
                    <td colspan="6"
                        class="text-center text-danger py-5">
                        No se pudieron cargar los alumnos.
                        Revisá la conexión con la API.
                    </td>
                </tr>
            `;
        }

        mostrarEstadisticasAlumnos(alumnosActuales);
    }
}


// ==============================
// NORMALIZAR DATOS
// ==============================

function normalizarAlumno(datos) {

    return {
        id: Number(datos.id),
        usuarioId: datos.usuario_id ?? null,

        nombre: datos.nombre || "",
        apellido: datos.apellido || "",
        cedula: datos.cedula || "",
        correo: datos.correo || "",
        telefono: datos.telefono || "",

        direccion: datos.direccion || "",
        referenteAdulto: datos.referente_adulto || "",
        centroReferencia: datos.centro_referencia || "",

        fechaNacimiento: datos.fecha_nacimiento || "",
        fechaRegistro: datos.fecha_registro || "",

        estado: datos.estado || "Activo",
        ultimaAsistencia: datos.ultima_asistencia || null,
        observaciones: datos.observaciones || ""
    };
}


// ==============================
// CONSULTAR INSCRIPCIONES REALES
// ==============================

async function cargarCantidadTalleresAlumnos() {

    // Reiniciar las cantidades.
    cantidadTalleresPorAlumno = new Map();
    talleresAlumnosCargados = false;

    try {

        // 1. Obtener los talleres reales.
        const talleres = await inauApi("/talleres");

        if (!Array.isArray(talleres)) {
            throw new Error(
                "No se obtuvo una lista válida de talleres."
            );
        }

        // Inicializar todos los alumnos en cero.
        alumnosActuales.forEach(alumno => {
            cantidadTalleresPorAlumno.set(alumno.id, 0);
        });

        // 2. Consultar alumnos inscritos por taller.
        const inscripcionesPorTaller = await Promise.all(

            talleres.map(async taller => {

                const inscripciones = await inauApi(
                    `/talleres/${taller.id}/alumnos`
                );

                if (!Array.isArray(inscripciones)) {
                    throw new Error(
                        `No se pudieron consultar las inscripciones del taller ${taller.id}.`
                    );
                }

                return inscripciones;
            })

        );

        // 3. Contar cada taller una sola vez por alumno.
        inscripcionesPorTaller.forEach(inscripciones => {

            const alumnosEnEsteTaller = new Set();

            inscripciones.forEach(inscripcion => {

                const alumnoId = Number(inscripcion.alumno_id);

                if (
                    Number.isInteger(alumnoId) &&
                    cantidadTalleresPorAlumno.has(alumnoId)
                ) {
                    alumnosEnEsteTaller.add(alumnoId);
                }

            });

            alumnosEnEsteTaller.forEach(alumnoId => {

                const cantidadActual =
                    cantidadTalleresPorAlumno.get(alumnoId);

                cantidadTalleresPorAlumno.set(
                    alumnoId,
                    cantidadActual + 1
                );

            });

        });

        talleresAlumnosCargados = true;

    } catch (error) {

        console.error(
            "Error al consultar inscripciones reales:",
            error
        );

        // Si la API falla, desconocemos las cantidades.
        // No las mostramos como ceros.
        cantidadTalleresPorAlumno = new Map();
        talleresAlumnosCargados = false;

    }
}


// ==============================
// BUSCADOR
// ==============================

function configurarBuscador() {

    const input = document.getElementById("buscar-alumno");

    if (!input) return;

    input.addEventListener("input", () => {
        filtrarAlumnos(input.value);
    });
}


function filtrarAlumnos(textoBusqueda) {

    const texto = normalizarTexto(textoBusqueda);

    if (!texto) {
        renderizarTablaAlumnos(alumnosActuales);
        return;
    }

    const filtrados = alumnosActuales.filter(alumno => {

        const nombreCompleto = normalizarTexto(
            `${alumno.nombre} ${alumno.apellido}`
        );

        const cedula = normalizarTexto(alumno.cedula);

        return nombreCompleto.includes(texto) ||
            cedula.includes(texto);
    });

    renderizarTablaAlumnos(filtrados);
}


// ==============================
// TABLA DE ALUMNOS
// ==============================

function renderizarTablaAlumnos(alumnos) {

    const tabla = document.getElementById("tabla-alumnos");

    if (!tabla) return;

    if (alumnos.length === 0) {

        tabla.innerHTML = `
            <tr>
                <td colspan="6"
                    class="text-center text-muted py-5">
                    No se encontraron alumnos.
                </td>
            </tr>
        `;

        return;
    }

    tabla.innerHTML = alumnos.map(alumno => {

        const cantidadTalleres =
            contarTalleresDelAlumno(alumno.id);

        const talleresTexto =
            cantidadTalleres === null
                ? "—"
                : String(cantidadTalleres);

        return `
            <tr>
                <td>
                    ${escaparHTML(alumno.nombre)}
                    ${escaparHTML(alumno.apellido)}
                </td>

                <td>${escaparHTML(alumno.cedula)}</td>

                <td>${escaparHTML(alumno.telefono)}</td>

                <td>${talleresTexto}</td>

                <td>${escaparHTML(alumno.estado)}</td>

                <td>
                    <a
                        href="detalle-alumno.html?id=${alumno.id}"
                        class="btn btn-sm btn-outline-primary">
                        Ver
                    </a>
                </td>
            </tr>
        `;

    }).join("");
}


// ==============================
// CONTAR TALLERES DEL ALUMNO
// ==============================

function contarTalleresDelAlumno(alumnoId) {

    if (!talleresAlumnosCargados) {
        return null;
    }

    return cantidadTalleresPorAlumno.get(
        Number(alumnoId)
    ) ?? 0;
}


// ==============================
// ESTADÍSTICAS
// ==============================

function mostrarEstadisticasAlumnos(alumnos) {

    const total = alumnos.length;

    const activos = alumnos.filter(
        alumno => alumno.estado === "Activo"
    ).length;

    const inactivos = alumnos.filter(
        alumno => alumno.estado === "Inactivo"
    ).length;

    colocarTexto("stat-total", total);
    colocarTexto("stat-activos", activos);
    colocarTexto("stat-inactivos", inactivos);

    // Contar alumnos distintos con al menos un taller.
    if (!talleresAlumnosCargados) {

        colocarTexto("stat-con-talleres", "—");
        return;
    }

    const conTalleres = alumnos.filter(alumno => {

        const cantidad = contarTalleresDelAlumno(alumno.id);

        return cantidad !== null && cantidad > 0;

    }).length;

    colocarTexto("stat-con-talleres", conTalleres);
}


// ==============================
// ALTA DE ALUMNO
// ==============================

function configurarAltaAlumno() {

    const botonAbrir =
        document.getElementById("btn-nuevo-alumno");

    const botonGuardar =
        document.getElementById("btn-guardar-nuevo-alumno");

    if (botonAbrir) {

        botonAbrir.addEventListener(
            "click",
            abrirModalNuevoAlumno
        );
    }

    if (botonGuardar) {

        botonGuardar.addEventListener(
            "click",
            guardarNuevoAlumno
        );
    }
}


function abrirModalNuevoAlumno() {

    document.getElementById(
        "form-nuevo-alumno"
    ).reset();

    ocultarAlerta("alerta-nuevo-alumno");

    const modal = bootstrap.Modal.getOrCreateInstance(
        document.getElementById("modal-nuevo-alumno")
    );

    modal.show();
}


// ==============================
// GUARDAR NUEVO ALUMNO
// ==============================

async function guardarNuevoAlumno() {

    if (guardandoAlumno) return;

    const nombre = document
        .getElementById("nuevo-alumno-nombre")
        .value.trim();

    const apellido = document
        .getElementById("nuevo-alumno-apellido")
        .value.trim();

    const cedula = document
        .getElementById("nuevo-alumno-cedula")
        .value.trim();

    const fechaNacimiento = document
        .getElementById("nuevo-alumno-fecha-nacimiento")
        .value;

    const correo = document
        .getElementById("nuevo-alumno-correo")
        .value.trim();

    const telefono = document
        .getElementById("nuevo-alumno-telefono")
        .value.trim();

    const datos = {
        nombre,
        apellido,
        cedula,
        fechaNacimiento,
        correo,
        telefono
    };

    const error = validarNuevoAlumno(datos);

    if (error) {

        mostrarAlerta(
            "alerta-nuevo-alumno",
            error,
            "danger"
        );

        return;
    }

    const botonGuardar = document.getElementById(
        "btn-guardar-nuevo-alumno"
    );

    guardandoAlumno = true;

    if (botonGuardar) {
        botonGuardar.disabled = true;
        botonGuardar.textContent = "Guardando...";
    }

    try {

        const nuevoAlumno = {
            nombre,
            apellido,
            cedula,
            fecha_nacimiento: fechaNacimiento,
            correo,
            telefono,
            estado: "Activo"
        };

        // POST /alumnos
        await inauApi("/alumnos", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(nuevoAlumno)
        });

        // Actualizar listado y contadores desde MySQL.
        await cargarAlumnos();

        const modal = bootstrap.Modal.getOrCreateInstance(
            document.getElementById("modal-nuevo-alumno")
        );

        modal.hide();

    } catch (error) {

        console.error("Error al crear alumno:", error);

        mostrarAlerta(
            "alerta-nuevo-alumno",
            error.message || "No se pudo guardar el alumno.",
            "danger"
        );

    } finally {

        guardandoAlumno = false;

        if (botonGuardar) {
            botonGuardar.disabled = false;
            botonGuardar.textContent = "Guardar";
        }
    }
}


// ==============================
// VALIDACIONES
// ==============================

function validarNuevoAlumno(datos) {

    const camposObligatorios = [
        datos.nombre,
        datos.apellido,
        datos.cedula,
        datos.fechaNacimiento,
        datos.correo,
        datos.telefono
    ];

    if (camposObligatorios.some(campo => !campo)) {
        return "Todos los campos son obligatorios.";
    }

    // Permitir cedulas con o sin puntos y guion.
    // Ejemplos: 51234567 o 5.123.456-7.
    const cedulaSinFormato = datos.cedula.replace(/[.-]/g, "");

    if (!/^\d{8}$/.test(cedulaSinFormato)) {
        return "La cédula debe contener exactamente 8 dígitos.";
    }

    // Comparar cedulas ignorando puntos y guiones.
    const cedulaDuplicada = alumnosActuales.some(alumno => {
        const cedulaExistente = alumno.cedula.replace(/[.-]/g, "");
        return cedulaExistente === cedulaSinFormato;
    });

    if (cedulaDuplicada) {
        return "Ya existe un alumno registrado con esa cédula.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo)) {
        return "El correo electrónico no es válido.";
    }

    // Permitir numeros y separadores habituales, pero no letras.
    if (!/^[0-9+\s()-]+$/.test(datos.telefono)) {
        return "El teléfono solo puede contener números y separadores válidos.";
    }

    const digitosTelefono = datos.telefono.replace(/\D/g, "");

    if (digitosTelefono.length < 8 || digitosTelefono.length > 15) {
        return "El teléfono debe contener entre 8 y 15 dígitos.";
    }

    return null;
}