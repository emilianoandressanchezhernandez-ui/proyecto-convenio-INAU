/*
    ASISTENCIA.JS
    Responsabilidades:
    - Obtener el taller desde la URL.
    - Cargar sus alumnos.
    - Permitir registrar la asistencia.
    - Actualizar el contador de presentes.
    - Guardar temporalmente la información.
*/

// VARIABLES

let tallerActual = null;
let alumnosDelTaller = [];
let fechaAsistenciaActual = "";

// INICIALIZACIÓN

function inicializarAsistencia() {
    try {
        validarDatosAsistencia();

        const tallerId = obtenerTallerIdDesdeURL();

        tallerActual = buscarTallerPorId(tallerId);
        alumnosDelTaller = obtenerAlumnosDelTaller(tallerId);
        fechaAsistenciaActual = obtenerFechaISO();

        mostrarInformacionTaller();
        configurarEnlaceVolver();

        renderizarTablaAlumnos();
        configurarBotonGuardar();

        cargarAsistenciaGuardada();
        actualizarContadorPresentes();

    } catch (error) {
        console.error(
            "Error al inicializar la asistencia:",
            error
        );

        mostrarAlertaAsistencia(
            error.message,
            "danger"
        );

        deshabilitarGuardado();
    }
}

// VALIDACIÓN DE DATOS

function validarDatosAsistencia() {
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

    if (!Array.isArray(window.DATOS_SIMULADOS.alumnos)) {
        throw new Error(
            "La lista de alumnos no está disponible."
        );
    }

    if (!Array.isArray(window.DATOS_SIMULADOS.inscripciones)) {
        throw new Error(
            "Las inscripciones no están disponibles."
        );
    }
}

// OBTENER TALLER

function obtenerTallerIdDesdeURL() {
    const parametrosURL = new URLSearchParams(
        window.location.search
    );

    const idRecibido = parametrosURL.get("tallerId");

    if (!idRecibido) {
        throw new Error(
            "No se indicó el taller para registrar asistencia."
        );
    }

    const tallerId = Number(idRecibido);

    if (!Number.isInteger(tallerId) || tallerId <= 0) {
        throw new Error(
            "El identificador del taller no es válido."
        );
    }
    return tallerId;
}

