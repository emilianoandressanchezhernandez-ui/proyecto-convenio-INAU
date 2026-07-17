# Documentación general del proyecto

## Sistema de Gestión de Talleres en Convenio con INAU

**Proyecto de egreso – 3.º EMT Informática 2026**
**Estado documentado:** 17 de julio de 2026

### Integrantes registrados en el repositorio

* Emiliano Sánchez – Coordinador.
* Gabriel Rendon – Subcoordinador - Base de datos.
* Ignacio Viera – Frontend.
* Maximiliano Leal – Fronted.
* Thiago Ferragut – Backend.

---

## 1. Resumen ejecutivo

El proyecto consiste en desarrollar una aplicación web para organizar y controlar los talleres realizados en convenio con INAU. El sistema busca centralizar información que actualmente resulta difícil de consultar, actualizar y seguir, como los talleres, los alumnos asignados, las asistencias, los informes y la comunicación entre talleristas y administración.

La solución se plantea como un sistema compuesto por dos interfaces diferenciadas:

* un panel para talleristas;
* un panel para administradores.

Ambas interfaces compartirán un backend centralizado, encargado de la autenticación, la lógica del negocio, los permisos, la persistencia de datos y la comunicación con una base de datos MySQL.

Actualmente, el desarrollo se encuentra concentrado en el frontend. El panel del tallerista ya pasó de ser un conjunto de páginas estáticas a una interfaz dinámica que trabaja con datos simulados, parámetros de URL y almacenamiento local.

El panel administrador conserva sus pantallas HTML y CSS, pero su JavaScript y sus operaciones de gestión todavía están pendientes. El backend, la base de datos y la API REST se desarrollarán en etapas posteriores.

---

## 2. Origen y necesidad del proyecto

El proyecto surge a partir de una necesidad real detectada mediante una entrevista al cliente. El problema principal identificado fue la falta de una plataforma que facilite el acceso, la disponibilidad, la privacidad y la organización de las actividades realizadas en los talleres.

Entre las dificultades del proceso actual se destacan:

* información distribuida o poco centralizada;
* dificultad para consultar talleres, alumnos y asistencias;
* falta de una herramienta única para registrar y modificar información;
* comunicación limitada entre los diferentes responsables;
* dificultad para generar informes y realizar un seguimiento preciso;
* necesidad de acceder desde diferentes dispositivos y ubicaciones.

La entrevista planteó inicialmente una plataforma similar a un entorno educativo, con acceso para alumnos, talleristas y administradores. Sin embargo, la especificación técnica posterior redujo el alcance de la primera versión a dos tipos de usuario autenticado: administrador y tallerista.

Los alumnos quedan registrados como personas vinculadas a los talleres, pero no acceden directamente al sistema en el alcance actual.

Esta evolución permite concentrar la primera versión en los procesos más importantes para la organización interna:

* gestión de talleres;
* asignación de alumnos;
* control de asistencia;
* generación y consulta de informes;
* mensajería administrativa.

---

## 3. Problema que se busca resolver

La institución necesita una herramienta digital que permita registrar, consultar y mantener información confiable sobre los talleres y sus actividades. Sin un sistema centralizado, el seguimiento puede depender de registros separados, comunicaciones informales o procesos manuales.

El sistema busca resolver principalmente los siguientes problemas:

1. Falta de centralización de la información.
2. Dificultad para conocer qué alumnos pertenecen a cada taller.
3. Falta de un registro ordenado de asistencias por alumno, fecha y taller.
4. Dificultad para consultar el historial y generar informes.
5. Falta de una vía interna y trazable de comunicación entre talleristas y administración.
6. Riesgo de que los usuarios accedan o modifiquen información que no corresponde a su rol.
7. Necesidad de utilizar la plataforma desde computadoras, tablets y teléfonos.

---

## 4. Objetivos

### 4.1 Objetivo general

Desarrollar una aplicación web responsive, organizada y escalable que permita gestionar talleres en convenio con INAU, controlar la asistencia de los alumnos, consultar informes y mantener una comunicación interna entre talleristas y administradores.

### 4.2 Objetivos específicos

