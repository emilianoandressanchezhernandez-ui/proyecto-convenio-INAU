
/*
    CORRECCION-TAREA.JS - FRONTEND TALLERISTA

    Integración con la API real.

    - Consulta la tarea seleccionada.
    - Verifica que pertenezca a un taller asignado.
    - Lista las entregas reales.
    - Obtiene nombres de alumnos.
    - Consulta adjuntos de las entregas.
    - Permite guardar nota y comentario en MySQL.
    - Actualiza la información después de guardar.

    No utiliza DATOS_SIMULADOS ni localStorage.
*/

// ======================================
// VARIABLES
// ======================================

let tareaActualCorreccion = null;
let tallerActualCorreccion = null;
let entregasCorreccion = [];
let alumnosCorreccion = new Map();
let adjuntosCorreccion = new Map();

let entregaSeleccionada = null;
let guardandoCorreccion = false;


// ======================================
// INICIALIZACIÓN
// ======================================

async function inicializarCorreccionTarea() {
    configurarEventosCorreccion();

    mostrarAlertaCorreccion(
        "Cargando entregas...",
        "info"
    );

    try {
        const tareaId = obtenerTareaIdCorreccion();

        const misTalleres = await solicitarCorreccionAPI(
            "/mis-talleres"
        );

        if (!Array.isArray(misTalleres)) {
            throw new Error(
                "No se pudieron consultar los talleres."
            );
        }

        const tarea = await solicitarCorreccionAPI(
            `/contenidos/${tareaId}`
        );

        if (!tarea || tarea.tipo !== "Tarea") {
            throw new Error(
                "El contenido seleccionado no es una tarea."
            );
        }

        const tallerId = Number(
            tarea.taller_id ?? tarea.tallerId
        );

        const taller = misTalleres.find(
            item => Number(item.id) === tallerId
        );

        if (!taller) {
            throw new Error(
                "Esta tarea no pertenece a tus talleres asignados."
            );
        }

        tareaActualCorreccion = tarea;
        tallerActualCorreccion = taller;

        mostrarDatosTareaCorreccion();
        configurarEnlaceVolverCorreccion();

        // Recuperar alumnos inscritos para mostrar nombres.
        await cargarAlumnosCorreccion(tallerId);

        // Recuperar las entregas de esta tarea.
        await cargarEntregasCorreccion();

        ocultarAlertaCorreccion();

    } catch (error) {
        console.error(
            "Error al cargar la corrección:",
            error
        );

        mostrarAlertaCorreccion(
            "No se pudieron cargar las entregas. " +
            error.message,
            "danger"
        );
    }
}


// ======================================
// PETICIONES A LA API
// ======================================

async function solicitarCorreccionAPI(
    ruta,
    metodo = "GET",
    datos = null
) {
    const opciones = {
        method: metodo,
        credentials: "include",
        headers: {
            Accept: "application/json"
        }
    };

    if (datos !== null) {
        opciones.headers["Content-Type"] =
            "application/json";

        opciones.body = JSON.stringify(datos);
    }

    const respuesta = await fetch(
        `${TALLERISTA_API_URL}${ruta}`,
        opciones
    );

    let resultado;

    try {
        resultado = await respuesta.json();
    } catch (error) {
        throw new Error(
            `Respuesta JSON inválida en ${ruta}.`
        );
    }

    if (!respuesta.ok || resultado.ok === false) {
        let mensaje = resultado.mensaje ||
            `Error HTTP ${respuesta.status}`;

        const errores = resultado.errores;

        if (Array.isArray(errores) && errores.length) {
            mensaje += " " + errores.join(" ");
        } else if (
            errores &&
            typeof errores === "object"
        ) {
            mensaje += " " +
                Object.values(errores).join(" ");
        }

        throw new Error(mensaje);
    }

    return resultado.datos;
}


// ======================================
// ID DE LA TAREA
// ======================================

function obtenerTareaIdCorreccion() {
    const parametros = new URLSearchParams(
        window.location.search
    );

    const valor = parametros.get("id");

    if (!valor || !/^[1-9]\d*$/.test(valor)) {
        throw new Error(
            "No se indicó una tarea válida."
        );
    }

    const id = Number(valor);

    if (!Number.isSafeInteger(id)) {
        throw new Error(
            "El identificador de la tarea no es válido."
        );
    }

    return id;
}


// ======================================
// DATOS GENERALES DE LA TAREA
// ======================================

function mostrarDatosTareaCorreccion() {
    const tarea = tareaActualCorreccion;

    colocarTextoCorreccion(
        "titulo-tarea",
        tarea.titulo || "Tarea sin título"
    );

    colocarTextoCorreccion(
        "descripcion-tarea",
        tarea.descripcion || "Sin descripción."
    );

    colocarTextoCorreccion(
        "taller-tarea",
        tallerActualCorreccion.nombre || "-"
    );

    colocarTextoCorreccion(
        "fecha-limite-tarea",
        formatearFechaCorreccion(
            tarea.fecha_limite ?? tarea.fechaLimite
        )
    );

    document.title =
        `INAU - Corregir - ${tarea.titulo}`;
}


