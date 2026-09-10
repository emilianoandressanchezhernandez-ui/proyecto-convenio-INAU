/*
    UTILS.JS - FRONTEND TALLERISTA
    Funciones comunes para las pantallas nuevas (material.js, correccion-tarea.js).
    No modifica ni reemplaza nada de lo que ya usan los archivos existentes
    (dashboard.js, asistencia.js, informes.js, etc.), que siguen funcionando
    igual que antes, con sus propias funciones internas.
*/


// ==============================
// URL
// ==============================

function obtenerParametroURL(nombre) {
    const parametros = new URLSearchParams(window.location.search);
    return parametros.get(nombre);
}


// ==============================
// FECHAS
// ==============================

function formatearFecha(fechaISO) {
    if (!fechaISO) return "-";
    const [anio, mes, dia] = fechaISO.split(" ")[0].split("-");
    return `${dia}/${mes}/${anio}`;
}

function formatearFechaHora(fechaHoraISO) {
    if (!fechaHoraISO) return "-";
    const [fecha, hora] = fechaHoraISO.split(" ");
    const fechaFormateada = formatearFecha(fecha);
    return hora ? `${fechaFormateada} ${hora}` : fechaFormateada;
}


// ==============================
// SEGURIDAD / DOM
// ==============================

function escaparHTML(valor) {
    if (valor === null || valor === undefined) return "";
    const div = document.createElement("div");
    div.textContent = valor;
    return div.innerHTML;
}

function colocarTexto(elementoId, contenido) {
    const elemento = document.getElementById(elementoId);
    if (elemento) {
        elemento.textContent = contenido ?? "-";
    }
}


// ==============================
// ALERTAS
// ==============================

function mostrarAlerta(elementoId, mensaje, tipo = "info") {
    const contenedor = document.getElementById(elementoId);
    if (!contenedor) return;
    contenedor.className = `alert alert-${tipo}`;
    contenedor.textContent = mensaje;
    contenedor.classList.remove("d-none");
}

function ocultarAlerta(elementoId) {
    const contenedor = document.getElementById(elementoId);
    if (contenedor) {
        contenedor.classList.add("d-none");
    }
}


// ==============================
// PERSISTENCIA (localStorage)
// ==============================

// Mismo mecanismo que ya usa el panel de administrador: mientras no exista
// backend, los cambios (nuevo material, correcciones, notas) se guardan
// en el navegador. El dia que llegue la API, solo hay que reescribir estas
// funciones, sin tocar el resto de las pantallas que las usan.

function guardarDato(clave, valor) {
    localStorage.setItem(clave, JSON.stringify(valor));
}

function obtenerDato(clave) {
    const guardado = localStorage.getItem(clave);
    if (!guardado) return null;
    try {
        return JSON.parse(guardado);
    } catch (error) {
        return null;
    }
}

function generarId(arreglo) {
    if (!arreglo || arreglo.length === 0) return 1;
    const maximo = Math.max(...arreglo.map(item => item.id));
    return maximo + 1;
}

function obtenerListado(clave, listaOriginal) {
    const listaGuardada = obtenerDato(clave);
    return listaGuardada || listaOriginal;
}