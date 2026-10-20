/* Taller 2 - Interfaz.
   Este archivo NO conoce URLs ni hace fetch: usa las funciones de api.js
   (obtenerEventos, crearEvento, ...) y se encarga del DOM.
   api.js se carga antes en index.html, por eso sus funciones existen aquí. */

let eventos = [];            // lo último que respondió la API
let categoriaActual = '';    // '' = Todos
let carrito = [];            // [{ id, titulo, precio, cantidad, cupos }]

const contenedorEventos = document.querySelector('.events-container');
const botonesFiltro = document.querySelectorAll('.filtro');
const formEvento = document.querySelector('#form-evento');
const formPedido = document.querySelector('#form-pedido');
const listaCarrito = document.querySelector('.carrito-lista');
const dialogDetalle = document.querySelector('#detalle');
const contenidoDetalle = document.querySelector('.detalle-contenido');

const formatearPrecio = (precio) => {
  if (precio <= 0){
    return 'Entrada libre';
  }
  return '$' + precio.toLocaleString('es-CO');
}

const textoCupos = (cupos) => {
  if (cupos === 0){
    return 'Sin cupos';
  } else if (cupos === 1) {
    return 'Queda 1 cupo'
  } else {
    return `Quedan ${cupos} cupos`
  }
}

/*
  Deshabilita un botón mientras una petición está en curso
  (evita que un doble clic cree dos eventos o dos pedidos).
  @param {HTMLButtonElement} boton
  @param {boolean} ocupado
  @param {string} texto - Texto mientras está ocupado, ej. 'Guardando...'
*/
const ocupar = (boton, ocupado, texto = 'Enviando...') => {
  boton.disabled = ocupado;
  if (ocupado) {
    boton.dataset.texto = boton.textContent;
    boton.textContent = texto;
  } else if (boton.dataset.texto) {
    boton.textContent = boton.dataset.texto;
  }
}

// Mensaje flotante para confirmar o reportar errores de las acciones
let temporizadorAviso;
const avisar = (texto, tipo = 'ok') => {
  const aviso = document.querySelector('#aviso');
  aviso.textContent = texto;
  aviso.className = `aviso aviso--${tipo} is-visible`;
  clearTimeout(temporizadorAviso);   // si llega otro aviso, reinicia los 4 segundos
  temporizadorAviso = setTimeout(() => aviso.classList.remove('is-visible'), 4000);
}

/* ============================ Listado ============================ */

const crearBoton = (texto, accion, clase = 'btn btn--accent') => {
  const boton = document.createElement('button');
  boton.type = 'button';
  boton.className = clase;
  boton.textContent = texto;
  boton.dataset.accion = accion;   // el clic se maneja con delegación, ver abajo
  return boton;
}

const crearTarjeta = (evento) => {
  const tarjeta = document.createElement('article');
  tarjeta.className = 'card';
  tarjeta.dataset.id = evento.id;
  tarjeta.tabIndex = 0;   // enfocable con teclado: Enter abre el detalle

  const media = document.createElement('div');
  media.className = 'card-media';

  const imagen = document.createElement('img');
  imagen.className = 'card-image';
  imagen.src = evento.imagen;
  imagen.alt = evento.alt;

  const etiqueta = document.createElement('span');
  etiqueta.className = 'card-tag';
  etiqueta.textContent = 'Ver detalles';

  media.append(imagen, etiqueta);
  tarjeta.append(media);

  const cuerpo = document.createElement('div');
  cuerpo.className = 'card-body';

  const titulo = document.createElement('h3');
  titulo.textContent = evento.titulo;

  const description = document.createElement('p');
  description.textContent = evento.descripcion;

  const cupos = document.createElement('small');
  cupos.className = 'card-stock';
  cupos.textContent = textoCupos(evento.cupos);

  cuerpo.append(titulo, description, cupos);
  tarjeta.append(cuerpo);

  const acciones = document.createElement('div');
  acciones.className = 'card-actions';

  const precio = document.createElement('span');
  precio.className = 'card-price';
  precio.textContent = formatearPrecio(evento.precio);

  const comprar = crearBoton('Comprar Ticket', 'comprar');
  comprar.disabled = evento.cupos === 0;

  acciones.append(precio, comprar);
  tarjeta.append(acciones);

  const admin = document.createElement('div');
  admin.className = 'card-admin';
  admin.append(
    crearBoton('Editar', 'editar', 'btn btn--secondary'),
    crearBoton('Eliminar', 'eliminar', 'btn btn--danger')
  );
  tarjeta.append(admin);

  contenedorEventos.append(tarjeta);
}

