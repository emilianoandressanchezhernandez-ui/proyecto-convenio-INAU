-- =====================================================================
-- Sistema de Gestión de Talleres en Convenio con INAU
-- Base de datos: inau_talleres
-- Motor: MySQL 8.0 o superior (requiere soporte de CHECK constraints)
-- =====================================================================

DROP DATABASE IF EXISTS inau_talleres;

CREATE DATABASE inau_talleres
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE inau_talleres;


-- =====================================================================
-- 1. USUARIOS Y ACCESO
-- =====================================================================

-- Punto único de autenticación del sistema (RF01).
-- Incluye los tres roles: administrador, tallerista y alumno.
CREATE TABLE usuarios (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    nombre         VARCHAR(100)  NOT NULL,
    apellido       VARCHAR(100)  NOT NULL,
    cedula         VARCHAR(20)   NOT NULL UNIQUE,
    correo         VARCHAR(150)  NOT NULL UNIQUE,
    telefono       VARCHAR(30),
    clave_hash     VARCHAR(255)  NOT NULL,
    rol            ENUM('admin', 'tallerista', 'alumno') NOT NULL,
    especialidad   VARCHAR(150),
    estado         ENUM('Activo', 'Inactivo') NOT NULL DEFAULT 'Activo',
    fecha_registro DATE NOT NULL,
    ultimo_acceso  DATETIME,

    INDEX idx_usuarios_rol (rol),
    INDEX idx_usuarios_estado (estado)
);


-- Ficha del alumno como participante del programa.
-- usuario_id es NULL mientras el administrador lo registró pero aún no
-- se le creó cuenta de acceso.
CREATE TABLE alumnos (
    id                 INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id         INT NULL UNIQUE,
    nombre             VARCHAR(100)  NOT NULL,
    apellido           VARCHAR(100)  NOT NULL,
    cedula             VARCHAR(20)   NOT NULL UNIQUE,
    correo             VARCHAR(150),
    telefono           VARCHAR(30),
    direccion          VARCHAR(200),
    referente_adulto   VARCHAR(150),
    centro_referencia  VARCHAR(150),
    fecha_nacimiento   DATE NOT NULL,
    estado             ENUM('Activo', 'Inactivo') NOT NULL DEFAULT 'Activo',
    fecha_registro     DATE NOT NULL,
    ultima_asistencia  DATE,
    observaciones      TEXT,

    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_alumnos_estado (estado)
);


-- =====================================================================
-- 2. TALLERES
-- =====================================================================

CREATE TABLE talleres (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    nombre         VARCHAR(150)  NOT NULL,
    tematica       VARCHAR(100),
    descripcion    TEXT,
    centro         VARCHAR(150),
    direccion      VARCHAR(200),
    salon          VARCHAR(100),
    fecha_inicio   DATE NOT NULL,
    fecha_fin      DATE NOT NULL,
    estado         ENUM('Activo', 'Finalizado') NOT NULL DEFAULT 'Activo',
    observaciones  TEXT,

    INDEX idx_talleres_estado (estado)
);


-- Asignación de talleristas a talleres (RF03).
-- Relación N:M: un taller puede tener varios talleristas y un tallerista
-- puede estar a cargo de varios talleres.
CREATE TABLE taller_tallerista (
    id                INT AUTO_INCREMENT PRIMARY KEY,
    taller_id         INT NOT NULL,
    tallerista_id     INT NOT NULL,
    fecha_asignacion  DATE NOT NULL,

    FOREIGN KEY (taller_id)     REFERENCES talleres(id) ON DELETE CASCADE,
    FOREIGN KEY (tallerista_id) REFERENCES usuarios(id),
    UNIQUE (taller_id, tallerista_id)
);


CREATE TABLE horarios_taller (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    taller_id     INT NOT NULL,
    dia           VARCHAR(20) NOT NULL,
    hora_inicio   TIME NOT NULL,
    hora_fin      TIME NOT NULL,

    FOREIGN KEY (taller_id) REFERENCES talleres(id) ON DELETE CASCADE
);


-- Inscripción de alumnos a talleres (RF03).
CREATE TABLE inscripciones (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    taller_id   INT NOT NULL,
    alumno_id   INT NOT NULL,

    FOREIGN KEY (taller_id) REFERENCES talleres(id) ON DELETE CASCADE,
    FOREIGN KEY (alumno_id) REFERENCES alumnos(id)  ON DELETE CASCADE,
    UNIQUE (taller_id, alumno_id)
);


