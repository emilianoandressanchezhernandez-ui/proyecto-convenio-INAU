#!/usr/bin/env bash
# =====================================================================
# prueba-seguridad.sh
# Auditoría automatizada de la API REST - Sistema de Gestión de Talleres
# en Convenio con INAU (TheNewfutures).
#
# Qué hace: envía pedidos HTTP a la API y comprueba que responda como
# se espera ante accesos sin sesión, tokens inválidos, acceso a datos
# de otro usuario (IDOR), escalada de privilegios, campos no permitidos,
# datos inválidos, errores que filtren información, acceso directo a
# los archivos subidos y repetición de intentos de inicio de sesión.
#
# Regla ética: ejecutar SOLO sobre el sistema propio del grupo.
#
# Uso (en el servidor):
#   chmod +x prueba-seguridad.sh && ./prueba-seguridad.sh
#
# Variables opcionales (se pueden definir antes del comando):
#   API_BASE        URL de la API a través de Nginx  (por defecto http://localhost/api)
#   API_DIRECTA     URL del contenedor de la API      (por defecto http://localhost:8002)
#   ALUMNO_CORREO   correo de un alumno de prueba     (por defecto sofia.pereira@email.com)
#   ENTREGA_AJENA   id de una entrega de OTRO alumno  (por defecto 2)
#   CONTENIDO_ID    id de una tarea del taller        (por defecto 4)
#   TALLER_ID       id de un taller                   (por defecto 1)
#
# La contraseña del alumno se pide por teclado y no se muestra ni se
# guarda. El script no crea, modifica ni borra datos: los pedidos de
# escritura se envían con datos inválidos o vacíos, de modo que, aun si
# el permiso fallara, la validación los rechazaría.
# =====================================================================

set -u

API_BASE="${API_BASE:-http://localhost/api}"
API_DIRECTA="${API_DIRECTA:-http://localhost:8002}"
ALUMNO_CORREO="${ALUMNO_CORREO:-sofia.pereira@email.com}"
ENTREGA_AJENA="${ENTREGA_AJENA:-2}"
CONTENIDO_ID="${CONTENIDO_ID:-4}"
TALLER_ID="${TALLER_ID:-1}"
TOTAL_TESTS=10

# Archivos temporales: cuerpo y encabezados de cada respuesta.
# Se borran al terminar, pase lo que pase.
TMP_DIR="$(mktemp -d)"
CUERPO="$TMP_DIR/cuerpo.txt"
ENCABEZADOS="$TMP_DIR/encabezados.txt"
trap 'rm -rf "$TMP_DIR"' EXIT

HALLAZGOS=0
SIN_HALLAZGO=0
ESTADO=""          # último código HTTP recibido
SESION=""          # token de la sesión del alumno (nunca se muestra)
FALLAS_TEST=0      # comprobaciones fallidas dentro del test actual
DETALLE_TEST=""    # detalle de lo que falló

# ---------------------------------------------------------------------
# Funciones auxiliares
# ---------------------------------------------------------------------

# Escapa comillas y barras para armar JSON a mano sin herramientas extra.
json_escape() {
    local texto="$1"
    texto="${texto//\\/\\\\}"
    texto="${texto//\"/\\\"}"
    printf '%s' "$texto"
}

# peticion MÉTODO URL [CUERPO_JSON] [con_sesion|sin_sesion|cookie_invalida]
# Guarda el código HTTP en ESTADO, el cuerpo en $CUERPO y los
# encabezados en $ENCABEZADOS.
peticion() {
    local metodo="$1" url="$2" datos="${3:-}" modo="${4:-sin_sesion}"
    local args=(-s -o "$CUERPO" -D "$ENCABEZADOS" -w '%{http_code}' -X "$metodo" --max-time 15)

    case "$modo" in
        con_sesion)      args+=(-H "Cookie: access_token=$SESION") ;;
        cookie_invalida) args+=(-H "Cookie: access_token=token.invalido.de.prueba") ;;
    esac

    if [ -n "$datos" ]; then
        args+=(-H "Content-Type: application/json" --data "$datos")
    fi

    ESTADO="$(curl "${args[@]}" "$url" 2>/dev/null)"
    [ -z "$ESTADO" ] && ESTADO="000"
}

