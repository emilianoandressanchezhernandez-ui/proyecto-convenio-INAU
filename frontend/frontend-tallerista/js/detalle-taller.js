
/*
    DETALLE-TALLER.JS - FRONTEND TALLERISTA

    Integración con la API real.

    - Obtiene el ID del taller desde la URL.
    - Comprueba que esté asignado al tallerista.
    - Muestra información real del taller.
    - Consulta alumnos y jornadas de asistencia.
    - Calcula asistencia sobre registros disponibles.
    - Configura los enlaces a otros módulos.

    No utiliza DATOS_SIMULADOS ni localStorage.
*/


// ======================================
// INICIALIZACIÓN
// ======================================

async function inicializarDetalleTaller() {
    ocultarErrorDetalle();

    colocarTextoDetalle("nombre-taller", "Cargando taller...");
    colocarTextoDetalle("descripcion-taller", "Cargando información...");
    colocarTextoDetalle("cantidad-alumnos", "--");
    colocarTextoDetalle("asistencia-promedio", "--");
    colocarTextoDetalle("estado-taller", "--");

    desactivarAccionesDetalle();

    try {
        const tallerId = obtenerTallerIdDesdeURL();

        // Se utiliza la sesión del tallerista.
        const talleres = await solicitarDetalleAPI(
            "/mis-talleres"
        );

        if (!Array.isArray(talleres)) {
            throw new Error(
                "La API no devolvió una lista de talleres."
            );
        }

        const taller = talleres.find(
            item => Number(item.id) === tallerId
        );

        if (!taller) {
            throw new Error(
                "Este taller no está asignado a tu usuario."
            );
        }


        // Consultar el detalle completo, incluidos los horarios.
        // Ya verificamos que este taller pertenece al usuario.
        const tallerCompleto = await solicitarDetalleAPI(
            `/talleres/${tallerId}`
        );

        mostrarDetalleTaller(tallerCompleto);
        configurarAccionesTaller(tallerId);


        // Consultas adicionales independientes.
        await Promise.all([
            cargarAlumnosDetalle(tallerId),
            cargarAsistenciaDetalle(tallerId)
        ]);

    } catch (error) {
        console.error(
            "Error al cargar el detalle del taller:",
            error
        );

        mostrarErrorDetalle(error.message);
    }
}


// ======================================
// CONSULTAS A LA API
// ======================================

async function solicitarDetalleAPI(ruta) {
    const respuesta = await fetch(
        `${TALLERISTA_API_URL}${ruta}`,
        {
            method: "GET",
            credentials: "include",
            headers: {
                Accept: "application/json"
            }
        }
    );

    let resultado;

    try {
        resultado = await respuesta.json();
    } catch (error) {
        throw new Error(
            `La API devolvió una respuesta inválida en ${ruta}.`
        );
    }

    if (!respuesta.ok || resultado.ok === false) {
        throw new Error(
            resultado.mensaje ||
            `No se pudo consultar ${ruta}.`
        );
    }

    return resultado.datos;
}


// ======================================
// OBTENER ID DESDE LA URL
// ======================================

function obtenerTallerIdDesdeURL() {
    const parametros = new URLSearchParams(
        window.location.search
    );

    const valor = parametros.get("id");

    if (!valor || !/^[1-9]\d*$/.test(valor)) {
        throw new Error(
            "El identificador del taller no es válido."
        );
    }

    const id = Number(valor);

    if (!Number.isSafeInteger(id)) {
        throw new Error(
            "El identificador del taller no es válido."
        );
    }

    return id;
}


// ======================================
// INFORMACIÓN GENERAL
// ======================================

function mostrarDetalleTaller(taller) {
    colocarTextoDetalle(
        "nombre-taller",
        taller.nombre || "Taller sin nombre"
    );

    colocarTextoDetalle(
        "descripcion-taller",
        taller.descripcion || "Sin descripción disponible."
    );

    colocarTextoDetalle(
        "estado-taller",
        taller.estado || "No disponible"
    );

    aplicarEstiloEstado(taller.estado);

    mostrarHorariosDetalle(taller);
    mostrarUbicacionDetalle(taller);

    document.title = `INAU - ${taller.nombre || "Taller"}`;
}


