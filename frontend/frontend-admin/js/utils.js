/*
    UTILS.JS - FRONTEND ADMIN
    Funciones comunes reutilizadas por las distintas pantallas del panel administrador.
    Este archivo no maneja datos de negocio ni conoce la estructura de ninguna pantalla:
    solo recibe ids/valores como parametros y devuelve resultados genericos.
*/


// URL
// Lee un parametro de la URL actual. Ejemplo: detalle-taller.html?id=3
// obtenerParametroURL("id") -> "3"
function obtenerParametroURL(nombre) {
    const parametros = new URLSearchParams(window.location.search);
    return parametros.get(nombre);
}

// FECHAS
// Convierte una fecha ISO ("2026-08-15") a formato legible ("15/08/2026")
function formatearFecha(fechaISO) {
    if (!fechaISO) return "-";
    const [anio, mes, dia] = fechaISO.split(" ")[0].split("-");
    return `${dia}/${mes}/${anio}`;
}

// Igual que formatearFecha, pero conserva la hora si el dato la incluye
// ("2026-08-15 10:30" -> "15/08/2026 10:30")
function formatearFechaHora(fechaHoraISO) {
    if (!fechaHoraISO) return "-";
    const [fecha, hora] = fechaHoraISO.split(" ");
    const fechaFormateada = formatearFecha(fecha);
    return hora ? `${fechaFormateada} ${hora}` : fechaFormateada;
}



// SEGURIDAD / DOM
// Escapa caracteres especiales de HTML antes de insertar texto en el DOM.
// Evita que un dato cargado por un usuario (nombre, observacion, mensaje)
// se interprete como HTML/script.
function escaparHTML(valor) {
    if (valor === null || valor === undefined) return "";
    const div = document.createElement("div");
    div.textContent = valor;
    return div.innerHTML;
}

// Busca un elemento por id y le pone el texto indicado (ya escapado).
// Si el elemento no existe en esa pantalla, no rompe: simplemente no hace nada.
function colocarTexto(elementoId, contenido) {
    const elemento = document.getElementById(elementoId);
    if (elemento) {
        elemento.textContent = contenido ?? "-";
    }
}



// ALERTAS
// Muestra una alerta Bootstrap dentro de un contenedor existente en el HTML.
// tipo: "success" | "danger" | "info" | "warning"
function mostrarAlerta(elementoId, mensaje, tipo = "info") {
    const contenedor = document.getElementById(elementoId);
    if (!contenedor) return;
    contenedor.className = `alert alert-${tipo}`;
    contenedor.textContent = mensaje;
    contenedor.classList.remove("d-none");
}

// Oculta la alerta mostrada por mostrarAlerta
function ocultarAlerta(elementoId) {
    const contenedor = document.getElementById(elementoId);
    if (contenedor) {
        contenedor.classList.add("d-none");
    }
}

// BUSQUEDA / FILTROS
// Normaliza texto para comparar en buscadores: minusculas y sin tildes.
// normalizarTexto("María") === normalizarTexto("maria") -> true
function normalizarTexto(valor) {
    if (!valor) return "";
    return valor
        .toString()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

// PERSISTENCIA (localStorage)
// Guarda cualquier valor (objeto, arreglo, texto) en localStorage como JSON.
function guardarDato(clave, valor) {
    localStorage.setItem(clave, JSON.stringify(valor));
}

// Recupera y parsea un valor guardado con guardarDato.
// Devuelve null si no existe o si hay un error de formato.
function obtenerDato(clave) {
    const guardado = localStorage.getItem(clave);
    if (!guardado) return null;
    try {
        return JSON.parse(guardado);
    } catch (error) {
        return null;
    }
}

// Calcula el proximo id disponible de un arreglo de objetos con campo "id".
// Se usa al dar de alta un registro nuevo (tallerista, alumno, taller, etc.)
function generarId(arreglo) {
    if (!arreglo || arreglo.length === 0) return 1;
    const maximo = Math.max(...arreglo.map(item => item.id));
    return maximo + 1;
}

