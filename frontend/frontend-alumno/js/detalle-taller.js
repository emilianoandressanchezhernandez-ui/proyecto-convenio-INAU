
/*
    DETALLE-TALLER.JS - FRONTEND ALUMNO

    Responsabilidades:
    - Leer el ID del taller desde la URL.
    - Verificar que el alumno actual esté inscripto en el taller.
    - Mostrar la información general y el tallerista principal.
    - Calcular la asistencia del alumno en ese taller.
    - Listar los materiales y las tareas del taller seleccionado.

    Esta versión utiliza los datos simulados y localStorage. Los archivos
    adjuntos aparecen como metadatos; todavía no hay una URL de descarga real
    conectada a los endpoints protegidos del backend.
*/

"use strict";

function inicializarDetalleTaller() {
    try {
        validarDatosDetalleTaller();

        const idTaller = obtenerIdTallerDetalle();
        const usuario = typeof obtenerUsuarioActual === "function"
            ? obtenerUsuarioActual()
            : window.DATOS_SIMULADOS.usuarioActual;

        const idAlumno = obtenerIdAlumnoDetalle(usuario);

        if (!Number.isFinite(idAlumno)) {
            throw new Error("No se pudo identificar al alumno actual.");
        }

        const datos = window.DATOS_SIMULADOS;
        const talleres = obtenerListadoDetalleTaller("talleres", datos.talleres);
        const inscripciones = obtenerListadoDetalleTaller("inscripciones", datos.inscripciones);

        const taller = talleres.find(
            (elemento) => Number(elemento.id) === idTaller
        );

        if (!taller) {
            throw new Error("No se encontró el taller solicitado.");
        }

        if (!alumnoInscriptoEnTallerDetalle(idAlumno, idTaller, inscripciones)) {
            throw new Error("Este taller no figura entre tus inscripciones.");
        }

        const contenidos = obtenerListadoDetalleTaller("contenidos", datos.contenidos);
        const asistencias = obtenerListadoDetalleTaller("asistencias", datos.asistencias);
        const entregas = obtenerListadoDetalleTaller("entregas", datos.entregas);
        const adjuntos = obtenerListadoDetalleTaller("adjuntos", datos.adjuntos);
        const talleristas = obtenerListadoDetalleTaller("talleristas", datos.talleristas);

        mostrarInformacionGeneralDetalle(taller);
        mostrarTalleristaDetalle(taller, talleristas);
        mostrarAsistenciaDetalle(taller.id, idAlumno, asistencias);
        configurarEnlacesDetalle(taller.id);

        renderizarMaterialesDetalle(taller.id, contenidos, adjuntos);
        renderizarTareasDetalle(taller.id, idAlumno, contenidos, entregas);

        ocultarErrorDetalleTaller();

    } catch (error) {
        console.error("Error al cargar el detalle del taller:", error);

        mostrarErrorDetalleTaller(
            error.message || "No se pudo cargar la información del taller."
        );

        mostrarContenidoVacioDetalle(
            "contenedor-materiales",
            "No se pudo cargar el material."
        );

        mostrarContenidoVacioDetalle(
            "contenedor-tareas-taller",
            "No se pudieron cargar las tareas."
        );
    }
}


// ==============================
// VALIDACIÓN Y OBTENCIÓN DE DATOS
// ==============================

function validarDatosDetalleTaller() {
    const datos = window.DATOS_SIMULADOS;

    if (!datos || typeof datos !== "object") {
        throw new Error("No se encontraron los datos simulados.");
    }

    if (!datos.usuarioActual || typeof datos.usuarioActual !== "object") {
        throw new Error("No se encontró el usuario actual.");
    }

    [
        "talleres",
        "inscripciones",
        "contenidos",
        "asistencias",
        "entregas",
        "adjuntos",
        "talleristas"
    ].forEach((clave) => {
        if (
            clave !== "usuarioActual" &&
            datos[clave] !== undefined &&
            !Array.isArray(datos[clave])
        ) {
            throw new Error(
                `Los datos de "${clave}" no tienen un formato válido.`
            );
        }
    });

    ["talleres", "inscripciones", "contenidos"].forEach((clave) => {
        if (!Array.isArray(datos[clave])) {
            throw new Error(`La lista de ${clave} no está disponible.`);
        }
    });
}