-- =====================================================================
-- 3. ASISTENCIA (RF04, RF05)
-- =====================================================================

-- Cabecera: una jornada de asistencia por taller y fecha.
CREATE TABLE asistencias (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    taller_id   INT NOT NULL,
    fecha       DATE NOT NULL,

    FOREIGN KEY (taller_id) REFERENCES talleres(id) ON DELETE CASCADE,
    UNIQUE (taller_id, fecha),
    INDEX idx_asistencias_fecha (fecha)
);


-- Detalle: estado de cada alumno dentro de una jornada.
CREATE TABLE registros_asistencia (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    asistencia_id  INT NOT NULL,
    alumno_id      INT NOT NULL,
    estado         ENUM('Presente', 'Ausente', 'Justificado', 'Tardanza') NOT NULL,
    observaciones  TEXT,

    FOREIGN KEY (asistencia_id) REFERENCES asistencias(id) ON DELETE CASCADE,
    FOREIGN KEY (alumno_id)     REFERENCES alumnos(id)     ON DELETE CASCADE,
    UNIQUE (asistencia_id, alumno_id)
);


-- =====================================================================
-- 4. MATERIAL, TAREAS Y ENTREGAS (RF06 a RF10)
-- =====================================================================

-- Material y tareas comparten tabla, diferenciados por 'tipo'.
-- fecha_limite solo aplica a las tareas.
CREATE TABLE contenidos (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    taller_id           INT NOT NULL,
    tipo                ENUM('Material', 'Tarea') NOT NULL,
    titulo              VARCHAR(200) NOT NULL,
    descripcion         TEXT,
    fecha_publicacion   DATE NOT NULL,
    fecha_limite        DATE,

    FOREIGN KEY (taller_id) REFERENCES talleres(id) ON DELETE CASCADE,
    INDEX idx_contenidos_tipo (tipo)
);


-- Entrega de un alumno para una tarea, con su corrección y nota.
CREATE TABLE entregas (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    contenido_id     INT NOT NULL,
    alumno_id        INT NOT NULL,
    fecha_entrega    DATE,
    estado           ENUM('Pendiente', 'Entregada', 'Corregida') NOT NULL DEFAULT 'Pendiente',
    nota             TINYINT,
    comentario       TEXT,

    FOREIGN KEY (contenido_id) REFERENCES contenidos(id) ON DELETE CASCADE,
    FOREIGN KEY (alumno_id)    REFERENCES alumnos(id)    ON DELETE CASCADE,
    UNIQUE (contenido_id, alumno_id),
    CONSTRAINT chk_entregas_nota CHECK (nota IS NULL OR (nota BETWEEN 1 AND 10))
);


-- =====================================================================
-- 5. ARCHIVOS ADJUNTOS (RF06, RF08, NRF11, NRF12)
-- =====================================================================

-- Un adjunto pertenece a un contenido (material o consigna de tarea)
-- o a una entrega de alumno, pero nunca a ambos.
-- nombre_original: el que ve el usuario.
-- nombre_archivo: el generado de forma segura para el filesystem.
CREATE TABLE adjuntos (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    contenido_id     INT NULL,
    entrega_id       INT NULL,
    nombre_original  VARCHAR(255) NOT NULL,
    nombre_archivo   VARCHAR(255) NOT NULL UNIQUE,
    ruta             VARCHAR(500) NOT NULL,
    tipo_mime        VARCHAR(100) NOT NULL,
    tamano_bytes     INT NOT NULL,
    fecha_subida     DATETIME NOT NULL,

    FOREIGN KEY (contenido_id) REFERENCES contenidos(id) ON DELETE CASCADE,
    FOREIGN KEY (entrega_id)   REFERENCES entregas(id)   ON DELETE CASCADE,
    CONSTRAINT chk_adjuntos_origen CHECK (
        (contenido_id IS NOT NULL AND entrega_id IS NULL) OR
        (contenido_id IS NULL AND entrega_id IS NOT NULL)
    )
);


-- =====================================================================
-- 6. REPORTES Y TRAZABILIDAD (RF11 a RF13, RF19, RF22, NRF10)
-- =====================================================================

