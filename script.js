

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
  for (let evento of eventos) {
    crearTarjeta(evento);
  }
}


renderizarEventos();