function obtenerIdTallerDetalle() {
    const valor = typeof obtenerParametroURL === "function"
        ? obtenerParametroURL("id")
        : new URLSearchParams(window.location.search).get("id");

    if (valor === null || valor.trim() === "") {
        throw new Error(
            "No se indicó qué taller se debe mostrar. Volvé a Mis Talleres y seleccioná uno."
        );
    }

    const id = Number(valor);

    if (!Number.isInteger(id) || id <= 0) {
        throw new Error("El identificador del taller no es válido.");
    }

    return id;
}

function obtenerIdAlumnoDetalle(usuario) {
    const id = usuario?.alumnoId ?? usuario?.id;
    const numero = Number(id);

    return Number.isFinite(numero) ? numero : NaN;
}

function obtenerListadoDetalleTaller(clave, listaOriginal) {
    const original = Array.isArray(listaOriginal) ? listaOriginal : [];

    if (typeof obtenerListado === "function") {
        const resultado = obtenerListado(clave, original);
        return Array.isArray(resultado) ? resultado : original;
    }

    try {
        const guardado = localStorage.getItem(clave);

        if (guardado === null) {
            return original;
        }

        const resultado = JSON.parse(guardado);
        return Array.isArray(resultado) ? resultado : original;

    } catch (error) {
        console.warn(
            `No se pudo leer el listado "${clave}". Se usarán los datos iniciales.`,
            error
        );

        return original;
    }
}

function alumnoInscriptoEnTallerDetalle(alumnoId, tallerId, inscripciones) {
    return inscripciones.some((inscripcion) => {
        if (
            !inscripcion ||
            Number(inscripcion.tallerId) !== tallerId
        ) {
            return false;
        }

        const alumnos = Array.isArray(inscripcion.alumnoIds)
            ? inscripcion.alumnoIds
            : inscripcion.alumnoId !== undefined
                ? [inscripcion.alumnoId]
                : [];

        return alumnos.some((id) => Number(id) === alumnoId);
    });
}


// ==============================
// INFORMACIÓN GENERAL DEL TALLER
// ==============================

function mostrarInformacionGeneralDetalle(taller) {
    colocarTextoDetalle(
        "nombre-taller",
        taller.nombre || "Taller sin nombre"
    );

    colocarTextoDetalle(
        "descripcion-taller",
        taller.descripcion || "Sin descripción disponible."
    );

    colocarTextoDetalle(
        "dias-taller",
        obtenerDiasDetalle(taller.horarios)
    );

    colocarTextoDetalle(
        "horario-taller",
        obtenerHorariosDetalle(taller.horarios)
    );

    colocarTextoDetalle(
        "ubicacion-taller",
        obtenerUbicacionDetalle(taller.ubicacion)
    );

    colocarTextoDetalle(
        "estado-taller",
        taller.estado || "Sin estado"
    );

    aplicarEstiloEstadoDetalle(taller.estado);

    document.title = `INAU - ${taller.nombre || "Detalle del Taller"}`;
}

function obtenerDiasDetalle(horarios) {
    if (!Array.isArray(horarios) || horarios.length === 0) {
        return "Días no disponibles";
    }

    const dias = [
        ...new Set(
            horarios.map((horario) => horario?.dia).filter(Boolean)
        )
    ];

    return dias.length ? dias.join(", ") : "Días no disponibles";
}

function obtenerHorariosDetalle(horarios) {
    if (typeof formatearHorarios === "function") {
        const resultado = formatearHorarios(horarios);

        return resultado === "-"
            ? "Horario no disponible"
            : resultado;
    }

    if (!Array.isArray(horarios) || horarios.length === 0) {
        return "Horario no disponible";
    }

    return horarios
        .filter((horario) => horario && horario.dia)
        .map((horario) => {
            return `${horario.dia}: ${horario.horaInicio || "--:--"} a ${horario.horaFin || "--:--"}`;
        })
        .join(" | ") || "Horario no disponible";
}

