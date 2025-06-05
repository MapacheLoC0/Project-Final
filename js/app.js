/**
 * Archivo principal de la aplicación MoviSimple
 * Integra la autenticación, el grafo y la animación
 */

// Instancias globales
let graph = new GraphSimple();
let visualizer = new GraphVisualizer('graph-canvas', graph);

// Elementos DOM para la interfaz principal
const originSelect = document.getElementById('origin-select');
const destinationSelect = document.getElementById('destination-select');
const calculateRouteBtn = document.getElementById('calculate-route-btn');
const routeInfo = document.getElementById('route-info');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');
const routeResults = document.getElementById('route-results');
const totalTimeDisplay = document.getElementById('total-time');
const totalCostDisplay = document.getElementById('total-cost');
const newRouteBtn = document.getElementById('new-route-btn');

// Eventos para los selectores de origen y destino
originSelect.addEventListener('change', function() {
    const origin = this.value;
    const destination = destinationSelect.value;
    
    visualizer.setOriginAndDestination(origin, destination);
});

destinationSelect.addEventListener('change', function() {
    const origin = originSelect.value;
    const destination = this.value;
    
    visualizer.setOriginAndDestination(origin, destination);
});

// Evento para el botón de calcular ruta
calculateRouteBtn.addEventListener('click', function() {
    const origin = parseInt(originSelect.value);
    const destination = parseInt(destinationSelect.value);
    
    // Validar que se hayan seleccionado origen y destino
    if (isNaN(origin) || isNaN(destination)) {
        showMessage('Debes seleccionar un origen y un destino', true, document.querySelector('.route-section'));
        return;
    }
    
    // Validar que origen y destino sean diferentes
    if (origin === destination) {
        showMessage('El origen y el destino deben ser diferentes', true, document.querySelector('.route-section'));
        return;
    }
    
    // Calcular la ruta
    const { path, totalTime } = graph.getPath(origin, destination);
    
    // Verificar si existe una ruta
    if (totalTime === Infinity) {
        showMessage('No existe una ruta entre los nodos seleccionados', true, document.querySelector('.route-section'));
        return;
    }
    
    // Mostrar la ruta en el visualizador
    visualizer.setPath(path);
    
    // Mostrar información de la ruta
    routeInfo.classList.remove('hidden');
    
    // Iniciar animación
    animateRoute(path, totalTime);
});

// Evento para el botón de nueva ruta
newRouteBtn.addEventListener('click', function() {
    // Limpiar selecciones
    originSelect.value = '';
    destinationSelect.value = '';
    
    // Ocultar información de ruta
    routeInfo.classList.add('hidden');
    routeResults.classList.add('hidden');
    
    // Reiniciar progreso
    progressFill.style.width = '0%';
    progressText.textContent = '0%';
    
    // Limpiar visualizador
    visualizer.clear();
});

// Función para animar la ruta
function animateRoute(path, totalTime) {
    // Ocultar resultados durante la animación
    routeResults.classList.add('hidden');
    
    // Reiniciar progreso
    progressFill.style.width = '0%';
    progressText.textContent = '0%';
    
    // Obtener las aristas de la ruta
    const pathEdges = graph.getPathEdges(path);
    
    // Tiempo transcurrido
    let elapsedTime = 0;
    
    // Duración de la animación (en milisegundos)
    // Usamos un factor de escala para que la animación no sea muy larga
    const scaleFactor = 0.3; // Ajustar según necesidad
    const animationDuration = totalTime * 1000 * scaleFactor;
    
    // Tiempo de inicio
    const startTime = Date.now();
    
    // Función de animación
    function animate() {
        // Calcular tiempo transcurrido
        const currentTime = Date.now();
        elapsedTime = currentTime - startTime;
        
        // Calcular progreso (0 a 1)
        const progress = Math.min(elapsedTime / animationDuration, 1);
        
        // Actualizar barra de progreso
        progressFill.style.width = `${progress * 100}%`;
        progressText.textContent = `${Math.round(progress * 100)}%`;
        
        // Si la animación no ha terminado, continuar
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // Mostrar resultados al finalizar
            showResults(totalTime);
        }
    }
    
    // Iniciar animación
    requestAnimationFrame(animate);
}

// Función para mostrar resultados
function showResults(totalTime) {
    // Calcular costo
    const cost = totalTime * RATE_PER_SECOND;
    
    // Actualizar displays
    totalTimeDisplay.textContent = totalTime;
    totalCostDisplay.textContent = cost.toFixed(2);
    
    // Mostrar resultados
    routeResults.classList.remove('hidden');
}

// Inicializar visualizador al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    // Dibujar el grafo inicial
    visualizer.draw();
    
    // Añadir explicación del algoritmo Dijkstra para fines educativos
    const graphSection = document.querySelector('.graph-section');
    const dijkstraExplanation = document.createElement('div');
    dijkstraExplanation.className = 'dijkstra-explanation';
    dijkstraExplanation.innerHTML = `
        <h3>Algoritmo de Dijkstra</h3>
        <p>El algoritmo de Dijkstra es un algoritmo para encontrar el camino más corto entre nodos en un grafo con pesos no negativos.</p>
        <p>Pasos del algoritmo:</p>
        <ol>
            <li>Inicializar distancias de todos los nodos a infinito, excepto el nodo origen (distancia = 0)</li>
            <li>Marcar todos los nodos como no visitados</li>
            <li>Mientras haya nodos no visitados:</li>
            <li class="sub-item">Seleccionar el nodo no visitado con menor distancia</li>
            <li class="sub-item">Marcar el nodo como visitado</li>
            <li class="sub-item">Para cada vecino no visitado, calcular nueva distancia y actualizar si es menor</li>
        </ol>
    `;
    
    // Añadir estilos para la explicación
    const style = document.createElement('style');
    style.textContent = `
        .dijkstra-explanation {
            margin-top: 20px;
            padding: 15px;
            background-color: rgba(160, 196, 255, 0.2);
            border-radius: 5px;
            border-left: 4px solid var(--primary-blue);
        }
        .dijkstra-explanation h3 {
            margin-bottom: 10px;
            color: var(--text-color);
        }
        .dijkstra-explanation p {
            margin-bottom: 10px;
        }
        .dijkstra-explanation ol {
            padding-left: 20px;
        }
        .dijkstra-explanation li {
            margin-bottom: 5px;
        }
        .sub-item {
            margin-left: 20px;
        }
    `;
    document.head.appendChild(style);
    
    // Añadir la explicación después del canvas
    graphSection.appendChild(dijkstraExplanation);
});
