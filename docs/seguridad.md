# Proyecto: TheNewfutures – Plataforma de gestión de talleres en convenio con INAU - Rama de Ciberseguridad

<br>

### Estudiantes:

- Emiliano Sanchez
- Gabriel Rendon
- Thiago Ferragut
- Maximiliano Leal
- Ignacio Viera

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
| Phishing | Usuarios del sistema | 4 (Probable) | 3 (Grave) | 12 | Crítico |
| Cross-Site Scripting (XSS) | Formularios y páginas web | 3 (Ocasional) | 3 (Grave) | 9 | Tolerable |
| Ransomware | Equipos donde se desarrolla o utiliza el sistema | 2 (Remota) | 4 (Catastrófica) | 8 | Tolerable |

**Leyenda:** 🟢 Bajo · 🟡 Medio · 🔴 Alto / crítico

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

## 4. Buenas prácticas de seguridad en desarrollo web

<br>

La primera entrega utiliza HTML, CSS y JavaScript, por lo que se aplicarán las siguientes buenas prácticas de seguridad:

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
   Cada usuario tendrá acceso únicamente a las funciones correspondientes a su rol (por ejemplo, administrador o funcionario), evitando accesos no autorizados.

8. **Mantener actualizado el código y las dependencias.**
   Se procurará utilizar versiones actualizadas de las bibliotecas, herramientas y dependencias para corregir vulnerabilidades conocidas y mejorar la seguridad del sistema.

9. **Realizar pruebas de seguridad en formularios y accesos.**
   Se comprobará que los formularios validen correctamente la información ingresada y que las restricciones de acceso funcionen según los permisos definidos para cada usuario.

10. **Documentar las medidas de seguridad aplicadas.**
    Todas las medidas de seguridad implementadas durante el desarrollo serán registradas en la documentación del proyecto, facilitando su mantenimiento, revisión y futuras mejoras.