const renderizarEventos = () => {
  contenedorEventos.innerHTML = '';
  for (let evento of eventos) {
    crearTarjeta(evento);
  }
}

/*
  Muestra un mensaje en el contenedor de eventos
  @param {string} texto - Texto del mensaje
  @param {string} tipo - Tipo de mensaje (cargando, vacio, error)
  @returns {HTMLElement} - Elemento del mensaje
*/
const mostrarMensaje = (texto, tipo) => {
  contenedorEventos.innerHTML = '';
  const mensaje = document.createElement('p');
  mensaje.textContent = texto;
  mensaje.className = `estado estado--${tipo}`;
  contenedorEventos.append(mensaje);
  return mensaje;
}

/*
  GET /eventos (o /eventos?categoria=X) y pinta el resultado.
  Se llama al iniciar, al filtrar y después de cada POST, PUT o DELETE:
  así la lista se actualiza sin recargar la página.
*/
const cargarEventos = async (categoria = categoriaActual) => {
  categoriaActual = categoria;
  mostrarMensaje('Cargando eventos...', 'cargando');
  contenedorEventos.setAttribute('aria-busy', 'true');
  botonesFiltro.forEach((boton) => (boton.disabled = true));
  try {
    eventos = await obtenerEventos(categoria);
    if (eventos.length === 0) {
      mostrarMensaje(categoria ? `No hay eventos de ${categoria}` : 'Aún no hay eventos publicados', 'vacio');
      return;
    }
    renderizarEventos();
  } catch (error) {
    console.error('Error al obtener los eventos:', error);
    const mensaje = mostrarMensaje('No pudimos cargar los eventos. Revisa tu conexión e intenta de nuevo.', 'error');
    const reintentar = crearBoton('Reintentar', 'reintentar');
    reintentar.addEventListener('click', () => cargarEventos());
    mensaje.append(reintentar);
  } finally {
    contenedorEventos.setAttribute('aria-busy', 'false');
    botonesFiltro.forEach((boton) => (boton.disabled = false));
  }
}

/* ============================ Filtro ============================ */

botonesFiltro.forEach((boton) => {
  boton.addEventListener('click', () => {
    botonesFiltro.forEach((b) => b.setAttribute('aria-pressed', b === boton));
    // data-categoria="" en el botón "Todos" -> trae el listado completo
    cargarEventos(boton.dataset.categoria);
  });
});

/* ============================ Detalle ============================ */

const crearDato = (etiqueta, valor) => {
  const fila = document.createElement('p');
  const fuerte = document.createElement('strong');
  fuerte.textContent = `${etiqueta}: `;
  fila.append(fuerte, valor);
  return fila;
}

