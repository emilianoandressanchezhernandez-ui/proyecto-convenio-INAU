# Mecanismos de Autenticación y Criptografía

**Proyecto:** TheNewfutures — Sistema de Gestión de Talleres en Convenio con INAU  
**Área:** Ciberseguridad  
**Fecha de elaboración:** 10 de octubre de 2026  

---

## 1. Propósito y alcance

Este documento explica los mecanismos de autenticación, hashing de contraseñas y gestión de tokens que están presentes en el código actual del proyecto, los cuales podrán cambiar o mejorar.

La documentación distingue expresamente entre:

- **Implementado:** existe código en el repositorio que realiza esa función.
- **Preparado, pero no conectado o incompleto:** existe una clase o configuración, pero no forma parte del flujo ejecutado o le faltan controles.
- **Pendiente recomendado:** cambio necesario para mejorar la protección antes de un despliegue con datos reales.

La existencia de una función de seguridad no implica que la API esté lista para producción. Al final se enumeran los riesgos detectados durante la revisión.

## 2. Fuentes utilizadas y método de análisis


| Fuente del repositorio | Información utilizada |
|---|---|
| `backend/api/controllers/AuthController.php` | Endpoints de login, logout y perfil; creación y eliminación de cookie. |
| `backend/api/services/AuthService.php` | Verificación de credenciales, estado de la cuenta y actualización de perfil. |
| `backend/api/validators/AuthValidator.php` | Validación de los datos recibidos por login y perfil. |
| `backend/api/dtos/LoginDTO.php` | Estructura de los datos de inicio de sesión. |
| `backend/api/models/User.php` | Verificación de contraseña y datos que se devuelven al cliente. |
| `backend/api/repositories/UserRepository.php` | Búsqueda por correo, lectura de `clave_hash` y actualización del último acceso. |
| `backend/api/services/TalleristaService.php` | Generación de hashes cuando se crea o se cambia la contraseña de un tallerista. |
| `backend/api/repositories/TalleristaRepository.php` | Persistencia del campo `clave_hash` en la tabla de usuarios. |
| `backend/api/core/Token.php` | Creación, lectura, firma y vencimiento de JWT; atributos de la cookie. |
| `backend/api/core/AuthMiddleware.php` | Validación de token y control de acceso según el rol requerido. |
| `backend/api/routes.php` | Rutas y requisitos de autenticación/autorización. |
| `backend/api/config.php` | Carga de variables de entorno, clave secreta y duración del token. |
| `backend/api/.env.example` y `backend/api/.env.docker.example` | Variables necesarias para ejecutar la API. |
| `backend/api/database.sql` | Campo `usuarios.clave_hash` y datos de prueba. |
| `backend/api/composer.json` | Dependencia `firebase/php-jwt`. |
| `backend/api/index.php` y `backend/api/README.md` | Punto de entrada, CORS y explicación general de la API. |
| `backend/api/core/RateLimiter.php` | Implementación disponible de limitación de peticiones; se verificó si está conectada al flujo. |

### Método aplicado

1. Se identificó el punto de entrada de la API (`index.php`) y el mapa de rutas (`routes.php`).
2. Se siguió el recorrido del login desde el controller hasta el service, repository y modelo `User`.
3. Se revisó cómo se genera el token, dónde se almacena y cómo se verifica en las rutas protegidas.
4. Se compararon las medidas del código con las variables de entorno, el esquema SQL y las instrucciones del README.
5. Se marcaron por separado las medidas presentes, las incompletas y las pendientes. Por ejemplo, el repositorio contiene `RateLimiter.php`, pero `index.php` no lo carga ni llama a `RateLimiter::check()`, por lo que no debe describirse como una protección activa.

---

## 3. Resumen de la implementación

El backend utiliza **JWT (JSON Web Token) firmado con HS256 y enviado en una cookie `HttpOnly`**. No utiliza `session_start()` ni la variable `$_SESSION` de PHP. Por lo tanto, aunque el proyecto hable de “sesión iniciada”, el mecanismo técnico es un token de acceso con vencimiento almacenado en una cookie.

