
"use strict";

/*
    TALLERES.JS - FRONTEND ADMIN
    Integración con API PHP + MySQL.

    - Lista talleres reales.
    - Obtiene horarios, talleristas y alumnos reales.
    - Busca por nombre.
    - Calcula estadísticas.
    - Crea talleres completos mediante POST /talleres.
*/

let talleresActuales = [];
let guardandoNuevoTaller = false;
let eventosTalleresConfigurados = false;

// ======================================================
// INICIALIZACIÓN
// ======================================================

async function inicializarTalleres() {
    configurarBuscador();
    configurarAltaTaller();

    await cargarTalleresDesdeAPI();
}

async function cargarTalleresDesdeAPI() {
    const tabla = document.getElementById("tabla-talleres");

    if (tabla) {
        tabla.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-4">
                    Cargando talleres...
                </td>
            </tr>
        `;
    }

    try {
        // Obtener el listado general.
        const talleres = await inauApi("/talleres");

        if (!Array.isArray(talleres)) {
            throw new Error("La API no devolvió una lista de talleres.");
        }

        // Obtener los datos relacionados de cada taller.
        const resultados = await Promise.all(
            talleres.map(async (taller) => {
                const id = Number(taller.id);

                const respuestas = await Promise.allSettled([
                    inauApi(`/talleres/${id}`),
                    inauApi(`/talleres/${id}/talleristas`),
                    inauApi(`/talleres/${id}/alumnos`)
                ]);

                const detalle = respuestas[0].status === "fulfilled"
                    ? respuestas[0].value
                    : null;

                const talleristas = respuestas[1].status === "fulfilled"
                    ? respuestas[1].value
                    : null;

                const alumnos = respuestas[2].status === "fulfilled"
                    ? respuestas[2].value
                    : null;

                // Registrar errores sin sustituirlos por estadísticas falsas.
                respuestas.forEach((respuesta, indice) => {
                    if (respuesta.status === "rejected") {
                        const recurso = [
                            "detalle",
                            "talleristas",
                            "alumnos"
                        ][indice];

                        console.warn(
                            `No se pudo cargar ${recurso} del taller ${id}:`,
                            respuesta.reason
                        );
                    }
                });

                return {
                    ...taller,
                    horarios: Array.isArray(detalle?.horarios)
                        ? detalle.horarios
                        : [],

                    horariosDisponibles: Boolean(
                        detalle && Array.isArray(detalle.horarios)
                    ),

                    talleristas: Array.isArray(talleristas)
                        ? talleristas
                        : [],

                    talleristasDisponibles: Array.isArray(talleristas),

                    alumnos: Array.isArray(alumnos)
                        ? alumnos
                        : [],

                    alumnosDisponibles: Array.isArray(alumnos)
                };
            })
        );

        talleresActuales = resultados;

        aplicarBusquedaTalleres();
        mostrarEstadisticasTalleres(talleresActuales);

    } catch (error) {
        console.error("Error al cargar talleres:", error);

        if (tabla) {
            tabla.innerHTML = `
                <tr>
                    <td colspan="6"
                        class="text-center text-danger py-4">
                        No se pudieron cargar los talleres.
                    </td>
                </tr>
            `;
        }

        colocarTexto("stat-total", "--");
        colocarTexto("stat-activos", "--");
        colocarTexto("stat-finalizados", "--");
        colocarTexto("stat-alumnos-totales", "--");
    }
}

// ======================================================
// TABLA
// ======================================================

function renderizarTablaTalleres(talleres) {
    const tabla = document.getElementById("tabla-talleres");

    if (!tabla) {
        return;
    }

    if (talleres.length === 0) {
        tabla.innerHTML = `
            <tr>
                <td colspan="6"
                    class="text-center text-muted py-5">
                    No se encontraron talleres.
                </td>
            </tr>
        `;
        return;
    }

    tabla.innerHTML = talleres.map((taller) => {
        const nombreTalleristas = taller.talleristasDisponibles
            ? (
                taller.talleristas.length
                    ? taller.talleristas.map(t =>
                        `${t.nombre} ${t.apellido}`
                    ).join(", ")
                    : "Sin asignar"
            )
            : "No disponible";

        const cantidadAlumnos = taller.alumnosDisponibles
            ? taller.alumnos.length
            : "—";

        const horarios = taller.horariosDisponibles
            ? formatearHorariosAPI(taller.horarios)
            : "No disponible";

        const id = Number(taller.id);

        return `
            <tr>
                <td>${escaparHTML(taller.nombre || "")}</td>

                <td>${escaparHTML(nombreTalleristas)}</td>

                <td>${cantidadAlumnos}</td>

                <td>${escaparHTML(horarios)}</td>

                <td>${escaparHTML(taller.estado || "")}</td>

                <td>
                    <a
                        href="detalle-taller.html?id=${id}"
                        class="btn btn-sm btn-outline-primary"
                    >
                        Ver
                    </a>
                </td>
            </tr>
        `;
    }).join("");
}

function formatearHorariosAPI(horarios) {
    if (!Array.isArray(horarios) || horarios.length === 0) {
        return "Sin horarios";
    }

    return horarios.map(horario => {
        const inicio = String(horario.hora_inicio || "")
            .slice(0, 5);

        const fin = String(horario.hora_fin || "")
            .slice(0, 5);

        return `${horario.dia}: ${inicio} - ${fin}`;
    }).join(" / ");
}

// ======================================================
// ESTADÍSTICAS
// ======================================================

function mostrarEstadisticasTalleres(talleres) {
    const total = talleres.length;

    const activos = talleres.filter(
        taller => taller.estado === "Activo"
    ).length;

    const finalizados = talleres.filter(
        taller => taller.estado === "Finalizado"
    ).length;

    const datosAlumnosCompletos = talleres.every(
        taller => taller.alumnosDisponibles
    );

    const inscripcionesTotales = datosAlumnosCompletos
        ? talleres.reduce(
            (suma, taller) => suma + taller.alumnos.length,
            0
        )
        : "—";

    colocarTexto("stat-total", total);
    colocarTexto("stat-activos", activos);
    colocarTexto("stat-finalizados", finalizados);
    colocarTexto("stat-alumnos-totales", inscripcionesTotales);
}

// ======================================================
// BUSCADOR
// ======================================================

function configurarBuscador() {
    const input = document.getElementById("buscar-taller");

    if (!input || input.dataset.configurado === "si") {
        return;
    }

    input.dataset.configurado = "si";

    input.addEventListener("input", aplicarBusquedaTalleres);
}

function aplicarBusquedaTalleres() {
    const texto = document.getElementById("buscar-taller")?.value || "";

    filtrarTalleres(texto);
}

function filtrarTalleres(textoBusqueda) {
    const texto = normalizarTexto(textoBusqueda);

    if (!texto) {
        renderizarTablaTalleres(talleresActuales);
        return;
    }

    const filtrados = talleresActuales.filter(taller =>
        normalizarTexto(taller.nombre || "").includes(texto)
    );

    renderizarTablaTalleres(filtrados);
}

// ======================================================
// ALTA DE TALLER
// ======================================================

function configurarAltaTaller() {
    if (eventosTalleresConfigurados) {
        return;
    }

    eventosTalleresConfigurados = true;

    const botonAbrir =
        document.getElementById("btn-nuevo-taller");

    const botonHorario =
        document.getElementById("btn-agregar-horario-nuevo");

    const botonGuardar =
        document.getElementById("btn-guardar-nuevo-taller");

    botonAbrir?.addEventListener(
        "click",
        abrirModalNuevoTaller
    );

    botonHorario?.addEventListener("click", () => {
        agregarFilaHorario("nuevo-taller-horarios");
    });

    botonGuardar?.addEventListener(
        "click",
        guardarNuevoTaller
    );
}

async function abrirModalNuevoTaller() {
    const formulario =
        document.getElementById("form-nuevo-taller");

    formulario.reset();

    ocultarAlerta("alerta-nuevo-taller");

    limpiarHorarios("nuevo-taller-horarios");
    agregarFilaHorario("nuevo-taller-horarios");

    const selector =
        document.getElementById("nuevo-taller-tallerista");

    selector.innerHTML = `
        <option value="">Cargando talleristas...</option>
    `;

    const modal = bootstrap.Modal.getOrCreateInstance(
        document.getElementById("modal-nuevo-taller")
    );

    modal.show();

    try {
        const talleristas = await inauApi("/talleristas");

        if (!Array.isArray(talleristas)) {
            throw new Error("No se pudo obtener la lista.");
        }

        const activos = talleristas.filter(
            tallerista => tallerista.estado === "Activo"
        );

        selector.innerHTML = `
            <option value="">Seleccionar...</option>
            ${activos.map(tallerista => `
                <option value="${Number(tallerista.id)}">
                    ${escaparHTML(
            `${tallerista.nombre} ${tallerista.apellido}`
        )}
                </option>
            `).join("")}
        `;

        if (activos.length === 0) {
            mostrarAlerta(
                "alerta-nuevo-taller",
                "No hay talleristas activos disponibles.",
                "danger"
            );
        }

    } catch (error) {
        console.error("Error al cargar talleristas:", error);

        selector.innerHTML = `
            <option value="">No se pudieron cargar</option>
        `;

        mostrarAlerta(
            "alerta-nuevo-taller",
            "No se pudieron cargar los talleristas.",
            "danger"
        );
    }
}

function normalizarHorarioParaAPI(horario) {
    // Aceptar los nombres que pueden usar las utilidades del
    // frontend y convertirlos al formato del backend.

    const dia = horario.dia ?? horario.diaSemana ?? "";

    const inicio = horario.hora_inicio
        ?? horario.horaInicio
        ?? horario.inicio
        ?? "";

    const fin = horario.hora_fin
        ?? horario.horaFin
        ?? horario.fin
        ?? "";

    const horaInicio = String(inicio).trim().slice(0, 5);
    const horaFin = String(fin).trim().slice(0, 5);

    return {
        dia: String(dia).trim(),
        hora_inicio: horaInicio,
        hora_fin: horaFin
    };
}

function validarNuevoTaller(datos) {
    const obligatorios = [
        datos.nombre,
        datos.descripcion,
        datos.tallerista_id,
        datos.centro,
        datos.direccion,
        datos.salon,
        datos.fecha_inicio,
        datos.fecha_fin
    ];

    if (obligatorios.some(valor => !valor)) {
        return "Todos los campos del formulario son obligatorios.";
    }

    if (!Array.isArray(datos.horarios) ||
        datos.horarios.length === 0) {
        return "Agregá al menos un horario.";
    }

    const diasValidos = [
        "Lunes",
        "Martes",
        "Miércoles",
        "Jueves",
        "Viernes",
        "Sábado",
        "Domingo"
    ];

    for (const horario of datos.horarios) {
        if (!diasValidos.includes(horario.dia)) {
            return "Seleccioná un día válido para cada horario.";
        }

        if (
            !/^\d{2}:\d{2}$/.test(horario.hora_inicio) ||
            !/^\d{2}:\d{2}$/.test(horario.hora_fin)
        ) {
            return "Completá las horas de inicio y fin.";
        }

        if (horario.hora_fin <= horario.hora_inicio) {
            return "La hora de fin debe ser posterior al inicio.";
        }
    }

    if (datos.fecha_fin < datos.fecha_inicio) {
        return "La fecha de finalización no puede ser anterior al inicio.";
    }

    return null;
}

async function guardarNuevoTaller() {
    if (guardandoNuevoTaller) {
        return;
    }

    const valor = id =>
        document.getElementById(id)?.value.trim() || "";

    const horariosOriginales =
        leerHorariosDesdeFormulario("nuevo-taller-horarios");

    if (!Array.isArray(horariosOriginales)) {
        mostrarAlerta(
            "alerta-nuevo-taller",
            "No se pudieron leer los horarios.",
            "danger"
        );
        return;
    }

    const datos = {
        nombre: valor("nuevo-taller-nombre"),
        descripcion: valor("nuevo-taller-descripcion"),
        centro: valor("nuevo-taller-centro"),
        direccion: valor("nuevo-taller-direccion"),
        salon: valor("nuevo-taller-salon"),
        fecha_inicio: valor("nuevo-taller-fecha-inicio"),
        fecha_fin: valor("nuevo-taller-fecha-fin"),
        estado: "Activo",
        tallerista_id: Number(valor("nuevo-taller-tallerista")) || null,
        horarios: horariosOriginales.map(normalizarHorarioParaAPI)
    };

    const error = validarNuevoTaller(datos);

    if (error) {
        mostrarAlerta("alerta-nuevo-taller", error, "danger");
        return;
    }

    const boton =
        document.getElementById("btn-guardar-nuevo-taller");

    guardandoNuevoTaller = true;
    boton.disabled = true;
    boton.textContent = "Guardando...";

    ocultarAlerta("alerta-nuevo-taller");

    try {
        // Petición con la cookie de sesión del administrador.
        const respuesta = await fetch(
            "http://localhost:8002/talleres",
            {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(datos)
            }
        );

        const resultado = await respuesta.json();

        if (!respuesta.ok || resultado.ok === false) {
            let mensaje = resultado.mensaje ||
                "No se pudo crear el taller.";

            if (resultado.errores) {
                const detalles = Array.isArray(resultado.errores)
                    ? resultado.errores
                    : Object.values(resultado.errores);

                if (detalles.length) {
                    mensaje += " " + detalles.join(" ");
                }
            }

            throw new Error(mensaje);
        }

        const modal = bootstrap.Modal.getOrCreateInstance(
            document.getElementById("modal-nuevo-taller")
        );

        modal.hide();

        await cargarTalleresDesdeAPI();

        console.log(
            "Taller creado correctamente:",
            resultado.datos
        );

    } catch (error) {
        console.error("Error al crear taller:", error);

        mostrarAlerta(
            "alerta-nuevo-taller",
            error.message,
            "danger"
        );
    } finally {
        guardandoNuevoTaller = false;
        boton.disabled = false;
        boton.textContent = "Guardar";
    }
}
