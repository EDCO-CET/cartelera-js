/* Taller 2 - Capa de datos.
   Aquí SOLO viven las funciones que hablan con la API: no tocan el DOM.
   script.js las llama y decide qué mostrar. Si mañana cambiamos MockAPI
   por un backend propio, solo se modifica este archivo. */

const API_URL = 'https://your_api_url.mockapi.io/api/v1';

/*
  Hace la petición y devuelve el cuerpo ya convertido a objeto JS.
  fetch NO lanza error con 404 o 500: solo falla si no hay red.
  Por eso revisamos response.ok y lanzamos el error nosotros.
  @param {string} ruta - Ej: '/eventos' o '/eventos/3'
  @param {object} opciones - Las mismas de fetch (method, headers, body)
*/
const pedir = async (ruta, opciones = {}) => {
  const response = await fetch(API_URL + ruta, opciones);
  if (!response.ok) {
    const error = new Error(`La API respondió ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return response.json();
};

/*
  Arma las opciones de un POST o PUT.
  Sin el encabezado Content-Type la API no sabe que el cuerpo es JSON,
  y sin JSON.stringify enviaríamos el texto "[object Object]".
*/
const opcionesJSON = (metodo, datos) => ({
  method: metodo,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(datos),
});

/* ---------------------------- Eventos ---------------------------- */

// GET /eventos  o  GET /eventos?categoria=Música
const obtenerEventos = async (categoria = '') => {
  if (!categoria) {
    return pedir('/eventos');
  }
  // encodeURIComponent: "Música" tiene tilde y no puede ir así en una URL
  const ruta = `/eventos?categoria=${encodeURIComponent(categoria)}`;
  try {
    return await pedir(ruta);
  } catch (error) {
    // Ojo, MockAPI: un filtro sin resultados responde 404 en vez de []
    if (error.status === 404) {
      return [];
    }
    throw error;
  }
};

// GET /eventos/:id
const obtenerEvento = (id) => pedir(`/eventos/${id}`);

// POST /eventos -> devuelve el evento creado, con el id que asignó la API
const crearEvento = (evento) => pedir('/eventos', opcionesJSON('POST', evento));

// PUT /eventos/:id -> devuelve el evento actualizado
const actualizarEvento = (id, evento) => pedir(`/eventos/${id}`, opcionesJSON('PUT', evento));

// DELETE /eventos/:id -> devuelve el evento eliminado
const eliminarEvento = (id) => pedir(`/eventos/${id}`, { method: 'DELETE' });

/* ---------------------------- Pedidos ---------------------------- */

// POST /pedidos -> devuelve el pedido con su id
const crearPedido = (pedido) => pedir('/pedidos', opcionesJSON('POST', pedido));
