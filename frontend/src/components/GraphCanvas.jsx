import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import cytoscape from 'cytoscape';
import { motion } from 'framer-motion';
import { TbZoomIn, TbZoomOut, TbFocus, TbRefresh } from 'react-icons/tb';

/* ─── Cytoscape style sheet ─────────────────────────────────── */
const buildStyle = () => [
  {
    selector: 'node',
    style: {
      'background-color': '#0ea5e9',
      'background-gradient-stop-colors': '#38bdf8 #0284c7',
      'background-gradient-direction': 'to-bottom',
      'border-width': 2.5,
      'border-color': '#fff',
      'border-opacity': 0.9,
      'width': 42,
      'height': 42,
      'label': 'data(label)',
      'color': '#0f172a',
      'font-size': 9,
      'font-family': 'Outfit, sans-serif',
      'font-weight': 600,
      'text-valign': 'bottom',
      'text-halign': 'center',
      'text-margin-y': 4,
      'text-wrap': 'wrap',
      'text-max-width': 60,
      'shadow-blur': 8,
      'shadow-color': 'rgba(14,165,233,0.3)',
      'shadow-offset-x': 0,
      'shadow-offset-y': 3,
      'shadow-opacity': 0.6,
      'overlay-opacity': 0,
    },
  },
  {
    selector: 'node:selected',
    style: {
      'border-color': '#0ea5e9',
      'border-width': 3,
      'background-color': '#0369a1',
    },
  },
  {
    selector: 'node.source',
    style: {
      'background-color': '#16a34a',
      'border-color': '#fff',
      'width': 48,
      'height': 48,
      'font-weight': 700,
      'shadow-color': 'rgba(22,163,74,0.4)',
    },
  },
  {
    selector: 'node.target',
    style: {
      'background-color': '#dc2626',
      'border-color': '#fff',
      'width': 48,
      'height': 48,
      'font-weight': 700,
      'shadow-color': 'rgba(220,38,38,0.4)',
    },
  },
  {
    selector: 'node.visited',
    style: {
      'background-color': '#7c3aed',
      'border-color': '#ede9fe',
      'shadow-color': 'rgba(124,58,237,0.3)',
    },
  },
  {
    selector: 'node.onpath',
    style: {
      'background-color': '#f59e0b',
      'border-color': '#fff',
      'width': 48,
      'height': 48,
      'shadow-color': 'rgba(245,158,11,0.5)',
      'shadow-blur': 12,
    },
  },
  {
    selector: 'edge',
    style: {
      'width': 2,
      'line-color': '#cbd5e1',
      'target-arrow-color': '#cbd5e1',
      'curve-style': 'bezier',
      'label': 'data(label)',
      'font-size': 9,
      'font-family': 'JetBrains Mono, monospace',
      'color': '#64748b',
      'text-background-color': '#f8fafc',
      'text-background-opacity': 0.85,
      'text-background-padding': '2px',
      'text-background-shape': 'roundrectangle',
      'edge-text-rotation': 'autorotate',
      'overlay-opacity': 0,
    },
  },
  {
    selector: 'edge.highlighted',
    style: {
      'width': 4.5,
      'line-color': '#f59e0b',
      'target-arrow-color': '#f59e0b',
      'shadow-color': 'rgba(245,158,11,0.5)',
      'shadow-blur': 10,
      'shadow-opacity': 0.8,
      'z-index': 10,
    },
  },
  {
    selector: 'edge.visited',
    style: {
      'line-color': '#a78bfa',
      'width': 2.5,
    },
  },
  {
    selector: 'edge:selected',
    style: {
      'line-color': '#0ea5e9',
      'width': 3,
    },
  },
];