function obtenerUbicacionDetalle(ubicacion) {
    if (!ubicacion || typeof ubicacion !== "object") {
        return "Ubicación no disponible";
    }

    const partes = [
        ubicacion.centro,
        ubicacion.direccion,
        ubicacion.salon
    ].filter(
        (parte) => typeof parte === "string" && parte.trim() !== ""
    );

    return partes.length
        ? partes.join(" · ")
        : "Ubicación no disponible";
}

function aplicarEstiloEstadoDetalle(estado) {
    const elemento = document.getElementById("estado-taller");

    if (!elemento) {
        return;
    }

    elemento.classList.remove(
        "text-success",
        "text-secondary",
        "text-warning",
        "text-danger",
        "text-dark"
    );

    const normalizado = normalizarDetalle(estado);

    const clases = {
        activo: "text-success",
        inactivo: "text-secondary",
        suspendido: "text-warning",
        cancelado: "text-danger",
        finalizado: "text-dark"
    };

    elemento.classList.add(
        clases[normalizado] || "text-secondary"
    );
}


// ==============================
// TALLERISTA A CARGO
// ==============================

function mostrarTalleristaDetalle(taller, talleristas) {
    const idTallerista = taller.talleristaId;

    const persona = talleristas.find(
        (elemento) => Number(elemento.id) === Number(idTallerista)
    );

    if (!persona) {
        colocarTextoDetalle(
            "tallerista-nombre",
            "Tallerista no disponible"
        );

        colocarTextoDetalle("tallerista-correo", "-");
        return;
    }

    const nombre = [
        persona.nombre,
        persona.apellido
    ].filter(Boolean).join(" ");

    colocarTextoDetalle(
        "tallerista-nombre",
        nombre || "Tallerista sin nombre"
    );

    colocarTextoDetalle(
        "tallerista-correo",
        persona.correo || "Correo no disponible"
    );
}


// ==============================
// ASISTENCIA DEL ALUMNO
// ==============================

function mostrarAsistenciaDetalle(tallerId, alumnoId, asistencias) {
    const jornadasDelTaller = asistencias.filter(
        (jornada) =>
            Number(jornada?.tallerId) === Number(tallerId) &&
            Array.isArray(jornada.registros)
    );

    let totalRegistros = 0;
    let totalPresentes = 0;

    jornadasDelTaller.forEach((jornada) => {
        jornada.registros.forEach((registro) => {
            if (
                !registro ||
                Number(registro.alumnoId) !== alumnoId ||
                !registro.estado
            ) {
                return;
            }

            totalRegistros++;

            if (normalizarDetalle(registro.estado) === "presente") {
                totalPresentes++;
            }
        });
    });

    const promedio = totalRegistros > 0
        ? `${Math.round((totalPresentes / totalRegistros) * 100)}%`
        : "Sin registros";

    colocarTextoDetalle("asistencia-promedio", promedio);

    const enlace = document.getElementById("enlace-asistencia");

    if (enlace) {
        enlace.href =
            `asistencia.html?tallerId=${encodeURIComponent(String(tallerId))}`;
    }
}


// ==============================
// ENLACES DE NAVEGACIÓN
// ==============================

function configurarEnlacesDetalle(tallerId) {
    const enlaceTodasTareas =
        document.getElementById("enlace-todas-tareas");

    if (enlaceTodasTareas) {
        enlaceTodasTareas.href =
            `tareas.html?tallerId=${encodeURIComponent(String(tallerId))}`;
    }
}


// ==============================
// MATERIAL DEL TALLER
// ==============================

