import { obtenerFavoritos, eliminarFavorito } from "../utils/storage.js";

const contadorFavoritos = document.getElementById('contador-favoritos');
const resumenBox = document.getElementById('resumen-favoritos');
const sinFavoritosBox = document.getElementById('sin-favoritos');
const tablaWrapper = document.getElementById('tabla-favoritos-wrapper');
const tbody = document.getElementById('favoritos-tbody');

const totalJuegosEl = document.getElementById('total-juegos');
const costeTotalEl = document.getElementById('coste-total');
const ahorroTotalEl = document.getElementById('ahorro-total');
const btnVaciar = document.getElementById('btn-vaciar');

document.addEventListener('DOMContentLoaded', () => {
    renderizarFavoritos();

    // Evento para vaciar toda la lista de favoritos
    btnVaciar.addEventListener('click', () => {
        const favoritos = obtenerFavoritos();
        favoritos.forEach(juego => eliminarFavorito(juego.gameID));
        renderizarFavoritos();
    });
});

function renderizarFavoritos() {
    const favoritos = obtenerFavoritos();
    contadorFavoritos.textContent = favoritos.length;

    // Si no hay juegos guardados, mostramos el aviso y ocultamos tabla y resumen
    if (favoritos.length === 0) {
        resumenBox.style.display = 'none';
        tablaWrapper.classList.add('hidden');
        sinFavoritosBox.classList.remove('hidden');
        return;
    }

    sinFavoritosBox.classList.add('hidden');
    resumenBox.style.display = 'flex';
    tablaWrapper.classList.remove('hidden');

    // Cálculo de ahorro de la lista de deseados
    let costeTotal = 0;
    let precioNormalTotal = 0;

    tbody.innerHTML = '';

    favoritos.forEach(juego => {
        const precioOferta = parseFloat(juego.salePrice) || 0;
        const precioNormal = parseFloat(juego.normalPrice) || precioOferta;
        const ahorro = Math.round(parseFloat(juego.savings)) || 0;

        costeTotal += precioOferta;
        precioNormalTotal += precioNormal;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <div class="game-info">
                    <img src="${juego.thumb}" alt="${juego.title}">
                    <strong>${juego.title}</strong>
                </div>
            </td>
            <td>${juego.storeName || 'Tienda'}</td>
            <td><span class="badge">-${ahorro}%</span></td>
            <td>
                <span class="old-price">$${precioNormal.toFixed(2)}</span>
                <strong>$${precioOferta.toFixed(2)}</strong>
            </td>
            <td>
                <a href="detalle.html?gameID=${juego.gameID}" class="btn btn-primary">Ver gráfico</a>
                <button class="btn btn-eliminar" title="Quitar de favoritos">Eliminar</button>
            </td>
        `;

        // Evento para eliminar un juego concreto
        tr.querySelector('.btn-eliminar').addEventListener('click', () => {
            eliminarFavorito(juego.gameID);
            renderizarFavoritos();
        });

        tbody.appendChild(tr);
    });

    const ahorroAcumulado = precioNormalTotal - costeTotal;
    totalJuegosEl.textContent = favoritos.length;
    costeTotalEl.textContent = costeTotal.toFixed(2);
    ahorroTotalEl.textContent = ahorroAcumulado.toFixed(2);
}