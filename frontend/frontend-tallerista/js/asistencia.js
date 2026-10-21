
/*
    ASISTENCIA.JS - FRONTEND TALLERISTA

    Integración con la API real de INAU.

    - Comprueba la asignación del tallerista.
    - Obtiene el taller y sus horarios.
    - Carga los alumnos inscritos y activos.
    - Consulta la jornada de asistencia de hoy.
    - Recupera los registros anteriores.
    - Crea la jornada cuando no existe.
    - Guarda o actualiza registros en MySQL.

    No utiliza DATOS_SIMULADOS ni localStorage.
*/


// ======================================
// VARIABLES
// ======================================

let tallerActualAsistencia = null;
let alumnosAsistencia = [];
let fechaActualAsistencia = "";
let jornadaActualAsistencia = null;
let guardandoAsistencia = false;


// ======================================
// INICIALIZACIÓN
// ======================================

async function inicializarAsistencia() {
    mostrarCargaAsistencia(true);
    habilitarGuardadoAsistencia(false);
    ocultarAlertaAsistencia();

    configurarBotonGuardarAsistencia();

    fechaActualAsistencia = obtenerFechaISOAsistencia();

    colocarTextoAsistencia(
        "info-fecha",
        formatearFechaAsistencia(fechaActualAsistencia)
    );

    colocarTextoAsistencia(
        "contador-presentes",
        "0 de 0"
    );

    try {
        const tallerId = obtenerTallerIdAsistencia();

        // Verificar que el taller pertenezca al usuario.
        const misTalleres = await solicitarAsistenciaAPI(
            `/mis-talleres`
        );

        if (!Array.isArray(misTalleres)) {
            throw new Error(
                "No se pudo obtener la lista de talleres."
            );
        }

        const asignado = misTalleres.some(
            taller => Number(taller.id) === tallerId
        );

        if (!asignado) {
            throw new Error(
                "Este taller no está asignado a tu usuario."
            );
        }

        // Obtener el detalle completo, incluidos horarios.
        tallerActualAsistencia = await solicitarAsistenciaAPI(
            `/talleres/${tallerId}`
        );

        if (!tallerActualAsistencia) {
            throw new Error(
                "No se pudieron obtener los datos del taller."
            );
        }

        mostrarInformacionAsistencia();
        configurarEnlaceVolverAsistencia(tallerId);

        // Obtener los alumnos reales.
        const alumnos = await solicitarAsistenciaAPI(
            `/talleres/${tallerId}/alumnos`
        );

        if (!Array.isArray(alumnos)) {
            throw new Error(
                "La API no devolvió una lista de alumnos."
            );
        }

        const alumnosUnicos = new Map();

        alumnos.forEach(alumno => {
            const id = Number(alumno.alumno_id);

            if (
                Number.isInteger(id) &&
                id > 0 &&
                alumno.estado === "Activo"
            ) {
                alumnosUnicos.set(id, alumno);
            }
        });

        alumnosAsistencia = [...alumnosUnicos.values()];

        renderizarTablaAsistencia();

        // Buscar jornadas existentes.
        const jornadas = await solicitarAsistenciaAPI(
            `/talleres/${tallerId}/asistencias`
        );

        if (!Array.isArray(jornadas)) {
            throw new Error(
                "La API no devolvió una lista de jornadas."
            );
        }

        jornadaActualAsistencia = jornadas.find(
            jornada =>
                String(jornada.fecha).slice(0, 10) ===
                fechaActualAsistencia
        ) || null;

        if (jornadaActualAsistencia) {
            const detalle = await solicitarAsistenciaAPI(
                `/asistencias/${Number(jornadaActualAsistencia.id)}`
            );

            cargarRegistrosAsistencia(detalle);

            mostrarAlertaAsistencia(
                "Se recuperó la asistencia registrada para hoy. " +
                "Podés revisar y corregir los estados.",
                "info"
            );
        }

        actualizarContadorAsistencia();

        // Los talleres finalizados son de solo lectura.
        if (tallerActualAsistencia.estado !== "Activo") {
            deshabilitarSelectoresAsistencia();

            mostrarAlertaAsistencia(
                "Este taller no está activo. " +
                "No se pueden guardar nuevas asistencias.",
                "warning"
            );

            return;
        }

        habilitarGuardadoAsistencia(
            alumnosAsistencia.length > 0
        );

    } catch (error) {
        console.error(
            "Error al inicializar asistencia:",
            error
        );

        mostrarAlertaAsistencia(
            "No se pudo cargar la asistencia. " +
            error.message,
            "danger"
        );

        habilitarGuardadoAsistencia(false);

    } finally {
        mostrarCargaAsistencia(false);
    }
}


