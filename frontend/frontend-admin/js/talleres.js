/*
    TALLERES.JS - FRONTEND ADMIN
    Responsabilidades:
    - Listar los talleres registrados.
    - Calcular y mostrar estadisticas (total, activos, finalizados, alumnos totales).
    - Buscar por nombre.
    - Dar de alta un taller nuevo.
*/

let talleresActuales = [];

function inicializarTalleres() {
    talleresActuales = obtenerListado(
        "talleres",
        window.DATOS_SIMULADOS.talleres
    );

    renderizarTablaTalleres(talleresActuales);
    mostrarEstadisticasTalleres(talleresActuales);
    configurarBuscador();
    configurarAltaTaller();
}


// ==============================
// TABLA
// ==============================

function renderizarTablaTalleres(talleres) {

    const tabla = document.getElementById("tabla-talleres");

    if (!tabla) {
        return;
    }

    if (talleres.length === 0) {
        tabla.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted py-5">
                    No se encontraron talleres.
                </td>
            </tr>
        `;
        return;
    }

    tabla.innerHTML = talleres.map((taller) => `
        <tr>
            <td>${escaparHTML(taller.nombre)}</td>
            <td>${escaparHTML(obtenerNombreTallerista(taller.talleristaId))}</td>
            <td>${contarAlumnosInscriptos(taller.id)}</td>
            <td>${formatearHorarios(taller.horarios)}</td>
            <td>${escaparHTML(taller.estado)}</td>
            <td>
                <a href="detalle-taller.html?id=${taller.id}" class="btn btn-sm btn-outline-primary">
                    Ver
                </a>
            </td>
        </tr>
    `).join("");
}

// Cuenta los alumnos inscriptos EN VIVO desde "inscripciones", en vez de
// depender del campo fijo "cantidadAlumnos" del mock. Asi, si se asigna
// un alumno nuevo a este taller desde detalle-taller.js, el numero que
// se muestra aca siempre queda correcto y actualizado.
function contarAlumnosInscriptos(tallerId) {

    const inscripciones = window.DATOS_SIMULADOS.inscripciones;

    const inscripcion = inscripciones.find(
        (i) => i.tallerId === tallerId
    );

    return inscripcion ? inscripcion.alumnoIds.length : 0;
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

function mostrarEstadisticasTalleres(talleres) {

    const total = talleres.length;

    const activos = talleres.filter(
        (t) => t.estado === "Activo"
    ).length;

    const finalizados = talleres.filter(
        (t) => t.estado === "Finalizado"
    ).length;

    const alumnosTotales = talleres.reduce(
        (suma, t) => suma + contarAlumnosInscriptos(t.id), 0
    );

    colocarTexto("stat-total", total);
    colocarTexto("stat-activos", activos);
    colocarTexto("stat-finalizados", finalizados);
    colocarTexto("stat-alumnos-totales", alumnosTotales);
}


// ==============================
// BUSCADOR
// ==============================

function configurarBuscador() {

    const input = document.getElementById("buscar-taller");

    if (!input) {
        return;
    }

    input.addEventListener("input", () => {
        filtrarTalleres(input.value);
    });
}

function filtrarTalleres(textoBusqueda) {

    const texto = normalizarTexto(textoBusqueda);

    if (!texto) {
        renderizarTablaTalleres(talleresActuales);
        return;
    }

    const filtrados = talleresActuales.filter((taller) =>
        normalizarTexto(taller.nombre).includes(texto)
    );

    renderizarTablaTalleres(filtrados);
}


// ==============================
// ALTA DE TALLER
// ==============================

function configurarAltaTaller() {

    const botonAbrir = document.getElementById("btn-nuevo-taller");
    const botonAgregarHorario = document.getElementById("btn-agregar-horario-nuevo");
    const botonGuardar = document.getElementById("btn-guardar-nuevo-taller");

    if (botonAbrir) {
        botonAbrir.addEventListener("click", abrirModalNuevoTaller);
    }

    if (botonAgregarHorario) {
        botonAgregarHorario.addEventListener("click", () => {
            agregarFilaHorario("nuevo-taller-horarios");
        });
    }

    if (botonGuardar) {
        botonGuardar.addEventListener("click", guardarNuevoTaller);
    }
}

function abrirModalNuevoTaller() {

    document.getElementById("form-nuevo-taller").reset();
    ocultarAlerta("alerta-nuevo-taller");

    cargarSelectorDeTalleristas("nuevo-taller-tallerista");

    limpiarHorarios("nuevo-taller-horarios");
    agregarFilaHorario("nuevo-taller-horarios");

    const modal = bootstrap.Modal.getOrCreateInstance(
        document.getElementById("modal-nuevo-taller")
    );

    modal.show();
}

function guardarNuevoTaller() {

    const nombre = document.getElementById("nuevo-taller-nombre").value.trim();
    const descripcion = document.getElementById("nuevo-taller-descripcion").value.trim();
    const talleristaId = document.getElementById("nuevo-taller-tallerista").value;
    const centro = document.getElementById("nuevo-taller-centro").value.trim();
    const direccion = document.getElementById("nuevo-taller-direccion").value.trim();
    const salon = document.getElementById("nuevo-taller-salon").value.trim();
    const fechaInicio = document.getElementById("nuevo-taller-fecha-inicio").value;
    const fechaFin = document.getElementById("nuevo-taller-fecha-fin").value;
    const horarios = leerHorariosDesdeFormulario("nuevo-taller-horarios");

    const datos = { nombre, descripcion, talleristaId, centro, direccion, salon, fechaInicio, fechaFin, horarios };

    const error = validarNuevoTaller(datos);

    if (error) {
        mostrarAlerta("alerta-nuevo-taller", error, "danger");
        return;
    }

    const nuevoTaller = {
        id: generarId(talleresActuales),
        talleristaId: Number(talleristaId),
        nombre,
        descripcion,
        horarios,
        ubicacion: { centro, direccion, salon },
        cantidadAlumnos: 0,
        asistenciaPromedio: 0,
        estado: "Activo",
        fechaInicio,
        fechaFin,
        observaciones: ""
    };

    talleresActuales.push(nuevoTaller);
    guardarDato("talleres", talleresActuales);

    // Un taller nuevo arranca sin alumnos inscriptos: se crea tambien
    // su registro vacio en "inscripciones", para que el resto del sistema
    // (que siempre busca la inscripcion por tallerId) lo encuentre sin error.
    const inscripciones = obtenerListado(
        "inscripciones",
        window.DATOS_SIMULADOS.inscripciones
    );
    inscripciones.push({ tallerId: nuevoTaller.id, alumnoIds: [] });
    guardarDato("inscripciones", inscripciones);

    renderizarTablaTalleres(talleresActuales);
    mostrarEstadisticasTalleres(talleresActuales);

    const modal = bootstrap.Modal.getOrCreateInstance(
        document.getElementById("modal-nuevo-taller")
    );
    modal.hide();
}

function validarNuevoTaller(datos) {

    const camposObligatorios = [
        datos.nombre, datos.descripcion, datos.talleristaId,
        datos.centro, datos.direccion, datos.salon,
        datos.fechaInicio, datos.fechaFin
    ];

    if (camposObligatorios.some((campo) => !campo)) {
        return "Todos los campos son obligatorios.";
    }

    if (datos.horarios.length === 0) {
        return "El taller debe tener al menos un horario completo.";
    }

    if (datos.fechaFin < datos.fechaInicio) {
        return "La fecha de finalización no puede ser anterior a la fecha de inicio.";
    }

    return null;
}