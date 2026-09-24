# Clase 8 · Animaciones y transiciones CSS en la cartelera

Guía paso a paso para reconstruir en vivo la rama `clase-8` partiendo de `clase-7`.
Cada paso indica la slide de la presentación que lo respalda, el concepto en dos líneas, el código exacto a agregar, qué mostrar en el navegador y los errores típicos de los estudiantes.

## Objetivo de la sesión

Al terminar, la cartelera tendrá movimiento con propósito y sin JavaScript salvo un caso:

| Qué se ve | Técnica | Slides |
|---|---|---|
| Botones que se elevan al pasar el cursor y bajan al hacer clic | `transition` + `:hover` / `:active` / `:focus-visible` | 7, 11 |
| Inputs con borde y halo al enfocar | `transition` en `:focus` | 7 |
| Subrayado que crece bajo los enlaces del menú | `::after` + `transform: scaleX` | 21, 9 |
| Tarjetas que se elevan, hacen zoom a la imagen y muestran una etiqueta | `transform`, `filter`, patrón "hover del padre" | 14, 20, 23 |
| Tarjetas que aparecen una tras otra al cargar | `@keyframes` + `animation-delay` | 16, 17, 19 |
| Tarjeta 3D en "Eventos destacados" que gira con botón pulsante | `perspective`, `preserve-3d`, `backface-visibility`, `@keyframes` | 18, 22 |
| Cajas de la demo Grid que escalan y rotan | variables CSS animadas | 24 |
| Secciones que aparecen al hacer scroll | Intersection Observer (único JS) | 25 |
| Todo se desactiva si el usuario prefiere menos movimiento | `prefers-reduced-motion`, `will-change` | 27, 28 |
| Header con fondo degradado, línea inferior degradada y título con gradiente en el texto | `linear-gradient`, `background-clip: text` | Extra (no está en las slides) |
| Banner de bienvenida con foto de fondo, capa de gradiente y entrada animada | fondos múltiples, `background-size: cover`, `clamp()` | Extra (no está en las slides) |
| El gradiente del header se "enciende" a medida que se hace scroll | `animation-timeline: scroll()`, `animation-range`, `@supports` | Extra (no está en las slides) |

Criterio de aceptación (slide 34): **ninguna animación usa `width`, `height`, `top` ni `left`, y todo respeta `prefers-reduced-motion`.**

## Preparación (5 min)

```bash
git checkout clase-7
git checkout -b clase-8
```

1. Abrir `index.html` con Live Server.
2. Abrir DevTools y el panel **Animations** (menú ⋮ › More tools › Animations). Permite ralentizar al 25% y ver cada keyframe. Úsalo en los pasos 6 y 7.
3. Tener a mano en macOS: Ajustes › Accesibilidad › Pantalla › **Reducir movimiento**. Se usa en el paso 10.

Regla que se repite toda la clase: **la `transition` se declara en el estado base, no en `:hover`**. Si se pone en `:hover`, el elemento entra suave pero sale de golpe.

---

## Paso 1 · Tokens de movimiento — slides 8 y 10

**Concepto.** Duraciones y curvas se repiten en toda la interfaz. Centralizarlas en `:root` da consistencia y facilita ajustar todo desde un lugar. Techo recomendado: 300–500 ms. `ease-out` para lo que entra, `ease-in` para lo que sale.

**Archivo.** `styles.css`, dentro de `:root`, después de `--header-offset`.

```css
  /* Tokens de movimiento (clase 8) */
  --duration-fast: 150ms;
  --duration-base: 300ms;
  --duration-slow: 500ms;
  --ease-out: cubic-bezier(.22, 1, .36, 1);
  --ease-in-out: ease-in-out;
```

