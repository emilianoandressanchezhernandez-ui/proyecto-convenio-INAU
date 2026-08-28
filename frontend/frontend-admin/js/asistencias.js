/*
    ASISTENCIAS.JS - FRONTEND ADMIN
    Responsabilidades:
    - Listar los registros de asistencia (uno por alumno, por clase).
    - Filtrar por taller y por fecha.
    - Calcular estadisticas del filtro actual (no del sistema completo).
    - Permitir corregir el estado de un registro puntual.
*/

let registrosActuales = [];

function inicializarAsistencias() {
    registrosActuales = obtenerRegistrosPlanos();

    cargarSelectorDeTalleres("filtro-taller");
    renderizarTablaAsistencias(registrosActuales);
    mostrarEstadisticasAsistencias(registrosActuales);
    configurarFiltro();
    configurarCorreccion();
}


// ==============================
// DATOS: DE "POR CLASE" A "PLANO POR ALUMNO"
// ==============================

// El mock guarda la asistencia agrupada por clase (una fecha, un taller,
// varios alumnos adentro). Esta funcion la "aplana" a una lista donde
// cada fila es un solo registro de un solo alumno, que es como la
// pantalla necesita mostrarla y filtrarla.
function obtenerRegistrosPlanos() {

    const asistencias = obtenerListado(
        "asistencias",
        window.DATOS_SIMULADOS.asistencias
    );

    const registros = [];

    asistencias.forEach((clase) => {
        clase.registros.forEach((registro) => {
            registros.push({
                claseId: clase.id,
                tallerId: clase.tallerId,
                fecha: clase.fecha,
                alumnoId: registro.alumnoId,
                estado: registro.estado,
                observaciones: registro.observaciones || ""
            });
        });
    });

    return registros;
}


// ==============================
// TABLA
// ==============================

