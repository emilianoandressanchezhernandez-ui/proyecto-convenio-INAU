# Registro de pruebas 02 — TheNewfutures / INAU

## Sistema de Gestión de Talleres en Convenio con INAU

> **Qué es este documento.** Registra la segunda ronda de pruebas, ejecutada después de los cambios de código posteriores a `Testing-01.md`: cambio de contraseña (`PATCH /perfil/clave`), asistencia real del alumno (`GET /mis-asistencias`), validación de cédula y teléfono, y modal para quitar alumnos de un taller. Además vuelve a probar el defecto DEF-01. Igual que en `Testing-01.md`, los resultados esperados se toman de los requerimientos (`docs/02-analisis/requerimientos.md`). Cuando no coinciden con lo obtenido, la diferencia se registra como defecto. `Testing-01.md` se conserva sin cambios como registro de la primera ronda.

---

<br>

## 1. Alcance y entorno

Se prueban solo las funciones nuevas o modificadas y una regresión breve de la asistencia del tallerista. Varios resultados se confirmaron con peticiones directas a la API desde la misma sesión del navegador, para comprobar que el backend valida aunque se saltee el formulario. Los defectos de Testing-01 que no tuvieron cambios de código (DEF-02 a DEF-08) no se volvieron a probar.

| Elemento | Valor |
|---|---|
| Fecha de ejecución | 26/10/2026 |
| Rama / commit | `cambios-frontend` / `0365616` |
| Servidor | Máquina virtual con Ubuntu Server en VirtualBox, desplegada según `Documento de Reconstruccion - Servidor.md` (API y MySQL 8.4 en Docker; frontend servido por Nginx), con los puertos 8002 y 3308 limitados a `127.0.0.1` |
| Sitio | `http://192.168.1.6` (red local) |
| Navegador | Google Chrome en Windows |
| Ejecutado por | Ejecución asistida por IA (Claude, mediante la extensión Claude en Chrome), supervisada por Gabriel Rendon (subcoordinador). |

**Datos de prueba** (las contraseñas no se publican):

| Rol | Usuario | Uso en esta ronda |
|---|---|---|
| Administrador | carlos.perez@inau.gov.uy | Cambio de contraseña desde la interfaz; altas y validaciones; quitar alumno |
| Tallerista | martin.rodriguez@ejemplo.com | Asistencia; perfil; cambio de contraseña por API |
| Alumno | sofia.pereira@email.com | Asistencia; cambio de contraseña por API |
| Alumno creado en CP-06 | Prueba Testing (cédula 4.999.999-1, sin cuenta de acceso) | Inscripto y quitado del taller 1 en CP-09 |
| Alumno creado en CP-08 | Dup Testing (cédula 49999991, sin cuenta de acceso) | Prueba de cédula duplicada |
| Tallerista creado en CP-07 | tallerista.testing02@example.com (cédula 48888882) | Alta válida de tallerista |

> Todas las contraseñas modificadas durante las pruebas se restauraron a su valor original, y se comprobó el inicio de sesión con ellas. Los tres usuarios creados en esta ronda quedaron en la base de datos del servidor de pruebas.

---

<br>

## 2. Casos de prueba funcionales

