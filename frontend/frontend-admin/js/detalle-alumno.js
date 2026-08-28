/*
    DETALLE-ALUMNO.JS - FRONTEND ADMIN
    Responsabilidades:
    - Mostrar los datos personales del alumno seleccionado.
    - Mostrar sus observaciones.
    - Calcular sus estadisticas (talleres, asistencias, % asistencia).
    - Listar sus talleres, con el tallerista de cada uno.
    - Permitir editar sus datos y darlo de baja logica.
*/

let alumnoActual = null;

function inicializarDetalleAlumno() {
    try {
        validarDatosSimulados();

        const id = obtenerParametroURL("id");
        alumnoActual = buscarAlumnoPorId(id);

        mostrarDatosAlumno(alumnoActual);
        mostrarEstadisticasAlumno(alumnoActual);
        renderizarTalleresDelAlumno(alumnoActual);
        configurarAcciones();

    } catch (error) {
        console.error("Error al cargar el detalle del alumno:", error);
        mostrarAlerta("alerta-detalle-alumno", error.message, "danger");
    }
}


// ==============================
// VALIDACION Y BUSQUEDA
// ==============================

function validarDatosSimulados() {

    if (!window.DATOS_SIMULADOS) {
        throw new Error("No se pudieron cargar los datos simulados.");
    }

    if (!Array.isArray(window.DATOS_SIMULADOS.alumnos)) {
        throw new Error("La lista de alumnos no está disponible.");
    }
}

function buscarAlumnoPorId(id) {

    if (!id) {
        throw new Error("No se especificó qué alumno mostrar.");
    }

    const alumnos = obtenerListado(
        "alumnos",
        window.DATOS_SIMULADOS.alumnos
    );

    const alumno = alumnos.find(
        (a) => a.id === Number(id)
    );

    if (!alumno) {
        throw new Error("No se encontró ningún alumno con ese id.");
    }

    return alumno;
}


// ==============================
// DATOS PERSONALES Y OBSERVACIONES
// ==============================

function mostrarDatosAlumno(alumno) {

    const nombreCompleto = `${alumno.nombre} ${alumno.apellido}`;

    colocarTexto("nombre-alumno", nombreCompleto);
    colocarTexto("alumno-nombre-completo", nombreCompleto);
    colocarTexto("estado-alumno", alumno.estado);
    colocarTexto("cedula", alumno.cedula);
    colocarTexto("fecha-nacimiento", formatearFecha(alumno.fechaNacimiento));
    colocarTexto("telefono", alumno.telefono);
    colocarTexto("correo", alumno.correo);
    colocarTexto("fecha-registro", formatearFecha(alumno.fechaRegistro));
    colocarTexto("ultima-asistencia", formatearFecha(alumno.ultimaAsistencia));

    const contenedorObservaciones = document.getElementById("observaciones");

    if (contenedorObservaciones) {
        contenedorObservaciones.textContent = alumno.observaciones
            ? alumno.observaciones
            : "No hay observaciones registradas.";
    }
}


// ==============================
// ESTADISTICAS
// ==============================

function mostrarEstadisticasAlumno(alumno) {

    const idsTalleres = obtenerIdsTalleresDelAlumno(alumno.id);
    const registros = obtenerRegistrosDeAsistencia(alumno.id);

    const cantidadTalleres = idsTalleres.length;
    const presentes = registros.filter((r) => r.estado === "Presente").length;
    const porcentaje = calcularPorcentajeAsistencia(registros);

    colocarTexto("cantidad-talleres", cantidadTalleres);
    colocarTexto("asistencias", presentes);
    colocarTexto("porcentaje-asistencia", `${porcentaje}%`);
}

function obtenerIdsTalleresDelAlumno(alumnoId) {

    const inscripciones = window.DATOS_SIMULADOS.inscripciones;

    return inscripciones
        .filter((inscripcion) => inscripcion.alumnoIds.includes(alumnoId))
        .map((inscripcion) => inscripcion.tallerId);
}

function obtenerRegistrosDeAsistencia(alumnoId) {

    const asistencias = window.DATOS_SIMULADOS.asistencias;
    const registros = [];

    asistencias.forEach((clase) => {
        const registro = clase.registros.find(
            (r) => r.alumnoId === alumnoId
        );

        if (registro) {
            registros.push(registro);
        }
    });

    return registros;
}

function calcularPorcentajeAsistencia(registros) {

    if (registros.length === 0) {
        return 0;
    }

    const presentes = registros.filter(
        (r) => r.estado === "Presente"
    ).length;

    return Math.round((presentes / registros.length) * 100);
}


// ==============================
// TABLA DE TALLERES DEL ALUMNO
// ==============================

