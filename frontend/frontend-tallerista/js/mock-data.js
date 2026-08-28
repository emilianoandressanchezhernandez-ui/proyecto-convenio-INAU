/*
    MOCK-DATA.JS - FRONTEND TALLERISTA
    Este archivo contiene datos simulados.
    Por ahora no existe conexión con PHP ni MySQL, por lo que estos objetos representan temporalmente la información que más adelante llegará desde el backend.

    Este archivo no debe manipular el HTML.
    Solamente almacena datos.
*/

window.DATOS_SIMULADOS = {

    // USUARIO ACTUAL

    usuarioActual: {
        id: 1,
        nombre: "Martín",
        apellido: "Rodríguez",
        cedula: "4.567.890-1",
        correo: "martin.rodriguez@ejemplo.com",
        telefono: "099 123 456",
        rol: "Tallerista",
        fechaRegistro: "2026-03-10",
        ultimoAcceso: "2026-07-17 14:30"
    },

    // TALLERES ASIGNADOS

    talleres: [
        {
            id: 1,
            talleristaId: 1,
            nombre: "Programación Web",
            descripcion: "Introducción al desarrollo de páginas web utilizando HTML, CSS y JavaScript.",

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
                centro: "Centro Educativo 1",
                direccion: "Av. Principal 1234",
                salon: "Sala de Informática"
            },

            cantidadAlumnos: 15,
            asistenciaPromedio: 87,
            estado: "Activo",
            fechaInicio: "2026-03-16",
            fechaFin: "2026-11-30"
        },

        {
            id: 2,
            talleristaId: 1,
            nombre: "Robótica",
            descripcion: "Construcción y programación básica de dispositivos electrónicos y robots.",

            horarios: [
                {
                    dia: "Martes",
                    horaInicio: "15:00",
                    horaFin: "17:00"
                },
                {
                    dia: "Jueves",
                    horaInicio: "15:00",
                    horaFin: "17:00"
                }
            ],

            ubicacion: {
                centro: "Centro Educativo 2",
                direccion: "Calle Rivera 2450",
                salon: "Laboratorio Tecnológico"
            },

            cantidadAlumnos: 12,
            asistenciaPromedio: 91,
            estado: "Activo",
            fechaInicio: "2026-03-17",
            fechaFin: "2026-11-28"
        },

        {
            id: 3,
            talleristaId: 1,
            nombre: "Diseño Gráfico",
            descripcion: "Taller orientado al diseño de piezas visuales y contenidos digitales.",

            horarios: [
                {
                    dia: "Viernes",
                    horaInicio: "13:00",
                    horaFin: "16:00"
                }
            ],

            ubicacion: {
                centro: "Centro Educativo 3",
                direccion: "Camino Central 850",
                salon: "Aula Multimedia"
            },

            cantidadAlumnos: 10,
            asistenciaPromedio: 84,
            estado: "Activo",
            fechaInicio: "2026-04-10",
            fechaFin: "2026-11-27"
        }
    ],

    alumnos: [
        {
            id: 1,
            nombre: "Sofía",
            apellido: "Pereira",
            cedula: "5.123.456-7",
            estado: "Activo"
        },
        {
            id: 2,
            nombre: "Mateo",
            apellido: "Rodríguez",
            cedula: "5.234.567-8",
            estado: "Activo"
        },
        {
            id: 3,
            nombre: "Valentina",
            apellido: "González",
            cedula: "5.345.678-9",
            estado: "Activo"
        },
        {
            id: 4,
            nombre: "Thiago",
            apellido: "Martínez",
            cedula: "5.456.789-0",
            estado: "Activo"
        },
        {
            id: 5,
            nombre: "Martina",
            apellido: "Silva",
            cedula: "5.567.890-1",
            estado: "Activo"
        },
        {
            id: 6,
            nombre: "Benjamín",
            apellido: "Fernández",
            cedula: "5.678.901-2",
            estado: "Activo"
        },
        {
            id: 7,
            nombre: "Lucía",
            apellido: "López",
            cedula: "5.789.012-3",
            estado: "Activo"
        },
        {
            id: 8,
            nombre: "Joaquín",
            apellido: "Sosa",
            cedula: "5.890.123-4",
            estado: "Activo"
        },
        {
            id: 9,
            nombre: "Catalina",
            apellido: "Díaz",
            cedula: "5.901.234-5",
            estado: "Activo"
        },
        {
            id: 10,
            nombre: "Felipe",
            apellido: "Torres",
            cedula: "5.012.345-6",
            estado: "Activo"
        },
        {
            id: 11,
            nombre: "Emma",
            apellido: "Suárez",
            cedula: "5.112.233-4",
            estado: "Activo"
        },
        {
            id: 12,
            nombre: "Agustín",
            apellido: "Acosta",
            cedula: "5.223.344-5",
            estado: "Activo"
        },
        {
            id: 13,
            nombre: "Julieta",
            apellido: "Ramos",
            cedula: "5.334.455-6",
            estado: "Activo"
        },
        {
            id: 14,
            nombre: "Santiago",
            apellido: "Méndez",
            cedula: "5.445.566-7",
            estado: "Activo"
        },
        {
            id: 15,
            nombre: "Camila",
            apellido: "Viera",
            cedula: "5.556.677-8",
            estado: "Activo"
        }
    ],

    /*
        Relaciona cada taller con sus alumnos.
        Más adelante esta información vendrá de una tabla de inscripciones en MySQL.
    */

    inscripciones: [
        {
            tallerId: 1,
            alumnoIds: [
                1, 2, 3, 4, 5,
                6, 7, 8, 9, 10,
                11, 12, 13, 14, 15
            ]
        },
        {
            tallerId: 2,
            alumnoIds: [
                1, 2, 3, 4, 5, 6,
                7, 8, 9, 10, 11, 12
            ]
        },
        {
            tallerId: 3,
            alumnoIds: [
                1, 2, 3, 4, 5,
                6, 7, 8, 9, 10
            ]
        }
    ],
    informes: [
        {
            id: 1,
            tallerId: 1,
            talleristaId: 1,
            titulo: "Informe mensual de julio",
            tipo: "Mensual",
            fecha: "2026-07-15",
            estado: "Finalizado",
            descripcion: "Informe mensual correspondiente al taller de Programación Web.",
            cantidadAlumnos: 15,
            porcentajeAsistencia: 87,
            indicadorGeneral: "Muy bueno",
            observaciones: "El grupo mantiene una participación constante y demuestra interés por las actividades prácticas.",
            resumen: "Durante julio se trabajó con estructura HTML, estilos CSS y conceptos básicos de JavaScript. La mayoría de los alumnos completó correctamente las actividades propuestas.",
            ultimaActualizacion: "2026-07-16T18:30:00"
        },
        {
            id: 2,
            tallerId: 2,
            talleristaId: 1,
            titulo: "Seguimiento de Robótica",
            tipo: "Seguimiento",
            fecha: "2026-07-10",
            estado: "En revisión",
            descripcion: "Seguimiento del avance general del taller de Robótica.",
            cantidadAlumnos: 12,
            porcentajeAsistencia: 91,
            indicadorGeneral: "Excelente",
            observaciones: "Los alumnos se organizaron correctamente para trabajar en equipos.",
            resumen: "Se avanzó en el reconocimiento de componentes electrónicos y en el armado de circuitos simples. El grupo respondió positivamente a la metodología práctica.",
            ultimaActualizacion: "2026-07-11T16:15:00"
        },
        {
            id: 3,
            tallerId: 3,
            talleristaId: 1,
            titulo: "Evaluación de actividades visuales",
            tipo: "Evaluación",
            fecha: "2026-07-05",
            estado: "Finalizado",
            descripcion: "Evaluación de las actividades realizadas en Diseño Gráfico.",
            cantidadAlumnos: 10,
            porcentajeAsistencia: 84,
            indicadorGeneral: "Bueno",
            observaciones: "Se recomienda continuar trabajando la organización de los elementos visuales.",
            resumen: "Los alumnos realizaron piezas gráficas aplicando conceptos de color, tipografía y composición. Se observaron avances en la utilización de las herramientas digitales.",
            ultimaActualizacion: "2026-07-06T14:45:00"
        },
        {
            id: 4,
            tallerId: 1,
            talleristaId: 1,
            titulo: "Informe mensual de junio",
            tipo: "Mensual",
            fecha: "2026-06-28",
            estado: "Finalizado",
            descripcion: "Informe mensual de Programación Web correspondiente a junio.",
            cantidadAlumnos: 15,
            porcentajeAsistencia: 85,
            indicadorGeneral: "Muy bueno",
            observaciones: "El grupo logró completar las actividades previstas para el mes.",
            resumen: "Durante junio se trabajaron los fundamentos de HTML y la construcción de las primeras páginas web.",
            ultimaActualizacion: "2026-06-29T17:20:00"
        },
        {
            id: 5,
            tallerId: 2,
            talleristaId: 1,
            titulo: "Informe mensual de junio",
            tipo: "Mensual",
            fecha: "2026-06-25",
            estado: "Finalizado",
            descripcion: "Informe mensual del taller de Robótica.",
            cantidadAlumnos: 12,
            porcentajeAsistencia: 89,
            indicadorGeneral: "Muy bueno",
            observaciones: "Se destaca el compromiso general del grupo.",
            resumen: "Se realizaron actividades introductorias sobre electricidad, sensores y componentes básicos.",
            ultimaActualizacion: "2026-06-26T15:00:00"
        },
        {
            id: 6,
            tallerId: 3,
            talleristaId: 1,
            titulo: "Informe mensual de mayo",
            tipo: "Mensual",
            fecha: "2026-05-30",
            estado: "Borrador",
            descripcion: "Borrador del informe mensual del taller de Diseño Gráfico.",
            cantidadAlumnos: 10,
            porcentajeAsistencia: 82,
            indicadorGeneral: "Bueno",
            observaciones: "El informe todavía debe ser revisado antes de su finalización.",
            resumen: "Se trabajaron conceptos introductorios de diseño, formas, colores y composición visual.",
            ultimaActualizacion: "2026-06-01T12:30:00"
        }
    ],
    administradores: [
        {
            id: 1,
            nombre: "Carlos",
            apellido: "Pérez",
            rol: "Administrador",
            area: "Administración INAU"
        }
    ],
};