| ID | Requisito | Caso | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|---|
| CP-01 | RF05 (nueva prueba de DEF-01) | Como Sofía, consultar "Asistencia" después de que el tallerista registró la del 26/10 | Se ven sus registros reales de asistencia | Se mostraron "26/10 – Programación Web – Tardanza" y "14/08 – Presente", con resumen 50 %, 1 presente y 0 ausencias. La página consultó `GET /api/mis-asistencias` (200). La página todavía carga `mock-data.js`, pero los registros mostrados son los de la base | Aprobado |
| CP-02 | RF04 (regresión) | Como Martín, registrar la asistencia del taller 1 del 26/10 | Se guarda la asistencia | "Asistencia guardada correctamente. 3 registros guardados en MySQL." | Aprobado |
| CP-03 | RF14 | Como Carlos, cambiar la contraseña desde "Perfil": contraseña actual errónea, confirmación distinta, cambio válido y restauración | Se rechazan los datos erróneos; el cambio válido se guarda y la contraseña anterior deja de funcionar | Actual errónea: "La contraseña actual es incorrecta." Confirmación distinta: "Las contraseñas nuevas no coinciden." Cambio válido: "Contraseña actualizada correctamente. Usá la nueva contraseña en tu próximo inicio de sesión.", y se vaciaron los campos. Tras restaurarla desde la interfaz, el inicio de sesión con la contraseña temporal dio 401 y con la original, 200 | Aprobado |
| CP-04 | RF14 | Cambiar la contraseña como tallerista y como alumna | El usuario puede cambiar su contraseña | En la interfaz del tallerista, los campos de contraseña muestran "No disponible" y están deshabilitados. En la de la alumna, el código (`frontend-alumno/js/perfil.js`) también los deshabilita ("No disponible por el momento"); esto no se verificó en pantalla. Por API (`PATCH /api/perfil/clave`): con Martín, actual errónea → 400 "La contraseña actual es incorrecta."; nueva corta → 400 "La nueva contraseña debe tener al menos 8 caracteres."; nueva igual a la actual → 400 "La nueva contraseña debe ser diferente de la actual." Con Sofía, el cambio dio 200 "Contraseña actualizada correctamente."; luego la contraseña anterior dio 401 y la nueva 200. Se restauró (200) y la original volvió a funcionar (200) | Parcial |
| CP-05 | RF14 / NRF05 | Como Martín, guardar en "Perfil" los teléfonos "099abc123" y "123", y guardar sin cambios | Los teléfonos inválidos se rechazan | "099abc123" y "123": "El teléfono debe contener entre 8 y 15 dígitos." y no se guardaron. Sin cambios: "No hay cambios para guardar." | Aprobado |
| CP-06 | RF02 / NRF05 | Como administrador, crear un alumno con cédulas "12ab", "1234567" y "123456789", con teléfonos "099abc123" y "1234", y luego uno válido | Los datos inválidos se rechazan en el formulario y en la API; el válido se guarda | Formulario: las tres cédulas → "La cédula debe contener exactamente 8 dígitos."; "099abc123" → "El teléfono solo puede contener números y separadores válidos."; "1234" → "El teléfono debe contener entre 8 y 15 dígitos." API (`POST /api/alumnos`): los mismos casos → 422, con "La cédula debe contener exactamente 8 dígitos." o "El teléfono debe contener entre 8 y 15 dígitos y no puede incluir letras." El alumno válido (cédula "4.999.999-1", teléfono "099 123 456") se creó y apareció en la lista | Aprobado |
| CP-07 | RF02 / NRF05 | Como administrador, crear un tallerista con los mismos datos inválidos y luego uno válido | Los datos inválidos se rechazan en el formulario y en la API; el válido se guarda | Formulario: las cédulas inválidas no se envían; el navegador muestra su mensaje genérico "Utiliza un formato que coincida con el solicitado" (validación HTML del campo), no un mensaje propio como en el formulario de alumnos. Los teléfonos dieron los mismos mensajes que en CP-06. API (`POST /api/talleristas`): los cuatro casos → 422 con los mensajes de cédula o teléfono. El tallerista válido (cédula 48888882) se creó y apareció en la lista | Aprobado |
| CP-08 | RF02 | Por API, crear un alumno con la cédula de CP-06 escrita igual ("4.999.999-1") y sin puntos ni guion ("49999991") | Ambas se rechazan por cédula repetida | "4.999.999-1": 400 "Ya existe un alumno con esa cédula." "49999991": 201 "Alumno creado correctamente."; quedaron dos alumnos con la misma cédula escrita de dos formas | Fallido |
| CP-09 | RF03 | Como administrador, en el detalle del taller 1, quitar a "Prueba Testing": primero cancelar y después confirmar | Al cancelar sigue inscripto; al confirmar deja de figurar en el taller y el alumno sigue existiendo | Se abrió el modal "Quitar alumno del taller — ¿Estás seguro de que querés quitar a Prueba Testing de este taller? Se eliminará su inscripción en el taller." Con "Cancelar" siguió inscripto. Con "Quitar inscripción" desapareció de la tabla y de `GET /api/talleres/1/alumnos`. El alumno siguió existiendo (`GET /api/alumnos/4` → 200, estado "Activo") | Aprobado |

