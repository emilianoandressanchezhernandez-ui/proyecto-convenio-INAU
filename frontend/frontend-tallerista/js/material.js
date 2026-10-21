
/*
    MATERIAL.JS - FRONTEND TALLERISTA

    Integración con la API real INAU.

    - Obtiene los talleres del usuario autenticado.
    - Consulta sus materiales y tareas.
    - Muestra estadísticas.
    - Filtra por taller, tipo y título.
    - Publica materiales y tareas en MySQL.
    - Elimina contenidos mediante la API.
    - Conserva el enlace a las entregas.

    No utiliza DATOS_SIMULADOS ni localStorage.
*/

// ======================================
// VARIABLES
// ======================================

let talleresMaterial = [];
let contenidosMaterial = [];
let guardandoMaterial = false;


// ======================================
// INICIALIZACIÓN
// ======================================

async function inicializarMaterial() {
    configurarEventosMaterial();
    mostrarAlertaMaterial(
        "Cargando materiales y tareas...",
        "info"
    );

    try {
        const talleres = await solicitarMaterialAPI(
            "/mis-talleres"
        );

        if (!Array.isArray(talleres)) {
            throw new Error(
                "La API no devolvió una lista de talleres."
            );
        }

        talleresMaterial = talleres;

        cargarSelectoresMaterial();

        // Respetar el taller recibido desde el detalle.
        const parametros = new URLSearchParams(
            window.location.search
        );

        const tallerIdURL = parametros.get("tallerId");

        const filtroTaller = document.getElementById(
            "filtro-taller-material"
        );

        if (tallerIdURL && filtroTaller) {
            const permitido = talleresMaterial.some(
                taller =>
                    String(taller.id) === tallerIdURL
            );

            if (!permitido) {
                throw new Error(
                    "El taller solicitado no está asignado " +
                    "a tu usuario."
                );
            }

            filtroTaller.value = tallerIdURL;
        }

        configurarEnlaceVolverMaterial(tallerIdURL);

        await cargarContenidosMaterial();

        ocultarAlertaMaterial();

    } catch (error) {
        console.error(
            "Error al iniciar Material y Tareas:",
            error
        );

        mostrarAlertaMaterial(
            "No se pudieron cargar los contenidos. " +
            error.message,
            "danger"
        );

        desactivarAccionesMaterial();
    }
}


// ======================================
// PETICIONES API
// ======================================

async function solicitarMaterialAPI(
    ruta,
    metodo = "GET",
    datos = null
) {
    const opciones = {
        method: metodo,
        credentials: "include",
        headers: {
            Accept: "application/json"
        }
    };

    if (datos !== null) {
        opciones.headers["Content-Type"] =
            "application/json";

        opciones.body = JSON.stringify(datos);
    }

    const respuesta = await fetch(
        `${TALLERISTA_API_URL}${ruta}`,
        opciones
    );

    let resultado;

    try {
        resultado = await respuesta.json();
    } catch (error) {
        throw new Error(
            `La API devolvió una respuesta inválida: ${ruta}`
        );
    }

    if (!respuesta.ok || resultado.ok === false) {
        let mensaje = resultado.mensaje ||
            `Error HTTP ${respuesta.status}`;

        const errores = resultado.errores;

        if (Array.isArray(errores) && errores.length) {
            mensaje += " " + errores.join(" ");
        } else if (
            errores &&
            typeof errores === "object"
        ) {
            mensaje += " " +
                Object.values(errores).join(" ");
        }

        throw new Error(mensaje);
    }

    return resultado.datos;
}


// ======================================
// CARGAR CONTENIDOS
// ======================================

