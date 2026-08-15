/*
    MOCK-DATA.JS - FRONTEND ADMIN
    Este archivo contiene datos simulados.
    Por ahora no existe conexión con PHP ni MySQL, por lo que estos objetos representan temporalmente la información que más adelante llegará desde el backend.

*/

window.DATOS_SIMULADOS = {

    // USUARIO ACTUAL - ADMINISTRADOR

    usuarioActual: {
        id: 1,
        nombre: "Carlos",
        apellido: "Pérez",
        cedula: "3.456.789-0",
        correo: "carlos.perez@inau.gov.uy",
        telefono: "099 456 789",
        rol: "Administrador",
        fechaRegistro: "2026-01-15",
        ultimoAcceso: "2026-08-15 09:30"
    },

    // TALLERES

    talleres: [
        {
            id: 1,
            talleristaId: 5,
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
            talleristaId: 5,
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
            talleristaId: 5,
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

    // ALUMNOS

    alumnos: [
        {
            id: 1,
            nombre: "Sofía",
            apellido: "Pereira",
            cedula: "5.123.456-7",
            correo: "sofia.pereira@email.com",
            telefono: "099 111 111",
            fechaNacimiento: "2008-05-12",
            estado: "Activo",
            fechaRegistro: "2026-03-10",
            ultimaAsistencia: "2026-08-14"
        },
        {
            id: 2,
            nombre: "Mateo",
            apellido: "Rodríguez",
            cedula: "5.234.567-8",
            correo: "mateo.rodriguez@email.com",
            telefono: "099 222 222",
            fechaNacimiento: "2009-03-25",
            estado: "Activo",
            fechaRegistro: "2026-03-10",
            ultimaAsistencia: "2026-08-15"
        },
        {
            id: 3,
            nombre: "Valentina",
            apellido: "González",
            cedula: "5.345.678-9",
            correo: "valentina.gonzalez@email.com",
            telefono: "099 333 333",
            fechaNacimiento: "2008-11-18",
            estado: "Activo",
            fechaRegistro: "2026-03-15",
            ultimaAsistencia: null
        },
        {
            id: 4,
            nombre: "Thiago",
            apellido: "Martínez",
            cedula: "5.456.789-0",
            correo: "thiago.martinez@email.com",
            telefono: "099 444 444",
            fechaNacimiento: "2009-07-30",
            estado: "Activo",
            fechaRegistro: "2026-03-20",
            ultimaAsistencia: "2026-08-13"
        },
        {
            id: 5,
            nombre: "Martina",
            apellido: "Silva",
            cedula: "5.567.890-1",
            correo: "martina.silva@email.com",
            telefono: "099 555 555",
            fechaNacimiento: "2008-02-14",
            estado: "Activo",
            fechaRegistro: "2026-03-10",
            ultimaAsistencia: "2026-08-14"
        },
        {
            id: 6,
            nombre: "Benjamín",
            apellido: "Fernández",
            cedula: "5.678.901-2",
            correo: "benjamin.fernandez@email.com",
            telefono: "099 666 666",
            fechaNacimiento: "2009-09-22",
            estado: "Activo",
            fechaRegistro: "2026-03-12",
            ultimaAsistencia: "2026-08-15"
        },
        {
            id: 7,
            nombre: "Lucía",
            apellido: "López",
            cedula: "5.789.012-3",
            correo: "lucia.lopez@email.com",
            telefono: "099 777 777",
            fechaNacimiento: "2008-12-05",
            estado: "Activo",
            fechaRegistro: "2026-03-15",
            ultimaAsistencia: "2026-08-12"
        },
        {
            id: 8,
            nombre: "Joaquín",
            apellido: "Sosa",
            cedula: "5.890.123-4",
            correo: "joaquin.sosa@email.com",
            telefono: "099 888 888",
            fechaNacimiento: "2009-01-19",
            estado: "Activo",
            fechaRegistro: "2026-03-18",
            ultimaAsistencia: "2026-08-14"
        },
        {
            id: 9,
            nombre: "Catalina",
            apellido: "Díaz",
            cedula: "5.901.234-5",
            correo: "catalina.diaz@email.com",
            telefono: "099 999 999",
            fechaNacimiento: "2008-06-11",
            estado: "Activo",
            fechaRegistro: "2026-03-10",
            ultimaAsistencia: null
        },
        {
            id: 10,
            nombre: "Felipe",
            apellido: "Torres",
            cedula: "5.012.345-6",
            correo: "felipe.torres@email.com",
            telefono: "099 100 100",
            fechaNacimiento: "2009-04-28",
            estado: "Activo",
            fechaRegistro: "2026-03-14",
            ultimaAsistencia: "2026-08-15"
        },
        {
            id: 11,
            nombre: "Emma",
            apellido: "Suárez",
            cedula: "5.112.233-4",
            correo: "emma.suarez@email.com",
            telefono: "099 110 110",
            fechaNacimiento: "2008-08-17",
            estado: "Inactivo",
            fechaRegistro: "2026-03-10",
            ultimaAsistencia: "2026-07-20"
        },
        {
            id: 12,
            nombre: "Agustín",
            apellido: "Acosta",
            cedula: "5.223.344-5",
            correo: "agustin.acosta@email.com",
            telefono: "099 120 120",
            fechaNacimiento: "2009-10-09",
            estado: "Activo",
            fechaRegistro: "2026-03-16",
            ultimaAsistencia: "2026-08-13"
        },
        {
            id: 13,
            nombre: "Julieta",
            apellido: "Ramos",
            cedula: "5.334.455-6",
            correo: "julieta.ramos@email.com",
            telefono: "099 130 130",
            fechaNacimiento: "2008-01-03",
            estado: "Activo",
            fechaRegistro: "2026-03-12",
            ultimaAsistencia: "2026-08-14"
        },
        {
            id: 14,
            nombre: "Santiago",
            apellido: "Méndez",
            cedula: "5.445.566-7",
            correo: "santiago.mendez@email.com",
            telefono: "099 140 140",
            fechaNacimiento: "2009-05-26",
            estado: "Activo",
            fechaRegistro: "2026-03-19",
            ultimaAsistencia: "2026-08-15"
        },
        {
            id: 15,
            nombre: "Camila",
            apellido: "Viera",
            cedula: "5.556.677-8",
            correo: "camila.viera@email.com",
            telefono: "099 150 150",
            fechaNacimiento: "2008-09-08",
            estado: "Activo",
            fechaRegistro: "2026-03-10",
            ultimaAsistencia: "2026-08-13"
        }
    ],

    talleristas: [
        {
            id: 1,
            nombre: "María",
            apellido: "López",
            cedula: "1.111.111-1",
            correo: "maria.lopez@inau.gov.uy",
            telefono: "099 201 201",
            especialidad: "Programación Web",
            estado: "Activo",
            fechaRegistro: "2026-01-20",
            talleresAsignados: []
        },
        {
            id: 2,
            nombre: "Pedro",
            apellido: "Fernández",
            cedula: "1.111.111-2",
            correo: "pedro.fernandez@inau.gov.uy",
            telefono: "099 202 202",
            especialidad: "Diseño Gráfico",
            estado: "Activo",
            fechaRegistro: "2026-01-25",
            talleresAsignados: []
        },
        {
            id: 3,
            nombre: "Lucía",
            apellido: "Pintos",
            cedula: "1.111.111-3",
            correo: "lucia.pintos@inau.gov.uy",
            telefono: "099 203 203",
            especialidad: "Robótica",
            estado: "Activo",
            fechaRegistro: "2026-02-02",
            talleresAsignados: []
        },
        {
            id: 4,
            nombre: "Diego",
            apellido: "Correa",
            cedula: "1.111.111-4",
            correo: "diego.correa@inau.gov.uy",
            telefono: "099 204 204",
            especialidad: "Programación Web",
            estado: "Inactivo",
            fechaRegistro: "2026-02-10",
            talleresAsignados: []
        },
        {
            id: 5,
            nombre: "Martín",
            apellido: "Rodríguez",
            cedula: "4.567.890-1",
            correo: "martin.rodriguez@ejemplo.com",
            telefono: "099 123 456",
            especialidad: "Programación Web, Robótica y Diseño Gráfico",
            estado: "Activo",
            fechaRegistro: "2026-03-10",
            talleresAsignados: [1, 2, 3]
        }
    ],

    inscripciones: [
        {
            tallerId: 1,
            alumnoIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
        },
        {
            tallerId: 2,
            alumnoIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
        },
        {
            tallerId: 3,
            alumnoIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        }
    ],

    asistencias: [
        {
            id: 1,
            tallerId: 1,
            fecha: "2026-08-14",
            registros: [
                { alumnoId: 1, estado: "Presente", observaciones: "" },
                { alumnoId: 2, estado: "Presente", observaciones: "" },
                { alumnoId: 3, estado: "Ausente", observaciones: "Enfermo" },
                { alumnoId: 4, estado: "Presente", observaciones: "" },
                { alumnoId: 5, estado: "Presente", observaciones: "" },
                { alumnoId: 6, estado: "Justificado", observaciones: "Trámite" },
                { alumnoId: 7, estado: "Presente", observaciones: "" },
                { alumnoId: 8, estado: "Presente", observaciones: "" },
                { alumnoId: 9, estado: "Ausente", observaciones: "" },
                { alumnoId: 10, estado: "Presente", observaciones: "" }
            ]
        },
        {
            id: 2,
            tallerId: 1,
            fecha: "2026-08-12",
            registros: [
                { alumnoId: 1, estado: "Presente", observaciones: "" },
                { alumnoId: 2, estado: "Justificado", observaciones: "Trámite" },
                { alumnoId: 3, estado: "Presente", observaciones: "" },
                { alumnoId: 4, estado: "Presente", observaciones: "" },
                { alumnoId: 5, estado: "Presente", observaciones: "" }
            ]
        },
        {
            id: 3,
            tallerId: 2,
            fecha: "2026-08-13",
            registros: [
                { alumnoId: 1, estado: "Presente", observaciones: "" },
                { alumnoId: 2, estado: "Presente", observaciones: "" },
                { alumnoId: 7, estado: "Justificado", observaciones: "Médico" }
            ]
        },
        {
            id: 4,
            tallerId: 3,
            fecha: "2026-08-08",
            registros: [
                { alumnoId: 1, estado: "Presente", observaciones: "" },
                { alumnoId: 3, estado: "Presente", observaciones: "" },
                { alumnoId: 5, estado: "Ausente", observaciones: "" },
                { alumnoId: 8, estado: "Presente", observaciones: "" }
            ]
        },
        {
            id: 5,
            tallerId: 2,
            fecha: "2026-08-06",
            registros: [
                { alumnoId: 1, estado: "Presente", observaciones: "" },
                { alumnoId: 2, estado: "Presente", observaciones: "" },
                { alumnoId: 7, estado: "Presente", observaciones: "" },
                { alumnoId: 9, estado: "Ausente", observaciones: "No avisó" }
            ]
        },
        {
            id: 6,
            tallerId: 1,
            fecha: "2026-08-07",
            registros: [
                { alumnoId: 1, estado: "Presente", observaciones: "" },
                { alumnoId: 4, estado: "Presente", observaciones: "" },
                { alumnoId: 6, estado: "Presente", observaciones: "" },
                { alumnoId: 11, estado: "Justificado", observaciones: "Certificado médico" }
            ]
        }
    ],

    reportes: [
        {
            id: 1,
            nombre: "Reporte de Asistencia - Agosto 2026",
            tipo: "Asistencia",
            tallerId: 1,
            fechaInicio: "2026-08-01",
            fechaFin: "2026-08-15",
            fechaGeneracion: "2026-08-15 09:00",
            contenido: {
                totalClases: 4,
                asistenciasRegistradas: 12,
                presentes: 10,
                ausentes: 2,
                justificados: 0
            },
            formato: "PDF",
            generadoPor: 1
        },
        {
            id: 2,
            nombre: "Reporte de Talleres Activos",
            tipo: "Talleres",
            tallerId: null,
            fechaInicio: "2026-03-01",
            fechaFin: "2026-08-15",
            fechaGeneracion: "2026-08-15 10:30",
            contenido: {
                totalTalleres: 3,
                activos: 3,
                finalizados: 0,
                suspendidos: 0
            },
            formato: "Excel",
            generadoPor: 1
        },
        {
            id: 3,
            nombre: "Reporte de Asistencia - Robótica",
            tipo: "Asistencia",
            tallerId: 2,
            fechaInicio: "2026-08-01",
            fechaFin: "2026-08-15",
            fechaGeneracion: "2026-08-13 16:45",
            contenido: {
                totalClases: 2,
                asistenciasRegistradas: 7,
                presentes: 6,
                ausentes: 1,
                justificados: 1
            },
            formato: "PDF",
            generadoPor: 1
        },
        {
            id: 4,
            nombre: "Reporte de Alumnos Inscriptos",
            tipo: "Alumnos",
            tallerId: null,
            fechaInicio: "2026-03-01",
            fechaFin: "2026-08-15",
            fechaGeneracion: "2026-08-14 11:15",
            contenido: {
                totalAlumnos: 15,
                activos: 14,
                inactivos: 1
            },
            formato: "Excel",
            generadoPor: 1
        },
        {
            id: 5,
            nombre: "Reporte de Talleristas",
            tipo: "Talleristas",
            tallerId: null,
            fechaInicio: "2026-01-01",
            fechaFin: "2026-08-15",
            fechaGeneracion: "2026-08-10 09:20",
            contenido: {
                totalTalleristas: 4,
                activos: 3,
                inactivos: 1
            },
            formato: "PDF",
            generadoPor: 1
        }
    ],

    // MENSAJES
    // Mensajería interna entre administración y talleristas.
    // Modelo tomado de docs/primeraVista.md (sección 6.6), ya que
    // este módulo todavía no existe implementado del lado del tallerista.

    mensajes: [
        {
            id: 1,
            conversacionId: 1,
            talleristaId: 1,
            remitenteRol: "Tallerista",
            destinatarioRol: "Administrador",
            contenido: "Buenas, quería avisar que el salón de Programación Web va a estar en mantenimiento el próximo lunes.",
            fecha: "2026-08-10 09:15",
            leido: true
        },
        {
            id: 2,
            conversacionId: 1,
            talleristaId: 1,
            remitenteRol: "Administrador",
            destinatarioRol: "Tallerista",
            contenido: "Gracias por avisar, ya coordinamos un salón alternativo para ese día.",
            fecha: "2026-08-10 10:02",
            leido: true
        },
        {
            id: 3,
            conversacionId: 2,
            talleristaId: 2,
            remitenteRol: "Tallerista",
            destinatarioRol: "Administrador",
            contenido: "Necesito más materiales de diseño para los próximos talleres, ¿podemos coordinar la compra?",
            fecha: "2026-08-14 14:20",
            leido: false
        },
        {
            id: 4,
            conversacionId: 3,
            talleristaId: 3,
            remitenteRol: "Tallerista",
            destinatarioRol: "Administrador",
            contenido: "Consulta: ¿ya está confirmada mi asignación al taller de Robótica?",
            fecha: "2026-08-15 08:40",
            leido: false
        },
        {
            id: 5,
            conversacionId: 4,
            talleristaId: 5,
            remitenteRol: "Tallerista",
            destinatarioRol: "Administrador",
            contenido: "Hola, les paso el informe mensual de Programación Web, cualquier consulta quedo atento.",
            fecha: "2026-08-11 17:10",
            leido: true
        }
    ]





};