# comprobar "descripción" "códigos aceptados separados por espacio"
# Compara ESTADO con los códigos esperados y acumula el resultado.
comprobar() {
    local descripcion="$1" esperados="$2" codigo
    for codigo in $esperados; do
        if [ "$ESTADO" = "$codigo" ]; then
            printf '      ok  %-58s HTTP %s\n' "$descripcion" "$ESTADO"
            return
        fi
    done
    if [ "$ESTADO" = "000" ]; then
        printf '      !!  %-58s sin respuesta (revise la URL)\n' "$descripcion"
    else
        printf '      !!  %-58s HTTP %s (se esperaba %s)\n' "$descripcion" "$ESTADO" "$esperados"
    fi
    FALLAS_TEST=$((FALLAS_TEST + 1))
    DETALLE_TEST="$DETALLE_TEST $descripcion: HTTP $ESTADO;"
}

# sin_filtracion "descripción": revisa que el cuerpo no muestre detalles
# internos (trazas de PHP, errores SQL, rutas del servidor).
sin_filtracion() {
    local descripcion="$1"
    if grep -qiE 'SQLSTATE|PDOException|Stack trace|Fatal error|Warning:|/var/www/html' "$CUERPO"; then
        printf '      !!  %-58s detalle interno en la respuesta\n' "$descripcion"
        FALLAS_TEST=$((FALLAS_TEST + 1))
        DETALLE_TEST="$DETALLE_TEST $descripcion: muestra detalle interno;"
    else
        printf '      ok  %-58s sin detalle interno\n' "$descripcion"
    fi
}

iniciar_test() {
    FALLAS_TEST=0
    DETALLE_TEST=""
    printf '[TEST %s/%s] %s\n' "$1" "$TOTAL_TESTS" "$2"
}

cerrar_test() {
    if [ "$FALLAS_TEST" -eq 0 ]; then
        printf '  >>> SIN HALLAZGO - %s\n' "$1"
        SIN_HALLAZGO=$((SIN_HALLAZGO + 1))
    else
        printf '  >>> HALLAZGO -%s\n' "$DETALLE_TEST"
        HALLAZGOS=$((HALLAZGOS + 1))
    fi
}

linea() { printf '%s\n' "======================================================================"; }

# ---------------------------------------------------------------------
# Inicio de sesión del alumno de prueba (necesario para los tests 3 a 7)
# ---------------------------------------------------------------------

linea
printf 'PRUEBAS DE SEGURIDAD HTTP - Sistema de Gestión de Talleres (INAU)\n'
printf '  API Base: %s\n' "$API_BASE"
printf '  Fecha:    %s\n' "$(date '+%d/%m/%Y %H:%M')"
linea

if [ -z "${ALUMNO_CLAVE:-}" ]; then
    printf 'Contraseña del alumno de prueba (%s): ' "$ALUMNO_CORREO"
    read -rs ALUMNO_CLAVE
    printf '\n'
fi

peticion POST "$API_BASE/login" \
    "{\"correo\":\"$(json_escape "$ALUMNO_CORREO")\",\"clave\":\"$(json_escape "$ALUMNO_CLAVE")\"}"
unset ALUMNO_CLAVE

# Guardar en memoria el token de la cookie que devolvió el login
# (encabezado Set-Cookie). No se muestra ni se escribe en disco.
SESION="$(grep -i '^Set-Cookie: access_token=' "$ENCABEZADOS" | head -1 \
    | sed -E 's/^[Ss]et-[Cc]ookie: access_token=([^;]*).*/\1/' | tr -d '\r')"
: > "$ENCABEZADOS"

if [ "$ESTADO" != "200" ] || [ -z "$SESION" ]; then
    printf 'No se pudo iniciar sesión como alumno (HTTP %s). Revise el correo y la contraseña.\n' "$ESTADO"
    exit 1
fi
printf 'Sesión de alumno iniciada (%s).\n\n' "$ALUMNO_CORREO"