// ======================================
// ALUMNOS
// ======================================

async function cargarAlumnosCorreccion(tallerId) {
    const alumnos = await solicitarCorreccionAPI(
        `/talleres/${tallerId}/alumnos`
    );

    if (!Array.isArray(alumnos)) {
        throw new Error(
            "La API no devolvió una lista de alumnos."
        );
    }

    alumnosCorreccion = new Map();

    alumnos.forEach(alumno => {
        const id = Number(
            alumno.alumno_id ?? alumno.id
        );

        if (Number.isInteger(id) && id > 0) {
            alumnosCorreccion.set(id, alumno);
        }
    });
}


function obtenerNombreAlumnoCorreccion(entrega) {
    const alumnoId = Number(
        entrega.alumno_id ?? entrega.alumnoId
    );

    const alumno = alumnosCorreccion.get(alumnoId);

    if (alumno) {
        return [
            alumno.nombre,
            alumno.apellido
        ].filter(Boolean).join(" ");
    }

    // Algunos endpoints incluyen el nombre
    // directamente en la respuesta de entrega.
    const nombreDirecto = [
        entrega.nombre,
        entrega.apellido
    ].filter(Boolean).join(" ");

    return nombreDirecto ||
        `Alumno #${alumnoId}`;
}


// ======================================
// CARGAR ENTREGAS
// ======================================

async function cargarEntregasCorreccion() {
    const tareaId = Number(tareaActualCorreccion.id);

    const entregas = await solicitarCorreccionAPI(
        `/contenidos/${tareaId}/entregas`
    );

    if (!Array.isArray(entregas)) {
        throw new Error(
            "La API no devolvió una lista de entregas."
        );
    }

    entregasCorreccion = entregas;

    // Consultamos adjuntos por separado.
    // Si un adjunto no puede consultarse, no
    // bloqueamos toda la tabla de entregas.
    adjuntosCorreccion = new Map();

    await Promise.all(
        entregasCorreccion.map(async entrega => {
            const entregaId = Number(entrega.id);

            try {
                const adjuntos = await solicitarCorreccionAPI(
                    `/entregas/${entregaId}/adjuntos`
                );

                adjuntosCorreccion.set(
                    entregaId,
                    Array.isArray(adjuntos) ? adjuntos : []
                );

            } catch (error) {
                console.warn(
                    `No se pudieron consultar adjuntos de la entrega ${entregaId}:`,
                    error
                );

                adjuntosCorreccion.set(
                    entregaId,
                    null
                );
            }
        })
    );

    renderizarTablaEntregasCorreccion();
    actualizarResumenCorreccion();
}


// ======================================
// RESUMEN
// ======================================

function actualizarResumenCorreccion() {
    const total = entregasCorreccion.length;

    const conNota = entregasCorreccion.filter(
        entrega =>
            entrega.nota !== null &&
            entrega.nota !== undefined &&
            entrega.nota !== ""
    ).length;

    colocarTextoCorreccion(
        "resumen-entregas",
        `${total} (${conNota} con nota)`
    );
}


// ======================================
// TABLA
// ======================================

function renderizarTablaEntregasCorreccion() {
    const tabla = document.getElementById(
        "tabla-entregas"
    );

    if (!tabla) {
        return;
    }

    tabla.replaceChildren();

    if (entregasCorreccion.length === 0) {
        const fila = document.createElement("tr");
        const celda = document.createElement("td");

        celda.colSpan = 6;
        celda.className =
            "text-center text-muted py-5";

        celda.textContent =
            "Ningún alumno ha realizado una entrega " +
            "para esta tarea todavía.";

        fila.appendChild(celda);
        tabla.appendChild(fila);

        return;
    }

    entregasCorreccion.forEach(entrega => {
        tabla.appendChild(
            crearFilaEntregaCorreccion(entrega)
        );
    });
}


