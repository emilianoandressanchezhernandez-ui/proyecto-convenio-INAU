# Proyecto: TheNewfutures – Plataforma de gestión de talleres en convenio con INAU - Rama de Ciberseguridad

**Fecha de elaboración:** 5 de agosto de 2026  
**Última actualización:** 25 de octubre de 2026

<br>

### Estudiantes:

- Emiliano Sanchez
- Gabriel Rendon
- Thiago Ferragut

---

<br>

## 1. Identificación de amenazas digitales


### Amenaza 1: Phishing

El phishing consiste en engañar a los usuarios mediante correos, mensajes o sitios falsos para que entreguen sus credenciales de acceso.

**Riesgo para el proyecto:** Un funcionario podría ingresar su usuario y contraseña en una página falsa, permitiendo que un atacante acceda al sistema.

---

### Amenaza 2: Cross-Site Scripting (XSS)

El XSS ocurre cuando un atacante introduce código JavaScript malicioso en campos de entrada y este se ejecuta en el navegador de otros usuarios.

**Riesgo para el proyecto:** Si el sistema tiene formularios para registrar información, comentarios o mensajes, un atacante podría insertar código malicioso.

---

### Amenaza 3: Ransomware

El ransomware es un tipo de malware que cifra los archivos de un equipo o sistema y exige un pago para recuperar el acceso a ellos.

**Riesgo para el proyecto:** Si alguno de los equipos donde se desarrolla o almacena el sistema es infectado, los archivos del proyecto podrían quedar inaccesibles o perderse, afectando el desarrollo del sistema y la disponibilidad de la información.

---

<br>

## 2. Mapa de Riesgos

| Amenaza | Escenario | Probabilidad (1-5) | Impacto (1-4) | Riesgo (P × I) | Clasificación |
|---|---|---|---|---|---|
| Phishing | Usuarios del sistema | 4 (Probable) | 3 (Grave) | 12 | 🔴 Crítico |
| Cross-Site Scripting (XSS) | Formularios y páginas web | 3 (Ocasional) | 3 (Grave) | 9 | 🟡 Tolerable |
| Ransomware | Equipos donde se desarrolla o utiliza el sistema | 2 (Remota) | 4 (Catastrófica) | 8 | 🟡 Tolerable |

**Criterio de clasificación:**

| Riesgo (P × I) | Clasificación |
|---|---|
| 1 a 4 | 🟢 Aceptable |
| 5 a 9 | 🟡 Tolerable |
| 10 a 20 | 🔴 Crítico |

---

<br>

### Impacto detallado por amenaza.

---

<br>


**Phishing:**
- *Impacto técnico:* Puede comprometer cuentas, robar credenciales y permitir accesos no autorizados al sistema.
- *Impacto sobre los usuarios:* Pérdida de información personal, fraude y disminución de la confianza en el sistema.

**Cross-Site Scripting (XSS):**
- *Impacto técnico:* Permite la ejecución de código malicioso en la aplicación web, comprometiendo datos y sesiones de usuarios.
- *Impacto sobre los usuarios:* Robo de información, secuestro de sesiones y exposición de datos personales.

**Ransomware:**
- *Impacto técnico:* Cifra archivos y deja el sistema fuera de servicio hasta su recuperación, causando interrupciones importantes.
- *Impacto sobre los usuarios:* Pérdida temporal o permanente de acceso a la información y retrasos en el uso del sistema.

---

<br>

## 3. Buenas prácticas de seguridad en desarrollo web

<br>

Estas buenas prácticas se definieron en la primera entrega, cuando el sistema solo tenía frontend (HTML, CSS y JavaScript). Con la incorporación de la API y la base de datos, se aplicaron también en el backend. Su estado actual se resume en la sección 4.

1. **Validar todos los datos ingresados por el usuario.**
   Se verificará que la información ingresada tenga el formato esperado antes de ser procesada, evitando datos incorrectos o potencialmente maliciosos.

2. **Sanitizar la información antes de mostrarla en la interfaz.**
   Los datos proporcionados por los usuarios serán limpiados antes de mostrarse en la página para evitar la ejecución de código malicioso y proteger la aplicación de ataques como XSS.

3. **Evitar el uso de innerHTML cuando no sea necesario.**
   Se minimizará el uso de esta propiedad, ya que puede permitir la inserción de código HTML o JavaScript no deseado cuando se utilizan datos provenientes del usuario.