Las contraseñas no se comparan como texto plano. Se almacena un hash en la columna `usuarios.clave_hash`; durante el inicio de sesión se comprueba con `password_verify()`.

| Mecanismo | Estado observado | Archivo principal |
|---|---|---|
| Validación de los datos de login | Implementado | `validators/AuthValidator.php` |
| Búsqueda del usuario por correo | Implementado | `repositories/UserRepository.php` |
| Verificación del hash de contraseña | Implementado | `models/User.php` |
| Creación del hash al crear/actualizar tallerista | Implementado | `services/TalleristaService.php` |
| JWT firmado con HS256 | Implementado | `core/Token.php` |
| Cookie `HttpOnly` y `SameSite=Lax` | Implementado | `core/Token.php` |
| Caducidad configurable del JWT | Implementado | `config.php` y `core/Token.php` |
| Comprobación de autenticación y rol | Implementado | `core/AuthMiddleware.php` y `routes.php` |
| Cierre de sesión eliminando la cookie | Implementado | `AuthController.php` y `Token.php` |
| Revocación server-side de un JWT ya emitido | No implementada | Pendiente |
| Protección CSRF completa | No implementada | Pendiente |
| Limitación efectiva de intentos en la API | La clase existe, pero no está conectada a `index.php` | `core/RateLimiter.php`, `index.php` |
| Cambio de contraseña propio desde `PATCH /perfil` | No implementado; la ruta permite correo y teléfono | `AuthController.php`, `AuthValidator.php` |

## 4. Hashing de contraseñas

### 4.1 Qué se almacena

La tabla `usuarios` tiene una columna `clave_hash VARCHAR(255) NOT NULL`, definida en `backend/api/database.sql`. No está diseñada para guardar la contraseña original. El hash es un resultado unidireccional: el sistema no necesita recuperar la contraseña original, sino verificar si la contraseña presentada coincide con el hash guardado.

La columna tiene una longitud de 255 caracteres para que pueda guardar hashes producidos por los algoritmos predeterminados de PHP actuales y futuros.

### 4.2 Cómo se genera el hash

En `backend/api/services/TalleristaService.php`, durante la creación de un tallerista, se ejecuta el equivalente a:

```php
$tallerista['clave_hash'] = password_hash(
    $tallerista['clave'],
    PASSWORD_DEFAULT
);

unset($tallerista['clave']);
```

El service crea el hash antes de llamar al repositorio y quita la contraseña en texto plano del arreglo utilizado para persistir los datos.

Cuando el administrador actualiza la contraseña de un tallerista, el mismo service genera un nuevo hash mediante `password_hash(..., PASSWORD_DEFAULT)` y elimina la propiedad `clave` antes de guardar. El repositorio inserta o actualiza `clave_hash`, no una columna de contraseña en texto plano. `TalleristaValidator` exige una longitud mínima de ocho caracteres al crear o cambiar esa contraseña; en el código revisado no se encuentra una política adicional de complejidad o un proceso de cambio de contraseña por parte del propio usuario.

**Fundamentación:** `password_hash()` está pensado para almacenamiento de contraseñas y gestiona los detalles del algoritmo y la sal dentro del propio hash. No corresponde reemplazarlo por un hash rápido genérico ni cifrar la contraseña para luego descifrarla: el sistema solo necesita verificarla.

### 4.3 Cómo se verifica la contraseña

En `backend/api/models/User.php` se encuentra el método:

```php
public function checkPassword(string $plainPassword): bool
{
    return password_verify($plainPassword, $this->claveHash);
}
```

`AuthService::login()` localiza al usuario con `UserRepository::findByCorreo()` y llama a `checkPassword()`. Si el correo no existe o la contraseña no coincide, el service responde con el mismo mensaje genérico: `Correo o contraseña incorrectos.` y estado HTTP `401`.

**Fundamentación:** el mensaje común reduce la información que una persona atacante podría obtener probando distintos correos. La aplicación no debe revelar si la cuenta existe cuando falla el inicio de sesión.

