
"use strict";

/*
    ASISTENCIAS.JS - FRONTEND ADMIN

    Integración con API PHP + MySQL.

    - Consultar jornadas reales de todos los talleres.
    - Mostrar registros individuales por alumno.
    - Obtener nombres de alumnos y talleristas.
    - Filtrar por taller y fecha.
    - Calcular estadísticas del filtro.
    - Corregir registros mediante la API.
    - Respetar las restricciones del backend.
*/

let registrosAsistencias = [];
let registrosActuales = [];

let talleresAsistencias = [];
let alumnosAsistencias = [];
let talleristasPorTaller = new Map();

let correccionActual = null;
let cargandoAsistencias = false;
let guardandoCorreccion = false;
let eventosAsistenciasConfigurados = false;
let errorCargaAsistencias = false;

// ======================================================
// INICIALIZACIÓN
// ======================================================

async function inicializarAsistencias() {
    configurarFiltro();
    configurarCorreccion();

    await cargarAsistenciasReales();
}

async function cargarAsistenciasReales() {
    if (cargandoAsistencias) {
        return;
    }

    cargandoAsistencias = true;
    errorCargaAsistencias = false;

    const tabla = document.getElementById(
        "tabla-asistencias"
    );

    const botonFiltro = document.getElementById(
        "btn-filtrar"
    );

    if (botonFiltro) {
        botonFiltro.disabled = true;
    }

    if (tabla) {
        tabla.innerHTML = `
            <tr>
                <td colspan="6"
                    class="text-center text-muted py-5">
                    Cargando asistencias...
                </td>
            </tr>
        `;
    }

    try {
        const respuestas = await Promise.all([
            inauApi("/talleres"),
            inauApi("/alumnos")
        ]);

        const talleres = respuestas[0];
        const alumnos = respuestas[1];

        if (
            !Array.isArray(talleres) ||
            !Array.isArray(alumnos)
        ) {
            throw new Error(
                "La API devolvió datos con un formato inesperado."
            );
        }

        talleresAsistencias = talleres;
        alumnosAsistencias = alumnos;
        talleristasPorTaller = new Map();

        cargarSelectorTalleresAsistencias();

        // Consultar jornadas y talleristas de cada taller.
        const resultadosTalleres = await Promise.allSettled(
            talleresAsistencias.map(async taller => {
                const id = Number(taller.id);

                const resultados = await Promise.allSettled([
                    inauApi(`/talleres/${id}/asistencias`),

                    taller.estado === "Finalizado"
                        ? Promise.resolve([])
                        : inauApi(`/talleres/${id}/talleristas`)
                ]);

                const jornadas = resultados[0].status === "fulfilled"
                    ? resultados[0].value
                    : null;

                const talleristas = resultados[1].status === "fulfilled"
                    ? resultados[1].value
                    : null;

                if (!Array.isArray(jornadas)) {
                    errorCargaAsistencias = true;

                    console.warn(
                        "No se pudieron obtener jornadas del taller:",
                        id,
                        resultados[0]
                    );
                }

                if (!Array.isArray(talleristas)) {
                    errorCargaAsistencias = true;

                    console.warn(
                        "No se pudieron obtener talleristas del taller:",
                        id,
                        resultados[1]
                    );
                }

                talleristasPorTaller.set(
                    id,
                    Array.isArray(talleristas)
                        ? talleristas
                        : []
                );

                return {
                    tallerId: id,
                    jornadas: Array.isArray(jornadas)
                        ? jornadas
                        : []
                };
            })
        );

        const jornadas = [];

        resultadosTalleres.forEach(resultado => {
            if (resultado.status !== "fulfilled") {
                errorCargaAsistencias = true;
                console.warn(
                    "Error al cargar un taller:",
                    resultado.reason
                );
                return;
            }

            resultado.value.jornadas.forEach(jornada => {
                jornadas.push({
                    ...jornada,
                    tallerId: resultado.value.tallerId
                });
            });
        });

        // Cada jornada puede tener varios registros.
        const resultadosJornadas = await Promise.allSettled(
            jornadas.map(jornada =>
                inauApi(`/asistencias/${jornada.id}`)
            )
        );

        const registros = [];

        resultadosJornadas.forEach((resultado, indice) => {
            if (resultado.status !== "fulfilled") {
                errorCargaAsistencias = true;

                console.warn(
                    "Error al cargar jornada:",
                    jornadas[indice].id,
                    resultado.reason
                );

                return;
            }

            const detalle = resultado.value;
            const jornada = jornadas[indice];

            const lista = Array.isArray(detalle?.registros)
                ? detalle.registros
                : Array.isArray(detalle?.asistencias)
                    ? detalle.asistencias
                    : null;

            if (!lista) {
                errorCargaAsistencias = true;

                console.warn(
                    "La jornada no devolvió registros válidos:",
                    jornada.id,
                    detalle
                );

                return;
            }

            lista.forEach(registro => {
                const alumnoId = Number(
                    registro.alumno_id ??
                    registro.alumnoId
                );

                if (!Number.isInteger(alumnoId) || alumnoId <= 0) {
                    errorCargaAsistencias = true;
                    console.warn(
                        "Registro sin alumno válido:",
                        registro
                    );
                    return;
                }

                registros.push({
                    claseId: Number(jornada.id),
                    tallerId: Number(
                        detalle.taller_id ??
                        jornada.tallerId
                    ),
                    fecha: String(
                        detalle.fecha ??
                        jornada.fecha ??
                        ""
                    ).slice(0, 10),
                    alumnoId,
                    estado: String(
                        registro.estado ??
                        registro.estado_asistencia ??
                        ""
                    ),
                    observaciones:
                        registro.observaciones ?? ""
                });
            });
        });

        registrosAsistencias = registros;

        aplicarFiltro();
        mostrarAvisoCargaAsistencias();

    } catch (error) {
        console.error(
            "Error general al cargar asistencias:",
            error
        );

        registrosAsistencias = [];
        registrosActuales = [];

        if (tabla) {
            tabla.innerHTML = `
                <tr>
                    <td colspan="6"
                        class="text-center text-danger py-5">
                        ${escaparHTML(error.message)}
                    </td>
                </tr>
            `;
        }

        mostrarEstadisticasAsistencias([]);

    } finally {
        cargandoAsistencias = false;

        if (botonFiltro) {
            botonFiltro.disabled = false;
        }
    }
}