function crearFilaEntregaCorreccion(entrega) {
    const fila = document.createElement("tr");

    const nombre = obtenerNombreAlumnoCorreccion(
        entrega
    );

    const celdaAlumno = crearCeldaCorreccion(nombre);

    const celdaFecha = crearCeldaCorreccion(
        formatearFechaCorreccion(
            entrega.fecha_entrega ?? entrega.fechaEntrega
        )
    );

    const celdaArchivo = crearCeldaCorreccion(
        obtenerDescripcionAdjuntosCorreccion(entrega)
    );

    // El backend maneja nota y comentario
    // de forma independiente.
    const tieneNota =
        entrega.nota !== null &&
        entrega.nota !== undefined &&
        entrega.nota !== "";

    const tieneComentario =
        typeof entrega.comentario === "string" &&
        entrega.comentario.trim() !== "";

    let estado = "Sin corregir";

    if (tieneNota && tieneComentario) {
        estado = "Con nota y comentario";
    } else if (tieneNota) {
        estado = "Con nota";
    } else if (tieneComentario) {
        estado = "Con comentario";
    }

    const celdaEstado = crearCeldaCorreccion(estado);

    const celdaNota = crearCeldaCorreccion(
        tieneNota ? String(entrega.nota) : "-"
    );

    const celdaAcciones = document.createElement(
        "td"
    );

    const boton = document.createElement("button");

    boton.type = "button";
    boton.className =
        "btn btn-sm btn-outline-primary";

    boton.textContent = "Corregir";

    if (tallerActualCorreccion.estado !== "Activo") {
        boton.disabled = true;
        boton.title =
            "No se pueden corregir tareas de talleres finalizados.";
    }

    boton.addEventListener("click", () => {
        abrirModalCorregirEntrega(entrega.id);
    });

    celdaAcciones.appendChild(boton);

    fila.appendChild(celdaAlumno);
    fila.appendChild(celdaFecha);
    fila.appendChild(celdaArchivo);
    fila.appendChild(celdaEstado);
    fila.appendChild(celdaNota);
    fila.appendChild(celdaAcciones);

    return fila;
}


function crearCeldaCorreccion(texto) {
    const celda = document.createElement("td");

    celda.textContent = texto ?? "-";

    return celda;
}


// ======================================
// ADJUNTOS
// ======================================

function obtenerDescripcionAdjuntosCorreccion(entrega) {
    const entregaId = Number(entrega.id);

    const adjuntos = adjuntosCorreccion.get(
        entregaId
    );

    if (adjuntos === null) {
        return "No disponibles";
    }

    if (!Array.isArray(adjuntos) || adjuntos.length === 0) {
        return "-";
    }

    const nombres = adjuntos.map(adjunto =>
        adjunto.nombre_original ??
        adjunto.nombre_archivo ??
        adjunto.nombre ??
        adjunto.archivo_nombre ??
        `Adjunto #${adjunto.id ?? "?"}`
    );

    return nombres.join(", ");
}


// ======================================
// MODAL DE CORRECCIÓN
// ======================================

function configurarEventosCorreccion() {
    const botonGuardar = document.getElementById(
        "btn-guardar-correccion"
    );

    if (botonGuardar) {
        botonGuardar.onclick =
            guardarCorreccionAPI;
    }
}


function abrirModalCorregirEntrega(entregaId) {
    entregaSeleccionada = entregasCorreccion.find(
        entrega =>
            Number(entrega.id) === Number(entregaId)
    );

    if (!entregaSeleccionada) {
        mostrarAlertaCorreccion(
            "No se encontró la entrega seleccionada.",
            "danger"
        );

        return;
    }

    colocarTextoCorreccion(
        "corregir-alumno",
        obtenerNombreAlumnoCorreccion(
            entregaSeleccionada
        )
    );


    // Mostrar el comentario que escribió el alumno al entregar.
    const bloqueComentarioAlumno = document.getElementById(
        "bloque-comentario-alumno"
    );

    const comentarioAlumno =
        entregaSeleccionada.comentario_alumno;

    const tieneComentarioAlumno =
        typeof comentarioAlumno === "string" &&
        comentarioAlumno.trim() !== "";

    if (bloqueComentarioAlumno) {
        bloqueComentarioAlumno.classList.toggle(
            "d-none",
            !tieneComentarioAlumno
        );
    }

    colocarTextoCorreccion(
        "corregir-comentario-alumno",
        tieneComentarioAlumno ? comentarioAlumno : ""
    );


    colocarTextoCorreccion(
        "corregir-archivo",
        obtenerDescripcionAdjuntosCorreccion(
            entregaSeleccionada
        )
    );

    const inputNota = document.getElementById(
        "corregir-nota"
    );

    const inputComentario = document.getElementById(
        "corregir-comentario"
    );

    if (inputNota) {
        inputNota.value =
            entregaSeleccionada.nota ?? "";
    }

    if (inputComentario) {
        inputComentario.value =
            entregaSeleccionada.comentario ?? "";
    }

    ocultarAlertaModalCorreccion();

    bootstrap.Modal.getOrCreateInstance(
        document.getElementById(
            "modal-corregir-entrega"
        )
    ).show();
}


// ======================================
// GUARDAR CORRECCIÓN EN MYSQL
// ======================================