Además, `User::toArray()` no incluye la propiedad `claveHash`. Esto evita que el hash se devuelva como parte de la respuesta JSON de perfil o login.

### 4.4 Qué ocurre con los usuarios de prueba

`backend/api/database.sql` incluye cuentas de demostración con hashes en `clave_hash`. Esos datos solo sirven para desarrollo y pruebas. Antes de usar el sistema con información real deben crearse cuentas nuevas, definir contraseñas de manera controlada y retirar las credenciales de demostración de los entornos públicos.

### 4.5 Limitación actual del cambio de contraseña

El endpoint `PATCH /perfil` solo acepta `correo` y `telefono`. `AuthValidator::validateProfileUpdate()` rechaza los demás campos. Por eso el cambio de contraseña no está implementado como una operación de autoservicio del usuario. En el estado actual, el service de talleristas sí contempla generar un nuevo hash cuando se actualiza `clave` por el flujo administrativo.

---

## 5. Flujo de autenticación paso a paso

### 5.1 Recorrido del inicio de sesión

```text
Cliente / frontend
    |
    | POST /login
    | JSON: correo + clave
    v
AuthController::login()
    |
    v
AuthValidator::validateLogin()
    |
    v
LoginDTO
    |
    v
AuthService::login()
    |
    +--> UserRepository::findByCorreo()
    |          |
    |          v
    |      usuarios.clave_hash
    |          |
    +--> User::checkPassword() / password_verify()
    |
    +--> comprobar estado Activo
    |
    +--> Token::create()
    |
    v
Token::sendCookie()
    |
    +--> Set-Cookie: access_token; HttpOnly; SameSite=Lax
    |
    v
Respuesta JSON con datos de usuario, sin el JWT en el cuerpo
```

### 5.2 Validaciones que se realizan

1. `AuthController::login()` obtiene el cuerpo JSON.
2. `AuthValidator::validateLogin()` exige un correo no vacío y una contraseña no vacía, ambos de tipo texto.
3. `LoginDTO` organiza los campos `correo` y `clave`.
4. `AuthService::login()` busca el usuario por correo.
5. `User::checkPassword()` verifica la contraseña contra `clave_hash`.
6. Si falla la búsqueda o la verificación, se devuelve `401` con un mensaje genérico.
7. Si la contraseña es correcta, `User::isActivo()` comprueba que la cuenta tenga estado `Activo`; una cuenta inactiva recibe `403`.
8. `UserRepository::actualizarUltimoAcceso()` registra el acceso.
9. Se crea el JWT y se envía en la cookie.
10. Antes de devolver el resultado JSON, el controller elimina la propiedad `token` del arreglo. Así, el cliente no recibe un token que tenga que guardar manualmente.

### 5.3 Cuentas y roles

No hay registro público en `routes.php`. Las cuentas se administran mediante las funciones autorizadas del sistema. `AuthMiddleware` permite declarar en cada ruta si el acceso es público, requiere cualquier usuario autenticado o exige un rol específico, como `admin`, `tallerista` o `alumno`.

La autorización se aplica del lado del servidor: ocultar un botón en el frontend no reemplaza esta comprobación.

---

## 6. Gestión del JWT y de la cookie

### 6.1 Contenido del token

`backend/api/core/Token.php` crea un JWT con estos claims:

| Claim | Propósito en el proyecto |
|---|---|
| `id` | Identificador del usuario autenticado. |
| `nombre` | Nombre del usuario. |
| `rol` | Rol usado por el middleware para autorizar rutas. |
| `iat` | Instante de emisión del token. |
| `exp` | Instante de vencimiento del token. |

El token se firma con el algoritmo `HS256` y el secreto `SECRET_KEY`. El código utiliza la biblioteca `firebase/php-jwt`, declarada en `backend/api/composer.json`.

Un JWT firmado no es necesariamente cifrado: su payload puede leerse si alguien obtiene el token. La firma permite detectar modificaciones del contenido. Por ese motivo, el token no debe incluir contraseña, hash de contraseña ni otros datos que no sea necesario exponer.

