
/*
    ASISTENCIA.JS - FRONTEND ALUMNO

    Responsabilidades:
    - Consultar GET /mis-asistencias.
    - Mostrar únicamente las asistencias del alumno autenticado.
    - Calcular presencias, ausencias y porcentaje.
    - Filtrar el historial por taller.
    - Mostrar observaciones registradas por el tallerista.

    Pantalla de solo lectura conectada a la API real.
*/
"use strict";

let registrosAsistenciaAlumno = [];
let talleresAsistenciaAlumno = [];
let registrosAsistenciaFiltrados = [];


// ==============================
// INICIALIZACIÓN
// ==============================

async function inicializarAsistencia() {
    const tabla = document.getElementById("tabla-asistencia");

    if (!tabla) {
        return;
    }

    ocultarErrorAsistencia();

    try {
        // Consultar las asistencias reales del alumno autenticado.
        const respuesta = await fetch(
            "http://localhost:8002/mis-asistencias",
            {
                method: "GET",
                credentials: "include",
                headers: {
                    "Accept": "application/json"
                }
            }
        );

        const resultado = await respuesta.json();

        if (!respuesta.ok || !resultado.ok) {
            throw new Error(
                resultado.mensaje ||
                "No se pudieron obtener tus asistencias."
            );
        }

        if (!Array.isArray(resultado.datos)) {
            throw new Error(
                "La API devolvió un formato de asistencias inválido."
            );
        }

        // Adaptar los campos de MySQL al formato del frontend.
        registrosAsistenciaAlumno = resultado.datos.map((registro) => ({
            jornadaId: registro.asistencia_id,
            tallerId: Number(registro.taller_id),
            tallerNombre: registro.taller_nombre || "Taller",
            fecha: registro.fecha,
            estado: registro.estado,
            observaciones: registro.observaciones || ""
        }));

        // Construir el listado de talleres para el filtro.
        const talleresUnicos = new Map();

        registrosAsistenciaAlumno.forEach((registro) => {
            talleresUnicos.set(registro.tallerId, {
                id: registro.tallerId,
                nombre: registro.tallerNombre
            });
        });

        talleresAsistenciaAlumno = Array.from(
            talleresUnicos.values()
        );

        configurarFiltroTallerAsistencia();
        aplicarFiltroAsistencia();

        ocultarErrorAsistencia();

    } catch (error) {
        console.error(
            "Error al cargar la asistencia del alumno:",
            error
        );

        mostrarErrorAsistenciaAlumno(
            error.message ||
            "No se pudo cargar tu historial de asistencia."
        );

        registrosAsistenciaAlumno = [];
        talleresAsistenciaAlumno = [];

        configurarFiltroTallerAsistencia();
        mostrarResumenAsistencia([]);
        renderizarTablaAsistencia([]);
    }
}


// ==============================
// VALIDACIÓN Y LECTURA
// ==============================

function validarDatosAsistenciaAlumno() {
    const datos = window.DATOS_SIMULADOS;

    if (!datos || typeof datos !== "object") {
        throw new Error("No se encontraron los datos simulados.");
    }

    if (!datos.usuarioActual || typeof datos.usuarioActual !== "object") {
        throw new Error("No se encontró el usuario actual.");
    }

    ["talleres", "inscripciones", "asistencias"].forEach((clave) => {
        if (!Array.isArray(datos[clave])) {
            throw new Error(`La lista de ${clave} no está disponible o no es válida.`);
        }
    });
}

function obtenerIdAlumnoAsistencia(usuario) {
    const valor = usuario?.alumnoId ?? usuario?.id;
    const id = Number(valor);
    return Number.isFinite(id) ? id : NaN;
}

function obtenerListadoAsistencia(clave, listaOriginal) {
    const original = Array.isArray(listaOriginal) ? listaOriginal : [];

    if (typeof obtenerListado === "function") {
        const resultado = obtenerListado(clave, original);
        return Array.isArray(resultado) ? resultado : original;
    }

    try {
        const guardado = localStorage.getItem(clave);
        if (guardado === null) return original;

        const resultado = JSON.parse(guardado);
        return Array.isArray(resultado) ? resultado : original;
    } catch (error) {
        console.warn(`No se pudo leer "${clave}". Se usarán los datos iniciales.`, error);
        return original;
    }
}

