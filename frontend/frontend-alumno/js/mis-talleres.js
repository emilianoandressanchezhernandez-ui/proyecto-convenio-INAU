
/*
    MIS-TALLERES.JS - FRONTEND ALUMNO

    Responsabilidades:
    - Mostrar únicamente los talleres en los que está inscripto el alumno.
    - Permitir buscar por nombre o estado.
    - Renderizar tarjetas con información útil y un acceso al detalle.
    - Mostrar el estado vacío o una alerta si ocurre un error.

    Los datos se leen de DATOS_SIMULADOS y de localStorage mediante obtenerListado.
    Esta versión todavía no consulta la API del backend.
*/

"use strict";

let talleresDelAlumnoActuales = [];


// ==============================
// INICIALIZACIÓN
// ==============================

function inicializarMisTalleres() {
    const contenedor = document.getElementById("contenedor-talleres");

    // Evita ejecutar este módulo si se cargó por error en otra página.
    if (!contenedor) {
        return;
    }

    try {
        validarDatosMisTalleres();

        const datos = window.DATOS_SIMULADOS;
        const usuario = typeof obtenerUsuarioActual === "function"
            ? obtenerUsuarioActual()
            : datos.usuarioActual;
        const alumnoId = obtenerIdAlumnoMisTalleres(usuario);

        if (!Number.isFinite(alumnoId)) {
            throw new Error("No se pudo identificar al alumno actual.");
        }

        const talleres = obtenerListadoMisTalleres("talleres", datos.talleres);
        const inscripciones = obtenerListadoMisTalleres("inscripciones", datos.inscripciones);

        talleresDelAlumnoActuales = obtenerTalleresDelAlumno(
            alumnoId,
            talleres,
            inscripciones
        );

        configurarBuscadorMisTalleres();
        renderizarTalleresMisTalleres(talleresDelAlumnoActuales);
        ocultarErrorMisTalleres();
    } catch (error) {
        console.error("Error al cargar los talleres del alumno:", error);
        mostrarErrorMisTalleres(
            "No se pudieron cargar tus talleres. Recargá la página e intentá nuevamente."
        );
    }
}

function validarDatosMisTalleres() {
    const datos = window.DATOS_SIMULADOS;

    if (!datos || typeof datos !== "object") {
        throw new Error("No se encontró DATOS_SIMULADOS.");
    }

    if (!datos.usuarioActual || typeof datos.usuarioActual !== "object") {
        throw new Error("No se encontró el usuario de demostración.");
    }

    if (!Array.isArray(datos.talleres)) {
        throw new Error("La lista de talleres no es válida.");
    }

    if (!Array.isArray(datos.inscripciones)) {
        throw new Error("La lista de inscripciones no es válida.");
    }
}

function obtenerIdAlumnoMisTalleres(usuario) {
    const idAlumno = usuario?.alumnoId ?? usuario?.id;
    const idNumerico = Number(idAlumno);
    return Number.isFinite(idNumerico) ? idNumerico : NaN;
}

function obtenerListadoMisTalleres(clave, listaOriginal) {
    if (typeof obtenerListado === "function") {
        const resultado = obtenerListado(clave, listaOriginal);
        return Array.isArray(resultado) ? resultado : listaOriginal;
    }

    // Respaldo por si en algún contexto no estuviera disponible utils.js.
    try {
        const datoGuardado = localStorage.getItem(clave);

        if (datoGuardado !== null) {
            const listado = JSON.parse(datoGuardado);
            return Array.isArray(listado) ? listado : listaOriginal;
        }
    } catch (error) {
        console.warn(
            `No se pudo leer "${clave}" desde localStorage.`,
            error
        );
    }

    return listaOriginal;
}


// ==============================
// OBTENCIÓN DE INSCRIPCIONES
// ==============================

function obtenerTalleresDelAlumno(alumnoId, talleres, inscripciones) {
    const idsTalleresInscripto = new Set();

    inscripciones.forEach((inscripcion) => {
        if (!inscripcion || typeof inscripcion !== "object") {
            return;
        }

        // Los datos simulados usan alumnoIds: [1].
        // También se admite alumnoId singular por compatibilidad.
        const idsAlumnos = Array.isArray(inscripcion.alumnoIds)
            ? inscripcion.alumnoIds
            : inscripcion.alumnoId !== undefined
                ? [inscripcion.alumnoId]
                : [];

        const estaInscripto = idsAlumnos.some(
            (id) => Number(id) === alumnoId
        );

        if (estaInscripto && inscripcion.tallerId !== undefined) {
            idsTalleresInscripto.add(Number(inscripcion.tallerId));
        }
    });

    return talleres.filter((taller) =>
        taller && idsTalleresInscripto.has(Number(taller.id))
    );
}


