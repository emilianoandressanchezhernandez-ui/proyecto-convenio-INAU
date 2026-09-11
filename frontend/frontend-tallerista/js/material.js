/*
    MATERIAL.JS - FRONTEND TALLERISTA
    Responsabilidades:
    - Listar el material y las tareas de los talleres del tallerista logueado.
    - Calcular y mostrar estadisticas (total, materiales, tareas).
    - Filtrar por taller, tipo y buscar por titulo.
    - Dar de alta un material o tarea nuevo.
    - Eliminar un contenido existente.
*/

let contenidosActuales = [];
let misTalleresIds = [];

function inicializarMaterial() {

    const usuarioActual = window.DATOS_SIMULADOS.usuarioActual;

    misTalleresIds = obtenerListado("talleres", window.DATOS_SIMULADOS.talleres)
        .filter((taller) => taller.talleristaId === usuarioActual.id)
        .map((taller) => taller.id);

    contenidosActuales = obtenerListado(
        "contenidos",
        window.DATOS_SIMULADOS.contenidos
    ).filter((contenido) => misTalleresIds.includes(contenido.tallerId));

    cargarSelectorDeMisTalleres("filtro-taller-material");
    cargarSelectorDeMisTalleres("nuevo-material-taller");

    // Si se llega desde el botón "Material y Tareas" de un taller puntual
    // (detalle-taller.html), la URL trae ?tallerId=X y arrancamos ya
    // filtrado por ese taller, en vez de mostrar todos.
    const tallerIdDesdeURL = obtenerParametroURL("tallerId");

    if (tallerIdDesdeURL) {
        document.getElementById("filtro-taller-material").value = tallerIdDesdeURL;
    }

    renderizarTablaMaterial(contenidosActuales);
    mostrarEstadisticasMaterial(contenidosActuales);
    configurarFiltro();
    configurarTipoDinamico();
    configurarAltaMaterial();

    if (tallerIdDesdeURL) {
        aplicarFiltro();
    }
}


// ==============================
// SELECTOR DE "MIS TALLERES"
// ==============================

// A diferencia del panel de admin, el tallerista solo elige entre SUS
// propios talleres, no todos los del sistema.
function cargarSelectorDeMisTalleres(selectId) {

    const select = document.getElementById(selectId);

    if (!select) {
        return;
    }

    const talleres = obtenerListado("talleres", window.DATOS_SIMULADOS.talleres)
        .filter((taller) => misTalleresIds.includes(taller.id));

    const opciones = talleres
        .map((t) => `<option value="${t.id}">${escaparHTML(t.nombre)}</option>`)
        .join("");

    const opcionPorDefecto = selectId === "filtro-taller-material"
        ? `<option value="">Todos mis talleres</option>`
        : `<option value="">Seleccionar...</option>`;

    select.innerHTML = opcionPorDefecto + opciones;
}


// ==============================
// TABLA
// ==============================

