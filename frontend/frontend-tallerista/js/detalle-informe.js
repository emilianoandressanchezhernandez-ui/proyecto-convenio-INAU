
/*
    DETALLE-INFORME.JS - FRONTEND TALLERISTA

    Consulta reportes reales desde PHP y MySQL.

    GET /mis-reportes/{id}

    Funcionalidades:
    - Mostrar información del reporte.
    - Mostrar estadísticas reales de asistencia.
    - Mostrar desglose de los registros.
    - Descargar el reporte como JSON.
    - Imprimir el reporte.
    - Respetar los permisos del backend.

    No utiliza DATOS_SIMULADOS.
*/

// ========================================
// VARIABLES
// ========================================

let informeActual = null;


// ========================================
// INICIALIZACIÓN
// ========================================

async function inicializarDetalleInforme() {
    deshabilitarAccionesInforme();
    configurarAccionesInforme();

    mostrarAlertaDetalleInforme(
        "Cargando informe desde la base de datos...",
        "info"
    );

    try {
        const informeId = obtenerInformeIdDesdeURL();

        informeActual = await solicitarDetalleInformeAPI(
            `/mis-reportes/${informeId}`
        );

        if (
            !informeActual ||
            typeof informeActual !== "object"
        ) {
            throw new Error(
                "La API no devolvió un informe válido."
            );
        }

        mostrarDetalleInforme();
        configurarEnlaceVolver();

        habilitarAccionesInforme();
        ocultarAlertaDetalleInforme();

    } catch (error) {
        console.error(
            "Error al cargar el informe:",
            error
        );

        informeActual = null;

        mostrarAlertaDetalleInforme(
            "No se pudo cargar el informe. " +
            error.message,
            "danger"
        );

        deshabilitarAccionesInforme();
    }
}


// ========================================
// CONSULTAR API
// ========================================

async function solicitarDetalleInformeAPI(ruta) {
    const respuesta = await fetch(
        `${TALLERISTA_API_URL}${ruta}`,
        {
            method: "GET",
            credentials: "include",
            headers: {
                Accept: "application/json"
            }
        }
    );

    let resultado;

    try {
        resultado = await respuesta.json();
    } catch {
        throw new Error(
            "La API devolvió una respuesta JSON inválida."
        );
    }

    if (!respuesta.ok || resultado.ok === false) {
        throw new Error(
            resultado.mensaje ||
            `Error HTTP ${respuesta.status}`
        );
    }

    return resultado.datos;
}


// ========================================
// ID DE LA URL
// ========================================

function obtenerInformeIdDesdeURL() {
    const parametros = new URLSearchParams(
        window.location.search
    );

    const valor = parametros.get("id");

    if (!valor || !/^[1-9]\d*$/.test(valor)) {
        throw new Error(
            "No se indicó un identificador de informe válido."
        );
    }

    const id = Number(valor);

    if (!Number.isSafeInteger(id)) {
        throw new Error(
            "El identificador del informe no es válido."
        );
    }

    return id;
}


// ========================================
// MOSTRAR INFORMACIÓN
// ========================================

function mostrarDetalleInforme() {
    const reporte = informeActual;

    const contenido = obtenerContenidoInforme();

    const nombreTaller =
        reporte.taller_nombre ||
        contenido.tallerNombre ||
        "No corresponde a un taller";

    // Cabecera
    colocarTextoDetalleInforme(
        "titulo-informe",
        reporte.nombre || "Informe sin nombre"
    );

    colocarTextoDetalleInforme(
        "descripcion-informe",
        `Reporte de tipo ${reporte.tipo || "no especificado"} ` +
        `generado por el sistema INAU.`
    );

    // Información general
    colocarTextoDetalleInforme(
        "nombre-taller",
        nombreTaller
    );

    colocarTextoDetalleInforme(
        "tipo-informe",
        reporte.tipo || "-"
    );

    colocarTextoDetalleInforme(
        "fecha-informe",
        formatearFechaHoraInforme(
            reporte.fecha_generacion
        )
    );

    colocarTextoDetalleInforme(
        "estado-informe",
        reporte.estado || "-"
    );

    // Responsable
    // El backend devuelve generado_por (ID del usuario),
    // pero no su nombre.
    colocarTextoDetalleInforme(
        "nombre-tallerista",
        reporte.generado_por != null
            ? `Usuario #${reporte.generado_por}`
            : "No disponible"
    );

    colocarTextoDetalleInforme(
        "ultima-actualizacion",
        formatearFechaHoraInforme(
            reporte.fecha_generacion
        )
    );

    // Estadísticas
    if (reporte.tipo === "Asistencia") {
        mostrarEstadisticasAsistencia(contenido);
    } else {
        mostrarEstadisticasGenerales(contenido);
    }

    // Observaciones
    colocarTextoDetalleInforme(
        "observaciones-informe",
        contenido.observaciones ||
        "Este reporte no incluye observaciones."
    );

    // Resumen
    mostrarResumenInforme(contenido);

    aplicarEstiloEstadoInforme(
        reporte.estado
    );

    document.title =
        `INAU - ${reporte.nombre || "Detalle del Informe"}`;
}


