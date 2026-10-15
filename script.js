
const eventos = [];
const eventosUrl = 'https://6acffa5d03feaa52b21efe53.mockapi.io/api/v1/eventos';

const contenedorEventos = document.querySelector('.events-container');

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

const crearTarjeta = (evento) => {
  const tarjeta = document.createElement('article');
  tarjeta.className = 'card';
  tarjeta.dataset.id = evento.id;

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

  const boton = document.createElement('button');
  boton.className = 'btn btn--accent';
  boton.textContent = 'Comprar Ticket';

  acciones.append(precio, boton);
  tarjeta.append(acciones);
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
  @param {string} tipo - Tipo de mensaje (success, error, warning)
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


const obtenerEventos = async () => {
  try {
    mostrarMensaje('Cargando eventos...', 'cargando');
    const response = await fetch(eventosUrl);
    const data = await response.json();
    if(data.length === 0) {
      mostrarMensaje('No se encontraron eventos', 'error');
      return;
    }
    eventos.push(...data);
    renderizarEventos();
  } catch (error) {
    console.error('Error al obtener los eventos:', error);
    mostrarMensaje('Error al cargar los eventos, por favor intente de nuevo más tarde', 'error');
  }
}

obtenerEventos();














