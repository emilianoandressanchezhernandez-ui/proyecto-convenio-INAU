
/*
    DETALLE-TAREA.JS - FRONTEND ALUMNO

    Responsabilidades:
    - Cargar una tarea a partir del parámetro ?id= de la URL.
    - Verificar que el alumno pertenezca al taller de esa tarea.
    - Mostrar consigna, fechas, estado, entrega y corrección.
    - Validar el archivo elegido.
    - Simular la entrega guardando metadatos en localStorage.

    IMPORTANTE:
    Esta versión aún no envía los bytes del archivo al backend. Solo guarda
    el nombre y los metadatos para poder probar la interfaz.
*/

"use strict";

let tareaDetalleActual = null;
let alumnoIdDetalleTarea = null;
let entregaDetalleActual = null;

const MAXIMO_BYTES_ENTREGA = 10 * 1024 * 1024;
const EXTENSIONES_ENTREGA_PERMITIDAS = ["pdf", "jpg", "jpeg", "html", "css", "js"];


// ==============================
// INICIALIZACIÓN
// ==============================

function inicializarDetalleTarea() {
    try {
        validarDatosDetalleTarea();

        const idTarea = obtenerIdTareaDesdeURL();
        const datos = window.DATOS_SIMULADOS;
        const usuario = typeof obtenerUsuarioActual === "function"
            ? obtenerUsuarioActual()
            : datos.usuarioActual;

        alumnoIdDetalleTarea = obtenerAlumnoIdDetalleTarea(usuario);

        if (!Number.isFinite(alumnoIdDetalleTarea)) {
            throw new Error("No se pudo identificar al alumno actual.");
        }

        const contenidos = obtenerListadoDetalleTarea("contenidos", datos.contenidos);
        const talleres = obtenerListadoDetalleTarea("talleres", datos.talleres);
        const inscripciones = obtenerListadoDetalleTarea("inscripciones", datos.inscripciones);
        const entregas = obtenerListadoDetalleTarea("entregas", datos.entregas);
        const adjuntos = obtenerListadoDetalleTarea("adjuntos", datos.adjuntos);

        tareaDetalleActual = contenidos.find((contenido) =>
            Number(contenido?.id) === idTarea &&
            normalizarDetalleTarea(contenido.tipo) === "tarea"
        );

        if (!tareaDetalleActual) {
            throw new Error("No se encontró la tarea solicitada.");
        }

        if (!alumnoEstaInscriptoDetalleTarea(
            alumnoIdDetalleTarea,
            tareaDetalleActual.tallerId,
            inscripciones
        )) {
            throw new Error("Esta tarea no pertenece a uno de tus talleres inscriptos.");
        }

        const taller = talleres.find((elemento) =>
            Number(elemento.id) === Number(tareaDetalleActual.tallerId)
        );

        if (!taller) {
            throw new Error("No se encontró el taller asociado a esta tarea.");
        }

        entregaDetalleActual = obtenerEntregaDetalleTarea(
            tareaDetalleActual.id,
            alumnoIdDetalleTarea,
            entregas
        );

        mostrarInformacionTareaDetalle(tareaDetalleActual, taller);
        mostrarEntregaExistenteDetalle(entregaDetalleActual, adjuntos);
        mostrarCorreccionDetalle(entregaDetalleActual);
        configurarFormularioEntregaDetalle();
        ocultarAlertaDetalleTarea();

    } catch (error) {
        console.error("Error al cargar el detalle de la tarea:", error);
        mostrarErrorDetalleTarea(
            error.message || "No se pudo cargar la información de esta tarea."
        );
        bloquearFormularioEntregaDetalle();
    }
}


// ==============================
// VALIDACIÓN Y LECTURA DE DATOS
// ==============================

function validarDatosDetalleTarea() {
    const datos = window.DATOS_SIMULADOS;

    if (!datos || typeof datos !== "object") {
        throw new Error("No se encontraron los datos simulados.");
    }

    if (!datos.usuarioActual || typeof datos.usuarioActual !== "object") {
        throw new Error("No se encontró el usuario actual.");
    }

    ["contenidos", "talleres", "inscripciones", "entregas"].forEach((clave) => {
        if (!Array.isArray(datos[clave])) {
            throw new Error(`La lista de ${clave} no está disponible o no es válida.`);
        }
    });

    // Adjuntos es útil para mostrar metadatos; si falta, se trabaja con una lista vacía.
    if (datos.adjuntos !== undefined && !Array.isArray(datos.adjuntos)) {
        throw new Error("La lista de adjuntos no tiene un formato válido.");
    }
}

