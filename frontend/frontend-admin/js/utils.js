/*
    UTILS.JS - FRONTEND ADMIN
    Funciones comunes reutilizadas por las distintas pantallas del panel administrador.
    Este archivo no maneja datos de negocio ni conoce la estructura de ninguna pantalla:
    solo recibe ids/valores como parametros y devuelve resultados genericos.
*/


// ==============================
// URL
// ==============================

// Lee un parametro de la URL actual. Ejemplo: detalle-taller.html?id=3
// obtenerParametroURL("id") -> "3"
function obtenerParametroURL(nombre) {
    const parametros = new URLSearchParams(window.location.search);
    return parametros.get(nombre);
}


// ==============================
// FECHAS
// ==============================

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


// ==============================
// SEGURIDAD / DOM
// ==============================

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


// ==============================
// ALERTAS
// ==============================

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


// ==============================
// BUSQUEDA / FILTROS
// ==============================

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


// ==============================
// PERSISTENCIA (localStorage)
// ==============================

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

<<<<<<< HEAD
// Convierte el arreglo de horarios de un taller en un texto legible.
// [{dia: "Lunes", horaInicio: "14:00", horaFin: "16:00"}] -> "Lunes 14:00-16:00"
// Se usa en cualquier pantalla que liste talleres (detalle de tallerista,
// detalle de alumno, listado de talleres).
function formatearHorarios(horarios) {
    if (!horarios || horarios.length === 0) return "-";
    return horarios
        .map((h) => `${h.dia} ${h.horaInicio}-${h.horaFin}`)
        .join(", ");
}

// Llena un <select> con los talleristas activos del sistema.
// Se usa en el alta y en la edicion de taller (talleres.js y detalle-taller.js).
function cargarSelectorDeTalleristas(selectId) {

    const select = document.getElementById(selectId);

    if (!select) {
        return;
    }

    const talleristas = obtenerListado(
        "talleristas",
        window.DATOS_SIMULADOS.talleristas
    );

    const opciones = talleristas
        .filter((t) => t.estado === "Activo")
        .map((t) => `<option value="${t.id}">${escaparHTML(t.nombre)} ${escaparHTML(t.apellido)}</option>`)
        .join("");

    select.innerHTML = `<option value="">Seleccionar...</option>${opciones}`;
}

// Llena un <select> con todos los talleres del sistema, para usar como
// filtro (ej: pantalla de asistencias, reportes). Incluye una opcion
// "Todos los talleres" al principio, con value vacio.
function cargarSelectorDeTalleres(selectId) {

    const select = document.getElementById(selectId);

    if (!select) {
        return;
    }

    const talleres = obtenerListado(
        "talleres",
        window.DATOS_SIMULADOS.talleres
    );

    const opciones = talleres
        .map((t) => `<option value="${t.id}">${escaparHTML(t.nombre)}</option>`)
        .join("");

    select.innerHTML = `<option value="">Todos los talleres</option>${opciones}`;
}


// ==============================
// HORARIOS DINAMICOS (formularios de taller)
// ==============================
//
// Un taller puede tener uno o varios horarios (ej: Lunes y Miercoles).
// Estas 4 funciones permiten que el modal de "Nuevo/Editar Taller" tenga
// una lista de horarios sin limite, con filas que se agregan y quitan
// dinamicamente, en vez de tener una cantidad fija de campos en el HTML.

const DIAS_SEMANA = [
    "Lunes", "Martes", "Miércoles", "Jueves",
    "Viernes", "Sábado", "Domingo"
];

// Agrega una fila de horario al contenedor indicado. Si se pasan "valores"
// (dia, horaInicio, horaFin), la fila arranca precargada con esos datos;
// si no, arranca vacia. Se usa tanto para el alta (filas vacias) como
// para la edicion (una fila por cada horario que el taller ya tenga).
function agregarFilaHorario(contenedorId, valores = {}) {

    const contenedor = document.getElementById(contenedorId);

    if (!contenedor) {
        return;
    }

    const opcionesDias = DIAS_SEMANA
        .map((dia) => `<option value="${dia}" ${dia === valores.dia ? "selected" : ""}>${dia}</option>`)
        .join("");

    const filaHTML = `
        <div class="row g-2 mb-2 align-items-center fila-horario">
            <div class="col-4">
                <select class="form-select horario-dia">
                    ${opcionesDias}
                </select>
            </div>
            <div class="col-3">
                <input type="time" class="form-control horario-inicio" value="${valores.horaInicio || ""}">
            </div>
            <div class="col-3">
                <input type="time" class="form-control horario-fin" value="${valores.horaFin || ""}">
            </div>
            <div class="col-2">
                <button type="button" class="btn btn-outline-danger btn-sm w-100" onclick="eliminarFilaHorario(this)">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        </div>
    `;

    contenedor.insertAdjacentHTML("beforeend", filaHTML);
}

