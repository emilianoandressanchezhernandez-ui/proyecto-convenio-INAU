# Identidad Visual del Proyecto

## Sistema de Gestión de Talleres en Convenio con INAU

---

<br>

## 1. Principios de diseño

**Claridad institucional.** El sistema se utiliza en el marco de un convenio con un organismo público. La estética evita elementos decorativos llamativos y prioriza una presentación sobria, adecuada al contexto socioeducativo.

**Legibilidad por encima del efecto visual.** Se eligieron contrastes altos, tipografía de tamaño generoso y espaciado amplio. No se utilizan sombras difusas ni degradados: los bordes definidos y los bloques planos hacen que la información sea fácil de escanear.

**Distinción por rol.** Los tres paneles mantienen la misma base visual y los mismos componentes fundamentales, pero con una paleta cromática propia. El usuario reconoce visualmente en qué panel está sin necesidad de leer un rótulo.

**Rapidez de uso.** El panel del tallerista está pensado para cargar asistencia y corregir tareas en pocos pasos, posiblemente desde un celular. Los controles tienen alturas mínimas amplias (40-42 px) para facilitar el uso táctil.

---

<br>

## 2. Paleta cromática

El sistema utiliza **una base neutra compartida** y **un color identitario por rol**.

### 2.1 Base común

| Variable | Valor | Uso |
|---|---|---|
| `--fondo` | `#f5f3ee` / `#f3f1ec` | Fondo general. Blanco cálido, menos agresivo que el blanco puro en uso prolongado. |
| `--superficie` | `#ffffff` | Tarjetas, formularios y tablas. Contrasta con el fondo cálido para separar bloques sin sombras. |
| `--borde` | `#d8d4cb` | Bordes de tarjetas y separadores. |
| `--borde-fuerte` | `#bfc3c4` | Bordes de campos de formulario, con mayor contraste para señalar zonas editables. |
| `--texto` | `#273238` | Texto principal. Gris azulado oscuro, más suave que el negro puro. |
| `--texto-secundario` | `#667176` | Texto de apoyo, descripciones y etiquetas. |
| `--radio` | `4px` | Radio de borde base, compartido por los tres paneles. |

### 2.2 Identidad por rol

| Rol | Principal | Oscuro | Claro | Acento | Carácter |
|---|---|---|---|---|---|
| **Administrador** | `#34465a` azul pizarra | `#263542` | `#e9edf1` | `#a85f49` terracota | Formal y neutro, asociado a supervisión y control. |
| **Tallerista** | `#315f72` azul petróleo | `#243f4b` | `#e8eff1` | `#c47a32` naranja | Más cálido que el administrativo, transmite actividad y trabajo diario. |
| **Alumno** | `#3a6a5c` verde | `#274a40` | `#e6efec` | `#c98a3e` ámbar | El más cálido de los tres, orientado a un público joven sin perder sobriedad. |

El tono **oscuro** se emplea en barras de navegación y encabezados de tabla; el **claro**, en cabeceras de sección e íconos; el **acento**, como remate cromático en bordes y elementos destacados.

### 2.3 Colores de estado

| Estado | Color | Uso |
|---|---|---|
| Éxito | `#4d7b5c` / `#4f775a` | Confirmaciones, asistencia presente, acciones completadas. |
| Peligro | `#a84d45` / `#9d4945` | Eliminaciones, errores, ausencias. |
| Advertencia | `#b8863b` | Avisos y estados intermedios (panel alumno). |

Se eligieron versiones desaturadas de los verdes y rojos convencionales para que convivan con la paleta terrosa del sistema sin resultar estridentes.

---

<br>

## 3. Tipografía

| Aspecto | Definición | Justificación |
|---|---|---|
| Familia | Arial / Helvetica, sans-serif | Fuente del sistema, disponible en cualquier dispositivo sin descarga. Evita dependencias externas y tiempos de carga adicionales. |
| Interlineado | 1.55 | Espaciado amplio que mejora la lectura en listados largos. |
| Títulos | `letter-spacing: -0.01em` | Ligero ajuste que compacta los títulos y los diferencia del cuerpo de texto. |
| Encabezados de tabla | 0.77rem, mayúsculas, `letter-spacing: 0.035em` | Tamaño reducido pero legible; las mayúsculas espaciadas los distinguen del contenido. |
| Etiquetas de formulario | 0.9rem, peso 700 | Negrita para que el usuario identifique rápidamente qué dato corresponde a cada campo. |
| Rótulos de tarjeta informativa | 0.76rem, mayúsculas, `letter-spacing: 0.05em` | Jerarquía visual clara entre el rótulo y el dato que lo acompaña. |

