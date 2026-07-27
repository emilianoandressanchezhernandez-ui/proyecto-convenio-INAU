/*
    DETALLE-INFORME.JS
    Responsabilidades:
    - Obtener el ID del informe desde la URL.
    - Buscar el informe seleccionado.
    - Verificar que pertenezca al tallerista actual.
    - Mostrar toda la información en pantalla.
    - Configurar el enlace para volver.
    - Permitir imprimir y descargar el informe.
*/

// VARIABLES 

let informeActual = null;
let tallerDelInforme = null;
let talleristaDelInforme = null;


// INICIALIZACIÓN

function inicializarDetalleInforme() {
    try {
        validarDatosDetalleInforme();

        const informeId =
            obtenerInformeIdDesdeURL();

        informeActual =
            buscarInformePorId(informeId);

        tallerDelInforme =
            buscarTallerDelInforme(
                informeActual.tallerId
            );

        talleristaDelInforme =
            obtenerTalleristaActual();

        validarAccesoAlInforme();

        mostrarDetalleInforme();
        configurarEnlaceVolver();
        configurarAccionesInforme();

    } catch (error) {
        console.error(
            "Error al cargar el detalle del informe:",
            error
        );

        mostrarAlertaDetalleInforme(
            error.message,
            "danger"
        );

        deshabilitarAccionesInforme();
    }
}

// VALIDACIÓN DE DATOS

function validarDatosDetalleInforme() {
    if (!window.DATOS_SIMULADOS) {
        throw new Error(
            "No se pudieron cargar los datos simulados."
        );
    }

    if (!window.DATOS_SIMULADOS.usuarioActual) {
        throw new Error(
            "No se encontró el usuario actual."
        );
    }

    if (!Array.isArray(window.DATOS_SIMULADOS.informes)) {
        throw new Error(
            "La lista de informes no está disponible."
        );
    }

    if (!Array.isArray(window.DATOS_SIMULADOS.talleres)) {
        throw new Error(
            "La lista de talleres no está disponible."
        );
    }
}


// OBTENER ID DE LA URL

function obtenerInformeIdDesdeURL() {
    /*
        Lee el parámetro id de una URL como:
        detalle-informe.html?id=2
    */

    const parametrosURL = new URLSearchParams(
        window.location.search
    );

    const idRecibido = parametrosURL.get("id");

    if (!idRecibido) {
        throw new Error(
            "No se indicó qué informe debe mostrarse."
        );
    }

    const informeId = Number(idRecibido);

    if (
        !Number.isInteger(informeId) ||
        informeId <= 0
    ) {
        throw new Error(
            "El identificador del informe no es válido."
        );
    }

    return informeId;
}


// BÚSQUEDA DE INFORMACIÓN

function buscarInformePorId(informeId) {
    // find() devuelve el primer informe cuyo ID coincide con el recibido 

    const informeEncontrado =
        window.DATOS_SIMULADOS.informes.find(
            (informe) => {
                return informe.id === informeId;
            }
        );

    if (!informeEncontrado) {
        throw new Error(
            "El informe solicitado no existe."
        );
    }

    return informeEncontrado;
}

function buscarTallerDelInforme(tallerId) {
    const tallerEncontrado =
        window.DATOS_SIMULADOS.talleres.find(
            (taller) => {
                return taller.id === tallerId;
            }
        );

    if (!tallerEncontrado) {
        throw new Error(
            "No se encontró el taller relacionado con el informe."
        );
    }

    return tallerEncontrado;
}


function obtenerTalleristaActual() {
    return window.DATOS_SIMULADOS.usuarioActual;
}

// CONTROL DE ACCESO

function validarAccesoAlInforme() {
    /*
        El tallerista solo puede visualizar informes que le pertenezcan.
        Esta validación es únicamente visual por ahora.
        En el backend deberá repetirse obligatoriamente.
    */

    if (
        informeActual.talleristaId !==
        talleristaDelInforme.id
    ) {
        throw new Error(
            "No tienes permiso para visualizar este informe."
        );
    }

    if (
        tallerDelInforme.talleristaId !==
        talleristaDelInforme.id
    ) {
        throw new Error(
            "Este taller no está asignado al usuario actual."
        );
    }
}

// MOSTRAR INFORMACIÓN 

