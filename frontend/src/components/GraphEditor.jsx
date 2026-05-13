import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TbPlus, TbTrash, TbMapPin, TbArrowsLeftRight, TbEdit,
  TbChevronDown, TbChevronUp, TbDownload, TbUpload
} from 'react-icons/tb';

export default function GraphEditor({ nodes, edges, onAddNode, onAddEdge, onDeleteNode, onDeleteEdge, onLoadSample }) {
  const [newNode, setNewNode] = useState({ id: '', label: '' });
  const [newEdge, setNewEdge] = useState({ from: '', to: '', weight: '' });
  const [activeTab, setActiveTab] = useState('nodes');
  const [nodeError, setNodeError] = useState('');
  const [edgeError, setEdgeError] = useState('');

  const handleAddNode = () => {
    const id = newNode.id.trim().toUpperCase();
    const label = newNode.label.trim();
    if (!id) return setNodeError('Node ID is required');
    if (nodes.find(n => n.id === id)) return setNodeError('Node ID already exists');
    setNodeError('');
    onAddNode({ id, label: label || id, x: 200 + Math.random() * 400, y: 150 + Math.random() * 300 });
    setNewNode({ id: '', label: '' });
  };

  const handleAddEdge = () => {
    const from = newEdge.from.trim();
    const to = newEdge.to.trim();
    const w = parseFloat(newEdge.weight);
    if (!from || !to) return setEdgeError('Both nodes are required');
    if (!nodes.find(n => n.id === from)) return setEdgeError(`Node "${from}" doesn't exist`);
    if (!nodes.find(n => n.id === to)) return setEdgeError(`Node "${to}" doesn't exist`);
    if (from === to) return setEdgeError('Cannot connect a node to itself');
    if (isNaN(w) || w <= 0) return setEdgeError('Weight must be a positive number');
    setEdgeError('');
    onAddEdge({ from, to, weight: w });
    setNewEdge({ from: '', to: '', weight: '' });
  };

  const exportGraph = () => {
    const data = JSON.stringify({ nodes, edges }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'city-graph.json'; a.click();
    URL.revokeObjectURL(url);
  };

  const importGraph = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.nodes && data.edges) {
          data.nodes.forEach(n => onAddNode(n));
          data.edges.forEach(ed => onAddEdge(ed));
        }
      } catch { alert('Invalid JSON file'); }
    };
    reader.readAsText(file);
  };

  const tabs = [
    { id: 'nodes', label: 'Nodes', icon: <TbMapPin />, count: nodes.length },
    { id: 'edges', label: 'Roads', icon: <TbArrowsLeftRight />, count: edges.length },
  ];

  return (
    <div className="flex flex-col gap-4 h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <div className="text-sm font-semibold text-slate-800">Map Editor</div>
          <div className="text-xs text-slate-400 mt-0.5">{nodes.length} nodes · {edges.length} roads</div>
        </div>
        <div className="flex gap-1.5">
          <motion.button whileTap={{ scale: 0.95 }} onClick={onLoadSample}
            className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5">
            <TbEdit className="text-sm" /> Sample
          </motion.button>
          <motion.button whileTap={{ scale: 0.95 }} onClick={exportGraph}
            className="w-7 h-7 bg-white border border-slate-200 rounded-lg flex items-center justify-center
                       text-slate-500 hover:text-nav-600 hover:border-nav-200 transition-all text-sm"
            title="Export Graph">
            <TbDownload />
          </motion.button>
          <label className="w-7 h-7 bg-white border border-slate-200 rounded-lg flex items-center justify-center
                            text-slate-500 hover:text-nav-600 hover:border-nav-200 transition-all text-sm cursor-pointer"
            title="Import Graph">
            <TbUpload />
            <input type="file" accept=".json" className="hidden" onChange={importGraph} />
          </label>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 rounded-xl p-1 flex-shrink-0">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-1.5 rounded-lg transition-all ${
              activeTab === t.id
                ? 'bg-white text-nav-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}>
            {t.icon}
            {t.label}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
              activeTab === t.id ? 'bg-nav-100 text-nav-600' : 'bg-slate-200 text-slate-500'
            }`}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-0.5">
        {activeTab === 'nodes' && (
          <>
            {/* Add node form */}
            <div className="glass-card p-3 flex flex-col gap-2">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Add Node</div>
              <div className="flex gap-2">
                <input className="input-field text-xs" placeholder="ID (e.g. A)" maxLength={5}
                  value={newNode.id} onChange={e => { setNewNode(p => ({ ...p, id: e.target.value })); setNodeError(''); }} />
                <input className="input-field text-xs" placeholder="Label (e.g. City Center)"
                  value={newNode.label} onChange={e => setNewNode(p => ({ ...p, label: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && handleAddNode()} />
              </div>
              {nodeError && <p className="text-[11px] text-red-500">{nodeError}</p>}
              <motion.button whileTap={{ scale: 0.95 }} onClick={handleAddNode}
                className="btn-primary text-xs py-1.5 flex items-center justify-center gap-1.5 w-full">
                <TbPlus /> Add Node
              </motion.button>
            </div>

            {/* Node list */}
            <div className="flex flex-col gap-1.5">
              <AnimatePresence>
                {nodes.map(node => (
                  <motion.div key={node.id}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                    className="flex items-center gap-2 bg-white border border-slate-100 rounded-xl px-3 py-2 group
                               hover:border-nav-200 hover:bg-nav-50/30 transition-all">
                    <div className="w-7 h-7 rounded-lg bg-nav-100 flex items-center justify-center text-xs font-bold text-nav-700 flex-shrink-0">
                      {node.id}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-slate-800 truncate">{node.label}</div>
                      <div className="text-[10px] text-slate-400">
                        {edges.filter(e => e.from === node.id || e.to === node.id).length} connections
                      </div>
                    </div>
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => onDeleteNode(node.id)}
                      className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-lg bg-red-50 flex items-center
                                 justify-center text-red-400 hover:text-red-600 hover:bg-red-100 transition-all text-xs flex-shrink-0">
                      <TbTrash />
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
              {nodes.length === 0 && (
                <div className="text-center py-6 text-slate-400 text-xs">
                  <TbMapPin className="text-2xl mx-auto mb-1 opacity-50" />
                  No nodes yet. Add one above or load a sample.
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'edges' && (
          <>
            {/* Add edge form */}
            <div className="glass-card p-3 flex flex-col gap-2">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Add Road</div>
              <div className="grid grid-cols-2 gap-2">
                <select className="select-field text-xs" value={newEdge.from}
                  onChange={e => { setNewEdge(p => ({ ...p, from: e.target.value })); setEdgeError(''); }}>
                  <option value="">From node…</option>
                  {nodes.map(n => <option key={n.id} value={n.id}>{n.id} – {n.label}</option>)}
                </select>
                <select className="select-field text-xs" value={newEdge.to}
                  onChange={e => { setNewEdge(p => ({ ...p, to: e.target.value })); setEdgeError(''); }}>
                  <option value="">To node…</option>
                  {nodes.map(n => <option key={n.id} value={n.id}>{n.id} – {n.label}</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                <input className="input-field text-xs" placeholder="Distance (km)" type="number" min="0.1" step="0.1"
                  value={newEdge.weight} onChange={e => { setNewEdge(p => ({ ...p, weight: e.target.value })); setEdgeError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleAddEdge()} />
                <motion.button whileTap={{ scale: 0.95 }} onClick={handleAddEdge}
                  className="btn-primary text-xs py-1.5 px-4 flex items-center gap-1 flex-shrink-0">
                  <TbPlus /> Add
                </motion.button>
              </div>
              {edgeError && <p className="text-[11px] text-red-500">{edgeError}</p>}
            </div>

            {/* Edge list */}
            <div className="flex flex-col gap-1.5">
              <AnimatePresence>
                {edges.map((edge, i) => (
                  <motion.div key={`${edge.from}-${edge.to}-${i}`}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                    className="flex items-center gap-2 bg-white border border-slate-100 rounded-xl px-3 py-2 group
                               hover:border-nav-200 hover:bg-nav-50/30 transition-all">
                    <div className="flex-1 flex items-center gap-2 min-w-0">
                      <span className="text-xs font-bold text-nav-700 bg-nav-50 px-2 py-0.5 rounded-lg flex-shrink-0">{edge.from}</span>
                      <TbArrowsLeftRight className="text-slate-400 text-xs flex-shrink-0" />
                      <span className="text-xs font-bold text-nav-700 bg-nav-50 px-2 py-0.5 rounded-lg flex-shrink-0">{edge.to}</span>
                      <span className="text-xs text-slate-500 font-mono ml-auto flex-shrink-0">{edge.weight} km</span>
                    </div>
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => onDeleteEdge(i)}
                      className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-lg bg-red-50 flex items-center
                                 justify-center text-red-400 hover:text-red-600 hover:bg-red-100 transition-all text-xs flex-shrink-0">
                      <TbTrash />
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
              {edges.length === 0 && (
                <div className="text-center py-6 text-slate-400 text-xs">
                  <TbArrowsLeftRight className="text-2xl mx-auto mb-1 opacity-50" />
                  No roads yet.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
