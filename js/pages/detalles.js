import { obtenerDetalleJuego, obtenerTiendas } from "../services/apiServices.js";
import { obtenerFavoritos } from "../utils/storage.js";

let ofertasPorTienda = [];
let precioMinimoHistorico = 0;
let instanciaGrafico = null;

const loader = document.getElementById('loader');
const errorBox = document.getElementById('error-message');
const contenido = document.getElementById('game-details');
const infoJuegoBox = document.getElementById('info-juego');
const contadorFavoritos = document.getElementById('contador-favoritos');

const selectTipoGrafico = document.getElementById('tipo-grafico');
const selectOrdenTiendas = document.getElementById('orden-tiendas');

document.addEventListener('DOMContentLoaded', async () => {
    contadorFavoritos.textContent = obtenerFavoritos().length;

    const params = new URLSearchParams(window.location.search);
    const gameID = params.get('gameID');

    if (!gameID) {
        loader.classList.add('hidden');
        errorBox.classList.remove('hidden');
        return;
    }

    await cargarDetalle(gameID);

    selectTipoGrafico.addEventListener('change', actualizarGrafico);
    selectOrdenTiendas.addEventListener('change', actualizarGrafico);
});

async function cargarDetalle(gameID) {
    try {
        loader.classList.remove('hidden');
        errorBox.classList.add('hidden');

        const [detalle, tiendas] = await Promise.all([
            obtenerDetalleJuego(gameID),
            obtenerTiendas()
        ]);

        const mapaTiendas = {};
        tiendas.forEach(tienda => {
            mapaTiendas[tienda.storeID] = tienda.storeName;
        });

        precioMinimoHistorico = parseFloat(detalle.cheapestPriceEver.price);
        const fechaMinimo = new Date(detalle.cheapestPriceEver.date * 1000).toLocaleDateString('es-ES');

        ofertasPorTienda = detalle.deals.map(deal => ({
            tienda: mapaTiendas[deal.storeID] || `Tienda #${deal.storeID}`,
            precioActual: parseFloat(deal.price),
            precioNormal: parseFloat(deal.retailPrice),
            ahorro: Math.round(parseFloat(deal.savings))
        }));

        infoJuegoBox.innerHTML = `
            <div class="game-info" style="gap: 1.5rem; flex-wrap: wrap;">
                <img src="${detalle.info.thumb}" alt="${detalle.info.title}" style="width: 180px; height: auto;">
                <div>
                    <h1>${detalle.info.title}</h1>
                    <p class="subtitle" style="margin-bottom: 0.5rem;">
                        Disponible actualmente en <strong>${ofertasPorTienda.length} tiendas</strong> digitales.
                    </p>
                    <p>
                        <strong>Precio mínimo histórico:</strong> $${precioMinimoHistorico.toFixed(2)} 
                        <span style="color: #64748b; font-size: 0.9rem;">(registrado el ${fechaMinimo})</span>
                    </p>
                </div>
            </div>
        `;

        contenido.classList.remove('hidden');
        actualizarGrafico();
    } catch (error) {
        console.error("Error al cargar los datos:", error);
        errorBox.classList.remove('hidden');
    } finally {
        loader.classList.add('hidden');
    }
}

function actualizarGrafico() {
    const tipo = selectTipoGrafico.value;
    const orden = selectOrdenTiendas.value;

    const datosOrdenados = [...ofertasPorTienda].sort((a, b) => {
        if (orden === 'precio_asc') return a.precioActual - b.precioActual;
        if (orden === 'precio_desc') return b.precioActual - a.precioActual;
        return a.tienda.localeCompare(b.tienda);
    });

    const etiquetas = datosOrdenados.map(item => item.tienda);
    const preciosActuales = datosOrdenados.map(item => item.precioActual);
    const lineaMinimoHistorico = datosOrdenados.map(() => precioMinimoHistorico);

    const ctx = document.getElementById('price-chart').getContext('2d');

    if (instanciaGrafico) {
        instanciaGrafico.destroy();
    }

    instanciaGrafico = new Chart(ctx, {
        type: tipo,
        data: {
            labels: etiquetas,
            datasets: [
                {
                    label: 'Precio actual ($)',
                    data: preciosActuales,
                    backgroundColor: 'rgba(37, 99, 235, 0.7)',
                    borderColor: '#2563eb',
                    borderWidth: 2
                },
                {
                    label: 'Mínimo histórico ($)',
                    data: lineaMinimoHistorico,
                    type: 'line',
                    borderColor: '#16a34a',
                    backgroundColor: 'rgba(22, 163, 74, 0.15)',
                    borderDash: [5, 5],
                    borderWidth: 2,
                    pointRadius: 3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Precio en USD ($)' }
                }
            }
        }
    });
}