// ======================================================
// MENSAJE DE CARGA PARCIAL
// ======================================================

function mostrarAvisoCargaAsistencias() {
    let aviso = document.getElementById(
        "aviso-carga-asistencias"
    );

    if (!aviso) {
        const tabla = document.getElementById(
            "tabla-asistencias"
        );

        const tarjeta = tabla?.closest(".card");

        if (!tarjeta) {
            return;
        }

        aviso = document.createElement("div");
        aviso.id = "aviso-carga-asistencias";
        aviso.className = "alert alert-warning mb-3";

        tarjeta.querySelector(".card-body")
            ?.prepend(aviso);
    }

    aviso.textContent = errorCargaAsistencias
        ? "Algunos datos no pudieron consultarse. El listado y las estadísticas pueden estar incompletos."
        : "";

    aviso.classList.toggle(
        "d-none",
        !errorCargaAsistencias
    );
}

// ======================================================
// SELECTOR DE TALLERES
// ======================================================

function cargarSelectorTalleresAsistencias() {
    const selector = document.getElementById(
        "filtro-taller"
    );

    if (!selector) {
        return;
    }

    const parametro = new URLSearchParams(
        window.location.search
    ).get("tallerId");

    const seleccionAnterior =
        parametro || selector.value;

    selector.innerHTML = `
        <option value="">Todos los talleres</option>

        ${talleresAsistencias.map(taller => `
            <option value="${Number(taller.id)}">
                ${escaparHTML(taller.nombre || "Sin nombre")}
            </option>
        `).join("")}
    `;

    if (
        seleccionAnterior &&
        talleresAsistencias.some(
            t => Number(t.id) === Number(seleccionAnterior)
        )
    ) {
        selector.value = String(seleccionAnterior);
    }
}

// ======================================================
// NOMBRES
// ======================================================

