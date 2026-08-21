/*
    DETALLE-TALLERISTA.JS - FRONTEND ADMIN
    Responsabilidades:
    - Mostrar los datos personales del tallerista seleccionado.
    - Calcular sus estadisticas (talleres, alumnos unicos, asistencia promedio).
    - Listar sus talleres asignados.
    - Permitir editar sus datos y darlo de baja logica.
*/

let talleristaActual = null;

function inicializarDetalleTallerista() {
    try {
        validarDatosSimulados();

        const id = obtenerParametroURL("id");
        talleristaActual = buscarTalleristaPorId(id);

        mostrarDatosTallerista(talleristaActual);
        mostrarEstadisticasTallerista(talleristaActual);
        renderizarTalleresAsignados(talleristaActual);
        configurarAcciones();

    } catch (error) {
        console.error("Error al cargar el detalle del tallerista:", error);
        mostrarAlerta("alerta-detalle-tallerista", error.message, "danger");
    }
}


// ==============================
// VALIDACION Y BUSQUEDA
// ==============================

function validarDatosSimulados() {

    if (!window.DATOS_SIMULADOS) {
        throw new Error("No se pudieron cargar los datos simulados.");
    }

    if (!Array.isArray(window.DATOS_SIMULADOS.talleristas)) {
        throw new Error("La lista de talleristas no está disponible.");
    }
}

function buscarTalleristaPorId(id) {

    if (!id) {
        throw new Error("No se especificó qué tallerista mostrar.");
    }

    const talleristas = obtenerListado(
        "talleristas",
        window.DATOS_SIMULADOS.talleristas
    );

    const tallerista = talleristas.find(
        (t) => t.id === Number(id)
    );

    if (!tallerista) {
        throw new Error("No se encontró ningún tallerista con ese id.");
    }

    return tallerista;
}


// ==============================
// DATOS PERSONALES
// ==============================

function mostrarDatosTallerista(tallerista) {

    const nombreCompleto = `${tallerista.nombre} ${tallerista.apellido}`;

    colocarTexto("nombre-tallerista", nombreCompleto);
    colocarTexto("nombre-completo", nombreCompleto);
    colocarTexto("estado-tallerista", tallerista.estado);
    colocarTexto("cedula", tallerista.cedula);
    colocarTexto("correo", tallerista.correo);
    colocarTexto("telefono", tallerista.telefono);
    colocarTexto("fecha-registro", formatearFecha(tallerista.fechaRegistro));
    colocarTexto("ultimo-acceso", formatearFechaHora(tallerista.ultimoAcceso));
}


// ==============================
// ESTADISTICAS
// ==============================

function mostrarEstadisticasTallerista(tallerista) {

    const talleresAsignados = obtenerTalleresDelTallerista(tallerista);

    const cantidadTalleres = talleresAsignados.length;
    const alumnosUnicos = contarAlumnosUnicos(talleresAsignados);
    const asistenciaPromedio = calcularAsistenciaPromedioTallerista(talleresAsignados);

    colocarTexto("cantidad-talleres", cantidadTalleres);
    colocarTexto("alumnos", alumnosUnicos);
    colocarTexto("asistencia-promedio", `${asistenciaPromedio}%`);
}

function obtenerTalleresDelTallerista(tallerista) {

    const todosLosTalleres = window.DATOS_SIMULADOS.talleres;
    const idsAsignados = tallerista.talleresAsignados || [];

    return todosLosTalleres.filter(
        (taller) => idsAsignados.includes(taller.id)
    );
}

function contarAlumnosUnicos(talleres) {

    const inscripciones = window.DATOS_SIMULADOS.inscripciones;
    const idsDeAlumnos = new Set();

    talleres.forEach((taller) => {
        const inscripcion = inscripciones.find(
            (i) => i.tallerId === taller.id
        );

        if (inscripcion) {
            inscripcion.alumnoIds.forEach(
                (alumnoId) => idsDeAlumnos.add(alumnoId)
            );
        }
    });

    return idsDeAlumnos.size;
}