**Mostrar.** Abrir [cubic-bezier.com](https://cubic-bezier.com) y comparar `ease-out` con la curva personalizada. Misma duración, sensación distinta.

**Error común.** Escribir `300` sin unidad. Sin `ms` o `s` la transición no ocurre.

---

## Paso 2 · Botones con `transition` y pseudoclases — slides 7 y 11

**Concepto.** Sin cambio de estado no hay nada que animar. `:hover`, `:active` y `:focus-visible` son los disparadores nativos. Dos propiedades pueden tener duraciones distintas en la misma declaración.

**Archivo.** `styles.css`, reemplazar el bloque `.btn` y `.btn:hover` (que hoy solo baja la opacidad).

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

**Mostrar.** Pasar el cursor sobre "Comprar Ticket": se oscurece y se eleva. Mantener pulsado: vuelve a su sitio. Navegar con Tab: aparece el contorno blanco solo con teclado.

**Errores comunes.**
- Mover el botón con `margin-top: -3px` en vez de `translateY`. Funciona pero desplaza a los vecinos y fuerza reflow.
- Quitar el `outline` sin dar un sustituto. `:focus` es accesibilidad, no decoración.

---

## Paso 3 · Inputs con `:focus` animado — slide 7

**Concepto.** El foco debe verse. Lo reemplazamos por un borde de color y un halo con `box-shadow`, ambos animables sin reflow.

**Archivo.** `styles.css`, reemplazar `form input { height: 2rem; }`. Aprovechamos para dar a los campos un tamaño cómodo (mínimo 44px de alto, el tamaño táctil recomendado), heredar la tipografía del sitio con `font: inherit` y usar los colores del tema oscuro.

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

**Mostrar.** Hacer clic en "Nombre" y luego Tab por el formulario. El halo pasa de campo en campo.

**Error común.** Animar `border-width` o `padding` para "agrandar" el campo. Cambia el layout en cada frame.

---

## Paso 4 · Menú con subrayado animado — slides 21 y 9

**Concepto.** Un pseudoelemento `::after` dibuja la línea. La slide la anima con `width: 0 → 100%`. Nosotros la animamos con `transform: scaleX(0 → 1)`: mismo efecto, sin recalcular layout. `transform-origin: left` hace que crezca desde la izquierda.

**Archivo.** `styles.css`, reemplazar `.nav-list a`.

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

**Mostrar.** Primero escribir la versión de la slide (`width: 0` → `width: 100%`) y verla funcionar. Luego cambiar a `scaleX`. Se ve igual. Abrir DevTools › Performance, grabar unos hovers con cada versión y comparar si aparecen bloques "Layout" en morado. Es la demostración práctica de la slide 9.

**Error común.** Olvidar `position: relative` en el enlace: el `::after` absoluto se posiciona respecto al `body`.

---

## Paso 5 · Tarjetas: elevación, zoom, `filter` y etiqueta — slides 14, 20 y 23

**Concepto.** Patrón galería: el `:hover` del contenedor dispara cambios en los hijos. El `overflow: hidden` del padre recorta el zoom de la imagen. La etiqueta sube con `translateY(100%) → 0` en lugar de `bottom: -100% → 0`.

**Archivo `index.html`.** En cada una de las seis tarjetas, envolver la imagen (cada tarjeta tiene su propia imagen en `img/`):

```html
<div class="card-media">
    <img class="card-image" src="img/jazz.jpg" alt="Fila de saxofonistas tocando en un concierto">
    <span class="card-tag">Ver detalles</span>
</div>
```

**Archivo `styles.css`.** Añadir a `.card` y reemplazar `.card-image`:

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

**Mostrar.** Pasar el cursor sobre una tarjeta: se eleva, la imagen hace zoom y se aclara, y sube la etiqueta. Quitar temporalmente `overflow: hidden` de `.card-media` para ver la imagen desbordar. Probar otros valores de `filter` en DevTools: `grayscale(100%)`, `sepia(70%)`, `hue-rotate(180deg)`.

**Errores comunes.**
- Poner la `transition` en `.card:hover .card-image` en vez de `.card-image`: el zoom entra suave y sale de golpe.
- Olvidar `display: block` en la imagen: queda un hueco de unos píxeles debajo por la línea base del texto.

---

## Paso 6 · Entrada escalonada con `@keyframes` — slides 16, 17 y 19

**Concepto.** `@keyframes` son dos pasos: declarar la secuencia y aplicarla con `animation`. Con `animation-delay` distinto en cada tarjeta se crea el efecto escalonado. `both` (`animation-fill-mode`) aplica el primer keyframe antes de empezar y mantiene el último al terminar: evita el parpadeo.

**Archivo.** `styles.css`. Al final del archivo:

```css
@keyframes fade-up {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: none; }
}
```

Y dentro de `.card`:

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

**Mostrar.** Recargar la página: las seis tarjetas aparecen una tras otra, con 0,1 s entre cada una. Abrir DevTools › Animations, poner la velocidad al 25% y recargar para verlo en detalle. Cambiar `both` por `none` y recargar: las tarjetas parpadean visibles antes de desaparecer y empezar. Es la forma más clara de explicar `fill-mode`.

**Errores comunes.**
- Declarar el `@keyframes` y olvidar la propiedad `animation`. No pasa nada y no hay error en consola.
- En la forma abreviada, el primer tiempo es la duración y el segundo el delay: `animation: fade-up .6s .2s` funciona, `animation: fade-up .2s .6s` dura 0.2 s.

---

## Paso 7 · Tarjeta 3D con botón de pulso — slides 18 y 22

**Concepto.** Tres piezas: `perspective` en el escenario (padre), `transform-style: preserve-3d` en el interior que gira, y `backface-visibility: hidden` en cada cara. La cara trasera nace girada 180° para que al rotar el interior quede de frente. El pulso se aplica a un único botón: si todo pulsa, nada destaca.

**Archivo `index.html`.** Dentro de `<aside class="aside aside--featured">`, después del `<h2>`:

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

**Archivo `styles.css`.** Al final:

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

**Mostrar.** Pasar el cursor por la tarjeta del aside: gira y muestra fecha, lugar y el botón pulsando. Hacer Tab hasta la tarjeta: también gira (`:focus-within`), lo que la hace usable en touch y teclado. Cambiar `perspective` a `300px` para exagerar el efecto. Quitar `backface-visibility: hidden` y ver las dos caras superpuestas en espejo.

**Errores comunes.**
- Poner `perspective` en `.flip-card-inner` en lugar del padre: el giro se ve plano.
- Olvidar `transform-style: preserve-3d`: las caras se aplanan y la trasera desaparece.
- Olvidar `transform: rotateY(180deg)` en la cara trasera: se ve al revés (texto en espejo).
- `will-change` en `*`: reserva memoria GPU para toda la página. Solo en el elemento que sabemos que gira.

---

## Paso 8 · Variables CSS animadas en la demo Grid — slide 24

**Concepto.** Las variables actúan como parámetros del `transform`. El `:hover` cambia las variables, no el `transform`. También se pueden cambiar desde JavaScript.

**Archivo.** `styles.css`, en `.box`:

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

**Mostrar.** Hover sobre las cajas de la sección Grid. Luego en la consola de DevTools:

```js
document.documentElement.style.setProperty('--escala', '1.3');
```

No pasa nada: la variable definida en `.box` gana a la heredada de `:root`. Ahora:

```js
document.querySelector('.box').style.setProperty('--escala', '1.3');
```

La primera caja escala con transición. Buen momento para explicar la cascada de las custom properties.

---

## Paso 9 · Reveal al hacer scroll — slide 25

**Concepto.** El CSS define los dos estados. El JavaScript solo añade una clase cuando el elemento entra en pantalla, con Intersection Observer. El prefijo `.js` en el selector garantiza que si el script no carga, nada queda oculto.

**Archivo `index.html`.** Añadir `class="reveal"` a las secciones `#aboutus`, `#contact`, la sección "Grid" y al `<footer>`.

**Archivo `styles.css`.** Al final:

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

**Archivo `script.js`.** Reemplazar el contenido:

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

**Mostrar.** Recargar y hacer scroll lento: cada sección sube y aparece. En DevTools › Elements, ver cómo `<html>` recibe la clase `js` y cada sección recibe `is-visible`. Desactivar JavaScript (DevTools › ⋮ › Run command › "Disable JavaScript") y recargar: todo se ve, sin animación. Esa es la razón del prefijo `.js`.

**Errores comunes.**
- Escribir `.reveal { opacity: 0 }` sin el prefijo `.js`: si el script falla, media página es invisible.
- Olvidar `unobserve`: la animación se repite cada vez que el elemento entra y sale de pantalla.

---

## Paso 10 · Accesibilidad y rendimiento — slides 27 y 28

**Concepto.** Para usuarios con trastornos vestibulares el movimiento causa mareo real. `prefers-reduced-motion` es la preferencia del sistema operativo. Usamos `0.01ms` y no `0` para que los eventos `transitionend`/`animationend` sigan disparándose.

**Archivo.** `styles.css`, último bloque del archivo:

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

**Mostrar.** Activar Reducir movimiento en macOS (o en DevTools: ⋮ › More tools › Rendering › "Emulate CSS media feature prefers-reduced-motion"). Recargar: las tarjetas aparecen sin escalonado, el botón no pulsa, la tarjeta 3D cambia de cara al instante y las secciones ya están visibles. La página sigue siendo completamente usable.

---

## Paso 11 (extra) · Gradientes en la barra de navegación

**Concepto.** Un gradiente no es un color: es una **imagen que genera el navegador**. Por eso se declara en `background-image` (o en el atajo `background`) y no en `background-color`. Hay tres tipos: `linear-gradient` (en una dirección), `radial-gradient` (desde un centro) y `conic-gradient` (girando alrededor de un centro). Los gradientes reemplazaron a las imágenes PNG cortadas de los 2000: pesan cero bytes, escalan a cualquier tamaño y usan las variables del proyecto.

Anatomía de `linear-gradient(135deg, #063E5F 0%, #0f1117 55%)`:

- `135deg`: dirección. `0deg` va de abajo hacia arriba, `90deg` de izquierda a derecha, `180deg` de arriba hacia abajo. También acepta `to right`, `to bottom left`.
- `#063E5F 0%`: primera parada de color (*color stop*). El porcentaje dice dónde el color está "puro".
- `#0f1117 55%`: segunda parada. Entre 0% y 55% el navegador interpola; después del 55% el color se mantiene.

**Archivo.** `styles.css`, en `.header` y dos reglas nuevas debajo.

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

**Mostrar.**

1. Cambiar `135deg` por `90deg` y por `to bottom` en DevTools para ver cómo gira la dirección.
2. Mover el `55%` a `100%` y a `20%`: la misma pareja de colores produce una transición larga o un corte casi seco.
3. Poner dos paradas en el mismo porcentaje (`red 50%, blue 50%`): se obtiene un borde duro sin degradado. Así se hacen rayas y patrones con CSS puro.
4. En el título, comentar `color: transparent` y ver que el gradiente desaparece detrás del texto blanco. `background-clip: text` recorta el fondo a las letras, pero el color del texto sigue tapándolo.
5. Enlazar con la clase: **los gradientes no se pueden animar con `transition`**. El navegador no sabe interpolar entre dos imágenes. Dos soluciones: (a) hacer el fondo más grande que el elemento (`background-size: 200%`) y animar `background-position`, o (b) poner el gradiente final en un pseudoelemento y animar su `opacity`. La segunda es la que respeta la regla de la slide 9.

**Errores comunes.**
- Escribir el gradiente en `background-color`. No es un color, el navegador lo ignora.
- Olvidar el `background-color` de respaldo: si el gradiente no se soporta (o se escribe mal), el header queda transparente sobre el contenido al hacer scroll.
- Texto con gradiente sin suficiente contraste. Los extremos del gradiente deben cumplir contraste con el fondo por sí solos; aquí van de blanco a azul claro sobre fondo oscuro.
- `background-clip: text` sin el prefijo `-webkit-`: Safari y Chrome antiguos lo necesitan todavía.

---

## Paso 12 (extra) · Banner de bienvenida con imagen de fondo

Este paso se construye por capas. Cada subpaso deja la página en un estado que se puede mostrar antes de seguir; así los estudiantes ven qué aporta cada propiedad.

**Concepto.** Un *hero* o banner es la primera impresión del sitio: una imagen a lo ancho, un mensaje corto y una única acción. Tres ideas técnicas se combinan:

1. **Fondos múltiples.** `background-image` acepta varias imágenes separadas por coma. La primera queda encima. Como un gradiente es una imagen (paso 11), podemos poner un gradiente semitransparente **sobre** la foto en una sola declaración, sin HTML extra.
2. **`background-size: cover` + `background-position: center`.** La foto cubre todo el área sin deformarse y se recorta desde el centro. Es el equivalente de `object-fit: cover` para fondos.
3. **Contraste garantizado.** El texto blanco sobre una foto cualquiera no es legible. La capa de gradiente oscurece más la zona donde está el texto y menos donde solo hay foto.

### 12.1 · Preparar la imagen

Antes de escribir CSS hay que elegir la foto. Criterios:

- **Horizontal y ancha.** El banner mide mucho más de ancho que de alto. Una foto vertical se recortará casi entera con `cover`.
- **Zona "tranquila" para el texto.** Como el mensaje va a la izquierda, conviene que la izquierda de la foto sea oscura o poco detallada. La banda del escenario cumple: el músico y las luces están en el centro y la derecha.
- **Peso razonable.** Es la imagen más grande de la página y se descarga en la primera pantalla. Se pidió a 1600×700 px y pesa 79 KB. Regla práctica: por debajo de 150 KB para un banner, y nunca subir la foto original de una cámara (varios MB).
- **Licencia.** Igual que las tarjetas, viene de picsum.photos, que sirve fotos de Unsplash con licencia de uso libre. En un proyecto real, documentar la fuente.

Se guarda como `img/banner.jpg`, junto a las imágenes de las tarjetas.

> Para la clase: abrir la imagen sola en el navegador y preguntar "¿dónde pondrían el texto?". La respuesta guía el gradiente del subpaso 12.4.

### 12.2 · La estructura HTML

Justo después de `</header>` y antes de `<div class="layout">`:

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

Decisiones de marcado que conviene explicar:

- `<section>` y no `<div>`: es un bloque con sentido propio y tiene título. `aria-labelledby` lo conecta con ese título, así los lectores de pantalla anuncian "sección: Bienvenido a la cartelera".
- `<h2>` y no `<h1>`: el `<h1>` de la página ya es "Cartelera de eventos" en el header. Solo debe haber uno.
- `<a>` y no `<button>`: "Ver eventos" **navega** a `#events`. Un botón es para acciones (enviar, abrir, cerrar). Se le da la clase `.btn` para que se vea igual que los botones y herede su hover del paso 2.
- `.hero-content` es un contenedor extra para poder limitar el ancho del texto sin limitar el ancho del fondo.

**Qué se ve:** un bloque de texto plano entre el header y las tarjetas. El footer probablemente ya no está pegado abajo. Eso se arregla en 12.3.

### 12.3 · Hacer sitio en el grid del `body`

El `body` es un grid de filas (`header | layout | footer`). El hero es un hijo nuevo y necesita su fila:

```css
body {
  grid-template-rows: auto auto 1fr auto; /* header | .hero | .layout | footer */
}
```

**Qué se ve:** nada cambia a simple vista, pero el footer vuelve a quedar abajo. Sin esta línea el hero ocupaba la fila `1fr` y el layout caía en una fila implícita.

### 12.4 · La foto de fondo y la capa de contraste

Primero solo la foto, para ver el problema:

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

**Qué se ve:** la foto ocupa el banner, pero el texto blanco se pierde en las zonas claras. El `padding` lateral es el mismo cálculo que usan header y layout, así el texto arranca alineado con el resto de la página.

Ahora se apila el gradiente **encima** de la foto:

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

Los tres `rgba` usan el mismo color que `--background-color` (`#0f1117` = `15, 17, 23`) con distinta opacidad, por eso el banner se funde con la página. `background-size`, `position` y `repeat` se aplican a las dos capas.

**Qué se ve:** el texto es legible en la izquierda y la foto sigue viéndose en la derecha.

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

**Qué se ve:** el texto queda centrado verticalmente en el banner, el párrafo no se extiende hasta el borde derecho y el enlace parece un botón.

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

`clamp(mínimo, preferido, máximo)`: el título mide el 4% del ancho del viewport, pero nunca menos de 2rem ni más de 3rem. Es una media query en una sola línea. Y `fade-up` ya existe desde el paso 6: declarar los `@keyframes` por separado permite reutilizarlos.

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

El `row-gap: 1rem` que tiene el `body` también añade una franja entre el header y el banner y entre el banner y el layout. Es una decisión de estilo: si se quiere el banner pegado al header, se quita ese `row-gap` y se deja la separación solo en `.layout`.

**Qué se ve:** en móvil el banner es más bajo y el contenido no queda pegado a él.

### Resultado final en `styles.css`

El bloque completo, ya ordenado, va justo antes de `.layout`:

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

**Mostrar (demostraciones en DevTools sobre el resultado final).**

1. Comentar la línea del `linear-gradient` dejando solo la `url`. El texto se vuelve ilegible sobre las zonas claras de la foto. Volver a activarlo.
2. Cambiar `cover` por `contain`: la foto se ve entera pero deja huecos. Cambiar por `100% 100%`: se deforma. `cover` es casi siempre la respuesta.
3. Mover `background-position` a `top` y a `bottom` para elegir qué parte de la foto se recorta.
4. Redimensionar la ventana: el título escala entre 2rem y 3rem gracias a `clamp()`, sin media queries.
5. Recargar: el bloque de texto entra con la misma animación `fade-up` de las tarjetas.
6. Hacer clic en "Ver eventos": es un `<a>` con clase `.btn`, hereda hover y transición del paso 2, y el destino no queda tapado por el header sticky gracias a `scroll-margin-top` en las secciones con id.
7. En la pestaña Network, recargar y buscar `banner.jpg`: ver el peso y el tiempo. Compararlo con lo que pesaría la foto original de una cámara.

**Errores comunes.**
- Poner la `url()` antes del gradiente: la foto tapa el gradiente y no hay oscurecimiento.
- Ruta de la imagen relativa al HTML en vez de al CSS. En `url()` la ruta se resuelve desde la hoja de estilos; aquí coinciden porque ambos están en la raíz.
- Usar `height: 45vh` en vez de `min-height`: si el texto crece (móvil, zoom) se desborda del banner.
- Olvidar añadir la fila en `grid-template-rows` del `body`: el hero cae en una fila implícita y el `1fr` deja de estar en el layout, con lo que el footer ya no queda pegado abajo.
- Imagen sin `background-color` de respaldo: mientras carga, el texto blanco queda sobre fondo negro plano. Aceptable, pero el color secundario mantiene la identidad visual.
- Poner el texto del banner dentro de la imagen (una foto con el título ya escrito). No se puede traducir, no lo lee un buscador ni un lector de pantalla, y se pixela al escalar.
- Un segundo `<h1>` en el hero. Rompe la jerarquía de títulos de la página.

---

## Paso 13 (extra) · El gradiente del header cambia al hacer scroll

**Concepto.** Dos ideas nuevas encadenadas:

1. **Cómo "animar" un gradiente.** No se puede: `transition` no interpola entre dos imágenes (paso 11). La solución es tener los dos gradientes a la vez, el segundo en un pseudoelemento `::before` que cubre el header, y animar su `opacity`. Es la propiedad más barata que existe (slide 9).
2. **Scroll-driven animations.** Hasta ahora una animación avanzaba con el tiempo. Con `animation-timeline: scroll()` avanza con el **desplazamiento**: la posición del scroll decide en qué punto de los keyframes está. Sin evento `scroll`, sin JavaScript, y corre en el hilo del compositor, así que nunca se entrecorta. `animation-range: 0 160px` dice que los keyframes se recorren entre 0 y 160 px de scroll.

Soporte en 2026: Chrome, Edge y Safari lo tienen. Firefox lo tiene detrás de una bandera. Por eso lo envolvemos en `@supports` y dejamos un respaldo en JavaScript que solo se ejecuta cuando hace falta.

**Archivo `styles.css`.** Debajo de `.header`, antes de `.header::after`:

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

**Archivo `script.js`.** Al final:

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

**Mostrar.**

1. Hacer scroll despacio: el header pasa del gradiente oscuro al azul en los primeros 160 px, y vuelve al subir. No es un interruptor, sigue al dedo o a la rueda del mouse.
2. En DevTools › Elements, seleccionar `.header` y ver el `::before`. Cambiar `animation-range` a `0 600px`: el cambio se estira. Cambiar a `100px 200px`: no empieza hasta pasar 100 px.
3. Comentar `animation-timeline` en el `@supports`: la animación pasa a ejecutarse con el tiempo (duración por defecto 0 s, así que salta a `to`). Es la prueba de que la línea de tiempo es lo que reemplaza al tiempo.
4. Simular un navegador sin soporte: en la consola, `CSS.supports('animation-timeline: scroll()')` devuelve `true`. Comentar todo el bloque `@supports` y añadir a mano la clase `is-scrolled` al header en Elements: el respaldo hace una transición de 500 ms al mismo estado final.
5. Con `z-index: -1` quitado, el `::before` tapa el título y el menú. Explicar que el header es un contexto de apilamiento por tener `position: sticky` y `z-index: 10`, y por eso el `-1` queda dentro del header y no detrás de la página.

**Errores comunes.**
- Escribir `animation-timeline` antes del atajo `animation`. El atajo reinicia `animation-timeline` a `auto` y la animación vuelve a ser temporal.
- Poner `scroll()` sin argumento cuando el elemento está dentro de un contenedor con scroll propio: por defecto usa el ancestro con scroll más cercano. `scroll(root)` fuerza el documento.
- Intentar transicionar `background-image` directamente. No da error, simplemente cambia de golpe.
- Olvidar `{ passive: true }` en el listener de respaldo: el navegador espera al handler antes de desplazar y el scroll se siente pesado.

---

## Checklist de cierre

Ejecutar en la terminal del proyecto. Debe devolver vacío:

```bash
grep -nE "transition:|animation:" styles.css | grep -E "width|height|top|left"
```

- [ ] Ninguna `transition` ni `animation` toca `width`, `height`, `top` o `left`.
- [ ] Todas las transiciones están en el estado base, no en `:hover`.
- [ ] Solo un elemento pulsa en pantalla.
- [ ] `will-change` aparece una única vez, en `.flip-card-inner`.
- [ ] Con Reducir movimiento activado la página se ve completa y es usable.
- [ ] Con JavaScript desactivado no hay contenido oculto.
- [ ] Tab recorre botones, inputs, enlaces y la tarjeta 3D con foco visible.
- [ ] El header tiene `background-color` de respaldo además del gradiente.
- [ ] El texto del banner es legible en todo el ancho (la capa de gradiente está activa).
- [ ] El header cambia de gradiente al hacer scroll y `animation-timeline` está después del atajo `animation`.

```bash
git add .
git commit -m "feat: clase-8"
```

## Preguntas de reflexión (slide 33)

1. De las animaciones implementadas, ¿cuál quitarías si tuvieras que dejar solo tres? ¿Qué comunica cada una de las que quedan?
2. La tarjeta 3D gira con `:hover`. ¿Qué pasa en un celular? ¿Qué resolvimos con `:focus-within` y qué falta?
3. El botón de pulso está en el aside. ¿Sería mejor en el formulario de contacto? ¿Por qué la slide 30 dice que no?

## Recursos

- [MDN · Using CSS transitions](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_transitions/Using_CSS_transitions)
- [MDN · Using CSS animations](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animations/Using_CSS_animations)
- [MDN · Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [cubic-bezier.com](https://cubic-bezier.com) · editor de curvas
- [Animista](https://animista.net) · generador de animaciones
- [CSS Triggers](https://csstriggers.com) · qué propiedades provocan layout, paint o composite
- [MDN · Using CSS gradients](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_images/Using_CSS_gradients)
- [cssgradient.io](https://cssgradient.io) · editor visual de gradientes
- [MDN · CSS scroll-driven animations](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_scroll-driven_animations)
- [scroll-driven-animations.style](https://scroll-driven-animations.style) · demos y herramientas de Chrome
