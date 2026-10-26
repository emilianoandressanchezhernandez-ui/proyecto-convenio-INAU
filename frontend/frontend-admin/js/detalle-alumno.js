
/*
 * DETALLE-ALUMNO.JS - FRONTEND ADMIN
 *
 * Funciones:
 * - Consultar alumno real desde MySQL.
 * - Mostrar datos personales y observaciones.
 * - Editar mediante PATCH /alumnos/{id}.
 * - Desactivar mediante DELETE /alumnos/{id}.
 * - Consultar talleres e inscripciones reales.
 * - Mostrar talleristas y horarios reales.
 * - Consultar asistencias reales.
 * - Calcular presencias y porcentaje de asistencia.
 * - Mostrar la fecha de la última presencia.
 */

"use strict";

let alumnoActual = null;
let guardandoEdicionAlumno = false;
let desactivandoAlumno = false;
let accionesDetalleConfiguradas = false;


// ==============================
// INICIALIZACIÓN
// ==============================

async function inicializarDetalleAlumno() {

    configurarAcciones();

    try {
        const id = obtenerParametroURL("id");

        if (!id || !/^[1-9]\d*$/.test(String(id))) {
            throw new Error("El ID del alumno no es válido.");
        }

        await cargarDetalleAlumno(Number(id));

    } catch (error) {
        console.error("Error al cargar el alumno:", error);
        mostrarErrorDetalle(error.message);
        deshabilitarAccionesAlumno();
    }
}


// ==============================
// CONSULTAR ALUMNO REAL
// ==============================

async function cargarDetalleAlumno(id) {

    colocarTexto("nombre-alumno", "Cargando alumno...");

    const datos = await inauApi(`/alumnos/${id}`);

    if (
        !datos ||
        typeof datos !== "object" ||
        Number(datos.id) !== id
    ) {
        throw new Error("La API no devolvió una ficha válida.");
    }

    alumnoActual = normalizarDetalleAlumno(datos);

    mostrarDatosAlumno(alumnoActual);
    mostrarEstadisticasAlumno(alumnoActual);
    actualizarEstadoAcciones();

    // Consultar talleres e inscripciones reales.
    await cargarTalleresRealesDelAlumno(alumnoActual.id);

    // NUEVO: consultar estadísticas de asistencia reales.
    await cargarAsistenciasRealesDelAlumno(alumnoActual.id);
}


// ==============================
// NORMALIZACIÓN DE DATOS
// ==============================

function normalizarDetalleAlumno(datos) {

    return {
        id: Number(datos.id),
        usuarioId: datos.usuario_id ?? null,

        nombre: datos.nombre ?? "",
        apellido: datos.apellido ?? "",
        cedula: datos.cedula ?? "",

        correo: datos.correo ?? "",
        telefono: datos.telefono ?? "",

        direccion: datos.direccion ?? "",
        referenteAdulto: datos.referente_adulto ?? "",
        centroReferencia: datos.centro_referencia ?? "",

        fechaNacimiento: datos.fecha_nacimiento ?? "",
        fechaRegistro: datos.fecha_registro ?? "",
        ultimaAsistencia: datos.ultima_asistencia ?? null,

        estado: datos.estado ?? "Activo",
        observaciones: datos.observaciones ?? ""
    };
}


// ==============================
// MOSTRAR INFORMACIÓN PERSONAL
// ==============================

function mostrarDatosAlumno(alumno) {

    const nombreCompleto = [
        alumno.nombre,
        alumno.apellido
    ].filter(Boolean).join(" ");

    colocarTexto("nombre-alumno", nombreCompleto);
    colocarTexto("alumno-nombre-completo", nombreCompleto);
    colocarTexto("estado-alumno", alumno.estado);

    colocarTexto("cedula", alumno.cedula || "—");

    colocarTexto(
        "fecha-nacimiento",
        alumno.fechaNacimiento
            ? formatearFecha(alumno.fechaNacimiento)
            : "—"
    );

    colocarTexto("telefono", alumno.telefono || "—");
    colocarTexto("correo", alumno.correo || "—");

    colocarTexto(
        "fecha-registro",
        alumno.fechaRegistro
            ? formatearFecha(alumno.fechaRegistro)
            : "—"
    );

    const observaciones =
        document.getElementById("observaciones");

    if (observaciones) {
        observaciones.textContent =
            alumno.observaciones ||
            "No hay observaciones registradas.";
    }

    // La última presencia se muestra desde los registros
    // de asistencia, no desde datos simulados.
}


