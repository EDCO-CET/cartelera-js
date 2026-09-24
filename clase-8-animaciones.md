# Clase 8 · Animaciones y transiciones CSS en la cartelera

Esta guía explica, paso a paso, cómo darle movimiento a la cartelera de eventos que venimos construyendo. Parte del proyecto tal como quedó en la clase 7 (con CSS Grid) y llega al resultado de la rama `clase-8`.

Está escrita para leerse de principio a fin sin conocimientos previos de animación. Cada término nuevo se explica la primera vez que aparece. Si ya sabes qué es una pseudoclase o un `@keyframes`, puedes saltar directamente al código de cada paso.

## Cómo leer esta guía

Cada paso tiene la misma estructura:

- **¿Qué vamos a lograr?** Lo que verás en pantalla al terminar el paso.
- **Conceptos nuevos.** Las ideas que necesitas entender, explicadas con palabras sencillas.
- **Dónde va el código.** El archivo y el lugar exacto.
- **El código.** Listo para copiar.
- **Línea por línea.** Qué hace cada parte del código y por qué está ahí.
- **Pruébalo.** Qué hacer en el navegador para ver el resultado y experimentar.
- **Cuidado con...** Los errores más frecuentes y cómo reconocerlos.

Al lado de cada título aparece el número de la slide de la presentación de la clase que trata ese tema.

## Glosario rápido

Palabras que usaremos todo el tiempo. Vuelve aquí si alguna se te olvida.

- **Propiedad CSS.** Cada instrucción de estilo, como `color: red` o `width: 100px`. La parte antes de los dos puntos es la propiedad; la parte de después es su valor.
- **Selector.** Lo que va antes de las llaves y dice a qué elementos aplicar los estilos. `.btn` selecciona todo lo que tenga `class="btn"`.
- **Estado.** La situación en la que está un elemento en un momento dado: normal, con el cursor encima, pulsado, con el foco del teclado, etc.
- **Pseudoclase.** Un selector que apunta a un estado. Se escribe con dos puntos: `:hover` (cursor encima), `:active` (mientras se hace clic), `:focus` (seleccionado con el teclado o el clic).
- **Pseudoelemento.** Una "pieza extra" que el CSS dibuja dentro de un elemento sin que exista en el HTML. Se escribe con dos pares de puntos: `::before` (antes del contenido) y `::after` (después). Sirven para líneas decorativas, iconos, capas de color.
- **Viewport.** El área visible del navegador, sin contar pestañas ni barras. Cuando decimos "entra en pantalla" nos referimos al viewport.
- **DevTools.** Las herramientas de desarrollador del navegador. Se abren con clic derecho › Inspeccionar, o con F12. Nos dejan cambiar el CSS en vivo sin tocar el archivo.
- **Layout (o reflow).** El cálculo que hace el navegador para saber dónde va cada elemento y cuánto mide. Es un trabajo pesado. Si una animación lo obliga a repetirlo en cada fotograma, se ve a saltos.
- **GPU.** El chip gráfico del computador. Algunas propiedades (`transform`, `opacity`) se pueden animar directamente ahí, sin recalcular el layout. Por eso son "baratas".
- **Fotograma (frame).** Cada imagen que el navegador dibuja. Para que un movimiento se vea fluido necesita unos 60 por segundo. Si se pierden fotogramas, la animación "se traba".

## ¿Qué vamos a construir?

Al terminar, la cartelera tendrá movimiento en estos lugares. Todo con CSS, salvo dos casos pequeños que necesitan JavaScript.

| Qué se ve | Cómo se hace | Slides |
|---|---|---|
| Los botones se elevan al pasar el cursor y bajan al hacer clic | `transition` + `:hover` / `:active` / `:focus-visible` | 7, 11 |
| Los campos del formulario se iluminan al seleccionarlos | `transition` en `:focus` | 7 |
| Una línea crece debajo de cada enlace del menú | `::after` + `transform: scaleX` | 21, 9 |
| Las tarjetas se elevan, la foto hace zoom y aparece una etiqueta | `transform`, `filter`, "hover del padre" | 14, 20, 23 |
| Las tarjetas aparecen una tras otra al cargar la página | `@keyframes` + `animation-delay` | 16, 17, 19 |
| La tarjeta de "Eventos destacados" gira en 3D y su botón pulsa | `perspective`, `preserve-3d`, `backface-visibility` | 18, 22 |
| Las cajas de la sección Grid crecen y giran un poco | variables CSS animadas | 24 |
| Las secciones aparecen al hacer scroll | Intersection Observer (JavaScript) | 25 |
| Todo se apaga si el usuario pidió "menos movimiento" | `prefers-reduced-motion` | 27, 28 |
| El header tiene fondo degradado y el título también | `linear-gradient`, `background-clip: text` | Extra |
| Un banner de bienvenida con foto de fondo | fondos múltiples, `background-size: cover`, `clamp()` | Extra |
| El degradado del header se "enciende" al hacer scroll | `animation-timeline: scroll()` | Extra |

**La regla de oro de toda la clase** (slide 34): ninguna animación puede cambiar `width`, `height`, `top` ni `left`, y todo tiene que respetar la preferencia de "movimiento reducido" del usuario. Al final hay un checklist para comprobarlo.

## Antes de empezar (5 minutos)

**1. Crear la rama de trabajo.** En la terminal, dentro de la carpeta del proyecto:

```bash
git checkout clase-7
git checkout -b clase-8
```

La primera línea te lleva a la rama de la clase pasada. La segunda crea una rama nueva llamada `clase-8` a partir de ella y te mueve a esa rama.

**2. Abrir la página.** En VS Code, clic derecho sobre `index.html` › "Open with Live Server". Cada vez que guardes un archivo, el navegador se recargará solo.

**3. Abrir el panel de animaciones de DevTools.** Abre DevTools (F12), haz clic en los tres puntos de arriba a la derecha › More tools › Animations. Ese panel graba cada animación que ocurre y te deja reproducirla al 25% de velocidad. Lo usaremos en los pasos 6 y 7.

**4. Localizar "Reducir movimiento".** En macOS: Ajustes › Accesibilidad › Pantalla › Reducir movimiento. En Windows: Configuración › Accesibilidad › Efectos visuales › Efectos de animación. Lo usaremos en el paso 10.

### La idea central en una frase

Para que algo se anime en CSS necesitas **dos estados** (cómo se ve antes y cómo se ve después) y **una forma de pasar de uno a otro** (`transition` o `animation`). Casi todos los errores vienen de olvidar una de las dos cosas.

### La regla que más se olvida

La `transition` se escribe en el estado **normal** del elemento, nunca dentro de `:hover`. Si la pones en `:hover`, el elemento se anima al entrar el cursor pero vuelve de golpe al salir, porque en el estado normal no hay transición declarada.

---

## Paso 1 · Los tiempos de la casa — slides 8 y 10

### ¿Qué vamos a lograr?

Nada visible todavía. Vamos a definir cuánto duran las animaciones del sitio y con qué "ritmo" se mueven, para usar siempre los mismos valores.

### Conceptos nuevos

**Variables CSS.** Una variable es un nombre al que le asignas un valor para reutilizarlo. Se escriben con dos guiones al inicio: `--mi-variable: 10px`. Se leen con `var(--mi-variable)`. El proyecto ya usa variables para los colores, en el bloque `:root` (que significa "la raíz del documento", o sea, disponibles en toda la página).

**Duración.** Cuánto tarda la animación. Se escribe en segundos (`0.3s`) o milisegundos (`300ms`). Para interfaces, lo cómodo está entre 150 y 500 ms. Más de medio segundo se siente lento; menos de 100 ms casi no se percibe.

**Curva de aceleración (timing function).** No es lo mismo moverse a velocidad constante que empezar rápido y frenar suave. La curva define ese ritmo:

