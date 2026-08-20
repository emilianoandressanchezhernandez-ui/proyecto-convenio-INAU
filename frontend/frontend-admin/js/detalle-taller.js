/*
    DETALLE-TALLER.JS - FRONTEND ADMIN
    Responsabilidades:
    - Mostrar los datos generales del taller seleccionado.
    - Calcular sus estadisticas (alumnos, asistencia promedio, clases registradas).
    - Listar los alumnos inscriptos.
    - Permitir editar sus datos y finalizarlo.
*/

let tallerActual = null;

function inicializarDetalleTaller() {
    try {
        validarDatosSimulados();

        const id = obtenerParametroURL("id");
        tallerActual = buscarTallerPorId(id);

        mostrarDatosTaller(tallerActual);
        mostrarEstadisticasTaller(tallerActual);
        renderizarAlumnosInscriptos(tallerActual);
        configurarAcciones();

    } catch (error) {
        console.error("Error al cargar el detalle del taller:", error);
        mostrarAlerta("alerta-detalle-taller", error.message, "danger");
    }
}


// ==============================
// VALIDACION Y BUSQUEDA
// ==============================

function validarDatosSimulados() {

    if (!window.DATOS_SIMULADOS) {
        throw new Error("No se pudieron cargar los datos simulados.");
    }

    if (!Array.isArray(window.DATOS_SIMULADOS.talleres)) {
        throw new Error("La lista de talleres no está disponible.");
    }
}

function buscarTallerPorId(id) {

    if (!id) {
        throw new Error("No se especificó qué taller mostrar.");
    }

    const talleres = obtenerListado(
        "talleres",
        window.DATOS_SIMULADOS.talleres
    );

    const taller = talleres.find(
        (t) => t.id === Number(id)
    );

    if (!taller) {
        throw new Error("No se encontró ningún taller con ese id.");
    }

    return taller;
}


// ==============================
// DATOS GENERALES
// ==============================

function mostrarDatosTaller(taller) {

    colocarTexto("nombre-taller", taller.nombre);
    colocarTexto("taller-nombre", taller.nombre);
    colocarTexto("taller-estado", taller.estado);
    colocarTexto("tallerista", obtenerNombreTallerista(taller.talleristaId));
    colocarTexto("horario", formatearHorarios(taller.horarios));
    colocarTexto("fecha-inicio", formatearFecha(taller.fechaInicio));
    colocarTexto("fecha-fin", formatearFecha(taller.fechaFin));

    const contenedorObservaciones = document.getElementById("observaciones");

    if (contenedorObservaciones) {
        contenedorObservaciones.textContent = taller.observaciones
            ? taller.observaciones
            : "No hay observaciones registradas.";
    }
}

function obtenerNombreTallerista(talleristaId) {

    const talleristas = obtenerListado(
        "talleristas",
        window.DATOS_SIMULADOS.talleristas
    );

    const tallerista = talleristas.find(
        (t) => t.id === talleristaId
    );

    return tallerista
        ? `${tallerista.nombre} ${tallerista.apellido}`
        : "Sin asignar";
}


// ==============================
// ESTADISTICAS
// ==============================

function mostrarEstadisticasTaller(taller) {

    const alumnosInscriptos = obtenerAlumnosInscriptos(taller.id);
    const clasesRegistradas = obtenerClasesDeAsistencia(taller.id);
    const asistenciaPromedio = calcularAsistenciaPromedioTaller(clasesRegistradas);

    colocarTexto("cantidad-alumnos", alumnosInscriptos.length);
    colocarTexto("asistencia-promedio", `${asistenciaPromedio}%`);
    colocarTexto("total-clases", clasesRegistradas.length);
}

function obtenerAlumnosInscriptos(tallerId) {

    const inscripciones = window.DATOS_SIMULADOS.inscripciones;

    const inscripcion = inscripciones.find(
        (i) => i.tallerId === tallerId
    );

    return inscripcion ? inscripcion.alumnoIds : [];
}

