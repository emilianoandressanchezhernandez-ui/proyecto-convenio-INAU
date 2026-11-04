/*
    DATOS-SENSIBLES.JS - FRONTEND ADMIN (RF24, DEF-04)

    GET /datos-sensibles

    Muestra el inventario de los datos sensibles que guarda la
    plataforma. La API devuelve solo cantidades y descripciones,
    nunca valores personales.

    main.js llama a inicializarDatosSensibles() después de
    comprobar que la sesión es de un administrador.
*/

async function inicializarDatosSensibles() {
    const alerta = document.getElementById("alerta-datos-sensibles");

    try {
        const respuesta = await fetch(
            `${ADMIN_API_URL}/datos-sensibles`,
            {
                method: "GET",
                credentials: "include",
                cache: "no-store",
                headers: { Accept: "application/json" }
            }
        );

        const resultado = await respuesta.json().catch(() => ({}));

        if (!respuesta.ok || resultado.ok === false) {
            throw new Error(
                resultado.mensaje ||
                "No se pudo obtener el inventario de datos sensibles."
            );
        }

        const inventario = resultado.datos || {};

        mostrarResumenDatosSensibles(inventario.resumen || {});
        mostrarTablaDatosSensibles(
            Array.isArray(inventario.datos) ? inventario.datos : []
        );

    } catch (error) {
        console.error("Error al cargar los datos sensibles:", error);

        if (alerta) {
            alerta.textContent = error instanceof TypeError
                ? "No se pudo conectar con la API."
                : error.message;
            alerta.classList.remove("d-none");
        }

        mostrarTablaDatosSensibles([]);
    }
}


function mostrarResumenDatosSensibles(resumen) {
    const valores = {
        "stat-cuentas": resumen.cuentas,
        "stat-alumnos": resumen.alumnos,
        "stat-talleristas": resumen.talleristas,
        "stat-archivos": resumen.archivos_entregas
    };

    Object.entries(valores).forEach(([id, valor]) => {
        const elemento = document.getElementById(id);

        if (elemento) {
            elemento.textContent =
                Number.isInteger(valor) ? String(valor) : "--";
        }
    });
}


function mostrarTablaDatosSensibles(datos) {
    const tabla = document.getElementById("tabla-datos-sensibles");

    if (!tabla) {
        return;
    }

    tabla.replaceChildren();

    if (datos.length === 0) {
        const fila = document.createElement("tr");
        const celda = document.createElement("td");

        celda.colSpan = 5;
        celda.className = "text-center text-muted py-5";
        celda.textContent = "No hay información para mostrar.";

        fila.appendChild(celda);
        tabla.appendChild(fila);
        return;
    }

    datos.forEach(dato => {
        const fila = document.createElement("tr");

        // "3 de 7" cuando hay un total; solo el número cuando no.
        const registros = Number.isInteger(dato.total)
            ? `${dato.registros} de ${dato.total}`
            : String(dato.registros ?? "-");

        [
            dato.dato,
            dato.titulares,
            registros,
            dato.acceso,
            dato.proteccion
        ].forEach((texto, indice) => {
            const celda = document.createElement("td");
            celda.textContent = texto ?? "-";

            if (indice === 0) {
                celda.className = "fw-semibold";
            }

            if (indice >= 3) {
                celda.className = "small";
            }

            fila.appendChild(celda);
        });

        tabla.appendChild(fila);
    });
}
