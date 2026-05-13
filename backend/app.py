"""
GPS Navigator - Flask Backend API
Dijkstra's Shortest Path Navigator
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from algorithms import (
    dijkstra, bellman_ford,
    build_graph_from_data,
    get_sample_city_graph,
    DijkstraResult, BellmanFordResult,
)
import traceback

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})


# ─────────────────────────────────────────────
#  Helper serialisers
# ─────────────────────────────────────────────

def _dijkstra_to_dict(result: DijkstraResult, nodes: list) -> dict:
    node_ids = [n["id"] for n in nodes]
    distance_table = []
    for nid in node_ids:
        dist = result.distances.get(nid, float('inf'))
        distance_table.append({
            "node": nid,
            "label": next((n.get("label", nid) for n in nodes if n["id"] == nid), nid),
            "distance": dist if dist != float('inf') else None,
            "previous": result.previous.get(nid),
        })
    distance_table.sort(key=lambda x: (x["distance"] is None, x["distance"] or 0))

    return {
        "path": result.path,
        "totalDistance": result.total_distance if result.total_distance != float('inf') else None,
        "visitedOrder": result.visited_order,
        "distanceTable": distance_table,
        "executionTimeMs": round(result.execution_time_ms, 4),
        "iterations": result.iterations,
        "nodesRelaxed": result.nodes_relaxed,
        "complexity": {
            "time": "O((V + E) log V)",
            "space": "O(V)",
        },
    }


def _bellman_to_dict(result: BellmanFordResult, nodes: list) -> dict:
    node_ids = [n["id"] for n in nodes]
    distance_table = []
    for nid in node_ids:
        dist = result.distances.get(nid, float('inf'))
        distance_table.append({
            "node": nid,
            "label": next((n.get("label", nid) for n in nodes if n["id"] == nid), nid),
            "distance": dist if dist != float('inf') else None,
            "previous": result.previous.get(nid),
        })
    distance_table.sort(key=lambda x: (x["distance"] is None, x["distance"] or 0))

    return {
        "path": result.path,
        "totalDistance": result.total_distance if result.total_distance != float('inf') else None,
        "distanceTable": distance_table,
        "executionTimeMs": round(result.execution_time_ms, 4),
        "iterations": result.iterations,
        "edgesRelaxed": result.edges_relaxed,
        "hasNegativeCycle": result.has_negative_cycle,
        "complexity": {
            "time": "O(V × E)",
            "space": "O(V)",
        },
    }


# ─────────────────────────────────────────────
#  Routes
# ─────────────────────────────────────────────

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "message": "GPS Navigator API is running"})


@app.route("/api/sample-graph", methods=["GET"])
def sample_graph():
    """Return the preloaded sample city graph."""
    return jsonify(get_sample_city_graph())


@app.route("/api/dijkstra", methods=["POST"])
def run_dijkstra():
    """
    Run Dijkstra's algorithm.

    Body:
    {
      "nodes": [...],
      "edges": [...],
      "source": "A",
      "target": "F"
    }
    """
    try:
        data = request.get_json(force=True)
        nodes = data.get("nodes", [])
        edges = data.get("edges", [])
        source = data.get("source")
        target = data.get("target")

        if not source:
            return jsonify({"error": "source node is required"}), 400

        graph = build_graph_from_data(nodes, edges)

        if source not in graph.adjacency_list:
            return jsonify({"error": f"Source node '{source}' not found in graph"}), 400

        result = dijkstra(graph, source, target)
        return jsonify(_dijkstra_to_dict(result, nodes))

    except Exception as exc:
        traceback.print_exc()
        return jsonify({"error": str(exc)}), 500


@app.route("/api/bellman-ford", methods=["POST"])
def run_bellman_ford():
    """
    Run Bellman-Ford algorithm.

    Body:
    {
      "nodes": [...],
      "edges": [...],
      "source": "A",
      "target": "F"
    }
    """
    try:
        data = request.get_json(force=True)
        nodes = data.get("nodes", [])
        edges = data.get("edges", [])
        source = data.get("source")
        target = data.get("target")

        if not source:
            return jsonify({"error": "source node is required"}), 400

        graph = build_graph_from_data(nodes, edges)

        if source not in graph.adjacency_list:
            return jsonify({"error": f"Source node '{source}' not found in graph"}), 400

        result = bellman_ford(graph, source, target)
        return jsonify(_bellman_to_dict(result, nodes))

    except Exception as exc:
        traceback.print_exc()
        return jsonify({"error": str(exc)}), 500


@app.route("/api/compare", methods=["POST"])
def compare_algorithms():
    """
    Run both algorithms and return a side-by-side comparison.

    Body:
    {
      "nodes": [...],
      "edges": [...],
      "source": "A",
      "target": "F"
    }
    """
    try:
        data = request.get_json(force=True)
        nodes = data.get("nodes", [])
        edges = data.get("edges", [])
        source = data.get("source")
        target = data.get("target")

        if not source:
            return jsonify({"error": "source node is required"}), 400

        graph = build_graph_from_data(nodes, edges)

        if source not in graph.adjacency_list:
            return jsonify({"error": f"Source node '{source}' not found in graph"}), 400

        d_result = dijkstra(graph, source, target)
        b_result = bellman_ford(graph, source, target)

        V = len(nodes)
        E = len(edges) * 2  # undirected edges count twice

        return jsonify({
            "graphInfo": {"V": V, "E": E},
            "dijkstra": _dijkstra_to_dict(d_result, nodes),
            "bellmanFord": _bellman_to_dict(b_result, nodes),
            "verdict": {
                "fasterAlgorithm": (
                    "Dijkstra" if d_result.execution_time_ms <= b_result.execution_time_ms
                    else "Bellman-Ford"
                ),
                "speedupFactor": round(
                    b_result.execution_time_ms / max(d_result.execution_time_ms, 0.001), 2
                ),
                "pathMatch": d_result.path == b_result.path,
                "distanceMatch": d_result.total_distance == b_result.total_distance,
            },
        })

    except Exception as exc:
        traceback.print_exc()
        return jsonify({"error": str(exc)}), 500


@app.route("/api/validate-graph", methods=["POST"])
def validate_graph():
    """Validate a graph and return basic statistics."""
    try:
        data = request.get_json(force=True)
        nodes = data.get("nodes", [])
        edges = data.get("edges", [])

        graph = build_graph_from_data(nodes, edges)
        all_nodes = graph.get_all_nodes()

        # Connectivity check via BFS
        if not all_nodes:
            return jsonify({"valid": False, "error": "Graph has no nodes"})

        start = all_nodes[0]
        visited = {start}
        queue = [start]
        while queue:
            cur = queue.pop()
            for neighbor, _ in graph.get_neighbors(cur):
                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append(neighbor)

        is_connected = len(visited) == len(all_nodes)
        total_weight = sum(e["weight"] for e in edges)

        return jsonify({
            "valid": True,
            "nodeCount": len(nodes),
            "edgeCount": len(edges),
            "isConnected": is_connected,
            "totalWeight": total_weight,
            "avgWeight": round(total_weight / len(edges), 2) if edges else 0,
        })

    except Exception as exc:
        return jsonify({"valid": False, "error": str(exc)}), 500


# ─────────────────────────────────────────────
#  Entry point
# ─────────────────────────────────────────────

if __name__ == "__main__":
    print("🗺️  GPS Navigator API starting on http://localhost:5000")
    app.run(debug=True, host="0.0.0.0", port=5000)


    @app.route("/")
    def home():
        return {
            "message": "GPS Navigator API Running Successfully"
        }
