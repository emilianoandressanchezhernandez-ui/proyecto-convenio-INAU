
/*
 * DETALLE-TALLERISTA.JS - FRONTEND ADMIN
 *
 * - Datos reales desde MySQL.
 * - Talleres, horarios y alumnos inscritos.
 * - Asistencia promedio.
 * - Edición mediante PATCH.
 * - Baja lógica mediante DELETE.
 */

"use strict";

let talleristaActual = null;
let guardandoEdicionTallerista = false;
let desactivandoTallerista = false;
let accionesTalleristaConfiguradas = false;


// ==============================
// INICIALIZACIÓN
// ==============================

async function inicializarDetalleTallerista() {

    configurarAcciones();

    const id = obtenerParametroURL("id");

    if (!id || !/^[1-9]\d*$/.test(String(id))) {
        mostrarErrorDetalleTallerista(
            "El ID del tallerista no es válido."
        );
        deshabilitarAccionesTallerista();
        return;
    }

    try {
        await cargarDetalleTallerista(Number(id));
    } catch (error) {
        console.error(
            "Error al cargar el detalle del tallerista:",
            error
        );

        mostrarErrorDetalleTallerista(error.message);
        deshabilitarAccionesTallerista();
    }
}


// ==============================
// CONSULTAR DATOS REALES
// ==============================

// Usamos GET /talleristas, que ya comprobamos.
// Buscamos el ID correspondiente dentro de la lista.

async function cargarDetalleTallerista(id) {

    colocarTexto(
        "nombre-tallerista",
        "Cargando tallerista..."
    );

    const talleristas = await inauApi("/talleristas");

    if (!Array.isArray(talleristas)) {
        throw new Error(
            "La API no devolvió una lista válida de talleristas."
        );
    }

    const datos = talleristas.find(
        tallerista => Number(tallerista.id) === Number(id)
    );

    if (!datos) {
        throw new Error(
            "No se encontró el tallerista solicitado."
        );
    }

    talleristaActual = normalizarDetalleTallerista(datos);

    mostrarDatosTallerista(talleristaActual);

    colocarTexto("cantidad-talleres", "—");
    colocarTexto("alumnos", "—");
    colocarTexto("asistencia-promedio", "—");

    actualizarEstadoAccionesTallerista();

    await cargarTalleresYEstadisticasTallerista(
        talleristaActual.id
    );
}


// ==============================
// NORMALIZAR DATOS
// ==============================

function normalizarDetalleTallerista(datos) {

    return {
        id: Number(datos.id),

        nombre: datos.nombre ?? "",
        apellido: datos.apellido ?? "",

        cedula: datos.cedula ?? "",
        correo: datos.correo ?? "",
        telefono: datos.telefono ?? "",

        especialidad: datos.especialidad ?? "",

        estado: datos.estado ?? "Activo",

        fechaRegistro: datos.fecha_registro ?? "",
        ultimoAcceso: datos.ultimo_acceso ?? null
    };
}


// ==============================
// MOSTRAR INFORMACIÓN PERSONAL
// ==============================

function mostrarDatosTallerista(tallerista) {

    const nombreCompleto = [
        tallerista.nombre,
        tallerista.apellido
    ].filter(Boolean).join(" ");

    colocarTexto(
        "nombre-tallerista",
        nombreCompleto
    );

    colocarTexto(
        "nombre-completo",
        nombreCompleto
    );

    colocarTexto(
        "estado-tallerista",
        tallerista.estado
    );

    colocarTexto(
        "cedula",
        tallerista.cedula || "—"
    );

    colocarTexto(
        "correo",
        tallerista.correo || "—"
    );

    colocarTexto(
        "telefono",
        tallerista.telefono || "—"
    );

    colocarTexto(
        "especialidad",
        tallerista.especialidad || "—"
    );

    colocarTexto(
        "fecha-registro",
        tallerista.fechaRegistro
            ? formatearFecha(tallerista.fechaRegistro)
            : "—"
    );

    colocarTexto(
        "ultimo-acceso",
        tallerista.ultimoAcceso
            ? formatearFechaHora(tallerista.ultimoAcceso)
            : "Sin accesos"
    );
}


// ==============================
// TALLERES Y ESTADÍSTICAS
// ==============================