CREATE TABLE reportes (
    id                 INT AUTO_INCREMENT PRIMARY KEY,
    nombre             VARCHAR(200) NOT NULL,
    tipo               VARCHAR(50)  NOT NULL,
    taller_id          INT,
    fecha_inicio       DATE,
    fecha_fin          DATE,
    fecha_generacion   DATETIME NOT NULL,
    contenido          JSON,
    formato            VARCHAR(20) NOT NULL DEFAULT 'PDF',
    generado_por       INT NOT NULL,
    estado             VARCHAR(30) NOT NULL DEFAULT 'Generado',

    FOREIGN KEY (taller_id)    REFERENCES talleres(id) ON DELETE SET NULL,
    FOREIGN KEY (generado_por) REFERENCES usuarios(id)
);


CREATE TABLE trazabilidad (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id   INT NOT NULL,
    accion       VARCHAR(20) NOT NULL,   -- 'crear' | 'editar' | 'eliminar' | 'baja_logica'
    entidad      VARCHAR(50) NOT NULL,   -- 'taller' | 'alumno' | 'contenido' | etc.
    entidad_id   INT NOT NULL,
    fecha        DATETIME NOT NULL,
    detalle      JSON,

    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    INDEX idx_trazabilidad_fecha (fecha),
    INDEX idx_trazabilidad_entidad (entidad, entidad_id)
);




# --- =====================================================================
# --- DATOS DE PRUEBA
# -- =====================================================================

-- Usuarios: 1 administrador, 2 talleristas, 2 alumnos con cuenta
INSERT INTO usuarios (nombre, apellido, cedula, correo, telefono, clave_hash, rol, especialidad, estado, fecha_registro) VALUES
('Carlos', 'Pérez',     '3.456.789-0', 'carlos.perez@inau.gov.uy',     '099 456 789', '$2y$12$.Fvn3QkhSJip4AEcBNeH3eUFB67Y/zUXpnpVzHvNme3qcHV1zlwjm', 'admin',      NULL,                                          'Activo', '2026-01-15'),
('María',  'López',     '1.111.111-1', 'maria.lopez@inau.gov.uy',      '099 201 201', '$2y$12$TKsTID4s7JybYg.l7mJVkuhBL.3dz4utOUxK.w4..tfcZWZdANTcO', 'tallerista', 'Programación Web',                            'Activo', '2026-01-20'),
('Martín', 'Rodríguez', '4.567.890-1', 'martin.rodriguez@ejemplo.com', '099 123 456', '$2y$12$TKsTID4s7JybYg.l7mJVkuhBL.3dz4utOUxK.w4..tfcZWZdANTcO', 'tallerista', 'Programación Web, Robótica y Diseño Gráfico', 'Activo', '2026-03-10'),
('Sofía',  'Pereira',   '5.123.456-7', 'sofia.pereira@email.com',      '099 111 111', '$2y$12$TKsTID4s7JybYg.l7mJVkuhBL.3dz4utOUxK.w4..tfcZWZdANTcO', 'alumno',     NULL,                                          'Activo', '2026-03-10'),
('Mateo',  'Rodríguez', '5.234.567-8', 'mateo.rodriguez@email.com',    '099 222 222', '$2y$12$TKsTID4s7JybYg.l7mJVkuhBL.3dz4utOUxK.w4..tfcZWZdANTcO', 'alumno',     NULL,                                          'Activo', '2026-03-10');


-- Alumnos: los dos primeros con cuenta vinculada, el tercero sin acceso todavía
INSERT INTO alumnos (usuario_id, nombre, apellido, cedula, correo, telefono, direccion, referente_adulto, centro_referencia, fecha_nacimiento, estado, fecha_registro, ultima_asistencia, observaciones) VALUES
(4,    'Sofía',   'Pereira',   '5.123.456-7', 'sofia.pereira@email.com',   '099 111 111', 'Av. Artigas 1234', 'Ana Pereira',    'Centro 1', '2008-05-12', 'Activo', '2026-03-10', '2026-08-14', ''),
(5,    'Mateo',   'Rodríguez', '5.234.567-8', 'mateo.rodriguez@email.com', '099 222 222', 'Calle 18 de Julio 567', 'Luis Rodríguez', 'Centro 1', '2009-03-25', 'Activo', '2026-03-10', NULL, ''),
(NULL, 'Valentina', 'Gómez',   '5.345.678-9', NULL,                        '099 333 333', 'Ruta 11 km 3',     'Marta Gómez',    'Centro 2', '2008-11-02', 'Activo', '2026-08-20', NULL, 'Registrada por administración, cuenta de acceso pendiente.');