// ========================================
// CONTENIDO DEL REPORTE
// ========================================

function obtenerContenidoInforme() {
    if (!informeActual) {
        return {};
    }

    const contenido = informeActual.contenido;

    // Normalmente ReporteRepository convierte
    // el JSON de MySQL en un objeto PHP/JSON.
    if (
        contenido !== null &&
        typeof contenido === "object" &&
        !Array.isArray(contenido)
    ) {
        return contenido;
    }

    // Compatibilidad si llegase como JSON de texto.
    if (typeof contenido === "string") {
        try {
            const datos = JSON.parse(contenido);

            if (
                datos &&
                typeof datos === "object" &&
                !Array.isArray(datos)
            ) {
                return datos;
            }
        } catch {
            console.warn(
                "No se pudo interpretar el contenido del reporte."
            );
        }
    }

    return {};
}


// ========================================
// ESTADÍSTICAS DE ASISTENCIA
// ========================================

function mostrarEstadisticasAsistencia(contenido) {
    colocarTextoDetalleInforme(
        "cantidad-alumnos-informe",
        mostrarNumeroInforme(contenido.totalClases)
    );

    const promedio = contenido.asistenciaPromedio;

    colocarTextoDetalleInforme(
        "porcentaje-asistencia",
        promedio !== null &&
            promedio !== undefined
            ? `${promedio}%`
            : "Sin datos"
    );

    colocarTextoDetalleInforme(
        "indicador-general",
        mostrarNumeroInforme(
            contenido.asistenciasRegistradas
        )
    );
}


// ========================================
// ESTADÍSTICAS GENERALES
// ========================================

function mostrarEstadisticasGenerales(contenido) {
    // En esta vista un reporte general puede
    // mostrar otras métricas, si el backend
    // lo permite al usuario autenticado.

    colocarTextoDetalleInforme(
        "cantidad-alumnos-informe",
        mostrarNumeroInforme(
            contenido.totalClases
        )
    );

    const promedio = contenido.asistenciaPromedio;

    colocarTextoDetalleInforme(
        "porcentaje-asistencia",
        promedio !== null &&
            promedio !== undefined
            ? `${promedio}%`
            : "Sin datos"
    );

    colocarTextoDetalleInforme(
        "indicador-general",
        mostrarNumeroInforme(
            contenido.asistenciasRegistradas
        )
    );
}


// ========================================
// RESUMEN DEL REPORTE
// ========================================

function mostrarResumenInforme(contenido) {
    const resumen = document.getElementById(
        "resumen-informe"
    );

    if (!resumen) {
        return;
    }

    // Limpiar cualquier resumen anterior.
    resumen.textContent = "";

    if (informeActual.tipo !== "Asistencia") {
        const datos = Object.entries(contenido);

        if (datos.length === 0) {
            resumen.textContent =
                "Este reporte no contiene estadísticas adicionales.";
            return;
        }

        const lista = document.createElement("ul");
        lista.className = "mb-0";

        datos.forEach(([clave, valor]) => {
            const item = document.createElement("li");

            item.textContent =
                `${clave}: ${valor ?? "Sin datos"}`;

            lista.appendChild(item);
        });

        resumen.appendChild(lista);
        return;
    }

    const descripcion = document.createElement("p");

    descripcion.textContent =
        "Resumen de asistencia registrado en MySQL " +
        "al momento de generar este informe.";

    resumen.appendChild(descripcion);

    const datos = [
        ["Taller", contenido.tallerNombre],
        ["Total de clases", contenido.totalClases],
        [
            "Registros de asistencia",
            contenido.asistenciasRegistradas
        ],
        ["Presentes", contenido.presentes],
        ["Ausentes", contenido.ausentes],
        ["Justificados", contenido.justificados],
        ["Tardanzas", contenido.tardanzas],
        [
            "Asistencia promedio",
            contenido.asistenciaPromedio != null
                ? `${contenido.asistenciaPromedio}%`
                : "Sin datos"
        ]
    ];

    const lista = document.createElement("ul");
    lista.className = "mb-0";

    datos.forEach(([etiqueta, valor]) => {
        const item = document.createElement("li");

        const fuerte = document.createElement("strong");
        fuerte.textContent = `${etiqueta}: `;

        const texto = document.createTextNode(
            String(valor ?? "Sin información")
        );

        item.appendChild(fuerte);
        item.appendChild(texto);

        lista.appendChild(item);
    });

    resumen.appendChild(lista);
}


// ========================================
// NAVEGACIÓN
// ========================================

function configurarEnlaceVolver() {
    const enlace = document.getElementById(
        "enlace-volver-informes"
    );

    if (!enlace || !informeActual) {
        return;
    }

    const tallerId = Number(
        informeActual.taller_id
    );

    enlace.href =
        Number.isInteger(tallerId) && tallerId > 0
            ? `informes.html?tallerId=${tallerId}`
            : "informes.html";
}