function renderizarTablaAsistencias(registros) {

    const tabla = document.getElementById("tabla-asistencias");

    if (!tabla) {
        return;
    }

    if (registros.length === 0) {
        tabla.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted py-5">
                    No se encontraron registros de asistencia.
                </td>
            </tr>
        `;
        return;
    }

    // Se ordena por fecha, del mas reciente al mas viejo.
    const ordenados = [...registros].sort(
        (a, b) => b.fecha.localeCompare(a.fecha)
    );

    tabla.innerHTML = ordenados.map((registro) => `
        <tr>
            <td>${formatearFecha(registro.fecha)}</td>
            <td>${escaparHTML(obtenerNombreAlumno(registro.alumnoId))}</td>
            <td>${escaparHTML(obtenerNombreTaller(registro.tallerId))}</td>
            <td>${escaparHTML(registro.estado)}</td>
            <td>${escaparHTML(obtenerNombreTalleristaDelTaller(registro.tallerId))}</td>
            <td>
                <button type="button" class="btn btn-sm btn-outline-primary"
                    onclick="abrirModalCorregir(${registro.claseId}, ${registro.alumnoId})">
                    Corregir
                </button>
            </td>
        </tr>
    `).join("");
}

function obtenerNombreAlumno(alumnoId) {

    const alumnos = obtenerListado(
        "alumnos",
        window.DATOS_SIMULADOS.alumnos
    );

    const alumno = alumnos.find((a) => a.id === alumnoId);

    return alumno ? `${alumno.nombre} ${alumno.apellido}` : "Alumno no encontrado";
}

function obtenerNombreTaller(tallerId) {

    const talleres = obtenerListado(
        "talleres",
        window.DATOS_SIMULADOS.talleres
    );

    const taller = talleres.find((t) => t.id === tallerId);

    return taller ? taller.nombre : "Taller no encontrado";
}

function obtenerNombreTalleristaDelTaller(tallerId) {

    const talleres = obtenerListado(
        "talleres",
        window.DATOS_SIMULADOS.talleres
    );

    const taller = talleres.find((t) => t.id === tallerId);

    if (!taller) {
        return "-";
    }

    const talleristas = obtenerListado(
        "talleristas",
        window.DATOS_SIMULADOS.talleristas
    );

    const tallerista = talleristas.find((t) => t.id === taller.talleristaId);

    return tallerista ? `${tallerista.nombre} ${tallerista.apellido}` : "Sin asignar";
}


// ==============================
// ESTADISTICAS (del filtro actual)
// ==============================

function mostrarEstadisticasAsistencias(registros) {

    const totalRegistros = registros.length;

    const presentes = registros.filter(
        (r) => r.estado === "Presente"
    ).length;

    const ausentes = registros.filter(
        (r) => r.estado === "Ausente"
    ).length;

    const promedio = totalRegistros === 0
        ? 0
        : Math.round((presentes / totalRegistros) * 100);

    colocarTexto("stat-registros", totalRegistros);
    colocarTexto("stat-presentes", presentes);
    colocarTexto("stat-ausentes", ausentes);
    colocarTexto("stat-promedio", `${promedio}%`);
}


// ==============================
// FILTRO
// ==============================

function configurarFiltro() {

    const boton = document.getElementById("btn-filtrar");

    if (boton) {
        boton.addEventListener("click", aplicarFiltro);
    }
}

function aplicarFiltro() {

    const tallerId = document.getElementById("filtro-taller").value;
    const fecha = document.getElementById("filtro-fecha").value;

    let filtrados = obtenerRegistrosPlanos();

    if (tallerId) {
        filtrados = filtrados.filter(
            (r) => r.tallerId === Number(tallerId)
        );
    }

    if (fecha) {
        filtrados = filtrados.filter(
            (r) => r.fecha === fecha
        );
    }

    registrosActuales = filtrados;

    renderizarTablaAsistencias(registrosActuales);
    mostrarEstadisticasAsistencias(registrosActuales);
}


// ==============================
// CORREGIR UN REGISTRO
// ==============================

let correccionActual = null;

function configurarCorreccion() {

    const boton = document.getElementById("btn-guardar-correccion");

    if (boton) {
        boton.addEventListener("click", guardarCorreccion);
    }
}

// Se llama desde el boton "Corregir" de cada fila de la tabla
// (ver renderizarTablaAsistencias). claseId identifica la clase completa
// (fecha + taller); alumnoId identifica el registro puntual dentro de ella.
function abrirModalCorregir(claseId, alumnoId) {

    correccionActual = { claseId, alumnoId };

    const registro = registrosActuales.find(
        (r) => r.claseId === claseId && r.alumnoId === alumnoId
    );

    if (!registro) {
        return;
    }

    colocarTexto("corregir-alumno", obtenerNombreAlumno(alumnoId));
    colocarTexto("corregir-taller", obtenerNombreTaller(registro.tallerId));
    colocarTexto("corregir-fecha", formatearFecha(registro.fecha));

    document.getElementById("corregir-estado").value = registro.estado;

    ocultarAlerta("alerta-corregir-asistencia");

    const modal = bootstrap.Modal.getOrCreateInstance(
        document.getElementById("modal-corregir-asistencia")
    );
    modal.show();
}

function guardarCorreccion() {

    if (!correccionActual) {
        return;
    }

    const nuevoEstado = document.getElementById("corregir-estado").value;

    const asistencias = obtenerListado(
        "asistencias",
        window.DATOS_SIMULADOS.asistencias
    );

    const clase = asistencias.find(
        (c) => c.id === correccionActual.claseId
    );

    if (!clase) {
        mostrarAlerta("alerta-corregir-asistencia", "No se encontró la clase original.", "danger");
        return;
    }

    const registro = clase.registros.find(
        (r) => r.alumnoId === correccionActual.alumnoId
    );

    if (!registro) {
        mostrarAlerta("alerta-corregir-asistencia", "No se encontró el registro original.", "danger");
        return;
    }

    registro.estado = nuevoEstado;

    guardarDato("asistencias", asistencias);

    // Se vuelve a aplicar el filtro actual (si había alguno), para que
    // la tabla y las estadisticas reflejen el cambio recien guardado.
    aplicarFiltro();

    const modal = bootstrap.Modal.getOrCreateInstance(
        document.getElementById("modal-corregir-asistencia")
    );
    modal.hide();
}