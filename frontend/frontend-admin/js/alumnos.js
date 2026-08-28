/*
    ALUMNOS.JS - FRONTEND ADMIN
    Responsabilidades:
    - Listar los alumnos registrados.
    - Calcular y mostrar estadisticas (total, activos, con talleres, inactivos).
    - Buscar por nombre o cedula.
    - Dar de alta un alumno nuevo.
*/

let alumnosActuales = [];

function inicializarAlumnos() {
    alumnosActuales = obtenerListado(
        "alumnos",
        window.DATOS_SIMULADOS.alumnos
    );

    renderizarTablaAlumnos(alumnosActuales);
    mostrarEstadisticasAlumnos(alumnosActuales);
    configurarBuscador();
    configurarAltaAlumno();
}


// ==============================
// BUSCADOR
// ==============================

function configurarBuscador() {

    const input = document.getElementById("buscar-alumno");

    if (!input) {
        return;
    }

    input.addEventListener("input", () => {
        filtrarAlumnos(input.value);
    });
}

function filtrarAlumnos(textoBusqueda) {

    const texto = normalizarTexto(textoBusqueda);

    if (!texto) {
        renderizarTablaAlumnos(alumnosActuales);
        return;
    }

    const filtrados = alumnosActuales.filter((alumno) => {
        const nombreCompleto = normalizarTexto(
            `${alumno.nombre} ${alumno.apellido}`
        );
        const cedula = normalizarTexto(alumno.cedula);

        return nombreCompleto.includes(texto) || cedula.includes(texto);
    });

    renderizarTablaAlumnos(filtrados);
}


// ==============================
// TABLA
// ==============================

function renderizarTablaAlumnos(alumnos) {

    const tabla = document.getElementById("tabla-alumnos");

    if (!tabla) {
        return;
    }

    if (alumnos.length === 0) {
        tabla.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted py-5">
                    No se encontraron alumnos.
                </td>
            </tr>
        `;
        return;
    }

    tabla.innerHTML = alumnos.map((alumno) => `
        <tr>
            <td>${escaparHTML(alumno.nombre)} ${escaparHTML(alumno.apellido)}</td>
            <td>${escaparHTML(alumno.cedula)}</td>
            <td>${escaparHTML(alumno.telefono)}</td>
            <td>${contarTalleresDelAlumno(alumno.id)}</td>
            <td>${escaparHTML(alumno.estado)}</td>
            <td>
                <a href="detalle-alumno.html?id=${alumno.id}" class="btn btn-sm btn-outline-primary">
                    Ver
                </a>
            </td>
        </tr>
    `).join("");
}

function contarTalleresDelAlumno(alumnoId) {

    const inscripciones = window.DATOS_SIMULADOS.inscripciones;

    return inscripciones.filter(
        (inscripcion) => inscripcion.alumnoIds.includes(alumnoId)
    ).length;
}


// ==============================
// ESTADISTICAS
// ==============================

function mostrarEstadisticasAlumnos(alumnos) {

    const total = alumnos.length;

    const activos = alumnos.filter(
        (a) => a.estado === "Activo"
    ).length;

    const conTalleres = alumnos.filter(
        (a) => contarTalleresDelAlumno(a.id) > 0
    ).length;

    const inactivos = total - activos;

    colocarTexto("stat-total", total);
    colocarTexto("stat-activos", activos);
    colocarTexto("stat-con-talleres", conTalleres);
    colocarTexto("stat-inactivos", inactivos);
}


// ==============================
// ALTA DE ALUMNO
// ==============================

function configurarAltaAlumno() {

    const botonAbrir = document.getElementById("btn-nuevo-alumno");
    const botonGuardar = document.getElementById("btn-guardar-nuevo-alumno");

    if (botonAbrir) {
        botonAbrir.addEventListener("click", abrirModalNuevoAlumno);
    }

    if (botonGuardar) {
        botonGuardar.addEventListener("click", guardarNuevoAlumno);
    }
}

function abrirModalNuevoAlumno() {

    document.getElementById("form-nuevo-alumno").reset();
    ocultarAlerta("alerta-nuevo-alumno");

    const modal = bootstrap.Modal.getOrCreateInstance(
        document.getElementById("modal-nuevo-alumno")
    );

    modal.show();
}

function guardarNuevoAlumno() {

    const nombre = document.getElementById("nuevo-alumno-nombre").value.trim();
    const apellido = document.getElementById("nuevo-alumno-apellido").value.trim();
    const cedula = document.getElementById("nuevo-alumno-cedula").value.trim();
    const fechaNacimiento = document.getElementById("nuevo-alumno-fecha-nacimiento").value;
    const correo = document.getElementById("nuevo-alumno-correo").value.trim();
    const telefono = document.getElementById("nuevo-alumno-telefono").value.trim();

    const error = validarNuevoAlumno({ nombre, apellido, cedula, fechaNacimiento, correo, telefono });

    if (error) {
        mostrarAlerta("alerta-nuevo-alumno", error, "danger");
        return;
    }

    const nuevoAlumno = {
        id: generarId(alumnosActuales),
        nombre,
        apellido,
        cedula,
        correo,
        telefono,
        fechaNacimiento,
        estado: "Activo",
        fechaRegistro: new Date().toISOString().split("T")[0],
        ultimaAsistencia: null,
        observaciones: ""
    };

    alumnosActuales.push(nuevoAlumno);
    guardarDato("alumnos", alumnosActuales);

    renderizarTablaAlumnos(alumnosActuales);
    mostrarEstadisticasAlumnos(alumnosActuales);

    const modal = bootstrap.Modal.getOrCreateInstance(
        document.getElementById("modal-nuevo-alumno")
    );
    modal.hide();
}

function validarNuevoAlumno(datos) {

    const camposObligatorios = [
        datos.nombre, datos.apellido, datos.cedula,
        datos.fechaNacimiento, datos.correo, datos.telefono
    ];

    const hayCampoVacio = camposObligatorios.some((campo) => !campo);

    if (hayCampoVacio) {
        return "Todos los campos son obligatorios.";
    }

    const cedulaDuplicada = alumnosActuales.some(
        (a) => a.cedula === datos.cedula
    );

    if (cedulaDuplicada) {
        return "Ya existe un alumno registrado con esa cédula.";
    }

    return null;
}