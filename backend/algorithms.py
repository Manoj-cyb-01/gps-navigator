"""
GPS Navigator - Algorithm Implementations
Dijkstra's Algorithm (Priority Queue / Min Heap)
Bellman-Ford Algorithm
"""

import heapq
import time
import math
from typing import Dict, List, Tuple, Optional


class Graph:
    """Weighted directed/undirected graph representation using adjacency list."""

    def __init__(self):
        self.adjacency_list: Dict[str, List[Tuple[str, float]]] = {}
        self.nodes: Dict[str, dict] = {}
        self.edges: List[dict] = []

    def add_node(self, node_id: str, label: str = None, x: float = 0, y: float = 0):
        """Add a node to the graph."""
        if node_id not in self.adjacency_list:
            self.adjacency_list[node_id] = []
        self.nodes[node_id] = {
            "id": node_id,
            "label": label or node_id,
            "x": x,
            "y": y,
        }

    def add_edge(self, from_node: str, to_node: str, weight: float, directed: bool = False):
        """Add an edge (road) between two nodes."""
        # Ensure nodes exist
        if from_node not in self.adjacency_list:
            self.adjacency_list[from_node] = []
        if to_node not in self.adjacency_list:
            self.adjacency_list[to_node] = []

        self.adjacency_list[from_node].append((to_node, weight))
        if not directed:
            self.adjacency_list[to_node].append((from_node, weight))

        self.edges.append({
            "from": from_node,
            "to": to_node,
            "weight": weight,
            "directed": directed
        })

    def get_all_nodes(self) -> List[str]:
        return list(self.adjacency_list.keys())

    def get_neighbors(self, node: str) -> List[Tuple[str, float]]:
        return self.adjacency_list.get(node, [])


class DijkstraResult:
    """Result container for Dijkstra's algorithm."""

    def __init__(self):
        self.distances: Dict[str, float] = {}
        self.previous: Dict[str, Optional[str]] = {}
        self.visited_order: List[str] = []
        self.path: List[str] = []
        self.total_distance: float = float('inf')
        self.execution_time_ms: float = 0
        self.iterations: int = 0
        self.nodes_relaxed: int = 0


class BellmanFordResult:
    """Result container for Bellman-Ford algorithm."""

    def __init__(self):
        self.distances: Dict[str, float] = {}
        self.previous: Dict[str, Optional[str]] = {}
        self.path: List[str] = []
        self.total_distance: float = float('inf')
        self.execution_time_ms: float = 0
        self.iterations: int = 0
        self.has_negative_cycle: bool = False
        self.edges_relaxed: int = 0


def dijkstra(graph: Graph, source: str, target: str = None) -> DijkstraResult:
    """
    Dijkstra's Shortest Path Algorithm using Priority Queue (Min Heap).

    Time Complexity:  O((V + E) log V)  with binary heap
    Space Complexity: O(V)

    Args:
        graph:  The weighted graph
        source: Starting node
        target: Destination node (optional; compute all if None)

    Returns:
        DijkstraResult with distances, path, visited order
    """
    result = DijkstraResult()
    start_time = time.perf_counter()

    nodes = graph.get_all_nodes()
    INF = float('inf')

    # Initialize distances
    distances = {node: INF for node in nodes}
    previous = {node: None for node in nodes}
    distances[source] = 0

    # Min-heap: (distance, node)
    priority_queue = [(0, source)]
    visited = set()
    visited_order = []

    while priority_queue:
        current_dist, current_node = heapq.heappop(priority_queue)
        result.iterations += 1

        # Skip if already visited (stale entry)
        if current_node in visited:
            continue

        visited.add(current_node)
        visited_order.append(current_node)

        # Early termination if target reached
        if target and current_node == target:
            break

        # Relax neighbors
        for neighbor, weight in graph.get_neighbors(current_node):
            if neighbor not in visited:
                new_dist = current_dist + weight
                if new_dist < distances[neighbor]:
                    distances[neighbor] = new_dist
                    previous[neighbor] = current_node
                    heapq.heappush(priority_queue, (new_dist, neighbor))
                    result.nodes_relaxed += 1

    end_time = time.perf_counter()
    result.execution_time_ms = (end_time - start_time) * 1000

    result.distances = distances
    result.previous = previous
    result.visited_order = visited_order

    # Reconstruct path to target
    if target and distances[target] != INF:
        result.path = _reconstruct_path(previous, source, target)
        result.total_distance = distances[target]
    elif target:
        result.path = []
        result.total_distance = INF

    return result