function renderizarTalleresDelAlumno(alumno) {

    const tabla = document.getElementById("tabla-talleres");

    if (!tabla) {
        return;
    }

    const idsTalleres = obtenerIdsTalleresDelAlumno(alumno.id);

    const talleres = window.DATOS_SIMULADOS.talleres.filter(
        (taller) => idsTalleres.includes(taller.id)
    );

    if (talleres.length === 0) {
        tabla.innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-muted py-4">
                    Este alumno no está inscripto en ningún taller.
                </td>
            </tr>
        `;
        return;
    }

    tabla.innerHTML = talleres.map((taller) => `
        <tr>
            <td>${escaparHTML(taller.nombre)}</td>
            <td>${escaparHTML(obtenerNombreTallerista(taller.talleristaId))}</td>
            <td>${formatearHorarios(taller.horarios)}</td>
            <td>${escaparHTML(taller.estado)}</td>
        </tr>
    `).join("");
}

function obtenerNombreTallerista(talleristaId) {

    const talleristas = obtenerListado(
        "talleristas",
        window.DATOS_SIMULADOS.talleristas
    );

    const tallerista = talleristas.find(
        (t) => t.id === talleristaId
    );

    if (!tallerista) {
        return "Sin asignar";
    }

    return `${tallerista.nombre} ${tallerista.apellido}`;
}


// ==============================
// ACCIONES: EDITAR Y DESACTIVAR
// ==============================

function configurarAcciones() {

    const botonEditar = document.getElementById("btn-editar");
    const botonGuardarEdicion = document.getElementById("btn-guardar-editar-alumno");
    const botonDesactivar = document.getElementById("btn-desactivar");

    if (botonEditar) {
        botonEditar.addEventListener("click", abrirModalEditarAlumno);
    }

    if (botonGuardarEdicion) {
        botonGuardarEdicion.addEventListener("click", guardarEdicionAlumno);
    }

    if (botonDesactivar) {
        botonDesactivar.addEventListener("click", desactivarAlumno);
    }
}


// EDITAR

function abrirModalEditarAlumno() {

    document.getElementById("editar-alumno-nombre").value = alumnoActual.nombre;
    document.getElementById("editar-alumno-apellido").value = alumnoActual.apellido;
    document.getElementById("editar-alumno-cedula").value = alumnoActual.cedula;
    document.getElementById("editar-alumno-fecha-nacimiento").value = alumnoActual.fechaNacimiento;
    document.getElementById("editar-alumno-correo").value = alumnoActual.correo;
    document.getElementById("editar-alumno-telefono").value = alumnoActual.telefono;
    document.getElementById("editar-alumno-observaciones").value = alumnoActual.observaciones || "";

    ocultarAlerta("alerta-editar-alumno");

    const modal = bootstrap.Modal.getOrCreateInstance(
        document.getElementById("modal-editar-alumno")
    );
    modal.show();
}

function guardarEdicionAlumno() {

    const datosEditados = {
        nombre: document.getElementById("editar-alumno-nombre").value.trim(),
        apellido: document.getElementById("editar-alumno-apellido").value.trim(),
        cedula: document.getElementById("editar-alumno-cedula").value.trim(),
        fechaNacimiento: document.getElementById("editar-alumno-fecha-nacimiento").value,
        correo: document.getElementById("editar-alumno-correo").value.trim(),
        telefono: document.getElementById("editar-alumno-telefono").value.trim(),
        observaciones: document.getElementById("editar-alumno-observaciones").value.trim()
    };

    const error = validarEdicionAlumno(datosEditados);

    if (error) {
        mostrarAlerta("alerta-editar-alumno", error, "danger");
        return;
    }

    const alumnoActualizado = {
        ...alumnoActual,
        ...datosEditados
    };

    actualizarAlumnoEnListado(alumnoActualizado);

    alumnoActual = alumnoActualizado;
    mostrarDatosAlumno(alumnoActual);

    const modal = bootstrap.Modal.getOrCreateInstance(
        document.getElementById("modal-editar-alumno")
    );
    modal.hide();
}

function validarEdicionAlumno(datos) {

    // Observaciones queda afuera de la validacion de obligatorios:
    // es el unico campo opcional del formulario.

    const camposObligatorios = [
        datos.nombre, datos.apellido, datos.cedula,
        datos.fechaNacimiento, datos.correo, datos.telefono
    ];

    if (camposObligatorios.some((campo) => !campo)) {
        return "Todos los campos son obligatorios, excepto observaciones.";
    }

    const todosLosAlumnos = obtenerListado(
        "alumnos",
        window.DATOS_SIMULADOS.alumnos
    );

    const cedulaDuplicada = todosLosAlumnos.some(
        (a) => a.cedula === datos.cedula && a.id !== alumnoActual.id
    );

    if (cedulaDuplicada) {
        return "Ya existe otro alumno registrado con esa cédula.";
    }

    return null;
}


// DESACTIVAR (baja logica)

function desactivarAlumno() {

    if (alumnoActual.estado === "Inactivo") {
        return;
    }

    const nombreCompleto = `${alumnoActual.nombre} ${alumnoActual.apellido}`;
    const confirmar = confirm(`¿Desea desactivar a ${nombreCompleto}?`);

    if (!confirmar) {
        return;
    }

    const alumnoActualizado = {
        ...alumnoActual,
        estado: "Inactivo"
    };

    actualizarAlumnoEnListado(alumnoActualizado);

    alumnoActual = alumnoActualizado;
    mostrarDatosAlumno(alumnoActual);
}


// ACTUALIZACION COMPARTIDA

function actualizarAlumnoEnListado(alumnoActualizado) {

    const listaCompleta = obtenerListado(
        "alumnos",
        window.DATOS_SIMULADOS.alumnos
    );

    const listaActualizada = listaCompleta.map(
        (a) => a.id === alumnoActualizado.id ? alumnoActualizado : a
    );

    guardarDato("alumnos", listaActualizada);
}