
/*
    TAREAS.JS - FRONTEND ALUMNO

    Responsabilidades:
    - Mostrar las tareas de los talleres en los que el alumno está inscripto.
    - Calcular el estado de cada tarea a partir de la entrega del alumno.
    - Filtrar por taller, estado y texto de búsqueda.
    - Mostrar fechas, notas y comentarios cuando existan.
    - Enlazar cada tarjeta con detalle-tarea.html?id=...

    Los datos provienen de DATOS_SIMULADOS y localStorage. Este módulo todavía
    no realiza peticiones a la API del backend.
*/

"use strict";

let tareasAlumnoActuales = [];
let talleresDisponiblesTareas = [];
let entregasAlumnoTareas = [];


// ==============================
// INICIALIZACIÓN
// ==============================

function inicializarTareas() {
    const contenedor = document.getElementById("contenedor-tareas");

    // Si por error el archivo se carga en otra página, no hace nada.
    if (!contenedor) {
        return;
    }

    try {
        validarDatosTareas();

        const datos = window.DATOS_SIMULADOS;
        const usuario = typeof obtenerUsuarioActual === "function"
            ? obtenerUsuarioActual()
            : datos.usuarioActual;
        const alumnoId = obtenerIdAlumnoTareas(usuario);

        if (!Number.isFinite(alumnoId)) {
            throw new Error("No se pudo identificar al alumno actual.");
        }

        const talleres = obtenerListadoTareas("talleres", datos.talleres);
        const inscripciones = obtenerListadoTareas("inscripciones", datos.inscripciones);
        const contenidos = obtenerListadoTareas("contenidos", datos.contenidos);
        const entregas = obtenerListadoTareas("entregas", datos.entregas);

        const idsTalleresAlumno = obtenerIdsTalleresInscriptoTareas(
            alumnoId,
            inscripciones
        );

        talleresDisponiblesTareas = talleres.filter((taller) =>
            taller && idsTalleresAlumno.has(Number(taller.id))
        );

        entregasAlumnoTareas = entregas.filter((entrega) =>
            entrega && Number(entrega.alumnoId) === alumnoId
        );

        const mapaTalleres = new Map(
            talleresDisponiblesTareas.map((taller) => [Number(taller.id), taller])
        );

        tareasAlumnoActuales = contenidos
            .filter((contenido) =>
                contenido &&
                normalizarTextoTareas(contenido.tipo) === "tarea" &&
                idsTalleresAlumno.has(Number(contenido.tallerId))
            )
            .map((tarea) => {
                const entrega = obtenerEntregaDeTareaTareas(
                    tarea.id,
                    alumnoId,
                    entregasAlumnoTareas
                );

                return {
                    ...tarea,
                    tallerNombre: mapaTalleres.get(Number(tarea.tallerId))?.nombre || "Taller",
                    estadoEntrega: obtenerEstadoEntregaTareas(entrega),
                    entregaAlumno: entrega
                };
            })
            .sort((a, b) => {
                const fechaA = String(a.fechaLimite || "9999-12-31");
                const fechaB = String(b.fechaLimite || "9999-12-31");
                return fechaA.localeCompare(fechaB) ||
                    String(a.titulo || "").localeCompare(String(b.titulo || ""), "es");
            });

        configurarFiltroTallerTareas(talleresDisponiblesTareas);
        configurarFiltrosTareas();
        renderizarTareasAlumno(tareasAlumnoActuales);
        ocultarErrorTareas();

    } catch (error) {
        console.error("Error al cargar las tareas del alumno:", error);
        mostrarErrorTareas(
            "No se pudieron cargar tus tareas. Recargá la página e intentá nuevamente."
        );
        mostrarEstadoVacioTareas(false);
    }
}


// ==============================
// VALIDACIÓN Y LECTURA DE DATOS
// ==============================