def bellman_ford(graph: Graph, source: str, target: str = None) -> BellmanFordResult:
    """
    Bellman-Ford Algorithm for Shortest Paths.

    Time Complexity:  O(V × E)
    Space Complexity: O(V)

    Handles negative edge weights and detects negative cycles.

    Args:
        graph:  The weighted graph
        source: Starting node
        target: Destination node (optional)

    Returns:
        BellmanFordResult with distances, path, negative cycle detection
    """
    result = BellmanFordResult()
    start_time = time.perf_counter()

    nodes = graph.get_all_nodes()
    INF = float('inf')
    V = len(nodes)

    # Build flat edge list for iteration
    edge_list = []
    for from_node, neighbors in graph.adjacency_list.items():
        for to_node, weight in neighbors:
            edge_list.append((from_node, to_node, weight))

    # Initialize distances
    distances = {node: INF for node in nodes}
    previous = {node: None for node in nodes}
    distances[source] = 0

    # Relax edges V-1 times
    for i in range(V - 1):
        result.iterations += 1
        updated = False
        for from_node, to_node, weight in edge_list:
            if distances[from_node] != INF and distances[from_node] + weight < distances[to_node]:
                distances[to_node] = distances[from_node] + weight
                previous[to_node] = from_node
                updated = True
                result.edges_relaxed += 1
        if not updated:
            break  # Early termination if no updates

    # Check for negative cycles (V-th relaxation)
    for from_node, to_node, weight in edge_list:
        if distances[from_node] != INF and distances[from_node] + weight < distances[to_node]:
            result.has_negative_cycle = True
            break

    end_time = time.perf_counter()
    result.execution_time_ms = (end_time - start_time) * 1000

    result.distances = distances
    result.previous = previous

    # Reconstruct path to target
    if target and distances.get(target, INF) != INF:
        result.path = _reconstruct_path(previous, source, target)
        result.total_distance = distances[target]
    elif target:
        result.path = []
        result.total_distance = INF

    return result


def _reconstruct_path(previous: Dict, source: str, target: str) -> List[str]:
    """Reconstruct shortest path from previous-node dictionary."""
    path = []
    current = target
    while current is not None:
        path.append(current)
        current = previous[current]
        if current == source:
            path.append(source)
            break
    return list(reversed(path))


def build_graph_from_data(nodes_data: List[dict], edges_data: List[dict]) -> Graph:
    """Build a Graph object from API request data."""
    graph = Graph()

    for node in nodes_data:
        graph.add_node(
            node_id=node["id"],
            label=node.get("label", node["id"]),
            x=node.get("x", 0),
            y=node.get("y", 0),
        )

    for edge in edges_data:
        graph.add_edge(
            from_node=edge["from"],
            to_node=edge["to"],
            weight=float(edge["weight"]),
            directed=edge.get("directed", False),
        )

    return graph


def get_sample_city_graph() -> dict:
    """
    Sample city map with 12 nodes representing a realistic city layout.
    Distances in kilometers.
    """
    nodes = [
        {"id": "A", "label": "City Center",     "x": 400, "y": 300},
        {"id": "B", "label": "North Station",   "x": 400, "y": 100},
        {"id": "C", "label": "East Mall",        "x": 620, "y": 200},
        {"id": "D", "label": "West Park",        "x": 180, "y": 200},
        {"id": "E", "label": "South Harbor",     "x": 400, "y": 500},
        {"id": "F", "label": "Airport",          "x": 700, "y": 400},
        {"id": "G", "label": "University",       "x": 200, "y": 420},
        {"id": "H", "label": "Tech Hub",         "x": 580, "y": 350},
        {"id": "I", "label": "Old Town",         "x": 280, "y": 150},
        {"id": "J", "label": "Stadium",          "x": 550, "y": 480},
        {"id": "K", "label": "Hospital",         "x": 160, "y": 340},
        {"id": "L", "label": "Beach Resort",     "x": 640, "y": 530},
    ]

    edges = [
        {"from": "A", "to": "B", "weight": 5},
        {"from": "A", "to": "C", "weight": 8},
        {"from": "A", "to": "D", "weight": 6},
        {"from": "A", "to": "E", "weight": 7},
        {"from": "A", "to": "H", "weight": 9},
        {"from": "B", "to": "C", "weight": 6},
        {"from": "B", "to": "I", "weight": 4},
        {"from": "C", "to": "F", "weight": 5},
        {"from": "C", "to": "H", "weight": 4},
        {"from": "D", "to": "I", "weight": 3},
        {"from": "D", "to": "K", "weight": 5},
        {"from": "D", "to": "G", "weight": 7},
        {"from": "E", "to": "G", "weight": 6},
        {"from": "E", "to": "J", "weight": 5},
        {"from": "F", "to": "H", "weight": 3},
        {"from": "F", "to": "L", "weight": 4},
        {"from": "G", "to": "K", "weight": 4},
        {"from": "H", "to": "J", "weight": 6},
        {"from": "I", "to": "A", "weight": 7},
        {"from": "J", "to": "L", "weight": 3},
        {"from": "K", "to": "E", "weight": 8},
    ]

    return {"nodes": nodes, "edges": edges}
