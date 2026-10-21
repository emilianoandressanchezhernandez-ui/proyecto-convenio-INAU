"use strict";

const DESTINOS_INAU = Object.freeze({
    admin: "frontend-admin/dashboard.html",
    tallerista: "frontend-tallerista/dashboard.html",
    alumno: "frontend-alumno/dashboard.html"
});

function redirigirSegunRol(usuario) {
    const destino = DESTINOS_INAU[usuario?.rol];
    if (!destino) throw new Error("La cuenta no tiene un rol reconocido.");
    window.location.assign(destino);
}

document.addEventListener("DOMContentLoaded", async () => {
    const formulario = document.getElementById("form-login");
    const alerta = document.getElementById("alerta-error");
    const boton = document.getElementById("btn-login");
    const mostrarError = mensaje => {
        alerta.textContent = mensaje;
        alerta.classList.remove("d-none");
    };

    formulario.addEventListener("submit", async evento => {
        evento.preventDefault();
        alerta.classList.add("d-none");
        boton.disabled = true;
        boton.textContent = "Ingresando...";
        try {
            const correo = document.getElementById("correo").value.trim();
            const clave = document.getElementById("password").value;
            const datos = await window.inauApi("/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ correo, clave })
            });
            redirigirSegunRol(datos?.usuario);
        } catch (error) {
            mostrarError(error.message);
        } finally {
            boton.disabled = false;
            boton.textContent = "Ingresar";
        }
    });

    // Si la cookie sigue siendo válida, no es necesario iniciar sesión otra vez.
    try {
        const datos = await window.inauApi("/perfil");
        redirigirSegunRol(datos?.usuario || datos);
    } catch (error) {
        // 401 sin sesión es normal. Otros errores solo se informan si el usuario intenta entrar.
    }
});
