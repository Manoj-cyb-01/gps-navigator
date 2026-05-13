import { motion } from 'framer-motion';
import { TbRoute, TbPlayerPlay, TbGitCompare, TbMapPin, TbMapPinFilled, TbLoader } from 'react-icons/tb';

export default function RouteFinder({
  nodes, source, target, loading,
  onSourceChange, onTargetChange,
  onRunDijkstra, onRunComparison,
  result,
}) {
  const pathExists = result?.path?.length > 1;

  return (
    <div className="glass-card p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-nav-100 flex items-center justify-center">
          <TbRoute className="text-nav-600 text-sm" />
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-800">Route Finder</div>
          <div className="text-[10px] text-slate-400">Select source &amp; destination</div>
        </div>
      </div>

      {/* Node selectors */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-mint-500 flex items-center justify-center flex-shrink-0">
            <TbMapPin className="text-white text-xs" />
          </div>
          <select className="select-field text-xs flex-1" value={source} onChange={e => onSourceChange(e.target.value)}>
            <option value="">Select source…</option>
            {nodes.map(n => (
              <option key={n.id} value={n.id}>{n.id} – {n.label}</option>
            ))}
          </select>
        </div>

        {/* Route line decoration */}
        <div className="flex items-center gap-2 pl-2.5">
          <div className="flex flex-col items-center gap-0.5">
            <div className="w-0.5 h-3 bg-slate-200 rounded" />
            <div className="w-0.5 h-3 bg-slate-200 rounded" />
          </div>
          <span className="text-[10px] text-slate-400 ml-1">via shortest path</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
            <TbMapPinFilled className="text-white text-xs" />
          </div>
          <select className="select-field text-xs flex-1" value={target} onChange={e => onTargetChange(e.target.value)}>
            <option value="">Select destination…</option>
            {nodes.map(n => (
              <option key={n.id} value={n.id}>{n.id} – {n.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-2">
        <motion.button
          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}
          onClick={onRunDijkstra}
          disabled={!source || !target || source === target || loading}
          className="btn-primary flex items-center justify-center gap-2 w-full py-2.5">
          {loading === 'dijkstra' ? (
            <><TbLoader className="animate-spin" /> Computing…</>
          ) : (
            <><TbPlayerPlay /> Run Dijkstra</>
          )}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}
          onClick={onRunComparison}
          disabled={!source || !target || source === target || loading}
          className="btn-secondary flex items-center justify-center gap-2 w-full py-2.5 text-xs">
          {loading === 'compare' ? (
            <><TbLoader className="animate-spin" /> Comparing…</>
          ) : (
            <><TbGitCompare /> Compare Both Algorithms</>
          )}
        </motion.button>
      </div>

      {/* Quick result summary */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl p-3 border ${
            pathExists
              ? 'bg-mint-50 border-mint-200'
              : 'bg-red-50 border-red-200'
          }`}>
          {pathExists ? (
            <>
              <div className="text-xs font-semibold text-mint-700 mb-1">
                ✓ Shortest path found
              </div>
              <div className="flex items-baseline gap-1 mb-1.5">
                <span className="text-2xl font-bold text-mint-700 font-mono">
                  {result.totalDistance}
                </span>
                <span className="text-xs text-mint-600">km total</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {result.path.map((nid, i) => (
                  <span key={i} className="flex items-center gap-1">
                    <span className="text-[10px] font-bold bg-mint-100 text-mint-700 px-1.5 py-0.5 rounded-md">
                      {nid}
                    </span>
                    {i < result.path.length - 1 && (
                      <span className="text-[10px] text-mint-400">→</span>
                    )}
                  </span>
                ))}
              </div>
              <div className="mt-2 text-[10px] text-mint-600">
                {result.visitedOrder?.length} nodes explored · {result.executionTimeMs?.toFixed(3)} ms
              </div>
            </>
          ) : (
            <div className="text-xs text-red-600">
              No path found between selected nodes.
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