function mostrarDetalleInforme() {
    colocarTextoDetalleInforme(
        "titulo-informe",
        informeActual.titulo
    );

    colocarTextoDetalleInforme(
        "descripcion-informe",
        informeActual.descripcion
    );

    colocarTextoDetalleInforme(
        "nombre-taller",
        tallerDelInforme.nombre
    );

    colocarTextoDetalleInforme(
        "tipo-informe",
        informeActual.tipo
    );

    colocarTextoDetalleInforme(
        "fecha-informe",
        formatearFechaInforme(
            informeActual.fecha
        )
    );

    colocarTextoDetalleInforme(
        "estado-informe",
        informeActual.estado
    );

    colocarTextoDetalleInforme(
        "nombre-tallerista",
        obtenerNombreCompletoTallerista()
    );

    colocarTextoDetalleInforme(
        "ultima-actualizacion",
        formatearFechaHoraInforme(
            informeActual.ultimaActualizacion
        )
    );

    colocarTextoDetalleInforme(
        "cantidad-alumnos-informe",
        informeActual.cantidadAlumnos
    );

    colocarTextoDetalleInforme(
        "porcentaje-asistencia",
        `${informeActual.porcentajeAsistencia}%`
    );

    colocarTextoDetalleInforme(
        "indicador-general",
        informeActual.indicadorGeneral
    );

    colocarTextoDetalleInforme(
        "observaciones-informe",
        informeActual.observaciones
    );

    colocarTextoDetalleInforme(
        "resumen-informe",
        informeActual.resumen
    );

    aplicarEstiloEstadoInforme(
        informeActual.estado
    );

    aplicarEstiloIndicadorGeneral(
        informeActual.indicadorGeneral
    );

    document.title =
        `INAU - ${informeActual.titulo}`;
}

// NAVEGACIÓN

function configurarEnlaceVolver() {
    const enlaceVolver = document.getElementById(
        "enlace-volver-informes"
    );

    if (!enlaceVolver) {
        return;
    }

    // Regresamos al listado filtrado por el mismo taller

    enlaceVolver.href =
        `informes.html?tallerId=${encodeURIComponent(tallerDelInforme.id)}`;
}

// ACCIONES

function configurarAccionesInforme() {
    const botonDescargar = document.getElementById(
        "btn-descargar"
    );

    const botonImprimir = document.getElementById(
        "btn-imprimir"
    );

    botonDescargar?.addEventListener(
        "click",
        descargarInforme
    );

    botonImprimir?.addEventListener(
        "click",
        imprimirInforme
    );
}

function imprimirInforme() {
    /*
        Abre la ventana de impresión del navegador.
        Desde allí también puede guardarse como PDF, dependiendo del navegador y el sistema operativo.
    */
    window.print();
}

function descargarInforme() {
    /*
        Como todavía no tenemos backend ni una librería para generar PDF, creamos temporalmente un archivo de texto con la información del informe.
        Más adelante esta función deberá solicitar el PDF generado por PHP.
    */

    const contenidoInforme =
        generarContenidoDescargable();

    const archivo = new Blob(
        [contenidoInforme],
        {
            type: "text/plain;charset=utf-8"
        }
    );

    const urlTemporal =
        URL.createObjectURL(archivo);

    const enlaceDescarga =
        document.createElement("a");

    enlaceDescarga.href = urlTemporal;

    enlaceDescarga.download =
        crearNombreArchivoInforme();

    document.body.appendChild(
        enlaceDescarga
    );

    enlaceDescarga.click();
    enlaceDescarga.remove();

    URL.revokeObjectURL(
        urlTemporal
    );

    mostrarAlertaDetalleInforme(
        "El informe se descargó correctamente.",
        "success"
    );
}

function generarContenidoDescargable() {
    return [
        "SISTEMA DE GESTIÓN DE TALLERES INAU",
        "====================================",
        "",
        `INFORME: ${informeActual.titulo}`,
        `TIPO: ${informeActual.tipo}`,
        `TALLER: ${tallerDelInforme.nombre}`,
        `TALLERISTA: ${obtenerNombreCompletoTallerista()}`,
        `FECHA: ${formatearFechaInforme(informeActual.fecha)}`,
        `ESTADO: ${informeActual.estado}`,
        "",
        "ESTADÍSTICAS",
        "------------",
        `Cantidad de alumnos: ${informeActual.cantidadAlumnos}`,
        `Asistencia: ${informeActual.porcentajeAsistencia}%`,
        `Indicador general: ${informeActual.indicadorGeneral}`,
        "",
        "OBSERVACIONES",
        "-------------",
        informeActual.observaciones,
        "",
        "RESUMEN",
        "-------",
        informeActual.resumen,
        "",
        `Última actualización: ${formatearFechaHoraInforme(informeActual.ultimaActualizacion)}`
    ].join("\n");
}