function obtenerIdTareaDesdeURL() {
    const valor = typeof obtenerParametroURL === "function"
        ? obtenerParametroURL("id")
        : new URLSearchParams(window.location.search).get("id");

    if (valor === null || String(valor).trim() === "") {
        throw new Error("No se indicó qué tarea se debe mostrar. Volvé a Mis Tareas y elegí una.");
    }

    const id = Number(valor);

    if (!Number.isInteger(id) || id <= 0) {
        throw new Error("El identificador de la tarea no es válido.");
    }

    return id;
}

function obtenerAlumnoIdDetalleTarea(usuario) {
    const valor = usuario?.alumnoId ?? usuario?.id;
    const id = Number(valor);
    return Number.isFinite(id) ? id : NaN;
}

function obtenerListadoDetalleTarea(clave, listaOriginal) {
    const original = Array.isArray(listaOriginal) ? listaOriginal : [];

    if (typeof obtenerListado === "function") {
        const listado = obtenerListado(clave, original);
        return Array.isArray(listado) ? listado : original;
    }

    try {
        const guardado = localStorage.getItem(clave);
        if (guardado === null) return original;

        const listado = JSON.parse(guardado);
        return Array.isArray(listado) ? listado : original;
    } catch (error) {
        console.warn(`No se pudo leer "${clave}"; se usarán los datos iniciales.`, error);
        return original;
    }
}

function alumnoEstaInscriptoDetalleTarea(alumnoId, tallerId, inscripciones) {
    return inscripciones.some((inscripcion) => {
        if (!inscripcion || Number(inscripcion.tallerId) !== Number(tallerId)) {
            return false;
        }

        const idsAlumnos = Array.isArray(inscripcion.alumnoIds)
            ? inscripcion.alumnoIds
            : inscripcion.alumnoId !== undefined
                ? [inscripcion.alumnoId]
                : [];

        return idsAlumnos.some((id) => Number(id) === alumnoId);
    });
}

function obtenerEntregaDetalleTarea(tareaId, alumnoId, entregas) {
    return entregas.find((entrega) =>
        Number(entrega?.contenidoId) === Number(tareaId) &&
        Number(entrega?.alumnoId) === Number(alumnoId)
    ) || null;
}


// ==============================
// MOSTRAR TAREA Y FECHAS
// ==============================

function mostrarInformacionTareaDetalle(tarea, taller) {
    colocarTextoDetalleTarea("titulo-tarea", tarea.titulo || "Tarea sin título");
    colocarTextoDetalleTarea("taller-tarea", taller.nombre || "Taller sin nombre");
    colocarTextoDetalleTarea("descripcion-tarea", tarea.descripcion || "Sin consigna disponible.");
    colocarTextoDetalleTarea(
        "fecha-publicacion-tarea",
        tarea.fechaPublicacion ? formatearFechaDetalleTarea(tarea.fechaPublicacion) : "No registrada"
    );
    colocarTextoDetalleTarea(
        "fecha-limite-tarea",
        tarea.fechaLimite ? formatearFechaDetalleTarea(tarea.fechaLimite) : "Sin fecha límite"
    );

    document.title = `INAU - ${tarea.titulo || "Detalle de Tarea"}`;
    actualizarBadgeEstadoTareaDetalle(entregaDetalleActual?.estado || "Pendiente");
}

function actualizarBadgeEstadoTareaDetalle(estado) {
    const badge = document.getElementById("badge-estado-tarea");

    if (!badge) return;

    badge.classList.remove("text-bg-warning", "text-bg-info", "text-bg-success", "text-bg-secondary");

    const normalizado = normalizarDetalleTarea(estado);
    const clases = {
        pendiente: "text-bg-warning",
        entregada: "text-bg-info",
        corregida: "text-bg-success"
    };

    badge.classList.add(clases[normalizado] || "text-bg-secondary");
    badge.textContent = estado || "Sin estado";
}