function validarDatosTareas() {
    const datos = window.DATOS_SIMULADOS;

    if (!datos || typeof datos !== "object") {
        throw new Error("No se encontraron los datos simulados.");
    }

    if (!datos.usuarioActual || typeof datos.usuarioActual !== "object") {
        throw new Error("No se encontró el usuario de demostración.");
    }

    ["talleres", "inscripciones", "contenidos", "entregas"].forEach((clave) => {
        if (!Array.isArray(datos[clave])) {
            throw new Error(`La lista de ${clave} no está disponible o no es válida.`);
        }
    });
}

function obtenerIdAlumnoTareas(usuario) {
    const valor = usuario?.alumnoId ?? usuario?.id;
    const id = Number(valor);
    return Number.isFinite(id) ? id : NaN;
}

function obtenerListadoTareas(clave, listaOriginal) {
    const original = Array.isArray(listaOriginal) ? listaOriginal : [];

    if (typeof obtenerListado === "function") {
        const listado = obtenerListado(clave, original);
        return Array.isArray(listado) ? listado : original;
    }

    try {
        const guardado = localStorage.getItem(clave);

        if (guardado === null) {
            return original;
        }

        const listado = JSON.parse(guardado);
        return Array.isArray(listado) ? listado : original;
    } catch (error) {
        console.warn(`No se pudo leer el listado "${clave}". Se usarán los datos iniciales.`, error);
        return original;
    }
}