async function cargarTalleresYEstadisticasTallerista(talleristaId) {

    const tabla = document.getElementById(
        "tabla-talleres"
    );

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

        // 1. Consultar talleres existentes.
        const talleres = await inauApi("/talleres");

        if (!Array.isArray(talleres)) {
            throw new Error(
                "No se obtuvo una lista válida de talleres."
            );
        }

        // 2. Identificar los talleres asignados.
        const asignaciones = await Promise.all(

            talleres.map(async taller => {

                const talleristas = await inauApi(
                    `/talleres/${taller.id}/talleristas`
                );

                if (!Array.isArray(talleristas)) {
                    throw new Error(
                        `Error al consultar asignaciones del taller ${taller.id}.`
                    );
                }

                const asignado = talleristas.some(
                    registro =>
                        Number(registro.tallerista_id) ===
                        Number(talleristaId)
                );

                return {
                    taller,
                    asignado
                };
            })

        );

        const talleresAsignados = asignaciones
            .filter(resultado => resultado.asignado)
            .map(resultado => resultado.taller);

        // 3. Consultar detalle, horarios e inscripciones.
        const talleresCompletos = await Promise.all(

            talleresAsignados.map(async taller => {

                const [detalle, inscripciones] =
                    await Promise.all([
                        inauApi(`/talleres/${taller.id}`),
                        inauApi(
                            `/talleres/${taller.id}/alumnos`
                        )
                    ]);

                if (
                    !detalle ||
                    Number(detalle.id) !== Number(taller.id) ||
                    !Array.isArray(detalle.horarios) ||
                    !Array.isArray(inscripciones)
                ) {
                    throw new Error(
                        `Información incompleta del taller ${taller.id}.`
                    );
                }

                return {
                    ...detalle,
                    inscripciones
                };
            })

        );

        // 4. Mostrar tabla.
        renderizarTalleresAsignados(
            talleresCompletos
        );

        colocarTexto(
            "cantidad-talleres",
            talleresCompletos.length
        );

        // 5. Contar alumnos únicos.
        const alumnosUnicos = new Set();

        talleresCompletos.forEach(taller => {

            taller.inscripciones.forEach(inscripcion => {

                const alumnoId = Number(
                    inscripcion.alumno_id
                );

                if (
                    Number.isInteger(alumnoId) &&
                    alumnoId > 0
                ) {
                    alumnosUnicos.add(alumnoId);
                }

            });

        });

        colocarTexto(
            "alumnos",
            alumnosUnicos.size
        );

        // 6. Calcular asistencia.
        // Un error aquí no borra los talleres cargados.
        await cargarAsistenciaPromedioTallerista(
            talleresCompletos
        );

    } catch (error) {

        console.error(
            "Error al consultar talleres del tallerista:",
            error
        );

        colocarTexto("cantidad-talleres", "—");
        colocarTexto("alumnos", "—");
        colocarTexto("asistencia-promedio", "—");

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

        mostrarErrorDetalleTallerista(
            error.message ||
            "No se pudieron cargar los talleres."
        );
    }
}


// ==============================
// MOSTRAR TALLERES ASIGNADOS
// ==============================