function crearNombreArchivoInforme() {
    // Reemplaza caracteres especiales y espacios para obtener un nombre de archivo válido

    const nombreLimpio = informeActual.titulo
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .toLowerCase();

    return `${nombreLimpio}.txt`;
}

function deshabilitarAccionesInforme() {
    const botonDescargar = document.getElementById(
        "btn-descargar"
    );

    const botonImprimir = document.getElementById(
        "btn-imprimir"
    );

    if (botonDescargar) {
        botonDescargar.disabled = true;
    }

    if (botonImprimir) {
        botonImprimir.disabled = true;
    }
}

// ESTILOS DINÁMICOS 

function aplicarEstiloEstadoInforme(estado) {
    const elementoEstado = document.getElementById(
        "estado-informe"
    );

    if (!elementoEstado) {
        return;
    }

    elementoEstado.classList.add(
        "badge"
    );

    elementoEstado.classList.remove(
        "text-bg-success",
        "text-bg-info",
        "text-bg-warning",
        "text-bg-secondary",
        "text-bg-danger"
    );

    const clasesEstado = {
        Finalizado: "text-bg-success",
        "En revisión": "text-bg-info",
        Pendiente: "text-bg-warning",
        Borrador: "text-bg-secondary",
        Rechazado: "text-bg-danger"
    };

    elementoEstado.classList.add(
        clasesEstado[estado] ||
        "text-bg-secondary"
    );
}

function aplicarEstiloIndicadorGeneral(indicador) {
    const elementoIndicador = document.getElementById(
        "indicador-general"
    );

    if (!elementoIndicador) {
        return;
    }

    elementoIndicador.classList.remove(
        "text-success",
        "text-primary",
        "text-warning",
        "text-danger",
        "text-secondary"
    );

    const clasesIndicador = {
        Excelente: "text-success",
        "Muy bueno": "text-primary",
        Bueno: "text-primary",
        Regular: "text-warning",
        Insuficiente: "text-danger"
    };

    elementoIndicador.classList.add(
        clasesIndicador[indicador] ||
        "text-secondary"
    );
}

// FORMATO 

function obtenerNombreCompletoTallerista() {
    const nombreCompleto = [
        talleristaDelInforme.nombre,
        talleristaDelInforme.apellido
    ]
        .filter(Boolean)
        .join(" ");

    return nombreCompleto || "Sin información";
}

function formatearFechaInforme(fechaISO) {
    if (!fechaISO) {
        return "Sin información";
    }

    const partes = fechaISO.split("-");

    if (partes.length !== 3) {
        return fechaISO;
    }

    const [anio, mes, dia] = partes;

    return `${dia}/${mes}/${anio}`;
}

function formatearFechaHoraInforme(fechaHoraISO) {
    if (!fechaHoraISO) {
        return "Sin información";
    }

    const fecha = new Date(fechaHoraISO);

    if (Number.isNaN(fecha.getTime())) {
        return "Sin información";
    }

    return fecha.toLocaleString(
        "es-UY",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}

// FUNCIÓN AUXILIAR

function colocarTextoDetalleInforme(
    elementoId,
    contenido
) {
    const elemento = document.getElementById(
        elementoId
    );

    if (!elemento) {
        console.warn(
            `No se encontró el elemento con ID: ${elementoId}`
        );

        return;
    }

    elemento.textContent =
        contenido ?? "-";
}

// ALERTAS

function mostrarAlertaDetalleInforme(
    mensaje,
    tipo = "danger"
) {
    const alerta = document.getElementById(
        "alerta-detalle-informe"
    );

    if (!alerta) {
        return;
    }

    alerta.classList.remove(
        "d-none",
        "alert-success",
        "alert-danger",
        "alert-warning",
        "alert-info"
    );

    alerta.classList.add(
        `alert-${tipo}`
    );

    alerta.textContent = mensaje;
}