---

<br>

## 3. Pruebas no funcionales y de seguridad

| ID | Requisito | Caso | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|---|
| NF-01 | NRF07 / Seguridad | Llamar a `PATCH /api/perfil/clave` sin sesión y con un campo no permitido (`rol`) | Sin sesión se rechaza; el campo extra se rechaza | Sin sesión: 401 "Tenes que iniciar sesion." Con el campo `rol`: 400 "El campo 'rol' no está permitido." | Aprobado |

---

<br>

## 4. Defectos

### 4.1 Estado de los defectos de Testing-01

| ID | Descripción | Estado tras esta ronda |
|---|---|---|
| DEF-01 | La asistencia del alumno mostraba datos simulados | **Cerrado**: verificado en CP-01 |
| DEF-02 a DEF-04, DEF-06 a DEF-08 | Ver `Testing-01.md`, sección 4 | Abiertos; no se probaron en esta ronda porque no tuvieron cambios de código |
| DEF-05 | Documentos de oficina rechazados | Cerrado en Testing-01 (requisito modificado, CC-13) |

### 4.2 Defectos nuevos

| ID | Caso | Descripción | Severidad | Estado | Referencia |
|---|---|---|---|---|---|
| DEF-09 | CP-08 | El control de cédula repetida compara el texto tal como se escribe: "4.999.999-1" y "49999991" se aceptan como cédulas distintas | Media | Abierto | `AlumnoValidator.php` acepta ambos formatos; la comprobación de duplicados no los normaliza |
| DEF-10 | CP-04 | El tallerista y el alumno no pueden cambiar su contraseña desde la interfaz; la API (`PATCH /perfil/clave`) sí lo permite | Media | Abierto | `frontend-tallerista/perfil.html`, `frontend-alumno/js/perfil.js` |

---

<br>

## 5. Resumen de resultados

| Área | Casos | Aprobados | Parciales | Fallidos | No ejecutados |
|---|---:|---:|---:|---:|---:|
| Funcionales | 9 | 7 | 1 | 1 | 0 |
| No funcionales y seguridad | 1 | 1 | 0 | 0 | 0 |
| **Total** | **10** | **8** | **1** | **1** | **0** |

**Criterios:** iguales a los de `Testing-01.md`.

**Observaciones de la ejecución:**
- Los diálogos de confirmación del navegador (`confirm()`) se reemplazaron por funciones que los aceptan automáticamente, para que no bloquearan la ejecución asistida. El modal de CP-09 es propio de la página y se probó con sus botones.
- Solo "quitar alumno" usa un modal propio. Las demás confirmaciones siguen usando el diálogo del navegador: cerrar sesión (tres paneles), finalizar taller, desactivar alumno o tallerista, quitar tallerista de un taller y eliminar material o tarea. Lo observó el supervisor de forma manual y se confirmó en el código. No es un defecto, porque los requerimientos no exigen un tipo de confirmación, pero la interfaz queda inconsistente.
- En CP-07, el formulario del tallerista valida la cédula con la validación nativa del navegador, mientras que el del alumno muestra un mensaje propio; el resultado (no se envía) es el mismo.
- Los mensajes de teléfono del formulario y de la API no son idénticos ("El teléfono debe contener entre 8 y 15 dígitos." frente a "… y no puede incluir letras."), aunque coinciden en la regla.

**Limitaciones:** pruebas manuales y asistidas, sin pruebas automatizadas; ronda limitada a los cambios nuevos y a la regresión de asistencia; no se repitieron las pruebas de vista de teléfono ni de persistencia tras reiniciar los contenedores.

**Documentos relacionados:** `Testing-01.md`, `requerimientos.md`, `Documento de Reconstruccion - Servidor.md` y `Doc NMAP.md`.