// ==============================
// BUSCADOR
// ==============================

function configurarBuscadorMisTalleres() {
    const input = document.getElementById("buscador-talleres");
    const boton = document.getElementById("btn-buscar");

    if (!input || !boton) {
        return;
    }

    // Evita duplicar listeners si el inicializador se ejecuta otra vez.
    if (boton.dataset.busquedaConfigurada === "true") {
        return;
    }

    boton.dataset.busquedaConfigurada = "true";
    boton.addEventListener("click", buscarTalleresMisTalleres);

    input.addEventListener("keydown", (evento) => {
        if (evento.key === "Enter") {
            evento.preventDefault();
            buscarTalleresMisTalleres();
        }
    });

    // Si se borra la búsqueda por completo, volvemos a mostrar todas las tarjetas.
    input.addEventListener("input", () => {
        if (input.value.trim() === "") {
            renderizarTalleresMisTalleres(talleresDelAlumnoActuales);
        }
    });
}

function buscarTalleresMisTalleres() {
    const input = document.getElementById("buscador-talleres");

    if (!input) {
        return;
    }

    const texto = normalizarTextoMisTalleres(input.value);

    if (!texto) {
        renderizarTalleresMisTalleres(talleresDelAlumnoActuales);
        return;
    }

    const resultados = talleresDelAlumnoActuales.filter((taller) => {
        return [taller.nombre, taller.estado].some((campo) =>
            normalizarTextoMisTalleres(campo).includes(texto)
        );
    });

    renderizarTalleresMisTalleres(resultados);
}

