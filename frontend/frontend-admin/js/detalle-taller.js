
"use strict";

/*
    DETALLE-TALLER.JS - FRONTEND ADMIN

    Integración con API PHP + MySQL.

    - Consultar taller real.
    - Mostrar horarios y talleristas.
    - Consultar alumnos y asistencias.
    - Inscribir y quitar alumnos.
    - Editar datos generales.
    - Finalizar taller.
    - Agregar y quitar talleristas asignados.
*/

let tallerActual = null;
let talleristasDelTaller = [];
let alumnosDelTaller = [];
let jornadasDelTaller = [];
let detallesJornadas = [];

let accionesDetalleTallerConfiguradas = false;
let guardandoEdicionTaller = false;
let modificandoInscripcion = false;
let finalizandoTaller = false;
let modificandoAsignacionTallerista = false;

// ======================================================
// INICIALIZACIÓN
// ======================================================

async function inicializarDetalleTaller() {
    configurarAcciones();

    const parametroId = obtenerParametroURL("id");
    const id = Number(parametroId);

    if (!Number.isInteger(id) || id <= 0) {
        mostrarAlerta(
            "alerta-detalle-taller",
            "El ID del taller no es válido.",
            "danger"
        );

        deshabilitarAccionesDetalleTaller();
        return;
    }

    try {
        await cargarDetalleTaller(id);
    } catch (error) {
        console.error(
            "Error al cargar el detalle del taller:",
            error
        );

        mostrarAlerta(
            "alerta-detalle-taller",
            error.message,
            "danger"
        );

        deshabilitarAccionesDetalleTaller();
    }
}

async function cargarDetalleTaller(id) {
    colocarTexto("nombre-taller", "Cargando taller...");
    ocultarAlerta("alerta-detalle-taller");

    const taller = await inauApi(`/talleres/${id}`);

    if (!taller || Number(taller.id) !== Number(id)) {
        throw new Error("No se encontró el taller solicitado.");
    }

    tallerActual = taller;

    // Consultar relaciones reales.
    const respuestas = await Promise.allSettled([
        inauApi(`/talleres/${id}/talleristas`),
        inauApi(`/talleres/${id}/alumnos`),
        inauApi(`/talleres/${id}/asistencias`)
    ]);

    talleristasDelTaller = obtenerListaRespuesta(
        respuestas[0],
        "talleristas"
    );

    alumnosDelTaller = obtenerListaRespuesta(
        respuestas[1],
        "alumnos"
    );

    jornadasDelTaller = obtenerListaRespuesta(
        respuestas[2],
        "asistencias"
    );

    detallesJornadas = await cargarDetallesJornadas(
        jornadasDelTaller
    );

    // Mostrar información.
    mostrarDatosTaller(tallerActual);
    mostrarEstadisticasTaller();

    renderizarAlumnosInscriptos();
    renderizarTalleristasAsignados();

    // Cargar ambos selectores desde MySQL.
    await Promise.all([
        cargarSelectorDeAlumnosDisponibles(),
        cargarSelectorDeTalleristasDisponibles()
    ]);

    actualizarEstadoAcciones();
    actualizarControlesTalleristas();
}

function obtenerListaRespuesta(resultado, descripcion) {
    if (
        resultado.status === "fulfilled" &&
        Array.isArray(resultado.value)
    ) {
        return resultado.value;
    }

    console.warn(
        `No se pudo cargar ${descripcion}:`,
        resultado.status === "rejected"
            ? resultado.reason
            : resultado.value
    );

    return null;
}

// ======================================================
// DATOS GENERALES
// ======================================================