function obtenerNombreAlumnoAsistencia(alumnoId) {
    const alumno = alumnosAsistencias.find(
        a => Number(a.id) === Number(alumnoId)
    );

    return alumno
        ? `${alumno.nombre} ${alumno.apellido}`
        : `Alumno ID ${alumnoId}`;
}

function obtenerNombreTallerAsistencia(tallerId) {
    const taller = talleresAsistencias.find(
        t => Number(t.id) === Number(tallerId)
    );

    return taller
        ? taller.nombre
        : `Taller ID ${tallerId}`;
}

function obtenerNombreTalleristasAsistencia(tallerId) {
    const talleristas = talleristasPorTaller.get(
        Number(tallerId)
    );

    if (!Array.isArray(talleristas) || !talleristas.length) {
        return "Sin asignar";
    }

    return talleristas.map(t =>
        `${t.nombre} ${t.apellido}`
    ).join(", ");
}

// ======================================================
// TABLA
// ======================================================

function renderizarTablaAsistencias(registros) {
    const tabla = document.getElementById(
        "tabla-asistencias"
    );

    if (!tabla) {
        return;
    }

    if (!registros.length) {
        tabla.innerHTML = `
            <tr>
                <td colspan="6"
                    class="text-center text-muted py-5">
                    No se encontraron registros de asistencia.
                </td>
            </tr>
        `;
        return;
    }

    const ordenados = [...registros].sort(
        (a, b) => b.fecha.localeCompare(a.fecha)
    );

    tabla.innerHTML = ordenados.map(registro => {
        const taller = talleresAsistencias.find(
            t => Number(t.id) === registro.tallerId
        );

        const puedeCorregir =
            taller?.estado === "Activo";

        return `
            <tr>
                <td>
                    ${escaparHTML(
            formatearFechaAsistencia(registro.fecha)
        )}
                </td>

                <td>
                    ${escaparHTML(
            obtenerNombreAlumnoAsistencia(
                registro.alumnoId
            )
        )}
                </td>

                <td>
                    ${escaparHTML(
            obtenerNombreTallerAsistencia(
                registro.tallerId
            )
        )}
                </td>

                <td>
                    ${escaparHTML(registro.estado)}
                </td>

                <td>
                    ${escaparHTML(
            obtenerNombreTalleristasAsistencia(
                registro.tallerId
            )
        )}
                </td>

                <td>
                    <button
                        type="button"
                        class="btn btn-sm btn-outline-primary btn-corregir-asistencia"
                        data-clase-id="${registro.claseId}"
                        data-alumno-id="${registro.alumnoId}"
                        ${puedeCorregir ? "" : "disabled"}
                        title="${puedeCorregir
                ? "Corregir asistencia"
                : "No se pueden modificar asistencias de talleres finalizados"}">
                        Corregir
                    </button>
                </td>
            </tr>
        `;
    }).join("");

    tabla.querySelectorAll(".btn-corregir-asistencia")
        .forEach(boton => {
            boton.addEventListener("click", () => {
                abrirModalCorregir(
                    Number(boton.dataset.claseId),
                    Number(boton.dataset.alumnoId)
                );
            });
        });
}