function leerAsistenciasSimuladasGuardadas() {
    try {
        const guardado = localStorage.getItem("asistenciasSimuladas");
        if (!guardado) return [];

        const resultado = JSON.parse(guardado);
        return Array.isArray(resultado) ? resultado : [];
    } catch (error) {
        console.warn("No se pudieron leer las asistencias simuladas guardadas.", error);
        return [];
    }
}

function obtenerIdsTalleresAsistencia(alumnoId, inscripciones) {
    const ids = new Set();

    inscripciones.forEach((inscripcion) => {
        if (!inscripcion || typeof inscripcion !== "object") return;

        const idsAlumnos = Array.isArray(inscripcion.alumnoIds)
            ? inscripcion.alumnoIds
            : inscripcion.alumnoId !== undefined
                ? [inscripcion.alumnoId]
                : [];

        if (
            inscripcion.tallerId !== undefined &&
            idsAlumnos.some((id) => Number(id) === alumnoId)
        ) {
            ids.add(Number(inscripcion.tallerId));
        }
    });

    return ids;
}


// ==============================
// COMBINAR Y APLANAR JORNADAS
// ==============================

function combinarJornadasAsistencia(jornadasBase, jornadasLocales) {
    // La clave taller+fecha identifica una jornada. Si el tallerista guardó
    // una versión local para esa misma fecha, esa versión reemplaza al mock.
    const porClave = new Map();

    [...jornadasBase, ...jornadasLocales].forEach((jornada) => {
        if (!jornada || jornada.tallerId === undefined || !jornada.fecha) return;
        porClave.set(
            `${Number(jornada.tallerId)}|${String(jornada.fecha)}`,
            jornada
        );
    });

    return Array.from(porClave.values());
}

function aplanarRegistrosAsistencia(jornadas, alumnoId, idsTalleresAlumno, talleres) {
    const nombresTalleres = new Map(
        talleres.map((taller) => [Number(taller.id), taller.nombre || "Taller"])
    );
    const registros = [];
    const vistos = new Set();

    jornadas.forEach((jornada) => {
        const tallerId = Number(jornada?.tallerId);

        // No mostrar registros si el alumno no está inscripto en ese taller.
        if (!idsTalleresAlumno.has(tallerId) || !Array.isArray(jornada.registros)) {
            return;
        }

        jornada.registros.forEach((registro) => {
            if (!registro || Number(registro.alumnoId) !== alumnoId) return;

            const fecha = String(jornada.fecha);
            const claveRegistro = `${tallerId}|${fecha}|${alumnoId}`;
            if (vistos.has(claveRegistro)) return;
            vistos.add(claveRegistro);

            registros.push({
                jornadaId: jornada.id ?? null,
                tallerId,
                tallerNombre: nombresTalleres.get(tallerId) || "Taller",
                fecha,
                estado: registro.estado || "Sin registrar",
                observaciones: registro.observaciones || ""
            });
        });
    });

    // Más recientes primero. Las fechas del modelo vienen como YYYY-MM-DD.
    return registros.sort((a, b) => b.fecha.localeCompare(a.fecha));
}


// ==============================
// FILTRO POR TALLER
// ==============================

function configurarFiltroTallerAsistencia() {
    const select = document.getElementById("filtro-taller-asistencia");
    if (!select) return;

    select.replaceChildren();

    const opcionTodos = document.createElement("option");
    opcionTodos.value = "";
    opcionTodos.textContent = "Todos los talleres";
    select.appendChild(opcionTodos);

    talleresAsistenciaAlumno.forEach((taller) => {
        const opcion = document.createElement("option");
        opcion.value = String(taller.id);
        opcion.textContent = taller.nombre || `Taller ${taller.id}`;
        select.appendChild(opcion);
    });

    // El detalle de taller llega aquí con asistencia.html?tallerId=ID.
    const tallerSolicitado = typeof obtenerParametroURL === "function"
        ? obtenerParametroURL("tallerId")
        : new URLSearchParams(window.location.search).get("tallerId");

    if (
        tallerSolicitado &&
        talleresAsistenciaAlumno.some((taller) => Number(taller.id) === Number(tallerSolicitado))
    ) {
        select.value = String(Number(tallerSolicitado));
    } else {
        select.value = "";
    }

    if (select.dataset.asistenciaConfigurada !== "true") {
        select.dataset.asistenciaConfigurada = "true";
        select.addEventListener("change", aplicarFiltroAsistencia);
    }
}