INSERT INTO talleres (nombre, tematica, descripcion, centro, direccion, salon, fecha_inicio, fecha_fin, estado) VALUES
('Programación Web', 'Tecnología', 'Introducción a HTML, CSS y JavaScript.', 'Centro 1', 'Calle Falsa 123', 'Salón A', '2026-03-01', '2026-12-01', 'Activo'),
('Robótica',         'Tecnología', 'Introducción a sensores y circuitos.',   'Centro 1', 'Calle Falsa 123', 'Salón B', '2026-03-01', '2026-12-01', 'Activo');


-- El taller 1 tiene dos talleristas asignados; el taller 2, uno solo
INSERT INTO taller_tallerista (taller_id, tallerista_id, fecha_asignacion) VALUES
(1, 3, '2026-03-01'),
(1, 2, '2026-04-15'),
(2, 3, '2026-03-01');


INSERT INTO horarios_taller (taller_id, dia, hora_inicio, hora_fin) VALUES
(1, 'Lunes',     '14:00', '16:00'),
(1, 'Miércoles', '14:00', '16:00'),
(2, 'Martes',    '15:00', '17:00');


INSERT INTO inscripciones (taller_id, alumno_id) VALUES
(1, 1), (1, 2), (2, 1), (1, 3);


INSERT INTO contenidos (taller_id, tipo, titulo, descripcion, fecha_publicacion, fecha_limite) VALUES
(1, 'Material', 'Guía de HTML básico',  'Introducción a etiquetas HTML y estructura de una página web.', '2026-08-01', NULL),
(1, 'Tarea',    'Primera página web',   'Crear una página HTML simple con título, párrafo e imagen.',    '2026-08-03', '2026-08-17');


INSERT INTO entregas (contenido_id, alumno_id, fecha_entrega, estado, nota, comentario) VALUES
(2, 1, '2026-08-15', 'Corregida', 9,    'Muy prolijo el orden de las etiquetas, buen trabajo.'),
(2, 2, '2026-08-16', 'Entregada', NULL, NULL);


-- Adjuntos: uno del material publicado y uno por cada entrega de alumno
INSERT INTO adjuntos (contenido_id, entrega_id, nombre_original, nombre_archivo, ruta, tipo_mime, tamano_bytes, fecha_subida) VALUES
(1,    NULL, 'guia-html.pdf',     'a1f4c8e2b93d47.pdf',  '/uploads/contenidos/', 'application/pdf', 482310, '2026-08-01 10:15:00'),
(NULL, 1,    'pagina-sofia.html', '7d2b9f0ac41e58.html', '/uploads/entregas/',   'text/html',        12480, '2026-08-15 19:42:00'),
(NULL, 2,    'pagina-mateo.html', 'c39e5a71bd8062.html', '/uploads/entregas/',   'text/html',        10920, '2026-08-16 21:07:00');


-- Registro de asistencia de una jornada del taller 1
INSERT INTO asistencias (taller_id, fecha) VALUES
(1, '2026-08-14');

INSERT INTO registros_asistencia (asistencia_id, alumno_id, estado, observaciones) VALUES
(1, 1, 'Presente',    NULL),
(1, 2, 'Ausente',     NULL),
(1, 3, 'Justificado', 'Presentó certificado médico.');


-- Trazabilidad de ejemplo
INSERT INTO trazabilidad (usuario_id, accion, entidad, entidad_id, fecha, detalle) VALUES
(3, 'crear',  'contenido', 2, '2026-08-03 09:30:00', '{"titulo": "Primera página web", "tipo": "Tarea"}'),
(3, 'editar', 'entrega',   1, '2026-08-16 08:12:00', '{"campo": "nota", "valor_anterior": null, "valor_nuevo": 9}'),
(1, 'crear',  'alumno',    3, '2026-08-20 11:05:00', '{"nombre": "Valentina Gómez"}');