// ======================================
// PETICIONES A LA API
// ======================================

async function solicitarAsistenciaAPI(
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
            `La API no devolvió JSON válido en ${ruta}.`
        );
    }

    if (!respuesta.ok || resultado.ok === false) {
        const detalles = resultado.errores;

        let mensaje = resultado.mensaje ||
            `Error HTTP ${respuesta.status}`;

        if (
            Array.isArray(detalles) &&
            detalles.length > 0
        ) {
            mensaje += " " + detalles.join(" ");
        } else if (
            detalles &&
            typeof detalles === "object"
        ) {
            mensaje += " " +
                Object.values(detalles).join(" ");
        }

        throw new Error(mensaje);
    }

    return resultado.datos;
}


// ======================================
// ID DEL TALLER
// ======================================

function obtenerTallerIdAsistencia() {
    const parametros = new URLSearchParams(
        window.location.search
    );

    const valor = parametros.get("tallerId");

    if (!valor || !/^[1-9]\d*$/.test(valor)) {
        throw new Error(
            "No se indicó un taller válido."
        );
    }

    const id = Number(valor);

    if (!Number.isSafeInteger(id)) {
        throw new Error(
            "El ID del taller no es válido."
        );
    }

    return id;
}


// ======================================
// INFORMACIÓN DEL TALLER
// ======================================

function mostrarInformacionAsistencia() {
    colocarTextoAsistencia(
        "nombre-taller",
        tallerActualAsistencia.nombre || "Taller"
    );

    colocarTextoAsistencia(
        "info-horario",
        formatearHorariosAsistencia(
            tallerActualAsistencia.horarios
        )
    );

    document.title =
        `INAU - Asistencia - ${tallerActualAsistencia.nombre}`;
}


function configurarEnlaceVolverAsistencia(tallerId) {
    const enlace = document.getElementById(
        "enlace-volver"
    );

    if (enlace) {
        enlace.href =
            `detalle-taller.html?id=${tallerId}`;
    }
}


// ======================================
// TABLA DE ALUMNOS
// ======================================

function renderizarTablaAsistencia() {
    const cuerpo = document.getElementById(
        "tabla-alumnos"
    );

    if (!cuerpo) {
        throw new Error(
            "No se encontró la tabla de alumnos."
        );
    }

    cuerpo.replaceChildren();

    if (alumnosAsistencia.length === 0) {
        const fila = document.createElement("tr");
        const celda = document.createElement("td");

        celda.colSpan = 3;
        celda.className =
            "text-center text-muted py-4";

        celda.textContent =
            "No hay alumnos activos inscritos en este taller.";

        fila.appendChild(celda);
        cuerpo.appendChild(fila);

        return;
    }

    alumnosAsistencia.forEach(alumno => {
        const fila = crearFilaAsistencia(alumno);
        cuerpo.appendChild(fila);
    });
}


