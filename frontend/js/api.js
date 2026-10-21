"use strict";
// Centraliza las solicitudes HTTP a la API PHP. No guarda tokens en el navegador.
const INAU_API_URL = "http://localhost:8002";

async function inauApi(ruta, opciones = {}) {
    const { headers = {}, ...otrasOpciones } = opciones;
    let respuesta;
    try {
        respuesta = await fetch(`${INAU_API_URL}${ruta}`, {
            ...otrasOpciones,
            credentials: "include",
            headers: { ...headers }
        });
    } catch (_) {
        throw new Error("No se pudo conectar con la API. Revisá Docker y la configuración CORS.");
    }

    const cuerpo = await respuesta.json().catch(() => null);
    if (!respuesta.ok || !cuerpo?.ok) {
        const error = new Error(cuerpo?.mensaje || `Error HTTP ${respuesta.status}`);
        error.status = respuesta.status;
        throw error;
    }
    return cuerpo.datos;
}

window.inauApi = inauApi;
