//URL API
const BASE_URL = "https://www.cheapshark.com/api/1.0";

//oobtiene listado de juegos
export async function obtenerOfertas() {
    try {
        const respuesta = await fetch(`${BASE_URL}/deals`);
        if (!respuesta.ok) {
            throw new Error(`Error al obtener los juegos: ${respuesta.status} - ${respuesta.statusText}`);
        }
        //datos a json
        const datos = await respuesta.json();
        return datos;
    } catch (error) {
        console.error("Error al obtener los juegos:", error);
        throw error;
    }
}

//obtiene listado de tiendas
export async function obtenerTiendas() {
    try {
        const respuesta = await fetch(`${BASE_URL}/stores`);
        if (!respuesta.ok) {
            throw new Error(`Error al obtener las tiendas: ${respuesta.status} - ${respuesta.statusText}`);
        }
        const tiendas = await respuesta.json();
        return tiendas;
    } catch (error) {
        console.error("Error al obtener las tiendas:", error);
        throw error;
    }
}

//obtiene detalle de un juego en varias tiendas
export async function obtenerDetalleJuego(gameID) {
    try {
        const respuesta = await fetch(`${BASE_URL}/games?id=${gameID}`);
        if (!respuesta.ok) {
            throw new Error(`Error al obtener el detalle del juego: ${respuesta.status} - ${respuesta.statusText}`);
        }
        const detalle = await respuesta.json();
        return detalle;
    } catch (error) {
        console.error("Error al obtener los detallesdel juego:", error);
        throw error;
    }
}