function buscarTallerPorId(tallerId) {
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

// OBTENER ALUMNOS

function obtenerAlumnosDelTaller(tallerId) {
    const inscripcion =
        window.DATOS_SIMULADOS.inscripciones.find(
            (registro) => registro.tallerId === tallerId
        );

    if (!inscripcion) {
        return [];
    }

    const idsAlumnos = new Set(
        inscripcion.alumnoIds
    );

    // Se muestran solamente los alumnos relacionados con el taller y cuyo estado sea Activo

    return window.DATOS_SIMULADOS.alumnos.filter(
        (alumno) => {
            return (
                idsAlumnos.has(alumno.id) &&
                alumno.estado === "Activo"
            );
        }
    );
}

// INFORMACIÓN GENERAL

function mostrarInformacionTaller() {
    colocarTexto(
        "nombre-taller",
        tallerActual.nombre
    );

    colocarTexto(
        "info-fecha",
        formatearFechaParaMostrar(
            fechaAsistenciaActual
        )
    );

    colocarTexto(
        "info-horario",
        formatearHorarios(
            tallerActual.horarios
        )
    );

    document.title =
        `INAU - Asistencia - ${tallerActual.nombre}`;
}

function configurarEnlaceVolver() {
    const enlaceVolver = document.getElementById(
        "enlace-volver"
    );

    if (!enlaceVolver || !tallerActual) {
        return;
    }

    enlaceVolver.href =
        `detalle-taller.html?id=${encodeURIComponent(tallerActual.id)}`;
}

// RENDERIZAR TABLA

function renderizarTablaAlumnos() {
    const cuerpoTabla = document.getElementById(
        "tabla-alumnos"
    );

    if (!cuerpoTabla) {
        throw new Error(
            "No se encontró la tabla de alumnos."
        );
    }

    cuerpoTabla.innerHTML = "";

    if (alumnosDelTaller.length === 0) {
        cuerpoTabla.innerHTML = `
            <tr>
                <td colspan="3" class="text-center text-muted py-4">
                    No hay alumnos inscritos en este taller.
                </td>
            </tr>
        `;

        deshabilitarGuardado();
        return;
    }

    alumnosDelTaller.forEach((alumno) => {
        const fila = crearFilaAlumno(alumno);

        cuerpoTabla.insertAdjacentHTML(
            "beforeend",
            fila
        );
    });

    configurarSelectoresAsistencia();
}

function crearFilaAlumno(alumno) {
    const nombreCompleto =
        `${alumno.nombre} ${alumno.apellido}`;

    return `
        <tr>
            <td class="fw-semibold">
                ${nombreCompleto}
            </td>

            <td>
                ${alumno.cedula}
            </td>

            <td>
                <select
                    class="form-select form-select-sm estado-asistencia"
                    data-alumno-id="${alumno.id}"
                    aria-label="Asistencia de ${nombreCompleto}"
                >

                    <option value="Presente">
                        Presente
                    </option>

                    <option value="Ausente">
                        Ausente
                    </option>

                    <option value="Justificado">
                        Justificado
                    </option>
                </select>
            </td>
        </tr>
    `;
}

function configurarSelectoresAsistencia() {
    const selectores = document.querySelectorAll(
        ".estado-asistencia"
    );

    selectores.forEach((selector) => {
        selector.addEventListener(
            "change",
            actualizarContadorPresentes
        );
    });
}

// CONTADOR 

function actualizarContadorPresentes() {
    const selectores = document.querySelectorAll(
        ".estado-asistencia"
    );

    const presentes = Array.from(selectores).filter(
        (selector) => selector.value === "Presente"
    ).length;

    colocarTexto(
        "contador-presentes",
        `${presentes} de ${alumnosDelTaller.length}`
    );
}

// GUARDAR ASISTENCIA

function configurarBotonGuardar() {
    const botonGuardar = document.getElementById(
        "btn-guardar-asistencia"
    );

    if (!botonGuardar) {
        return;
    }

    botonGuardar.addEventListener(
        "click",
        guardarAsistencia
    );
}

function guardarAsistencia() {
    const selectores = Array.from(
        document.querySelectorAll(
            ".estado-asistencia"
        )
    );

    if (selectores.length === 0) {
        mostrarAlertaAsistencia(
            "No hay alumnos para registrar.",
            "warning"
        );

        return;
    }

    const faltaSeleccionar = selectores.some(
        (selector) => selector.value === ""
    );

    if (faltaSeleccionar) {
        mostrarAlertaAsistencia(
            "Debes seleccionar la asistencia de todos los alumnos.",
            "warning"
        );

        return;
    }

    const registros = selectores.map((selector) => {
        return {
            alumnoId: Number(
                selector.dataset.alumnoId
            ),
            estado: selector.value
        };
    });

    const nuevaAsistencia = {
        id: `${tallerActual.id}-${fechaAsistenciaActual}`,
        tallerId: tallerActual.id,
        fecha: fechaAsistenciaActual,
        registros: registros,
        guardadoEn: new Date().toISOString()
    };

    guardarEnLocalStorage(nuevaAsistencia);

    mostrarAlertaAsistencia(
        "La asistencia se guardó correctamente.",
        "success"
    );
}

// LOCAL STORAGE 

function leerAsistenciasGuardadas() {
    const contenidoGuardado = localStorage.getItem(
        "asistenciasSimuladas"
    );

    if (!contenidoGuardado) {
        return [];
    }

    try {
        const asistencias = JSON.parse(
            contenidoGuardado
        );

        return Array.isArray(asistencias)
            ? asistencias
            : [];

    } catch (error) {
        console.warn(
            "No se pudieron leer las asistencias guardadas:",
            error
        );

        return [];
    }
}

function guardarEnLocalStorage(nuevaAsistencia) {
    const asistencias = leerAsistenciasGuardadas();

    // Eliminamos un posible registro anterior del mismo taller y la misma fecha para evitar duplicados 

    const asistenciasActualizadas =
        asistencias.filter((asistencia) => {
            return !(
                asistencia.tallerId === nuevaAsistencia.tallerId &&
                asistencia.fecha === nuevaAsistencia.fecha
            );
        });

    asistenciasActualizadas.push(
        nuevaAsistencia
    );

    localStorage.setItem(
        "asistenciasSimuladas",
        JSON.stringify(asistenciasActualizadas)
    );
}

function cargarAsistenciaGuardada() {
    const asistencias = leerAsistenciasGuardadas();

    const asistenciaEncontrada =
        asistencias.find((asistencia) => {
            return (
                asistencia.tallerId === tallerActual.id &&
                asistencia.fecha === fechaAsistenciaActual
            );
        });

    if (!asistenciaEncontrada) {
        return;
    }

    asistenciaEncontrada.registros.forEach(
        (registro) => {
            const selector = document.querySelector(
                `.estado-asistencia[data-alumno-id="${registro.alumnoId}"]`
            );

            if (selector) {
                selector.value = registro.estado;
            }
        }
    );

    mostrarAlertaAsistencia(
        "Se cargó la asistencia guardada anteriormente para esta fecha.",
        "info"
    );
}

// FECHAS Y HORARIOS

function obtenerFechaISO() {
    const fechaActual = new Date();

    const anio = fechaActual.getFullYear();

    const mes = String(
        fechaActual.getMonth() + 1
    ).padStart(2, "0");

    const dia = String(
        fechaActual.getDate()
    ).padStart(2, "0");

    return `${anio}-${mes}-${dia}`;
}

function formatearFechaParaMostrar(fechaISO) {
    const partes = fechaISO.split("-");

    if (partes.length !== 3) {
        return fechaISO;
    }

    const [anio, mes, dia] = partes;

    return `${dia}/${mes}/${anio}`;
}

function formatearHorarios(horarios) {
    if (!Array.isArray(horarios) || horarios.length === 0) {
        return "Horario no disponible";
    }

    return horarios
        .map((horario) => {
            return `${horario.dia} ${horario.horaInicio} a ${horario.horaFin}`;
        })
        .join(" | ");
}

// ALERTAS

function mostrarAlertaAsistencia(
    mensaje,
    tipo = "danger"
) {
    const alerta = document.getElementById(
        "alerta-asistencia"
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

function deshabilitarGuardado() {
    const botonGuardar = document.getElementById(
        "btn-guardar-asistencia"
    );

    if (botonGuardar) {
        botonGuardar.disabled = true;
    }
}

// FUNCIÓN AUXILIAR

function colocarTexto(elementoId, contenido) {
    const elemento = document.getElementById(
        elementoId
    );

    if (!elemento) {
        return;
    }

    elemento.textContent = contenido ?? "-";
}