// GET /eventos/:id -> datos frescos aunque la tarjeta tenga info vieja
const verDetalle = async (id) => {
  contenidoDetalle.innerHTML = '<p class="estado estado--cargando">Cargando detalle...</p>';
  dialogDetalle.showModal();
  try {
    const evento = await obtenerEvento(id);
    contenidoDetalle.innerHTML = '';

    const imagen = document.createElement('img');
    imagen.className = 'detalle-imagen';
    imagen.src = evento.imagen;
    imagen.alt = evento.alt;

    const titulo = document.createElement('h3');
    titulo.id = 'detalle-titulo';
    titulo.textContent = evento.titulo;

    const descripcion = document.createElement('p');
    descripcion.textContent = evento.descripcion;

    const comprar = crearBoton('Agregar al carrito', 'comprar');
    comprar.disabled = evento.cupos === 0;
    comprar.addEventListener('click', () => {
      agregarAlCarrito(evento);
      dialogDetalle.close();
    });

    contenidoDetalle.append(
      imagen,
      titulo,
      descripcion,
      crearDato('Categoría', evento.categoria),
      crearDato('Fecha', evento.fecha),
      crearDato('Lugar', evento.lugar),
      crearDato('Precio', formatearPrecio(evento.precio)),
      crearDato('Disponibilidad', textoCupos(evento.cupos)),
      comprar
    );
  } catch (error) {
    console.error('Error al obtener el detalle:', error);
    const texto = error.status === 404
      ? 'Este evento ya no existe. Puede que lo hayan eliminado.'
      : 'No pudimos cargar el detalle. Intenta de nuevo.';
    contenidoDetalle.innerHTML = '';
    const mensaje = document.createElement('p');
    mensaje.className = 'estado estado--error';
    mensaje.textContent = texto;
    contenidoDetalle.append(mensaje);
  }
}

/* ===================== Administración (CRUD) ===================== */

const campos = formEvento.elements;
const botonGuardar = formEvento.querySelector('[type="submit"]');
const botonCancelar = formEvento.querySelector('.form-cancelar');
const mensajeEvento = formEvento.querySelector('.form-mensaje');

// Convierte el formulario en el objeto que espera la API (con los tipos correctos)
const leerFormulario = () => ({
  titulo: campos.titulo.value.trim(),
  descripcion: campos.descripcion.value.trim(),
  categoria: campos.categoria.value,
  fecha: campos.fecha.value.trim(),
  lugar: campos.lugar.value.trim(),
  precio: Number(campos.precio.value),    // el input siempre entrega texto
  cupos: Number(campos.cupos.value),
  imagen: campos.imagen.value.trim(),
  alt: campos.alt.value.trim(),
  destacado: campos.destacado.checked,
});

// Validaciones que el HTML no cubre solo (espacios en blanco, enteros)
const validarEvento = (evento) => {
  if (evento.titulo.length < 3) return 'El título debe tener al menos 3 caracteres.';
  if (evento.descripcion.length < 10) return 'La descripción debe tener al menos 10 caracteres.';
  if (evento.precio < 0) return 'El precio no puede ser negativo.';
  if (!Number.isInteger(evento.cupos) || evento.cupos < 0) return 'Los cupos deben ser un número entero mayor o igual a 0.';
  return '';
}

const mostrarMensajeForm = (elemento, texto, tipo) => {
  elemento.textContent = texto;
  elemento.className = `form-mensaje form-mensaje--${tipo}`;
}

const salirDeEdicion = () => {
  formEvento.reset();
  campos.id.value = '';
  formEvento.querySelector('legend').textContent = 'Nuevo evento';
  botonGuardar.textContent = 'Crear evento';
  botonCancelar.hidden = true;
}

// Carga los datos de la tarjeta en el formulario y lo pone en modo edición
const editarEvento = (id) => {
  const evento = eventos.find((e) => e.id === id);
  for (const campo of ['titulo', 'descripcion', 'categoria', 'fecha', 'lugar', 'precio', 'cupos', 'imagen', 'alt']) {
    campos[campo].value = evento[campo];
  }
  campos.destacado.checked = evento.destacado;
  campos.id.value = id;
  formEvento.querySelector('legend').textContent = `Editando: ${evento.titulo}`;
  botonGuardar.textContent = 'Guardar cambios';
  botonCancelar.hidden = false;
  mostrarMensajeForm(mensajeEvento, '', 'ok');
  formEvento.scrollIntoView({ behavior: 'smooth' });
  campos.titulo.focus({ preventScroll: true });
}

