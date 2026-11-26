import { obtenerOfertas } from "../services/apiServices.js"
import { obtenerTiendas } from "../services/apiServices.js"
import { obtenerFavoritos } from "../utils/storage.js"
import { esFavorito } from "../utils/storage.js"
import { alternarFavorito } from "../utils/storage.js"

let todasLasOfertas = [];
let mapaTiendas = {};

//referencias a los id
const loader = document.getElementById('loader');
const errorBox = document.getElementById('error-message');
const tablaContenedor = document.getElementById('despliegue-tabla');
const tbody = document.getElementById('games-tbody');
const searchInput = document.getElementById('search-input');
const storeSelector = document.getElementById('store-selector');
const contadorFavoritos = document.getElementById('contador-favoritos');

document.addEventListener('DOMContentLoaded', async () => {
    actualizarContador();
    await cargarDatos();

    searchInput.addEventListener('input', filtrarJuegos);
    storeSelector.addEventListener('change', filtrarJuegos);
});

async function cargarDatos() {
    try {
        loader.classList.remove('hidden');
        errorBox.classList.add('hidden');
        tablaContenedor.classList.add('hidden');

        const [ofertas, tiendas] = await Promise.all([obtenerOfertas(), obtenerTiendas()]);
        
        tiendas.forEach(tienda => {
            if (tienda.isActive) {
                mapaTiendas[tienda.storeID] = tienda.storeName;
                const option = document.createElement('option');
                option.value = tienda.storeID;
                option.textContent = tienda.storeName;
                storeSelector.appendChild(option);
            }
        });

        todasLasOfertas = ofertas;
        pintarTabla(todasLasOfertas);
        tablaContenedor.classList.remove('hidden');
    } catch (error) {
        console.error('Error al cargar los datos:', error);
        errorBox.classList.remove('hidden');
    } finally {
        loader.classList.add('hidden');
    }
}

function filtrarJuegos() {
    const texto = searchInput.value.toLowerCase().trim();
    const tienda = storeSelector.value;
    const filtradas = todasLasOfertas.filter(juego => {
        const nombreCoincide = juego.title.toLowerCase().includes(texto);
        const tiendaCoincide = tienda === '' || juego.storeID === tienda;
        return nombreCoincide && tiendaCoincide;
    });
    pintarTabla(filtradas);
}

function pintarTabla(juegos) {
    tbody.innerHTML = '';

    if (juegos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6">No se encontraron juegos.</td></tr>';
        return;
    }

    juegos.forEach(juego => {
        const tienda = mapaTiendas[juego.storeID] || 'Tienda';
        const ahorro = Math.round(parseFloat(juego.savings));
        const nota = juego.metacriticScore > 0 ? `${juego.metacriticScore}/100` : '-';
        const esFav = esFavorito(juego.gameID);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <div class="game-info">
                    <img src="${juego.thumb}" alt="${juego.title}">
                    <strong>${juego.title}</strong>
                </div>
            </td>
            <td>${tienda}</td>
            <td>${nota}</td>
            <td><span class="badge">-${ahorro}%</span></td>
            <td>
                <span class="old-price">$${juego.normalPrice}</span>
                <strong>$${juego.salePrice}</strong>
            </td>
            <td>
                <a href="detalle.html?gameID=${juego.gameID}" class="btn btn-primary">Ver gráfico</a>
                <button class="btn btn-fav ${esFav ? 'active' : ''}" title="Guardar en favoritos">
                    ${esFav ? '★' : '☆'}
                </button>
            </td>
        `;

        const btnFav = tr.querySelector('.btn-fav');
        btnFav.addEventListener('click', () => {
            const añadido = alternarFavorito(juego);
            btnFav.classList.toggle('active', añadido);
            btnFav.textContent = añadido ? '★' : '☆';
            actualizarContador();
        });

        tbody.appendChild(tr);
    });
}

function actualizarContador() {
    const favoritos = obtenerFavoritos();
    contadorFavoritos.textContent = favoritos.length;
}