
/*
    DETALLE-REPORTE.JS - FRONTEND ADMIN

    Integración real con MySQL mediante la API.

    - Consulta GET /reportes/{id}
    - Muestra el contenido histórico guardado
    - Adapta las estadísticas según el tipo
    - Permite exportar JSON e imprimir

    No utiliza datos simulados ni localStorage.
*/

let reporteActual = null;

const DETALLE_REPORTE_API =
    "http://localhost:8002";


// ======================================
// INICIALIZACIÓN
// ======================================

async function inicializarDetalleReporte() {
    configurarAccionesDetalleReporte();

    const parametros = new URLSearchParams(
        window.location.search
    );

    const id = parametros.get("id");

    if (
        !id ||
        !/^[1-9]\d*$/.test(id)
    ) {
        mostrarErrorDetalleReporte(
            "No se especificó un ID de reporte válido."
        );
        return;
    }

    try {
        const respuesta = await fetch(
            `${DETALLE_REPORTE_API}/reportes/${id}`,
            {
                method: "GET",
                credentials: "include"
            }
        );

        const resultado = await respuesta.json();

        if (!respuesta.ok || resultado.ok === false) {
            throw new Error(
                resultado.mensaje ||
                "No se pudo cargar el reporte."
            );
        }

        if (!resultado.datos) {
            throw new Error(
                "La API no devolvió información del reporte."
            );
        }

        reporteActual = resultado.datos;

        mostrarDatosReporte(reporteActual);
        mostrarContenidoReporte(reporteActual);

        document.getElementById("btn-exportar").disabled = false;
        document.getElementById("btn-imprimir").disabled = false;

    } catch (error) {
        console.error(
            "Error al cargar el detalle del reporte:",
            error
        );

        mostrarErrorDetalleReporte(error.message);
    }
}


// ======================================
// ERRORES
// ======================================

function mostrarErrorDetalleReporte(mensaje) {
    const alerta = document.getElementById(
        "alerta-detalle-reporte"
    );

    if (alerta) {
        alerta.textContent = mensaje;
        alerta.classList.remove("d-none");
    }

    const botonExportar = document.getElementById(
        "btn-exportar"
    );

    const botonImprimir = document.getElementById(
        "btn-imprimir"
    );

    if (botonExportar) {
        botonExportar.disabled = true;
    }

    if (botonImprimir) {
        botonImprimir.disabled = true;
    }
}


// ======================================
// DATOS GENERALES DEL REPORTE
// ======================================

function mostrarDatosReporte(reporte) {
    colocarTextoDetalleReporte(
        "nombre-reporte",
        reporte.nombre
    );

    colocarTextoDetalleReporte(
        "reporte-nombre",
        reporte.nombre
    );

    colocarTextoDetalleReporte(
        "reporte-tipo",
        reporte.tipo
    );

    colocarTextoDetalleReporte(
        "fecha-generacion",
        formatearFechaHoraDetalleReporte(
            reporte.fecha_generacion
        )
    );

    colocarTextoDetalleReporte(
        "periodo",
        obtenerPeriodoDetalleReporte(reporte)
    );

    colocarTextoDetalleReporte(
        "estado",
        reporte.estado
    );
}


function obtenerPeriodoDetalleReporte(reporte) {
    const inicio = reporte.fecha_inicio;
    const fin = reporte.fecha_fin;

    if (inicio && fin) {
        return (
            formatearFechaDetalleReporte(inicio) +
            " al " +
            formatearFechaDetalleReporte(fin)
        );
    }

    if (inicio) {
        return (
            "Desde " +
            formatearFechaDetalleReporte(inicio)
        );
    }

    if (fin) {
        return (
            "Hasta " +
            formatearFechaDetalleReporte(fin)
        );
    }

    return "Sin período específico";
}


// ======================================
// CONTENIDO SEGÚN TIPO
// ======================================

function mostrarContenidoReporte(reporte) {
    const contenido = reporte.contenido || {};

    if (reporte.tipo === "General") {
        mostrarReporteGeneral(contenido);
        return;
    }

    if (reporte.tipo === "Asistencia") {
        mostrarReporteAsistencia(
            contenido,
            reporte
        );
        return;
    }

    mostrarErrorDetalleReporte(
        "Tipo de reporte no reconocido."
    );
}


// ======================================
// REPORTE GENERAL
// ======================================