---

<br>

## 4. Componentes compartidos

Estos componentes existen en los tres paneles con idéntica definición, variando únicamente los colores según el rol.

### 4.1 Barra de navegación
Fondo en el tono oscuro del rol, con borde inferior de 4 px en el color de acento. La marca se presenta en mayúsculas, peso 700 y espaciado ampliado. Es el elemento que más rápido comunica en qué panel se encuentra el usuario.

### 4.2 Cabecera de sección (`hero-panel`)
Bloque de fondo claro con borde inferior de 3 px en el color principal y una figura geométrica inclinada en el acento sobre el margen derecho. Aporta identidad sin recurrir a imágenes, manteniendo bajo el peso de la página. En pantallas menores a 992 px la figura se oculta para no competir con el texto. Es el componente de encabezado utilizado en **todas** las pantallas del sistema.

### 4.3 Tarjetas
Fondo blanco, borde de 1 px y radio de 4 px, **sin sombra**. La separación entre bloques se logra por contraste de fondo y borde, no por profundidad simulada.

### 4.4 Tarjetas de taller
Borde izquierdo de 5 px en el color principal que **cambia al acento al pasar el cursor**, junto con un leve cambio de fondo. Señal de interactividad discreta pero clara. Internamente usan una grilla de dos columnas: ícono a la izquierda, texto a la derecha.

### 4.5 Tarjetas de información (`hero-card`)
Fondo levemente tintado con borde superior de 3 px en el color principal. Presentan pares rótulo/dato: el rótulo en mayúsculas pequeñas y gris, el dato en peso 700. Se usan para mostrar datos de contexto (taller, fecha, cantidad de alumnos) sin recurrir a una tabla.

### 4.6 Tablas
Encabezado en el tono oscuro del rol con texto blanco en mayúsculas, y filas que se resaltan al pasar el cursor. Al ser el componente principal para listados de alumnos, asistencias y entregas, se priorizó el contraste del encabezado para que la estructura de columnas quede clara aun en tablas largas.

### 4.7 Formularios
Campos con altura mínima de 42 px y borde definido. Al enfocar, el borde adopta el color principal y se agrega un anillo de 2 px con transparencia. Los campos de solo lectura —como la cédula, que ningún rol puede modificar— se distinguen con **fondo gris y borde punteado**, comunicando la restricción antes de que el usuario intente editarlos.

### 4.8 Botones
Altura mínima de 40 px, radio de 3 px y peso 600, sin sombras. Colores según esquema semántico: principal para acciones habituales, verde para confirmar, rojo para eliminar, claro para acciones secundarias.

### 4.9 Ventanas modales
Se utilizan para acciones que requieren confirmación o carga de datos sin abandonar la pantalla actual: alta y edición de registros en el panel administrador, y carga de material y corrección de tareas en el panel tallerista. Mantener al usuario en la misma vista reduce la pérdida de contexto en flujos de trabajo repetitivos, como corregir varias entregas seguidas.

### 4.10 Insignias y alertas
Las insignias usan radio de 2 px y peso 700 en tamaño reducido, para estados de asistencia o situación del taller. Las alertas llevan un borde izquierdo reforzado de 4 px que actúa como indicador cromático del tipo de mensaje.

### 4.11 Indicador de carga
Spinner de 2.2 rem en el color principal del rol, utilizado mientras se recuperan datos. Mantiene la coherencia cromática incluso en los estados transitorios de la interfaz.

---

<br>

## 5. Componentes específicos por panel

Además de la base común, cada panel define componentes propios según las necesidades de su rol.

### 5.1 Panel administrador
- **Grilla de accesos:** cinco accesos directos en una fila, que se reorganizan a dos columnas y luego a una según el ancho de pantalla.
- **Tarjetas de estadísticas:** borde superior de 3 px en el acento, con el número en gran tamaño a la izquierda y el rótulo a la derecha.

### 5.2 Panel tallerista
- **Bloque de asistencia:** organizado sobre tarjetas de información que muestran el contexto del registro (taller, fecha, presentes) antes del listado de alumnos, para que el tallerista confirme de un vistazo dónde está cargando la asistencia.
- **Gestión de material y tareas:** resuelta mediante tarjetas de resumen, tabla de listado y modales de alta y edición. Se optó por la tabla porque el tallerista administra volúmenes mayores de contenido que el alumno, y necesita ver varias columnas de información simultáneamente.
- **Corrección de entregas:** pantalla dedicada con tabla de entregas y modal de corrección, que permite revisar y calificar sin salir del listado.

