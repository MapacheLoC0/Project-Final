/**
 * Clase GraphSimple para modelar el grafo de seis nodos
 * Implementa el algoritmo de Dijkstra simple para calcular rutas mínimas
 */
class GraphSimple {
    constructor() {
        // Inicializar grafo con 6 nodos
        this.numNodes = 6;
        this.adjacencyList = Array(this.numNodes).fill().map(() => []);
        
        // Definir posiciones de los nodos para visualización
        this.nodePositions = [
            { x: 150, y: 100 }, // Nodo 0
            { x: 350, y: 80 },  // Nodo 1
            { x: 550, y: 100 }, // Nodo 2
            { x: 150, y: 300 }, // Nodo 3
            { x: 350, y: 320 }, // Nodo 4
            { x: 550, y: 300 }  // Nodo 5
        ];
        
        // Cargar aristas predefinidas
        this.loadEdges();
    }
    
    // Cargar aristas predefinidas (9 aristas para 6 nodos)
    loadEdges() {
        // Formato: [origen, destino, peso en segundos]
        const edges = [
            [0, 1, 5],  // Nodo 0 a Nodo 1, 5 segundos
            [0, 3, 8],  // Nodo 0 a Nodo 3, 8 segundos
            [1, 2, 6],  // Nodo 1 a Nodo 2, 6 segundos
            [1, 4, 9],  // Nodo 1 a Nodo 4, 9 segundos
            [2, 5, 7],  // Nodo 2 a Nodo 5, 7 segundos
            [3, 4, 4],  // Nodo 3 a Nodo 4, 4 segundos
            [3, 0, 8],  // Nodo 3 a Nodo 0, 8 segundos (bidireccional)
            [4, 5, 3],  // Nodo 4 a Nodo 5, 3 segundos
            [5, 2, 7]   // Nodo 5 a Nodo 2, 7 segundos (bidireccional)
        ];
        
        // Agregar aristas al grafo (bidireccionales)
        edges.forEach(([u, v, w]) => {
            this.addEdge(u, v, w);
        });
    }
    
    // Agregar una arista bidireccional al grafo
    addEdge(u, v, weight) {
        this.adjacencyList[u].push({ node: v, weight });
        this.adjacencyList[v].push({ node: u, weight }); // Bidireccional
    }
    
    // Implementación de Dijkstra simple
    dijkstraSimple(source) {
        // Inicializar distancias y predecesores
        const distances = Array(this.numNodes).fill(Infinity);
        const predecessors = Array(this.numNodes).fill(null);
        const visited = Array(this.numNodes).fill(false);
        
        // Distancia al nodo origen es 0
        distances[source] = 0;
        
        // Procesar todos los nodos
        for (let i = 0; i < this.numNodes; i++) {
            // Encontrar el nodo no visitado con la menor distancia
            let minDistance = Infinity;
            let minIndex = -1;
            
            for (let j = 0; j < this.numNodes; j++) {
                if (!visited[j] && distances[j] < minDistance) {
                    minDistance = distances[j];
                    minIndex = j;
                }
            }
            
            // Si no hay más nodos alcanzables, terminar
            if (minIndex === -1) break;
            
            // Marcar como visitado
            visited[minIndex] = true;
            
            // Actualizar distancias a los vecinos
            for (const neighbor of this.adjacencyList[minIndex]) {
                const { node, weight } = neighbor;
                const newDistance = distances[minIndex] + weight;
                
                if (newDistance < distances[node]) {
                    distances[node] = newDistance;
                    predecessors[node] = minIndex;
                }
            }
        }
        
        return { distances, predecessors };
    }
    
    // Reconstruir la ruta desde el origen hasta el destino
    getPath(source, destination) {
        // Calcular distancias y predecesores
        const { distances, predecessors } = this.dijkstraSimple(source);
        
        // Si no hay ruta al destino
        if (distances[destination] === Infinity) {
            return { path: [], totalTime: Infinity };
        }
        
        // Reconstruir la ruta
        const path = [];
        let current = destination;
        
        while (current !== null) {
            path.unshift(current);
            current = predecessors[current];
        }
        
        // Calcular tiempo total
        const totalTime = distances[destination];
        
        return { path, totalTime };
    }
    
    // Obtener las aristas que forman parte de una ruta
    getPathEdges(path) {
        const edges = [];
        
        for (let i = 0; i < path.length - 1; i++) {
            const u = path[i];
            const v = path[i + 1];
            
            // Encontrar el peso de esta arista
            const edge = this.adjacencyList[u].find(e => e.node === v);
            const weight = edge ? edge.weight : 0;
            
            edges.push({ from: u, to: v, weight });
        }
        
        return edges;
    }
}

// Clase para manejar la visualización del grafo
class GraphVisualizer {
    constructor(canvasId, graph) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.graph = graph;
        this.nodeRadius = 25;
        this.selectedOrigin = null;
        this.selectedDestination = null;
        this.currentPath = [];
        this.pathEdges = [];
        