* Centralizar la información de usuarios, talleristas, alumnos y talleres.
* Diferenciar las funciones y permisos según el rol del usuario.
* Permitir al tallerista consultar únicamente los talleres que tiene asignados.
* Registrar la asistencia de los alumnos por taller y fecha.
* Evitar registros duplicados de asistencia para un mismo alumno, taller y fecha.
* Permitir la consulta de informes y estadísticas básicas.
* Implementar una mensajería interna entre talleristas y administración.
* Preparar el frontend para conectarse posteriormente a una API REST.
* Mantener una estructura de archivos clara y modular.
* Aplicar control de versiones, documentación y pruebas durante el desarrollo.
* Proteger los datos personales y limitar la modificación de información sensible.

---

## 5. Público objetivo y actores del sistema

### 5.1 Administrador

El administrador tendrá acceso a la gestión general del sistema. Entre sus responsabilidades previstas se encuentran:

* administrar cuentas de usuarios;
* registrar, consultar, modificar y dar de baja lógica a talleristas;
* registrar, consultar, modificar y dar de baja lógica a alumnos;
* crear y administrar talleres;
* asignar alumnos y talleristas a los talleres;
* consultar y corregir registros de asistencia;
* consultar informes generales;
* enviar y recibir mensajes internos;
* revisar modificaciones y conservar trazabilidad.

### 5.2 Tallerista

El tallerista tendrá acceso limitado a la información relacionada con su trabajo. Podrá:

* consultar su perfil;
* visualizar sus talleres asignados;
* consultar los datos de cada taller;
* ver los alumnos vinculados a sus talleres;
* registrar asistencias;
* consultar informes relacionados;
* comunicarse con la administración.

Los datos de identificación del tallerista, como nombre, apellido y cédula, deben mostrarse como información de solo lectura en su perfil.

El tallerista puede modificar datos de contacto, como correo y teléfono, y solicitar un cambio de contraseña. La autorización definitiva deberá aplicarse también en el backend.

### 5.3 Alumnos

En el alcance técnico actual, los alumnos no tienen cuenta de acceso. Son entidades administradas dentro del sistema y pueden estar relacionados con uno o varios talleres.

La entrevista original contemplaba un posible acceso futuro para que los alumnos consultaran materiales y entregaran tareas. Esta funcionalidad queda fuera de la primera versión y puede considerarse una ampliación posterior.

---

## 6. Alcance funcional

### 6.1 Autenticación

Se prevé un único inicio de sesión ubicado en la raíz del proyecto. Una vez validadas las credenciales, el sistema deberá redirigir al usuario según su rol:

* administrador: panel administrador;
* tallerista: panel tallerista.

La autenticación real todavía no está implementada. La pantalla de acceso existe, pero necesita:

* conectarse a un archivo de autenticación;
* corregir sus rutas después de la reorganización de carpetas;
* validar las credenciales;
* crear una sesión segura;
* redirigir al panel correspondiente.

### 6.2 Gestión de talleres

El sistema deberá registrar, como mínimo:

* nombre;
* descripción;
* temática;
* ubicación;
* horarios;
* fecha de inicio y finalización;
* estado;
* talleristas asignados;
* alumnos asignados;
* documentos adjuntos.

En el frontend del tallerista ya existe un listado dinámico de talleres y una pantalla de detalle.

El listado muestra únicamente información resumida:

* nombre;
* estado;
* acceso al detalle.

La pantalla de detalle concentra:

* descripción;
* días y horarios;
* ubicación;
* cantidad de alumnos;
* asistencia promedio;
* estado;
* accesos a asistencia e informes.

### 6.3 Gestión de alumnos

Los alumnos deberán contener datos personales y de referencia. La especificación propone campos como:

* nombre y apellido;
* cédula;
* fecha de nacimiento;
* teléfono;
* dirección;
* correo;
* referente adulto;
* centro o programa de referencia;
* observaciones;
* situación de derivación;
* fecha de ingreso.

La asignación de alumnos a talleres será responsabilidad del administrador. Un alumno podrá participar en más de un taller.

### 6.4 Control de asistencia

El registro de asistencia debe relacionar:

* taller;
* alumno;
* fecha;
* estado;
* observaciones opcionales;
* usuario que creó o modificó el registro.

Los estados definidos en la especificación son:

* presente;
* ausente;
* justificado;
* tardanza.

La versión simulada actual implementa:

