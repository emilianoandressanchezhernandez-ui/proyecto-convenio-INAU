/*
    DETALLE-TALLER.JS
    Responsabilidades:
    - Obtener el ID del taller desde la URL.
    - Buscar el taller en los datos simulados.
    - Mostrar sus datos en el HTML.
    - Preparar los enlaces de asistencia e informes.
    - Controlar posibles errores.
*/

// INICIALIZACIÓN 

function inicializarDetalleTaller() {
    try {
        validarDatosSimulados();

        const tallerId = obtenerTallerIdDesdeURL();
        const taller = buscarTallerPorId(tallerId);

        mostrarDetalleTaller(taller);
        configurarAccionesTaller(taller);

    } catch (error) {
        console.error(
            "Error al cargar el detalle del taller:",
            error
        );

        mostrarErrorDetalle(error.message);
    }
}

// VALIDACIÓN

function validarDatosSimulados() {
    if (!window.DATOS_SIMULADOS) {
        throw new Error(
            "No se pudieron cargar los datos simulados."
        );
    }

    if (!Array.isArray(window.DATOS_SIMULADOS.talleres)) {
        throw new Error(
            "La lista de talleres no está disponible."
        );
    }
}

// OBTENER ID DE LA URL

function obtenerTallerIdDesdeURL() {
    /*
        URLSearchParams permite leer los parámetros que aparecen después del signo ? en la URL.
        Ejemplo:
        detalle-taller.html?id=2
    */

    const parametrosURL = new URLSearchParams(
        window.location.search
    );

    const idRecibido = parametrosURL.get("id");

    if (!idRecibido) {
        throw new Error(
            "No se indicó qué taller debe mostrarse."
        );
    }

    const tallerId = Number(idRecibido);

    /*
        Number.isInteger verifica que sea un número entero.
        También comprobamos que sea mayor que cero.
    */

    if (!Number.isInteger(tallerId) || tallerId <= 0) {
        throw new Error(
            "El identificador del taller no es válido."
        );
    }

    return tallerId;
}

// BÚSQUEDA DEL TALLER

function buscarTallerPorId(tallerId) {
    /*
        find() devuelve el primer taller cuyo ID
        coincide con el recibido en la URL.
    */

    const tallerEncontrado =
        window.DATOS_SIMULADOS.talleres.find(
            (taller) => taller.id === tallerId
        );

    if (!tallerEncontrado) {
        throw new Error(
            "El taller solicitado no existe."
        );
    }

    return tallerEncontrado;
}

// MOSTRAR INFORMACIÓN

function mostrarDetalleTaller(taller) {
    colocarTexto(
        "nombre-taller",
        taller.nombre
    );

    colocarTexto(
        "descripcion-taller",
        taller.descripcion
    );

    colocarTexto(
        "dias-taller",
        formatearDias(taller.horarios)
    );

    colocarTexto(
        "horario-taller",
        formatearHorarios(taller.horarios)
    );

    colocarTexto(
        "ubicacion-taller",
        formatearUbicacion(taller.ubicacion)
    );

    colocarTexto(
        "cantidad-alumnos",
        taller.cantidadAlumnos
    );

    colocarTexto(
        "asistencia-promedio",
        `${taller.asistenciaPromedio}%`
    );

    colocarTexto(
        "estado-taller",
        taller.estado
    );

    aplicarEstiloEstado(taller.estado);

    /*
        Actualizamos también el título de la pestaña.
    */

    document.title = `INAU - ${taller.nombre}`;
}

// FUNCIONES DE FORMATO

function formatearDias(horarios) {
    if (!Array.isArray(horarios) || horarios.length === 0) {
        return "Días no disponibles";
    }

    return horarios
        .map((horario) => horario.dia)
        .join(" - ");
}

function formatearHorarios(horarios) {
    if (!Array.isArray(horarios) || horarios.length === 0) {
        return "Horario no disponible";
    }

    return horarios
        .map((horario) => {
            return `${horario.dia}: ${horario.horaInicio} a ${horario.horaFin}`;
        })
        .join(" | ");
}

function formatearUbicacion(ubicacion) {
    if (!ubicacion) {
        return "Ubicación no disponible";
    }

    const partesUbicacion = [
        ubicacion.centro,
        ubicacion.direccion,
        ubicacion.salon
    ];

    // filter(Boolean) elimina valores vacíos, null o undefined

    return partesUbicacion
        .filter(Boolean)
        .join(" - ");
}

// ACCIONES

function configurarAccionesTaller(taller) {
    const enlaceAsistencia = document.getElementById(
        "enlace-asistencia"
    );

    const enlaceInformes = document.getElementById(
        "enlace-informes"
    );

    const botonVerAlumnos = document.getElementById(
        "btn-ver-alumnos"
    );

    /*
        Enviamos el ID del taller a las siguientes pantallas.
        Ejemplo:
        asistencia.html?tallerId=1
    */

    if (enlaceAsistencia) {
        enlaceAsistencia.href =
            `asistencia.html?tallerId=${encodeURIComponent(taller.id)}`;
    }

    if (enlaceInformes) {
        enlaceInformes.href =
            `informes.html?tallerId=${encodeURIComponent(taller.id)}`;
    }

    // La pantalla de asistencia contiene la tabla de alumnos. Por eso usamos esa página también para el botón "Alumnos"

    if (botonVerAlumnos) {
        botonVerAlumnos.addEventListener("click", () => {
            window.location.href =
                `asistencia.html?tallerId=${encodeURIComponent(taller.id)}#contenedor-tabla`;
        });
    }
}

// ESTILO DEL ESTADO

function aplicarEstiloEstado(estado) {
    const elementoEstado = document.getElementById(
        "estado-taller"
    );

    if (!elementoEstado) {
        return;
    }

    // Quitamos clases que pudieran haberse agregado antes
    elementoEstado.classList.remove(
        "text-success",
        "text-secondary",
        "text-warning",
        "text-danger",
        "text-dark"
    );

    const clasesEstado = {
        Activo: "text-success",
        Inactivo: "text-secondary",
        Suspendido: "text-warning",
        Cancelado: "text-danger",
        Finalizado: "text-dark"
    };

    const clase =
        clasesEstado[estado] || "text-secondary";

    elementoEstado.classList.add(clase);
}

// FUNCIÓN REUTILIZABLE

function colocarTexto(elementoId, contenido) {
    const elemento = document.getElementById(elementoId);

    if (!elemento) {
        console.warn(
            `No se encontró el elemento con ID: ${elementoId}`
        );

        return;
    }

    // textContent es preferible a innerHTML cuando solamente necesitamos insertar texto
    elemento.textContent = contenido ?? "-";
}


// ERRORES 

function mostrarErrorDetalle(mensaje) {
    const alerta = document.getElementById(
        "alerta-detalle-taller"
    );

    if (!alerta) {
        return;
    }

    alerta.textContent = mensaje;
    alerta.classList.remove("d-none");
}