function crearFilaAsistencia(alumno) {
    const fila = document.createElement("tr");

    const celdaNombre = document.createElement("td");
    celdaNombre.className = "fw-semibold";

    const nombreCompleto = [
        alumno.nombre,
        alumno.apellido
    ].filter(Boolean).join(" ");

    celdaNombre.textContent =
        nombreCompleto || "Sin nombre";

    const celdaCedula = document.createElement("td");
    celdaCedula.textContent =
        alumno.cedula || "-";

    const celdaEstado = document.createElement("td");

    const selector = document.createElement("select");
    selector.className =
        "form-select form-select-sm estado-asistencia";

    selector.dataset.alumnoId =
        String(alumno.alumno_id);

    selector.setAttribute(
        "aria-label",
        `Asistencia de ${nombreCompleto}`
    );

    // Ningún alumno aparece presente por defecto.
    const opcionInicial = document.createElement("option");

    opcionInicial.value = "";
    opcionInicial.textContent = "Seleccionar estado";
    opcionInicial.selected = true;

    selector.appendChild(opcionInicial);

    const estados = [
        "Presente",
        "Ausente",
        "Justificado",
        "Tardanza"
    ];

    estados.forEach(estado => {
        const opcion = document.createElement("option");

        opcion.value = estado;
        opcion.textContent = estado;

        selector.appendChild(opcion);
    });

    selector.addEventListener(
        "change",
        actualizarContadorAsistencia
    );

    celdaEstado.appendChild(selector);

    fila.appendChild(celdaNombre);
    fila.appendChild(celdaCedula);
    fila.appendChild(celdaEstado);

    return fila;
}


// ======================================
// RECUPERAR ASISTENCIA EXISTENTE
// ======================================

function cargarRegistrosAsistencia(detalle) {
    const registros = Array.isArray(detalle?.registros)
        ? detalle.registros
        : [];

    const selectores = document.querySelectorAll(
        ".estado-asistencia"
    );

    const estadosPermitidos = [
        "Presente",
        "Ausente",
        "Justificado",
        "Tardanza"
    ];

    registros.forEach(registro => {
        const alumnoId = Number(registro.alumno_id);

        const selector = Array.from(selectores).find(
            elemento =>
                Number(elemento.dataset.alumnoId) ===
                alumnoId
        );

        if (
            selector &&
            estadosPermitidos.includes(registro.estado)
        ) {
            selector.value = registro.estado;
        }
    });
}


// ======================================
// CONTADOR DE PRESENTES
// ======================================

function actualizarContadorAsistencia() {
    const selectores = Array.from(
        document.querySelectorAll(
            ".estado-asistencia"
        )
    );

    const presentes = selectores.filter(
        selector => selector.value === "Presente"
    ).length;

    colocarTextoAsistencia(
        "contador-presentes",
        `${presentes} de ${alumnosAsistencia.length}`
    );
}


// ======================================
// BOTÓN GUARDAR
// ======================================

function configurarBotonGuardarAsistencia() {
    const boton = document.getElementById(
        "btn-guardar-asistencia"
    );

    if (!boton) {
        return;
    }

    boton.onclick = guardarAsistenciaAPI;
}


async function guardarAsistenciaAPI() {
    if (guardandoAsistencia) {
        return;
    }

    if (!tallerActualAsistencia) {
        mostrarAlertaAsistencia(
            "No se identificó el taller.",
            "danger"
        );
        return;
    }

    if (tallerActualAsistencia.estado !== "Activo") {
        mostrarAlertaAsistencia(
            "No se puede registrar asistencia " +
            "en un taller finalizado.",
            "warning"
        );
        return;
    }

    const selectores = Array.from(
        document.querySelectorAll(
            ".estado-asistencia"
        )
    );

    if (selectores.length === 0) {
        mostrarAlertaAsistencia(
            "No hay alumnos para registrar.",
            "warning"
        );
        return;
    }

    const sinSeleccionar = selectores.some(
        selector => selector.value === ""
    );

    if (sinSeleccionar) {
        mostrarAlertaAsistencia(
            "Debés seleccionar la asistencia " +
            "de todos los alumnos antes de guardar.",
            "warning"
        );
        return;
    }

    const registros = selectores.map(selector => ({
        alumno_id: Number(
            selector.dataset.alumnoId
        ),
        estado: selector.value
    }));

    guardandoAsistencia = true;
    habilitarGuardadoAsistencia(false);

    const boton = document.getElementById(
        "btn-guardar-asistencia"
    );

    if (boton) {
        boton.textContent = "Guardando...";
    }

    let guardados = 0;

    try {
        const tallerId = Number(
            tallerActualAsistencia.id
        );

        // Crear la jornada solo cuando todavía no existe.
        if (!jornadaActualAsistencia) {
            jornadaActualAsistencia =
                await solicitarAsistenciaAPI(
                    `/talleres/${tallerId}/asistencias`,
                    "POST",
                    {
                        fecha: fechaActualAsistencia
                    }
                );
        }

        const jornadaId = Number(
            jornadaActualAsistencia?.id
        );

        if (
            !Number.isInteger(jornadaId) ||
            jornadaId <= 0
        ) {
            throw new Error(
                "La API no devolvió el ID de la jornada."
            );
        }

        // Guardamos cada registro.
        // Si existe, el backend lo actualiza.
        for (const registro of registros) {
            await solicitarAsistenciaAPI(
                `/asistencias/${jornadaId}/registros`,
                "POST",
                registro
            );

            guardados++;
        }

        mostrarAlertaAsistencia(
            `Asistencia guardada correctamente. ` +
            `${guardados} registros guardados en MySQL.`,
            "success"
        );

    } catch (error) {
        console.error(
            "Error al guardar asistencia:",
            error
        );

        mostrarAlertaAsistencia(
            `No se pudo completar el guardado. ` +
            `Se confirmaron ${guardados} de ` +
            `${registros.length} registros. ` +
            error.message +
            " Podés volver a intentar guardar; " +
            "los registros existentes se actualizan.",
            "danger"
        );

    } finally {
        guardandoAsistencia = false;

        habilitarGuardadoAsistencia(
            alumnosAsistencia.length > 0 &&
            tallerActualAsistencia?.estado === "Activo"
        );

        if (boton) {
            boton.textContent = "Guardar asistencia";
        }
    }
}