- `linear`: velocidad constante. Se ve mecánico. Bueno para cosas que giran sin parar.
- `ease-in`: empieza lento y acelera. Para cosas que **salen** de la pantalla.
- `ease-out`: empieza rápido y frena. Para cosas que **entran** en la pantalla.
- `ease-in-out`: lento al inicio y al final. Para movimientos que van de un lugar a otro.
- `cubic-bezier(...)`: una curva hecha a medida con cuatro números. No hace falta entender los números: se dibujan en [cubic-bezier.com](https://cubic-bezier.com) y se copian.

### Dónde va el código

`styles.css`, dentro del bloque `:root { ... }`, después de la línea `--header-offset`.

### El código

```css
  /* Tokens de movimiento (clase 8) */
  --duration-fast: 150ms;
  --duration-base: 300ms;
  --duration-slow: 500ms;
  --ease-out: cubic-bezier(.22, 1, .36, 1);
  --ease-in-out: ease-in-out;
```

### Línea por línea

- `--duration-fast: 150ms`: para reacciones inmediatas, como un botón al pulsarlo.
- `--duration-base: 300ms`: el valor por defecto para casi todo.
- `--duration-slow: 500ms`: para cambios grandes, como el zoom de una foto.
- `--ease-out: cubic-bezier(.22, 1, .36, 1)`: una curva que frena de forma muy suave al final. La usaremos para todo lo que "entra".
- `--ease-in-out: ease-in-out`: guardamos el nombre estándar en una variable para poder cambiarlo después desde un solo sitio.

### Pruébalo

Abre [cubic-bezier.com](https://cubic-bezier.com). Escribe `.22, 1, .36, 1` en la curva de la izquierda y deja `ease-out` en la de la derecha. Pulsa "Go" y compara: misma duración, sensación distinta.

### Cuidado con...

- Escribir `300` sin unidad. CSS no adivina si son segundos o milisegundos: sin `s` o `ms`, la regla se ignora y la animación no ocurre.

---

## Paso 2 · Botones que responden — slides 7 y 11

### ¿Qué vamos a lograr?

Al pasar el cursor por "Comprar Ticket", el botón se oscurece y se eleva 3 píxeles. Al hacer clic, vuelve a su sitio. Al navegar con la tecla Tab, aparece un contorno blanco.

### Conceptos nuevos

**`transition`.** La propiedad que le dice al navegador: "cuando este valor cambie, no lo cambies de golpe, hazlo poco a poco". Su sintaxis es:

```
transition: [qué propiedad] [cuánto dura] [con qué curva];
```

Por ejemplo, `transition: color 300ms ease` significa "si el color cambia, tarda 300 ms en cambiar, frenando al final". Se pueden poner varias separadas por coma.

**Pseudoclases de interacción.** Ya están en el glosario, pero aquí las usamos de verdad:

- `:hover`: el cursor está encima.
- `:active`: se está haciendo clic (el botón del mouse está abajo).
- `:focus-visible`: el elemento está seleccionado **con el teclado**. Es la versión moderna de `:focus`: solo se muestra cuando ayuda (teclado), no cuando haces clic con el mouse.

**`transform: translateY()`.** Mueve un elemento hacia arriba o hacia abajo **visualmente**, sin cambiar su lugar en el layout. Los elementos vecinos no se enteran. `translateY(-3px)` lo sube 3 píxeles.

### Dónde va el código

`styles.css`, reemplazar el bloque `.btn` y `.btn:hover` que hay ahora (el actual solo baja la opacidad).

### El código

```css
.btn {
  padding: .5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition:
    background-color var(--duration-base) ease,
    transform var(--duration-fast) ease;
}

.btn:hover  { transform: translateY(-3px); }
.btn:active { transform: translateY(0); }

.btn:focus-visible {
  outline: 2px solid var(--white-color);
  outline-offset: 2px;
}

.btn--accent:hover { background-color: var(--primary-color); }
```

### Línea por línea

- `transition: background-color var(--duration-base) ease, transform var(--duration-fast) ease`: dos transiciones a la vez. El color tarda 300 ms; el movimiento, 150 ms. Que el movimiento sea más rápido que el color hace que el botón se sienta "vivo".
- `.btn:hover { transform: translateY(-3px); }`: cuando el cursor está encima, súbelo 3 px. Como en `.btn` ya declaramos la transición, el navegador hace el cambio suavemente.
- `.btn:active { transform: translateY(0); }`: mientras se hace clic, vuelve a la posición original. Da la sensación de "hundir" el botón.
- `.btn:focus-visible { outline: ... }`: el contorno para usuarios de teclado. `outline-offset: 2px` lo separa un poco del borde para que se vea bien.
- `.btn--accent:hover { background-color: var(--primary-color); }`: el botón azul se vuelve un azul más oscuro al pasar el cursor.

### Pruébalo

1. Pasa el cursor sobre cualquier "Comprar Ticket". Se oscurece y se eleva.
2. Haz clic y mantén pulsado. Baja a su sitio. Suelta: vuelve a subir.
3. Haz clic en cualquier parte vacía de la página y pulsa Tab varias veces. Cuando el foco llegue a un botón, verás el contorno blanco. Haz clic en un botón con el mouse: el contorno no aparece. Eso es `:focus-visible`.

### Cuidado con...

- Mover el botón con `margin-top: -3px` en vez de `translateY(-3px)`. Se ve parecido, pero el margen cambia el layout: los vecinos se mueven y el navegador recalcula todo en cada fotograma.
- Quitar el `outline` sin dar nada a cambio. Hay personas que navegan solo con teclado; sin el contorno no saben dónde están. El foco visible es accesibilidad, no decoración.

---

## Paso 3 · Campos del formulario que se iluminan — slide 7

### ¿Qué vamos a lograr?

Cuando haces clic en un campo del formulario (o llegas a él con Tab), su borde se vuelve azul y aparece un halo suave alrededor. Además los campos quedan más grandes y con los colores oscuros del sitio.

### Conceptos nuevos

**`:focus`.** El estado de "este es el campo donde estoy escribiendo". Solo un elemento de la página puede tener el foco a la vez.

**`box-shadow` como halo.** Normalmente `box-shadow` dibuja una sombra. Pero si le das desplazamiento 0 y un "radio de extensión", dibuja un anillo alrededor del elemento. `box-shadow: 0 0 0 3px azul` es un anillo azul de 3 px. Se puede animar sin tocar el layout, a diferencia del borde.

**`font: inherit`.** Los campos de formulario **no heredan** la letra del sitio; el navegador les pone la suya. Esta línea les dice "usa la misma letra que tu padre".

**`color-scheme: dark`.** Le avisa al navegador que el campo está sobre un fondo oscuro, para que dibuje oscuros también los controles que él mismo pone (el calendario del campo de fecha, las flechas del campo numérico).

### Dónde va el código

`styles.css`, reemplazar la regla `form input { height: 2rem; }`.

### El código

```css
form input,
form textarea {
  width: 100%;
  min-height: 2.75rem;
  padding: .625rem .875rem;
  font: inherit;
  color: var(--text-color);
  background-color: #161a24;
  border: 2px solid var(--border-color);
  border-radius: 6px;
  color-scheme: dark;
  transition:
    border-color var(--duration-base) ease,
    box-shadow var(--duration-base) ease,
    background-color var(--duration-base) ease;
}

form input:focus,
form textarea:focus {
  outline: none;
  border-color: var(--accent-color);
  background-color: #1a1f2b;
  box-shadow: 0 0 0 3px rgba(79, 140, 255, 0.25);
}
```

### Línea por línea

- `min-height: 2.75rem`: 44 píxeles. Es el tamaño mínimo recomendado para tocar con el dedo en un celular.
- `padding: .625rem .875rem`: espacio interior para que el texto no quede pegado al borde.
- `border: 2px solid var(--border-color)`: un borde gris fijo. En el foco solo cambiaremos su **color**, no su grosor, para no mover nada.
- `transition: border-color ..., box-shadow ..., background-color ...`: las tres cosas que van a cambiar en el foco, todas suaves.
- `outline: none`: quitamos el contorno del navegador **porque lo reemplazamos** por el borde azul y el halo. Nunca se quita sin dar algo a cambio.
- `box-shadow: 0 0 0 3px rgba(79, 140, 255, 0.25)`: el halo. `rgba` es un color con transparencia: los tres primeros números son el azul de acento y `0.25` significa 25% de opacidad.

### Pruébalo

1. Haz clic en el campo "Nombre". El borde se pone azul y aparece el halo.
2. Pulsa Tab. El halo pasa al campo siguiente con una transición suave.
3. Haz clic en el campo "Fecha": el calendario que se abre es oscuro gracias a `color-scheme: dark`.

### Cuidado con...

- Animar `border-width` o `padding` para "agrandar" el campo cuando tiene el foco. Cada cambio de tamaño obliga a recalcular el layout de todo el formulario. Para el mismo efecto, usa `box-shadow`.

---

## Paso 4 · Menú con línea que crece — slides 21 y 9

### ¿Qué vamos a lograr?

Al pasar el cursor por "Inicio", "Eventos" o "Acerca de nosotros", una línea azul crece de izquierda a derecha debajo del texto.

### Conceptos nuevos

**Pseudoelemento `::after`.** Una pieza que el CSS dibuja después del contenido de un elemento. Para que exista necesita la propiedad `content`, aunque esté vacía: `content: ''`. Es como pegar una cinta invisible al final del elemento y luego pintarla.

**`position: absolute` dentro de `position: relative`.** Un elemento absoluto se coloca donde tú digas (`left`, `bottom`, etc.), pero **respecto a su ancestro posicionado más cercano**. Si el enlace tiene `position: relative`, la línea se coloca respecto al enlace. Si lo olvidas, se coloca respecto a toda la página.

**`transform: scaleX()`.** Estira o encoge un elemento horizontalmente. `scaleX(0)` lo hace invisible (ancho cero); `scaleX(1)` lo deja en su tamaño real. Como es un `transform`, no toca el layout.

**`transform-origin`.** El punto desde el que se aplica la transformación. Por defecto es el centro: la línea crecería desde el medio hacia los dos lados. Con `left`, crece desde la izquierda.

### Dónde va el código

`styles.css`, reemplazar la regla `.nav-list a`.

### El código

```css
.nav-list a {
  position: relative;
  padding-bottom: .25rem;
  text-decoration: none;
}

.nav-list a::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;              /* tamaño final fijo; se anima la escala */
  height: 2px;
  background-color: var(--accent-color);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform var(--duration-base) var(--ease-out);
}

.nav-list a:hover::after,
.nav-list a:focus-visible::after {
  transform: scaleX(1);
}
```

### Línea por línea

- `position: relative` en el enlace: convierte al enlace en el punto de referencia de la línea.
- `padding-bottom: .25rem`: deja un pequeño espacio para que la línea no toque las letras.
- `content: ''`: crea el pseudoelemento. Sin esta línea, `::after` no existe.
- `left: 0; bottom: 0`: pegado a la esquina inferior izquierda del enlace.
- `width: 100%; height: 2px`: la línea mide todo el ancho del enlace y 2 px de alto. Esa es su forma **final**. Lo que cambia no es el ancho, sino la escala.
- `transform: scaleX(0)`: al inicio, encogida a cero. Invisible.
- `transform-origin: left`: cuando crezca, que lo haga desde la izquierda.
- `transition: transform ...`: cualquier cambio de `transform` será suave.
- `.nav-list a:hover::after`: "el `::after` de un enlace que tiene el cursor encima". Ahí la escala pasa a 1 y la línea aparece creciendo.

### La versión de la slide y por qué la cambiamos

La presentación hace lo mismo con `width: 0` que pasa a `width: 100%`. Funciona y se ve igual. La diferencia es lo que le cuesta al navegador: cambiar `width` obliga a recalcular el layout en cada fotograma; cambiar `transform` no. En un menú de tres enlaces no se nota, pero es el hábito que queremos formar: **para mover o cambiar de tamaño, `transform`; nunca `width`, `height`, `top` ni `left`.**

### Pruébalo

1. Pasa el cursor por los enlaces del menú. La línea crece desde la izquierda.
2. En DevTools, selecciona un enlace, busca la regla `::after` y cambia `transform-origin: left` por `center`. Ahora crece desde el medio. Prueba `right`.
3. Si quieres ver la diferencia de rendimiento: en DevTools › Performance, pulsa grabar, pasa el cursor varias veces por el menú, detén la grabación. Con `transform` no aparecen bloques morados de "Layout". Cambia a la versión con `width` y repite: aparecen.

### Cuidado con...

- Olvidar `position: relative` en el enlace. La línea se posiciona respecto al `body` y aparece en la esquina inferior izquierda de toda la página.
- Olvidar `content: ''`. El pseudoelemento no se dibuja y no hay ningún error que lo avise.

---

## Paso 5 · Tarjetas que reaccionan — slides 14, 20 y 23

### ¿Qué vamos a lograr?

Al pasar el cursor sobre una tarjeta de evento: la tarjeta se eleva y su sombra se hace más profunda, la foto hace un zoom suave y se aclara un poco, y desde abajo de la foto sube una etiqueta que dice "Ver detalles".

### Conceptos nuevos

**El hover del padre cambia a los hijos.** No hace falta pasar el cursor exactamente sobre la foto. El selector `.card:hover .card-image` significa "la imagen que está dentro de una tarjeta con el cursor encima". Así una sola acción del usuario dispara varios cambios coordinados.

**`overflow: hidden`.** Recorta todo lo que se salga del elemento. Si la foto crece con el zoom, la parte que sobresale queda oculta y la tarjeta mantiene su forma.

**`transform: scale()`.** Agranda o encoge. `scale(1.08)` es un 8% más grande.

**`filter`.** Efectos de imagen que el navegador aplica en tiempo real, como los de una app de fotos: `brightness()` (brillo), `contrast()`, `grayscale()` (blanco y negro), `blur()` (desenfoque), `sepia()`. Se pueden animar y se ejecutan en la GPU.

**`translateY(100%)`.** Cuando el valor es un porcentaje, se refiere al tamaño del propio elemento. `translateY(100%)` mueve la etiqueta hacia abajo exactamente su propia altura: queda justo fuera de la zona visible, escondida por el `overflow: hidden`.

### Dónde va el código

Dos archivos. Primero `index.html`: en cada una de las seis tarjetas, la imagen se envuelve en un `div` y se añade la etiqueta.

```html
<div class="card-media">
    <img class="card-image" src="img/jazz.jpg" alt="Fila de saxofonistas tocando en un concierto">
    <span class="card-tag">Ver detalles</span>
</div>
```

(Cambia `src` y `alt` según la imagen de cada tarjeta.)

Luego `styles.css`: añadir dos propiedades a `.card`, y reemplazar `.card-image` por todo este bloque.

### El código

```css
.card {
  /* ...propiedades existentes... */
  transition:
    transform var(--duration-base) var(--ease-out),
    box-shadow var(--duration-base) ease;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.35);
}

.card-media {
  position: relative;
  overflow: hidden;
}

.card-image {
  display: block;
  width: 100%;
  object-fit: cover;
  aspect-ratio: 16 / 10;
  transition:
    transform var(--duration-slow) ease,
    filter var(--duration-slow) ease;
}

.card:hover .card-image {
  transform: scale(1.08);
  filter: brightness(1.1) contrast(1.05);
}

.card-tag {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: .5rem 1rem;
  background-color: rgba(0, 0, 0, 0.7);
  color: var(--white-color);
  font-size: .875rem;
  transform: translateY(100%);
  transition: transform var(--duration-base) var(--ease-out);
}

.card:hover .card-tag {
  transform: translateY(0);
}
```

### Línea por línea

**La tarjeta:**
- `transition: transform ..., box-shadow ...`: lo que va a cambiar en el hover, declarado en el estado normal.
- `.card:hover { transform: translateY(-5px); box-shadow: ... }`: se eleva 5 px y la sombra se alarga hacia abajo (10 px) y se difumina más (20 px). Elevación + sombra más larga es lo que el ojo lee como "está más cerca de mí".

**El contenedor de la foto:**
- `position: relative`: para que la etiqueta absoluta se coloque respecto a este contenedor.
- `overflow: hidden`: recorta el zoom de la foto y esconde la etiqueta cuando está "debajo".

**La foto:**
- `display: block`: las imágenes son "en línea" por defecto, como texto, y dejan un hueco de unos píxeles debajo. Como bloque, el hueco desaparece.
- `transition: transform 500ms, filter 500ms`: el zoom es lento a propósito; un zoom rápido marea.
- `.card:hover .card-image { transform: scale(1.08); filter: brightness(1.1) contrast(1.05); }`: 8% más grande, 10% más brillante, 5% más contraste. Cambios pequeños: si se notan demasiado, cansan.

**La etiqueta:**
- `position: absolute; left: 0; right: 0; bottom: 0`: pegada al borde inferior, ocupando todo el ancho.
- `transform: translateY(100%)`: escondida justo debajo del borde.
- `.card:hover .card-tag { transform: translateY(0); }`: al hover, vuelve a su sitio: sube.

### Pruébalo

1. Pasa el cursor por una tarjeta. Observa las tres cosas a la vez: elevación, zoom y etiqueta.
2. En DevTools, quita `overflow: hidden` de `.card-media`. Pasa el cursor: la foto se desborda por fuera de la tarjeta y la etiqueta se ve siempre. Vuelve a ponerlo.
3. En `.card:hover .card-image`, cambia el `filter` por `grayscale(100%)` (blanco y negro), luego `sepia(70%)`, luego `hue-rotate(180deg)` (cambia todos los colores). Son los mismos filtros de Instagram.

### Cuidado con...

- Poner la `transition` en `.card:hover .card-image` en vez de en `.card-image`. El zoom entra suave pero, al quitar el cursor, la foto vuelve de golpe.
- Olvidar `display: block` en la imagen. Queda un hueco de 3 o 4 píxeles debajo de la foto que nadie sabe de dónde sale.

---

## Paso 6 · Las tarjetas entran una por una — slides 16, 17 y 19

### ¿Qué vamos a lograr?

Al cargar la página, las seis tarjetas no aparecen de golpe. Cada una sube y se hace visible 0,1 segundos después de la anterior.

### Conceptos nuevos

**`transition` vs `animation`.** Una transición necesita que **algo cambie** (un hover, un clic) y va de A a B. Una animación puede empezar sola (por ejemplo, al cargar la página) y puede tener todos los pasos intermedios que quieras. Aquí no hay ningún hover: la página carga y las tarjetas se mueven. Por eso necesitamos una animación.

**`@keyframes`.** Es donde describes los pasos de la animación, como los fotogramas clave de un dibujo animado. Le pones un nombre y dices cómo se ve el elemento al inicio (`from` o `0%`), al final (`to` o `100%`) y, si quieres, en puntos intermedios (`50%`).

**`animation`.** La propiedad que aplica un `@keyframes` a un elemento. Son **dos pasos**: primero declaras la receta con `@keyframes`, luego la usas con `animation`. Si haces solo el primero, no pasa nada.

**`animation-delay`.** Cuánto espera antes de empezar. Dándole a cada tarjeta un retraso distinto conseguimos el efecto escalonado.

**`animation-fill-mode: both`.** Qué se ve **antes** de que empiece la animación y **después** de que termine. Con `both`, el elemento toma el aspecto del primer fotograma mientras espera su turno, y se queda con el del último al acabar. Sin esto, una tarjeta con retraso se vería normal, luego desaparecería y luego aparecería: un parpadeo.

**`:nth-child(n)`.** Selecciona al hijo número n de su padre. `.card:nth-child(3)` es la tercera tarjeta.

### Dónde va el código

`styles.css`. El `@keyframes` va al final del archivo. La propiedad `animation` y los retrasos van junto a la regla `.card`.

### El código

Al final del archivo:

```css
@keyframes fade-up {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: none; }
}
```

Junto a `.card`:

```css
.card {
  /* ...propiedades existentes... */
  animation: fade-up .6s var(--ease-out) both;
}

.card:nth-child(1) { animation-delay: .1s; }
.card:nth-child(2) { animation-delay: .2s; }
.card:nth-child(3) { animation-delay: .3s; }
.card:nth-child(4) { animation-delay: .4s; }
.card:nth-child(5) { animation-delay: .5s; }
.card:nth-child(6) { animation-delay: .6s; }
```

### Línea por línea

- `@keyframes fade-up { ... }`: declaramos una animación llamada `fade-up` ("aparecer subiendo").
- `from { opacity: 0; transform: translateY(20px); }`: al inicio, invisible y 20 px más abajo de su sitio.
- `to { opacity: 1; transform: none; }`: al final, visible y en su sitio.
- `animation: fade-up .6s var(--ease-out) both`: la forma abreviada. En orden: nombre, duración (0,6 s), curva y fill-mode. Equivale a escribir `animation-name`, `animation-duration`, `animation-timing-function` y `animation-fill-mode` por separado.
- `.card:nth-child(1) { animation-delay: .1s; }`: la primera tarjeta espera 0,1 s; la segunda 0,2 s... Cada una empieza 0,1 s después de la anterior.

### Pruébalo

1. Recarga la página (Cmd+R o F5). Las tarjetas aparecen en cascada.
2. Abre DevTools › Animations, pon la velocidad al 25% y recarga. Verás cada tarjeta como una barra en una línea de tiempo, cada una empezando un poco después.
3. Cambia `both` por `none` en `animation` y recarga. Las tarjetas se ven un instante, desaparecen y vuelven a aparecer. Ese parpadeo es lo que `both` evita.
4. Cambia `.6s` por `2s` para ver el movimiento en cámara lenta sin DevTools.

### Cuidado con...

- Escribir el `@keyframes` y olvidar la línea `animation` en `.card`. No pasa nada y la consola no avisa. Es el error más común de toda la clase.
- En la forma abreviada, si pones dos tiempos, el **primero** siempre es la duración y el **segundo** el retraso. `animation: fade-up .6s .2s` dura 0,6 s y espera 0,2 s. Si los inviertes, la animación dura 0,2 s.

---

## Paso 7 · La tarjeta que gira en 3D — slides 18 y 22

### ¿Qué vamos a lograr?

En la columna izquierda, bajo "Eventos destacados", una tarjeta con la foto del concierto de jazz. Al pasar el cursor, gira sobre su eje vertical como una carta y muestra por detrás la fecha, el lugar y un botón "Comprar" que pulsa suavemente.

### Conceptos nuevos

**Las tres piezas del 3D en CSS.** Imagina una carta de baraja sobre una mesa:

1. **`perspective`** va en el **escenario** (el padre). Define desde qué distancia miras. Un valor pequeño (300px) es como mirar desde muy cerca: el efecto se exagera. Uno grande (1000px) es más natural.
2. **`transform-style: preserve-3d`** va en el **elemento que gira**. Le dice "tus hijos viven en 3D, no los aplanes". Sin esto, las dos caras se pintan como una sola.
3. **`backface-visibility: hidden`** va en **cada cara**. Significa "si estás de espaldas, no te muestres". Así, al girar, la cara delantera desaparece y la trasera aparece.

**La cara trasera nace girada.** La cara de atrás se declara con `transform: rotateY(180deg)` desde el principio. Está de espaldas y, por `backface-visibility`, no se ve. Cuando el contenedor gira 180°, la cara delantera queda de espaldas (desaparece) y la trasera queda de frente (aparece).

**`:focus-within`.** Se activa cuando el elemento **o cualquiera de sus hijos** tiene el foco. Lo usamos para que la tarjeta también gire con el teclado y en pantallas táctiles, donde no existe el hover.

**`tabindex="0"`.** Un atributo HTML que hace que un elemento que normalmente no se puede seleccionar con Tab (como un `div`) sí se pueda.

**`aspect-ratio`.** Proporción entre ancho y alto. `3 / 4` significa "más alto que ancho, como una foto vertical". El alto se calcula solo a partir del ancho.

**`inset: 0`.** Atajo para `top: 0; right: 0; bottom: 0; left: 0`. Con `position: absolute`, hace que el elemento ocupe todo el espacio de su padre.

**`will-change`.** Un aviso al navegador: "este elemento va a animarse, prepárate". Reserva memoria en la GPU. Es útil en uno o dos elementos concretos y perjudicial si se pone en muchos.

### Dónde va el código

`index.html`: dentro de `<aside class="aside aside--featured">`, después del `<h2>`.

```html
<div class="flip-card" tabindex="0" aria-label="Evento destacado: Concierto de jazz. Pasa el cursor o enfoca para ver detalles">
    <div class="flip-card-inner">
        <div class="flip-card-face flip-card-front">
            <img class="flip-card-image" src="img/jazz.jpg" alt="">
            <h3>Concierto de jazz</h3>
        </div>
        <div class="flip-card-face flip-card-back">
            <h3>Concierto de jazz</h3>
            <p>Viernes 2 de octubre, 8 pm</p>
            <p>Teatro Colón</p>
            <button class="btn btn--accent btn--pulse">Comprar</button>
        </div>
    </div>
</div>
```

Tres niveles: el escenario (`.flip-card`), el elemento que gira (`.flip-card-inner`) y las dos caras.

`styles.css`: al final del archivo.

### El código

```css
@keyframes pulso {
  0%   { transform: scale(1);    box-shadow: 0 0 0 0    rgba(79, 140, 255, 0.7); }
  70%  { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(79, 140, 255, 0); }
  100% { transform: scale(1);    box-shadow: 0 0 0 0    rgba(79, 140, 255, 0); }
}

.btn--pulse { animation: pulso 2s infinite; }

.flip-card {
  perspective: 1000px;
  aspect-ratio: 3 / 4;
  margin-top: 1rem;
  cursor: pointer;
  border-radius: 4px;
}

.flip-card:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 4px;
}

.flip-card-inner {
  position: relative;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform .8s var(--ease-in-out);
  will-change: transform;
}

.flip-card:hover .flip-card-inner,
.flip-card:focus-within .flip-card-inner {
  transform: rotateY(180deg);
}

.flip-card-face {
  position: absolute;
  inset: 0;
  display: grid;
  align-content: end;
  gap: .5rem;
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  overflow: hidden;
  backface-visibility: hidden;
}

.flip-card-front { background-color: var(--secondary-color); }

.flip-card-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: .6;
}

.flip-card-front h3 { position: relative; }

.flip-card-back {
  background-color: var(--secondary-color);
  transform: rotateY(180deg);
}
```

### Línea por línea

**El pulso:**
- `@keyframes pulso`: tres pasos. Al 0% el botón está normal con un anillo azul pegado (`0 0 0 0`, tamaño cero pero opaco al 70%). Al 70% el botón creció un 5% y el anillo mide 10 px pero es transparente (`0` de opacidad). Al 100% todo vuelve al inicio. El resultado: un halo que nace pegado al botón, crece y se desvanece.
- `.btn--pulse { animation: pulso 2s infinite; }`: la animación dura 2 s y se repite sin parar (`infinite`). Solo la usamos en **un** botón de toda la página. Si todo pulsa, nada llama la atención.

**El escenario:**
- `perspective: 1000px`: la distancia del ojo. Va en el padre, no en el que gira.
- `aspect-ratio: 3 / 4`: le da altura a la tarjeta según su ancho.
- `cursor: pointer`: la manita, para indicar que es interactiva.

**El que gira:**
- `position: relative; height: 100%`: ocupa todo el escenario y sirve de referencia para las caras absolutas.
- `transform-style: preserve-3d`: mantiene a las caras en 3D.
- `transition: transform .8s var(--ease-in-out)`: el giro dura 0,8 s. Es más lento que otras animaciones porque un giro completo necesita tiempo para entenderse.
- `.flip-card:hover .flip-card-inner, .flip-card:focus-within .flip-card-inner { transform: rotateY(180deg); }`: con cursor encima **o** con foco dentro, gira media vuelta sobre el eje vertical.

**Las caras:**
- `position: absolute; inset: 0`: las dos caras ocupan exactamente el mismo espacio, una encima de otra.
- `display: grid; align-content: end`: el contenido de cada cara se apila abajo.
- `backface-visibility: hidden`: la cara que está de espaldas no se ve.
- `.flip-card-back { transform: rotateY(180deg); }`: la trasera nace girada.

**La foto de la cara delantera:**
- `position: absolute; inset: 0; object-fit: cover`: llena toda la cara sin deformarse.
- `opacity: .6`: se atenúa para que el título se lea encima.
- `.flip-card-front h3 { position: relative; }`: un truco para que el título se pinte **encima** de la foto absoluta. Los elementos posicionados se dibujan después de los normales.

### Pruébalo

1. Pasa el cursor por la tarjeta del aside. Gira y muestra la fecha, el lugar y el botón pulsando.
2. Haz clic en una zona vacía y pulsa Tab hasta llegar a la tarjeta (verás el contorno azul). También gira. Así funciona en celular: al tocarla recibe el foco.
3. En DevTools, cambia `perspective: 1000px` por `300px`. El giro se ve mucho más exagerado, como visto desde muy cerca.
4. Quita `backface-visibility: hidden` de `.flip-card-face`. Al girar, las dos caras se ven superpuestas y una con el texto en espejo. Es lo que esa propiedad evita.
5. Quita `transform-style: preserve-3d`. La cara trasera desaparece del todo: las caras se aplanaron.

### Cuidado con...

- Poner `perspective` en `.flip-card-inner` en lugar del padre. El giro se ve plano, como si la tarjeta se encogiera en vez de girar.
- Olvidar `transform: rotateY(180deg)` en la cara trasera. Al girar, la trasera aparece con el texto al revés.
- Poner `will-change` en muchos elementos o en `*`. Reserva memoria de la GPU para toda la página y puede volverla más lenta, justo lo contrario de lo que se busca. Solo en el elemento que sabemos que va a girar.

---

## Paso 8 · Variables que se animan — slide 24

### ¿Qué vamos a lograr?

Las cajas grises de la sección "Grid" crecen un 5% y giran 2 grados al pasar el cursor. La novedad no es el efecto sino **cómo** lo escribimos.

### Conceptos nuevos

**Variables como controles.** En vez de escribir el `transform` completo dos veces (una en el estado normal, otra en el hover), lo escribimos **una** vez usando variables, y en el hover cambiamos solo las variables. Es como tener perillas: el `transform` lee las perillas; el hover las gira.

**Las variables se pueden definir en cualquier selector,** no solo en `:root`. Si se definen en `.box`, solo existen dentro de las cajas. Y una variable definida en `.box` gana a una del mismo nombre definida en `:root`, porque está "más cerca" del elemento.

### Dónde va el código

`styles.css`, en la regla `.box`.

### El código

```css
.box {
  --escala: 1;
  --rotacion: 0deg;
  /* ...propiedades existentes... */
  transform: scale(var(--escala)) rotate(var(--rotacion));
  transition: transform var(--duration-base) var(--ease-out);
}

.box:hover {
  --escala: 1.05;
  --rotacion: 2deg;
}
```

### Línea por línea

- `--escala: 1; --rotacion: 0deg`: los valores "en reposo": tamaño normal, sin giro.
- `transform: scale(var(--escala)) rotate(var(--rotacion))`: el `transform` lee las dos variables. Dos transformaciones en una sola línea: se aplican de derecha a izquierda (primero rota, luego escala).
- `transition: transform ...`: cuando `transform` cambie, que sea suave.
- `.box:hover { --escala: 1.05; --rotacion: 2deg; }`: el hover no toca el `transform`, solo cambia las variables. Como el `transform` depende de ellas, cambia también, y la transición lo suaviza.

### Pruébalo

1. Pasa el cursor por las cajas de la sección Grid.
2. Abre la consola de DevTools (pestaña Console) y escribe:

```js
document.documentElement.style.setProperty('--escala', '1.3');
```

No pasa nada. Esa línea cambia `--escala` en la raíz del documento, pero cada `.box` tiene su propia `--escala` que gana. Ahora escribe:

```js
document.querySelector('.box').style.setProperty('--escala', '1.3');
```

La primera caja crece con transición. Cambiar una variable desde JavaScript es la forma más limpia de conectar código con animación: el JS no sabe nada de `transform`, solo mueve una perilla.

### Cuidado con...

- Escribir `--rotacion: 0` sin `deg`. Para `rotate()` el cero necesita unidad; sin ella, el `transform` entero se ignora y la caja no se mueve.

---

## Paso 9 · Las secciones aparecen al hacer scroll — slide 25

### ¿Qué vamos a lograr?

Las secciones "Acerca de nosotros", "Contacto", "Grid" y el footer están invisibles al cargar. Cuando haces scroll y cada una entra en pantalla, sube suavemente y aparece.

### Conceptos nuevos

**CSS define los estados, JavaScript decide cuándo.** Aquí sí necesitamos JavaScript, porque CSS no sabe "cuándo un elemento entra en pantalla". Pero el JavaScript hace una sola cosa: añadir una clase. El CSS tiene los dos estados (sin la clase: invisible; con la clase: visible) y la transición entre ellos.

**Intersection Observer.** Una herramienta del navegador que "vigila" elementos y te avisa cuando entran o salen del viewport. Es mucho más eficiente que preguntar en cada scroll "¿ya se ve? ¿ya se ve?".

**Progressive enhancement (mejora progresiva).** La página debe funcionar aunque el JavaScript falle o esté desactivado. Si escribimos `.reveal { opacity: 0 }` a secas y el script no carga, media página queda invisible para siempre. La solución: el script añade la clase `js` al `<html>` y el CSS solo esconde cosas **si esa clase existe**. Sin JS, no se esconde nada.

### Dónde va el código

`index.html`: añadir `class="reveal"` a la sección `#aboutus`, a `#contact`, a la sección "Grid" y al `<footer>`. Si el elemento ya tiene clase, se añade separada por espacio: `class="footer reveal"`.

`styles.css`: al final del archivo.

`script.js`: reemplazar todo el contenido.

### El código

CSS:

```css
.js .reveal {
  opacity: 0;
  transform: translateY(30px);
  transition:
    opacity .6s ease,
    transform .6s var(--ease-out);
}

.js .reveal.is-visible {
  opacity: 1;
  transform: none;
}
```

JavaScript:

```js
document.documentElement.classList.add('js');

const elementos = document.querySelectorAll('.reveal');
const reducirMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!('IntersectionObserver' in window) || reducirMovimiento) {
  elementos.forEach((el) => el.classList.add('is-visible'));
} else {
  const observador = new IntersectionObserver(
    (entradas, obs) => {
      entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
          entrada.target.classList.add('is-visible');
          obs.unobserve(entrada.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  elementos.forEach((el) => observador.observe(el));
}
```

### Línea por línea

**CSS:**
- `.js .reveal`: "un elemento con clase `reveal` dentro de algo con clase `js`". Como `js` va en el `<html>`, todo está dentro. Estado inicial: invisible y 30 px abajo.
- `.js .reveal.is-visible`: cuando además tiene `is-visible`, visible y en su sitio. La transición de 0,6 s hace el cambio suave.

**JavaScript:**
- `document.documentElement.classList.add('js')`: `documentElement` es la etiqueta `<html>`. Le añadimos la clase `js`. Es la primera línea a propósito: si el script llega hasta aquí, sabemos que JS funciona.
- `const elementos = document.querySelectorAll('.reveal')`: guardamos todos los elementos con clase `reveal`.
- `window.matchMedia('(prefers-reduced-motion: reduce)').matches`: pregunta al navegador si el usuario pidió menos movimiento. Devuelve `true` o `false`.
- `if (!('IntersectionObserver' in window) || reducirMovimiento)`: si el navegador es muy antiguo y no tiene Intersection Observer, **o** si el usuario pidió menos movimiento, no animamos nada: añadimos `is-visible` a todo de una vez.
- `new IntersectionObserver(función, opciones)`: creamos el vigilante. La función se ejecuta cada vez que algún elemento vigilado entra o sale de pantalla.
- `entrada.isIntersecting`: `true` cuando el elemento está entrando en pantalla.
- `entrada.target.classList.add('is-visible')`: le ponemos la clase al elemento que entró. El CSS hace el resto.
- `obs.unobserve(entrada.target)`: dejamos de vigilarlo. La animación de entrada solo debe ocurrir una vez.
- `{ threshold: 0.15 }`: avisar cuando al menos el 15% del elemento sea visible, no con el primer píxel.
- `elementos.forEach((el) => observador.observe(el))`: le decimos al vigilante qué elementos vigilar.

### Pruébalo

1. Recarga y haz scroll despacio. Cada sección sube y aparece al entrar.
2. En DevTools › Elements, mira la etiqueta `<html>`: tiene `class="js"`. Haz scroll y mira una sección `reveal`: cuando entra, le aparece `is-visible`.
3. Desactiva JavaScript: en DevTools, Cmd+Shift+P (o Ctrl+Shift+P), escribe "Disable JavaScript", Enter. Recarga. Todo se ve, sin animación. Ese es el punto del prefijo `.js`. Vuelve a activarlo con "Enable JavaScript".

### Cuidado con...

- Escribir `.reveal { opacity: 0 }` sin el `.js` delante. Si el script falla por cualquier motivo, media página queda invisible.
- Olvidar `obs.unobserve(...)`. La animación se repite cada vez que la sección entra y sale de pantalla, y se vuelve molesta.

---

## Paso 10 · Respetar a quien no quiere movimiento — slides 27 y 28

### ¿Qué vamos a lograr?

Si el usuario activó "Reducir movimiento" en su sistema operativo, todas las animaciones y transiciones de la página se desactivan y todo el contenido se muestra directamente.

### Conceptos nuevos

**¿Por qué existe esto?** Hay personas con trastornos vestibulares (del equilibrio) a las que el movimiento en pantalla les causa mareo o náuseas reales. Otras simplemente lo encuentran molesto. Los sistemas operativos tienen un interruptor para pedir a las aplicaciones que reduzcan el movimiento. Respetarlo no es opcional: es parte de hacer una web para todos.

**`@media (prefers-reduced-motion: reduce)`.** Una media query, como las que usamos para tamaños de pantalla, pero que pregunta por esa preferencia. Todo lo que va dentro solo se aplica si el usuario la activó.

**`!important`.** Fuerza que una regla gane sobre cualquier otra. Normalmente hay que evitarlo, pero aquí es exactamente lo que queremos: que gane sobre **todas** las animaciones de la página, sin excepciones.

**¿Por qué `0.01ms` y no `0`?** Algunos scripts esperan a que una animación termine (el evento `animationend`). Con duración `0`, el navegador puede no disparar ese evento y el script se queda esperando. Con `0.01ms` la animación es imperceptible pero "ocurre".

### Dónde va el código

`styles.css`, como último bloque del archivo. Al final para que gane a todo lo anterior.

### El código

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
  }

  .js .reveal {
    opacity: 1;
    transform: none;
  }
}
```

### Línea por línea

- `*, *::before, *::after`: todos los elementos y todos sus pseudoelementos. Es de las pocas veces que el selector universal `*` está justificado.
- `animation-duration: .01ms !important`: toda animación termina al instante.
- `animation-iteration-count: 1 !important`: las que se repetían infinitamente (el pulso) se ejecutan una sola vez.
- `transition-duration: .01ms !important`: toda transición es instantánea. Los estados siguen existiendo (el botón sigue elevándose en hover), solo que sin el "viaje".
- `.js .reveal { opacity: 1; transform: none; }`: las secciones del paso 9 se muestran directamente. Aunque el JavaScript ya lo contempla, lo cubrimos también en CSS por si el script tarda en cargar.

### Pruébalo

1. Activa "Reducir movimiento" en tu sistema (ver "Antes de empezar"). O en DevTools: tres puntos › More tools › Rendering › busca "Emulate CSS media feature prefers-reduced-motion" y elige `reduce`.
2. Recarga. Las tarjetas aparecen todas a la vez, el botón no pulsa, la tarjeta 3D cambia de cara al instante y las secciones ya están visibles.
3. Usa la página normalmente. Todo funciona igual; solo falta el movimiento. Ese es el objetivo.
4. Desactívalo al terminar.

---

## Paso 11 (extra) · Degradados en la barra de navegación

### ¿Qué vamos a lograr?

El header deja de ser negro plano: tiene un fondo que va del azul oscuro al negro, una línea fina degradada en el borde inferior y el título "Cartelera de eventos" pintado con un degradado de blanco a azul.

### Conceptos nuevos

**Un degradado no es un color, es una imagen.** Esta es la idea que lo explica todo. Cuando escribes `linear-gradient(...)`, el navegador **genera una imagen** al vuelo. Por eso:

- Va en `background-image`, no en `background-color`.
- Pesa cero bytes (no hay archivo) y se ve nítido a cualquier tamaño.
- Puede usar las variables de color del proyecto.
- Hace 15 años esto se hacía con imágenes PNG cortadas a mano. Los degradados CSS las reemplazaron.

**Anatomía de `linear-gradient(135deg, #063E5F 0%, #0f1117 55%)`:**

- `135deg`: la dirección. Piensa en un reloj: `0deg` va de abajo hacia arriba, `90deg` de izquierda a derecha, `180deg` de arriba hacia abajo. `135deg` va de la esquina superior izquierda a la inferior derecha. También se puede escribir con palabras: `to right`, `to bottom left`.
- `#063E5F 0%`: la primera **parada de color**. Al 0% del recorrido, el color es exactamente ese.
- `#0f1117 55%`: la segunda parada. Al 55% del recorrido, el color es exactamente ese. Entre las dos paradas el navegador mezcla; después del 55% el color se mantiene hasta el final.

**Tres tipos de degradado.** `linear-gradient` (en una dirección), `radial-gradient` (desde un centro hacia afuera, como una linterna) y `conic-gradient` (girando alrededor de un centro, como un gráfico de torta). Hoy usamos solo el primero.

**`background-clip: text`.** Normalmente el fondo de un elemento se pinta en toda su caja. Con `background-clip: text`, se pinta **solo donde hay letras**. Si además el color del texto es transparente, el fondo se ve a través de las letras. Así se consigue "texto degradado".

### Dónde va el código

`styles.css`: dos propiedades en `.header` y dos reglas nuevas debajo.

### El código

```css
.header {
  /* ...propiedades existentes... */
  background-color: var(--background-color);   /* respaldo si el gradiente falla */
  background-image: linear-gradient(
    135deg,
    var(--secondary-color) 0%,
    var(--background-color) 55%
  );
}

/* Línea inferior degradada. Los bordes solo aceptan colores planos,
   por eso se usa un pseudoelemento posicionado. */
.header::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 2px;
  background-image: linear-gradient(
    90deg,
    var(--accent-color),
    var(--primary-color) 40%,
    transparent
  );
}

/* Texto con gradiente */
.header h1 {
  background-image: linear-gradient(90deg, var(--white-color), var(--accent-color));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
```

### Línea por línea

**El fondo del header:**
- `background-color: var(--background-color)`: un color plano de respaldo. Si el degradado falla o tarda, el header no queda transparente.
- `background-image: linear-gradient(135deg, azul-oscuro 0%, negro 55%)`: el degradado. Desde la esquina superior izquierda, azul oscuro que se funde en negro a poco más de la mitad.

**La línea inferior:**
- Un `::after` posicionado en el borde inferior, de 2 px de alto. Se usa un pseudoelemento porque `border-bottom` solo acepta colores planos, no degradados.
- `linear-gradient(90deg, acento, primario 40%, transparent)`: de izquierda a derecha: azul claro, azul medio al 40%, y se desvanece hasta transparente. Sin porcentaje, las paradas se reparten solas.

**El título:**
- `background-image: linear-gradient(90deg, blanco, azul)`: el degradado que queremos ver en las letras.
- `-webkit-background-clip: text; background-clip: text`: recorta el fondo a la forma de las letras. La versión con `-webkit-` es para Safari y navegadores antiguos; la moderna, para el resto. Se ponen las dos.
- `color: transparent`: el color del texto se vuelve invisible para que se vea el fondo a través de él.

### Pruébalo

1. En DevTools, selecciona `.header` y cambia `135deg` por `90deg`, luego por `to bottom`. Mira cómo gira la dirección.
2. Cambia el `55%` por `100%`: el cambio de color es largo y suave. Cámbialo por `20%`: casi un corte.
3. Pon dos paradas en el mismo porcentaje: `linear-gradient(90deg, red 50%, blue 50%)`. No hay mezcla: mitad roja, mitad azul, con un borde nítido. Así se hacen rayas y patrones sin imágenes.
4. En `.header h1`, desactiva `color: transparent`. El degradado desaparece detrás del texto blanco. `background-clip` recorta el fondo, pero el color del texto sigue tapándolo.

### Un límite importante

**Los degradados no se pueden animar con `transition`.** Si pones `transition: background-image` y cambias el degradado en hover, cambia de golpe. El navegador sabe mezclar dos colores, pero no dos imágenes. En el paso 13 veremos el truco para conseguir el efecto de todas formas.

### Cuidado con...

- Escribir el degradado en `background-color`. No es un color: el navegador lo ignora en silencio.
- Olvidar el `background-color` de respaldo. Si el degradado falla, el header queda transparente y al hacer scroll el contenido se ve a través de él.
- Texto degradado con poco contraste. Cada extremo del degradado debe leerse bien sobre el fondo por sí solo. Aquí van de blanco a azul claro sobre negro: los dos se leen.

---

## Paso 12 (extra) · Banner de bienvenida con imagen de fondo

Este paso se construye por capas. Cada subpaso deja la página en un estado que puedes mirar antes de seguir, para ver qué aporta cada propiedad.

### ¿Qué vamos a lograr?

Entre el header y las tarjetas, una franja ancha con una foto de un concierto de fondo, un título grande "Bienvenido a la cartelera", una frase y un botón "Ver eventos". El texto se lee perfectamente aunque la foto tenga zonas claras, y aparece con la misma animación de entrada de las tarjetas.

### Conceptos nuevos

**Hero.** Así se llama en diseño web a esa primera franja grande de una página, la "primera impresión". Casi siempre tiene una imagen, un mensaje corto y una única acción.

**Fondos múltiples.** `background-image` acepta **varias** imágenes separadas por coma. Se apilan: la primera queda encima, la última al fondo. Como un degradado es una imagen (paso 11), podemos poner un degradado semitransparente **encima** de una foto en una sola línea.

**`background-size: cover`.** La imagen se agranda o encoge hasta **cubrir** toda la caja sin deformarse. Lo que sobra se recorta. Es como cuando pones una foto de fondo de pantalla en "rellenar".

**`background-position: center`.** Cuando `cover` recorta, decide qué parte se conserva. `center` conserva el centro.

**`clamp(mínimo, preferido, máximo)`.** Una función para tamaños que se adaptan solos. `clamp(2rem, 4vw, 3rem)` dice: "mide el 4% del ancho de la ventana, pero nunca menos de 2rem ni más de 3rem". Reemplaza a varias media queries.

**`vw` y `vh`.** Unidades relativas al viewport. `1vw` es el 1% del ancho de la ventana; `1vh`, el 1% del alto. `45vh` es casi la mitad de la altura de la pantalla.

### 12.1 · Preparar la imagen

Antes de escribir CSS hay que elegir la foto. Criterios:

- **Horizontal y ancha.** El banner es mucho más ancho que alto. Una foto vertical se recortaría casi entera con `cover`.
- **Una zona "tranquila" para el texto.** El mensaje va a la izquierda, así que conviene que la izquierda de la foto sea oscura o tenga poco detalle. En la foto elegida (una banda en un escenario), el músico y las luces están en el centro y la derecha.
- **Peso razonable.** Es la imagen más grande de la página y se descarga en la primera pantalla. La pedimos a 1600×700 píxeles y pesa 79 KB. Regla práctica: menos de 150 KB para un banner. Nunca subir la foto original de una cámara (varios MB).
- **Licencia.** Como las demás, viene de picsum.photos, que sirve fotos de Unsplash con licencia de uso libre. En un proyecto real, anota siempre de dónde salió cada imagen.

Se guarda como `img/banner.jpg`, junto a las imágenes de las tarjetas.

> Ejercicio de clase: abre `img/banner.jpg` solo, en una pestaña. ¿Dónde pondrías el texto? La respuesta guía el degradado del subpaso 12.4.

### 12.2 · La estructura HTML

En `index.html`, justo después de `</header>` y antes de `<div class="layout">`:

```html
<!-- Banner de bienvenida (hero): imagen de fondo con capa de gradiente
     para garantizar contraste del texto. Ver .hero en styles.css -->
<section class="hero" aria-labelledby="hero-title">
    <div class="hero-content">
        <h2 id="hero-title">Bienvenido a la cartelera</h2>
        <p>Conciertos, festivales, talleres y encuentros en Bogotá. Encuentra tu próximo plan y compra tu entrada en un solo lugar.</p>
        <a class="btn btn--accent hero-cta" href="#events">Ver eventos</a>
    </div>
</section>
```

Por qué cada etiqueta:

- `<section>` y no `<div>`: es un bloque con sentido propio y con título. `aria-labelledby="hero-title"` conecta la sección con su título, para que un lector de pantalla anuncie "sección: Bienvenido a la cartelera".
- `<h2>` y no `<h1>`: la página ya tiene su `<h1>` en el header ("Cartelera de eventos"). Solo debe haber uno.
- `<a>` y no `<button>`: "Ver eventos" **lleva a otro lugar** de la página (`#events`). Los enlaces navegan; los botones hacen acciones (enviar, abrir, borrar). Le ponemos la clase `.btn` para que se vea como botón y herede su hover del paso 2.
- `.hero-content`: un contenedor extra para poder limitar el ancho del **texto** sin limitar el ancho del **fondo**.

**Qué se ve:** un bloque de texto plano entre el header y las tarjetas. Y el footer probablemente ya no está pegado abajo. Lo arreglamos ahora.

### 12.3 · Hacer sitio en el grid del `body`

El `body` es un grid de filas: header, layout y footer. El hero es un hijo nuevo y necesita su propia fila. En `styles.css`, en la regla `body`:

```css
body {
  grid-template-rows: auto auto 1fr auto; /* header | .hero | .layout | footer */
}
```

`auto` significa "lo que mida el contenido". `1fr` significa "todo el espacio que sobre". El layout se queda con el `1fr` para que el footer siempre quede abajo.

**Qué se ve:** casi nada cambia, pero el footer vuelve a estar abajo. Sin esta línea, el hero ocupaba la fila `1fr` y el layout caía a una fila extra.

### 12.4 · La foto de fondo y la capa de contraste

Primero **solo la foto**, para ver el problema. En `styles.css`, antes de `.layout`:

```css
.hero {
  min-height: 45vh;
  padding: 3rem max(var(--gutter), calc((100% - var(--max-width)) / 2));
  background-image: url("img/banner.jpg");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-color: var(--secondary-color);
}
```

- `min-height: 45vh`: al menos el 45% de la altura de la ventana. `min-height` y no `height`: si el texto crece, el banner crece con él.
- `padding: 3rem max(...)`: 3rem arriba y abajo. A los lados, el mismo cálculo que usan el header y el layout, así el texto arranca alineado con el resto de la página. No hace falta entender la fórmula: es "el margen lateral del sitio".
- `background-image: url("img/banner.jpg")`: la foto. La ruta es relativa al archivo CSS.
- `background-size: cover; background-position: center; background-repeat: no-repeat`: cubre, centrada, sin repetirse.
- `background-color: var(--secondary-color)`: color de respaldo mientras la foto carga.

**Qué se ve:** la foto ocupa el banner, pero el texto blanco se pierde en las zonas claras. Es ilegible en algunos puntos.

Ahora **apilamos el degradado encima** de la foto. Reemplaza la línea `background-image` por:

```css
.hero {
  background-image:
    linear-gradient(
      to right,
      rgba(15, 17, 23, 0.9) 0%,    /* izquierda: casi opaco, aquí va el texto */
      rgba(15, 17, 23, 0.6) 55%,
      rgba(15, 17, 23, 0.2) 100%   /* derecha: casi transparente, se ve la foto */
    ),
    url("img/banner.jpg");
}
```

- Dos imágenes separadas por coma: primero el degradado (queda encima), después la foto (queda debajo).
- `to right`: el degradado va de izquierda a derecha.
- Los tres `rgba(15, 17, 23, ...)` son el mismo color que el fondo de la página (`#0f1117` en decimal es 15, 17, 23) con distinta opacidad: 90% a la izquierda, 60% en el medio, 20% a la derecha. Por eso el banner se funde con el resto de la página.
- `background-size`, `position` y `repeat` se aplican a las dos capas.

**Qué se ve:** el texto se lee perfectamente en la izquierda y la foto se sigue viendo a la derecha.

### 12.5 · Centrar y limitar el texto

```css
.hero {
  display: grid;
  align-content: center;   /* centra el bloque de texto en vertical */
}

.hero-content {
  display: grid;
  gap: 1rem;
  justify-items: start;    /* el enlace no se estira a todo el ancho */
  max-width: 36rem;        /* líneas de 60-70 caracteres, cómodas de leer */
}

.hero-cta {
  text-decoration: none;   /* el <a> con .btn no debe verse subrayado */
  display: inline-block;
}
```

- `display: grid; align-content: center` en el hero: el bloque de texto queda centrado verticalmente dentro del banner.
- `max-width: 36rem` en el contenido: las líneas de texto no se alargan hasta el borde derecho. Una línea muy larga es difícil de leer.
- `justify-items: start`: sin esto, el grid estiraría el enlace hasta ocupar todo el ancho.
- `.hero-cta { text-decoration: none }`: los enlaces vienen subrayados; un botón no debe estarlo.

**Qué se ve:** texto centrado verticalmente, párrafo de ancho cómodo y el enlace con aspecto de botón.

### 12.6 · Tipografía fluida y entrada animada

```css
.hero h2 {
  font-size: clamp(2rem, 4vw, 3rem); /* escala con el viewport entre 2rem y 3rem */
  line-height: 1.1;
}

.hero p {
  font-size: 1.125rem;
}

.hero-content {
  animation: fade-up .8s var(--ease-out) both; /* la misma de las tarjetas */
}
```

- `clamp(2rem, 4vw, 3rem)`: el título mide el 4% del ancho de la ventana, entre un mínimo de 2rem y un máximo de 3rem. En un celular será 2rem; en un monitor grande, 3rem; en medio, algo proporcional. Todo sin media queries.
- `line-height: 1.1`: interlineado ajustado. Los títulos grandes se ven mejor con las líneas más juntas.
- `animation: fade-up .8s ...`: la misma animación que ya declaramos en el paso 6 para las tarjetas. Como los `@keyframes` se declaran por separado, se pueden reutilizar en cualquier elemento.

**Qué se ve:** al recargar, el texto entra subiendo. Al estrechar la ventana, el título se encoge de forma continua.

### 12.7 · Ajustes para móvil y separación con el contenido

```css
@media (max-width: 600px) {
  .hero {
    min-height: 35vh;      /* en pantallas bajas 45vh dejaba poco espacio al contenido */
    padding-top: 2rem;
    padding-bottom: 2rem;
  }
}

.layout {
  padding: 2rem var(--gutter) 0; /* separa el contenido del banner */
}
```

En un celular, un banner del 45% de la pantalla deja poco espacio para lo demás. Lo bajamos al 35%. Y le damos al layout un espacio superior de 2rem para que las tarjetas no queden pegadas al banner.

El `body` también tiene un `row-gap: 1rem` que añade una franja fina entre el header y el banner, y entre el banner y el contenido. Es una decisión de estilo: si prefieres el banner pegado al header, quita ese `row-gap` y deja la separación solo en `.layout`.

**Qué se ve:** en móvil el banner es más bajo y el contenido no queda pegado a él.

### El bloque completo

Así queda todo junto en `styles.css`, antes de `.layout`:

```css
.hero {
  display: grid;
  align-content: center;
  min-height: 45vh;
  padding: 3rem max(var(--gutter), calc((100% - var(--max-width)) / 2));
  background-image:
    linear-gradient(
      to right,
      rgba(15, 17, 23, 0.9) 0%,
      rgba(15, 17, 23, 0.6) 55%,
      rgba(15, 17, 23, 0.2) 100%
    ),
    url("img/banner.jpg");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-color: var(--secondary-color);
}

.hero-content {
  display: grid;
  gap: 1rem;
  justify-items: start;
  max-width: 36rem;
  animation: fade-up .8s var(--ease-out) both;
}

.hero h2 {
  font-size: clamp(2rem, 4vw, 3rem);
  line-height: 1.1;
}

.hero p { font-size: 1.125rem; }

.hero-cta {
  text-decoration: none;
  display: inline-block;
}

@media (max-width: 600px) {
  .hero {
    min-height: 35vh;
    padding-top: 2rem;
    padding-bottom: 2rem;
  }
}
```

### Pruébalo

1. En DevTools, desactiva la línea del `linear-gradient` (deja solo la `url`). El texto se vuelve ilegible sobre las zonas claras. Vuelve a activarlo.
2. Cambia `cover` por `contain`: la foto se ve entera pero deja huecos a los lados. Cambia por `100% 100%`: se estira y deforma. `cover` es casi siempre la respuesta.
3. Cambia `background-position: center` por `top` y luego por `bottom`. Eliges qué parte de la foto se conserva.
4. Estrecha y ensancha la ventana. El título cambia de tamaño sin saltos.
5. Recarga: el bloque de texto entra subiendo, igual que las tarjetas.
6. Haz clic en "Ver eventos". La página baja hasta la sección de eventos y el título no queda tapado por el header sticky (gracias a una regla `scroll-margin-top` que ya tienen las secciones).
7. En DevTools › Network, recarga y busca `banner.jpg`. Mira cuánto pesa y cuánto tardó. Compara con lo que pesaría una foto original de cámara.

### Cuidado con...

- Poner la `url()` **antes** del degradado. La foto quedaría encima y taparía el degradado: sin oscurecimiento.
- Usar `height: 45vh` en vez de `min-height`. Si el texto crece (celular, zoom del navegador), se sale del banner.
- Olvidar la fila nueva en `grid-template-rows` del `body`. El footer deja de estar pegado abajo.
- Poner el texto **dentro** de la imagen (una foto con el título ya escrito). No se puede traducir, no lo lee Google ni un lector de pantalla, y se pixela al agrandar.
- Un segundo `<h1>` en el hero. Rompe la jerarquía de títulos de la página.

---

## Paso 13 (extra) · El degradado del header cambia al hacer scroll

### ¿Qué vamos a lograr?

Al hacer scroll hacia abajo, el fondo del header pasa gradualmente del degradado oscuro a uno azul más vivo durante los primeros 160 píxeles. Al volver arriba, se apaga. No es un interruptor: sigue al scroll.

### Conceptos nuevos

**Cómo "animar" un degradado cuando no se puede.** En el paso 11 vimos que `transition` no sabe mezclar dos degradados. El truco: **tener los dos a la vez**. El header conserva su degradado oscuro, y un pseudoelemento `::before` que lo cubre por completo lleva el degradado azul. Lo único que animamos es la `opacity` de ese pseudoelemento: de 0 (invisible, se ve el oscuro) a 1 (tapa todo, se ve el azul). Y `opacity` es la propiedad más barata de animar.

**Animaciones dirigidas por scroll (scroll-driven animations).** Hasta ahora, una animación avanzaba con el **tiempo**: a los 0,3 s está a la mitad, a los 0,6 s termina. Con `animation-timeline: scroll()`, avanza con el **desplazamiento**: a la mitad del scroll está a la mitad, al final del scroll termina. La posición de la barra de scroll es la que "mueve el reloj". Sin eventos, sin JavaScript, y el navegador lo ejecuta en el compositor, así que nunca se traba.

**`animation-range`.** Qué tramo del scroll recorre la animación. `0 160px` significa "empieza con el scroll en 0 y termina cuando lleva 160 px". Después de 160 px se queda en el último fotograma.

**`@supports`.** Una regla que pregunta "¿este navegador entiende esta propiedad?". Lo que va dentro solo se aplica si la respuesta es sí. Nos permite usar cosas nuevas sin romper navegadores viejos.

**Soporte en 2026.** Chrome, Edge y Safari entienden `animation-timeline`. Firefox lo tiene detrás de una opción experimental. Por eso lo envolvemos en `@supports` y dejamos un respaldo en JavaScript que solo se ejecuta si hace falta.

**Contexto de apilamiento.** El header tiene `position: sticky` y `z-index: 10`, así que forma su propio "grupo" de capas. Dentro de ese grupo, un hijo con `z-index: -1` queda detrás del texto del header pero **delante** del fondo del header. Si el header no tuviera su propio grupo, el `-1` lo mandaría detrás de toda la página y no se vería.

### Dónde va el código

`styles.css`: debajo de `.header`, antes de `.header::after`. `script.js`: al final.

### El código

CSS:

```css
.header::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;            /* detrás del texto, delante del fondo del header */
  background-image: linear-gradient(
    135deg,
    var(--primary-color) 0%,
    var(--secondary-color) 45%,
    var(--background-color) 100%
  );
  opacity: 0;
  transition: opacity var(--duration-slow) ease;   /* usado solo por el respaldo */
}

@supports (animation-timeline: scroll()) {
  .header::before {
    transition: none;
    animation: header-encender linear both;
    animation-timeline: scroll(root);
    animation-range: 0 160px;
  }
}

.header.is-scrolled::before {
  opacity: 1;
}

@keyframes header-encender {
  from { opacity: 0; }
  to   { opacity: 1; }
}
```

JavaScript:

```js
const soportaScrollTimeline = CSS.supports('animation-timeline: scroll()');

if (!soportaScrollTimeline) {
  const header = document.querySelector('.header');

  const actualizarHeader = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 40);
  };

  actualizarHeader();
  window.addEventListener('scroll', actualizarHeader, { passive: true });
}
```

### Línea por línea

**La capa azul:**
- `.header::before { content: ''; position: absolute; inset: 0; }`: una capa que cubre todo el header.
- `z-index: -1`: detrás del título y el menú, delante del fondo.
- `background-image: linear-gradient(135deg, azul-medio, azul-oscuro 45%, negro)`: el degradado "encendido".
- `opacity: 0`: invisible al inicio.
- `transition: opacity 500ms`: para el respaldo en JavaScript. Si el navegador es moderno, la siguiente regla la anula.

**La animación por scroll (solo navegadores modernos):**
- `@supports (animation-timeline: scroll())`: "si entiendes esto, aplica lo de dentro".
- `transition: none`: quitamos la transición del respaldo; aquí manda el scroll.
- `animation: header-encender linear both`: la animación, sin duración (no hace falta: la duración la da el scroll), lineal (el 50% del scroll es el 50% del cambio) y `both` para mantener el estado final.
- `animation-timeline: scroll(root)`: la línea de tiempo es el scroll del documento (`root`). **Esta línea debe ir después del atajo `animation`**, porque el atajo resetea `animation-timeline`.
- `animation-range: 0 160px`: el cambio ocurre en los primeros 160 px.

**El respaldo:**
- `.header.is-scrolled::before { opacity: 1; }`: si el header tiene la clase `is-scrolled`, la capa azul se muestra (con la transición de 500 ms).
- `CSS.supports('animation-timeline: scroll()')`: la misma pregunta de `@supports`, pero desde JavaScript. Devuelve `true` o `false`.
- `if (!soportaScrollTimeline)`: solo si **no** hay soporte hacemos algo.
- `header.classList.toggle('is-scrolled', window.scrollY > 40)`: pone la clase si el scroll pasa de 40 px, la quita si no.
- `actualizarHeader()`: se llama una vez al cargar, por si la página se abre ya desplazada.
- `addEventListener('scroll', ..., { passive: true })`: en cada scroll, actualizar. `passive: true` le dice al navegador "este código no va a bloquear el scroll", y el scroll se siente más fluido.

### Pruébalo

1. Haz scroll muy despacio con la rueda o el trackpad. El header se va poniendo azul poco a poco durante los primeros 160 px. Sube despacio: se apaga poco a poco.
2. En DevTools › Elements, selecciona `.header` y despliega el `::before`. Cambia `animation-range` a `0 600px`: el cambio se estira a lo largo de más scroll. Cambia a `100px 200px`: no empieza hasta pasar 100 px.
3. Desactiva la línea `animation-timeline` dentro del `@supports`. La animación vuelve a ser "de tiempo" (con duración 0, así que salta directamente al final): el header está azul siempre. Es la prueba de que la línea de tiempo es lo que reemplaza al reloj.
4. Simula un navegador antiguo: desactiva todo el bloque `@supports` y, en Elements, añade a mano la clase `is-scrolled` al header (doble clic en `class="header"` y escribe `header is-scrolled`). La capa azul aparece con una transición de medio segundo. Ese es el respaldo.
5. Quita `z-index: -1`. La capa azul tapa el título y el menú.

### Cuidado con...

- Escribir `animation-timeline` **antes** del atajo `animation`. El atajo la resetea y la animación vuelve a depender del tiempo.
- Intentar `transition: background-image`. No da error, pero cambia de golpe.
- Olvidar `{ passive: true }` en el listener. El navegador tiene que esperar a que tu código termine antes de mover la página, y el scroll se siente pesado.

---

## Checklist de cierre

Antes de dar por terminada la clase, comprueba estos puntos. El primero se puede verificar con un comando en la terminal, dentro de la carpeta del proyecto. Debe devolver vacío:

```bash
grep -nE "transition:|animation:" styles.css | grep -E "width|height|top|left"
```

(El comando busca todas las líneas con `transition:` o `animation:` y, entre ellas, las que mencionen `width`, `height`, `top` o `left`. Si no imprime nada, ninguna animación toca esas propiedades.)

- [ ] Ninguna `transition` ni `animation` toca `width`, `height`, `top` o `left`.
- [ ] Todas las transiciones están declaradas en el estado normal, no dentro de `:hover`.
- [ ] Solo un elemento pulsa en toda la pantalla.
- [ ] `will-change` aparece una única vez, en `.flip-card-inner`.
- [ ] Con "Reducir movimiento" activado, la página se ve completa y se puede usar.
- [ ] Con JavaScript desactivado no hay contenido oculto.
- [ ] Pulsando Tab se recorren botones, campos, enlaces y la tarjeta 3D, y el foco siempre se ve.
- [ ] El header tiene `background-color` de respaldo además del degradado.
- [ ] El texto del banner se lee en todo su ancho (la capa de degradado está activa).
- [ ] El header cambia de degradado al hacer scroll y `animation-timeline` está después del atajo `animation`.

Cuando todo esté en verde:

```bash
git add .
git commit -m "feat: clase-8"
```

## Preguntas para pensar (slide 33)

1. De todas las animaciones que hicimos, si tuvieras que dejar solo tres, ¿cuáles quitarías? ¿Qué comunica cada una de las que quedan?
2. La tarjeta 3D gira con `:hover`. ¿Qué pasa en un celular, donde no hay cursor? ¿Qué resolvimos con `:focus-within` y qué falta por resolver?
3. El botón que pulsa está en el aside de "Eventos destacados". ¿Sería mejor ponerlo en el botón "Enviar" del formulario? ¿Por qué la slide 30 dice que no?
4. El paso 4 hace lo mismo que la slide pero con `transform` en vez de `width`. ¿En qué casos crees que sí valdría la pena animar `width`?

## Recursos

- [MDN · Using CSS transitions](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_transitions/Using_CSS_transitions) · la referencia oficial de transiciones
- [MDN · Using CSS animations](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animations/Using_CSS_animations) · la referencia oficial de `@keyframes`
- [MDN · Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [MDN · Using CSS gradients](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_images/Using_CSS_gradients)
- [MDN · CSS scroll-driven animations](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_scroll-driven_animations)
- [cubic-bezier.com](https://cubic-bezier.com) · dibuja curvas de aceleración y copia el código
- [cssgradient.io](https://cssgradient.io) · editor visual de degradados
- [Animista](https://animista.net) · generador de animaciones listas para copiar
- [CSS Triggers](https://csstriggers.com) · qué propiedades obligan al navegador a recalcular el layout
- [scroll-driven-animations.style](https://scroll-driven-animations.style) · demos de animaciones por scroll
