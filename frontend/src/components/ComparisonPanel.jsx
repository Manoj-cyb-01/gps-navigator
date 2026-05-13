import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis
} from 'recharts';
import { TbGitCompare, TbBolt, TbClock, TbArrowRight, TbCheck, TbX } from 'react-icons/tb';
import { formatTime } from '../utils/data.js';

function MetricCard({ label, dijkstra, bellman, unit = '', higherIsBetter = false }) {
  const dVal = typeof dijkstra === 'number' ? dijkstra : 0;
  const bVal = typeof bellman === 'number' ? bellman : 0;
  const dijkstraWins = higherIsBetter ? dVal >= bVal : dVal <= bVal;

  return (
    <div className="bg-slate-50 rounded-xl p-3 flex flex-col gap-2">
      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{label}</div>
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <div className="text-[10px] text-nav-500 font-medium mb-0.5 flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-nav-400" /> Dijkstra
          </div>
          <div className={`text-sm font-bold font-mono ${dijkstraWins ? 'text-mint-600' : 'text-slate-700'}`}>
            {typeof dijkstra === 'number' ? dijkstra.toLocaleString() : dijkstra}{unit}
            {dijkstraWins && <TbBolt className="inline text-xs ml-0.5 text-amber-400" />}
          </div>
        </div>
        <div className="flex-1">
          <div className="text-[10px] text-purple-500 font-medium mb-0.5 flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-purple-400" /> Bellman-Ford
          </div>
          <div className={`text-sm font-bold font-mono ${!dijkstraWins ? 'text-mint-600' : 'text-slate-700'}`}>
            {typeof bellman === 'number' ? bellman.toLocaleString() : bellman}{unit}
            {!dijkstraWins && <TbBolt className="inline text-xs ml-0.5 text-amber-400" />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ComparisonPanel({ comparison }) {
  if (!comparison) {
    return (
      <div className="glass-card h-full flex flex-col items-center justify-center p-8 text-center">
        <TbGitCompare className="text-4xl text-slate-300 mb-3" />
        <p className="text-sm font-medium text-slate-500">Algorithm Comparison</p>
        <p className="text-xs text-slate-400 mt-1">
          Click "Compare Both Algorithms" to see a side-by-side comparison of Dijkstra's and Bellman-Ford.
        </p>
      </div>
    );
  }

  const { dijkstra: d, bellmanFord: b, verdict, graphInfo } = comparison;

  const barData = [
    {
      name: 'Time (ms)',
      Dijkstra: parseFloat(d.executionTimeMs?.toFixed(4) || 0),
      'Bellman-Ford': parseFloat(b.executionTimeMs?.toFixed(4) || 0),
    },
    {
      name: 'Iterations',
      Dijkstra: d.iterations || 0,
      'Bellman-Ford': b.iterations || 0,
    },
    {
      name: 'Relaxations',
      Dijkstra: d.nodesRelaxed || 0,
      'Bellman-Ford': b.edgesRelaxed || 0,
    },
  ];

  const radarData = [
    { subject: 'Speed', Dijkstra: 90, BellmanFord: 60 },
    { subject: 'Neg. Weights', Dijkstra: 20, BellmanFord: 100 },
    { subject: 'Simplicity', Dijkstra: 70, BellmanFord: 85 },
    { subject: 'Memory', Dijkstra: 80, BellmanFord: 70 },
    { subject: 'Scalability', Dijkstra: 85, BellmanFord: 55 },
  ];

  return (
    <div className="glass-card h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-slate-100 flex-shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <TbGitCompare className="text-nav-500" />
          <span className="text-sm font-semibold text-slate-800">Algorithm Comparison</span>
          <span className="badge-blue ml-auto">
            V={graphInfo?.V} · E={graphInfo?.E}
          </span>
        </div>
        {/* Verdict banner */}
        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
          className="mt-2 rounded-xl bg-gradient-to-r from-nav-600 to-nav-700 p-3 flex items-center gap-3">
          <TbBolt className="text-amber-300 text-lg flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-white">
              {verdict.fasterAlgorithm} is faster
              {verdict.speedupFactor > 1 && ` (${verdict.speedupFactor}× speedup)`}
            </div>
            <div className="text-[10px] text-nav-200 mt-0.5">
              Paths match: {verdict.pathMatch ? '✓ Yes' : '✗ No'} ·
              Distance match: {verdict.distanceMatch ? '✓ Yes' : '✗ No'}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {/* Complexity cards */}
        <div>
          <div className="section-title">Complexity</div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-nav-50 border border-nav-100 rounded-xl p-3">
              <div className="text-[10px] font-semibold text-nav-500 mb-1">Dijkstra</div>
              <div className="font-mono text-xs font-bold text-nav-800">O((V+E) log V)</div>
              <div className="text-[10px] text-nav-400 mt-0.5">Space: O(V)</div>
            </div>
            <div className="bg-purple-50 border border-purple-100 rounded-xl p-3">
              <div className="text-[10px] font-semibold text-purple-500 mb-1">Bellman-Ford</div>
              <div className="font-mono text-xs font-bold text-purple-800">O(V × E)</div>
              <div className="text-[10px] text-purple-400 mt-0.5">Space: O(V)</div>
            </div>
          </div>
        </div>

        {/* Metric cards */}
        <div>
          <div className="section-title">Performance Metrics</div>
          <div className="grid grid-cols-1 gap-2">
            <MetricCard
              label="Execution Time"
              dijkstra={d.executionTimeMs}
              bellman={b.executionTimeMs}
              unit=" ms"
            />
            <MetricCard
              label="Iterations"
              dijkstra={d.iterations}
              bellman={b.iterations}
            />
            <MetricCard
              label="Total Distance"
              dijkstra={d.totalDistance ?? '∞'}
              bellman={b.totalDistance ?? '∞'}
              unit=" km"
            />
          </div>
        </div>

        {/* Bar chart */}
        <div>
          <div className="section-title">Comparative Chart</div>
          <div className="bg-slate-50 rounded-xl p-3 h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} barSize={14} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={28} />
                <Tooltip
                  contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 11 }}
                  cursor={{ fill: 'rgba(14,165,233,0.04)' }}
                />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="Dijkstra" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Bellman-Ford" fill="#a855f7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar chart */}
        <div>
          <div className="section-title">Capability Radar</div>
          <div className="bg-slate-50 rounded-xl p-2 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: '#64748b' }} />
                <Radar name="Dijkstra" dataKey="Dijkstra" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.2} strokeWidth={2} />
                <Radar name="Bellman-Ford" dataKey="BellmanFord" stroke="#a855f7" fill="#a855f7" fillOpacity={0.15} strokeWidth={2} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 11 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Feature comparison table */}
        <div>
          <div className="section-title">Feature Comparison</div>
          <div className="rounded-xl overflow-hidden border border-slate-100">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-[10px] font-semibold uppercase tracking-wider">
                  <th className="text-left px-3 py-2">Feature</th>
                  <th className="text-center px-3 py-2 text-nav-500">Dijkstra</th>
                  <th className="text-center px-3 py-2 text-purple-500">Bellman-Ford</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {[
                  ['Negative Weights', false, true],
                  ['Negative Cycle Detection', false, true],
                  ['Best for Dense Graphs', false, true],
                  ['Best for Sparse Graphs', true, false],
                  ['Greedy Approach', true, false],
                  ['Priority Queue', true, false],
                ].map(([feat, d, bf]) => (
                  <tr key={feat} className="table-row-hover bg-white">
                    <td className="px-3 py-2 text-slate-700">{feat}</td>
                    <td className="px-3 py-2 text-center">
                      {d ? <TbCheck className="text-mint-500 mx-auto" /> : <TbX className="text-slate-300 mx-auto" />}
                    </td>
                    <td className="px-3 py-2 text-center">
                      {bf ? <TbCheck className="text-mint-500 mx-auto" /> : <TbX className="text-slate-300 mx-auto" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bellman-Ford negative cycle warning */}
        {b.hasNegativeCycle && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700 flex gap-2 items-start">
            <TbX className="flex-shrink-0 mt-0.5 text-red-500" />
            <span>Bellman-Ford detected a <strong>negative cycle</strong> in this graph. Shortest paths may be undefined.</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}
