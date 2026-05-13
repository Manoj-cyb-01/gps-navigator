import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TbGitCompare, TbTable, TbMap } from 'react-icons/tb';

import Header from './components/Header.jsx';
import GraphCanvas from './components/GraphCanvas.jsx';
import GraphEditor from './components/GraphEditor.jsx';
import RouteFinder from './components/RouteFinder.jsx';
import DistanceTable from './components/DistanceTable.jsx';
import ComparisonPanel from './components/ComparisonPanel.jsx';
import StatsBar from './components/StatsBar.jsx';
import Toast from './components/Toast.jsx';

import { SAMPLE_GRAPH } from './utils/data.js';
import { runDijkstra, compareAlgorithms, checkHealth } from './utils/api.js';

let _toastId = 0;

export default function App() {
  // ── Graph state ──────────────────────────────────────────────
  const [nodes, setNodes] = useState(SAMPLE_GRAPH.nodes);
  const [edges, setEdges] = useState(SAMPLE_GRAPH.edges);

  // ── Route state ───────────────────────────────────────────────
  const [source, setSource] = useState('A');
  const [target, setTarget] = useState('F');

  // ── Results state ─────────────────────────────────────────────
  const [dijkstraResult, setDijkstraResult] = useState(null);
  const [comparisonResult, setComparisonResult] = useState(null);

  // ── UI state ──────────────────────────────────────────────────
  const [loading, setLoading] = useState(null); // 'dijkstra' | 'compare' | null
  const [activeBottomTab, setActiveBottomTab] = useState('table');
  const [backendStatus, setBackendStatus] = useState('checking');
  const [toasts, setToasts] = useState([]);

  const cyRef = useRef(null);

  // ── Toast helper ─────────────────────────────────────────────
  const toast = useCallback((message, type = 'info') => {
    const id = ++_toastId;
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  }, []);

  // ── Backend health check ──────────────────────────────────────
  useEffect(() => {
    checkHealth()
      .then(() => setBackendStatus('online'))
      .catch(() => { setBackendStatus('offline'); toast('Backend offline — check Flask server', 'warn'); });
  }, []);

  // ── Graph operations ──────────────────────────────────────────
  const handleAddNode = useCallback((node) => {
    setNodes(p => [...p, node]);
    toast(`Node "${node.id}" added`, 'success');
  }, []);

  const handleAddEdge = useCallback((edge) => {
    setEdges(p => [...p, edge]);
    toast(`Road ${edge.from}↔${edge.to} added`, 'success');
  }, []);

  const handleDeleteNode = useCallback((nodeId) => {
    setNodes(p => p.filter(n => n.id !== nodeId));
    setEdges(p => p.filter(e => e.from !== nodeId && e.to !== nodeId));
    if (source === nodeId) setSource('');
    if (target === nodeId) setTarget('');
    toast(`Node "${nodeId}" deleted`, 'info');
  }, [source, target]);

  const handleDeleteEdge = useCallback((idx) => {
    setEdges(p => p.filter((_, i) => i !== idx));
    toast('Road removed', 'info');
  }, []);

  const handleLoadSample = useCallback(() => {
    setNodes(SAMPLE_GRAPH.nodes);
    setEdges(SAMPLE_GRAPH.edges);
    setSource('A');
    setTarget('F');
    setDijkstraResult(null);
    setComparisonResult(null);
    cyRef.current?.clearHighlights?.();
    toast('Sample city map loaded', 'success');
  }, []);

  // ── Algorithm execution ───────────────────────────────────────
  const handleRunDijkstra = useCallback(async () => {
    if (!source || !target) return toast('Select source and destination', 'warn');
    if (source === target) return toast('Source and target must be different', 'warn');
    setLoading('dijkstra');
    try {
      const result = await runDijkstra(nodes, edges, source, target);
      setDijkstraResult(result);
      setActiveBottomTab('table');
      if (result.path?.length > 1) {
        cyRef.current?.highlightPath(result.path, result.visitedOrder);
        toast(`Shortest path found! ${result.totalDistance} km`, 'success');
      } else {
        cyRef.current?.clearHighlights?.();
        toast('No path found between selected nodes', 'warn');
      }
    } catch (err) {
      toast(err?.response?.data?.error || 'Failed to run Dijkstra', 'error');
    } finally {
      setLoading(null);
    }
  }, [nodes, edges, source, target]);

  const handleRunComparison = useCallback(async () => {
    if (!source || !target) return toast('Select source and destination', 'warn');
    if (source === target) return toast('Source and target must be different', 'warn');
    setLoading('compare');
    try {
      const result = await compareAlgorithms(nodes, edges, source, target);
      setComparisonResult(result);
      setDijkstraResult(result.dijkstra);
      setActiveBottomTab('comparison');
      if (result.dijkstra?.path?.length > 1) {
        cyRef.current?.highlightPath(result.dijkstra.path, result.dijkstra.visitedOrder);
      }
      toast(`${result.verdict.fasterAlgorithm} wins by ${result.verdict.speedupFactor}×`, 'success');
    } catch (err) {
      toast(err?.response?.data?.error || 'Failed to compare algorithms', 'error');
    } finally {
      setLoading(null);
    }
  }, [nodes, edges, source, target]);

  // ── Bottom panel tabs ─────────────────────────────────────────
  const bottomTabs = [
    { id: 'table',      label: 'Distance Table', icon: <TbTable /> },
    { id: 'comparison', label: 'Comparison',     icon: <TbGitCompare /> },
  ];

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-gradient-mesh font-body">
      <Header backendStatus={backendStatus} />

      <main className="flex-1 max-w-screen-2xl mx-auto w-full px-4 py-4 flex flex-col gap-4">
        {/* Stats row */}
        <StatsBar nodes={nodes} edges={edges} result={dijkstraResult} loading={!!loading} />

        {/* Main grid: Left sidebar | Canvas | Right sidebar */}
        <div className="flex gap-4 flex-1" style={{ minHeight: '520px' }}>

          {/* ── Left Panel: Editor ─── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="w-64 flex-shrink-0 flex flex-col gap-4">
            <div className="glass-card p-4 flex-1 flex flex-col overflow-hidden">
              <GraphEditor
                nodes={nodes}
                edges={edges}
                onAddNode={handleAddNode}
                onAddEdge={handleAddEdge}
                onDeleteNode={handleDeleteNode}
                onDeleteEdge={handleDeleteEdge}
                onLoadSample={handleLoadSample}
              />
            </div>
          </motion.div>

          {/* ── Center: Graph Canvas ─── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="flex-1 glass-card overflow-hidden"
            style={{ minHeight: '520px' }}>
            <GraphCanvas
              ref={cyRef}
              nodes={nodes}
              edges={edges}
              sourceNode={source}
              targetNode={target}
              onNodeClick={(id) => {
                if (!source) { setSource(id); return; }
                if (!target && id !== source) { setTarget(id); return; }
                // Toggle: if clicking source set as new source, etc.
              }}
            />
          </motion.div>

          {/* ── Right Panel: Route Finder ─── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="w-64 flex-shrink-0 flex flex-col gap-3">
            <RouteFinder
              nodes={nodes}
              source={source}
              target={target}
              loading={loading}
              onSourceChange={setSource}
              onTargetChange={setTarget}
              onRunDijkstra={handleRunDijkstra}
              onRunComparison={handleRunComparison}
              result={dijkstraResult}
            />

            {/* Algorithm info card */}
            <div className="glass-card p-4 flex flex-col gap-3">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">How it Works</div>
              <div className="flex flex-col gap-2 text-[11px] text-slate-600 leading-relaxed">
                <div className="flex gap-2">
                  <span className="text-nav-500 font-bold flex-shrink-0">1.</span>
                  Build your city map by adding nodes (intersections) and roads (edges with distances).
                </div>
                <div className="flex gap-2">
                  <span className="text-nav-500 font-bold flex-shrink-0">2.</span>
                  Select a <span className="text-mint-600 font-semibold">source</span> (green) and <span className="text-red-500 font-semibold">destination</span> (red) node.
                </div>
                <div className="flex gap-2">
                  <span className="text-nav-500 font-bold flex-shrink-0">3.</span>
                  Run Dijkstra's algorithm to find the shortest path, highlighted in <span className="text-amber-500 font-semibold">amber</span>.
                </div>
                <div className="flex gap-2">
                  <span className="text-nav-500 font-bold flex-shrink-0">4.</span>
                  Compare with Bellman-Ford for a side-by-side analysis.
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Bottom Panel: Table + Comparison ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex flex-col"
          style={{ height: '360px' }}>

          {/* Tab strip */}
          <div className="flex gap-1 mb-2">
            {bottomTabs.map(t => (
              <button key={t.id} onClick={() => setActiveBottomTab(t.id)}
                className={`flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-xl transition-all ${
                  activeBottomTab === t.id
                    ? 'bg-white text-nav-700 shadow-sm border border-slate-100'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-white/60'
                }`}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              {activeBottomTab === 'table' && (
                <motion.div key="table" className="h-full"
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                  <DistanceTable
                    distanceTable={dijkstraResult?.distanceTable}
                    path={dijkstraResult?.path}
                    source={source}
                  />
                </motion.div>
              )}
              {activeBottomTab === 'comparison' && (
                <motion.div key="comparison" className="h-full"
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                  <ComparisonPanel comparison={comparisonResult} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </main>

      {/* Toast notifications */}
      <Toast toasts={toasts} />
    </div>
  );
}
