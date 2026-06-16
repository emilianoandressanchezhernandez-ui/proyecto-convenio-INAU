/* main.js - Versión 1 */

document.addEventListener("DOMContentLoaded", () => {
    inicializarSistema();
});

function inicializarSistema() {
    detectarPagina();
    mostrarUsuario();
    mostrarBienvenida();
    configurarLogout();
    configurarBotones();
}

/* DETECTAR PÁGINA ACTUAL */

function detectarPagina() {

    const paginaActual = window.location.pathname.split("/").pop();

    console.log(
        "Página actual:",
        paginaActual
    );
}

function mostrarUsuario() {

    const nombreUsuario = "Tallerista";

    const elemento = document.getElementById("nombre-usuario");

    if (elemento) {
        elemento.textContent = nombreUsuario;
    }
}

function mostrarBienvenida() {

    const paginaActual = window.location.pathname.split("/").pop();

    if (paginaActual === "dashboard.html") {
        console.log("Bienvenido al sistema INAU");
    }
}

/* LOGOUT */

function configurarLogout() {

    const botonesLogout = document.querySelectorAll("#btn-logout, #btn-cerrar-sesion");

    botonesLogout.forEach(boton => {

        boton.addEventListener("click", () => {

            const confirmar = confirm("¿Desea cerrar sesión?");

            if (confirmar) {
                window.location.href = "../index.html";
            }
        });
    });
}


function configurarBotones() {

    const botones = document.querySelectorAll("button");

    botones.forEach(boton => {

        boton.addEventListener("mouseenter",() => {
                boton.style.transition =
                    "0.2s ease";
            }
        );
    });
}

function mostrarMensaje(texto) {
    alert(texto);
}

const talleres = [
    {
        id: 1,
        nombre: "Programación Web",
        horario: "Lunes 14:00",
        alumnos: 15
    },
    {
        id: 2,
        nombre: "Robótica",
        horario: "Miércoles 16:00",
        alumnos: 12
    }
];

const informes = [
    {
        id: 1,
        titulo: "Informe Abril",
        fecha: "2025-04-30"
    }
];

/*
FUNCIONES FUTURAS: 

- cargarTalleres()
- cargarInformes()
- cargarMensajes()
- cargarPerfil()
- obtenerDatosAPI()
- guardarDatosAPI()
*/