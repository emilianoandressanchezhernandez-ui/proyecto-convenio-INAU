
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


async function inicializarDashboard() {
    ocultarAlertaDashboard();

    try {
        const apiBase = "http://localhost:8002";

        async function consultarAPI(ruta) {
            const respuesta = await fetch(apiBase + ruta, {
                method: "GET",
                credentials: "include",
                headers: {
                    "Accept": "application/json"
                }
            });

            const resultado = await respuesta.json();

            if (!respuesta.ok || !resultado.ok) {
                throw new Error(
                    resultado.mensaje ||
                    "No se pudieron consultar los datos."
                );
            }

            return resultado.datos;
        }

        // Obtener información real del alumno y sus talleres.
        const [usuario, talleres, asistencias] = await Promise.all([
            consultarAPI("/perfil"),
            consultarAPI("/mis-talleres"),
            consultarAPI("/mis-asistencias")
        ]);

        if (!Array.isArray(talleres) || !Array.isArray(asistencias)) {
            throw new Error("La API devolvió datos inválidos.");
        }

        mostrarSaludoDashboard(usuario);

        colocarTextoDashboard(
            "cantidad-talleres-dashboard",
            talleres.length
        );

        // Calcular asistencia usando únicamente registros reales.
        const totalAsistencias = asistencias.length;

        const presentes = asistencias.filter(
            registro =>
                normalizarTextoDashboard(registro.estado) === "presente"
        ).length;

        const porcentaje = totalAsistencias > 0
            ? `${Math.round(presentes / totalAsistencias * 100)}%`
            : "—";

        colocarTextoDashboard(
            "asistencia-promedio-dashboard",
            porcentaje
        );

        // Consultar los contenidos de todos los talleres.
        const contenidosPorTaller = await Promise.all(
            talleres.map(async taller => {
                const contenidos = await consultarAPI(
                    `/talleres/${encodeURIComponent(taller.id)}/contenidos`
                );

                if (!Array.isArray(contenidos)) {
                    throw new Error("La lista de contenidos es inválida.");
                }

                return contenidos;
            })
        );

        const tareas = contenidosPorTaller
            .flat()
            .filter(contenido =>
                normalizarTextoDashboard(contenido.tipo) === "tarea"
            );

        // Consultar la entrega propia de cada tarea.
        const tareasConEntrega = await Promise.all(
            tareas.map(async tarea => {
                const entrega = await consultarAPI(
                    `/contenidos/${encodeURIComponent(tarea.id)}/mi-entrega`
                );

                return {
                    id: tarea.id,
                    titulo: tarea.titulo,
                    tallerId: Number(tarea.taller_id),
                    fechaLimite: tarea.fecha_limite,
                    entregaAlumno: entrega
                };
            })
        );

        // Pendiente significa que no existe una entrega.
        const tareasPendientes = tareasConEntrega.filter(
            tarea => tarea.entregaAlumno === null
        );

        colocarTextoDashboard(
            "tareas-pendientes-dashboard",
            tareasPendientes.length
        );

        const talleresNormalizados = talleres.map(taller => ({
            id: Number(taller.id),
            nombre: taller.nombre
        }));

        // La función existente construye las próximas entregas.
        mostrarProximasTareasDashboard(
            tareasPendientes,
            [],
            talleresNormalizados
        );

        ocultarAlertaDashboard();

    } catch (error) {
        console.error(
            "Error al cargar el dashboard del alumno:",
            error
        );

        mostrarErrorDashboard(
            error.message ||
            "No se pudieron cargar los datos del panel."
        );
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