/* ─── Component ─────────────────────────────────────────────── */
const GraphCanvas = forwardRef(function GraphCanvas(
  { nodes, edges, onNodeClick, onCanvasClick, sourceNode, targetNode },
  ref
) {
  const containerRef = useRef(null);
  const cyRef = useRef(null);

  /* Expose methods via ref */
  useImperativeHandle(ref, () => ({
    highlightPath(path, visitedOrder) {
      const cy = cyRef.current;
      if (!cy) return;

      // Reset all classes
      cy.elements().removeClass('highlighted visited onpath source target');

      // Mark visited nodes
      if (visitedOrder) {
        visitedOrder.forEach((nid) => {
          cy.$(`#${CSS.escape(nid)}`).addClass('visited');
        });
      }

      // Mark path edges and nodes
      if (path && path.length > 1) {
        for (let i = 0; i < path.length - 1; i++) {
          const a = path[i], b = path[i + 1];
          cy.$(`edge[source="${a}"][target="${b}"]`).addClass('highlighted');
          cy.$(`edge[source="${b}"][target="${a}"]`).addClass('highlighted');
          cy.$(`#${CSS.escape(a)}`).addClass('onpath').removeClass('visited');
          cy.$(`#${CSS.escape(b)}`).addClass('onpath').removeClass('visited');
        }
      }

      // Re-apply source/target
      if (sourceNode) cy.$(`#${CSS.escape(sourceNode)}`).removeClass('onpath visited').addClass('source');
      if (targetNode) cy.$(`#${CSS.escape(targetNode)}`).removeClass('onpath visited').addClass('target');
    },

    clearHighlights() {
      const cy = cyRef.current;
      if (!cy) return;
      cy.elements().removeClass('highlighted visited onpath');
      if (sourceNode) cy.$(`#${CSS.escape(sourceNode)}`).addClass('source');
      if (targetNode) cy.$(`#${CSS.escape(targetNode)}`).addClass('target');
    },

    fitView() {
      cyRef.current?.fit(undefined, 40);
    },

    zoomIn() {
      const cy = cyRef.current;
      if (cy) cy.zoom({ level: cy.zoom() * 1.25, renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 } });
    },

    zoomOut() {
      const cy = cyRef.current;
      if (cy) cy.zoom({ level: cy.zoom() * 0.8, renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 } });
    },
  }));

  /* Init Cytoscape */
  useEffect(() => {
    if (!containerRef.current) return;

    const cy = cytoscape({
      container: containerRef.current,
      style: buildStyle(),
      layout: { name: 'preset' },
      userZoomingEnabled: true,
      userPanningEnabled: true,
      boxSelectionEnabled: false,
      minZoom: 0.3,
      maxZoom: 3,
    });
    cyRef.current = cy;

    cy.on('tap', 'node', (evt) => {
      onNodeClick?.(evt.target.id());
    });

    cy.on('tap', (evt) => {
      if (evt.target === cy) onCanvasClick?.();
    });

    return () => { cy.destroy(); cyRef.current = null; };
  }, []);

  /* Sync elements */
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    cy.batch(() => {
      cy.elements().remove();

      nodes.forEach((n) => {
        cy.add({
          group: 'nodes',
          data: { id: n.id, label: n.label || n.id },
          position: { x: n.x ?? Math.random() * 600 + 50, y: n.y ?? Math.random() * 400 + 50 },
          grabbable: true,
        });
      });

      edges.forEach((e, i) => {
        try {
          cy.add({
            group: 'edges',
            data: {
              id: `e-${e.from}-${e.to}-${i}`,
              source: e.from,
              target: e.to,
              label: `${e.weight} km`,
              weight: e.weight,
            },
          });
        } catch (_) { /* skip duplicate */ }
      });

      // Mark source / target
      if (sourceNode) cy.$(`#${CSS.escape(sourceNode)}`).addClass('source');
      if (targetNode) cy.$(`#${CSS.escape(targetNode)}`).addClass('target');
    });

    if (nodes.length > 0) cy.fit(undefined, 40);
  }, [nodes, edges]);

  /* Update source/target classes */
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.nodes().removeClass('source target');
    if (sourceNode) cy.$(`#${CSS.escape(sourceNode)}`).addClass('source');
    if (targetNode) cy.$(`#${CSS.escape(targetNode)}`).addClass('target');
  }, [sourceNode, targetNode]);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden bg-gradient-to-br from-slate-50 to-nav-50/30">
      {/* Grid background */}
      <div className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      <div ref={containerRef} id="cy-container" className="absolute inset-0" />

      {/* Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-1.5 z-10">
        {[
          { icon: <TbZoomIn />, action: () => cyRef.current?.zoom({ level: cyRef.current.zoom() * 1.25, renderedPosition: { x: cyRef.current.width()/2, y: cyRef.current.height()/2 } }), title: 'Zoom In' },
          { icon: <TbZoomOut />, action: () => cyRef.current?.zoom({ level: cyRef.current.zoom() * 0.8, renderedPosition: { x: cyRef.current.width()/2, y: cyRef.current.height()/2 } }), title: 'Zoom Out' },
          { icon: <TbFocus />, action: () => cyRef.current?.fit(undefined, 40), title: 'Fit View' },
          { icon: <TbRefresh />, action: () => { cyRef.current?.elements().removeClass('highlighted visited onpath'); }, title: 'Clear Highlights' },
        ].map(({ icon, action, title }) => (
          <motion.button key={title} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={action} title={title}
            className="w-8 h-8 bg-white/90 border border-slate-200 rounded-lg shadow-sm
                       flex items-center justify-center text-slate-600 hover:text-nav-600
                       hover:border-nav-200 transition-all text-sm">
            {icon}
          </motion.button>
        ))}
      </div>

      {/* Legend */}
      <div className="absolute top-3 left-3 z-10 bg-white/80 backdrop-blur-sm border border-slate-100
                      rounded-xl px-3 py-2 shadow-sm flex flex-col gap-1">
        {[
          { color: '#22c55e', label: 'Source' },
          { color: '#dc2626', label: 'Target' },
          { color: '#f59e0b', label: 'Shortest Path' },
          { color: '#7c3aed', label: 'Visited' },
          { color: '#0ea5e9', label: 'Node' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: color }} />
            <span className="text-[10px] font-medium text-slate-500">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
});

export default GraphCanvas;