function obtenerIdsTalleresInscriptoTareas(alumnoId, inscripciones) {
    const ids = new Set();

    inscripciones.forEach((inscripcion) => {
        if (!inscripcion || typeof inscripcion !== "object") {
            return;
        }

        // El formato de mock-data.js usa alumnoIds. También se admite alumnoId
        // singular para facilitar una futura normalización de datos de la API.
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

function obtenerEntregaDeTareaTareas(tareaId, alumnoId, entregas) {
    return entregas.find((entrega) =>
        Number(entrega?.contenidoId) === Number(tareaId) &&
        Number(entrega?.alumnoId) === alumnoId
    ) || null;
}

function obtenerEstadoEntregaTareas(entrega) {
    if (!entrega) {
        return "Pendiente";
    }

    const estado = normalizarTextoTareas(entrega.estado);

    if (estado === "corregida") {
        return "Corregida";
    }

    if (estado === "entregada") {
        return "Entregada";
    }

    if (estado === "pendiente") {
        return "Pendiente";
    }

    // Compatibilidad para entregas guardadas que aún no tengan estado explícito.
    return entrega.fechaEntrega ? "Entregada" : "Pendiente";
}


// ==============================
// FILTROS
// ==============================

function configurarFiltroTallerTareas(talleres) {
    const select = document.getElementById("filtro-taller");

    if (!select) {
        return;
    }

    // Conserva la opción general del HTML y reconstruye las opciones de talleres
    // para incluir solamente aquellos en los que el alumno está inscripto.
    select.replaceChildren();

    const opcionTodos = document.createElement("option");
    opcionTodos.value = "";
    opcionTodos.textContent = "Todos los talleres";
    select.appendChild(opcionTodos);

    talleres.forEach((taller) => {
        const opcion = document.createElement("option");
        opcion.value = String(taller.id);
        opcion.textContent = taller.nombre || `Taller ${taller.id}`;
        select.appendChild(opcion);
    });

    // detalle-taller.js enlaza a tareas.html?tallerId=ID, así que si la URL
    // trae ese parámetro dejamos seleccionado el taller correspondiente.
    const tallerSolicitado = typeof obtenerParametroURL === "function"
        ? obtenerParametroURL("tallerId")
        : new URLSearchParams(window.location.search).get("tallerId");

    if (
        tallerSolicitado &&
        talleres.some((taller) => Number(taller.id) === Number(tallerSolicitado))
    ) {
        select.value = String(Number(tallerSolicitado));
    } else {
        select.value = "";
    }
}

function configurarFiltrosTareas() {
    const filtroTaller = document.getElementById("filtro-taller");
    const filtroEstado = document.getElementById("filtro-estado");
    const buscador = document.getElementById("buscador-tareas");

    [filtroTaller, filtroEstado].forEach((control) => {
        if (!control || control.dataset.filtroTareasConfigurado === "true") {
            return;
        }

        control.dataset.filtroTareasConfigurado = "true";
        control.addEventListener("change", aplicarFiltrosTareas);
    });

    if (buscador && buscador.dataset.filtroTareasConfigurado !== "true") {
        buscador.dataset.filtroTareasConfigurado = "true";
        buscador.addEventListener("input", aplicarFiltrosTareas);
    }

    // Aplicamos el filtro inicial por taller, si llegó en la URL.
    aplicarFiltrosTareas();
}

function aplicarFiltrosTareas() {
    const filtroTaller = document.getElementById("filtro-taller");
    const filtroEstado = document.getElementById("filtro-estado");
    const buscador = document.getElementById("buscador-tareas");

    const tallerId = filtroTaller?.value || "";
    const estado = normalizarTextoTareas(filtroEstado?.value || "");
    const texto = normalizarTextoTareas(buscador?.value || "");

    const filtradas = tareasAlumnoActuales.filter((tarea) => {
        const coincideTaller = !tallerId || Number(tarea.tallerId) === Number(tallerId);
        const coincideEstado = !estado || normalizarTextoTareas(tarea.estadoEntrega) === estado;

        const textoBuscable = [tarea.titulo, tarea.descripcion, tarea.tallerNombre]
            .map(normalizarTextoTareas)
            .join(" ");
        const coincideTexto = !texto || textoBuscable.includes(texto);

        return coincideTaller && coincideEstado && coincideTexto;
    });

    renderizarTareasAlumno(filtradas);
}


// ==============================
// RENDERIZADO DE TAREAS
// ==============================

function renderizarTareasAlumno(tareas) {
    const contenedor = document.getElementById("contenedor-tareas");

    if (!contenedor) {
        return;
    }

    contenedor.replaceChildren();

    if (!Array.isArray(tareas) || tareas.length === 0) {
        mostrarEstadoVacioTareas(true);
        return;
    }

    mostrarEstadoVacioTareas(false);

    tareas.forEach((tarea) => {
        contenedor.appendChild(crearTarjetaTareaAlumno(tarea));
    });
}

function crearTarjetaTareaAlumno(tarea) {
    const tarjeta = document.createElement("article");
    tarjeta.className = "card mb-3 taller-card";

    const cuerpo = document.createElement("div");
    cuerpo.className = "card-body";

    const filaSuperior = document.createElement("div");
    filaSuperior.className = "d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2";

    const titulo = document.createElement("h2");
    titulo.className = "h5 fw-bold mb-0";
    titulo.textContent = tarea.titulo || "Tarea sin título";

    const estado = document.createElement("span");
    estado.className = `badge ${obtenerClaseEstadoTarea(tarea.estadoEntrega)}`;
    estado.textContent = tarea.estadoEntrega;
    filaSuperior.append(titulo, estado);

    const taller = document.createElement("p");
    taller.className = "text-muted small mb-2";
    taller.textContent = `Taller: ${tarea.tallerNombre || "Sin taller"}`;

    cuerpo.append(filaSuperior, taller);

    if (tarea.descripcion) {
        const descripcion = document.createElement("p");
        descripcion.className = "mb-3";
        descripcion.textContent = tarea.descripcion;
        cuerpo.appendChild(descripcion);
    }

    const fechas = document.createElement("div");
    fechas.className = "d-flex flex-wrap gap-3 small text-muted mb-3";

    if (tarea.fechaPublicacion) {
        const publicada = document.createElement("span");
        publicada.textContent = `Publicada: ${formatearFechaTareas(tarea.fechaPublicacion)}`;
        fechas.appendChild(publicada);
    }

    if (tarea.fechaLimite) {
        const limite = document.createElement("span");
        limite.textContent = `Fecha límite: ${formatearFechaTareas(tarea.fechaLimite)}`;
        fechas.appendChild(limite);

        if (
            tarea.estadoEntrega === "Pendiente" &&
            String(tarea.fechaLimite) < obtenerFechaActualTareas()
        ) {
            const vencimiento = document.createElement("span");
            vencimiento.className = "text-danger fw-semibold";
            vencimiento.textContent = "Plazo vencido";
            fechas.appendChild(vencimiento);
        }
    }

    if (fechas.childElementCount > 0) {
        cuerpo.appendChild(fechas);
    }

    const entrega = tarea.entregaAlumno;

    if (
        entrega &&
        entrega.nota !== null &&
        entrega.nota !== undefined &&
        entrega.nota !== ""
    ) {
        const nota = document.createElement("p");
        nota.className = "mb-2";
        const etiquetaNota = document.createElement("strong");
        etiquetaNota.textContent = "Nota: ";
        nota.append(etiquetaNota, document.createTextNode(String(entrega.nota)));
        cuerpo.appendChild(nota);
    }

    if (entrega?.comentario) {
        const comentario = document.createElement("p");
        comentario.className = "text-muted small mb-3";
        comentario.textContent = `Comentario del tallerista: ${entrega.comentario}`;
        cuerpo.appendChild(comentario);
    }

    const acciones = document.createElement("div");
    acciones.className = "d-flex justify-content-end";

    const enlace = document.createElement("a");
    enlace.className = "btn btn-outline-primary btn-sm";
    enlace.href = `detalle-tarea.html?id=${encodeURIComponent(String(tarea.id))}`;
    enlace.setAttribute("aria-label", `Ver detalle de ${tarea.titulo || "la tarea"}`);

    const icono = document.createElement("i");
    icono.className = "bi bi-eye me-1";
    icono.setAttribute("aria-hidden", "true");
    enlace.append(icono, document.createTextNode("Ver tarea"));

    acciones.appendChild(enlace);
    cuerpo.appendChild(acciones);
    tarjeta.appendChild(cuerpo);

    return tarjeta;
}

function obtenerClaseEstadoTarea(estado) {
    const clases = {
        pendiente: "text-bg-warning",
        entregada: "text-bg-info",
        corregida: "text-bg-success"
    };

    return clases[normalizarTextoTareas(estado)] || "text-bg-secondary";
}


// ==============================
// MENSAJES Y FUNCIONES AUXILIARES
// ==============================

function mostrarEstadoVacioTareas(mostrar) {
    const estadoVacio = document.getElementById("estado-vacio-tareas");

    if (estadoVacio) {
        estadoVacio.classList.toggle("d-none", !mostrar);
    }
}

function mostrarErrorTareas(mensaje) {
    const alerta = document.getElementById("alerta-tareas");

    if (!alerta) {
        return;
    }

    alerta.textContent = mensaje;
    alerta.classList.remove("d-none");
}

function ocultarErrorTareas() {
    const alerta = document.getElementById("alerta-tareas");

    if (!alerta) {
        return;
    }

    alerta.textContent = "";
    alerta.classList.add("d-none");
}

function normalizarTextoTareas(valor) {
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

function formatearFechaTareas(fecha) {
    if (typeof formatearFecha === "function") {
        return formatearFecha(fecha);
    }

    const coincidencia = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(fecha || ""));
    return coincidencia
        ? `${coincidencia[3]}/${coincidencia[2]}/${coincidencia[1]}`
        : "-";
}

function obtenerFechaActualTareas() {
    const ahora = new Date();
    const anio = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, "0");
    const dia = String(ahora.getDate()).padStart(2, "0");
    return `${anio}-${mes}-${dia}`;
}