function renderizarMaterialesDetalle(tallerId, contenidos, adjuntos) {
    const contenedor = document.getElementById("contenedor-materiales");

    if (!contenedor) {
        return;
    }

    contenedor.replaceChildren();

    const materiales = contenidos.filter((contenido) =>
        Number(contenido?.tallerId) === Number(tallerId) &&
        normalizarDetalle(contenido.tipo) === "material"
    );

    if (materiales.length === 0) {
        mostrarContenidoVacioDetalle(
            "contenedor-materiales",
            "Todavía no hay materiales publicados para este taller."
        );

        return;
    }

    materiales
        .sort((a, b) =>
            String(b.fechaPublicacion || "")
                .localeCompare(String(a.fechaPublicacion || ""))
        )
        .forEach((material) => {
            const tarjeta = document.createElement("article");
            tarjeta.className = "lista-item";

            const icono = document.createElement("div");
            icono.className = "icono-item";
            icono.setAttribute("aria-hidden", "true");

            const iconoI = document.createElement("i");
            iconoI.className = "bi bi-file-earmark-text";
            icono.appendChild(iconoI);

            const contenido = document.createElement("div");
            contenido.className = "contenido-item";

            const titulo = document.createElement("h6");
            titulo.textContent = material.titulo || "Material sin título";
            contenido.appendChild(titulo);

            if (material.descripcion) {
                const descripcion = document.createElement("p");
                descripcion.className = "mb-1";
                descripcion.textContent = material.descripcion;
                contenido.appendChild(descripcion);
            }

            if (material.fechaPublicacion) {
                const fecha = document.createElement("p");
                fecha.className = "small mt-2";
                fecha.textContent =
                    `Publicado: ${formatearFechaDetalle(material.fechaPublicacion)}`;

                contenido.appendChild(fecha);
            }

            const archivos = adjuntos.filter(
                (adjunto) =>
                    Number(adjunto?.contenidoId) === Number(material.id)
            );

            archivos.forEach((archivo) => {
                const lineaArchivo = document.createElement("p");
                lineaArchivo.className = "small mt-2 mb-0";

                const iconoArchivo = document.createElement("i");
                iconoArchivo.className = "bi bi-paperclip me-1";
                iconoArchivo.setAttribute("aria-hidden", "true");

                lineaArchivo.append(
                    iconoArchivo,
                    document.createTextNode(
                        `Archivo adjunto: ${archivo.nombreOriginal || "Archivo"}${formatearTamanoDetalle(archivo.tamanoBytes)}`
                    )
                );

                contenido.appendChild(lineaArchivo);
            });

            // El mock contiene metadatos, no una URL de descarga real.
            // No se inventa un enlace a un archivo que todavía no se sirve.
            tarjeta.append(icono, contenido);
            contenedor.appendChild(tarjeta);
        });
}


// ==============================
// TAREAS DEL TALLER
// ==============================

function renderizarTareasDetalle(tallerId, alumnoId, contenidos, entregas) {
    const contenedor =
        document.getElementById("contenedor-tareas-taller");

    if (!contenedor) {
        return;
    }

    contenedor.replaceChildren();

    const tareas = contenidos.filter((contenido) =>
        Number(contenido?.tallerId) === Number(tallerId) &&
        normalizarDetalle(contenido.tipo) === "tarea"
    );

    if (tareas.length === 0) {
        mostrarContenidoVacioDetalle(
            "contenedor-tareas-taller",
            "Todavía no hay tareas publicadas para este taller."
        );

        return;
    }

    tareas
        .sort((a, b) =>
            String(b.fechaPublicacion || "")
                .localeCompare(String(a.fechaPublicacion || ""))
        )
        .forEach((tarea) => {
            const entrega = entregas.find(
                (elemento) =>
                    Number(elemento?.contenidoId) === Number(tarea.id) &&
                    Number(elemento?.alumnoId) === alumnoId
            );

            const estadoEntrega = entrega?.estado || "Pendiente";

            const tarjeta = document.createElement("article");
            tarjeta.className = "lista-item";

            const icono = document.createElement("div");
            icono.className = "icono-item";
            icono.setAttribute("aria-hidden", "true");

            const iconoI = document.createElement("i");
            iconoI.className = "bi bi-file-earmark-check";
            icono.appendChild(iconoI);

            const contenido = document.createElement("div");
            contenido.className = "contenido-item";

            const encabezado = document.createElement("div");
            encabezado.className =
                "d-flex flex-wrap align-items-center gap-2 mb-1";

            const titulo = document.createElement("h6");
            titulo.textContent = tarea.titulo || "Tarea sin título";

            const insignia = document.createElement("span");
            insignia.className =
                `badge ${obtenerClaseEstadoEntregaDetalle(estadoEntrega)}`;
            insignia.textContent = estadoEntrega;

            encabezado.append(titulo, insignia);
            contenido.appendChild(encabezado);

            if (tarea.descripcion) {
                const descripcion = document.createElement("p");
                descripcion.textContent = tarea.descripcion;
                contenido.appendChild(descripcion);
            }

            const fechas = document.createElement("p");
            fechas.className = "small mt-2";

            const partesFecha = [];

            if (tarea.fechaPublicacion) {
                partesFecha.push(
                    `Publicada: ${formatearFechaDetalle(tarea.fechaPublicacion)}`
                );
            }

            if (tarea.fechaLimite) {
                partesFecha.push(
                    `Fecha límite: ${formatearFechaDetalle(tarea.fechaLimite)}`
                );
            }

            fechas.textContent = partesFecha.join(" · ") || "Fechas no disponibles";
            contenido.appendChild(fechas);

            if (
                entrega &&
                entrega.nota !== null &&
                entrega.nota !== undefined &&
                entrega.nota !== ""
            ) {
                const nota = document.createElement("p");
                nota.className = "small mt-2 mb-1";
                nota.textContent = `Nota: ${entrega.nota}`;
                contenido.appendChild(nota);
            }

            if (entrega?.comentario) {
                const comentario = document.createElement("p");
                comentario.className = "small mb-2";
                comentario.textContent = `Comentario: ${entrega.comentario}`;
                contenido.appendChild(comentario);
            }

            const enlace = document.createElement("a");
            enlace.className =
                "btn btn-sm btn-outline-primary mt-2 align-self-start";

            enlace.href =
                `detalle-tarea.html?id=${encodeURIComponent(String(tarea.id))}`;

            enlace.innerHTML =
                '<i class="bi bi-eye me-1" aria-hidden="true"></i> Ver tarea';

            contenido.appendChild(enlace);

            tarjeta.append(icono, contenido);
            contenedor.appendChild(tarjeta);
        });
}