function aplicarFiltroAsistencia() {
    const select = document.getElementById("filtro-taller-asistencia");
    const tallerId = select?.value || "";

    registrosAsistenciaFiltrados = !tallerId
        ? [...registrosAsistenciaAlumno]
        : registrosAsistenciaAlumno.filter(
            (registro) => Number(registro.tallerId) === Number(tallerId)
        );

    mostrarResumenAsistencia(registrosAsistenciaFiltrados);
    renderizarTablaAsistencia(registrosAsistenciaFiltrados);
}


// ==============================
// RESUMEN
// ==============================

function mostrarResumenAsistencia(registros) {
    const total = registros.length;
    const presentes = registros.filter(
        (registro) => normalizarEstadoAsistencia(registro.estado) === "presente"
    ).length;
    const ausencias = registros.filter(
        (registro) => normalizarEstadoAsistencia(registro.estado) === "ausente"
    ).length;

    // Al no tener registros, mostramos un guion en vez de afirmar que el alumno
    // tiene 0 % de asistencia; no hay datos suficientes para calcularlo.
    const porcentaje = total > 0 ? `${Math.round((presentes / total) * 100)}%` : "—";

    colocarTextoAsistencia("resumen-porcentaje", porcentaje);
    colocarTextoAsistencia("resumen-presentes", presentes);
    colocarTextoAsistencia("resumen-ausencias", ausencias);
}


// ==============================
// TABLA DE HISTORIAL
// ==============================

function renderizarTablaAsistencia(registros) {
    const tabla = document.getElementById("tabla-asistencia");
    if (!tabla) return;

    tabla.replaceChildren();

    if (!Array.isArray(registros) || registros.length === 0) {
        const fila = document.createElement("tr");
        const celda = document.createElement("td");
        celda.colSpan = 4;
        celda.className = "text-center text-muted py-4";
        celda.textContent = "Todavía no hay registros de asistencia para los filtros seleccionados.";
        fila.appendChild(celda);
        tabla.appendChild(fila);
        return;
    }

    registros.forEach((registro) => {
        const fila = document.createElement("tr");

        const celdaFecha = document.createElement("td");
        celdaFecha.textContent = formatearFechaAsistencia(registro.fecha);

        const celdaTaller = document.createElement("td");
        celdaTaller.textContent = registro.tallerNombre;

        const celdaEstado = document.createElement("td");
        const badge = document.createElement("span");
        badge.className = `badge ${obtenerClaseEstadoAsistencia(registro.estado)}`;
        badge.textContent = registro.estado;
        celdaEstado.appendChild(badge);

        const celdaObservaciones = document.createElement("td");
        celdaObservaciones.textContent = registro.observaciones.trim()
            ? registro.observaciones
            : "—";

        fila.append(celdaFecha, celdaTaller, celdaEstado, celdaObservaciones);
        tabla.appendChild(fila);
    });
}

function obtenerClaseEstadoAsistencia(estado) {
    const clases = {
        presente: "text-bg-success",
        ausente: "text-bg-danger",
        justificado: "text-bg-info"
    };

    return clases[normalizarEstadoAsistencia(estado)] ||
        "text-bg-secondary";
}


// ==============================
// FUNCIONES AUXILIARES
// ==============================

function normalizarEstadoAsistencia(valor) {
    if (typeof normalizarTexto === "function") {
        return normalizarTexto(valor);
    }

    if (valor === null || valor === undefined) return "";

    return String(valor)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

function formatearFechaAsistencia(fecha) {
    if (typeof formatearFecha === "function") {
        return formatearFecha(fecha);
    }

    const coincidencia = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(fecha || ""));
    return coincidencia
        ? `${coincidencia[3]}/${coincidencia[2]}/${coincidencia[1]}`
        : "-";
}

function colocarTextoAsistencia(elementoId, valor) {
    if (typeof colocarTexto === "function") {
        colocarTexto(elementoId, valor);
        return;
    }

    const elemento = document.getElementById(elementoId);
    if (elemento) {
        elemento.textContent = valor === null || valor === undefined ? "-" : String(valor);
    }
}

function mostrarErrorAsistenciaAlumno(mensaje) {
    const alerta = document.getElementById("alerta-asistencia");
    if (!alerta) return;

    alerta.className = "alert alert-danger";
    alerta.setAttribute("role", "alert");
    alerta.textContent = mensaje;
    alerta.classList.remove("d-none");
}

function ocultarErrorAsistencia() {
    const alerta = document.getElementById("alerta-asistencia");
    if (!alerta) return;

    alerta.textContent = "";
    alerta.classList.add("d-none");
}