async function cargarContenidosMaterial() {
    const listas = await Promise.all(
        talleresMaterial.map(taller =>
            solicitarMaterialAPI(
                `/talleres/${Number(taller.id)}/contenidos`
            )
        )
    );

    const contenidosPorId = new Map();

    listas.forEach((lista, indice) => {
        if (!Array.isArray(lista)) {
            throw new Error(
                "La API devolvió una lista de contenidos inválida."
            );
        }

        const tallerId = Number(
            talleresMaterial[indice].id
        );

        lista.forEach(contenido => {
            const contenidoNormalizado = {
                ...contenido,

                id: Number(contenido.id),

                taller_id: Number(
                    contenido.taller_id ??
                    contenido.tallerId ??
                    tallerId
                ),

                fecha_publicacion:
                    contenido.fecha_publicacion ??
                    contenido.fechaPublicacion ??
                    null,

                fecha_limite:
                    contenido.fecha_limite ??
                    contenido.fechaLimite ??
                    null
            };

            contenidosPorId.set(
                contenidoNormalizado.id,
                contenidoNormalizado
            );
        });
    });

    contenidosMaterial = [
        ...contenidosPorId.values()
    ];

    mostrarEstadisticasMaterial();
    aplicarFiltroMaterial();
}


// ======================================
// SELECTORES DE TALLERES
// ======================================

function cargarSelectoresMaterial() {
    const filtro = document.getElementById(
        "filtro-taller-material"
    );

    const selectorNuevo = document.getElementById(
        "nuevo-material-taller"
    );

    if (filtro) {
        filtro.replaceChildren();

        filtro.add(
            new Option("Todos mis talleres", "")
        );

        talleresMaterial.forEach(taller => {
            filtro.add(
                new Option(
                    taller.nombre,
                    String(taller.id)
                )
            );
        });
    }

    if (selectorNuevo) {
        selectorNuevo.replaceChildren();

        selectorNuevo.add(
            new Option("Seleccionar...", "")
        );

        // No se pueden publicar contenidos
        // en talleres finalizados.
        talleresMaterial
            .filter(taller =>
                taller.estado === "Activo"
            )
            .forEach(taller => {
                selectorNuevo.add(
                    new Option(
                        taller.nombre,
                        String(taller.id)
                    )
                );
            });
    }

    const botonNuevo = document.getElementById(
        "btn-nuevo-material"
    );

    if (botonNuevo) {
        botonNuevo.disabled =
            !talleresMaterial.some(
                taller => taller.estado === "Activo"
            );
    }
}


// ======================================
// EVENTOS
// ======================================

function configurarEventosMaterial() {
    const filtroTaller = document.getElementById(
        "filtro-taller-material"
    );

    const filtroTipo = document.getElementById(
        "filtro-tipo-material"
    );

    const buscador = document.getElementById(
        "buscar-material"
    );

    filtroTaller?.addEventListener(
        "change",
        aplicarFiltroMaterial
    );

    filtroTipo?.addEventListener(
        "change",
        aplicarFiltroMaterial
    );

    buscador?.addEventListener(
        "input",
        aplicarFiltroMaterial
    );

    document.getElementById(
        "nuevo-material-tipo"
    )?.addEventListener(
        "change",
        actualizarVisibilidadFechaMaterial
    );

    document.getElementById(
        "btn-nuevo-material"
    )?.addEventListener(
        "click",
        abrirModalNuevoMaterial
    );

    document.getElementById(
        "btn-guardar-nuevo-material"
    )?.addEventListener(
        "click",
        guardarNuevoMaterialAPI
    );
}


// ======================================
// FILTROS
// ======================================

function aplicarFiltroMaterial() {
    const tallerId = document.getElementById(
        "filtro-taller-material"
    )?.value ?? "";

    const tipo = document.getElementById(
        "filtro-tipo-material"
    )?.value ?? "";

    const texto = normalizarTextoMaterial(
        document.getElementById(
            "buscar-material"
        )?.value ?? ""
    );

    let resultados = [...contenidosMaterial];

    if (tallerId) {
        resultados = resultados.filter(
            contenido =>
                Number(contenido.taller_id) ===
                Number(tallerId)
        );
    }

    if (tipo) {
        resultados = resultados.filter(
            contenido => contenido.tipo === tipo
        );
    }

    if (texto) {
        resultados = resultados.filter(
            contenido =>
                normalizarTextoMaterial(
                    contenido.titulo
                ).includes(texto)
        );
    }

    renderizarTablaMaterial(resultados);
}


