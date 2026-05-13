# 🗺️ GPS Navigator — Dijkstra's Shortest Path

A professional full-stack navigation system implementing Dijkstra's and Bellman-Ford algorithms with an interactive city map visualizer.

---

## 📸 Overview

GPS Navigator is a mini GPS/map navigation system where users can define a city map as a weighted graph, select source and destination nodes, and find the shortest path with visual route highlighting. It includes a side-by-side algorithm comparison with performance charts.

---

## ✨ Features

| Feature | Description |
|---|---|
| **Interactive Graph Editor** | Add/remove nodes (intersections) and weighted edges (roads) dynamically |
| **Cytoscape.js Visualization** | Drag nodes, zoom, pan, and see highlighted routes |
| **Dijkstra's Algorithm** | Priority Queue / Min Heap implementation — O((V+E) log V) |
| **Bellman-Ford Algorithm** | Full V×E relaxation with negative cycle detection |
| **Algorithm Comparison** | Side-by-side timing, iteration count, radar & bar charts |
| **Distance Table** | Full shortest-distance table from source to all nodes |
| **Sample City Map** | 12-node preloaded city with realistic distances |
| **Export/Import** | Save and load graph data as JSON |
| **Toast Notifications** | Real-time status feedback |
| **Responsive Design** | Works on desktop and tablet |

---

## 🛠 Tech Stack

**Frontend**
- React 18 + Vite
- Tailwind CSS (utility-first styling)
- Framer Motion (animations)
- React Icons
- Cytoscape.js (graph visualization)
- Recharts (comparison charts)
- Axios (API calls)

**Backend**
- Python 3.10+
- Flask 3 (REST API)
- Flask-CORS (cross-origin support)

**Algorithms**
- Dijkstra — `heapq` priority queue (Min Heap)
- Bellman-Ford — edge relaxation with negative cycle detection

---

## 📁 Project Structure

```
gps-navigator/
├── backend/
│   ├── app.py              # Flask REST API (6 endpoints)
│   ├── algorithms.py       # Dijkstra + Bellman-Ford implementations
│   └── requirements.txt    # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx          # Top nav + backend status
│   │   │   ├── GraphCanvas.jsx     # Cytoscape.js interactive map
│   │   │   ├── GraphEditor.jsx     # Node/edge CRUD panel
│   │   │   ├── RouteFinder.jsx     # Source/target selector + run buttons
│   │   │   ├── DistanceTable.jsx   # Shortest distance table
│   │   │   ├── ComparisonPanel.jsx # Algorithm comparison + charts
│   │   │   ├── StatsBar.jsx        # Overview metrics strip
│   │   │   └── Toast.jsx           # Notification system
│   │   ├── utils/
│   │   │   ├── api.js              # Axios API service
│   │   │   └── data.js             # Sample data + helpers
│   │   ├── App.jsx                 # Main layout + state orchestration
│   │   ├── main.jsx                # React entry point
│   │   └── index.css               # Global styles + Tailwind
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── assets/                 # Static assets
├── screenshots/            # App screenshots
└── README.md
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js 18+
- Python 3.10+
- npm or yarn

### 1. Clone / Extract

```bash
unzip gps-navigator.zip
cd gps-navigator
```

### 2. Backend Setup

```bash
cd backend
pip install -r requirements.txt
python app.py
# ✓ API running at http://localhost:5000
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
# ✓ App running at http://localhost:3000
```

Open **http://localhost:3000** in your browser.

---

## 🚀 Running the Project

| Command | Purpose |
|---|---|
| `python backend/app.py` | Start Flask API on port 5000 |
| `cd frontend && npm run dev` | Start Vite dev server on port 3000 |
| `cd frontend && npm run build` | Build for production |

> **Note:** The frontend proxies `/api/*` requests to `http://localhost:5000` via Vite's dev proxy. For production, set `VITE_API_URL` environment variable.

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/sample-graph` | Get preloaded city graph |
| POST | `/api/dijkstra` | Run Dijkstra's algorithm |
| POST | `/api/bellman-ford` | Run Bellman-Ford algorithm |
| POST | `/api/compare` | Compare both algorithms |
| POST | `/api/validate-graph` | Validate graph connectivity |

### Example Request

```json
POST /api/dijkstra
{
  "nodes": [{"id": "A", "label": "City Center", "x": 400, "y": 300}],
  "edges": [{"from": "A", "to": "B", "weight": 5}],
  "source": "A",
  "target": "B"
}
```

---

## 🧮 Algorithms

### Dijkstra's Algorithm

**Approach:** Greedy, uses a Min Heap (priority queue) to always process the nearest unvisited node.

```
Time Complexity:  O((V + E) log V)
Space Complexity: O(V)
```

**Pseudocode:**
```
dist[source] = 0, all others = ∞
heap = [(0, source)]
while heap not empty:
    d, u = heappop(heap)
    if u visited: skip
    mark u visited
    for each neighbor v with weight w:
        if dist[u] + w < dist[v]:
            dist[v] = dist[u] + w
            heappush(heap, (dist[v], v))
```

**Limitations:** Does not handle negative edge weights.

---

### Bellman-Ford Algorithm

**Approach:** Dynamic programming — relaxes all edges V-1 times. Detects negative cycles on the Vth pass.

```
Time Complexity:  O(V × E)
Space Complexity: O(V)
```

**Pseudocode:**
```
dist[source] = 0, all others = ∞
repeat V-1 times:
    for each edge (u, v, w):
        if dist[u] + w < dist[v]:
            dist[v] = dist[u] + w
# V-th pass: check for negative cycles
```

**Advantages over Dijkstra:** Handles negative edge weights and detects negative cycles.

---

## 🗺️ Sample City Graph

The preloaded map contains **12 nodes** representing a realistic city:

| Node | Location |
|---|---|
| A | City Center |
| B | North Station |
| C | East Mall |
| D | West Park |
| E | South Harbor |
| F | Airport |
| G | University |
| H | Tech Hub |
| I | Old Town |
| J | Stadium |
| K | Hospital |
| L | Beach Resort |

21 roads connect these locations. Shortest path A→F is **12 km** via A→H→F.

---

## 🎨 UI Design

- **Theme:** Light, clean navigation dashboard
- **Typography:** DM Sans (display) + Outfit (body) + JetBrains Mono (code)
- **Color palette:** Sky blue accents, mint green highlights, amber path color
- **Effects:** Glassmorphism cards, soft shadows, Framer Motion transitions
- **Graph:** Cytoscape.js with color-coded nodes (green = source, red = target, amber = path, purple = visited)

---

## 🔮 Future Improvements

- [ ] Real OpenStreetMap tile layer integration
- [ ] Turn-by-turn directions with road names
- [ ] A* algorithm implementation
- [ ] Traffic weight simulation (time-of-day multipliers)
- [ ] Multi-waypoint routing
- [ ] Path animation step-by-step replay
- [ ] Dark mode theme
- [ ] GraphQL API option
- [ ] WebSocket live collaboration
- [ ] Import from GeoJSON/OSRM format

---

## 👥 Contributors

| Role | Name |
|---|---|
| Full-Stack Development | GPS Navigator Team |
| Algorithm Design | Computer Science Dept. |
| UI/UX Design | Design Team |

---

## 📄 License


---

*Built with ❤️ using React, Flask, and Dijkstra's genius.*