function renderizarTalleresAsignados(talleres) {

    const tabla = document.getElementById(
        "tabla-talleres"
    );

    if (!tabla) return;

    if (!talleres.length) {

        tabla.innerHTML = `
            <tr>
                <td colspan="4"
                    class="text-center text-muted py-4">
                    Este tallerista no tiene talleres asignados.
                </td>
            </tr>
        `;

        return;
    }

    tabla.innerHTML = talleres.map(taller => {

        const horarios = formatearHorariosTallerista(
            taller.horarios
        );

        const alumnos = new Set(
            taller.inscripciones.map(
                inscripcion => Number(inscripcion.alumno_id)
            )
        ).size;

        return `
            <tr>
                <td>
                    ${escaparHTML(taller.nombre || "—")}
                </td>

                <td>
                    ${escaparHTML(horarios)}
                </td>

                <td>
                    ${alumnos}
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

function formatearHorariosTallerista(horarios) {

    if (
        !Array.isArray(horarios) ||
        horarios.length === 0
    ) {
        return "Sin horarios registrados";
    }

    return horarios.map(horario => {

        const dia =
            horario.dia || "Día sin especificar";

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
// ASISTENCIA PROMEDIO REAL
// ==============================

async function cargarAsistenciaPromedioTallerista(talleres) {

    colocarTexto("asistencia-promedio", "—");

    try {

        // 1. Consultar jornadas de los talleres asignados.
        const jornadasPorTaller = await Promise.all(

            talleres.map(async taller => {

                const jornadas = await inauApi(
                    `/talleres/${taller.id}/asistencias`
                );

                if (!Array.isArray(jornadas)) {
                    throw new Error(
                        `No se obtuvieron las jornadas del taller ${taller.id}.`
                    );
                }

                return jornadas;
            })

        );

        const jornadas = jornadasPorTaller.flat();

        // 2. Consultar registros individuales.
        const detalles = await Promise.all(

            jornadas.map(async jornada => {

                const detalle = await inauApi(
                    `/asistencias/${jornada.id}`
                );

                if (
                    !detalle ||
                    !Array.isArray(detalle.registros)
                ) {
                    throw new Error(
                        `No se obtuvieron los registros de asistencia ${jornada.id}.`
                    );
                }

                return detalle;
            })

        );

        const registros = detalles.flatMap(
            detalle => detalle.registros
        );

        // Sin registros no hay porcentaje calculable.
        if (registros.length === 0) {

            colocarTexto(
                "asistencia-promedio",
                "Sin datos"
            );

            return;
        }

        // 3. Calcular porcentaje sobre registros individuales.
        const presentes = registros.filter(
            registro => registro.estado === "Presente"
        ).length;

        const porcentaje = Math.round(
            (presentes / registros.length) * 100
        );

        colocarTexto(
            "asistencia-promedio",
            `${porcentaje}%`
        );

    } catch (error) {

        console.error(
            "Error al consultar asistencias del tallerista:",
            error
        );

        colocarTexto("asistencia-promedio", "—");

        mostrarErrorDetalleTallerista(
            "Se cargaron los talleres, pero no se pudo calcular la asistencia."
        );
    }
}


// ==============================
// CONFIGURAR ACCIONES
// ==============================

function configurarAcciones() {

    if (accionesTalleristaConfiguradas) {
        return;
    }

    accionesTalleristaConfiguradas = true;

    document.getElementById(
        "btn-editar"
    )?.addEventListener(
        "click",
        abrirModalEditarTallerista
    );

    document.getElementById(
        "btn-guardar-editar-tallerista"
    )?.addEventListener(
        "click",
        guardarEdicionTallerista
    );

    document.getElementById(
        "btn-desactivar"
    )?.addEventListener(
        "click",
        desactivarTallerista
    );
}


function deshabilitarAccionesTallerista() {

    const editar = document.getElementById(
        "btn-editar"
    );

    const desactivar = document.getElementById(
        "btn-desactivar"
    );

    if (editar) editar.disabled = true;
    if (desactivar) desactivar.disabled = true;
}


function actualizarEstadoAccionesTallerista() {

    const editar = document.getElementById(
        "btn-editar"
    );

    const desactivar = document.getElementById(
        "btn-desactivar"
    );

    if (editar) {
        editar.disabled = !talleristaActual;
    }

    if (desactivar) {
        desactivar.disabled =
            !talleristaActual ||
            talleristaActual.estado === "Inactivo" ||
            desactivandoTallerista;
    }
}


// ==============================
// ABRIR MODAL DE EDICIÓN
// ==============================

function abrirModalEditarTallerista() {

    if (!talleristaActual) return;

    const valores = {

        "editar-tallerista-nombre":
            talleristaActual.nombre,

        "editar-tallerista-apellido":
            talleristaActual.apellido,

        "editar-tallerista-cedula":
            talleristaActual.cedula,

        "editar-tallerista-correo":
            talleristaActual.correo,

        "editar-tallerista-telefono":
            talleristaActual.telefono,

        "editar-tallerista-especialidad":
            talleristaActual.especialidad
    };

    Object.entries(valores).forEach(
        ([id, valor]) => {

            const campo = document.getElementById(id);

            if (campo) {
                campo.value = valor ?? "";
            }
        }
    );

    // La cédula no se envía en el PATCH.
    const cedula = document.getElementById(
        "editar-tallerista-cedula"
    );

    if (cedula) {
        cedula.readOnly = true;
    }

    ocultarAlerta("alerta-editar-tallerista");

    bootstrap.Modal.getOrCreateInstance(
        document.getElementById(
            "modal-editar-tallerista"
        )
    ).show();
}


// ==============================
// GUARDAR EDICIÓN
// ==============================

async function guardarEdicionTallerista() {

    if (
        !talleristaActual ||
        guardandoEdicionTallerista
    ) {
        return;
    }

    const datos = {

        nombre: document.getElementById(
            "editar-tallerista-nombre"
        ).value.trim(),

        apellido: document.getElementById(
            "editar-tallerista-apellido"
        ).value.trim(),

        correo: document.getElementById(
            "editar-tallerista-correo"
        ).value.trim(),

        telefono: document.getElementById(
            "editar-tallerista-telefono"
        ).value.trim() || null,

        especialidad: document.getElementById(
            "editar-tallerista-especialidad"
        ).value.trim() || null
    };

    const errorValidacion =
        validarEdicionTallerista(datos);

    if (errorValidacion) {

        mostrarAlerta(
            "alerta-editar-tallerista",
            errorValidacion,
            "danger"
        );

        return;
    }

    const boton = document.getElementById(
        "btn-guardar-editar-tallerista"
    );

    guardandoEdicionTallerista = true;

    if (boton) {
        boton.disabled = true;
        boton.textContent = "Guardando...";
    }

    try {

        // PATCH /talleristas/{id}
        await inauApi(
            `/talleristas/${talleristaActual.id}`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(datos)
            }
        );

        // Verificar leyendo nuevamente desde MySQL.
        const lista = await inauApi("/talleristas");

        if (!Array.isArray(lista)) {
            throw new Error(
                "No se pudo verificar la actualización."
            );
        }

        const actualizado = lista.find(
            tallerista =>
                Number(tallerista.id) === talleristaActual.id
        );

        if (!actualizado) {
            throw new Error(
                "No se encontró el tallerista después de actualizar."
            );
        }

        talleristaActual = normalizarDetalleTallerista(
            actualizado
        );

        mostrarDatosTallerista(talleristaActual);
        actualizarEstadoAccionesTallerista();

        bootstrap.Modal.getOrCreateInstance(
            document.getElementById(
                "modal-editar-tallerista"
            )
        ).hide();

    } catch (error) {

        console.error(
            "Error al editar tallerista:",
            error
        );

        mostrarAlerta(
            "alerta-editar-tallerista",
            error.message ||
            "No se pudo actualizar el tallerista.",
            "danger"
        );

    } finally {

        guardandoEdicionTallerista = false;

        if (boton) {
            boton.disabled = false;
            boton.textContent = "Guardar";
        }
    }
}


// ==============================
// VALIDACIÓN DE EDICIÓN
// ==============================

function validarEdicionTallerista(datos) {

    if (
        !datos.nombre ||
        !datos.apellido ||
        !datos.correo
    ) {
        return (
            "Nombre, apellido y correo son obligatorios."
        );
    }

    if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo)
    ) {
        return "El correo electrónico no es válido.";
    }

    return null;
}


// ==============================
// DESACTIVAR TALLERISTA
// ==============================

async function desactivarTallerista() {

    if (
        !talleristaActual ||
        talleristaActual.estado === "Inactivo" ||
        desactivandoTallerista
    ) {
        return;
    }

    const nombre =
        `${talleristaActual.nombre} ${talleristaActual.apellido}`;

    const confirmar = window.confirm(
        `¿Desea desactivar a ${nombre}?`
    );

    if (!confirmar) {
        return;
    }

    const boton = document.getElementById(
        "btn-desactivar"
    );

    desactivandoTallerista = true;

    if (boton) {
        boton.disabled = true;
    }

    try {

        // DELETE /talleristas/{id}
        await inauApi(
            `/talleristas/${talleristaActual.id}`,
            {
                method: "DELETE"
            }
        );

        // Comprobar el nuevo estado en MySQL.
        const lista = await inauApi("/talleristas");

        if (!Array.isArray(lista)) {
            throw new Error(
                "No se pudo verificar la baja."
            );
        }

        const actualizado = lista.find(
            tallerista =>
                Number(tallerista.id) === talleristaActual.id
        );

        if (!actualizado) {
            throw new Error(
                "El tallerista ya no aparece en el listado. Revisar MySQL."
            );
        }

        talleristaActual = normalizarDetalleTallerista(
            actualizado
        );

        mostrarDatosTallerista(talleristaActual);

        if (talleristaActual.estado !== "Inactivo") {
            throw new Error(
                "La API respondió, pero el tallerista sigue activo."
            );
        }

    } catch (error) {

        console.error(
            "Error al desactivar tallerista:",
            error
        );

        mostrarErrorDetalleTallerista(
            error.message ||
            "No se pudo desactivar el tallerista."
        );

    } finally {

        desactivandoTallerista = false;

        actualizarEstadoAccionesTallerista();
    }
}


// ==============================
// ERRORES
// ==============================

function mostrarErrorDetalleTallerista(mensaje) {

    mostrarAlerta(
        "alerta-detalle-tallerista",
        mensaje,
        "danger"
    );
}
