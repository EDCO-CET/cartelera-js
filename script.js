/* ==========================================================================
   Clase 8 - Reveal al hacer scroll con Intersection Observer
   El CSS define los dos estados (.reveal y .reveal.is-visible);
   este script solo decide CUÁNDO añadir la clase.
   ========================================================================== */

// Marca que JS está activo. Las reglas .js .reveal { opacity: 0 } solo aplican
// con esta clase: si el script no carga, nada queda oculto.
document.documentElement.classList.add('js');

const elementos = document.querySelectorAll('.reveal');

const reducirMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!('IntersectionObserver' in window) || reducirMovimiento) {
  // Navegador antiguo o usuario que prefiere sin animaciones: mostrar todo ya
  elementos.forEach((el) => el.classList.add('is-visible'));
} else {
  const observador = new IntersectionObserver(
    (entradas, obs) => {
      entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
          entrada.target.classList.add('is-visible');
          obs.unobserve(entrada.target); // la animación de entrada ocurre una sola vez
        }
      });
    },
    { threshold: 0.15 } // se dispara cuando el 15% del elemento es visible
  );

  elementos.forEach((el) => observador.observe(el));
}

/* --------------------------------------------------------------------------
   Header: gradiente que cambia al hacer scroll (respaldo)
   Si el navegador soporta animation-timeline: scroll(), el CSS ya lo hace
   solo y aquí no se ejecuta nada. Si no, alternamos una clase con el scroll.
   -------------------------------------------------------------------------- */
const soportaScrollTimeline = CSS.supports('animation-timeline: scroll()');

if (!soportaScrollTimeline) {
  const header = document.querySelector('.header');

  const actualizarHeader = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 40);
  };

  actualizarHeader(); // estado inicial (p. ej. al recargar a mitad de página)
  window.addEventListener('scroll', actualizarHeader, { passive: true });
}
