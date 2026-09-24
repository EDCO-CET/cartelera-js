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

**Archivo.** `styles.css`, reemplazar `form input { height: 2rem; }`.

```css
form input,
form textarea {
  border: 2px solid var(--border-color);
  border-radius: 4px;
  padding: 0 .5rem;
  transition:
    border-color var(--duration-base) ease,
    box-shadow var(--duration-base) ease;
}

form input { height: 2rem; }

form input:focus,
form textarea:focus {
  outline: none;
  border-color: var(--accent-color);
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

**Archivo `index.html`.** En cada una de las tres tarjetas, envolver la imagen:

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
```

**Mostrar.** Recargar la página: las tarjetas aparecen una tras otra. Abrir DevTools › Animations, poner la velocidad al 25% y recargar para verlo en detalle. Cambiar `both` por `none` y recargar: las tarjetas parpadean visibles antes de desaparecer y empezar. Es la forma más clara de explicar `fill-mode`.

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
