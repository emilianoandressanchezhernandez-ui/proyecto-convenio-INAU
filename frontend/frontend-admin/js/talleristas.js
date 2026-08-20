/*
    TALLERISTAS.JS - FRONTEND ADMIN
    Responsabilidades:
    - Listar los talleristas registrados.
    - Calcular y mostrar estadisticas (total, activos, con/sin talleres).
    - Buscar por nombre o correo.
    - Dar de alta un tallerista nuevo.
*/

let talleristasActuales = [];

function inicializarTalleristas() {
    talleristasActuales = obtenerListado(
        "talleristas",
        window.DATOS_SIMULADOS.talleristas
    );

    renderizarTablaTalleristas(talleristasActuales);
    mostrarEstadisticasTalleristas(talleristasActuales);
    configurarBuscador();
    configurarAltaTallerista();
}


// ==============================
// BUSCADOR
// ==============================

function configurarBuscador() {

    const input = document.getElementById("buscar-tallerista");

    if (!input) {
        return;
    }

    input.addEventListener("input", () => {
        filtrarTalleristas(input.value);
    });
}

function filtrarTalleristas(textoBusqueda) {

    const texto = normalizarTexto(textoBusqueda);

    if (!texto) {
        renderizarTablaTalleristas(talleristasActuales);
        return;
    }

    const filtrados = talleristasActuales.filter((tallerista) => {
        const nombreCompleto = normalizarTexto(
            `${tallerista.nombre} ${tallerista.apellido}`
        );
        const correo = normalizarTexto(tallerista.correo);

        return nombreCompleto.includes(texto) || correo.includes(texto);
    });

    renderizarTablaTalleristas(filtrados);

    // Las estadisticas (arriba) no cambian con la busqueda:
    // siguen representando el total real del sistema, no el filtro actual.
}


// ==============================
// TABLA
// ==============================

function renderizarTablaTalleristas(talleristas) {

    const tabla = document.getElementById("tabla-talleristas");

    if (!tabla) {
        return;
    }

    if (talleristas.length === 0) {
        tabla.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted py-5">
                    No se encontraron talleristas.
                </td>
            </tr>
        `;
        return;
    }

    tabla.innerHTML = talleristas.map((tallerista) => `
        <tr>
            <td>${escaparHTML(tallerista.nombre)} ${escaparHTML(tallerista.apellido)}</td>
            <td>${escaparHTML(tallerista.correo)}</td>
            <td>${escaparHTML(tallerista.telefono)}</td>
            <td>${escaparHTML(tallerista.estado)}</td>
            <td>
                <a href="detalle-tallerista.html?id=${tallerista.id}" class="btn btn-sm btn-outline-primary">
                    Ver
                </a>
            </td>
        </tr>
    `).join("");
}


// ==============================
// ESTADISTICAS
// ==============================

function mostrarEstadisticasTalleristas(talleristas) {

    const total = talleristas.length;

    const activos = talleristas.filter(
        (t) => t.estado === "Activo"
    ).length;

    const conTalleres = talleristas.filter(
        (t) => t.talleresAsignados && t.talleresAsignados.length > 0
    ).length;

    const sinTalleres = total - conTalleres;

    colocarTexto("stat-total", total);
    colocarTexto("stat-activos", activos);
    colocarTexto("stat-con-talleres", conTalleres);
    colocarTexto("stat-sin-talleres", sinTalleres);
}


// ==============================
// ALTA DE TALLERISTA
// ==============================

function configurarAltaTallerista() {

    const botonAbrir = document.getElementById("btn-nuevo-tallerista");
    const botonGuardar = document.getElementById("btn-guardar-nuevo-tallerista");

    if (botonAbrir) {
        botonAbrir.addEventListener("click", abrirModalNuevoTallerista);
    }

    if (botonGuardar) {
        botonGuardar.addEventListener("click", guardarNuevoTallerista);
    }
}

function abrirModalNuevoTallerista() {

    document.getElementById("form-nuevo-tallerista").reset();
    ocultarAlerta("alerta-nuevo-tallerista");

    const modal = bootstrap.Modal.getOrCreateInstance(
        document.getElementById("modal-nuevo-tallerista")
    );

    modal.show();
}

function guardarNuevoTallerista() {

    const nombre = document.getElementById("nuevo-tallerista-nombre").value.trim();
    const apellido = document.getElementById("nuevo-tallerista-apellido").value.trim();
    const cedula = document.getElementById("nuevo-tallerista-cedula").value.trim();
    const correo = document.getElementById("nuevo-tallerista-correo").value.trim();
    const telefono = document.getElementById("nuevo-tallerista-telefono").value.trim();
    const especialidad = document.getElementById("nuevo-tallerista-especialidad").value.trim();

    const error = validarNuevoTallerista({ nombre, apellido, cedula, correo, telefono, especialidad });

    if (error) {
        mostrarAlerta("alerta-nuevo-tallerista", error, "danger");
        return;
    }

    const nuevoTallerista = {
        id: generarId(talleristasActuales),
        nombre,
        apellido,
        cedula,
        correo,
        telefono,
        especialidad,
        estado: "Activo",
        fechaRegistro: new Date().toISOString().split("T")[0],
        talleresAsignados: []
    };

    talleristasActuales.push(nuevoTallerista);
    guardarDato("talleristas", talleristasActuales);

    renderizarTablaTalleristas(talleristasActuales);
    mostrarEstadisticasTalleristas(talleristasActuales);

    const modal = bootstrap.Modal.getOrCreateInstance(
        document.getElementById("modal-nuevo-tallerista")
    );
    modal.hide();
}

function validarNuevoTallerista(datos) {

    const camposObligatorios = [
        datos.nombre, datos.apellido, datos.cedula,
        datos.correo, datos.telefono, datos.especialidad
    ];

    const hayCampoVacio = camposObligatorios.some((campo) => !campo);

    if (hayCampoVacio) {
        return "Todos los campos son obligatorios.";
    }

    const cedulaDuplicada = talleristasActuales.some(
        (t) => t.cedula === datos.cedula
    );

    if (cedulaDuplicada) {
        return "Ya existe un tallerista registrado con esa cédula.";
    }

    return null;
}