// ======================================
// FECHAS Y HORARIOS
// ======================================

function obtenerFechaISOAsistencia() {
    const fecha = new Date();

    const anio = fecha.getFullYear();

    const mes = String(
        fecha.getMonth() + 1
    ).padStart(2, "0");

    const dia = String(
        fecha.getDate()
    ).padStart(2, "0");

    return `${anio}-${mes}-${dia}`;
}


function formatearFechaAsistencia(fechaISO) {
    const partes = fechaISO.split("-");

    if (partes.length !== 3) {
        return fechaISO;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}


function formatearHorariosAsistencia(horarios) {
    if (
        !Array.isArray(horarios) ||
        horarios.length === 0
    ) {
        return "Horario no disponible";
    }

    return horarios.map(horario => {
        const dia = horario.dia ??
            horario.dia_semana ??
            "";

        const inicio = horario.hora_inicio ??
            horario.horaInicio ??
            "";

        const fin = horario.hora_fin ??
            horario.horaFin ??
            "";

        return `${dia}: ${inicio} a ${fin}`;
    }).join(" | ");
}


// ======================================
// ESTADO VISUAL
// ======================================

function mostrarCargaAsistencia(mostrar) {
    const spinner = document.getElementById(
        "loading-spinner"
    );

    if (spinner) {
        spinner.classList.toggle("d-none", !mostrar);
    }
}


function habilitarGuardadoAsistencia(habilitar) {
    const boton = document.getElementById(
        "btn-guardar-asistencia"
    );

    if (boton) {
        boton.disabled = !habilitar;
    }
}


function deshabilitarSelectoresAsistencia() {
    document.querySelectorAll(
        ".estado-asistencia"
    ).forEach(selector => {
        selector.disabled = true;
    });
}


// ======================================
// ALERTAS
// ======================================

function mostrarAlertaAsistencia(
    mensaje,
    tipo = "danger"
) {
    const alerta = document.getElementById(
        "alerta-asistencia"
    );

    if (!alerta) {
        return;
    }

    alerta.classList.remove(
        "d-none",
        "alert-success",
        "alert-danger",
        "alert-warning",
        "alert-info"
    );

    alerta.classList.add(`alert-${tipo}`);
    alerta.textContent = mensaje;
}


function ocultarAlertaAsistencia() {
    const alerta = document.getElementById(
        "alerta-asistencia"
    );

    if (!alerta) {
        return;
    }

    alerta.textContent = "";
    alerta.classList.add("d-none");
}


// ======================================
// FUNCIÓN AUXILIAR
// ======================================

function colocarTextoAsistencia(id, contenido) {
    const elemento = document.getElementById(id);

    if (elemento) {
        elemento.textContent = contenido ?? "-";
    }
}
