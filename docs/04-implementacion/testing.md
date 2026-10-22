# Plan y registro de pruebas — TheNewfutures / INAU

## Sistema de Gestión de Talleres en Convenio con INAU

> **Qué es este documento.** Registra las pruebas realizadas sobre el sistema
> (frontend, API y base de datos), cada una vinculada al requerimiento que verifica,
> con su resultado real. Las incoherencias detectadas se derivan a la
> Revisión de Coherencia.

---

## 1. Objetivo y alcance

- Qué se prueba: los requerimientos de la primera versión (RF y NRF).
- Qué no se prueba: los requerimientos postergados (RF15, RF18, RF20, RF21, RF23, RF26).
- Tipo de prueba: manual, funcional, de caja negra, sobre la interfaz y sobre la API.

## 2. Entorno de prueba

| Elemento | Valor |
|---|---|
| Fecha de ejecución | <fecha> |
| Rama / commit | `cambios-frontend` / `<commit>` |
| Entorno | Docker Desktop |
| API | http://localhost:8002 |
| Frontend | http://localhost:8000 |
| Navegadores | <Chrome x, Firefox y> |
| Dispositivos | Computadora; teléfono <modelo> o modo dispositivo del navegador |
| Ejecutado por | <integrante> |

## 3. Datos de prueba

| Rol | Usuario | Uso en las pruebas |
|---|---|---|
| Administrador | carlos.perez@inau.gov.uy | Gestión de usuarios, talleres y reportes |
| Tallerista | maria.lopez@inau.gov.uy | Asistencia, material, corrección |
| Alumno | sofia.pereira@email.com | Consulta de material y entregas |

> Las contraseñas de prueba no se publican en este documento. <o indicar dónde están>

## 4. Criterios

- **Aprobado:** el resultado obtenido coincide con el esperado.
- **Fallido:** no coincide; se registra en la sección 7.
- **Parcial:** funciona con limitaciones conocidas.
- **No ejecutado:** no se pudo probar (se indica el motivo).

## 5. Casos de prueba funcionales

### 5.1 Acceso y roles (RF01)

| ID | Requerimiento | Caso | Pasos | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|---|---|
| CP-01 | RF01 | Login correcto como administrador | Ingresar correo y contraseña válidos | Redirige al panel de administrador | | |
| CP-02 | RF01 | Login con contraseña incorrecta | Ingresar contraseña errónea | Mensaje de error, sin acceso | | |
| CP-03 | RF01 / NRF07 | Acceso a un panel ajeno | Como alumno, abrir una URL del panel admin | La API rechaza la petición (401/403) | | |

### 5.2 Gestión de usuarios y talleres (RF02, RF03)
### 5.3 Asistencia (RF04, RF05)
### 5.4 Material y tareas (RF06, RF07, RF16)
### 5.5 Entregas, corrección y notas (RF08, RF09, RF10, RF17)
### 5.6