### 5.3 Panel alumno
- **Listas de material y tareas (`lista-item`):** filas con ícono a la izquierda, título y descripción a la derecha; el borde cambia al color principal al pasar el cursor. Reemplazan a la tabla en este panel por resultar más legibles en pantallas pequeñas.
- **Nota destacada (`nota-destacada`):** bloque compacto con fondo tintado y número en gran tamaño, que resalta la calificación por encima del resto de la información de la tarea.
- **Zona de archivo (`zona-archivo`):** área con **borde punteado** que señala visualmente el lugar de carga de la entrega. El borde discontinuo es una convención ampliamente reconocida para zonas de subida de archivos.
- **Archivo actual (`archivo-actual`):** bloque con fondo tintado que confirma qué archivo está cargado, diferenciándose claramente de la zona vacía de carga.

---

<br>

## 6. Pantalla de acceso

Fondo oscuro con una trama de cuadrícula sutil generada íntegramente por CSS (sin imágenes). La tarjeta de acceso lleva borde superior de 6 px en el acento y una sombra pronunciada, siendo la única pantalla donde se utiliza profundidad: se justifica porque es el único punto de entrada al sistema y debe destacarse por completo sobre el fondo.

El acceso se realiza mediante **cédula y contraseña**, en lugar de un nombre de usuario inventado. La cédula es un identificador que todos los usuarios conocen de memoria y que ya figura en los registros del organismo, lo que reduce la fricción de acceso y evita gestionar credenciales adicionales.

---

<br>

## 7. Diseño responsive

La interfaz cumple NRF01 mediante Bootstrap 5.3 más ajustes propios en cuatro puntos de quiebre:

| Ancho máximo | Ajuste |
|---|---|
| 1100 px | La grilla de accesos del administrador pasa de 5 a 2 columnas. |
| 992 px | Se reduce el relleno de la cabecera y se oculta la figura decorativa. |
| 768 px | Se reducen títulos y rellenos de tarjetas. |
| 576 px | Los accesos pasan a una sola columna; se achican íconos, tablas y botones. |

El contenido se limita a un ancho máximo de 1200 px para evitar líneas de texto excesivamente largas en monitores grandes.

---

<br>

## 8. Criterio de consistencia entre paneles

La consistencia del sistema se aplica en **dos niveles diferenciados**, con criterios distintos para cada uno.

### 8.1 Base compartida (obligatoria)

Los tres paneles comparten de forma idéntica:

- La estructura de la hoja de estilos y la organización de sus secciones.
- La base neutra: fondo, superficie, bordes, texto y radio de borde.
- La tipografía completa y sus jerarquías.
- Los puntos de quiebre y el ancho máximo de contenido.
- Los componentes fundamentales descritos en la sección 4, con idénticas medidas y comportamientos.

Cualquier cambio en este nivel debe replicarse en los tres paneles.

### 8.2 Componentes específicos (permitidos)

Cada panel puede definir componentes propios cuando su rol lo justifique. Un mismo contenido puede resolverse con componentes distintos según quién lo consulte: el **material y las tareas** se presentan mediante **tabla y modales** en el panel del tallerista, que administra y edita grandes volúmenes de contenido, y mediante **listas (`lista-item`)** en el panel del alumno, que solo consulta y entrega, priorizando la legibilidad en pantallas pequeñas.

Esta diferencia es deliberada y responde al principio de rapidez de uso: cada rol recibe la presentación más eficiente para su tarea, no la más uniforme entre paneles. La coherencia visual se mantiene porque todos los componentes específicos utilizan la misma paleta, tipografía, radios de borde y comportamientos de interacción definidos en la base compartida.

---

<br>

## 9. Uso de variables CSS

Toda la paleta está declarada en variables CSS bajo el selector `:root`. Ningún componente utiliza un color escrito directamente. Esto permite:

- Modificar la identidad de un panel completo cambiando pocas líneas.
- Mantener consistencia automática entre componentes.
- Facilitar ajustes de contraste o accesibilidad sin recorrer todo el archivo.

Es la decisión técnica que sostiene la sección 8: sin variables, mantener tres paletas coherentes exigiría triplicar el trabajo ante cualquier cambio.