function mostrarReporteGeneral(contenido) {
    cambiarEtiquetaTarjetaDetalle(
        "total-talleres",
        "Talleres"
    );

    cambiarEtiquetaTarjetaDetalle(
        "total-alumnos",
        "Alumnos"
    );

    cambiarEtiquetaTarjetaDetalle(
        "promedio-asistencia",
        "Asistencia %"
    );

    cambiarEtiquetaTarjetaDetalle(
        "total-talleristas",
        "Talleristas"
    );

    colocarTextoDetalleReporte(
        "total-talleres",
        mostrarValorDetalle(contenido.totalTalleres)
    );

    colocarTextoDetalleReporte(
        "total-alumnos",
        mostrarValorDetalle(contenido.totalAlumnos)
    );

    colocarTextoDetalleReporte(
        "promedio-asistencia",
        mostrarPorcentajeDetalle(
            contenido.asistenciaPromedio
        )
    );

    colocarTextoDetalleReporte(
        "total-talleristas",
        mostrarValorDetalle(
            contenido.totalTalleristas
        )
    );

    // El reporte general guarda totales,
    // pero no un desglose individual por taller.
    cambiarTituloTablaDetalle(
        "Resumen del Sistema"
    );

    const tabla = document.getElementById(
        "tabla-resumen"
    );

    if (tabla) {
        cambiarColumnasDetalle([
            "Indicador",
            "Valor",
            "Indicador",
            "Valor"
        ]);

        tabla.innerHTML = `
            <tr>
                <td>Total de talleres</td>
                <td>${mostrarValorDetalle(contenido.totalTalleres)}</td>
                <td>Talleres activos</td>
                <td>${mostrarValorDetalle(contenido.talleresActivos)}</td>
            </tr>

            <tr>
                <td>Total de alumnos</td>
                <td>${mostrarValorDetalle(contenido.totalAlumnos)}</td>
                <td>Total de talleristas</td>
                <td>${mostrarValorDetalle(contenido.totalTalleristas)}</td>
            </tr>

            <tr>
                <td>Asistencia promedio</td>
                <td>${mostrarPorcentajeDetalle(contenido.asistenciaPromedio)}</td>
                <td>Tipo de resumen</td>
                <td>General</td>
            </tr>
        `;
    }

    colocarTextoDetalleReporte(
        "observaciones",
        "Este reporte conserva las estadísticas generales " +
        "del sistema correspondientes al momento de su generación. " +
        "No incluye un desglose histórico individual por taller."
    );
}


// ======================================
// REPORTE DE ASISTENCIA
// ======================================

function mostrarReporteAsistencia(
    contenido,
    reporte
) {
    cambiarEtiquetaTarjetaDetalle(
        "total-talleres",
        "Jornadas"
    );

    cambiarEtiquetaTarjetaDetalle(
        "total-alumnos",
        "Registros"
    );

    cambiarEtiquetaTarjetaDetalle(
        "promedio-asistencia",
        "Asistencia %"
    );

    cambiarEtiquetaTarjetaDetalle(
        "total-talleristas",
        "Presentes"
    );

    colocarTextoDetalleReporte(
        "total-talleres",
        mostrarValorDetalle(contenido.totalClases)
    );

    colocarTextoDetalleReporte(
        "total-alumnos",
        mostrarValorDetalle(
            contenido.asistenciasRegistradas
        )
    );

    colocarTextoDetalleReporte(
        "promedio-asistencia",
        mostrarPorcentajeDetalle(
            contenido.asistenciaPromedio
        )
    );

    colocarTextoDetalleReporte(
        "total-talleristas",
        mostrarValorDetalle(contenido.presentes)
    );

    cambiarTituloTablaDetalle(
        "Resumen de Asistencia"
    );

    cambiarColumnasDetalle([
        "Taller",
        "Estado",
        "Cantidad",
        "Porcentaje"
    ]);

    const tabla = document.getElementById(
        "tabla-resumen"
    );

    if (tabla) {
        const tallerNombre =
            contenido.tallerNombre ||
            reporte.taller_nombre ||
            "Taller sin nombre";

        const total = Number(
            contenido.asistenciasRegistradas || 0
        );

        const estados = [
            {
                nombre: "Presente",
                cantidad: Number(
                    contenido.presentes || 0
                )
            },
            {
                nombre: "Ausente",
                cantidad: Number(
                    contenido.ausentes || 0
                )
            },
            {
                nombre: "Justificado",
                cantidad: Number(
                    contenido.justificados || 0
                )
            },
            {
                nombre: "Tardanza",
                cantidad: Number(
                    contenido.tardanzas || 0
                )
            }
        ];

        tabla.innerHTML = estados.map(estado => {
            const porcentaje = total > 0
                ? Math.round(
                    estado.cantidad / total * 100
                )
                : 0;

            return `
                <tr>
                    <td>${escaparHTMLDetalle(tallerNombre)}</td>
                    <td>${escaparHTMLDetalle(estado.nombre)}</td>
                    <td>${estado.cantidad}</td>
                    <td>${porcentaje}%</td>
                </tr>
            `;
        }).join("");
    }

    const jornadas = mostrarValorDetalle(
        contenido.totalClases
    );

    const registros = mostrarValorDetalle(
        contenido.asistenciasRegistradas
    );

    const promedio = mostrarPorcentajeDetalle(
        contenido.asistenciaPromedio
    );

    colocarTextoDetalleReporte(
        "observaciones",
        `El taller registra ${jornadas} jornada(s) y ` +
        `${registros} registro(s) de asistencia. ` +
        `El porcentaje de registros marcados como ` +
        `Presentes es ${promedio}. ` +
        `Los valores corresponden al momento de ` +
        `generación del reporte.`
    );
}