# ---------------------------------------------------------------------
# TEST 1: rutas privadas sin sesión -> 401
# ---------------------------------------------------------------------
iniciar_test 1 "Autenticación en endpoints privados (sin sesión)"
peticion GET "$API_BASE/perfil";       comprobar "GET /perfil sin sesión" "401"
peticion GET "$API_BASE/alumnos";      comprobar "GET /alumnos sin sesión" "401"
peticion GET "$API_BASE/mis-talleres"; comprobar "GET /mis-talleres sin sesión" "401"
cerrar_test "La API respondió 401 a los pedidos sin sesión."

# ---------------------------------------------------------------------
# TEST 2: token inválido -> 401
# ---------------------------------------------------------------------
iniciar_test 2 "Token de sesión inválido o alterado"
peticion GET "$API_BASE/perfil" "" cookie_invalida
comprobar "GET /perfil con un token inválido" "401"
cerrar_test "La API rechazó el token inválido con 401."

# ---------------------------------------------------------------------
# TEST 3: IDOR, el alumno intenta ver la entrega de otro alumno -> 403
# ---------------------------------------------------------------------
iniciar_test 3 "Control de acceso IDOR (entrega $ENTREGA_AJENA de otro alumno)"
peticion GET "$API_BASE/entregas/$ENTREGA_AJENA" "" con_sesion
comprobar "GET /entregas/$ENTREGA_AJENA" "403 404"
peticion GET "$API_BASE/entregas/$ENTREGA_AJENA/adjuntos" "" con_sesion
comprobar "GET /entregas/$ENTREGA_AJENA/adjuntos" "403 404"
cerrar_test "El alumno no puede ver datos de otro alumno."

# ---------------------------------------------------------------------
# TEST 4: escalada de privilegios, alumno -> funciones del administrador
# ---------------------------------------------------------------------
iniciar_test 4 "Escalada de privilegios: alumno a administrador"
peticion GET  "$API_BASE/alumnos"     ""   con_sesion; comprobar "GET /alumnos" "403"
peticion GET  "$API_BASE/talleristas" ""   con_sesion; comprobar "GET /talleristas" "403"
peticion POST "$API_BASE/talleres"    "{}" con_sesion; comprobar "POST /talleres (cuerpo vacío)" "403"
cerrar_test "Acciones de administrador denegadas con 403."

# ---------------------------------------------------------------------
# TEST 5: escalada de privilegios, alumno -> funciones del tallerista
# ---------------------------------------------------------------------
iniciar_test 5 "Escalada de privilegios: alumno a tallerista"
peticion GET  "$API_BASE/contenidos/$CONTENIDO_ID/entregas" "" con_sesion
comprobar "GET /contenidos/$CONTENIDO_ID/entregas" "403"
peticion POST "$API_BASE/talleres/$TALLER_ID/asistencias" "{}" con_sesion
comprobar "POST /talleres/$TALLER_ID/asistencias (cuerpo vacío)" "403"
cerrar_test "Acciones de tallerista denegadas con 403."

# ---------------------------------------------------------------------
# TEST 6: campos no permitidos (asignación masiva del rol)
# ---------------------------------------------------------------------
iniciar_test 6 "Campos no permitidos: intento de cambiar el rol"
peticion PATCH "$API_BASE/perfil/clave" '{"rol":"admin"}' con_sesion
comprobar "PATCH /perfil/clave con {\"rol\":\"admin\"}" "400 422"
peticion PATCH "$API_BASE/perfil" '{"rol":"admin"}' con_sesion
comprobar "PATCH /perfil con {\"rol\":\"admin\"}" "400 422"
cerrar_test "La API rechazó el campo rol."