// ==============================
// ESTADÍSTICAS
// ==============================

function mostrarEstadisticasAlumno(alumno) {

    // Se actualizarán con consultas reales.
    colocarTexto("cantidad-talleres", "—");
    colocarTexto("asistencias", "—");
    colocarTexto("porcentaje-asistencia", "—");
    colocarTexto("ultima-asistencia", "Cargando...");
}


function calcularPorcentajeAsistencia(registros) {

    if (!Array.isArray(registros) || registros.length === 0) {
        return 0;
    }

    const presentes = registros.filter(
        registro => registro.estado === "Presente"
    ).length;

    return Math.round(
        (presentes / registros.length) * 100
    );
}


// ==============================
// ASISTENCIAS REALES DEL ALUMNO
// ==============================

async function cargarAsistenciasRealesDelAlumno(alumnoId) {

    colocarTexto("asistencias", "—");
    colocarTexto("porcentaje-asistencia", "—");
    colocarTexto("ultima-asistencia", "Cargando...");

    try {

        // 1. Consultar todos los talleres.
        const talleres = await inauApi("/talleres");

        if (!Array.isArray(talleres)) {
            throw new Error(
                "No se pudieron consultar los talleres."
            );
        }

        // 2. Identificar los talleres inscritos.
        const resultados = await Promise.all(

            talleres.map(async taller => {

                const inscripciones = await inauApi(
                    `/talleres/${taller.id}/alumnos`
                );

                if (!Array.isArray(inscripciones)) {
                    throw new Error(
                        `No se pudieron consultar las inscripciones del taller ${taller.id}.`
                    );
                }

                const inscrito = inscripciones.some(
                    inscripcion =>
                        Number(inscripcion.alumno_id) ===
                        Number(alumnoId)
                );

                return inscrito ? taller : null;

            })

        );

        const talleresInscritos = resultados.filter(Boolean);

        // 3. Consultar las jornadas de esos talleres.
        const jornadasPorTaller = await Promise.all(

            talleresInscritos.map(async taller => {

                const jornadas = await inauApi(
                    `/talleres/${taller.id}/asistencias`
                );

                if (!Array.isArray(jornadas)) {
                    throw new Error(
                        `No se pudieron consultar las asistencias del taller ${taller.id}.`
                    );
                }

                return jornadas;

            })

        );

        const jornadas = jornadasPorTaller.flat();

        // 4. Consultar cada jornada con sus registros.
        const detalles = await Promise.all(

            jornadas.map(async jornada => {

                const detalle = await inauApi(
                    `/asistencias/${jornada.id}`
                );

                if (
                    !detalle ||
                    typeof detalle !== "object" ||
                    !Array.isArray(detalle.registros)
                ) {
                    throw new Error(
                        `No se pudieron consultar los registros de la jornada ${jornada.id}.`
                    );
                }

                return detalle;

            })

        );

        // 5. Obtener los registros individuales del alumno.
        const registrosAlumno = [];

        detalles.forEach(detalle => {

            detalle.registros.forEach(registro => {

                if (
                    Number(registro.alumno_id) ===
                    Number(alumnoId)
                ) {
                    registrosAlumno.push({
                        estado: registro.estado,
                        fecha: detalle.fecha
                    });
                }

            });

        });

        // 6. Calcular cuántas veces estuvo presente.
        const presentes = registrosAlumno.filter(
            registro => registro.estado === "Presente"
        );

        colocarTexto("asistencias", presentes.length);

        // Sin registros individuales no hay porcentaje.
        if (registrosAlumno.length === 0) {

            colocarTexto(
                "porcentaje-asistencia",
                "Sin datos"
            );

            colocarTexto(
                "ultima-asistencia",
                "Sin registros"
            );

            return;
        }

        // 7. Calcular porcentaje real.
        const porcentaje = calcularPorcentajeAsistencia(
            registrosAlumno
        );

        colocarTexto(
            "porcentaje-asistencia",
            `${porcentaje}%`
        );

        // 8. Última fecha en que estuvo presente.
        if (presentes.length > 0) {

            const fechas = presentes
                .map(registro => registro.fecha)
                .filter(Boolean)
                .sort();

            if (fechas.length > 0) {

                const ultimaFecha = fechas[fechas.length - 1];

                colocarTexto(
                    "ultima-asistencia",
                    formatearFecha(ultimaFecha)
                );

            } else {

                colocarTexto(
                    "ultima-asistencia",
                    "Fecha no disponible"
                );
            }

        } else {

            colocarTexto(
                "ultima-asistencia",
                "Sin presencias"
            );
        }

    } catch (error) {

        console.error(
            "Error al cargar las asistencias:",
            error
        );

        // Ante un fallo, no mostrar cifras incompletas.
        colocarTexto("asistencias", "—");
        colocarTexto("porcentaje-asistencia", "—");
        colocarTexto(
            "ultima-asistencia",
            "No disponible"
        );

        mostrarErrorDetalle(
            "No se pudieron cargar las estadísticas de asistencia."
        );
    }
}


