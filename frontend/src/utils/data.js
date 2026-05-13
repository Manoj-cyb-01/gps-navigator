// Sample city graph data for the preloaded map
export const SAMPLE_GRAPH = {
  nodes: [
    { id: "A", label: "City Center",   x: 400, y: 300 },
    { id: "B", label: "North Station", x: 400, y: 100 },
    { id: "C", label: "East Mall",     x: 620, y: 200 },
    { id: "D", label: "West Park",     x: 180, y: 200 },
    { id: "E", label: "South Harbor",  x: 400, y: 500 },
    { id: "F", label: "Airport",       x: 700, y: 400 },
    { id: "G", label: "University",    x: 200, y: 420 },
    { id: "H", label: "Tech Hub",      x: 580, y: 350 },
    { id: "I", label: "Old Town",      x: 280, y: 150 },
    { id: "J", label: "Stadium",       x: 550, y: 480 },
    { id: "K", label: "Hospital",      x: 160, y: 340 },
    { id: "L", label: "Beach Resort",  x: 640, y: 530 },
  ],
  edges: [
    { from: "A", to: "B", weight: 5  },
    { from: "A", to: "C", weight: 8  },
    { from: "A", to: "D", weight: 6  },
    { from: "A", to: "E", weight: 7  },
    { from: "A", to: "H", weight: 9  },
    { from: "B", to: "C", weight: 6  },
    { from: "B", to: "I", weight: 4  },
    { from: "C", to: "F", weight: 5  },
    { from: "C", to: "H", weight: 4  },
    { from: "D", to: "I", weight: 3  },
    { from: "D", to: "K", weight: 5  },
    { from: "D", to: "G", weight: 7  },
    { from: "E", to: "G", weight: 6  },
    { from: "E", to: "J", weight: 5  },
    { from: "F", to: "H", weight: 3  },
    { from: "F", to: "L", weight: 4  },
    { from: "G", to: "K", weight: 4  },
    { from: "H", to: "J", weight: 6  },
    { from: "I", to: "A", weight: 7  },
    { from: "J", to: "L", weight: 3  },
    { from: "K", to: "E", weight: 8  },
  ],
};

// API base URL
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Node color palette
export const NODE_COLORS = [
  '#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#f97316', '#ec4899', '#14b8a6', '#6366f1',
  '#84cc16', '#a855f7',
];

// Generate unique node ID
let _nodeCounter = 1;
export const genNodeId = () => {
  const id = `N${_nodeCounter++}`;
  return id;
};

export const resetNodeCounter = (n = 1) => { _nodeCounter = n; };

// Format distance display
export const formatDist = (d) => {
  if (d == null || d === Infinity || d === 'Infinity') return '∞';
  return typeof d === 'number' ? `${d} km` : `${d} km`;
};

// Format time
export const formatTime = (ms) => {
  if (ms < 0.001) return '< 0.001 ms';
  return `${ms.toFixed(3)} ms`;
};
