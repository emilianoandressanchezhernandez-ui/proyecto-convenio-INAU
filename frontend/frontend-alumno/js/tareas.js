
/*
    TAREAS.JS - FRONTEND ALUMNO
    ==================================================================

    Responsabilidades:

    - Mostrar las tareas de los talleres en los que el alumno está inscripto.
    - Consultar tareas y entregas reales desde la API.
    - Calcular el estado de cada tarea a partir de la entrega del alumno.
    - Filtrar por taller, estado y texto de búsqueda.
    - Mostrar fechas, notas y comentarios cuando existan.
    - Enlazar cada tarjeta con detalle-tarea.html?id=...

    Los datos se consultan desde MySQL mediante la API PHP.
    ==================================================================
*/

"use strict";

let tareasAlumnoActuales = [];
let talleresDisponiblesTareas = [];
let entregasAlumnoTareas = [];


// ==============================
// INICIALIZACIÓN
// ==============================

async function inicializarTareas() {
    const contenedor = document.getElementById("contenedor-tareas");

    // Si por error el archivo se carga en otra página, no hace nada.
    if (!contenedor) {
        return;
    }

    try {
        const consultarAPI = async (ruta) => {
            const respuesta = await fetch(
                `http://localhost:8002${ruta}`,
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
                    resultado.mensaje || "Error al consultar la API."
                );
            }

            return resultado.datos;
        };

        // Obtener los talleres reales del alumno autenticado.
        const talleres = await consultarAPI("/mis-talleres");

        if (!Array.isArray(talleres)) {
            throw new Error("La lista de talleres no es válida.");
        }

        talleresDisponiblesTareas = talleres.map((taller) => ({
            id: Number(taller.id),
            nombre: taller.nombre
        }));

        // Consultar los contenidos de cada taller.
        const contenidosPorTaller = await Promise.all(
            talleres.map(async (taller) => {
                const contenidos = await consultarAPI(
                    `/talleres/${encodeURIComponent(taller.id)}/contenidos`
                );

                if (!Array.isArray(contenidos)) {
                    throw new Error("La lista de contenidos no es válida.");
                }

                return contenidos;
            })
        );

        // Mostrar únicamente contenidos de tipo Tarea.
        const contenidosTarea = contenidosPorTaller
            .flat()
            .filter((contenido) =>
                contenido &&
                normalizarTextoTareas(contenido.tipo) === "tarea"
            );

        const mapaTalleres = new Map(
            talleresDisponiblesTareas.map((taller) => [
                taller.id,
                taller.nombre
            ])
        );

        // Consultar la entrega del alumno para cada tarea.
        tareasAlumnoActuales = await Promise.all(
            contenidosTarea.map(async (contenido) => {
                const entrega = await consultarAPI(
                    `/contenidos/${encodeURIComponent(contenido.id)}/mi-entrega`
                );

                return {
                    id: Number(contenido.id),
                    tallerId: Number(contenido.taller_id),
                    tallerNombre:
                        mapaTalleres.get(Number(contenido.taller_id)) ||
                        "Taller",
                    tipo: contenido.tipo,
                    titulo: contenido.titulo,
                    descripcion: contenido.descripcion,
                    fechaPublicacion: contenido.fecha_publicacion,
                    fechaLimite: contenido.fecha_limite,
                    estadoEntrega: obtenerEstadoEntregaTareas(entrega),
                    entregaAlumno: entrega
                };
            })
        );

        // Ordenar por fecha límite.
        tareasAlumnoActuales.sort((a, b) => {
            const fechaA = String(a.fechaLimite || "9999-12-31");
            const fechaB = String(b.fechaLimite || "9999-12-31");

            return fechaA.localeCompare(fechaB) ||
                String(a.titulo || "").localeCompare(
                    String(b.titulo || ""),
                    "es"
                );
        });

        configurarFiltroTallerTareas(talleresDisponiblesTareas);
        configurarFiltrosTareas();
        ocultarErrorTareas();

    } catch (error) {
        console.error(
            "Error al cargar las tareas del alumno:",
            error
        );

        mostrarErrorTareas(
            error.message ||
            "No se pudieron cargar tus tareas."
        );

        tareasAlumnoActuales = [];
        renderizarTareasAlumno([]);
    }
}