// Quita la fila de horario a la que pertenece el boton clickeado.
// Se llama desde el propio HTML generado (onclick="eliminarFilaHorario(this)").
function eliminarFilaHorario(boton) {

    const fila = boton.closest(".fila-horario");

    if (fila) {
        fila.remove();
    }
}

// Vacia por completo el contenedor de horarios. Se usa antes de precargar
// las filas de un taller existente, para no duplicar filas si el modal
// se abre mas de una vez.
function limpiarHorarios(contenedorId) {

    const contenedor = document.getElementById(contenedorId);

    if (contenedor) {
        contenedor.innerHTML = "";
    }
}

// Recorre todas las filas de horario presentes en el contenedor (sean
// 1, 3 o las que el usuario haya agregado) y arma el arreglo final.
// Una fila se ignora si le falta la hora de inicio o la hora de fin.
function leerHorariosDesdeFormulario(contenedorId) {

    const contenedor = document.getElementById(contenedorId);

    if (!contenedor) {
        return [];
    }

    const filas = contenedor.querySelectorAll(".fila-horario");
    const horarios = [];

    filas.forEach((fila) => {

        const dia = fila.querySelector(".horario-dia").value;
        const horaInicio = fila.querySelector(".horario-inicio").value;
        const horaFin = fila.querySelector(".horario-fin").value;

        if (horaInicio && horaFin) {
            horarios.push({ dia, horaInicio, horaFin });
        }
    });

    return horarios;
}

// Devuelve el listado "vigente" de una entidad (talleristas, alumnos, etc.):
// si ya existe una version guardada en localStorage (porque se agrego,
// edito o desactivo algun registro), usa esa. Si no, usa el mock original
// como punto de partida.
//
// Este es el UNICO lugar del sistema que decide de donde viene el dato.
// Cuando exista backend, solo hay que reescribir esta funcion (por un
// fetch a la API), sin tocar el resto de las pantallas que la usan.
function obtenerListado(clave, listaOriginal) {
    const listaGuardada = obtenerDato(clave);
    return listaGuardada || listaOriginal;
}
=======

// ==============================
// DATOS DEL FRONTEND ADMIN
// ==============================

function cargarColeccionAdmin(clave, respaldo) {
    const guardado = obtenerDato(`admin_${clave}`);
    return Array.isArray(guardado) ? guardado : structuredClone(respaldo || []);
}

function guardarColeccionAdmin(clave, datos) {
    guardarDato(`admin_${clave}`, datos);
    if (window.DATOS_SIMULADOS && clave in window.DATOS_SIMULADOS) {
        window.DATOS_SIMULADOS[clave] = datos;
    }
}

function filaVacia(colspan, mensaje) {
    return `<tr><td colspan="${colspan}" class="text-center text-muted py-5">${escaparHTML(mensaje)}</td></tr>`;
}

function actualizarEstadisticasPagina(valores) {
    const bloques = document.querySelectorAll("main > .row.g-4.mb-4 .card h3, main > .row.mt-5.g-4 .card h3");
    bloques.forEach((bloque, indice) => {
        if (valores[indice] !== undefined) bloque.textContent = valores[indice];
    });
}

function mostrarAlertaTemporal(mensaje, tipo = "info") {
    const alerta = document.createElement("div");
    alerta.className = `alert alert-${tipo} position-fixed top-0 start-50 translate-middle-x mt-3 shadow`;
    alerta.style.zIndex = "1080";
    alerta.textContent = mensaje;
    document.body.appendChild(alerta);
    setTimeout(() => alerta.remove(), 2500);
}

function mostrarRecursoNoEncontrado(nombre) {
    const main = document.querySelector("main");
    if (!main) return;
    main.innerHTML = `<div class="alert alert-warning mt-4"><strong>${escaparHTML(nombre)} no encontrado.</strong><br>Verifique el identificador utilizado en la URL.</div>`;
}
>>>>>>> c6e8eca1d4807b7378ed01f8fbdac06d3f9fc044