// ======================================
// HORARIOS
// ======================================

function mostrarHorariosDetalle(taller) {
    const horarios = Array.isArray(taller.horarios)
        ? taller.horarios
        : [];

    if (horarios.length > 0) {
        const dias = horarios
            .map(h => h.dia || h.dia_semana || "")
            .filter(Boolean);

        const franjas = horarios
            .map(h => {
                const inicio =
                    h.hora_inicio ?? h.horaInicio;

                const fin =
                    h.hora_fin ?? h.horaFin;

                const dia =
                    h.dia ?? h.dia_semana ?? "";

                if (!inicio || !fin) {
                    return "";
                }

                return `${dia}: ${inicio} a ${fin}`;
            })
            .filter(Boolean);

        colocarTextoDetalle(
            "dias-taller",
            [...new Set(dias)].join(" - ") ||
            "Días no disponibles"
        );

        colocarTextoDetalle(
            "horario-taller",
            franjas.join(" | ") ||
            "Horario no disponible"
        );

        return;
    }

    colocarTextoDetalle(
        "dias-taller",
        "Días no disponibles"
    );

    colocarTextoDetalle(
        "horario-taller",
        "Horario no disponible"
    );
}


// ======================================
// UBICACIÓN
// ======================================

function mostrarUbicacionDetalle(taller) {
    const ubicacion = taller.ubicacion;

    if (typeof ubicacion === "string" &&
        ubicacion.trim() !== "") {
        colocarTextoDetalle(
            "ubicacion-taller",
            ubicacion
        );
        return;
    }

    if (ubicacion && typeof ubicacion === "object") {
        const partes = [
            ubicacion.centro,
            ubicacion.direccion,
            ubicacion.salon
        ].filter(Boolean);

        if (partes.length > 0) {
            colocarTextoDetalle(
                "ubicacion-taller",
                partes.join(" - ")
            );
            return;
        }
    }

    const partes = [
        taller.centro,
        taller.direccion,
        taller.salon
    ].filter(Boolean);

    colocarTextoDetalle(
        "ubicacion-taller",
        partes.join(" - ") || "Ubicación no disponible"
    );
}


// ======================================
// ALUMNOS
// ======================================

async function cargarAlumnosDetalle(tallerId) {
    try {
        const alumnos = await solicitarDetalleAPI(
            `/talleres/${tallerId}/alumnos`
        );

        if (!Array.isArray(alumnos)) {
            throw new Error(
                "La API no devolvió una lista de alumnos."
            );
        }

        const idsUnicos = new Set();

        alumnos.forEach(alumno => {
            if (
                alumno.alumno_id != null &&
                alumno.estado === "Activo"
            ) {
                idsUnicos.add(Number(alumno.alumno_id));
            }
        });

        colocarTextoDetalle(
            "cantidad-alumnos",
            idsUnicos.size
        );

    } catch (error) {
        console.error(
            "Error al consultar alumnos:",
            error
        );

        colocarTextoDetalle(
            "cantidad-alumnos",
            "No disponible"
        );

        mostrarErrorDetalle(
            "No se pudo consultar la cantidad de alumnos: " +
            error.message
        );
    }
}


// ======================================
// ASISTENCIA PROMEDIO
// ======================================