async function guardarCorreccionAPI() {
    if (guardandoCorreccion || !entregaSeleccionada) {
        return;
    }

    const inputNota = document.getElementById(
        "corregir-nota"
    );

    const inputComentario = document.getElementById(
        "corregir-comentario"
    );

    const valorNota = inputNota?.value.trim() ?? "";
    const comentario = inputComentario?.value.trim() ?? "";

    const nota = Number(valorNota);

    if (
        valorNota === "" ||
        !Number.isInteger(nota) ||
        nota < 1 ||
        nota > 10
    ) {
        mostrarAlertaModalCorreccion(
            "La nota debe ser un número entero entre 1 y 10."
        );
        return;
    }

    const entregaId = Number(
        entregaSeleccionada.id
    );

    const boton = document.getElementById(
        "btn-guardar-correccion"
    );

    guardandoCorreccion = true;

    if (boton) {
        boton.disabled = true;
        boton.textContent = "Guardando...";
    }

    ocultarAlertaModalCorreccion();

    let comentarioGuardado = false;
    let notaGuardada = false;

    try {
        // Primera operación: guardar comentario.
        await solicitarCorreccionAPI(
            `/entregas/${entregaId}/correccion`,
            "PATCH",
            {
                comentario: comentario || null
            }
        );

        comentarioGuardado = true;

        // Segunda operación: guardar nota.
        await solicitarCorreccionAPI(
            `/entregas/${entregaId}/nota`,
            "PATCH",
            {
                nota: nota
            }
        );

        notaGuardada = true;

        // Consultar nuevamente lo guardado en MySQL.
        await cargarEntregasCorreccion();

        bootstrap.Modal.getOrCreateInstance(
            document.getElementById(
                "modal-corregir-entrega"
            )
        ).hide();

        entregaSeleccionada = null;

        mostrarAlertaCorreccion(
            "Corrección guardada correctamente en MySQL.",
            "success"
        );

    } catch (error) {
        console.error(
            "Error al guardar corrección:",
            error
        );

        let mensaje =
            "No se pudo completar la corrección. " +
            error.message;

        if (comentarioGuardado && !notaGuardada) {
            mensaje +=
                " El comentario se guardó, pero la nota " +
                "no quedó confirmada. Podés reintentar.";
        } else if (comentarioGuardado && notaGuardada) {
            mensaje +=
                " Ambos cambios fueron aceptados por la API, " +
                "pero falló la recarga. Revisá la tarea antes " +
                "de volver a guardar.";
        }

        mostrarAlertaModalCorreccion(mensaje);

    } finally {
        guardandoCorreccion = false;

        if (boton) {
            boton.disabled = false;
            boton.textContent = "Guardar";
        }
    }
}


// ======================================
// VOLVER
// ======================================

function configurarEnlaceVolverCorreccion() {
    const enlace = document.getElementById(
        "enlace-volver-correccion"
    );

    if (!enlace || !tallerActualCorreccion) {
        return;
    }

    enlace.href =
        `material.html?tallerId=${Number(
            tallerActualCorreccion.id
        )}`;
}


// ======================================
// FECHAS
// ======================================

function formatearFechaCorreccion(fecha) {
    if (!fecha) {
        return "-";
    }

    const valor = String(fecha);

    const partes = valor.slice(0, 10).split("-");

    if (partes.length !== 3) {
        return valor;
    }

    const fechaFormateada =
        `${partes[2]}/${partes[1]}/${partes[0]}`;

    if (valor.length > 10) {
        const hora = valor.slice(11, 16);

        if (hora) {
            return `${fechaFormateada} ${hora}`;
        }
    }

    return fechaFormateada;
}


// ======================================
// ALERTAS
// ======================================

function mostrarAlertaCorreccion(
    mensaje,
    tipo = "danger"
) {
    const alerta = document.getElementById(
        "alerta-correccion-tarea"
    );

    if (!alerta) {
        return;
    }

    alerta.className = `alert alert-${tipo}`;
    alerta.textContent = mensaje;
}


function ocultarAlertaCorreccion() {
    const alerta = document.getElementById(
        "alerta-correccion-tarea"
    );

    if (!alerta) {
        return;
    }

    alerta.className = "alert d-none";
    alerta.textContent = "";
}


function mostrarAlertaModalCorreccion(mensaje) {
    const alerta = document.getElementById(
        "alerta-corregir-entrega"
    );

    if (!alerta) {
        return;
    }

    alerta.textContent = mensaje;
    alerta.classList.remove("d-none");
}


function ocultarAlertaModalCorreccion() {
    const alerta = document.getElementById(
        "alerta-corregir-entrega"
    );

    if (!alerta) {
        return;
    }

    alerta.textContent = "";
    alerta.classList.add("d-none");
}


// ======================================
// AUXILIAR
// ======================================

function colocarTextoCorreccion(id, valor) {
    const elemento = document.getElementById(id);

    if (elemento) {
        elemento.textContent = valor ?? "-";
    }
}
