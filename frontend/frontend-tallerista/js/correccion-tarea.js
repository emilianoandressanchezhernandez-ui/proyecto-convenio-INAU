/*
    CORRECCION-TAREA.JS - FRONTEND TALLERISTA
    Responsabilidades:
    - Mostrar los datos de la tarea seleccionada.
    - Listar las entregas de los alumnos para esa tarea.
    - Permitir corregir una entrega: asignar nota y comentario.
*/

let tareaActual = null;

function inicializarCorreccionTarea() {
    try {
        validarDatosSimulados();

        const id = obtenerParametroURL("id");
        tareaActual = buscarTareaPorId(id);

        mostrarDatosTarea(tareaActual);
        renderizarTablaEntregas(tareaActual);
        configurarCorreccion();

    } catch (error) {
        console.error("Error al cargar la corrección de tarea:", error);
        mostrarAlerta("alerta-correccion-tarea", error.message, "danger");
    }
}


// ==============================
// VALIDACION Y BUSQUEDA
// ==============================

function validarDatosSimulados() {

    if (!window.DATOS_SIMULADOS) {
        throw new Error("No se pudieron cargar los datos simulados.");
    }

    if (!Array.isArray(window.DATOS_SIMULADOS.contenidos)) {
        throw new Error("La lista de contenidos no está disponible.");
    }
}

function buscarTareaPorId(id) {

    if (!id) {
        throw new Error("No se especificó qué tarea corregir.");
    }

    const contenidos = obtenerListado(
        "contenidos",
        window.DATOS_SIMULADOS.contenidos
    );

    const tarea = contenidos.find(
        (c) => c.id === Number(id) && c.tipo === "Tarea"
    );

    if (!tarea) {
        throw new Error("No se encontró ninguna tarea con ese id.");
    }

    return tarea;
}


// ==============================
// DATOS DE LA TAREA
// ==============================

function mostrarDatosTarea(tarea) {

    colocarTexto("titulo-tarea", tarea.titulo);
    colocarTexto("descripcion-tarea", tarea.descripcion);
    colocarTexto("taller-tarea", obtenerNombreTaller(tarea.tallerId));
    colocarTexto("fecha-limite-tarea", formatearFecha(tarea.fechaLimite));

    const entregas = obtenerEntregasDeLaTarea(tarea.id);
    const corregidas = entregas.filter((e) => e.estado === "Corregida").length;

    colocarTexto("resumen-entregas", `${entregas.length} (${corregidas} corregidas)`);
}

function obtenerNombreTaller(tallerId) {

    const talleres = obtenerListado("talleres", window.DATOS_SIMULADOS.talleres);
    const taller = talleres.find((t) => t.id === tallerId);

    return taller ? taller.nombre : "Taller no encontrado";
}

function obtenerEntregasDeLaTarea(tareaId) {

    return obtenerListado("entregas", window.DATOS_SIMULADOS.entregas)
        .filter((e) => e.contenidoId === tareaId);
}


// ==============================
// TABLA DE ENTREGAS
// ==============================

function renderizarTablaEntregas(tarea) {

    const tabla = document.getElementById("tabla-entregas");

    if (!tabla) {
        return;
    }

    const entregas = obtenerEntregasDeLaTarea(tarea.id);

    if (entregas.length === 0) {
        tabla.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted py-5">
                    Ningún alumno tiene una entrega registrada todavía.
                </td>
            </tr>
        `;
        return;
    }

    tabla.innerHTML = entregas.map((entrega) => `
        <tr>
            <td>${escaparHTML(obtenerNombreAlumno(entrega.alumnoId))}</td>
            <td>${formatearFecha(entrega.fechaEntrega)}</td>
            <td>${entrega.archivoNombre ? escaparHTML(entrega.archivoNombre) : "-"}</td>
            <td>${escaparHTML(entrega.estado)}</td>
            <td>${entrega.nota ?? "-"}</td>
            <td>
                ${entrega.estado === "Pendiente"
            ? `<span class="text-muted">Sin entrega</span>`
            : `<button type="button" class="btn btn-sm btn-outline-primary"
                        onclick="abrirModalCorregir(${entrega.id})">
                        Corregir
                    </button>`
        }
            </td>
        </tr>
    `).join("");
}

function obtenerNombreAlumno(alumnoId) {

    const alumnos = obtenerListado("alumnos", window.DATOS_SIMULADOS.alumnos);
    const alumno = alumnos.find((a) => a.id === alumnoId);

    return alumno ? `${alumno.nombre} ${alumno.apellido}` : "Alumno no encontrado";
}


// ==============================
// CORREGIR ENTREGA
// ==============================

let entregaActual = null;

function configurarCorreccion() {

    const boton = document.getElementById("btn-guardar-correccion");

    if (boton) {
        boton.addEventListener("click", guardarCorreccion);
    }
}

function abrirModalCorregir(entregaId) {

    const entregas = obtenerListado("entregas", window.DATOS_SIMULADOS.entregas);
    entregaActual = entregas.find((e) => e.id === entregaId);

    if (!entregaActual) {
        return;
    }

    colocarTexto("corregir-alumno", obtenerNombreAlumno(entregaActual.alumnoId));
    colocarTexto("corregir-archivo", entregaActual.archivoNombre || "-");

    document.getElementById("corregir-nota").value = entregaActual.nota || "";
    document.getElementById("corregir-comentario").value = entregaActual.comentario || "";

    ocultarAlerta("alerta-corregir-entrega");

    const modal = bootstrap.Modal.getOrCreateInstance(
        document.getElementById("modal-corregir-entrega")
    );
    modal.show();
}

function guardarCorreccion() {

    const nota = Number(document.getElementById("corregir-nota").value);
    const comentario = document.getElementById("corregir-comentario").value.trim();

    if (!nota || nota < 1 || nota > 10) {
        mostrarAlerta("alerta-corregir-entrega", "La nota debe ser un número entre 1 y 10.", "danger");
        return;
    }

    const entregas = obtenerListado("entregas", window.DATOS_SIMULADOS.entregas);

    const entregasActualizadas = entregas.map((entrega) => {
        if (entrega.id !== entregaActual.id) {
            return entrega;
        }
        return { ...entrega, estado: "Corregida", nota, comentario };
    });

    guardarDato("entregas", entregasActualizadas);

    renderizarTablaEntregas(tareaActual);
    mostrarDatosTarea(tareaActual);

    const modal = bootstrap.Modal.getOrCreateInstance(
        document.getElementById("modal-corregir-entrega")
    );
    modal.hide();
}