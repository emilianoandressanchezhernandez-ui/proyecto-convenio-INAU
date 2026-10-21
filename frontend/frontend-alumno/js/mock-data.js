/*
    MOCK-DATA.JS - FRONTEND ALUMNO

    Base usada:
    - backend/api/database.sql: datos de ejemplo para Sofi­a, sus talleres,
      inscripciones, contenidos, entrega y adjuntos.
    - frontend/frontend-admin/js/mock-data.js: estructura de ejemplo para
      registros de asistencia utilizados en las vistas del sistema.

    IMPORTANTE:
    - usuarioActual.id representa el ID de la tabla alumnos (1).
    - usuarioActual.usuarioId representa el ID relacionado de la tabla
      usuarios (4). Son dos identificadores distintos en el modelo SQL.
    - fotoPerfil y biografia existen aqui­ para la interfaz, pero todavi­a no
      estan persistidos en las tablas SQL actuales.
    - No se guardan contraseÃ±as en este archivo.
*/

"use strict";

window.DATOS_SIMULADOS = {

    // ALUMNO ACTUAL
    // Ficha de alumnos.id = 1; vinculada a usuarios.id = 4.
    usuarioActual: {
        id: 1,
        usuarioId: 4,
        nombre: "Sofía",
        apellido: "Pereira",
        cedula: "5.123.456-7",
        correo: "sofia.pereira@email.com",
        telefono: "099 111 111",
        direccion: "Av. Artigas 1234",
        referenteAdulto: "Ana Pereira",
        centroReferencia: "Centro 1",
        fechaNacimiento: "2008-05-12",
        fechaRegistro: "2026-03-10",
        fechaIngreso: "2026-03-10",
        ultimaAsistencia: "2026-08-14",
        ultimoAcceso: null,
        estado: "Activo",
        rol: "Alumno",

        // La foto y la biografi­a estan previstas en el perfil, pero no forman
        // parte de la persistencia SQL actual. Su manejo sera solo simulado.
        fotoPerfil: null,
        biografia: ""
    },

    // TALLERES
    // Los datos de ubicacion, fechas y horarios siguen el esquema de SQL.
    // En el detalle se muestra un tallerista principal; talleristasIds conserva
    // todos los usuarios asignados segun taller_tallerista.
    talleres: [
        {
            id: 1,
            nombre: "Programación Web",
            tematica: "Tecnología",
            descripcion: "Introducción a HTML, CSS y JavaScript.",
            talleristaId: 3,
            talleristasIds: [3, 2],
            horarios: [
                {
                    dia: "Lunes",
                    horaInicio: "14:00",
                    horaFin: "16:00"
                },
                {
                    dia: "Miércoles",
                    horaInicio: "14:00",
                    horaFin: "16:00"
                }
            ],
            ubicacion: {
                centro: "Centro 1",
                direccion: "Calle Falsa 123",
                salon: "Salón A"
            },
            estado: "Activo",
            fechaInicio: "2026-03-01",
            fechaFin: "2026-12-01"
        },
        {
            id: 2,
            nombre: "Robótica",
            tematica: "Tecnología",
            descripcion: "Introducción a sensores y circuitos.",
            talleristaId: 3,
            talleristasIds: [3],
            horarios: [
                {
                    dia: "Martes",
                    horaInicio: "15:00",
                    horaFin: "17:00"
                }
            ],
            ubicacion: {
                centro: "Centro 1",
                direccion: "Calle Falsa 123",
                salon: "Salón B"
            },
            estado: "Activo",
            fechaInicio: "2026-03-01",
            fechaFin: "2026-12-01"
        }
    ],

    // TALLERISTAS NECESARIOS PARA MOSTRAR EL RESPONSABLE DE CADA TALLER.
    // Los IDs coinciden con usuarios.id en los datos SQL de demostracion.
    talleristas: [
        {
            id: 2,
            nombre: "María",
            apellido: "López",
            correo: "maria.lopez@inau.gov.uy",
            telefono: "099 201 201",
            especialidad: "Programación Web",
            estado: "Activo"
        },
        {
            id: 3,
            nombre: "Martín",
            apellido: "Rodríguez",
            correo: "martin.rodriguez@ejemplo.com",
            telefono: "099 123 456",
            especialidad: "Programación Web, Robótica y Diseño Gráfico",
            estado: "Activo"
        }
    ],

    // INSCRIPCIONES DEL ALUMNO ACTUAL.
    // Se representa como arreglo agrupado por taller, siguiendo el formato
    // utilizado por los mock data de los otros paneles.
    inscripciones: [
        {
            tallerId: 1,
            alumnoIds: [1]
        },
        {
            tallerId: 2,
            alumnoIds: [1]
        }
    ],

    // ASISTENCIAS DE DEMOSTRACION PARA SOFIA.
    // El SQL define las tablas de asistencia, pero no inserta jornadas de
    // ejemplo. Estos cuatro registros provienen del mock del administrador;
    // solo se conserva el registro de Sofía para esta interfaz.
    asistencias: [
        {
            id: 1,
            tallerId: 1,
            fecha: "2026-08-14",
            registros: [
                {
                    alumnoId: 1,
                    estado: "Presente",
                    observaciones: ""
                }
            ]
        },
        {
            id: 2,
            tallerId: 1,
            fecha: "2026-08-12",
            registros: [
                {
                    alumnoId: 1,
                    estado: "Presente",
                    observaciones: ""
                }
            ]
        },
        {
            id: 3,
            tallerId: 2,
            fecha: "2026-08-13",
            registros: [
                {
                    alumnoId: 1,
                    estado: "Presente",
                    observaciones: ""
                }
            ]
        },
        {
            id: 5,
            tallerId: 2,
            fecha: "2026-08-06",
            registros: [
                {
                    alumnoId: 1,
                    estado: "Presente",
                    observaciones: ""
                }
            ]
        }
    ],

    // CONTENIDOS: MATERIAL Y TAREAS PUBLICADOS POR EL TALLERISTA.
    // En esta base de prueba hay un material y una tarea.
    contenidos: [
        {
            id: 1,
            tallerId: 1,
            tipo: "Material",
            titulo: "Guía de HTML básico",
            descripcion: "Introducción a etiquetas HTML y estructura de una página web.",
            fechaPublicacion: "2026-08-01",
            fechaLimite: null
        },
        {
            id: 2,
            tallerId: 1,
            tipo: "Tarea",
            titulo: "Primera página web",
            descripcion: "Crear una página HTML simple con título, párrafo e imagen.",
            fechaPublicacion: "2026-08-03",
            fechaLimite: "2026-08-17"
        }
    ],

    // ENTREGA DE SOFÍA PARA LA TAREA 2.
    // archivoNombre se deriva del adjunto de demostración relacionado con
    // esta entrega en backend/api/database.sql.
    entregas: [
        {
            id: 1,
            contenidoId: 2,
            alumnoId: 1,
            fechaEntrega: "2026-08-15",
            archivoNombre: "pagina-sofia.html",
            estado: "Corregida",
            nota: 9,
            comentario: "Muy prolijo el orden de las etiquetas, buen trabajo."
        }
    ],

    // METADATOS DE ARCHIVOS DE EJEMPLO.
    // No significa que el archivo físico se pueda descargar desde esta vista:
    // las descargas reales deben pasar por el endpoint protegido de adjuntos.
    adjuntos: [
        {
            id: 1,
            contenidoId: 1,
            entregaId: null,
            nombreOriginal: "guia-html.pdf",
            nombreArchivo: "a1f4c8e2b93d47.pdf",
            tipoMime: "application/pdf",
            tamanoBytes: 482310
        },
        {
            id: 2,
            contenidoId: null,
            entregaId: 1,
            nombreOriginal: "pagina-sofia.html",
            nombreArchivo: "7d2b9f0ac41e58.html",
            tipoMime: "text/html",
            tamanoBytes: 12480
        }
    ]
};