function obtenerClasesDeAsistencia(tallerId) {

    return window.DATOS_SIMULADOS.asistencias.filter(
        (clase) => clase.tallerId === tallerId
    );
}

function calcularAsistenciaPromedioTaller(clases) {

    if (clases.length === 0) {
        return 0;
    }

    let totalRegistros = 0;
    let totalPresentes = 0;

    clases.forEach((clase) => {
        clase.registros.forEach((registro) => {
            totalRegistros++;
            if (registro.estado === "Presente") {
                totalPresentes++;
            }
        });
    });

    if (totalRegistros === 0) {
        return 0;
    }

    return Math.round((totalPresentes / totalRegistros) * 100);
}


// ==============================
// TABLA DE ALUMNOS INSCRIPTOS
// ==============================

function renderizarAlumnosInscriptos(taller) {

    const tabla = document.getElementById("tabla-alumnos");

    if (!tabla) {
        return;
    }

    const idsAlumnos = obtenerAlumnosInscriptos(taller.id);

    const alumnos = obtenerListado(
        "alumnos",
        window.DATOS_SIMULADOS.alumnos
    ).filter((alumno) => idsAlumnos.includes(alumno.id));

    if (alumnos.length === 0) {
        tabla.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted py-4">
                    Este taller no tiene alumnos inscriptos.
                </td>
            </tr>
        `;
    } else {
        tabla.innerHTML = alumnos.map((alumno) => `
            <tr>
                <td>${escaparHTML(alumno.nombre)} ${escaparHTML(alumno.apellido)}</td>
                <td>${escaparHTML(alumno.cedula)}</td>
                <td>${escaparHTML(alumno.telefono)}</td>
                <td>${escaparHTML(alumno.estado)}</td>
                <td>
                    <a href="detalle-alumno.html?id=${alumno.id}" class="btn btn-sm btn-outline-primary">
                        Ver
                    </a>
                    <button type="button" class="btn btn-sm btn-outline-danger"
                        onclick="quitarAlumnoDelTaller(${alumno.id})">
                        Quitar
                    </button>
                </td>
            </tr>
        `).join("");
    }

    cargarSelectorDeAlumnosDisponibles(taller.id, idsAlumnos);
}

// Llena el selector de "agregar alumno" solo con los alumnos que
// TODAVIA NO estan inscriptos en este taller (evita duplicados).
function cargarSelectorDeAlumnosDisponibles(tallerId, idsYaInscriptos) {

    const select = document.getElementById("select-agregar-alumno");

    if (!select) {
        return;
    }

    const todosLosAlumnos = obtenerListado(
        "alumnos",
        window.DATOS_SIMULADOS.alumnos
    );

    const disponibles = todosLosAlumnos.filter(
        (a) => !idsYaInscriptos.includes(a.id) && a.estado === "Activo"
    );

    if (disponibles.length === 0) {
        select.innerHTML = `<option value="">No hay alumnos disponibles para agregar</option>`;
        return;
    }

    const opciones = disponibles
        .map((a) => `<option value="${a.id}">${escaparHTML(a.nombre)} ${escaparHTML(a.apellido)}</option>`)
        .join("");

    select.innerHTML = `<option value="">Seleccionar alumno...</option>${opciones}`;
}


// ==============================
// ACCIONES: EDITAR Y FINALIZAR
// ==============================

function configurarAcciones() {

    const botonEditar = document.getElementById("btn-editar");
    const botonAgregarHorario = document.getElementById("btn-agregar-horario-editar");
    const botonGuardarEdicion = document.getElementById("btn-guardar-editar-taller");
    const botonFinalizar = document.getElementById("btn-finalizar");
    const botonAgregarAlumno = document.getElementById("btn-agregar-alumno");

    if (botonEditar) {
        botonEditar.addEventListener("click", abrirModalEditarTaller);
    }

    if (botonAgregarHorario) {
        botonAgregarHorario.addEventListener("click", () => {
            agregarFilaHorario("editar-taller-horarios");
        });
    }

    if (botonGuardarEdicion) {
        botonGuardarEdicion.addEventListener("click", guardarEdicionTaller);
    }

    if (botonFinalizar) {
        botonFinalizar.addEventListener("click", finalizarTaller);
    }

    if (botonAgregarAlumno) {
        botonAgregarAlumno.addEventListener("click", agregarAlumnoAlTaller);
    }
}


// EDITAR

function abrirModalEditarTaller() {

    document.getElementById("editar-taller-nombre").value = tallerActual.nombre;
    document.getElementById("editar-taller-descripcion").value = tallerActual.descripcion;
    document.getElementById("editar-taller-centro").value = tallerActual.ubicacion.centro;
    document.getElementById("editar-taller-direccion").value = tallerActual.ubicacion.direccion;
    document.getElementById("editar-taller-salon").value = tallerActual.ubicacion.salon;
    document.getElementById("editar-taller-fecha-inicio").value = tallerActual.fechaInicio;
    document.getElementById("editar-taller-fecha-fin").value = tallerActual.fechaFin;
    document.getElementById("editar-taller-observaciones").value = tallerActual.observaciones || "";

    cargarSelectorDeTalleristas("editar-taller-tallerista");
    document.getElementById("editar-taller-tallerista").value = tallerActual.talleristaId;

    limpiarHorarios("editar-taller-horarios");
    tallerActual.horarios.forEach((horario) => {
        agregarFilaHorario("editar-taller-horarios", horario);
    });

    ocultarAlerta("alerta-editar-taller");

    const modal = bootstrap.Modal.getOrCreateInstance(
        document.getElementById("modal-editar-taller")
    );
    modal.show();
}

function guardarEdicionTaller() {

    const datosEditados = {
        nombre: document.getElementById("editar-taller-nombre").value.trim(),
        descripcion: document.getElementById("editar-taller-descripcion").value.trim(),
        talleristaId: document.getElementById("editar-taller-tallerista").value,
        centro: document.getElementById("editar-taller-centro").value.trim(),
        direccion: document.getElementById("editar-taller-direccion").value.trim(),
        salon: document.getElementById("editar-taller-salon").value.trim(),
        fechaInicio: document.getElementById("editar-taller-fecha-inicio").value,
        fechaFin: document.getElementById("editar-taller-fecha-fin").value,
        observaciones: document.getElementById("editar-taller-observaciones").value.trim(),
        horarios: leerHorariosDesdeFormulario("editar-taller-horarios")
    };

    const error = validarEdicionTaller(datosEditados);

    if (error) {
        mostrarAlerta("alerta-editar-taller", error, "danger");
        return;
    }

    const tallerActualizado = {
        ...tallerActual,
        nombre: datosEditados.nombre,
        descripcion: datosEditados.descripcion,
        talleristaId: Number(datosEditados.talleristaId),
        ubicacion: {
            centro: datosEditados.centro,
            direccion: datosEditados.direccion,
            salon: datosEditados.salon
        },
        fechaInicio: datosEditados.fechaInicio,
        fechaFin: datosEditados.fechaFin,
        observaciones: datosEditados.observaciones,
        horarios: datosEditados.horarios
    };

    actualizarTallerEnListado(tallerActualizado);

    tallerActual = tallerActualizado;
    mostrarDatosTaller(tallerActual);

    const modal = bootstrap.Modal.getOrCreateInstance(
        document.getElementById("modal-editar-taller")
    );
    modal.hide();
}

function validarEdicionTaller(datos) {

    const camposObligatorios = [
        datos.nombre, datos.descripcion, datos.talleristaId,
        datos.centro, datos.direccion, datos.salon,
        datos.fechaInicio, datos.fechaFin
    ];

    if (camposObligatorios.some((campo) => !campo)) {
        return "Todos los campos son obligatorios, excepto observaciones.";
    }

    if (datos.horarios.length === 0) {
        return "El taller debe tener al menos un horario completo.";
    }

    if (datos.fechaFin < datos.fechaInicio) {
        return "La fecha de finalización no puede ser anterior a la fecha de inicio.";
    }

    return null;
}


// FINALIZAR

function finalizarTaller() {

    if (tallerActual.estado === "Finalizado") {
        return;
    }

    const confirmar = confirm(`¿Desea finalizar el taller "${tallerActual.nombre}"?`);

    if (!confirmar) {
        return;
    }

    const tallerActualizado = {
        ...tallerActual,
        estado: "Finalizado"
    };

    actualizarTallerEnListado(tallerActualizado);

    tallerActual = tallerActualizado;
    mostrarDatosTaller(tallerActual);
}


// ACTUALIZACION COMPARTIDA

function actualizarTallerEnListado(tallerActualizado) {

    const listaCompleta = obtenerListado(
        "talleres",
        window.DATOS_SIMULADOS.talleres
    );

    const listaActualizada = listaCompleta.map(
        (t) => t.id === tallerActualizado.id ? tallerActualizado : t
    );

    guardarDato("talleres", listaActualizada);
}


// ==============================
// ASIGNAR / QUITAR ALUMNOS DEL TALLER
// ==============================

function agregarAlumnoAlTaller() {

    const select = document.getElementById("select-agregar-alumno");
    const alumnoId = Number(select.value);

    ocultarAlerta("alerta-asignar-alumno");

    if (!alumnoId) {
        mostrarAlerta("alerta-asignar-alumno", "Seleccioná un alumno para agregar.", "danger");
        return;
    }

    const inscripciones = obtenerListado(
        "inscripciones",
        window.DATOS_SIMULADOS.inscripciones
    );

    const inscripcion = inscripciones.find(
        (i) => i.tallerId === tallerActual.id
    );

    if (!inscripcion) {
        mostrarAlerta("alerta-asignar-alumno", "No se encontró la inscripción de este taller.", "danger");
        return;
    }

    if (inscripcion.alumnoIds.includes(alumnoId)) {
        mostrarAlerta("alerta-asignar-alumno", "Ese alumno ya está inscripto en este taller.", "danger");
        return;
    }

    inscripcion.alumnoIds.push(alumnoId);
    guardarDato("inscripciones", inscripciones);

    // Se refresca todo lo que depende de la cantidad de alumnos:
    // la tabla, las estadisticas del taller, y el propio selector.
    renderizarAlumnosInscriptos(tallerActual);
    mostrarEstadisticasTaller(tallerActual);
}

// Se llama desde el boton "Quitar" de cada fila de la tabla
// (ver renderizarAlumnosInscriptos).
function quitarAlumnoDelTaller(alumnoId) {

    const alumnos = obtenerListado("alumnos", window.DATOS_SIMULADOS.alumnos);
    const alumno = alumnos.find((a) => a.id === alumnoId);

    const confirmar = confirm(
        `¿Desea quitar a ${alumno.nombre} ${alumno.apellido} de este taller?`
    );

    if (!confirmar) {
        return;
    }

    const inscripciones = obtenerListado(
        "inscripciones",
        window.DATOS_SIMULADOS.inscripciones
    );

    const inscripcion = inscripciones.find(
        (i) => i.tallerId === tallerActual.id
    );

    if (!inscripcion) {
        return;
    }

    inscripcion.alumnoIds = inscripcion.alumnoIds.filter(
        (id) => id !== alumnoId
    );

    guardarDato("inscripciones", inscripciones);

    renderizarAlumnosInscriptos(tallerActual);
    mostrarEstadisticasTaller(tallerActual);
}