### 6.2 Configuración de la cookie

`Token::sendCookie()` establece la cookie `access_token` con estas propiedades:

| Atributo | Valor actual | Justificación |
|---|---|---|
| `expires` | Tiempo actual + `TOKEN_LIFETIME` | Define cuándo deja de enviarse como cookie vigente. |
| `path` | `/` | Permite enviarla a los endpoints de la API bajo el mismo host. |
| `secure` | Resultado de `Token::isHttps()` | Intenta exigir HTTPS cuando PHP detecta una conexión HTTPS. |
| `httponly` | `true` | Impide que JavaScript lea directamente el token con `document.cookie`. |
| `samesite` | `Lax` | Reduce ciertos envíos automáticos de cookie desde contextos de otro sitio. No reemplaza una defensa CSRF completa. |

`config.php` define `TOKEN_LIFETIME`, cuyo valor predeterminado es `3600` segundos (una hora). El valor puede configurarse mediante el entorno.

### 6.3 Cómo se utiliza en peticiones posteriores

1. El navegador guarda la cookie recibida del login.
2. Al hacer otra solicitud al mismo host, el navegador puede enviar la cookie automáticamente según sus atributos y la política del navegador.
3. `AuthMiddleware::handle()` invoca `Token::read()` para leer `access_token`.
4. `Token::read()` valida y decodifica el JWT mediante `JWT::decode()` con `SECRET_KEY` y el algoritmo `HS256`.
5. Si el token no está presente o no puede validarse, el middleware responde `401`.
6. Si el token es válido, el middleware utiliza el rol guardado en el payload para comparar con el requisito definido en `routes.php`.
7. Si el rol no está autorizado, responde `403`; en caso contrario, la petición continúa hasta el controller.

**Importante:** el código actual lee el token desde la cookie. Aunque `.htaccess` conserva una cabecera `Authorization`, `Token::read()` no implementa lectura de `Authorization: Bearer ...`. Por lo tanto, la autenticación implementada es mediante cookie y no mediante un Bearer token enviado manualmente.

### 6.4 Cierre de sesión

`POST /logout` llama a `Token::clearCookie()`, que envía una cookie con el mismo nombre y ruta, pero con una fecha de vencimiento pasada. El navegador deja de enviarla y la interfaz considera cerrada la sesión.

Sin embargo, el backend no mantiene una lista de revocación ni una tabla de sesiones. Si un tercero hubiera copiado el JWT antes del logout, el token robado podría seguir siendo válido hasta su expiración. Este límite debe entenderse antes de tratar el mecanismo como revocación completa.

---

## 7. Configuración de secretos y variables de entorno

### 7.1 Archivos de configuración

`backend/api/config.php` carga variables del archivo `.env` ubicado junto a `config.php` y define, entre otras, las constantes `APP_ENV`, `SECRET_KEY`, `TOKEN_LIFETIME`, `FRONTEND_ORIGIN`, `DB_HOST`, `DB_NAME`, `DB_USER` y `DB_PASSWORD`.

La configuración evita arrancar si `SECRET_KEY` falta o coincide con una cadena de ejemplo específica. No obstante, hay una inconsistencia importante en el repositorio:

- `backend/api/.env.example` contiene una clave de ejemplo concreta versionada.
- `backend/api/compose.yaml` proporciona otra clave fija como valor predeterminado si no hay `SECRET_KEY` configurada.
- La validación de `config.php` no rechaza esos dos valores concretos.
- En el árbol de `main` revisado no aparece un `.gitignore` en la raíz ni en `backend/api/` que excluya el archivo real `.env`. `backend/api/.dockerignore` sí excluye `.env` de la imagen, pero **Docker ignore y Git ignore son mecanismos distintos**.
- `backend/api/.env.docker.example` indica `FRONTEND_ORIGIN=http://localhost:8000`, mientras `compose.yaml` usa `http://localhost:5173` como valor predeterminado. La variable debe coincidir exactamente con el origen desde donde se sirve el frontend; si no coincide, el navegador no recibirá las cabeceras CORS esperadas para credenciales.