function normalizarTextoMisTalleres(valor) {
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


// ==============================
// RENDERIZADO DE TARJETAS
// ==============================

function renderizarTalleresMisTalleres(talleres) {
    const contenedor = document.getElementById("contenedor-talleres");
    const estadoVacio = document.getElementById("estado-vacio");

    if (!contenedor || !estadoVacio) {
        return;
    }

    contenedor.replaceChildren();

    if (!Array.isArray(talleres) || talleres.length === 0) {
        estadoVacio.classList.remove("d-none");
        return;
    }

    estadoVacio.classList.add("d-none");

    talleres.forEach((taller) => {
        contenedor.appendChild(crearTarjetaTallerMisTalleres(taller));
    });
}

function crearTarjetaTallerMisTalleres(taller) {
    // Se construye la tarjeta con createElement/textContent para que nombres,
    // descripciones y ubicación se traten como texto y no como HTML ejecutable.
    const columna = document.createElement("div");
    columna.className = "col-md-6 col-xl-4";

    const tarjeta = document.createElement("article");
    tarjeta.className = "card taller-card h-100 shadow-sm";

    const cuerpo = document.createElement("div");
    cuerpo.className = "card-body d-flex flex-column";

    const encabezado = document.createElement("div");
    encabezado.className = "d-flex align-items-start gap-3 mb-3";

    const iconoContenedor = document.createElement("div");
    iconoContenedor.className = "icono-acceso flex-shrink-0";
    iconoContenedor.setAttribute("aria-hidden", "true");

    const icono = document.createElement("i");
    icono.className = "bi bi-journal-code";
    iconoContenedor.appendChild(icono);

    const tituloContenedor = document.createElement("div");
    tituloContenedor.className = "flex-grow-1";

    const titulo = document.createElement("h2");
    titulo.className = "h5 fw-bold mb-2";
    titulo.textContent = taller.nombre || "Taller sin nombre";

    const insignia = document.createElement("span");
    insignia.className = `badge ${obtenerClaseEstadoTaller(taller.estado)}`;
    insignia.textContent = taller.estado || "Sin estado";

    tituloContenedor.append(titulo, insignia);
    encabezado.append(iconoContenedor, tituloContenedor);
    cuerpo.appendChild(encabezado);

    if (taller.tematica) {
        const tematica = document.createElement("p");
        tematica.className = "small fw-semibold mb-2";
        tematica.textContent = taller.tematica;
        cuerpo.appendChild(tematica);
    }

    if (taller.descripcion) {
        const descripcion = document.createElement("p");
        descripcion.className = "text-muted small mb-3";
        descripcion.textContent = taller.descripcion;
        cuerpo.appendChild(descripcion);
    }

    const tallerista = obtenerTalleristaPrincipalMisTalleres(taller);
    agregarLineaDetalleTaller(
        cuerpo,
        "bi-person-badge",
        "Tallerista",
        tallerista
    );

    const horarios = typeof formatearHorarios === "function"
        ? formatearHorarios(taller.horarios)
        : formatearHorariosMisTalleres(taller.horarios);

    if (horarios !== "-") {
        agregarLineaDetalleTaller(cuerpo, "bi-clock", "Horarios", horarios);
    }

    const ubicacion = formatearUbicacionMisTalleres(taller.ubicacion);

    if (ubicacion) {
        agregarLineaDetalleTaller(cuerpo, "bi-geo-alt", "Lugar", ubicacion);
    }

    if (taller.fechaInicio || taller.fechaFin) {
        const inicio = formatearFechaMisTalleres(taller.fechaInicio);
        const fin = formatearFechaMisTalleres(taller.fechaFin);
        let periodo = "";

        if (taller.fechaInicio && taller.fechaFin) {
            periodo = `${inicio} al ${fin}`;
        } else if (taller.fechaInicio) {
            periodo = `Desde ${inicio}`;
        } else {
            periodo = `Hasta ${fin}`;
        }

        agregarLineaDetalleTaller(
            cuerpo,
            "bi-calendar-event",
            "Período",
            periodo
        );
    }

    const enlace = document.createElement("a");
    enlace.className = "btn btn-primary w-100 mt-auto";
    enlace.href = `detalle-taller.html?id=${encodeURIComponent(String(taller.id))}`;
    enlace.innerHTML = '<i class="bi bi-eye me-1" aria-hidden="true"></i> Ver detalles';
    enlace.setAttribute(
        "aria-label",
        `Ver detalles de ${taller.nombre || "taller"}`
    );

    cuerpo.appendChild(enlace);
    tarjeta.appendChild(cuerpo);
    columna.appendChild(tarjeta);

    return columna;
}

function agregarLineaDetalleTaller(contenedor, claseIcono, etiqueta, valor) {
    if (!valor || valor === "-") {
        return;
    }

    const linea = document.createElement("p");
    linea.className = "small mb-2 d-flex align-items-start gap-2";

    const icono = document.createElement("i");
    icono.className = `bi ${claseIcono} mt-1 flex-shrink-0`;
    icono.setAttribute("aria-hidden", "true");

    const texto = document.createElement("span");
    const etiquetaFuerte = document.createElement("strong");
    etiquetaFuerte.textContent = `${etiqueta}: `;
    texto.append(etiquetaFuerte, document.createTextNode(String(valor)));

    linea.append(icono, texto);
    contenedor.appendChild(linea);
}

function obtenerTalleristaPrincipalMisTalleres(taller) {
    const datos = window.DATOS_SIMULADOS;
    const talleristasOriginales = Array.isArray(datos?.talleristas)
        ? datos.talleristas
        : [];

    const talleristas = obtenerListadoMisTalleres(
        "talleristas",
        talleristasOriginales
    );

    const tallerista = talleristas.find((persona) =>
        Number(persona.id) === Number(taller.talleristaId)
    );

    return tallerista
        ? [tallerista.nombre, tallerista.apellido].filter(Boolean).join(" ")
        : "Sin asignar";
}

function formatearUbicacionMisTalleres(ubicacion) {
    if (!ubicacion || typeof ubicacion !== "object") {
        return "";
    }

    return [ubicacion.centro, ubicacion.salon, ubicacion.direccion]
        .filter(Boolean)
        .join(" · ");
}

function formatearFechaMisTalleres(fecha) {
    if (!fecha) {
        return "-";
    }

    return typeof formatearFecha === "function"
        ? formatearFecha(fecha)
        : String(fecha);
}

function formatearHorariosMisTalleres(horarios) {
    if (!Array.isArray(horarios) || horarios.length === 0) {
        return "-";
    }

    return horarios
        .filter((horario) => horario && horario.dia)
        .map((horario) =>
            `${horario.dia} ${horario.horaInicio || "--:--"}-${horario.horaFin || "--:--"}`
        )
        .join(", ") || "-";
}

function obtenerClaseEstadoTaller(estado) {
    const estadoNormalizado = normalizarTextoMisTalleres(estado);

    const clases = {
        activo: "text-bg-success",
        inactivo: "text-bg-secondary",
        finalizado: "text-bg-dark",
        suspendido: "text-bg-warning"
    };

    return clases[estadoNormalizado] || "text-bg-secondary";
}


// ==============================
// ESTADOS Y ERRORES
// ==============================

function mostrarErrorMisTalleres(mensaje) {
    const alerta = document.getElementById("alerta-talleres");

    if (!alerta) {
        return;
    }

    alerta.textContent = mensaje;
    alerta.classList.remove("d-none");
}

function ocultarErrorMisTalleres() {
    const alerta = document.getElementById("alerta-talleres");

    if (!alerta) {
        return;
    }

    alerta.textContent = "";
    alerta.classList.add("d-none");
}