// ==============================
// ENTREGA EXISTENTE Y CORRECCIÓN
// ==============================

function mostrarEntregaExistenteDetalle(entrega, adjuntos) {
    const contenedor = document.getElementById("entrega-actual");

    if (!contenedor) return;

    if (!entrega) {
        contenedor.classList.add("d-none");
        colocarTextoDetalleTarea("nombre-archivo-entregado", "-");
        colocarTextoDetalleTarea("fecha-entrega-realizada", "-");
        return;
    }

    const adjunto = adjuntos.find((archivo) =>
        Number(archivo?.entregaId) === Number(entrega.id)
    );

    const nombreArchivo = entrega.archivoNombre || adjunto?.nombreOriginal || "Archivo registrado";

    colocarTextoDetalleTarea("nombre-archivo-entregado", nombreArchivo);
    colocarTextoDetalleTarea(
        "fecha-entrega-realizada",
        entrega.fechaEntrega ? formatearFechaDetalleTarea(entrega.fechaEntrega) : "Fecha no registrada"
    );

    contenedor.classList.remove("d-none");
}

function mostrarCorreccionDetalle(entrega) {
    const sinNota = document.getElementById("sin-nota");
    const conNota = document.getElementById("con-nota");

    const estaCorregida = normalizarDetalleTarea(entrega?.estado) === "corregida";

    if (sinNota) sinNota.classList.toggle("d-none", estaCorregida);
    if (conNota) conNota.classList.toggle("d-none", !estaCorregida);

    if (!estaCorregida) return;

    colocarTextoDetalleTarea(
        "valor-nota",
        entrega.nota !== null && entrega.nota !== undefined && entrega.nota !== ""
            ? entrega.nota
            : "Sin nota"
    );

    // La tabla entregas del SQL no tiene un campo fecha_correccion. No inventamos esa fecha.
    colocarTextoDetalleTarea(
        "fecha-correccion",
        entrega.fechaCorreccion ? formatearFechaDetalleTarea(entrega.fechaCorreccion) : "No registrada"
    );

    colocarTextoDetalleTarea(
        "comentario-nota",
        entrega.comentario || "No hay comentarios de corrección registrados."
    );
}


// ==============================
// FORMULARIO Y VALIDACIÓN DE ARCHIVO
// ==============================

function configurarFormularioEntregaDetalle() {
    const formulario = document.getElementById("form-entrega");
    const inputArchivo = document.getElementById("archivo-tarea");

    if (!formulario || !inputArchivo) return;

    inputArchivo.setAttribute("accept", ".pdf,.jpg,.jpeg,.html,.css,.js");
    inputArchivo.required = true;

    if (inputArchivo.dataset.validacionConfigurada !== "true") {
        inputArchivo.dataset.validacionConfigurada = "true";
        inputArchivo.addEventListener("change", validarSeleccionArchivoDetalle);
    }

    if (formulario.dataset.entregaConfigurada !== "true") {
        formulario.dataset.entregaConfigurada = "true";
        formulario.addEventListener("submit", enviarEntregaSimuladaDetalle);
    }
}

function validarSeleccionArchivoDetalle() {
    const input = document.getElementById("archivo-tarea");
    if (!input) return false;

    const archivo = input.files?.[0];
    if (!archivo) {
        ocultarAlertaEntregaDetalle();
        return true;
    }

    const error = validarArchivoDetalleTarea(archivo);

    if (error) {
        input.value = "";
        mostrarAlertaEntregaDetalle(error, "danger");
        return false;
    }

    ocultarAlertaEntregaDetalle();
    return true;
}

function validarArchivoDetalleTarea(archivo) {
    if (!archivo) {
        return "Seleccioná el archivo que querés entregar.";
    }

    if (!Number.isFinite(archivo.size) || archivo.size <= 0) {
        return "El archivo está vacío o no se pudo leer.";
    }

    if (archivo.size > MAXIMO_BYTES_ENTREGA) {
        return "El archivo no puede superar los 10 MB.";
    }

    const nombre = String(archivo.name || "");
    const punto = nombre.lastIndexOf(".");
    const extension = punto >= 0 ? nombre.slice(punto + 1).toLowerCase() : "";

    if (!EXTENSIONES_ENTREGA_PERMITIDAS.includes(extension)) {
        return "Formato no permitido. Elegí un archivo PDF, JPG, HTML, CSS o JS.";
    }

    return null;
}