* presente;
* ausente;
* justificado.

La opción tardanza y las observaciones por alumno quedan pendientes.

El frontend actual permite:

* recibir el taller seleccionado mediante la URL;
* cargar los alumnos inscritos;
* elegir el estado de cada alumno;
* actualizar el contador de presentes;
* impedir el guardado si faltan estados;
* guardar temporalmente la asistencia;
* recuperar una asistencia previamente guardada para la misma fecha y taller.

### 6.5 Informes

La especificación contempla informes:

* por alumno;
* por rango de fechas;
* por taller;
* por tallerista;
* por relación entre talleristas y alumnos.

La versión actual incluye:

* listado de informes simulados;
* filtros por fecha;
* búsqueda por título, taller, tipo o estado;
* cantidad total de informes;
* informes del mes;
* última actualización;
* pantalla de detalle;
* impresión desde el navegador;
* descarga provisional como archivo de texto.

La generación real de archivos PDF o Excel deberá implementarse posteriormente desde el backend o mediante una herramienta específica.

### 6.6 Mensajería interna

La plataforma debe permitir mensajes entre talleristas y administradores.

Los mensajes incluyen:

* conversación;
* remitente;
* destinatario;
* contenido;
* fecha y hora;
* estado leído o no leído.

El módulo actual permite:

* mostrar conversaciones disponibles;
* seleccionar una conversación;
* visualizar el historial;
* distinguir mensajes enviados y recibidos;
* marcar automáticamente como leídos los mensajes recibidos;
* mostrar mensajes pendientes;
* impedir mensajes vacíos;
* limitar la extensión;
* enviar nuevas respuestas;
* conservar temporalmente la conversación en el navegador.

### 6.7 Perfil

El perfil del tallerista muestra:

* nombre;
* apellido;
* cédula;
* correo;
* teléfono;
* rol;
* identificador;
* fecha de registro;
* último acceso.

Nombre, apellido y cédula se muestran como campos de solo lectura. Correo y teléfono pueden editarse.

El cambio de contraseña se encuentra simulado y no almacena la contraseña en el navegador.

---

## 7. Requisitos no funcionales

El sistema deberá cumplir con los siguientes criterios:

* diseño responsive para computadora, tablet y teléfono;
* disponibilidad prevista las 24 horas una vez desplegado;
* rapidez en las operaciones habituales;
* navegación clara y consistente;
* validación de formularios tanto en frontend como en backend;
* separación entre frontend y backend;
* control de acceso por roles;
* protección de datos personales;
* persistencia confiable en MySQL;
* trazabilidad de acciones importantes;
* restricción de formatos y tamaños de archivos adjuntos;
* código organizado, reutilizable y mantenible;
* documentación técnica dentro del repositorio;
* uso de Git para registrar y revisar cambios.

---

## 8. Tecnologías y herramientas utilizadas

### 8.1 Tecnologías actuales

* **HTML5:** estructura de las páginas.
* **CSS3:** personalizaciones visuales.
* **Bootstrap 5.3:** diseño responsive y componentes.
* **Bootstrap Icons:** iconografía.
* **JavaScript Vanilla:** comportamiento dinámico del frontend.
* **localStorage:** persistencia temporal en el navegador.
* **Mock data:** arrays y objetos para simular la futura base de datos.
* **Git:** control de versiones.
* **GitHub:** almacenamiento y seguimiento del repositorio.
* **Visual Studio Code:** entorno de desarrollo.
* **XAMPP o servidor local:** ejecución del proyecto durante el desarrollo.

### 8.2 Tecnologías previstas

* PHP para el backend.
* MySQL para la base de datos.
* API REST para la comunicación entre frontend y backend.
* Fetch API para las solicitudes desde JavaScript.
* Filesystem del servidor para archivos adjuntos.

---

## 9. Arquitectura y organización del repositorio

La estructura actual principal es:

```text
proyecto-convenio-INAU/
│
├── backend/
│   └── .gitkeep
│
├── docs/
│   ├── api.md
│   ├── modelado.md
│   ├── planificacion.md
│   ├── requerimientos.md
│   ├── seguridad.md
│   └── testing.md
│
├── frontend/
│   ├── frontend-admin/
│   │   ├── css/
│   │   ├── js/
│   │   └── páginas HTML del administrador
│   │
│   └── frontend-tallerista/
│       ├── css/
│       ├── js/
│       └── páginas HTML del tallerista
│
├── index.html
└── README.md
```