// ==============================
// CONSULTAR TALLERES REALES
// ==============================

async function cargarTalleresRealesDelAlumno(alumnoId) {

    const tabla = document.getElementById("tabla-talleres");

    if (tabla) {
        tabla.innerHTML = `
            <tr>
                <td colspan="4" class="text-center py-4">
                    Cargando talleres...
                </td>
            </tr>
        `;
    }

    try {

        // 1. Consultar todos los talleres.
        const talleres = await inauApi("/talleres");

        if (!Array.isArray(talleres)) {
            throw new Error(
                "La API no devolvió una lista válida de talleres."
            );
        }

        // 2. Consultar los alumnos inscritos.
        const resultados = await Promise.all(

            talleres.map(async taller => {

                const inscripciones = await inauApi(
                    `/talleres/${taller.id}/alumnos`
                );

                if (!Array.isArray(inscripciones)) {
                    throw new Error(
                        `No se pudieron consultar las inscripciones del taller ${taller.id}.`
                    );
                }

                const inscrito = inscripciones.some(
                    inscripcion =>
                        Number(inscripcion.alumno_id) ===
                        Number(alumnoId)
                );

                return {
                    taller,
                    inscrito
                };
            })

        );

        // 3. Conservar los talleres inscritos.
        const talleresInscritos = resultados
            .filter(resultado => resultado.inscrito)
            .map(resultado => resultado.taller);

        // 4. Consultar horarios y talleristas.
        const talleresCompletos = await Promise.all(

            talleresInscritos.map(async taller => {

                const [detalle, talleristas] =
                    await Promise.all([
                        inauApi(`/talleres/${taller.id}`),
                        inauApi(
                            `/talleres/${taller.id}/talleristas`
                        )
                    ]);

                if (
                    !detalle ||
                    typeof detalle !== "object" ||
                    Number(detalle.id) !== Number(taller.id) ||
                    !Array.isArray(talleristas)
                ) {
                    throw new Error(
                        `La API devolvió datos incompletos del taller ${taller.id}.`
                    );
                }

                return {
                    ...detalle,
                    talleristas
                };

            })

        );

        // 5. Renderizar datos reales.
        renderizarTalleresReales(talleresCompletos);

        colocarTexto(
            "cantidad-talleres",
            talleresCompletos.length
        );

    } catch (error) {

        console.error(
            "Error al consultar talleres:",
            error
        );

        colocarTexto("cantidad-talleres", "—");

        if (tabla) {
            tabla.innerHTML = `
                <tr>
                    <td colspan="4"
                        class="text-center text-danger py-4">
                        No se pudieron cargar los talleres.
                    </td>
                </tr>
            `;
        }

        mostrarErrorDetalle(
            error.message ||
            "No se pudieron cargar los talleres."
        );
    }
}


// ==============================
// RENDERIZAR TALLERES
// ==============================

function renderizarTalleresReales(talleres) {

    const tabla = document.getElementById("tabla-talleres");

    if (!tabla) return;

    if (!Array.isArray(talleres) || talleres.length === 0) {

        tabla.innerHTML = `
            <tr>
                <td colspan="4"
                    class="text-center text-muted py-4">
                    Este alumno no tiene talleres registrados.
                </td>
            </tr>
        `;

        return;
    }

    tabla.innerHTML = talleres.map(taller => {

        const nombresTalleristas = taller.talleristas
            .map(tallerista =>
                `${tallerista.nombre} ${tallerista.apellido}`
            )
            .join(", ") || "Sin asignar";

        const horarios = formatearHorariosReales(
            taller.horarios || []
        );

        return `
            <tr>
                <td>
                    ${escaparHTML(taller.nombre || "—")}
                </td>

                <td>
                    ${escaparHTML(nombresTalleristas)}
                </td>

                <td>
                    ${escaparHTML(horarios)}
                </td>

                <td>
                    ${escaparHTML(taller.estado || "—")}
                </td>
            </tr>
        `;

    }).join("");
}