function mostrarDatosTaller(taller) {
    colocarTexto(
        "nombre-taller",
        taller.nombre || "Sin nombre"
    );

    colocarTexto(
        "taller-nombre",
        taller.nombre || "Sin nombre"
    );

    colocarTexto(
        "taller-estado",
        taller.estado || "—"
    );

    const nombres = talleristasDelTaller === null
        ? "No disponible"
        : talleristasDelTaller.length
            ? talleristasDelTaller.map(t =>
                `${t.nombre} ${t.apellido}`
            ).join(", ")
            : "Sin asignar";

    colocarTexto("tallerista", nombres);

    colocarTexto(
        "horario",
        formatearHorariosDetalle(taller.horarios)
    );

    colocarTexto(
        "fecha-inicio",
        formatearFechaDetalle(taller.fecha_inicio)
    );

    colocarTexto(
        "fecha-fin",
        formatearFechaDetalle(taller.fecha_fin)
    );

    const observaciones = document.getElementById(
        "observaciones"
    );

    if (observaciones) {
        observaciones.textContent = taller.observaciones
            ? taller.observaciones
            : "No hay observaciones registradas.";
    }
}

function formatearHorariosDetalle(horarios) {
    if (!Array.isArray(horarios)) {
        return "No disponible";
    }

    if (horarios.length === 0) {
        return "Sin horarios";
    }

    return horarios.map(h => {
        const inicio = String(
            h.hora_inicio || ""
        ).slice(0, 5);

        const fin = String(
            h.hora_fin || ""
        ).slice(0, 5);

        return `${h.dia}: ${inicio} - ${fin}`;
    }).join(" / ");
}