### 9.1 Frontend del tallerista

Incluye ocho páginas principales:

* `dashboard.html`;
* `perfil.html`;
* `mis-talleres.html`;
* `detalle-taller.html`;
* `asistencia.html`;
* `informes.html`;
* `detalle-informe.html`;
* `mensajes.html`.

La carpeta JavaScript contiene módulos específicos para cada pantalla, además de `main.js` y `mock-data.js`.

### 9.2 Frontend administrador

Incluye doce páginas HTML para:

* dashboard;
* talleristas;
* detalle de tallerista;
* alumnos;
* detalle de alumno;
* talleres;
* detalle de taller;
* asistencias;
* reportes;
* detalle de reporte;
* mensajes;
* perfil.

Estas pantallas constituyen la base visual, pero sus archivos JavaScript continúan vacíos y todavía no existe lógica dinámica ni operaciones CRUD.

### 9.3 Backend

La carpeta backend existe como espacio reservado, pero todavía no contiene implementación.

### 9.4 Documentación técnica

La carpeta `docs` ya contiene los archivos esperados para:

* requerimientos;
* modelado;
* API;
* seguridad;
* planificación;
* testing.

En el estado actual del repositorio, estos archivos están creados pero vacíos. Esta documentación general puede utilizarse como base para comenzar a completarlos.

---

## 10. Organización del JavaScript del tallerista

La reorganización del JavaScript tuvo como objetivo evitar que toda la lógica quedara acumulada en un único archivo.

### 10.1 `main.js`

Funciona como punto de entrada común. Sus responsabilidades son:

* esperar la carga del DOM;
* mostrar el usuario en la barra de navegación;
* configurar el cierre de sesión;
* detectar la página actual mediante `data-page`;
* ejecutar el inicializador del módulo correspondiente.

### 10.2 `mock-data.js`

Contiene la base de datos simulada del frontend. Incluye:

* usuario actual;
* talleres;
* alumnos;
* inscripciones;
* informes;
* administradores;
* conversaciones;
* mensajes.

Este archivo no manipula el HTML. Su función es ofrecer datos temporales hasta que exista una API.

### 10.3 Módulos por pantalla

* `dashboard.js`: calcula métricas y muestra el saludo.
* `perfil.js`: carga y valida el perfil.
* `mis-talleres.js`: lista y busca talleres.
* `detalle-taller.js`: obtiene el taller mediante un parámetro de URL.
* `asistencia.js`: registra y recupera asistencias.
* `informes.js`: lista, filtra y resume informes.
* `detalle-informe.js`: muestra, imprime y descarga un informe.
* `mensajes.js`: administra conversaciones, lectura y envío de mensajes.

---

## 11. Proceso de desarrollo realizado

### Etapa 1: análisis del problema

Se realizó una entrevista al cliente para identificar:

* problemas actuales;
* usuarios involucrados;
* información que debe registrarse;
* funciones necesarias;
* expectativas de disponibilidad, seguridad y rendimiento.

### Etapa 2: definición del alcance

Se compararon las necesidades iniciales con la consigna técnica. Se definió que la primera versión tendrá dos roles autenticados:

* administrador;
* tallerista.

También se acordó utilizar el término “alumnos” en la interfaz actual, en lugar de “participantes”.

### Etapa 3: estructura del repositorio

Se crearon carpetas separadas para:

* backend;
* documentación;
* frontend administrador;
* frontend tallerista.

Posteriormente, ambos frontends se agruparon dentro de una carpeta general `frontend`.

### Etapa 4: diseño estático

Se construyeron las páginas HTML de ambos roles utilizando Bootstrap 5.3 y un diseño institucional, limpio y responsive.

Se incluyeron:

* barras de navegación;
* tarjetas;
* tablas;
* formularios;
* perfiles;
* paneles;
* enlaces entre páginas.

### Etapa 5: preparación para datos dinámicos

Los elementos importantes recibieron IDs y los contenedores quedaron preparados para ser completados desde JavaScript.

Se evitó depender exclusivamente de información escrita directamente en el HTML.