4. **Utilizar textContent para mostrar texto ingresado por usuarios.**
   Siempre que sea posible, se utilizará textContent, ya que muestra el contenido como texto plano sin interpretar etiquetas HTML, reduciendo el riesgo de ataques XSS.

5. **Implementar autenticación segura para el acceso al sistema.**
   El acceso estará protegido mediante un inicio de sesión con usuario y contraseña, verificando la identidad del usuario antes de permitir el acceso a las funcionalidades del sistema.

6. **Utilizar HTTPS para proteger la comunicación.**
   Cuando el sistema sea desplegado, se utilizará el protocolo HTTPS para cifrar la comunicación entre el navegador y el servidor, evitando la interceptación de información.

7. **Controlar permisos según el rol del usuario.**
   Cada usuario tendrá acceso únicamente a las funciones correspondientes a su rol (administrador, tallerista o alumno), evitando accesos no autorizados.

8. **Mantener actualizado el código y las dependencias.**
   Se procurará utilizar versiones actualizadas de las bibliotecas, herramientas y dependencias para corregir vulnerabilidades conocidas y mejorar la seguridad del sistema.

9. **Realizar pruebas de seguridad en formularios y accesos.**
   Se comprobará que los formularios validen correctamente la información ingresada y que las restricciones de acceso funcionen según los permisos definidos para cada usuario.

10. **Documentar las medidas de seguridad aplicadas.**
    Todas las medidas de seguridad implementadas durante el desarrollo serán registradas en la documentación del proyecto, facilitando su mantenimiento, revisión y futuras mejoras.

---

<br>

## 4. Estado de las medidas en el sistema

Estado verificado en el código y en las pruebas del sistema al 25 de octubre de 2026.

| Práctica | Estado | Evidencia |
|---|---|---|
| 1. Validar los datos ingresados | Implementado | Validación en el frontend y clases validadoras por entidad en la API. Pruebas CP-05 y CP-11 de `docs/04-implementacion/Testing/Testing-01.md`. |
| 2. Sanitizar antes de mostrar | Implementado | Funciones de escape en los módulos del frontend. Prueba NF-06: un título con `<script>` se mostró como texto, sin ejecutarse. |
| 3. Evitar `innerHTML` | Parcial | Se usa `textContent` (181 usos), pero quedan 69 usos de `innerHTML`, acompañados de funciones de escape. |
| 4. Usar `textContent` | Implementado | Ver la práctica 3. Prueba NF-06. |
| 5. Autenticación segura | Implementado, con pendientes | Acceso por correo y contraseña, contraseñas almacenadas con hash y token de sesión en una cookie `HttpOnly`. Mensaje genérico ante credenciales incorrectas (prueba CP-02). Pendiente: limitar los intentos de inicio de sesión. Detalle en `Mecanismos_Autenticacion_Criptografia_INAU.md`. |
| 6. Usar HTTPS | Documentado, no aplicado en el servidor de prueba | La guía `Documento de Reconstruccion - Servidor.md` incluye HTTPS con Certbot. El servidor de prueba funciona sin HTTPS (puerto 443 cerrado según `Doc NMAP.md`). |
| 7. Controlar permisos por rol | Implementado | Cada ruta de la API declara el rol permitido y se verifica la pertenencia al taller. Pruebas NF-02 y NF-03. |
| 8. Mantener actualizadas las dependencias | Parcial | Dependencias fijadas en `composer.lock`; PHP 8.3 y MySQL 8.4. No hay un procedimiento de actualización definido. El escaneo con Nmap mostró las versiones exactas de los servicios publicados. |
| 9. Pruebas de seguridad | Realizadas | `Testing/Testing-01.md` (24/10/2026) y escaneo con Nmap (`Doc NMAP.md`, 24 y 25/10/2026). |
| 10. Documentar las medidas | Implementado | Carpeta `docs/05-Ciberseguridad`. |

### Medidas frente al phishing (riesgo crítico)

El phishing es la única amenaza clasificada como crítica. El sistema la mitiga en parte: el inicio de sesión responde con el mismo mensaje cuando el correo no existe o la contraseña es incorrecta, lo que no revela qué cuentas están registradas; las contraseñas se guardan con hash, y la sesión vence después de un tiempo configurado. Quedan pendientes medidas que reducirían el impacto de una credencial robada: limitar los intentos de inicio de sesión, incorporar una verificación en dos pasos y capacitar a los usuarios para reconocer correos y sitios falsos.