Por lo tanto, no debe asumirse que las claves de ejemplo son secretos seguros ni que `.env` está protegido frente a un commit accidental.

### 7.2 Pasos para preparar las variables

Desde PowerShell, ubicarse en la carpeta de la API:

```powershell
cd backend/api
Copy-Item .env.docker.example .env
```

Generar una clave aleatoria con PHP:

```powershell
php -r "echo bin2hex(random_bytes(32));"
```

Copiar el resultado únicamente en `SECRET_KEY` del `.env` local. Definir también contraseñas propias para `DB_PASSWORD` y `MYSQL_ROOT_PASSWORD`. No incluir esos valores en capturas, entregas públicas ni mensajes de commit.

Antes de usarlo, corregir la configuración de Docker para que no tenga una clave fija de respaldo y falle si falta una clave válida. Además, crear un `.gitignore` adecuado antes de crear o guardar secretos. Una opción es `backend/api/.gitignore` con:

```gitignore
.env
.env.*
!.env.example
!.env.docker.example
vendor/
storage/cache/*
!storage/cache/.gitignore
```

La plantilla versionada debe contener marcadores vacíos o instrucciones, no una clave utilizable. Si una clave ya quedó publicada en el historial de Git, se debe considerar comprometida y generar una nueva; eliminarla del archivo actual no borra la versión anterior del historial.

### 7.3 Ajuste necesario en `compose.yaml`

Los valores de demostración del `compose.yaml` hacen más fácil el primer arranque local, pero crean un riesgo si alguien usa la misma configuración en un servidor accesible desde Internet. Antes de un despliegue real, cambiar los valores por defecto de los secretos para que el proceso falle cuando no se definan, en lugar de usar credenciales conocidas. También establecer `APP_ENV=production`.

---

## 8. Prueba guiada de la autenticación

Estas pruebas están pensadas para un entorno de desarrollo y con usuarios de prueba. No deben ejecutarse contra datos reales sin autorización.

### Paso 1. Iniciar la API

Desde `backend/api`, con Docker instalado y ejecutándose:

```powershell
docker compose up --build -d
docker compose ps
```

La API publica actualmente el puerto `8002` en la computadora anfitriona, de acuerdo con `compose.yaml`.

### Paso 2. Probar un login válido

Con Postman o Insomnia, crear una solicitud:

- Método: `POST`
- URL: `http://localhost:8002/login`
- Header: `Content-Type: application/json`
- Body JSON:

```json
{
  "correo": "CORREO_DE_PRUEBA",
  "clave": "CONTRASENA_DE_PRUEBA"
}
```

Usar una cuenta creada en la base de datos de desarrollo. Una autenticación correcta debe devolver una respuesta exitosa y un encabezado `Set-Cookie` para `access_token`. El cuerpo JSON debe incluir datos del usuario, pero no la propiedad `token`.

### Paso 3. Probar credenciales incorrectas

Repetir la solicitud con un correo que no exista o una contraseña incorrecta. Se espera `401` y el mensaje genérico `Correo o contraseña incorrectos.`. Ambos casos deberían tener una respuesta equivalente para evitar revelar si el correo está registrado.

### Paso 4. Probar una ruta protegida

Enviar `GET http://localhost:8002/perfil` sin haber conservado la cookie. Se espera `401`. Luego repetir conservando la cookie de login. Se espera la información de perfil sin `clave_hash`.

### Paso 5. Probar cierre de sesión

Enviar `POST http://localhost:8002/logout` conservando la cookie. La respuesta debería emitir una instrucción para expirar `access_token`. Posteriormente, una solicitud a `/perfil` sin cookie debería devolver `401`.

### Paso 6. Probar autorización por rol

Autenticarse con una cuenta de tallerista e intentar acceder a una ruta que `routes.php` reserva al administrador, por ejemplo `GET /talleristas`. Se espera `403` si la cookie corresponde a un tallerista válido.

### Paso 7. Revisar datos persistidos