        // Inicializar eventos de clic en el canvas
        this.initEvents();
    }
    
    // Inicializar eventos
    initEvents() {
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Verificar si se hizo clic en algún nodo
            const clickedNode = this.getNodeAtPosition(x, y);
            
            if (clickedNode !== null) {
                this.handleNodeClick(clickedNode);
            }
        });
    }
    
    // Obtener el nodo en una posición específica
    getNodeAtPosition(x, y) {
        for (let i = 0; i < this.graph.nodePositions.length; i++) {
            const node = this.graph.nodePositions[i];
            const distance = Math.sqrt(Math.pow(x - node.x, 2) + Math.pow(y - node.y, 2));
            
            if (distance <= this.nodeRadius) {
                return i;
            }
        }
        
        return null;
    }
    
    // Manejar clic en un nodo
    handleNodeClick(nodeIndex) {
        // Si no hay origen seleccionado, establecerlo
        if (this.selectedOrigin === null) {
            this.selectedOrigin = nodeIndex;
            document.getElementById('origin-select').value = nodeIndex;
            this.draw();
        } 
        // Si no hay destino seleccionado, establecerlo
        else if (this.selectedDestination === null) {
            // No permitir seleccionar el mismo nodo como origen y destino
            if (nodeIndex !== this.selectedOrigin) {
                this.selectedDestination = nodeIndex;
                document.getElementById('destination-select').value = nodeIndex;
                this.draw();
            }
        }
    }
    
    // Establecer origen y destino desde los selectores
    setOriginAndDestination(origin, destination) {
        this.selectedOrigin = origin !== "" ? parseInt(origin) : null;
        this.selectedDestination = destination !== "" ? parseInt(destination) : null;
        this.draw();
    }
    
    // Establecer la ruta actual
    setPath(path) {
        this.currentPath = path;
        this.pathEdges = this.graph.getPathEdges(path);
        this.draw();
    }
    
    // Limpiar selecciones y ruta
    clear() {
        this.selectedOrigin = null;
        this.selectedDestination = null;
        this.currentPath = [];
        this.pathEdges = [];
        this.draw();
    }
    
    // Dibujar el grafo
    draw() {
        // Limpiar canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Dibujar aristas
        this.drawEdges();
        
        // Dibujar nodos
        this.drawNodes();
    }
    
    // Dibujar aristas
    drawEdges() {
        // Dibujar todas las aristas
        for (let i = 0; i < this.graph.numNodes; i++) {
            const neighbors = this.graph.adjacencyList[i];
            
            for (const neighbor of neighbors) {
                // Evitar dibujar aristas duplicadas (bidireccionales)
                if (i < neighbor.node) {
                    const fromPos = this.graph.nodePositions[i];
                    const toPos = this.graph.nodePositions[neighbor.node];
                    
                    // Verificar si esta arista es parte de la ruta
                    const isPathEdge = this.pathEdges.some(
                        edge => (edge.from === i && edge.to === neighbor.node) || 
                               (edge.from === neighbor.node && edge.to === i)
                    );
                    
                    // Establecer estilo según si es parte de la ruta
                    this.ctx.strokeStyle = isPathEdge ? '#fdffb6' : '#d0d0d0';
                    this.ctx.lineWidth = isPathEdge ? 3 : 2;
                    
                    // Dibujar línea
                    this.ctx.beginPath();
                    this.ctx.moveTo(fromPos.x, fromPos.y);
                    this.ctx.lineTo(toPos.x, toPos.y);
                    this.ctx.stroke();
                    
                    // Dibujar peso
                    const midX = (fromPos.x + toPos.x) / 2;
                    const midY = (fromPos.y + toPos.y) / 2;
                    
                    // Fondo para el peso
                    this.ctx.fillStyle = isPathEdge ? 'rgba(253, 255, 182, 0.7)' : 'rgba(255, 255, 255, 0.7)';
                    this.ctx.beginPath();
                    this.ctx.arc(midX, midY - 10, 15, 0, Math.PI * 2);
                    this.ctx.fill();
                    
                    // Texto del peso
                    this.ctx.fillStyle = '#495057';
                    this.ctx.font = 'bold 14px Arial';
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';
                    this.ctx.fillText(neighbor.weight + 's', midX, midY - 10);
                }
            }
        }
    }
    
    // Dibujar nodos
    drawNodes() {
        for (let i = 0; i < this.graph.nodePositions.length; i++) {
            const pos = this.graph.nodePositions[i];
            
            // Determinar color del nodo
            let fillColor = '#a0c4ff'; // Color por defecto (azul pastel)
            
            if (i === this.selectedOrigin) {
                fillColor = '#ffafcc'; // Rosa pastel para origen
            } else if (i === this.selectedDestination) {
                fillColor = '#9bf6ff'; // Azul-verde pastel para destino
            } else if (this.currentPath.includes(i) && 
                      i !== this.selectedOrigin && 
                      i !== this.selectedDestination) {
                fillColor = '#fdffb6'; // Amarillo pastel para nodos en la ruta
            }
            
            // Dibujar sombra
            this.ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
            this.ctx.shadowBlur = 5;
            this.ctx.shadowOffsetX = 2;
            this.ctx.shadowOffsetY = 2;
            
            // Dibujar círculo
            this.ctx.fillStyle = fillColor;
            this.ctx.strokeStyle = '#6c757d';
            this.ctx.lineWidth = 2;
            
            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y, this.nodeRadius, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();
            
            // Resetear sombra
            this.ctx.shadowColor = 'transparent';
            this.ctx.shadowBlur = 0;
            this.ctx.shadowOffsetX = 0;
            this.ctx.shadowOffsetY = 0;
            
            // Dibujar número de nodo
            this.ctx.fillStyle = '#495057';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText((i + 1).toString(), pos.x, pos.y);
        }
    }
}

// Tarifa por segundo (en pesos)
const RATE_PER_SECOND = 0.50;