async function cargarAsistenciaDetalle(tallerId) {
    try {
        const jornadas = await solicitarDetalleAPI(
            `/talleres/${tallerId}/asistencias`
        );

        if (!Array.isArray(jornadas)) {
            throw new Error(
                "La API no devolvió una lista de jornadas."
            );
        }

        if (jornadas.length === 0) {
            colocarTextoDetalle(
                "asistencia-promedio",
                "Sin registros"
            );
            return;
        }

        const detalles = await Promise.all(
            jornadas.map(jornada => {
                const id = Number(jornada.id);

                if (!Number.isInteger(id) || id <= 0) {
                    throw new Error(
                        "Se recibió una jornada con ID inválido."
                    );
                }

                return solicitarDetalleAPI(
                    `/asistencias/${id}`
                );
            })
        );

        let presentes = 0;
        let ausentes = 0;

        detalles.forEach(detalle => {
            const registros = Array.isArray(detalle.registros)
                ? detalle.registros
                : [];

            registros.forEach(registro => {
                if (registro.estado === "Presente") {
                    presentes++;
                } else if (registro.estado === "Ausente") {
                    ausentes++;
                }
            });
        });

        const total = presentes + ausentes;

        if (total === 0) {
            colocarTextoDetalle(
                "asistencia-promedio",
                "Sin registros"
            );
            return;
        }

        // Porcentaje de registros presentes sobre
        // registros presentes y ausentes.
        const porcentaje = Math.round(
            (presentes / total) * 100
        );

        colocarTextoDetalle(
            "asistencia-promedio",
            `${porcentaje}%`
        );

    } catch (error) {
        console.error(
            "Error al consultar asistencias:",
            error
        );

        colocarTextoDetalle(
            "asistencia-promedio",
            "No disponible"
        );

        mostrarErrorDetalle(
            "No se pudo consultar la asistencia: " +
            error.message
        );
    }
}


// ======================================
// ACCIONES
// ======================================

function desactivarAccionesDetalle() {
    [
        "enlace-asistencia",
        "enlace-informes",
        "enlace-material"
    ].forEach(id => {
        const enlace = document.getElementById(id);

        if (enlace) {
            enlace.removeAttribute("href");
            enlace.classList.add("disabled");
            enlace.setAttribute("aria-disabled", "true");
        }
    });

    const boton = document.getElementById(
        "btn-ver-alumnos"
    );

    if (boton) {
        boton.disabled = true;
    }
}


function configurarAccionesTaller(tallerId) {
    const enlaces = {
        "enlace-asistencia":
            `asistencia.html?tallerId=${tallerId}`,

        "enlace-informes":
            `informes.html?tallerId=${tallerId}`,

        "enlace-material":
            `material.html?tallerId=${tallerId}`
    };

    Object.entries(enlaces).forEach(([id, url]) => {
        const enlace = document.getElementById(id);

        if (enlace) {
            enlace.href = url;
            enlace.classList.remove("disabled");
            enlace.removeAttribute("aria-disabled");
        }
    });

    const boton = document.getElementById(
        "btn-ver-alumnos"
    );

    if (boton) {
        boton.disabled = false;

        boton.onclick = () => {
            window.location.href =
                `asistencia.html?tallerId=${tallerId}` +
                "#contenedor-tabla";
        };
    }
}


// ======================================
// ESTILO DEL ESTADO
// ======================================

function aplicarEstiloEstado(estado) {
    const elemento = document.getElementById(
        "estado-taller"
    );

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

    const clases = {
        Activo: "text-success",
        Inactivo: "text-secondary",
        Suspendido: "text-warning",
        Cancelado: "text-danger",
        Finalizado: "text-dark"
    };

    elemento.classList.add(
        clases[estado] || "text-secondary"
    );
}


// ======================================
// FUNCIONES AUXILIARES
// ======================================

function colocarTextoDetalle(id, contenido) {
    const elemento = document.getElementById(id);

    if (elemento) {
        elemento.textContent = contenido ?? "-";
    }
}


function mostrarErrorDetalle(mensaje) {
    const alerta = document.getElementById(
        "alerta-detalle-taller"
    );

    if (!alerta) {
        return;
    }

    alerta.textContent = alerta.classList.contains("d-none")
        ? mensaje
        : `${alerta.textContent} ${mensaje}`;

    alerta.classList.remove("d-none");
}


function ocultarErrorDetalle() {
    const alerta = document.getElementById(
        "alerta-detalle-taller"
    );

    if (!alerta) {
        return;
    }

    alerta.textContent = "";
    alerta.classList.add("d-none");
}