### Etapa 6: modularización de JavaScript

El archivo principal se redujo a tareas comunes y se crearon archivos separados por pantalla. Cada módulo recibió una responsabilidad concreta.

### Etapa 7: creación de datos simulados

Se creó `mock-data.js` con objetos relacionados mediante identificadores. Esta decisión permite probar la aplicación como si ya existiera una base de datos.

### Etapa 8: navegación mediante parámetros

Se implementaron rutas como:

```text
detalle-taller.html?id=1
asistencia.html?tallerId=1
informes.html?tallerId=1
detalle-informe.html?id=1
```

Los módulos leen estos parámetros con `URLSearchParams`, validan los identificadores y buscan los registros correspondientes.

### Etapa 9: persistencia temporal

Se utilizó `localStorage` para conservar:

* datos editables del perfil;
* asistencias simuladas;
* conversaciones y mensajes;
* contador de mensajes no leídos;
* información temporal de sesión.

### Etapa 10: pruebas funcionales

Se comprobaron manualmente:

* carga de talleres;
* búsqueda de talleres;
* navegación al detalle;
* IDs inexistentes o faltantes;
* registro y recuperación de asistencias;
* filtros de informes;
* detalle e impresión de informes;
* validación del perfil;
* mensajes vacíos;
* lectura y envío de mensajes;
* persistencia después de recargar;
* cierre de sesión;
* rutas relativas.

---

## 12. Avance actual

### 12.1 Completado o funcional en el frontend tallerista

| Módulo             | Estado                    | Funciones implementadas                                                             |
| ------------------ | ------------------------- | ----------------------------------------------------------------------------------- |
| Dashboard          | Funcional                 | Saludo, talleres asignados, alumnos únicos y presentes del día.                     |
| Perfil             | Funcional con observación | Carga de datos, edición de contacto, validaciones e identificación de solo lectura. |
| Mis Talleres       | Funcional                 | Listado dinámico, búsqueda y acceso a detalles.                                     |
| Detalle del taller | Funcional                 | Lectura del ID, datos completos y enlaces contextualizados.                         |
| Asistencia         | Funcional como simulación | Lista de alumnos, estados, contador, guardado y recuperación local.                 |
| Informes           | Funcional como simulación | Listado, filtros, estadísticas y navegación.                                        |
| Detalle de informe | Funcional como simulación | Información completa, impresión y descarga TXT.                                     |
| Mensajes           | Funcional como simulación | Conversación, leído/no leído, envío y persistencia local.                           |
| Cierre de sesión   | Funcional                 | Eliminación de información de sesión y regreso al `index.html`.                     |

### 12.2 Parcialmente desarrollado

* Interfaz administrador: HTML y CSS creados; JavaScript pendiente.
* Login: interfaz creada; autenticación y rutas pendientes.
* Documentos técnicos: archivos creados; contenido pendiente.
* CSS: existen hojas separadas para cada rol; se debe decidir qué estilos serán compartidos.

### 12.3 No iniciado

* Backend PHP.
* Base de datos MySQL.
* API REST.
* Fetch API.
* Sesiones reales.
* Control de acceso del servidor.
* CRUD del administrador.
* Gestión real de archivos adjuntos.
* Historial de actividad.
* Testing automatizado.
* Despliegue final.

---

## 13. Modelo de datos preliminar

A partir de la entrevista, la especificación técnica y los datos simulados, se identifican las siguientes entidades principales:

* usuarios;
* roles;
* talleristas;
* alumnos;
* talleres;
* asignaciones de talleristas;
* inscripciones de alumnos;
* asistencias;
* informes;
* mensajes internos;
* adjuntos;
* historial de actividad.

### Relaciones principales

* Un usuario posee un rol.
* Un tallerista se relaciona con una cuenta de usuario.
* Un alumno puede estar en varios talleres.
* Un taller puede tener varios alumnos y uno o varios talleristas.
* Una asistencia pertenece a un alumno, un taller y una fecha.
* Un informe pertenece a un taller y un tallerista.
* Un mensaje relaciona a un administrador con un tallerista.
* Un adjunto puede pertenecer a un taller o a otro registro permitido.

---

## 14. Decisiones técnicas adoptadas

### 14.1 Un único login