# ---------------------------------------------------------------------
# TEST 7: datos inválidos -> 400/422, nunca 500 ni detalles internos
# ---------------------------------------------------------------------
iniciar_test 7 "Datos no válidos en formularios"
peticion POST "$API_BASE/login" '{"correo": "sin-cierre'
comprobar "POST /login con JSON mal formado" "400 422"
sin_filtracion "POST /login con JSON mal formado"
peticion POST "$API_BASE/login" '{"correo":"no-es-un-correo","clave":""}'
comprobar "POST /login con correo inválido y clave vacía" "400 401 422"
sin_filtracion "POST /login con correo inválido"
peticion PATCH "$API_BASE/perfil" '{"telefono":"abc"}' con_sesion
comprobar "PATCH /perfil con teléfono \"abc\"" "400 422"
sin_filtracion "PATCH /perfil con teléfono inválido"
cerrar_test "Los datos inválidos se rechazaron sin errores internos."

# ---------------------------------------------------------------------
# TEST 8: errores y encabezados sin información del servidor
# ---------------------------------------------------------------------
iniciar_test 8 "Errores y encabezados sin información interna"
peticion GET "$API_BASE/ruta-que-no-existe"
comprobar "GET /ruta-que-no-existe" "404"
sin_filtracion "Respuesta 404"
if grep -qi '^X-Powered-By:' "$ENCABEZADOS"; then
    printf '      !!  %-58s presente\n' "Encabezado X-Powered-By"
    FALLAS_TEST=$((FALLAS_TEST + 1)); DETALLE_TEST="$DETALLE_TEST X-Powered-By presente;"
else
    printf '      ok  %-58s ausente\n' "Encabezado X-Powered-By"
fi
SERVIDOR="$(grep -i '^Server:' "$ENCABEZADOS" | head -1 | tr -d '\r')"
if printf '%s' "$SERVIDOR" | grep -qE '[0-9]+\.[0-9]+'; then
    printf '      !!  %-58s %s\n' "Encabezado Server sin versión" "$SERVIDOR"
    FALLAS_TEST=$((FALLAS_TEST + 1)); DETALLE_TEST="$DETALLE_TEST $SERVIDOR;"
else
    printf '      ok  %-58s %s\n' "Encabezado Server sin versión" "${SERVIDOR:-(sin encabezado)}"
fi
cerrar_test "Las respuestas no revelan versiones ni detalles internos."

# ---------------------------------------------------------------------
# TEST 9: acceso directo a los archivos subidos -> no debe dar 200
# ---------------------------------------------------------------------
iniciar_test 9 "Acceso directo a archivos subidos (sin pasar por la API)"
peticion GET "$API_DIRECTA/uploads/"
comprobar "GET $API_DIRECTA/uploads/" "403 404"
peticion GET "$API_DIRECTA/storage/uploads/"
comprobar "GET $API_DIRECTA/storage/uploads/" "403 404"
peticion GET "$API_DIRECTA/.env"
comprobar "GET $API_DIRECTA/.env" "403 404"
cerrar_test "Los archivos internos no se pueden descargar directamente."

# ---------------------------------------------------------------------
# TEST 10: límite de intentos de inicio de sesión -> 429
# Usa un correo inventado, así que no bloquea ninguna cuenta real.
# ---------------------------------------------------------------------
iniciar_test 10 "Límite de intentos de inicio de sesión"
CORREO_FALSO="prueba.limite.$(date +%s)@example.com"
for intento in 1 2 3 4 5; do
    peticion POST "$API_BASE/login" "{\"correo\":\"$CORREO_FALSO\",\"clave\":\"incorrecta$intento\"}"
done
comprobar "Intento 5 con credenciales incorrectas" "401"
peticion POST "$API_BASE/login" "{\"correo\":\"$CORREO_FALSO\",\"clave\":\"incorrecta6\"}"
comprobar "Intento 6 con el mismo correo" "429"
cerrar_test "El sexto intento fue bloqueado con HTTP 429."

# ---------------------------------------------------------------------
# Cierre: se termina la sesión del alumno y se muestra el resumen
# ---------------------------------------------------------------------
peticion POST "$API_BASE/logout" "" con_sesion
SESION=""

linea
printf '  RESUMEN: Hallazgos %s | Sin hallazgo %s\n' "$HALLAZGOS" "$SIN_HALLAZGO"
linea

[ "$HALLAZGOS" -eq 0 ]
