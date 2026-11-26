//clave unica para favoritos
const STORAGE_KEY = 'juegos_favoritos';

//funcion para obtener los juegos favoritos del localStorage
export function obtenerFavoritos() {
    const favoritos = localStorage.getItem(STORAGE_KEY);
    return favoritos ? JSON.parse(favoritos) : [];
}

//verifica si un juego esta en favoritos
export function esFavorito(gameID) {
    const favoritos = obtenerFavoritos();
    return favoritos.some(juego => juego.gameID === gameID);
}

//añadir o eliminar un juego de favoritos
export function alternarFavorito(juego) {
    let favoritos = obtenerFavoritos();
    const existe = favoritos.some(fav => fav.gameID === juego.gameID);

    if (existe) {
        //eliminar de favoritos
        favoritos = favoritos.filter(fav => fav.gameID !== juego.gameID);
    } else {
        //añadir a favoritos
        favoritos.push(juego);
    }

    //actualizar el localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favoritos));

    return !existe; //retorna true si se añadió, false si se eliminó
}

//eliminar juego por id
export function eliminarFavorito(gameID) {
    let favoritos = obtenerFavoritos();
    favoritos = favoritos.filter(fav => fav.gameID !== gameID);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favoritos));
}