function formatearFechaAsistencia(fecha) {
    const partes = String(fecha || "")
        .slice(0, 10)
        .split("-");

    if (partes.length !== 3) {
        return fecha || "—";
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

// ======================================================
// ESTADÍSTICAS DEL FILTRO ACTUAL
// ======================================================

function mostrarEstadisticasAsistencias(registros) {
    const total = registros.length;

    const presentes = registros.filter(
        r => r.estado === "Presente"
    ).length;

    const ausentes = registros.filter(
        r => r.estado === "Ausente"
    ).length;

    const promedio = total === 0
        ? 0
        : Math.round((presentes / total) * 100);

    colocarTexto("stat-registros", total);
    colocarTexto("stat-presentes", presentes);
    colocarTexto("stat-ausentes", ausentes);
    colocarTexto("stat-promedio", `${promedio}%`);
}

// ======================================================
// FILTROS
// ======================================================

function configurarFiltro() {
    if (eventosAsistenciasConfigurados) {
        return;
    }

    eventosAsistenciasConfigurados = true;

    document.getElementById("btn-filtrar")
        ?.addEventListener(
            "click",
            aplicarFiltro
        );
}

function aplicarFiltro() {
    const tallerId = document.getElementById(
        "filtro-taller"
    )?.value || "";

    const fecha = document.getElementById(
        "filtro-fecha"
    )?.value || "";

    let filtrados = [...registrosAsistencias];

    if (tallerId) {
        filtrados = filtrados.filter(
            r => r.tallerId === Number(tallerId)
        );
    }

    if (fecha) {
        filtrados = filtrados.filter(
            r => r.fecha === fecha
        );
    }

    registrosActuales = filtrados;

    renderizarTablaAsistencias(registrosActuales);
    mostrarEstadisticasAsistencias(registrosActuales);
}

// ======================================================
// CORREGIR ASISTENCIA
// ======================================================

function configurarCorreccion() {
    const boton = document.getElementById(
        "btn-guardar-correccion"
    );

    if (boton && !boton.dataset.eventoConfigurado) {
        boton.dataset.eventoConfigurado = "1";

        boton.addEventListener(
            "click",
            guardarCorreccion
        );
    }
}

function abrirModalCorregir(claseId, alumnoId) {
    const registro = registrosActuales.find(
        r =>
            r.claseId === Number(claseId) &&
            r.alumnoId === Number(alumnoId)
    );

    if (!registro) {
        return;
    }

    const taller = talleresAsistencias.find(
        t => Number(t.id) === registro.tallerId
    );

    if (!taller || taller.estado !== "Activo") {
        return;
    }

    correccionActual = {
        claseId: registro.claseId,
        alumnoId: registro.alumnoId,
        tallerId: registro.tallerId,
        observaciones: registro.observaciones
    };

    colocarTexto(
        "corregir-alumno",
        obtenerNombreAlumnoAsistencia(alumnoId)
    );

    colocarTexto(
        "corregir-taller",
        obtenerNombreTallerAsistencia(registro.tallerId)
    );

    colocarTexto(
        "corregir-fecha",
        formatearFechaAsistencia(registro.fecha)
    );

    const selectorEstado = document.getElementById(
        "corregir-estado"
    );

    if (selectorEstado) {
        selectorEstado.value = registro.estado;
    }

    ocultarAlerta("alerta-corregir-asistencia");

    const modal = bootstrap.Modal.getOrCreateInstance(
        document.getElementById("modal-corregir-asistencia")
    );

    modal.show();
}

async function guardarCorreccion() {
    if (
        !correccionActual ||
        guardandoCorreccion
    ) {
        return;
    }

    const estado = document.getElementById(
        "corregir-estado"
    )?.value;

    const estadosValidos = [
        "Presente",
        "Ausente",
        "Justificado",
        "Tardanza"
    ];

    if (!estadosValidos.includes(estado)) {
        mostrarAlerta(
            "alerta-corregir-asistencia",
            "Seleccioná un estado válido.",
            "danger"
        );
        return;
    }

    const boton = document.getElementById(
        "btn-guardar-correccion"
    );

    guardandoCorreccion = true;

    if (boton) {
        boton.disabled = true;
    }

    try {
        const datos = {
            alumno_id: correccionActual.alumnoId,
            estado,
            observaciones:
                correccionActual.observaciones || ""
        };

        const respuesta = await fetch(
            `http://localhost:8002/asistencias/${correccionActual.claseId}/registros`,
            {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(datos)
            }
        );

        const texto = await respuesta.text();

        let resultado;

        try {
            resultado = texto
                ? JSON.parse(texto)
                : {};
        } catch {
            throw new Error(
                "El servidor no devolvió JSON válido."
            );
        }

        if (!respuesta.ok || resultado.ok === false) {
            let mensaje = resultado.mensaje ||
                "No se pudo corregir la asistencia.";

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
            document.getElementById(
                "modal-corregir-asistencia"
            )
        );

        modal.hide();

        correccionActual = null;

        // Recargar datos reales, no localStorage.
        await cargarAsistenciasReales();

    } catch (error) {
        console.error(
            "Error al corregir asistencia:",
            error
        );

        mostrarAlerta(
            "alerta-corregir-asistencia",
            error.message,
            "danger"
        );

    } finally {
        guardandoCorreccion = false;

        if (boton) {
            boton.disabled = false;
        }
    }
}