function formatearFechaDetalle(fecha) {
    if (!fecha) {
        return "—";
    }

    const texto = String(fecha).slice(0, 10);
    const partes = texto.split("-");

    if (partes.length !== 3) {
        return texto;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

// ======================================================
// ASISTENCIAS Y ESTADÍSTICAS
// ======================================================

async function cargarDetallesJornadas(jornadas) {
    if (!Array.isArray(jornadas)) {
        return null;
    }

    if (jornadas.length === 0) {
        return [];
    }

    const respuestas = await Promise.allSettled(
        jornadas.map(jornada =>
            inauApi(`/asistencias/${jornada.id}`)
        )
    );

    let huboErrores = false;

    const detalles = respuestas.map(resultado => {
        if (resultado.status === "fulfilled") {
            return resultado.value;
        }

        huboErrores = true;

        console.warn(
            "Error al consultar una jornada:",
            resultado.reason
        );

        return null;
    });

    return huboErrores ? null : detalles;
}

function mostrarEstadisticasTaller() {
    colocarTexto(
        "cantidad-alumnos",
        alumnosDelTaller === null
            ? "—"
            : alumnosDelTaller.length
    );

    colocarTexto(
        "total-clases",
        jornadasDelTaller === null
            ? "—"
            : jornadasDelTaller.length
    );

    const promedio = calcularAsistenciaPromedioTaller(
        detallesJornadas
    );

    colocarTexto(
        "asistencia-promedio",
        promedio === null
            ? "Sin datos"
            : `${promedio}%`
    );
}

function calcularAsistenciaPromedioTaller(detalles) {
    if (
        !Array.isArray(detalles) ||
        detalles.length === 0
    ) {
        return null;
    }

    let registros = 0;
    let presentes = 0;

    for (const detalle of detalles) {
        if (!detalle) {
            return null;
        }

        const lista = Array.isArray(detalle.registros)
            ? detalle.registros
            : Array.isArray(detalle.asistencias)
                ? detalle.asistencias
                : null;

        if (!lista) {
            return null;
        }

        for (const registro of lista) {
            const estado = String(
                registro.estado ??
                registro.estado_asistencia ??
                ""
            ).trim().toLowerCase();

            if (!estado) {
                continue;
            }

            registros++;

            if (estado === "presente") {
                presentes++;
            }
        }
    }

    if (registros === 0) {
        return null;
    }

    return Math.round(
        (presentes / registros) * 100
    );
}

// ======================================================
// ALUMNOS INSCRIPTOS
// ======================================================

function renderizarAlumnosInscriptos() {
    const tabla = document.getElementById(
        "tabla-alumnos"
    );

    if (!tabla) {
        return;
    }

    if (!Array.isArray(alumnosDelTaller)) {
        tabla.innerHTML = `
            <tr>
                <td colspan="5"
                    class="text-center text-danger py-4">
                    No se pudo consultar la lista de alumnos.
                </td>
            </tr>
        `;
        return;
    }

    if (alumnosDelTaller.length === 0) {
        tabla.innerHTML = `
            <tr>
                <td colspan="5"
                    class="text-center text-muted py-4">
                    Este taller no tiene alumnos inscriptos.
                </td>
            </tr>
        `;
        return;
    }

    const activo = tallerActual?.estado === "Activo";

    tabla.innerHTML = alumnosDelTaller.map(alumno => {
        const id = Number(alumno.alumno_id);

        return `
            <tr>
                <td>
                    ${escaparHTML(alumno.nombre || "")}
                    ${escaparHTML(alumno.apellido || "")}
                </td>

                <td>${escaparHTML(alumno.cedula || "—")}</td>

                <td>${escaparHTML(alumno.telefono || "—")}</td>

                <td>${escaparHTML(alumno.estado || "—")}</td>

                <td>
                    <a
                        href="detalle-alumno.html?id=${id}"
                        class="btn btn-sm btn-outline-primary">
                        Ver
                    </a>

                    <button
                        type="button"
                        class="btn btn-sm btn-outline-danger btn-quitar-alumno"
                        data-alumno-id="${id}"
                        ${activo ? "" : "disabled"}>
                        Quitar
                    </button>
                </td>
            </tr>
        `;
    }).join("");

    tabla.querySelectorAll(".btn-quitar-alumno")
        .forEach(boton => {
            boton.addEventListener("click", () => {
                quitarAlumnoDelTaller(
                    Number(boton.dataset.alumnoId)
                );
            });
        });
}

async function cargarSelectorDeAlumnosDisponibles() {
    const select = document.getElementById(
        "select-agregar-alumno"
    );

    if (!select) {
        return;
    }

    select.disabled = true;

    select.innerHTML = `
        <option value="">Cargando alumnos...</option>
    `;

    if (!Array.isArray(alumnosDelTaller)) {
        select.innerHTML = `
            <option value="">
                Lista de inscriptos no disponible
            </option>
        `;
        return;
    }

    try {
        const todos = await inauApi("/alumnos");

        if (!Array.isArray(todos)) {
            throw new Error(
                "La API no devolvió una lista de alumnos."
            );
        }

        const inscriptos = new Set(
            alumnosDelTaller.map(a =>
                Number(a.alumno_id)
            )
        );

        const disponibles = todos.filter(a =>
            a.estado === "Activo" &&
            !inscriptos.has(Number(a.id))
        );

        select.innerHTML = `
            <option value="">
                ${disponibles.length
                ? "Seleccionar alumno..."
                : "No hay alumnos disponibles"}
            </option>

            ${disponibles.map(a => `
                <option value="${Number(a.id)}">
                    ${escaparHTML(a.nombre || "")}
                    ${escaparHTML(a.apellido || "")}
                </option>
            `).join("")}
        `;

        select.disabled =
            tallerActual.estado !== "Activo" ||
            disponibles.length === 0;

    } catch (error) {
        console.error(
            "Error al consultar alumnos:",
            error
        );

        select.innerHTML = `
            <option value="">
                No se pudieron cargar alumnos
            </option>
        `;
    }
}

// ======================================================
// PETICIONES PARA MODIFICAR DATOS
// ======================================================

async function enviarCambioTaller(
    ruta,
    metodo,
    datos = null
) {
    const opciones = {
        method: metodo,
        credentials: "include",
        headers: {}
    };

    if (datos !== null) {
        opciones.headers["Content-Type"] =
            "application/json";

        opciones.body = JSON.stringify(datos);
    }

    const respuesta = await fetch(
        `http://localhost:8002${ruta}`,
        opciones
    );

    const texto = await respuesta.text();

    let resultado;

    try {
        resultado = texto
            ? JSON.parse(texto)
            : {};
    } catch {
        throw new Error(
            "El servidor devolvió una respuesta que no es JSON válido."
        );
    }

    if (!respuesta.ok || resultado.ok === false) {
        let mensaje = resultado.mensaje ||
            "No se pudo completar la operación.";

        if (resultado.errores) {
            const detalles = Array.isArray(resultado.errores)
                ? resultado.errores
                : Object.values(resultado.errores);

            if (detalles.length > 0) {
                mensaje += " " + detalles.join(" ");
            }
        }

        throw new Error(mensaje);
    }

    return resultado.datos;
}

// ======================================================
// CONFIGURACIÓN DE ACCIONES
// ======================================================

function configurarAcciones() {
    if (accionesDetalleTallerConfiguradas) {
        return;
    }

    accionesDetalleTallerConfiguradas = true;

    document.getElementById("btn-editar")
        ?.addEventListener(
            "click",
            abrirModalEditarTaller
        );

    document.getElementById("btn-guardar-editar-taller")
        ?.addEventListener(
            "click",
            guardarEdicionTaller
        );

    document.getElementById("btn-finalizar")
        ?.addEventListener(
            "click",
            finalizarTaller
        );

    document.getElementById("btn-agregar-alumno")
        ?.addEventListener(
            "click",
            agregarAlumnoAlTaller
        );

    // Nueva acción: asignar tallerista.
    document.getElementById("btn-agregar-tallerista")
        ?.addEventListener(
            "click",
            agregarTalleristaAlTaller
        );

    document.getElementById("btn-asistencia")
        ?.addEventListener("click", () => {
            if (!tallerActual) {
                return;
            }

            window.location.href =
                `asistencias.html?tallerId=${tallerActual.id}`;
        });

    // Los horarios todavía no se pueden editar
    // mediante la API.
    const botonHorario = document.getElementById(
        "btn-agregar-horario-editar"
    );

    if (botonHorario) {
        botonHorario.disabled = true;

        botonHorario.title =
            "La edición de horarios todavía no está disponible.";
    }
}

function deshabilitarAccionesDetalleTaller() {
    [
        "btn-editar",
        "btn-finalizar",
        "btn-agregar-alumno",
        "btn-agregar-tallerista",
        "btn-asistencia"
    ].forEach(id => {
        const boton = document.getElementById(id);

        if (boton) {
            boton.disabled = true;
        }
    });

    const selectorTalleristas = document.getElementById(
        "select-agregar-tallerista"
    );

    if (selectorTalleristas) {
        selectorTalleristas.disabled = true;
    }

    const selectorAlumnos = document.getElementById(
        "select-agregar-alumno"
    );

    if (selectorAlumnos) {
        selectorAlumnos.disabled = true;
    }
}

function actualizarEstadoAcciones() {
    if (!tallerActual) {
        return;
    }

    const finalizado =
        tallerActual.estado === "Finalizado";

    const botonFinalizar = document.getElementById(
        "btn-finalizar"
    );

    if (botonFinalizar) {
        botonFinalizar.disabled = finalizado;

        botonFinalizar.textContent = finalizado
            ? "Taller Finalizado"
            : "Finalizar Taller";
    }

    const botonAgregarAlumno = document.getElementById(
        "btn-agregar-alumno"
    );

    const selectorAlumno = document.getElementById(
        "select-agregar-alumno"
    );

    if (botonAgregarAlumno) {
        botonAgregarAlumno.disabled =
            finalizado ||
            alumnosDelTaller === null ||
            !selectorAlumno ||
            selectorAlumno.disabled;
    }

    if (selectorAlumno && finalizado) {
        selectorAlumno.disabled = true;
    }

    actualizarControlesTalleristas();
}

// ======================================================
// EDITAR DATOS GENERALES
// ======================================================

async function abrirModalEditarTaller() {
    if (!tallerActual) {
        return;
    }

    const asignar = (id, valor) => {
        const campo = document.getElementById(id);

        if (campo) {
            campo.value = valor ?? "";
        }
    };

    asignar(
        "editar-taller-nombre",
        tallerActual.nombre
    );

    asignar(
        "editar-taller-descripcion",
        tallerActual.descripcion
    );

    asignar(
        "editar-taller-centro",
        tallerActual.centro
    );

    asignar(
        "editar-taller-direccion",
        tallerActual.direccion
    );

    asignar(
        "editar-taller-salon",
        tallerActual.salon
    );

    asignar(
        "editar-taller-fecha-inicio",
        String(tallerActual.fecha_inicio || "").slice(0, 10)
    );

    asignar(
        "editar-taller-fecha-fin",
        String(tallerActual.fecha_fin || "").slice(0, 10)
    );

    asignar(
        "editar-taller-observaciones",
        tallerActual.observaciones
    );

    ocultarAlerta("alerta-editar-taller");

    // Las asignaciones se gestionan en su propia sección.
    const selector = document.getElementById(
        "editar-taller-tallerista"
    );

    if (selector) {
        const nombres = Array.isArray(talleristasDelTaller) &&
            talleristasDelTaller.length
            ? talleristasDelTaller.map(t =>
                `${t.nombre} ${t.apellido}`
            ).join(", ")
            : "Sin asignar";

        selector.innerHTML = `
            <option value="">
                ${escaparHTML(nombres)}
            </option>
        `;

        selector.disabled = true;
        selector.required = false;

        selector.title =
            "Las asignaciones se gestionan en la sección Talleristas Asignados.";
    }

    // Mostrar los horarios existentes sin permitir
    // modificaciones que la API no puede guardar.
    const contenedor = document.getElementById(
        "editar-taller-horarios"
    );

    if (contenedor) {
        contenedor.innerHTML = `
            <div class="alert alert-secondary mb-2">
                ${escaparHTML(
            formatearHorariosDetalle(
                tallerActual.horarios
            )
        )}

                <div class="small mt-2">
                    La edición de horarios todavía
                    no está disponible.
                </div>
            </div>
        `;
    }

    const modal = bootstrap.Modal.getOrCreateInstance(
        document.getElementById("modal-editar-taller")
    );

    modal.show();
}

function validarEdicionTaller(datos) {
    if (
        !datos.nombre ||
        !datos.descripcion ||
        !datos.centro ||
        !datos.direccion ||
        !datos.salon ||
        !datos.fecha_inicio ||
        !datos.fecha_fin
    ) {
        return "Completá todos los campos generales obligatorios.";
    }

    if (datos.fecha_fin < datos.fecha_inicio) {
        return "La fecha de finalización no puede ser anterior al inicio.";
    }

    return null;
}

async function guardarEdicionTaller() {
    if (!tallerActual || guardandoEdicionTaller) {
        return;
    }

    const valor = id =>
        document.getElementById(id)?.value.trim() || "";

    const datos = {
        nombre: valor("editar-taller-nombre"),
        descripcion: valor("editar-taller-descripcion"),
        centro: valor("editar-taller-centro"),
        direccion: valor("editar-taller-direccion"),
        salon: valor("editar-taller-salon"),
        fecha_inicio: valor("editar-taller-fecha-inicio"),
        fecha_fin: valor("editar-taller-fecha-fin"),
        observaciones: valor("editar-taller-observaciones")
    };

    const error = validarEdicionTaller(datos);

    if (error) {
        mostrarAlerta(
            "alerta-editar-taller",
            error,
            "danger"
        );
        return;
    }

    const boton = document.getElementById(
        "btn-guardar-editar-taller"
    );

    guardandoEdicionTaller = true;
    boton.disabled = true;

    try {
        await enviarCambioTaller(
            `/talleres/${tallerActual.id}`,
            "PATCH",
            datos
        );

        const modal = bootstrap.Modal.getOrCreateInstance(
            document.getElementById("modal-editar-taller")
        );

        modal.hide();

        await cargarDetalleTaller(
            Number(tallerActual.id)
        );

    } catch (error) {
        console.error("Error al editar taller:", error);

        mostrarAlerta(
            "alerta-editar-taller",
            error.message,
            "danger"
        );

    } finally {
        guardandoEdicionTaller = false;
        boton.disabled = false;
    }
}

// ======================================================
// FINALIZAR TALLER
// ======================================================

async function finalizarTaller() {
    if (
        !tallerActual ||
        tallerActual.estado === "Finalizado" ||
        finalizandoTaller
    ) {
        return;
    }

    const confirmado = confirm(
        `¿Desea finalizar el taller "${tallerActual.nombre}"?`
    );

    if (!confirmado) {
        return;
    }

    finalizandoTaller = true;

    const boton = document.getElementById(
        "btn-finalizar"
    );

    boton.disabled = true;

    try {
        await enviarCambioTaller(
            `/talleres/${tallerActual.id}`,
            "DELETE"
        );

        await cargarDetalleTaller(
            Number(tallerActual.id)
        );

    } catch (error) {
        console.error(
            "Error al finalizar taller:",
            error
        );

        mostrarAlerta(
            "alerta-detalle-taller",
            error.message,
            "danger"
        );

    } finally {
        finalizandoTaller = false;
        actualizarEstadoAcciones();
    }
}

// ======================================================
// INSCRIBIR ALUMNO
// ======================================================

async function agregarAlumnoAlTaller() {
    if (
        !tallerActual ||
        tallerActual.estado !== "Activo" ||
        modificandoInscripcion
    ) {
        return;
    }

    const selector = document.getElementById(
        "select-agregar-alumno"
    );

    const alumnoId = Number(selector?.value);

    ocultarAlerta("alerta-asignar-alumno");

    if (!alumnoId) {
        mostrarAlerta(
            "alerta-asignar-alumno",
            "Seleccioná un alumno para agregar.",
            "danger"
        );
        return;
    }

    modificandoInscripcion = true;

    const boton = document.getElementById(
        "btn-agregar-alumno"
    );

    boton.disabled = true;

    try {
        await enviarCambioTaller(
            `/talleres/${tallerActual.id}/alumnos`,
            "POST",
            { alumno_id: alumnoId }
        );

        await cargarDetalleTaller(
            Number(tallerActual.id)
        );

    } catch (error) {
        console.error(
            "Error al inscribir alumno:",
            error
        );

        mostrarAlerta(
            "alerta-asignar-alumno",
            error.message,
            "danger"
        );

    } finally {
        modificandoInscripcion = false;
        actualizarEstadoAcciones();
    }
}

// ======================================================
// QUITAR ALUMNO
// ======================================================


async function quitarAlumnoDelTaller(alumnoId) {

    if (
        !tallerActual ||
        tallerActual.estado !== "Activo" ||
        modificandoInscripcion ||
        !Array.isArray(alumnosDelTaller)
    ) {
        return;
    }

    const alumno = alumnosDelTaller.find(
        a => Number(a.alumno_id) === Number(alumnoId)
    );

    if (!alumno) {
        return;
    }

    const modalElemento = document.getElementById(
        "modal-quitar-alumno"
    );

    const nombreElemento = document.getElementById(
        "nombre-alumno-quitar"
    );

    const botonConfirmar = document.getElementById(
        "btn-confirmar-quitar-alumno"
    );

    const botonCancelar = document.getElementById(
        "btn-cancelar-quitar-alumno"
    );

    if (!modalElemento || !nombreElemento || !botonConfirmar) {
        console.error("Faltan elementos del modal para quitar alumnos.");
        return;
    }

    nombreElemento.textContent =
        `${alumno.nombre} ${alumno.apellido}`;

    ocultarAlerta("alerta-quitar-alumno");

    botonConfirmar.disabled = false;

    const modal = bootstrap.Modal.getOrCreateInstance(
        modalElemento
    );

    // Sustituir la acción anterior para no acumular listeners.
    botonConfirmar.onclick = async () => {

        if (modificandoInscripcion) {
            return;
        }

        modificandoInscripcion = true;

        botonConfirmar.disabled = true;
        botonConfirmar.textContent = "Quitando...";

        if (botonCancelar) {
            botonCancelar.disabled = true;
        }

        const botonCerrar = modalElemento.querySelector(".btn-close");

        if (botonCerrar) {
            botonCerrar.disabled = true;
        }

        try {

            await enviarCambioTaller(
                `/talleres/${tallerActual.id}/alumnos/${alumnoId}`,
                "DELETE"
            );

            modal.hide();

            await cargarDetalleTaller(
                Number(tallerActual.id)
            );

        } catch (error) {

            console.error("Error al quitar alumno:", error);

            mostrarAlerta(
                "alerta-quitar-alumno",
                error.message || "No se pudo quitar al alumno.",
                "danger"
            );

        } finally {

            modificandoInscripcion = false;

            botonConfirmar.disabled = false;
            botonConfirmar.innerHTML = `
                <i class="bi bi-person-dash-fill me-1"></i>
                Quitar inscripción
            `;

            if (botonCancelar) {
                botonCancelar.disabled = false;
            }

            if (botonCerrar) {
                botonCerrar.disabled = false;
            }

            actualizarEstadoAcciones();
        }
    };

    modal.show();
}


// ======================================================
// TALLERISTAS ASIGNADOS
// ======================================================

function renderizarTalleristasAsignados() {
    const tabla = document.getElementById(
        "tabla-talleristas-asignados"
    );

    if (!tabla) {
        return;
    }

    if (!Array.isArray(talleristasDelTaller)) {
        tabla.innerHTML = `
            <tr>
                <td colspan="4"
                    class="text-center text-danger py-4">
                    No se pudieron cargar los talleristas.
                </td>
            </tr>
        `;
        return;
    }

    if (talleristasDelTaller.length === 0) {
        tabla.innerHTML = `
            <tr>
                <td colspan="4"
                    class="text-center text-muted py-4">
                    Este taller no tiene talleristas asignados.
                </td>
            </tr>
        `;
        return;
    }

    const activo =
        tallerActual?.estado === "Activo";

    tabla.innerHTML = talleristasDelTaller.map(t => `
        <tr>
            <td>
                ${escaparHTML(t.nombre || "")}
                ${escaparHTML(t.apellido || "")}
            </td>

            <td>
                ${escaparHTML(t.especialidad || "—")}
            </td>

            <td>
                ${escaparHTML(t.estado || "—")}
            </td>

            <td>
                <button
                    type="button"
                    class="btn btn-sm btn-outline-danger btn-quitar-tallerista"
                    data-id="${Number(t.tallerista_id)}"
                    ${activo ? "" : "disabled"}>
                    Quitar
                </button>
            </td>
        </tr>
    `).join("");

    tabla.querySelectorAll(".btn-quitar-tallerista")
        .forEach(boton => {
            boton.addEventListener("click", () => {
                quitarTalleristaDelTaller(
                    Number(boton.dataset.id)
                );
            });
        });
}

// ======================================================
// SELECTOR DE TALLERISTAS DISPONIBLES
// ======================================================

async function cargarSelectorDeTalleristasDisponibles() {
    const selector = document.getElementById(
        "select-agregar-tallerista"
    );

    if (!selector) {
        return;
    }

    selector.disabled = true;

    selector.innerHTML = `
        <option value="">
            Cargando talleristas...
        </option>
    `;

    if (!Array.isArray(talleristasDelTaller)) {
        selector.innerHTML = `
            <option value="">
                Asignaciones no disponibles
            </option>
        `;
        return;
    }

    try {
        const talleristas = await inauApi(
            "/talleristas"
        );

        if (!Array.isArray(talleristas)) {
            throw new Error(
                "La API no devolvió una lista válida."
            );
        }

        const asignados = new Set(
            talleristasDelTaller.map(t =>
                Number(t.tallerista_id)
            )
        );

        const disponibles = talleristas.filter(t =>
            t.estado === "Activo" &&
            !asignados.has(Number(t.id))
        );

        selector.innerHTML = `
            <option value="">
                ${disponibles.length
                ? "Seleccionar tallerista..."
                : "No hay talleristas disponibles"}
            </option>

            ${disponibles.map(t => `
                <option value="${Number(t.id)}">
                    ${escaparHTML(t.nombre || "")}
                    ${escaparHTML(t.apellido || "")}
                </option>
            `).join("")}
        `;

        selector.disabled =
            tallerActual?.estado !== "Activo" ||
            disponibles.length === 0;

    } catch (error) {
        console.error(
            "Error al cargar talleristas:",
            error
        );

        selector.innerHTML = `
            <option value="">
                No se pudieron cargar talleristas
            </option>
        `;
    }
}

// ======================================================
// CONTROLES DE TALLERISTAS
// ======================================================

function actualizarControlesTalleristas() {
    const activo =
        tallerActual?.estado === "Activo";

    const boton = document.getElementById(
        "btn-agregar-tallerista"
    );

    const selector = document.getElementById(
        "select-agregar-tallerista"
    );

    if (boton) {
        boton.disabled =
            !activo ||
            modificandoAsignacionTallerista ||
            !Array.isArray(talleristasDelTaller) ||
            !selector ||
            selector.disabled;
    }

    const tabla = document.getElementById(
        "tabla-talleristas-asignados"
    );

    if (tabla) {
        tabla.querySelectorAll(".btn-quitar-tallerista")
            .forEach(botonQuitar => {
                botonQuitar.disabled =
                    !activo ||
                    modificandoAsignacionTallerista;
            });
    }
}

// ======================================================
// AGREGAR TALLERISTA
// ======================================================

async function agregarTalleristaAlTaller() {
    if (
        !tallerActual ||
        tallerActual.estado !== "Activo" ||
        modificandoAsignacionTallerista
    ) {
        return;
    }

    const selector = document.getElementById(
        "select-agregar-tallerista"
    );

    const talleristaId = Number(
        selector?.value
    );

    ocultarAlerta(
        "alerta-asignar-tallerista"
    );

    if (!talleristaId) {
        mostrarAlerta(
            "alerta-asignar-tallerista",
            "Seleccioná un tallerista.",
            "danger"
        );
        return;
    }

    modificandoAsignacionTallerista = true;
    actualizarControlesTalleristas();

    try {
        await enviarCambioTaller(
            `/talleres/${tallerActual.id}/talleristas`,
            "POST",
            {
                tallerista_id: talleristaId
            }
        );

        await cargarDetalleTaller(
            Number(tallerActual.id)
        );

    } catch (error) {
        console.error(
            "Error al asignar tallerista:",
            error
        );

        mostrarAlerta(
            "alerta-asignar-tallerista",
            error.message,
            "danger"
        );

    } finally {
        modificandoAsignacionTallerista = false;
        actualizarControlesTalleristas();
    }
}

// ======================================================
// QUITAR TALLERISTA
// ======================================================

async function quitarTalleristaDelTaller(talleristaId) {
    if (
        !tallerActual ||
        tallerActual.estado !== "Activo" ||
        modificandoAsignacionTallerista ||
        !Array.isArray(talleristasDelTaller)
    ) {
        return;
    }

    const tallerista = talleristasDelTaller.find(
        t => Number(t.tallerista_id) ===
            Number(talleristaId)
    );

    if (!tallerista) {
        return;
    }

    const confirmado = confirm(
        `¿Quitar a ${tallerista.nombre} ${tallerista.apellido} de este taller?`
    );

    if (!confirmado) {
        return;
    }

    modificandoAsignacionTallerista = true;
    actualizarControlesTalleristas();

    try {
        await enviarCambioTaller(
            `/talleres/${tallerActual.id}/talleristas/${talleristaId}`,
            "DELETE"
        );

        await cargarDetalleTaller(
            Number(tallerActual.id)
        );

    } catch (error) {
        console.error(
            "Error al quitar tallerista:",
            error
        );

        mostrarAlerta(
            "alerta-asignar-tallerista",
            error.message,
            "danger"
        );

    } finally {
        modificandoAsignacionTallerista = false;
        actualizarControlesTalleristas();
    }
}