En un entorno de prueba, consultar `usuarios.clave_hash` en MySQL. Debe tener un hash, no la contraseña original. No incluir hashes o contraseñas de prueba en capturas públicas ni en la documentación de uso.

---

## 9. Limitaciones y medidas pendientes

| Prioridad | Hallazgo verificado | Por qué importa | Acción recomendada |
|---|---|---|---|
| Crítica | `SECRET_KEY` aparece con valor fijo en `.env.example` y `compose.yaml` tiene otra clave de respaldo fija. | Si se conserva una clave conocida, una persona que la conozca podría fabricar JWT con claims modificados. | Eliminar valores utilizables de las plantillas, exigir una variable configurada y rotar cualquier clave expuesta. |
| Crítica | No se encuentra `.gitignore` raíz ni de `backend/api` para excluir `.env`. | Un archivo local con credenciales podría añadirse accidentalmente a Git. | Crear reglas de ignorado, comprobar `git status` y revisar que `.env` no esté versionado. |
| Alta | `Token::clearCookie()` solo elimina la cookie; no revoca un JWT previamente copiado. | Un token robado puede seguir válido hasta `exp`. | Evaluar un registro de sesiones/revocación, `jti` con lista de revocación o versión de token por usuario. |
| Alta | No hay protección CSRF completa. La cookie `SameSite=Lax` y CORS no constituyen por sí solos una defensa completa para todas las operaciones. | Una petición no deseada podría intentar aprovechar credenciales que el navegador envía automáticamente. | Incorporar una defensa CSRF para operaciones de escritura y probarla con solicitudes de origen cruzado. |
| Alta | `RateLimiter.php` existe, pero `index.php` no lo incluye ni llama a `RateLimiter::check()`. | No hay límite efectivo aplicado en el punto de entrada; quedan expuestos intentos repetidos de login. | Conectar el limiter, aplicar un límite adecuado especialmente a `/login` y probar el código HTTP `429`. |
| Alta | El atributo `secure` de la cookie depende de `$_SERVER['HTTPS']`; en el entorno local HTTP queda desactivado. | En producción debe asegurarse de que la cookie viaje únicamente por HTTPS. | Publicar detrás de HTTPS y configurar correctamente la detección de HTTPS si hay proxy inverso. |
| Media | El middleware autoriza usando el rol del JWT sin consultar en cada petición el estado actual del usuario. | Un cambio de rol o baja de cuenta no necesariamente invalida inmediatamente un token ya emitido. | Verificar estado/rol actual o implementar revocación/versión de sesión. |
| Media | `AuthValidator` verifica campos presentes en login, pero no implementa un límite de intentos por sí mismo. | La validación de entrada no sustituye la defensa frente a fuerza bruta. | Aplicar rate limiting y registrar intentos fallidos sin almacenar contraseñas. |
| Media | `FRONTEND_ORIGIN` tiene valores predeterminados distintos en `compose.yaml` y `.env.docker.example`. | La política CORS puede no coincidir con el origen real del frontend y dificultar o romper el uso de cookies desde el navegador. | Configurar un único origen exacto por entorno y probarlo en el navegador. |
| Media | No existe un endpoint de cambio de contraseña del propio usuario. | La interfaz y la API no ofrecen el flujo completo de cambio seguro por autoservicio. | Definir un endpoint que pida contraseña actual, valide la nueva y guarde su hash; invalidar otros tokens si corresponde. |

## 10. Conclusión

El proyecto tiene una base real para autenticación: hash de contraseñas con funciones específicas de PHP, verificación con `password_verify()`, JWT firmado, cookie `HttpOnly`, expiración y middleware por rol. La separación entre controller, service, repository y modelo facilita que un desarrollador externo siga cada responsabilidad.

Antes de presentar esta solución como lista para producción, es obligatorio resolver como mínimo los secretos predeterminados, el `.gitignore`, HTTPS y las protecciones contra CSRF y fuerza bruta. También debe documentarse que el logout actual expira la cookie del navegador, pero no invalida server-side un token copiado.

**autenticación implementada para desarrollo y pruebas, con endurecimientos pendientes antes de usar información real**.
