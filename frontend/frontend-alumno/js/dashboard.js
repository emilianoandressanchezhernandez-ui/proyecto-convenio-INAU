
/*
    DASHBOARD.JS - FRONTEND ALUMNO

    Responsabilidades:
    - Saludar al alumno.
    - Mostrar cuántos talleres tiene asignados por inscripción.
    - Contar sus tareas sin entrega.
    - Calcular su porcentaje de asistencia.
    - Mostrar tareas pendientes con fecha límite futura.

    Los datos provienen de DATOS_SIMULADOS y de los listados guardados en
    localStorage. Esta implementación todavía no consulta la API del backend.
*/

"use strict";

function inicializarDashboard() {
    try {
        validarDatosDashboard();

        const datos = window.DATOS_SIMULADOS;
        const usuario = obtenerUsuarioActual();
        const alumnoId = obtenerIdAlumnoDashboard(usuario);

        if (!Number.isFinite(alumnoId)) {
            throw new Error("No se pudo determinar el ID del alumno actual.");
        }

        const inscripciones = obtenerListadoDashboard(
            "inscripciones",
            datos.inscripciones
        );
        const talleres = obtenerListadoDashboard("talleres", datos.talleres);
        const contenidos = obtenerListadoDashboard("contenidos", datos.contenidos);
        const entregas = obtenerListadoDashboard("entregas", datos.entregas);
        const asistencias = obtenerListadoDashboard("asistencias", datos.asistencias);

        const idsTalleresAlumno = obtenerIdsTalleresAlumnoDashboard(
            alumnoId,
            inscripciones
        );

        const talleresAlumno = talleres.filter((taller) =>
            idsTalleresAlumno.has(Number(taller.id))
        );

        const tareasAlumno = contenidos.filter((contenido) =>
            normalizarTextoDashboard(contenido.tipo) === "tarea" &&
            idsTalleresAlumno.has(Number(contenido.tallerId))
        );

        const entregasAlumno = entregas.filter((entrega) =>
            Number(entrega.alumnoId) === alumnoId
        );

        mostrarSaludoDashboard(usuario);
        colocarTextoDashboard("cantidad-talleres-dashboard", talleresAlumno.length);
        colocarTextoDashboard(
            "tareas-pendientes-dashboard",
            contarTareasPendientesDashboard(tareasAlumno, entregasAlumno)
        );

        const porcentajeAsistencia = calcularAsistenciaPromedioDashboard(
            asistencias,
            alumnoId,
            idsTalleresAlumno
        );

        colocarTextoDashboard(
            "asistencia-promedio-dashboard",
            porcentajeAsistencia === null ? "—" : `${porcentajeAsistencia}%`
        );

        mostrarProximasTareasDashboard(
            tareasAlumno,
            entregasAlumno,
            talleresAlumno
        );

        ocultarAlertaDashboard();
    } catch (error) {
        console.error("Error al inicializar el dashboard del alumno:", error);
        mostrarErrorDashboard("No se pudieron cargar los datos del panel. Recargá la página e intentá nuevamente.");
    }
}


// ==============================
// VALIDACIÓN Y LISTADOS
// ==============================

function validarDatosDashboard() {
    const datos = window.DATOS_SIMULADOS;

    if (!datos || typeof datos !== "object") {
        throw new Error("No se encontraron los datos simulados.");
    }

    const listadosNecesarios = [
        "talleres",
        "inscripciones",
        "contenidos",
        "entregas",
        "asistencias"
    ];

    listadosNecesarios.forEach((clave) => {
        if (!Array.isArray(datos[clave])) {
            throw new Error(`La lista de ${clave} no está disponible o no es válida.`);
        }
    });

    if (!datos.usuarioActual || typeof datos.usuarioActual !== "object") {
        throw new Error("No se encontró el alumno de demostración.");
    }
}

function obtenerListadoDashboard(clave, listadoOriginal) {
    // obtenerListado viene de utils.js. El respaldo mantiene esta pantalla
    // funcional también si el helper todavía no está disponible.
    if (typeof obtenerListado === "function") {
        const resultado = obtenerListado(clave, listadoOriginal);
        return Array.isArray(resultado) ? resultado : listadoOriginal;
    }

    try {
        const guardado = localStorage.getItem(clave);
        if (guardado !== null) {
            const parseado = JSON.parse(guardado);
            return Array.isArray(parseado) ? parseado : listadoOriginal;
        }
    } catch (error) {
        console.warn(`No se pudo leer el listado "${clave}". Se usarán los datos iniciales.`, error);
    }

    return listadoOriginal;
}

function obtenerIdAlumnoDashboard(usuario) {
    const id = usuario?.id ?? usuario?.alumnoId;
    const idNumerico = Number(id);
    return Number.isFinite(idNumerico) ? idNumerico : NaN;
}

function obtenerIdsTalleresAlumnoDashboard(alumnoId, inscripciones) {
    const ids = new Set();

    inscripciones.forEach((inscripcion) => {
        if (!inscripcion || typeof inscripcion !== "object") {
            return;
        }

        // El mock del proyecto usa alumnoIds: [1]. También se admite alumnoId
        // singular para tolerar datos que ya vengan normalizados desde una API.
        const idsAlumnos = Array.isArray(inscripcion.alumnoIds)
            ? inscripcion.alumnoIds
            : inscripcion.alumnoId !== undefined
                ? [inscripcion.alumnoId]
                : [];

        const perteneceAlAlumno = idsAlumnos.some(
            (id) => Number(id) === alumnoId
        );

        if (perteneceAlAlumno && inscripcion.tallerId !== undefined) {
            ids.add(Number(inscripcion.tallerId));
        }
    });

    return ids;
}


// ==============================
// SALUDO Y CONTADORES
// ==============================