// ==============================
// FORMATEAR HORARIOS
// ==============================

function formatearHorariosReales(horarios) {

    if (!Array.isArray(horarios) || horarios.length === 0) {
        return "Sin horarios registrados";
    }

    return horarios.map(horario => {

        const dia = horario.dia || "Día sin especificar";

        const inicio = String(
            horario.hora_inicio || ""
        ).slice(0, 5);

        const fin = String(
            horario.hora_fin || ""
        ).slice(0, 5);

        return `${dia}: ${inicio} - ${fin}`;

    }).join(" / ");
}


// ==============================
// CONFIGURAR ACCIONES
// ==============================

function configurarAcciones() {

    if (accionesDetalleConfiguradas) {
        return;
    }

    accionesDetalleConfiguradas = true;

    const botonEditar =
        document.getElementById("btn-editar");

    const botonGuardar =
        document.getElementById(
            "btn-guardar-editar-alumno"
        );

    const botonDesactivar =
        document.getElementById("btn-desactivar");

    botonEditar?.addEventListener(
        "click",
        abrirModalEditarAlumno
    );

    botonGuardar?.addEventListener(
        "click",
        guardarEdicionAlumno
    );

    botonDesactivar?.addEventListener(
        "click",
        desactivarAlumno
    );
}


function deshabilitarAccionesAlumno() {

    const editar = document.getElementById("btn-editar");
    const desactivar = document.getElementById("btn-desactivar");

    if (editar) editar.disabled = true;
    if (desactivar) desactivar.disabled = true;
}


function actualizarEstadoAcciones() {

    const editar = document.getElementById("btn-editar");
    const desactivar = document.getElementById("btn-desactivar");

    if (editar) {
        editar.disabled = !alumnoActual;
    }

    if (desactivar) {
        desactivar.disabled =
            !alumnoActual ||
            alumnoActual.estado === "Inactivo" ||
            desactivandoAlumno;
    }
}


// ==============================
// EDITAR ALUMNO
// ==============================

function abrirModalEditarAlumno() {

    if (!alumnoActual) {
        return;
    }

    document.getElementById(
        "editar-alumno-nombre"
    ).value = alumnoActual.nombre;

    document.getElementById(
        "editar-alumno-apellido"
    ).value = alumnoActual.apellido;

    const cedulaInput =
        document.getElementById("editar-alumno-cedula");

    cedulaInput.value = alumnoActual.cedula;
    cedulaInput.readOnly = true;

    cedulaInput.title =
        "La cédula no puede modificarse desde esta operación.";

    document.getElementById(
        "editar-alumno-fecha-nacimiento"
    ).value = alumnoActual.fechaNacimiento;

    document.getElementById(
        "editar-alumno-correo"
    ).value = alumnoActual.correo;

    document.getElementById(
        "editar-alumno-telefono"
    ).value = alumnoActual.telefono;

    document.getElementById(
        "editar-alumno-observaciones"
    ).value = alumnoActual.observaciones;

    ocultarAlerta("alerta-editar-alumno");

    bootstrap.Modal.getOrCreateInstance(
        document.getElementById("modal-editar-alumno")
    ).show();
}


// ==============================
// GUARDAR EDICIÓN REAL
// ==============================