function enviarEntregaSimuladaDetalle(evento) {
    evento.preventDefault();
    ocultarAlertaEntregaDetalle();

    const inputArchivo = document.getElementById("archivo-tarea");
    const inputComentario = document.getElementById("comentario-entrega");
    const archivo = inputArchivo?.files?.[0];

    const errorArchivo = validarArchivoDetalleTarea(archivo);

    if (errorArchivo) {
        mostrarAlertaEntregaDetalle(errorArchivo, "danger");
        return;
    }

    const datos = window.DATOS_SIMULADOS;
    const entregas = obtenerListadoDetalleTarea("entregas", datos.entregas);
    const adjuntosOriginales = Array.isArray(datos.adjuntos) ? datos.adjuntos : [];
    const adjuntos = obtenerListadoDetalleTarea("adjuntos", adjuntosOriginales);

    const fechaHoy = obtenerFechaLocalDetalleTarea();
    const comentarioAlumno = inputComentario?.value?.trim() || "";
    const extension = archivo.name.split(".").pop().toLowerCase();
    const mime = archivo.type || obtenerMimePorExtensionDetalleTarea(extension);

    const indiceEntregaExistente = entregas.findIndex((elemento) =>
        Number(elemento?.contenidoId) === Number(tareaDetalleActual.id) &&
        Number(elemento?.alumnoId) === Number(alumnoIdDetalleTarea)
    );

    let entrega;

    if (indiceEntregaExistente >= 0) {
        // Reemplazamos el registro dentro del arreglo para que el cambio
        // de estado, nombre de archivo y comentario sí quede guardado.
        entrega = {
            ...entregas[indiceEntregaExistente],
            fechaEntrega: fechaHoy,
            archivoNombre: archivo.name,
            archivoTipo: mime,
            archivoTamano: archivo.size,
            estado: "Entregada",
            nota: null,
            comentario: comentarioAlumno
        };
        entregas[indiceEntregaExistente] = entrega;
    } else {
        const nuevoId = typeof generarId === "function"
            ? generarId(entregas)
            : calcularSiguienteIdDetalleTarea(entregas);

        entrega = {
            id: nuevoId,
            contenidoId: Number(tareaDetalleActual.id),
            alumnoId: Number(alumnoIdDetalleTarea),
            fechaEntrega: fechaHoy,
            archivoNombre: archivo.name,
            archivoTipo: mime,
            archivoTamano: archivo.size,
            estado: "Entregada",
            nota: null,
            comentario: comentarioAlumno
        };
        entregas.push(entrega);
    }

    // El modelo de prueba solo guarda metadatos del archivo. No guarda el File
    // ni lo envía al servidor. Se reemplaza el metadato previo de esta entrega.
    const adjuntosActualizados = adjuntos.filter((adjunto) =>
        Number(adjunto?.entregaId) !== Number(entrega.id)
    );

    const nuevoAdjuntoId = typeof generarId === "function"
        ? generarId(adjuntosActualizados)
        : calcularSiguienteIdDetalleTarea(adjuntosActualizados);

    adjuntosActualizados.push({
        id: nuevoAdjuntoId,
        contenidoId: null,
        entregaId: Number(entrega.id),
        nombreOriginal: archivo.name,
        nombreArchivo: `simulado-${entrega.id}-${Date.now()}.${extension}`,
        tipoMime: mime,
        tamanoBytes: archivo.size
    });

    const entregasGuardadas = typeof guardarDato === "function"
        ? guardarDato("entregas", entregas)
        : guardarListadoDetalleTarea("entregas", entregas);

    if (entregasGuardadas === false) {
        mostrarAlertaEntregaDetalle(
            "No se pudo guardar la entrega de prueba en este navegador. Revisá el almacenamiento del navegador e intentá nuevamente.",
            "danger"
        );
        return;
    }

    const adjuntosGuardados = typeof guardarDato === "function"
        ? guardarDato("adjuntos", adjuntosActualizados)
        : guardarListadoDetalleTarea("adjuntos", adjuntosActualizados);

    // Sincronizamos los datos en memoria para que otros módulos de esta página
    // consulten la versión recién actualizada.
    datos.entregas = entregas;
    datos.adjuntos = adjuntosActualizados;
    entregaDetalleActual = entrega;

    mostrarEntregaExistenteDetalle(entregaDetalleActual, adjuntosActualizados);
    mostrarCorreccionDetalle(entregaDetalleActual);
    actualizarBadgeEstadoTareaDetalle(entregaDetalleActual.estado);

    if (inputArchivo) inputArchivo.value = "";
    if (inputComentario) inputComentario.value = "";

    if (adjuntosGuardados === false) {
        mostrarAlertaEntregaDetalle(
            "La entrega de prueba se registró, pero no se pudieron guardar todos los metadatos del archivo.",
            "warning"
        );
        return;
    }

    mostrarAlertaEntregaDetalle(
        "Entrega registrada en modo de prueba. Se guardaron el nombre y los metadatos, pero el archivo no se subió a un servidor.",
        "success"
    );
}