formEvento.addEventListener('submit', async (e) => {
  e.preventDefault();   // sin esto el navegador recarga la página
  const evento = leerFormulario();
  const error = validarEvento(evento);
  if (error) {
    mostrarMensajeForm(mensajeEvento, error, 'error');
    return;
  }

  const id = campos.id.value;
  ocupar(botonGuardar, true, 'Guardando...');
  try {
    // Mismo formulario: con id es PUT (editar), sin id es POST (crear)
    const guardado = id ? await actualizarEvento(id, evento) : await crearEvento(evento);
    salirDeEdicion();
    mostrarMensajeForm(mensajeEvento, `"${guardado.titulo}" se ${id ? 'actualizó' : 'creó'} con el id ${guardado.id}.`, 'ok');
    await cargarEventos();
  } catch (err) {
    console.error('Error al guardar el evento:', err);
    mostrarMensajeForm(mensajeEvento, 'No se pudo guardar el evento. Intenta de nuevo.', 'error');
  } finally {
    ocupar(botonGuardar, false);
  }
});

botonCancelar.addEventListener('click', () => {
  salirDeEdicion();
  mostrarMensajeForm(mensajeEvento, '', 'ok');
});

const borrarEvento = async (id, boton) => {
  const evento = eventos.find((e) => e.id === id);
  // confirm() devuelve true/false: el DELETE no se puede deshacer
  if (!confirm(`¿Eliminar "${evento.titulo}"? Esta acción no se puede deshacer.`)) {
    return;
  }
  ocupar(boton, true, 'Eliminando...');
  try {
    await eliminarEvento(id);
    if (campos.id.value === id) salirDeEdicion();
    quitarDelCarrito(id);
    avisar(`Se eliminó "${evento.titulo}".`);
    await cargarEventos();
  } catch (error) {
    console.error('Error al eliminar el evento:', error);
    avisar('No se pudo eliminar el evento. Intenta de nuevo.', 'error');
    ocupar(boton, false);
  }
}

/*
  Delegación de eventos: UN solo listener en el contenedor atiende los clics
  de todas las tarjetas, incluso las que se crean después de un POST.
*/
contenedorEventos.addEventListener('click', (e) => {
  const tarjeta = e.target.closest('.card');
  if (!tarjeta) return;
  const id = tarjeta.dataset.id;
  const boton = e.target.closest('[data-accion]');
  const accion = boton ? boton.dataset.accion : 'detalle';

  if (accion === 'comprar') agregarAlCarrito(eventos.find((ev) => ev.id === id));
  if (accion === 'editar') editarEvento(id);
  if (accion === 'eliminar') borrarEvento(id, boton);
  if (accion === 'detalle') verDetalle(id);
});

contenedorEventos.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.target.classList.contains('card')) {
    verDetalle(e.target.dataset.id);
  }
});

/* ============================ Carrito ============================ */

const totalCarrito = () => carrito.reduce((suma, item) => suma + item.precio * item.cantidad, 0);

// localStorage puede fallar (modo privado, almacenamiento bloqueado): por eso try/catch
const guardarCarrito = () => {
  try {
    localStorage.setItem('carrito', JSON.stringify(carrito));
  } catch (error) {
    console.warn('No se pudo guardar el carrito:', error);
  }
}

const leerCarrito = () => {
  try {
    return JSON.parse(localStorage.getItem('carrito')) || [];
  } catch (error) {
    return [];
  }
}

const agregarAlCarrito = (evento) => {
  const item = carrito.find((i) => i.id === evento.id);
  if (item && item.cantidad >= evento.cupos) {
    avisar(`No quedan más cupos para "${evento.titulo}".`, 'error');
    return;
  }
  if (item) {
    item.cantidad++;
  } else {
    const { id, titulo, precio, cupos } = evento;
    carrito.push({ id, titulo, precio, cupos, cantidad: 1 });
  }
  avisar(`"${evento.titulo}" agregado al carrito.`);
  actualizarCarrito();
}

const cambiarCantidad = (id, cambio) => {
  const item = carrito.find((i) => i.id === id);
  item.cantidad += cambio;
  if (item.cantidad > item.cupos) item.cantidad = item.cupos;
  if (item.cantidad <= 0) {
    quitarDelCarrito(id);
    return;
  }
  actualizarCarrito();
}