// ==============================
// ESTADO DE ENTREGA
// ==============================

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

    // Compatibilidad con entregas que no tengan estado explícito.
    // La API real utiliza fecha_entrega.
    return entrega.fecha_entrega ? "Entregada" : "Pendiente";
}


// ==============================
// FILTROS
// ==============================

function configurarFiltroTallerTareas(talleres) {
    const select = document.getElementById("filtro-taller");

    if (!select) {
        return;
    }

    // Reconstruir las opciones utilizando los talleres reales.
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

    // Permitir filtrar desde tareas.html?tallerId=ID.
    const tallerSolicitado = typeof obtenerParametroURL === "function"
        ? obtenerParametroURL("tallerId")
        : new URLSearchParams(window.location.search).get("tallerId");

    if (
        tallerSolicitado &&
        talleres.some(
            (taller) => Number(taller.id) === Number(tallerSolicitado)
        )
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
        if (
            !control ||
            control.dataset.filtroTareasConfigurado === "true"
        ) {
            return;
        }

        control.dataset.filtroTareasConfigurado = "true";
        control.addEventListener("change", aplicarFiltrosTareas);
    });

    if (
        buscador &&
        buscador.dataset.filtroTareasConfigurado !== "true"
    ) {
        buscador.dataset.filtroTareasConfigurado = "true";
        buscador.addEventListener("input", aplicarFiltrosTareas);
    }

    // Aplicar el filtro inicial, incluido tallerId de la URL.
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
        const coincideTaller =
            !tallerId ||
            Number(tarea.tallerId) === Number(tallerId);

        const coincideEstado =
            !estado ||
            normalizarTextoTareas(tarea.estadoEntrega) === estado;

        const textoBuscable = [
            tarea.titulo,
            tarea.descripcion,
            tarea.tallerNombre
        ]
            .map(normalizarTextoTareas)
            .join(" ");

        const coincideTexto =
            !texto || textoBuscable.includes(texto);

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
    filaSuperior.className =
        "d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2";

    const titulo = document.createElement("h2");
    titulo.className = "h5 fw-bold mb-0";
    titulo.textContent = tarea.titulo || "Tarea sin título";

    const estado = document.createElement("span");
    estado.className =
        `badge ${obtenerClaseEstadoTarea(tarea.estadoEntrega)}`;
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
        publicada.textContent =
            `Publicada: ${formatearFechaTareas(tarea.fechaPublicacion)}`;

        fechas.appendChild(publicada);
    }

    if (tarea.fechaLimite) {
        const limite = document.createElement("span");
        limite.textContent =
            `Fecha límite: ${formatearFechaTareas(tarea.fechaLimite)}`;

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

        nota.append(
            etiquetaNota,
            document.createTextNode(String(entrega.nota))
        );

        cuerpo.appendChild(nota);
    }

    if (entrega?.comentario) {
        const comentario = document.createElement("p");
        comentario.className = "text-muted small mb-3";
        comentario.textContent =
            `Comentario del tallerista: ${entrega.comentario}`;

        cuerpo.appendChild(comentario);
    }

    const acciones = document.createElement("div");
    acciones.className = "d-flex justify-content-end";

    const enlace = document.createElement("a");
    enlace.className = "btn btn-outline-primary btn-sm";
    enlace.href =
        `detalle-tarea.html?id=${encodeURIComponent(String(tarea.id))}`;

    enlace.setAttribute(
        "aria-label",
        `Ver detalle de ${tarea.titulo || "la tarea"}`
    );

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

    return clases[normalizarTextoTareas(estado)] ||
        "text-bg-secondary";
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

    const coincidencia =
        /^(\d{4})-(\d{2})-(\d{2})/.exec(String(fecha || ""));

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