// ========================================
// ACCIONES
// ========================================

function configurarAccionesInforme() {
    const botonDescargar = document.getElementById(
        "btn-descargar"
    );

    const botonImprimir = document.getElementById(
        "btn-imprimir"
    );

    if (botonDescargar) {
        botonDescargar.onclick = descargarInforme;
    }

    if (botonImprimir) {
        botonImprimir.onclick = imprimirInforme;
    }
}


function imprimirInforme() {
    if (!informeActual) {
        return;
    }

    window.print();
}


// ========================================
// DESCARGAR REPORTE REAL
// ========================================

function descargarInforme() {
    if (!informeActual) {
        return;
    }

    try {
        const datos = {
            id: informeActual.id,
            nombre: informeActual.nombre,
            tipo: informeActual.tipo,
            taller_id: informeActual.taller_id,
            taller_nombre: informeActual.taller_nombre,
            fecha_inicio: informeActual.fecha_inicio,
            fecha_fin: informeActual.fecha_fin,
            fecha_generacion: informeActual.fecha_generacion,
            generado_por: informeActual.generado_por,
            estado: informeActual.estado,
            formato: informeActual.formato,
            contenido: obtenerContenidoInforme()
        };

        const json = JSON.stringify(
            datos,
            null,
            2
        );

        const archivo = new Blob(
            [json],
            {
                type: "application/json;charset=utf-8"
            }
        );

        const url = URL.createObjectURL(archivo);

        const enlace = document.createElement("a");

        enlace.href = url;
        enlace.download = crearNombreArchivoInforme();

        document.body.appendChild(enlace);
        enlace.click();
        enlace.remove();

        // Liberar el recurso temporal tras iniciar
        // la descarga.
        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 1000);

        mostrarAlertaDetalleInforme(
            "El informe se preparó para descargar en formato JSON.",
            "success"
        );

    } catch (error) {
        console.error(
            "Error al descargar el informe:",
            error
        );

        mostrarAlertaDetalleInforme(
            "No se pudo descargar el informe.",
            "danger"
        );
    }
}


function crearNombreArchivoInforme() {
    const nombre = String(
        informeActual.nombre || "informe"
    )
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .toLowerCase();

    return `${nombre}-${informeActual.id}.json`;
}


// ========================================
// HABILITAR / DESHABILITAR BOTONES
// ========================================

function deshabilitarAccionesInforme() {
    const descargar = document.getElementById(
        "btn-descargar"
    );

    const imprimir = document.getElementById(
        "btn-imprimir"
    );

    if (descargar) {
        descargar.disabled = true;
    }

    if (imprimir) {
        imprimir.disabled = true;
    }
}


function habilitarAccionesInforme() {
    const descargar = document.getElementById(
        "btn-descargar"
    );

    const imprimir = document.getElementById(
        "btn-imprimir"
    );

    if (descargar) {
        descargar.disabled = false;
    }

    if (imprimir) {
        imprimir.disabled = false;
    }
}


// ========================================
// ESTADO
// ========================================

function aplicarEstiloEstadoInforme(estado) {
    const elemento = document.getElementById(
        "estado-informe"
    );

    if (!elemento) {
        return;
    }

    elemento.className = "badge";

    const clases = {
        Generado: "text-bg-success",
        Finalizado: "text-bg-success",
        "En revisión": "text-bg-info",
        Pendiente: "text-bg-warning",
        Borrador: "text-bg-secondary",
        Rechazado: "text-bg-danger"
    };

    elemento.classList.add(
        clases[estado] || "text-bg-secondary"
    );
}


// ========================================
// FORMATO DE DATOS
// ========================================

function mostrarNumeroInforme(valor) {
    if (
        valor === null ||
        valor === undefined ||
        valor === ""
    ) {
        return "Sin datos";
    }

    const numero = Number(valor);

    return Number.isFinite(numero)
        ? numero.toLocaleString("es-UY")
        : String(valor);
}


function formatearFechaHoraInforme(valor) {
    if (!valor) {
        return "Sin información";
    }

    const texto = String(valor);
    const fecha = texto.slice(0, 10);
    const partes = fecha.split("-");

    if (partes.length !== 3) {
        return texto;
    }

    const fechaFormateada =
        `${partes[2]}/${partes[1]}/${partes[0]}`;

    const hora = texto.length >= 16
        ? texto.slice(11, 16)
        : "";

    return hora
        ? `${fechaFormateada} ${hora}`
        : fechaFormateada;
}


function colocarTextoDetalleInforme(id, contenido) {
    const elemento = document.getElementById(id);

    if (elemento) {
        elemento.textContent = contenido ?? "-";
    }
}


// ========================================
// ALERTAS
// ========================================

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

    alerta.className = `alert alert-${tipo}`;
    alerta.textContent = mensaje;
}


function ocultarAlertaDetalleInforme() {
    const alerta = document.getElementById(
        "alerta-detalle-informe"
    );

    if (!alerta) {
        return;
    }

    alerta.className = "alert d-none";
    alerta.textContent = "";
}