const quitarDelCarrito = (id) => {
  carrito = carrito.filter((i) => i.id !== id);
  actualizarCarrito();
}

const renderizarCarrito = () => {
  listaCarrito.innerHTML = '';
  if (carrito.length === 0) {
    const vacio = document.createElement('li');
    vacio.className = 'carrito-vacio';
    vacio.textContent = 'Tu carrito está vacío.';
    listaCarrito.append(vacio);
  }
  for (const item of carrito) {
    const fila = document.createElement('li');
    fila.className = 'carrito-item';
    fila.dataset.id = item.id;

    const nombre = document.createElement('span');
    nombre.className = 'carrito-nombre';
    nombre.textContent = item.titulo;

    const controles = document.createElement('div');
    controles.className = 'carrito-controles';
    const menos = crearBoton('−', 'menos', 'btn btn--mini');
    menos.setAttribute('aria-label', `Quitar un ticket de ${item.titulo}`);
    const cantidad = document.createElement('span');
    cantidad.textContent = item.cantidad;
    const mas = crearBoton('+', 'mas', 'btn btn--mini');
    mas.setAttribute('aria-label', `Agregar un ticket de ${item.titulo}`);
    mas.disabled = item.cantidad >= item.cupos;
    const subtotal = document.createElement('span');
    subtotal.className = 'carrito-subtotal';
    subtotal.textContent = formatearPrecio(item.precio * item.cantidad);
    controles.append(menos, cantidad, mas, subtotal);

    fila.append(nombre, controles);
    listaCarrito.append(fila);
  }
  document.querySelector('#carrito-total').textContent = '$' + totalCarrito().toLocaleString('es-CO');
  document.querySelector('#carrito-contador').textContent = carrito.reduce((n, i) => n + i.cantidad, 0);
  formPedido.querySelector('[type="submit"]').disabled = carrito.length === 0;
}

const actualizarCarrito = () => {
  guardarCarrito();
  renderizarCarrito();
}

listaCarrito.addEventListener('click', (e) => {
  const boton = e.target.closest('[data-accion]');
  if (!boton) return;
  const id = boton.closest('.carrito-item').dataset.id;
  cambiarCantidad(id, boton.dataset.accion === 'mas' ? 1 : -1);
});

/* ======================== Finalizar compra ======================== */

formPedido.addEventListener('submit', async (e) => {
  e.preventDefault();
  const mensaje = document.querySelector('#pedido-mensaje');
  if (carrito.length === 0) {
    mostrarMensajeForm(mensaje, 'Agrega al menos un evento al carrito.', 'error');
    return;
  }

  // El cuerpo del POST /pedidos: cliente, email, items, total, fecha
  const pedido = {
    cliente: formPedido.elements.cliente.value.trim(),
    email: formPedido.elements.email.value.trim(),
    items: carrito.map(({ id, titulo, precio, cantidad }) => ({ id, titulo, precio, cantidad })),
    total: totalCarrito(),
    fecha: new Date().toISOString(),
  };

  const boton = formPedido.querySelector('[type="submit"]');
  ocupar(boton, true, 'Procesando...');
  try {
    const creado = await crearPedido(pedido);
    mostrarMensajeForm(mensaje, `¡Compra confirmada! Tu número de pedido es ${creado.id}.`, 'ok');
    carrito = [];
    guardarCarrito();
    formPedido.reset();
  } catch (error) {
    console.error('Error al crear el pedido:', error);
    // No vaciamos el carrito: el usuario puede reintentar sin perder nada
    mostrarMensajeForm(mensaje, 'No pudimos procesar la compra. Tu carrito sigue guardado, intenta de nuevo.', 'error');
  } finally {
    ocupar(boton, false);
    renderizarCarrito();   // vuelve a deshabilitar el botón si el carrito quedó vacío
  }
});

/* ============================ Inicio ============================ */

carrito = leerCarrito();
renderizarCarrito();
cargarEventos();