function calcularAsistenciaPromedioTallerista(talleres) {

    const idsTalleres = talleres.map((t) => t.id);

    const asistenciasRelacionadas = window.DATOS_SIMULADOS.asistencias.filter(
        (clase) => idsTalleres.includes(clase.tallerId)
    );

    if (asistenciasRelacionadas.length === 0) {
        return 0;
    }

    let totalRegistros = 0;
    let totalPresentes = 0;

    asistenciasRelacionadas.forEach((clase) => {
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
// TABLA DE TALLERES ASIGNADOS
// ==============================

function renderizarTalleresAsignados(tallerista) {

    const tabla = document.getElementById("tabla-talleres");

    if (!tabla) {
        return;
    }

    const talleres = obtenerTalleresDelTallerista(tallerista);

    if (talleres.length === 0) {
        tabla.innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-muted py-4">
                    Este tallerista no tiene talleres asignados.
                </td>
            </tr>
        `;
        return;
    }

    tabla.innerHTML = talleres.map((taller) => `
        <tr>
            <td>${escaparHTML(taller.nombre)}</td>
            <td>${formatearHorarios(taller.horarios)}</td>
            <td>${taller.cantidadAlumnos}</td>
            <td>${escaparHTML(taller.estado)}</td>
        </tr>
    `).join("");
}


// ==============================
// ACCIONES: EDITAR Y DESACTIVAR
// ==============================

function configurarAcciones() {

    const botonEditar = document.getElementById("btn-editar");
    const botonGuardarEdicion = document.getElementById("btn-guardar-editar-tallerista");
    const botonDesactivar = document.getElementById("btn-desactivar");

    if (botonEditar) {
        botonEditar.addEventListener("click", abrirModalEditarTallerista);
    }

    if (botonGuardarEdicion) {
        botonGuardarEdicion.addEventListener("click", guardarEdicionTallerista);
    }

    if (botonDesactivar) {
        botonDesactivar.addEventListener("click", desactivarTallerista);
    }
}


// EDITAR

function abrirModalEditarTallerista() {

    document.getElementById("editar-tallerista-nombre").value = talleristaActual.nombre;
    document.getElementById("editar-tallerista-apellido").value = talleristaActual.apellido;
    document.getElementById("editar-tallerista-cedula").value = talleristaActual.cedula;
    document.getElementById("editar-tallerista-correo").value = talleristaActual.correo;
    document.getElementById("editar-tallerista-telefono").value = talleristaActual.telefono;
    document.getElementById("editar-tallerista-especialidad").value = talleristaActual.especialidad;

    ocultarAlerta("alerta-editar-tallerista");

    const modal = bootstrap.Modal.getOrCreateInstance(
        document.getElementById("modal-editar-tallerista")
    );
    modal.show();
}

function guardarEdicionTallerista() {

    const datosEditados = {
        nombre: document.getElementById("editar-tallerista-nombre").value.trim(),
        apellido: document.getElementById("editar-tallerista-apellido").value.trim(),
        cedula: document.getElementById("editar-tallerista-cedula").value.trim(),
        correo: document.getElementById("editar-tallerista-correo").value.trim(),
        telefono: document.getElementById("editar-tallerista-telefono").value.trim(),
        especialidad: document.getElementById("editar-tallerista-especialidad").value.trim()
    };

    const error = validarEdicionTallerista(datosEditados);

    if (error) {
        mostrarAlerta("alerta-editar-tallerista", error, "danger");
        return;
    }

    const talleristaActualizado = {
        ...talleristaActual,
        ...datosEditados
    };

    actualizarTalleristaEnListado(talleristaActualizado);

    talleristaActual = talleristaActualizado;
    mostrarDatosTallerista(talleristaActual);

    const modal = bootstrap.Modal.getOrCreateInstance(
        document.getElementById("modal-editar-tallerista")
    );
    modal.hide();
}

function validarEdicionTallerista(datos) {

    const campos = Object.values(datos);

    if (campos.some((campo) => !campo)) {
        return "Todos los campos son obligatorios.";
    }

    const todosLosTalleristas = obtenerListado(
        "talleristas",
        window.DATOS_SIMULADOS.talleristas
    );

    // Se excluye al propio tallerista de la comprobacion de cedula duplicada,
    // porque el esta editando sus propios datos, no dando de alta uno nuevo.

    const cedulaDuplicada = todosLosTalleristas.some(
        (t) => t.cedula === datos.cedula && t.id !== talleristaActual.id
    );

    if (cedulaDuplicada) {
        return "Ya existe otro tallerista registrado con esa cédula.";
    }

    return null;
}


// DESACTIVAR (baja logica)

function desactivarTallerista() {

    if (talleristaActual.estado === "Inactivo") {
        return;
    }

    const nombreCompleto = `${talleristaActual.nombre} ${talleristaActual.apellido}`;
    const confirmar = confirm(`¿Desea desactivar a ${nombreCompleto}?`);

    if (!confirmar) {
        return;
    }

    const talleristaActualizado = {
        ...talleristaActual,
        estado: "Inactivo"
    };

    actualizarTalleristaEnListado(talleristaActualizado);

    talleristaActual = talleristaActualizado;
    mostrarDatosTallerista(talleristaActual);
}


// ACTUALIZACION COMPARTIDA

function actualizarTalleristaEnListado(talleristaActualizado) {

    const listaCompleta = obtenerListado(
        "talleristas",
        window.DATOS_SIMULADOS.talleristas
    );

    const listaActualizada = listaCompleta.map(
        (t) => t.id === talleristaActualizado.id ? talleristaActualizado : t
    );

    guardarDato("talleristas", listaActualizada);
}