function guardarListadoDetalleTarea(clave, valor) {
    try {
        localStorage.setItem(clave, JSON.stringify(valor));
        return true;
    } catch (error) {
        console.error(`No se pudo guardar "${clave}".`, error);
        return false;
    }
}

function calcularSiguienteIdDetalleTarea(lista) {
    if (!Array.isArray(lista) || lista.length === 0) return 1;

    const ids = lista
        .map((elemento) => Number(elemento?.id))
        .filter((id) => Number.isFinite(id));

    return ids.length ? Math.max(...ids) + 1 : 1;
}

function obtenerMimePorExtensionDetalleTarea(extension) {
    const tipos = {
        pdf: "application/pdf",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        html: "text/html",
        css: "text/css",
        js: "text/javascript"
    };

    return tipos[extension] || "application/octet-stream";
}

function obtenerFechaLocalDetalleTarea() {
    const fecha = new Date();
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");

    return `${anio}-${mes}-${dia}`;
}


// ==============================
// ALERTAS Y AUXILIARES
// ==============================

function colocarTextoDetalleTarea(elementoId, valor) {
    if (typeof colocarTexto === "function") {
        colocarTexto(elementoId, valor);
        return;
    }

    const elemento = document.getElementById(elementoId);
    if (elemento) {
        elemento.textContent = valor === null || valor === undefined || valor === ""
            ? "-"
            : String(valor);
    }
}

function formatearFechaDetalleTarea(fecha) {
    if (typeof formatearFecha === "function") {
        return formatearFecha(fecha);
    }

    const coincidencia = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(fecha || ""));
    return coincidencia
        ? `${coincidencia[3]}/${coincidencia[2]}/${coincidencia[1]}`
        : "-";
}

function normalizarDetalleTarea(valor) {
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

function mostrarErrorDetalleTarea(mensaje) {
    const alerta = document.getElementById("alerta-detalle-tarea");

    if (!alerta) return;

    alerta.className = "alert alert-danger";
    alerta.textContent = mensaje;
    alerta.classList.remove("d-none");
}

function ocultarAlertaDetalleTarea() {
    const alerta = document.getElementById("alerta-detalle-tarea");
    if (alerta) alerta.classList.add("d-none");
}

function mostrarAlertaEntregaDetalle(mensaje, tipo = "info") {
    const alerta = document.getElementById("alerta-entrega");
    if (!alerta) return;

    const tiposPermitidos = ["success", "danger", "warning", "info"];
    const tipoSeguro = tiposPermitidos.includes(tipo) ? tipo : "info";

    alerta.className = `alert alert-${tipoSeguro}`;
    alerta.setAttribute("role", "alert");
    alerta.textContent = mensaje;
    alerta.classList.remove("d-none");
}

function ocultarAlertaEntregaDetalle() {
    const alerta = document.getElementById("alerta-entrega");
    if (alerta) alerta.classList.add("d-none");
}

function bloquearFormularioEntregaDetalle() {
    const formulario = document.getElementById("form-entrega");

    if (formulario) {
        formulario.querySelectorAll("input, textarea, button").forEach((control) => {
            control.disabled = true;
        });
    }
}