function mostrarSaludoDashboard(usuario) {
    const nombre = usuario?.nombre || "Alumno";
    colocarTextoDashboard("titulo-bienvenida", `Bienvenido, ${nombre}`);
}

function contarTareasPendientesDashboard(tareas, entregasAlumno) {
    return tareas.filter((tarea) => {
        return !entregasAlumno.some((entrega) =>
            Number(entrega.contenidoId) === Number(tarea.id) &&
            normalizarTextoDashboard(entrega.estado) !== "pendiente"
        );
    }).length;
}

function calcularAsistenciaPromedioDashboard(asistencias, alumnoId, idsTalleresAlumno) {
    let totalRegistros = 0;
    let totalPresentes = 0;

    asistencias.forEach((jornada) => {
        if (
            !jornada ||
            !idsTalleresAlumno.has(Number(jornada.tallerId)) ||
            !Array.isArray(jornada.registros)
        ) {
            return;
        }

        jornada.registros.forEach((registro) => {
            if (!registro || Number(registro.alumnoId) !== alumnoId) {
                return;
            }

            const estado = normalizarTextoDashboard(registro.estado);

            // Solo contamos registros cuyo estado está definido. "Justificado"
            // cuenta como una jornada registrada, pero no como presencia.
            if (!estado) {
                return;
            }

            totalRegistros++;
            if (estado === "presente") {
                totalPresentes++;
            }
        });
    });

    if (totalRegistros === 0) {
        return null;
    }

    return Math.round((totalPresentes / totalRegistros) * 100);
}


// ==============================
// PRÓXIMAS ENTREGAS
// ==============================

function mostrarProximasTareasDashboard(tareas, entregasAlumno, talleresAlumno) {
    const contenedor = document.getElementById("contenedor-proximas-tareas");

    if (!contenedor) {
        return;
    }

    contenedor.replaceChildren();

    const hoy = obtenerFechaActualDashboard();
    const talleresPorId = new Map(
        talleresAlumno.map((taller) => [Number(taller.id), taller])
    );

    const tareasProximas = tareas
        .filter((tarea) => {
            if (!tarea.fechaLimite || String(tarea.fechaLimite) < hoy) {
                return false;
            }

            const entregaExistente = entregasAlumno.some((entrega) =>
                Number(entrega.contenidoId) === Number(tarea.id) &&
                normalizarTextoDashboard(entrega.estado) !== "pendiente"
            );

            return !entregaExistente;
        })
        .sort((a, b) => String(a.fechaLimite).localeCompare(String(b.fechaLimite)));

    if (tareasProximas.length === 0) {
        const mensaje = document.createElement("p");
        mensaje.className = "text-muted mb-0";
        mensaje.textContent = "No tenés entregas pendientes con fecha próxima.";
        contenedor.appendChild(mensaje);
        return;
    }

    const lista = document.createElement("div");
    lista.className = "list-group list-group-flush";

    tareasProximas.forEach((tarea) => {
        const taller = talleresPorId.get(Number(tarea.tallerId));
        const elemento = document.createElement("div");
        elemento.className = "list-group-item px-0 py-3";

        const fila = document.createElement("div");
        fila.className = "d-flex justify-content-between align-items-center flex-wrap gap-3";

        const informacion = document.createElement("div");
        informacion.className = "flex-grow-1";

        const titulo = document.createElement("h6");
        titulo.className = "fw-bold mb-1";
        titulo.textContent = tarea.titulo || "Tarea sin título";

        const tallerTexto = document.createElement("p");
        tallerTexto.className = "text-muted small mb-1";
        tallerTexto.textContent = taller ? taller.nombre : "Taller";

        const fecha = document.createElement("p");
        fecha.className = "small mb-0";
        const fechaFormateada = typeof formatearFecha === "function"
            ? formatearFecha(tarea.fechaLimite)
            : String(tarea.fechaLimite);
        fecha.textContent = `Fecha límite: ${fechaFormateada}`;

        informacion.append(titulo, tallerTexto, fecha);

        const enlace = document.createElement("a");
        enlace.className = "btn btn-sm btn-outline-primary";
        enlace.href = `detalle-tarea.html?id=${encodeURIComponent(String(tarea.id))}`;
        enlace.textContent = "Ver tarea";
        enlace.setAttribute("aria-label", `Ver tarea ${tarea.titulo || tarea.id}`);

        fila.append(informacion, enlace);
        elemento.appendChild(fila);
        lista.appendChild(elemento);
    });

    contenedor.appendChild(lista);
}

function obtenerFechaActualDashboard() {
    const ahora = new Date();
    const anio = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, "0");
    const dia = String(ahora.getDate()).padStart(2, "0");
    return `${anio}-${mes}-${dia}`;
}


// ==============================
// PRESENTACIÓN Y ERRORES
// ==============================

function normalizarTextoDashboard(valor) {
    if (typeof normalizarTexto === "function") {
        return normalizarTexto(valor);
    }

    if (valor === null || valor === undefined) {
        return "";
    }

    return String(valor)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

function colocarTextoDashboard(elementoId, contenido) {
    const elemento = document.getElementById(elementoId);

    if (!elemento) {
        console.warn(`No se encontró el elemento HTML con id "${elementoId}".`);
        return;
    }

    elemento.textContent = contenido === null || contenido === undefined
        ? "-"
        : String(contenido);
}

function ocultarAlertaDashboard() {
    const alerta = document.getElementById("alerta-dashboard");
    if (alerta) {
        alerta.classList.add("d-none");
    }
}

function mostrarErrorDashboard(mensaje) {
    const alerta = document.getElementById("alerta-dashboard");

    if (!alerta) {
        return;
    }

    alerta.textContent = mensaje;
    alerta.classList.remove("d-none");
}