function renderizarTablaMaterial(contenidos) {

    const tabla = document.getElementById("tabla-material");

    if (!tabla) {
        return;
    }

    if (contenidos.length === 0) {
        tabla.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted py-5">
                    No se encontró material ni tareas.
                </td>
            </tr>
        `;
        return;
    }

    const ordenados = [...contenidos].sort(
        (a, b) => b.fechaPublicacion.localeCompare(a.fechaPublicacion)
    );

    tabla.innerHTML = ordenados.map((contenido) => `
        <tr>
            <td>${escaparHTML(contenido.titulo)}</td>
            <td>${escaparHTML(obtenerNombreTaller(contenido.tallerId))}</td>
            <td>${escaparHTML(contenido.tipo)}</td>
            <td>${formatearFecha(contenido.fechaPublicacion)}</td>
            <td>${contenido.fechaLimite ? formatearFecha(contenido.fechaLimite) : "-"}</td>
            <td>
                ${contenido.tipo === "Tarea"
            ? `<a href="correccion-tarea.html?id=${contenido.id}" class="btn btn-sm btn-outline-primary">Ver Entregas</a>`
            : ""
        }
                <button type="button" class="btn btn-sm btn-outline-danger"
                    onclick="eliminarContenido(${contenido.id})">
                    Eliminar
                </button>
            </td>
        </tr>
    `).join("");
}

function obtenerNombreTaller(tallerId) {

    const talleres = obtenerListado("talleres", window.DATOS_SIMULADOS.talleres);
    const taller = talleres.find((t) => t.id === tallerId);

    return taller ? taller.nombre : "Taller no encontrado";
}


// ==============================
// ESTADISTICAS
// ==============================

function mostrarEstadisticasMaterial(contenidos) {

    const total = contenidos.length;
    const materiales = contenidos.filter((c) => c.tipo === "Material").length;
    const tareas = contenidos.filter((c) => c.tipo === "Tarea").length;

    colocarTexto("stat-total", total);
    colocarTexto("stat-materiales", materiales);
    colocarTexto("stat-tareas", tareas);
}


// ==============================
// FILTRO
// ==============================

function configurarFiltro() {

    const selectTaller = document.getElementById("filtro-taller-material");
    const selectTipo = document.getElementById("filtro-tipo-material");
    const inputBuscar = document.getElementById("buscar-material");

    if (selectTaller) selectTaller.addEventListener("change", aplicarFiltro);
    if (selectTipo) selectTipo.addEventListener("change", aplicarFiltro);
    if (inputBuscar) inputBuscar.addEventListener("input", aplicarFiltro);
}

function aplicarFiltro() {

    const tallerId = document.getElementById("filtro-taller-material").value;
    const tipo = document.getElementById("filtro-tipo-material").value;
    const texto = normalizarTextoSimple(document.getElementById("buscar-material").value);

    let filtrados = obtenerListado("contenidos", window.DATOS_SIMULADOS.contenidos)
        .filter((c) => misTalleresIds.includes(c.tallerId));

    if (tallerId) {
        filtrados = filtrados.filter((c) => c.tallerId === Number(tallerId));
    }

    if (tipo) {
        filtrados = filtrados.filter((c) => c.tipo === tipo);
    }

    if (texto) {
        filtrados = filtrados.filter((c) =>
            normalizarTextoSimple(c.titulo).includes(texto)
        );
    }

    contenidosActuales = filtrados;
    renderizarTablaMaterial(contenidosActuales);
}

// Version simple de normalizacion (minusculas, sin tildes), ya que
// normalizarTexto no forma parte del utils.js de tallerista.
function normalizarTextoSimple(valor) {
    if (!valor) return "";
    return valor.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}


// ==============================
// TOGGLE: FECHA LIMITE SOLO SI ES "TAREA"
// ==============================

function configurarTipoDinamico() {

    const select = document.getElementById("nuevo-material-tipo");

    if (select) {
        select.addEventListener("change", actualizarVisibilidadFechaLimite);
    }
}

function actualizarVisibilidadFechaLimite() {

    const tipo = document.getElementById("nuevo-material-tipo").value;
    const contenedor = document.getElementById("contenedor-fecha-limite");

    contenedor.style.display = tipo === "Tarea" ? "block" : "none";
}


// ==============================
// ALTA DE MATERIAL / TAREA
// ==============================

function configurarAltaMaterial() {

    const botonAbrir = document.getElementById("btn-nuevo-material");
    const botonGuardar = document.getElementById("btn-guardar-nuevo-material");

    if (botonAbrir) botonAbrir.addEventListener("click", abrirModalNuevoMaterial);
    if (botonGuardar) botonGuardar.addEventListener("click", guardarNuevoMaterial);
}

function abrirModalNuevoMaterial() {

    document.getElementById("form-nuevo-material").reset();
    ocultarAlerta("alerta-nuevo-material");
    actualizarVisibilidadFechaLimite();

    const modal = bootstrap.Modal.getOrCreateInstance(
        document.getElementById("modal-nuevo-material")
    );
    modal.show();
}

function guardarNuevoMaterial() {

    const tallerId = document.getElementById("nuevo-material-taller").value;
    const tipo = document.getElementById("nuevo-material-tipo").value;
    const titulo = document.getElementById("nuevo-material-titulo").value.trim();
    const descripcion = document.getElementById("nuevo-material-descripcion").value.trim();
    const fechaLimite = document.getElementById("nuevo-material-fecha-limite").value;

    const error = validarNuevoMaterial({ tallerId, titulo, descripcion, tipo, fechaLimite });

    if (error) {
        mostrarAlerta("alerta-nuevo-material", error, "danger");
        return;
    }

    const todosLosContenidos = obtenerListado(
        "contenidos",
        window.DATOS_SIMULADOS.contenidos
    );

    const nuevoContenido = {
        id: generarId(todosLosContenidos),
        tallerId: Number(tallerId),
        tipo,
        titulo,
        descripcion,
        fechaPublicacion: new Date().toISOString().split("T")[0],
        fechaLimite: tipo === "Tarea" ? fechaLimite : null
    };

    todosLosContenidos.push(nuevoContenido);
    guardarDato("contenidos", todosLosContenidos);

    aplicarFiltro();
    mostrarEstadisticasMaterial(
        todosLosContenidos.filter((c) => misTalleresIds.includes(c.tallerId))
    );

    const modal = bootstrap.Modal.getOrCreateInstance(
        document.getElementById("modal-nuevo-material")
    );
    modal.hide();
}

function validarNuevoMaterial(datos) {

    if (!datos.tallerId || !datos.titulo || !datos.descripcion) {
        return "Taller, título y descripción son obligatorios.";
    }

    if (datos.tipo === "Tarea" && !datos.fechaLimite) {
        return "Las tareas necesitan una fecha límite.";
    }

    return null;
}


// ==============================
// ELIMINAR
// ==============================

// Se llama desde el boton "Eliminar" de cada fila (ver renderizarTablaMaterial).
function eliminarContenido(id) {

    const contenido = contenidosActuales.find((c) => c.id === id);

    if (!contenido) {
        return;
    }

    const confirmar = confirm(`¿Desea eliminar "${contenido.titulo}"?`);

    if (!confirmar) {
        return;
    }

    const todosLosContenidos = obtenerListado(
        "contenidos",
        window.DATOS_SIMULADOS.contenidos
    );

    const listaActualizada = todosLosContenidos.filter((c) => c.id !== id);

    guardarDato("contenidos", listaActualizada);

    aplicarFiltro();
    mostrarEstadisticasMaterial(
        listaActualizada.filter((c) => misTalleresIds.includes(c.tallerId))
    );
}