function normalizarTextoMaterial(valor) {
    return String(valor ?? "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}


// ======================================
// ESTADÍSTICAS
// ======================================

function mostrarEstadisticasMaterial() {
    colocarTextoMaterial(
        "stat-total",
        contenidosMaterial.length
    );

    colocarTextoMaterial(
        "stat-materiales",
        contenidosMaterial.filter(
            contenido => contenido.tipo === "Material"
        ).length
    );

    colocarTextoMaterial(
        "stat-tareas",
        contenidosMaterial.filter(
            contenido => contenido.tipo === "Tarea"
        ).length
    );
}


// ======================================
// TABLA
// ======================================

function renderizarTablaMaterial(contenidos) {
    const tabla = document.getElementById(
        "tabla-material"
    );

    if (!tabla) {
        return;
    }

    tabla.replaceChildren();

    if (contenidos.length === 0) {
        const fila = document.createElement("tr");
        const celda = document.createElement("td");

        celda.colSpan = 6;
        celda.className =
            "text-center text-muted py-5";

        celda.textContent =
            "No se encontraron materiales ni tareas.";

        fila.appendChild(celda);
        tabla.appendChild(fila);
        return;
    }

    const ordenados = [...contenidos].sort(
        (a, b) => String(
            b.fecha_publicacion ?? ""
        ).localeCompare(
            String(a.fecha_publicacion ?? "")
        )
    );

    ordenados.forEach(contenido => {
        tabla.appendChild(
            crearFilaMaterial(contenido)
        );
    });
}


function crearFilaMaterial(contenido) {
    const fila = document.createElement("tr");

    const celdaTitulo = crearCeldaMaterial(
        contenido.titulo || "Sin título"
    );

    const celdaTaller = crearCeldaMaterial(
        obtenerNombreTallerMaterial(
            contenido.taller_id
        )
    );

    const celdaTipo = crearCeldaMaterial(
        contenido.tipo || "-"
    );

    const celdaFecha = crearCeldaMaterial(
        formatearFechaMaterial(
            contenido.fecha_publicacion
        )
    );

    const celdaLimite = crearCeldaMaterial(
        formatearFechaMaterial(
            contenido.fecha_limite
        )
    );

    const celdaAcciones = document.createElement(
        "td"
    );

    const taller = talleresMaterial.find(
        item =>
            Number(item.id) ===
            Number(contenido.taller_id)
    );

    // Enlace a correcciones.
    if (contenido.tipo === "Tarea") {
        const enlace = document.createElement("a");

        enlace.href =
            `correccion-tarea.html?id=${encodeURIComponent(
                contenido.id
            )}`;

        enlace.className =
            "btn btn-sm btn-outline-primary me-2 mb-1";

        enlace.textContent = "Ver Entregas";

        celdaAcciones.appendChild(enlace);
    }

    // El backend impide eliminar contenidos
    // cuando el taller está finalizado.
    if (taller?.estado === "Activo") {
        const botonEliminar = document.createElement(
            "button"
        );

        botonEliminar.type = "button";
        botonEliminar.className =
            "btn btn-sm btn-outline-danger mb-1";

        botonEliminar.textContent = "Eliminar";

        botonEliminar.addEventListener(
            "click",
            () => eliminarContenidoAPI(contenido)
        );

        celdaAcciones.appendChild(botonEliminar);
    }

    fila.appendChild(celdaTitulo);
    fila.appendChild(celdaTaller);
    fila.appendChild(celdaTipo);
    fila.appendChild(celdaFecha);
    fila.appendChild(celdaLimite);
    fila.appendChild(celdaAcciones);

    return fila;
}


function crearCeldaMaterial(texto) {
    const celda = document.createElement("td");

    celda.textContent = texto ?? "-";

    return celda;
}


function obtenerNombreTallerMaterial(id) {
    const taller = talleresMaterial.find(
        item => Number(item.id) === Number(id)
    );

    return taller?.nombre || "Taller desconocido";
}


function formatearFechaMaterial(fecha) {
    if (!fecha) {
        return "-";
    }

    const valor = String(fecha).slice(0, 10);

    const partes = valor.split("-");

    if (partes.length !== 3) {
        return valor;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}


// ======================================
// NUEVO MATERIAL O TAREA
// ======================================

function abrirModalNuevoMaterial() {
    const formulario = document.getElementById(
        "form-nuevo-material"
    );

    formulario?.reset();

    ocultarAlertaNuevoMaterial();

    const filtroTaller = document.getElementById(
        "filtro-taller-material"
    );

    const selectorNuevo = document.getElementById(
        "nuevo-material-taller"
    );

    // Preseleccionar el taller filtrado,
    // solamente si está activo.
    if (filtroTaller?.value && selectorNuevo) {
        const existeOpcion = Array.from(
            selectorNuevo.options
        ).some(
            opcion =>
                opcion.value === filtroTaller.value
        );

        if (existeOpcion) {
            selectorNuevo.value = filtroTaller.value;
        }
    }

    actualizarVisibilidadFechaMaterial();

    const modalElemento = document.getElementById(
        "modal-nuevo-material"
    );

    bootstrap.Modal.getOrCreateInstance(
        modalElemento
    ).show();
}


function actualizarVisibilidadFechaMaterial() {
    const tipo = document.getElementById(
        "nuevo-material-tipo"
    )?.value;

    const contenedor = document.getElementById(
        "contenedor-fecha-limite"
    );

    const fechaLimite = document.getElementById(
        "nuevo-material-fecha-limite"
    );

    if (contenedor) {
        contenedor.style.display =
            tipo === "Tarea" ? "" : "none";
    }

    if (fechaLimite) {
        fechaLimite.required = tipo === "Tarea";

        if (tipo !== "Tarea") {
            fechaLimite.value = "";
        }
    }
}


// ======================================
// GUARDAR EN MYSQL
// ======================================

async function guardarNuevoMaterialAPI() {
    if (guardandoMaterial) {
        return;
    }

    const tallerId = Number(
        document.getElementById(
            "nuevo-material-taller"
        )?.value
    );

    const tipo = document.getElementById(
        "nuevo-material-tipo"
    )?.value;

    const titulo = document.getElementById(
        "nuevo-material-titulo"
    )?.value.trim() ?? "";

    const descripcion = document.getElementById(
        "nuevo-material-descripcion"
    )?.value.trim() ?? "";

    const fechaLimite = document.getElementById(
        "nuevo-material-fecha-limite"
    )?.value ?? "";

    const taller = talleresMaterial.find(
        item => Number(item.id) === tallerId
    );

    if (!taller || taller.estado !== "Activo") {
        mostrarAlertaNuevoMaterial(
            "Seleccioná un taller activo y asignado a tu usuario."
        );
        return;
    }

    if (!["Material", "Tarea"].includes(tipo)) {
        mostrarAlertaNuevoMaterial(
            "Seleccioná un tipo válido."
        );
        return;
    }

    if (!titulo || titulo.length > 150) {
        mostrarAlertaNuevoMaterial(
            "El título es obligatorio y no debe superar " +
            "los 150 caracteres."
        );
        return;
    }

    if (!descripcion) {
        mostrarAlertaNuevoMaterial(
            "La descripción es obligatoria."
        );
        return;
    }

    if (tipo === "Tarea" && !fechaLimite) {
        mostrarAlertaNuevoMaterial(
            "Seleccioná la fecha límite de la tarea."
        );
        return;
    }

    const datos = {
        tipo: tipo,
        titulo: titulo,
        descripcion: descripcion,
        fecha_limite:
            tipo === "Tarea" ? fechaLimite : null
    };

    const boton = document.getElementById(
        "btn-guardar-nuevo-material"
    );

    guardandoMaterial = true;

    if (boton) {
        boton.disabled = true;
        boton.textContent = "Guardando...";
    }

    try {
        await solicitarMaterialAPI(
            `/talleres/${tallerId}/contenidos`,
            "POST",
            datos
        );

        const modalElemento = document.getElementById(
            "modal-nuevo-material"
        );

        bootstrap.Modal.getOrCreateInstance(
            modalElemento
        ).hide();

        mostrarAlertaMaterial(
            "Contenido publicado correctamente en MySQL.",
            "success"
        );

        // Volver a consultar para mostrar
        // exactamente lo guardado en la API.
        try {
            await cargarContenidosMaterial();
        } catch (errorRecarga) {
            console.error(
                "Error al recargar contenidos:",
                errorRecarga
            );

            mostrarAlertaMaterial(
                "El contenido fue creado, pero no se pudo " +
                "actualizar la lista. Recargá la página.",
                "warning"
            );
        }

    } catch (error) {
        console.error(
            "Error al publicar contenido:",
            error
        );

        mostrarAlertaNuevoMaterial(
            "No se pudo publicar el contenido. " +
            error.message
        );

    } finally {
        guardandoMaterial = false;

        if (boton) {
            boton.disabled = false;
            boton.textContent = "Guardar";
        }
    }
}


// ======================================
// ELIMINAR CONTENIDO
// ======================================

async function eliminarContenidoAPI(contenido) {
    const taller = talleresMaterial.find(
        item =>
            Number(item.id) ===
            Number(contenido.taller_id)
    );

    if (!taller || taller.estado !== "Activo") {
        mostrarAlertaMaterial(
            "No se puede eliminar contenido " +
            "de un taller finalizado.",
            "warning"
        );
        return;
    }

    const confirmar = window.confirm(
        `¿Querés eliminar "${contenido.titulo}"? ` +
        "Esta acción puede afectar sus entregas asociadas."
    );

    if (!confirmar) {
        return;
    }

    try {
        await solicitarMaterialAPI(
            `/contenidos/${Number(contenido.id)}`,
            "DELETE"
        );

        await cargarContenidosMaterial();

        mostrarAlertaMaterial(
            "Contenido eliminado correctamente.",
            "success"
        );

    } catch (error) {
        console.error(
            "Error al eliminar contenido:",
            error
        );

        mostrarAlertaMaterial(
            "No se pudo eliminar el contenido. " +
            error.message,
            "danger"
        );
    }
}


// ======================================
// NAVEGACIÓN
// ======================================

function configurarEnlaceVolverMaterial(tallerId) {
    const enlace = document.getElementById(
        "enlace-volver-material"
    );

    if (!enlace) {
        return;
    }

    if (tallerId) {
        enlace.href =
            `detalle-taller.html?id=${encodeURIComponent(
                tallerId
            )}`;
    } else {
        enlace.href = "dashboard.html";
    }
}


// ======================================
// ERRORES Y MENSAJES
// ======================================

function mostrarAlertaMaterial(mensaje, tipo) {
    const alerta = document.getElementById(
        "alerta-material"
    );

    if (!alerta) {
        return;
    }

    alerta.className = `alert alert-${tipo}`;
    alerta.textContent = mensaje;
}


function ocultarAlertaMaterial() {
    const alerta = document.getElementById(
        "alerta-material"
    );

    if (!alerta) {
        return;
    }

    alerta.textContent = "";
    alerta.className = "alert d-none";
}


function mostrarAlertaNuevoMaterial(mensaje) {
    const alerta = document.getElementById(
        "alerta-nuevo-material"
    );

    if (!alerta) {
        return;
    }

    alerta.textContent = mensaje;
    alerta.classList.remove("d-none");
}


function ocultarAlertaNuevoMaterial() {
    const alerta = document.getElementById(
        "alerta-nuevo-material"
    );

    if (!alerta) {
        return;
    }

    alerta.textContent = "";
    alerta.classList.add("d-none");
}


function desactivarAccionesMaterial() {
    const boton = document.getElementById(
        "btn-nuevo-material"
    );

    if (boton) {
        boton.disabled = true;
    }
}


function colocarTextoMaterial(id, valor) {
    const elemento = document.getElementById(id);

    if (elemento) {
        elemento.textContent = valor ?? "-";
    }
}