No se crearán páginas de acceso separadas por rol. El backend identificará al usuario y lo redirigirá al panel correspondiente.

### 14.2 Separación por roles

Los paneles administrador y tallerista permanecen separados para simplificar permisos, navegación y mantenimiento.

### 14.3 Bootstrap como base

El CSS personaliza Bootstrap, pero no intenta reemplazarlo. Esto facilita el diseño responsive y mantiene consistencia visual.

### 14.4 Datos simulados antes del backend

El frontend se está completando con mock data antes de iniciar PHP. Esto permite validar flujos y componentes sin depender todavía de una base de datos.

### 14.5 Parámetros de URL

Los detalles y módulos dependientes de un taller reciben identificadores en la URL. Esto imita el comportamiento de una aplicación conectada a endpoints.

### 14.6 Persistencia local provisional

`localStorage` se usa únicamente para demostración y pruebas. No reemplaza a MySQL, no ofrece seguridad real y no debe almacenar contraseñas.

### 14.7 Restricción de datos personales

El tallerista no debe modificar nombre, apellido o cédula. La interfaz los muestra como solo lectura.

El backend deberá reforzar esta regla ignorando cualquier intento de modificación no autorizado.

---

## 15. Seguridad y privacidad

El sistema manejará información personal y posiblemente sensible. Por lo tanto, se deberán aplicar medidas como:

* contraseñas almacenadas mediante hash seguro;
* sesiones controladas desde el servidor;
* validación y sanitización de entradas;
* consultas preparadas para evitar inyección SQL;
* verificación de permisos en cada endpoint;
* protección de rutas según rol;
* restricción de archivos permitidos;
* nombres de archivo generados de forma segura;
* límites de tamaño de adjuntos;
* registro de modificaciones relevantes;
* baja lógica cuando corresponda;
* protección de datos personales en reportes y pantallas;
* cierre de sesión seguro.

Las validaciones realizadas actualmente en JavaScript mejoran la experiencia del usuario, pero no son suficientes para garantizar seguridad. Todas deben repetirse en PHP.

---

## 16. Observaciones técnicas y puntos a corregir

### 16.1 Rutas del login

Después de mover los dos paneles dentro de la carpeta `frontend`, el `index.html` todavía referencia rutas anteriores para el CSS y para `js/auth.js`.

Deben actualizarse para apuntar a la ubicación real o debe crearse una carpeta común para los recursos del login.

### 16.2 Restricción del perfil

El HTML del perfil ya utiliza `readonly` para nombre, apellido y cédula.

Sin embargo, la versión actual de `perfil.js` todavía incluye esos valores dentro del objeto guardado. Aunque el usuario común no puede cambiarlos desde la interfaz, se recomienda eliminar esas propiedades de la operación de actualización para reforzar la regla también en la lógica del frontend.

### 16.3 Estados de talleres

Los datos simulados usan el estado “Activo”, mientras que la especificación propone:

* planificado;
* en curso;
* finalizado;
* suspendido.

Debe definirse una lista oficial antes de crear la base de datos.

### 16.4 Estados de asistencia

Falta agregar:

* tardanza;
* observaciones por registro.

### 16.5 Terminología

La consigna técnica utiliza “participantes”, mientras que el equipo decidió utilizar “alumnos” en la interfaz.

Esta decisión debe documentarse y aplicarse de forma consistente en:

* base de datos;
* API;
* documentación;
* código;
* textos visibles.

### 16.6 Permisos sobre datos personales

La entrevista presenta respuestas que pueden interpretarse de manera contradictoria sobre quién puede modificar cédulas y datos personales.

El equipo decidió que el tallerista no puede hacerlo y que la administración tendrá mayor control. Esta regla debe confirmarse expresamente con el cliente antes de implementarla en el backend.

### 16.7 Funciones repetidas

Varios módulos repiten funciones para:

* mostrar alertas;
* colocar texto;
* formatear fechas;
* escapar HTML;
* obtener parámetros de URL.

Estas funciones deberían trasladarse gradualmente a `utils.js` y `dom.js`.

### 16.8 Archivos vacíos

Los siguientes archivos están creados, pero vacíos:

* `constants.js`;
* `dom.js`;
* `utils.js`;
* `talleres.js`.

