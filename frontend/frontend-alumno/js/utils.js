
/*
    UTILS.JS - FRONTEND ALUMNO

    Funciones comunes para las pantallas del alumno.
    Este archivo no contiene reglas propias de una pantalla: ofrece helpers
    reutilizables para URLs, fechas, DOM, alertas, filtros y almacenamiento.

    Importante: por ahora, guardar y obtener datos usa localStorage del
    navegador. No reemplaza una validación ni una persistencia del backend.
*/

"use strict";


// ==============================
// URL
// ==============================

// Lee un parámetro de la URL actual.
// Ejemplo: detalle-taller.html?id=2 -> obtenerParametroURL("id") devuelve "2".
function obtenerParametroURL(nombre) {
    const parametros = new URLSearchParams(window.location.search);
    return parametros.get(nombre);
}


// ==============================
// FECHAS
// ==============================

// Convierte una fecha ISO como "2026-08-15" en "15/08/2026".
// También acepta cadenas que contengan hora, por ejemplo "2026-08-15T10:30:00".
// Se separan los componentes como texto para evitar desfases por zona horaria.
function formatearFecha(fechaISO) {
    if (fechaISO === null || fechaISO === undefined || fechaISO === "") {
        return "-";
    }

    const texto = String(fechaISO).trim();
    const fecha = texto.split(/[T ]/)[0];
    const coincidencia = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fecha);

    if (!coincidencia) {
        return "-";
    }

    const [, anio, mes, dia] = coincidencia;
    return `${dia}/${mes}/${anio}`;
}

// Formatea una fecha y conserva la hora si está incluida.
// Admite "2026-08-15 10:30" y "2026-08-15T10:30:45".
function formatearFechaHora(fechaHoraISO) {
    if (fechaHoraISO === null || fechaHoraISO === undefined || fechaHoraISO === "") {
        return "-";
    }

    const texto = String(fechaHoraISO).trim();
    const partes = texto.split(/[T ]/);
    const fechaFormateada = formatearFecha(partes[0]);

    if (fechaFormateada === "-") {
        return "-";
    }

    if (!partes[1]) {
        return fechaFormateada;
    }

    // Si hay horas y minutos, muestra HH:mm y omite los segundos.
    const hora = partes[1].slice(0, 5);
    return `${fechaFormateada} ${hora}`;
}


// ==============================
// SEGURIDAD Y MANIPULACIÓN DEL DOM
// ==============================

// Convierte caracteres especiales en entidades HTML. Usar esta función
// cuando se necesite construir HTML con datos variables de manera segura.
function escaparHTML(valor) {
    if (valor === null || valor === undefined) {
        return "";
    }

    const elementoTemporal = document.createElement("div");
    elementoTemporal.textContent = String(valor);
    return elementoTemporal.innerHTML;
}

// Busca un elemento por ID y cambia su texto sin interpretar etiquetas HTML.
// Si el elemento no existe en esa página, no produce errores.
function colocarTexto(elementoId, contenido) {
    const elemento = document.getElementById(elementoId);

    if (elemento) {
        elemento.textContent = contenido === null || contenido === undefined || contenido === ""
            ? "-"
            : String(contenido);
    }
}


// ==============================
// ALERTAS BOOTSTRAP
// ==============================

// Muestra un mensaje en un contenedor existente.
// Tipos permitidos: success, danger, info, warning, primary, secondary.
function mostrarAlerta(elementoId, mensaje, tipo = "info") {
    const contenedor = document.getElementById(elementoId);

    if (!contenedor) {
        return;
    }

    const tiposPermitidos = ["success", "danger", "info", "warning", "primary", "secondary"];
    const tipoSeguro = tiposPermitidos.includes(tipo) ? tipo : "info";

    contenedor.className = `alert alert-${tipoSeguro}`;
    contenedor.setAttribute("role", "alert");
    contenedor.textContent = mensaje === null || mensaje === undefined ? "" : String(mensaje);
    contenedor.classList.remove("d-none");
}

// Oculta el contenedor de alerta sin eliminarlo del HTML.
function ocultarAlerta(elementoId) {
    const contenedor = document.getElementById(elementoId);

    if (contenedor) {
        contenedor.classList.add("d-none");
    }
}


// ==============================
// BÚSQUEDAS Y FILTROS
// ==============================

// Pasa texto a minúsculas y elimina tildes para comparar búsquedas.
// Ejemplo: normalizarTexto("María") devuelve "maria".
function normalizarTexto(valor) {
    if (valor === null || valor === undefined) {
        return "";
    }

    return String(valor)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}


// ==============================
// ALMACENAMIENTO LOCAL
// ==============================

// Guarda un valor en localStorage codificado como JSON.
// Devuelve true si se pudo guardar y false si el navegador lo bloqueó.
function guardarDato(clave, valor) {
    try {
        localStorage.setItem(clave, JSON.stringify(valor));
        return true;
    } catch (error) {
        console.error(`No se pudo guardar el dato "${clave}" en localStorage.`, error);
        return false;
    }
}

// Recupera un dato guardado con guardarDato(). Si no existe o no puede
// interpretarse como JSON, devuelve null.
function obtenerDato(clave) {
    try {
        const guardado = localStorage.getItem(clave);

        if (guardado === null) {
            return null;
        }

        return JSON.parse(guardado);
    } catch (error) {
        console.error(`No se pudo leer el dato "${clave}" de localStorage.`, error);
        return null;
    }
}

// Genera el próximo ID numérico de una lista de objetos con propiedad "id".
// Por ejemplo, [{id: 2}, {id: 5}] devuelve 6.
function generarId(arreglo) {
    if (!Array.isArray(arreglo) || arreglo.length === 0) {
        return 1;
    }

    const idsNumericos = arreglo
        .map((elemento) => Number(elemento?.id))
        .filter((id) => Number.isFinite(id));

    return idsNumericos.length > 0 ? Math.max(...idsNumericos) + 1 : 1;
}

// Si hay una lista guardada en el navegador, la devuelve; si no, utiliza
// la lista original de DATOS_SIMULADOS. Un arreglo guardado vacío también
// se respeta como válido y no se sustituye por los datos iniciales.
function obtenerListado(clave, listaOriginal) {
    const listaGuardada = obtenerDato(clave);
    return listaGuardada !== null ? listaGuardada : listaOriginal;
}


// ==============================
// TALLERES Y HORARIOS
// ==============================

// Convierte los horarios de un taller en un texto legible.
// Ejemplo: [{dia:"Lunes", horaInicio:"14:00", horaFin:"16:00"}]
// devuelve "Lunes 14:00-16:00".
function formatearHorarios(horarios) {
    if (!Array.isArray(horarios) || horarios.length === 0) {
        return "-";
    }

    return horarios
        .filter((horario) => horario && horario.dia)
        .map((horario) => {
            const inicio = horario.horaInicio || "--:--";
            const fin = horario.horaFin || "--:--";
            return `${horario.dia} ${inicio}-${fin}`;
        })
        .join(", ") || "-";
}