// ======================================
// MODIFICACIONES MÍNIMAS DE LA VISTA
// ======================================

function cambiarEtiquetaTarjetaDetalle(
    idValor,
    textoEtiqueta
) {
    const valor = document.getElementById(idValor);

    if (!valor) {
        return;
    }

    const tarjeta = valor.closest(".card-body");

    if (!tarjeta) {
        return;
    }

    const etiqueta = tarjeta.querySelector("p");

    if (etiqueta) {
        etiqueta.textContent = textoEtiqueta;
    }
}


function cambiarTituloTablaDetalle(titulo) {
    const tabla = document.getElementById(
        "tabla-resumen"
    );

    if (!tabla) {
        return;
    }

    const tarjeta = tabla.closest(".card-body");

    const encabezado = tarjeta?.querySelector("h4");

    if (encabezado) {
        encabezado.textContent = titulo;
    }
}


function cambiarColumnasDetalle(columnas) {
    const tabla = document.getElementById(
        "tabla-resumen"
    );

    const encabezados = tabla
        ?.closest("table")
        ?.querySelectorAll("thead th");

    if (!encabezados) {
        return;
    }

    encabezados.forEach((encabezado, indice) => {
        encabezado.textContent = columnas[indice] || "";
    });
}


// ======================================
// EXPORTAR E IMPRIMIR
// ======================================

function configurarAccionesDetalleReporte() {
    const botonExportar = document.getElementById(
        "btn-exportar"
    );

    const botonImprimir = document.getElementById(
        "btn-imprimir"
    );

    if (botonExportar) {
        botonExportar.disabled = true;

        botonExportar.addEventListener(
            "click",
            exportarReporte
        );
    }

    if (botonImprimir) {
        botonImprimir.disabled = true;

        botonImprimir.addEventListener(
            "click",
            () => {
                if (reporteActual) {
                    window.print();
                }
            }
        );
    }
}


// ======================================
// EXPORTACIÓN JSON
// ======================================

function exportarReporte() {
    if (!reporteActual) {
        alert("No hay un reporte cargado.");
        return;
    }

    const contenido = JSON.stringify(
        reporteActual,
        null,
        2
    );

    const archivo = new Blob(
        [contenido],
        {
            type: "application/json;charset=utf-8"
        }
    );

    const url = URL.createObjectURL(archivo);

    const enlace = document.createElement("a");

    const nombreSeguro = String(
        reporteActual.nombre || "reporte"
    )
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9_-]+/g, "_")
        .slice(0, 80);

    enlace.href = url;

    enlace.download =
        `${nombreSeguro}_${reporteActual.id}.json`;

    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();

    setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 1000);
}


// ======================================
// FUNCIONES AUXILIARES
// ======================================

function colocarTextoDetalleReporte(id, valor) {
    const elemento = document.getElementById(id);

    if (elemento) {
        elemento.textContent = valor ?? "-";
    }
}


function mostrarValorDetalle(valor) {
    if (
        valor === null ||
        valor === undefined ||
        valor === ""
    ) {
        return "--";
    }

    return String(valor);
}


function mostrarPorcentajeDetalle(valor) {
    if (
        valor === null ||
        valor === undefined ||
        valor === ""
    ) {
        return "--";
    }

    return `${valor}%`;
}


function formatearFechaDetalleReporte(fecha) {
    if (!fecha) {
        return "-";
    }

    const [anio, mes, dia] = String(fecha)
        .slice(0, 10)
        .split("-");

    if (!anio || !mes || !dia) {
        return String(fecha);
    }

    return `${dia}/${mes}/${anio}`;
}


function formatearFechaHoraDetalleReporte(fecha) {
    if (!fecha) {
        return "-";
    }

    const fechaFormateada =
        formatearFechaDetalleReporte(fecha);

    const hora = String(fecha)
        .split(" ")[1]
        ?.slice(0, 5);

    return hora
        ? `${fechaFormateada} ${hora}`
        : fechaFormateada;
}


function escaparHTMLDetalle(valor) {
    return String(valor ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}