async function guardarEdicionAlumno() {

    if (!alumnoActual || guardandoEdicionAlumno) {
        return;
    }

    const datosEditados = {

        nombre: document.getElementById(
            "editar-alumno-nombre"
        ).value.trim(),

        apellido: document.getElementById(
            "editar-alumno-apellido"
        ).value.trim(),

        fecha_nacimiento: document.getElementById(
            "editar-alumno-fecha-nacimiento"
        ).value,

        correo: document.getElementById(
            "editar-alumno-correo"
        ).value.trim() || null,

        telefono: document.getElementById(
            "editar-alumno-telefono"
        ).value.trim() || null,

        observaciones: document.getElementById(
            "editar-alumno-observaciones"
        ).value.trim() || null
    };

    const error = validarEdicionAlumno(datosEditados);

    if (error) {

        mostrarAlerta(
            "alerta-editar-alumno",
            error,
            "danger"
        );

        return;
    }

    const botonGuardar = document.getElementById(
        "btn-guardar-editar-alumno"
    );

    guardandoEdicionAlumno = true;

    if (botonGuardar) {
        botonGuardar.disabled = true;
        botonGuardar.textContent = "Guardando...";
    }

    try {

        const datosActualizados = await inauApi(
            `/alumnos/${alumnoActual.id}`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(datosEditados)
            }
        );

        if (!datosActualizados?.id) {
            throw new Error(
                "La API no confirmó el alumno actualizado."
            );
        }

        alumnoActual = normalizarDetalleAlumno(
            datosActualizados
        );

        mostrarDatosAlumno(alumnoActual);
        actualizarEstadoAcciones();

        // No reiniciar las estadísticas de asistencia:
        // siguen siendo válidas tras editar datos personales.

        bootstrap.Modal.getOrCreateInstance(
            document.getElementById("modal-editar-alumno")
        ).hide();

    } catch (error) {

        console.error("Error al editar alumno:", error);

        mostrarAlerta(
            "alerta-editar-alumno",
            error.message ||
            "No se pudo actualizar el alumno.",
            "danger"
        );

    } finally {

        guardandoEdicionAlumno = false;

        if (botonGuardar) {
            botonGuardar.disabled = false;
            botonGuardar.textContent = "Guardar";
        }
    }
}


// ==============================
// VALIDAR EDICIÓN
// ==============================

function validarEdicionAlumno(datos) {

    if (
        !datos.nombre ||
        !datos.apellido ||
        !datos.fecha_nacimiento
    ) {
        return "Nombre, apellido y fecha de nacimiento son obligatorios.";
    }

    if (
        datos.correo &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo)
    ) {
        return "El correo electrónico no es válido.";
    }

    // El teléfono es opcional, pero debe tener
    // un formato válido si se completa.
    if (datos.telefono) {

        if (!/^[0-9+\s()-]+$/.test(datos.telefono)) {
            return "El teléfono solo puede contener números y separadores válidos.";
        }

        const digitosTelefono = datos.telefono.replace(/\D/g, "");

        if (
            digitosTelefono.length < 8 ||
            digitosTelefono.length > 15
        ) {
            return "El teléfono debe contener entre 8 y 15 dígitos.";
        }
    }

    return null;
}


// ==============================
// DESACTIVAR ALUMNO
// ==============================

async function desactivarAlumno() {

    if (
        !alumnoActual ||
        alumnoActual.estado === "Inactivo" ||
        desactivandoAlumno
    ) {
        return;
    }

    const nombreCompleto =
        `${alumnoActual.nombre} ${alumnoActual.apellido}`;

    const confirmar = window.confirm(
        `¿Desea desactivar a ${nombreCompleto}?`
    );

    if (!confirmar) {
        return;
    }

    const boton = document.getElementById(
        "btn-desactivar"
    );

    desactivandoAlumno = true;

    if (boton) {
        boton.disabled = true;
    }

    try {

        await inauApi(
            `/alumnos/${alumnoActual.id}`,
            {
                method: "DELETE"
            }
        );

        // Recuperar el estado actualizado desde MySQL.
        const datos = await inauApi(
            `/alumnos/${alumnoActual.id}`
        );

        alumnoActual = normalizarDetalleAlumno(datos);

        mostrarDatosAlumno(alumnoActual);
        actualizarEstadoAcciones();

    } catch (error) {

        console.error("Error al desactivar alumno:", error);

        mostrarErrorDetalle(
            error.message ||
            "No se pudo desactivar el alumno."
        );

        try {
            await cargarDetalleAlumno(alumnoActual.id);
        } catch (recargaError) {
            console.error(
                "Error al recuperar el alumno:",
                recargaError
            );
        }

    } finally {

        desactivandoAlumno = false;
        actualizarEstadoAcciones();
    }
}


// ==============================
// ERRORES
// ==============================

function mostrarErrorDetalle(mensaje) {

    mostrarAlerta(
        "alerta-detalle-alumno",
        mensaje,
        "danger"
    );
}