Debe decidirse si se utilizarán durante la refactorización o si conviene eliminarlos para evitar archivos sin propósito.

### 16.9 Documentación pendiente

Los seis archivos de la carpeta `docs` están vacíos.

Es necesario distribuir la información de esta documentación general entre:

* requerimientos;
* modelado;
* API;
* seguridad;
* planificación;
* testing.

---

## 17. Próximos pasos recomendados

### Fase 1: cierre del frontend tallerista

1. Revisar rutas y enlaces de todas las páginas.
2. Corregir la restricción lógica del perfil.
3. Agregar tardanza y observaciones a asistencia.
4. Refactorizar funciones comunes hacia `utils.js` y `dom.js`.
5. Normalizar estados y nombres de propiedades.
6. Probar responsive y accesibilidad.
7. Documentar casos de prueba.

### Fase 2: frontend administrador dinámico

1. Crear una estrategia común de datos simulados.
2. Implementar dashboard administrativo.
3. Implementar CRUD simulado de talleristas.
4. Implementar CRUD simulado de alumnos.
5. Implementar gestión de talleres y asignaciones.
6. Implementar consulta y corrección de asistencias.
7. Implementar reportes.
8. Integrar la mensajería con el panel del tallerista.

### Fase 3: modelado y base de datos

1. Confirmar reglas de negocio con el cliente.
2. Crear diagrama entidad-relación.
3. Definir claves primarias y foráneas.
4. Definir estados, restricciones e índices.
5. Preparar scripts SQL o migraciones.

### Fase 4: backend y API

1. Implementar configuración de PHP y MySQL.
2. Crear autenticación y sesiones.
3. Crear verificaciones por rol.
4. Implementar endpoints REST.
5. Implementar operaciones CRUD.
6. Implementar carga segura de archivos.
7. Registrar historial de actividad.

### Fase 5: integración

1. Sustituir mock data por Fetch API.
2. Sustituir `localStorage` por persistencia del servidor.
3. Manejar errores HTTP y estados de carga.
4. Probar permisos reales.
5. Verificar todos los flujos de extremo a extremo.

### Fase 6: testing y entrega

1. Crear plan de pruebas.
2. Ejecutar pruebas funcionales y de permisos.
3. Revisar seguridad básica.
4. Completar documentación.
5. Preparar demo y defensa técnica.
6. Preparar despliegue y datos de demostración.

---

## 18. Criterios de aceptación generales

El sistema podrá considerarse funcional cuando:

* un usuario pueda iniciar sesión y ser dirigido según su rol;
* el tallerista vea únicamente sus talleres;
* el administrador pueda gestionar los datos autorizados;
* los alumnos puedan asignarse a uno o varios talleres;
* se registre una única asistencia por alumno, fecha y taller;
* los informes reflejen datos persistentes;
* la mensajería funcione entre administrador y tallerista;
* los permisos se validen en el backend;
* los datos continúen disponibles después de cerrar el navegador;
* la plataforma sea usable desde distintos dispositivos;
* las acciones importantes queden registradas;
* la documentación y las pruebas estén completas.

---

## 19. Conclusión

El proyecto cuenta con una base visual amplia y una arquitectura que permite continuar creciendo. El principal avance técnico se encuentra en el frontend del tallerista, que ya utiliza módulos JavaScript, datos relacionados, navegación mediante identificadores y persistencia temporal.

El trabajo realizado permitió comprobar los flujos principales antes de comenzar el backend. Esta estrategia reduce riesgos porque permite detectar problemas de navegación, permisos, estructura de datos y experiencia de usuario durante una etapa en la que todavía es sencillo realizar cambios.

La prioridad siguiente debe ser cerrar técnicamente el frontend del tallerista, completar el panel administrador con el mismo criterio modular y definir de manera formal el modelo de datos y las reglas de negocio.

Una vez realizadas esas tareas, el equipo podrá comenzar PHP y MySQL con una estructura más clara y con menos necesidad de modificar las interfaces ya construidas.

---

## 20. Fuentes utilizadas

* Entrevista realizada al cliente.
* Documento `proyecto_convenio_inau(1).md`.
* Repositorio actualizado `proyecto-convenio-INAU(1).zip`.
* Decisiones y avances realizados durante la implementación del frontend del tallerista.