function obtenerClaseEstadoEntregaDetalle(estado) {
    const clases = {
        pendiente: "text-bg-warning",
        entregada: "text-bg-info",
        corregida: "text-bg-success"
    };

    return clases[normalizarDetalle(estado)] || "text-bg-secondary";
}


// ==============================
// FUNCIONES AUXILIARES DE PRESENTACIÓN
// ==============================

function colocarTextoDetalle(elementoId, valor) {
    if (typeof colocarTexto === "function") {
        colocarTexto(elementoId, valor);
        return;
    }

    const elemento = document.getElementById(elementoId);

    if (elemento) {
        elemento.textContent =
            valor === null || valor === undefined || valor === ""
                ? "-"
                : String(valor);
    }
}

function formatearFechaDetalle(fecha) {
    if (typeof formatearFecha === "function") {
        return formatearFecha(fecha);
    }

    if (!fecha) {
        return "-";
    }

    const coincidencia =
        /^(\d{4})-(\d{2})-(\d{2})/.exec(String(fecha));

    return coincidencia
        ? `${coincidencia[3]}/${coincidencia[2]}/${coincidencia[1]}`
        : "-";
}

function formatearTamanoDetalle(bytes) {
    const numero = Number(bytes);

    if (!Number.isFinite(numero) || numero <= 0) {
        return "";
    }

    const kb = numero / 1024;

    return ` (${kb < 1024
        ? `${kb.toFixed(1)} KB`
        : `${(kb / 1024).toFixed(2)} MB`})`;
}

function normalizarDetalle(valor) {
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

function mostrarContenidoVacioDetalle(elementoId, mensaje) {
    const contenedor = document.getElementById(elementoId);

    if (!contenedor) {
        return;
    }

    contenedor.replaceChildren();

    const parrafo = document.createElement("p");
    parrafo.className = "text-muted mb-0";
    parrafo.textContent = mensaje;

    contenedor.appendChild(parrafo);
}

function mostrarErrorDetalleTaller(mensaje) {
    const alerta = document.getElementById("alerta-detalle-taller");

    if (!alerta) {
        return;
    }

    alerta.textContent = mensaje;
    alerta.classList.remove("d-none");
}

function ocultarErrorDetalleTaller() {
    const alerta = document.getElementById("alerta-detalle-taller");

    if (!alerta) {
        return;
    }

    alerta.textContent = "";
    alerta.classList.add("d-none");
}
