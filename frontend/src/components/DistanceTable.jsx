import { motion, AnimatePresence } from 'framer-motion';
import { TbTable, TbArrowDown, TbInfinity, TbMapPin } from 'react-icons/tb';
import { formatDist } from '../utils/data.js';

export default function DistanceTable({ distanceTable = [], path = [], source }) {
  const pathSet = new Set(path);

  return (
    <div className="glass-card flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 flex-shrink-0 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <TbTable className="text-nav-500 text-sm" />
          <span className="text-sm font-semibold text-slate-800">Distance Table</span>
        </div>
        {source && (
          <span className="badge-blue gap-1">
            <TbMapPin className="text-[10px]" /> From: {source}
          </span>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        {distanceTable.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-10 text-slate-400">
            <TbTable className="text-3xl mb-2 opacity-40" />
            <p className="text-xs">Run an algorithm to see distances</p>
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-4 py-2.5 font-semibold text-slate-500 text-[11px] tracking-wider w-8">#</th>
                <th className="text-left px-4 py-2.5 font-semibold text-slate-500 text-[11px] tracking-wider">Node</th>
                <th className="text-left px-4 py-2.5 font-semibold text-slate-500 text-[11px] tracking-wider">
                  <span className="flex items-center gap-1"><TbArrowDown className="text-xs"/>Distance</span>
                </th>
                <th className="text-left px-4 py-2.5 font-semibold text-slate-500 text-[11px] tracking-wider">Previous</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {distanceTable.map((row, i) => {
                  const onPath = pathSet.has(row.node);
                  const isSource = row.node === source;
                  return (
                    <motion.tr
                      key={row.node}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className={`table-row-hover border-b border-slate-50 ${
                        onPath ? 'bg-amber-50/60' : ''
                      }`}>
                      <td className="px-4 py-2.5 text-slate-400 font-mono">{i + 1}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                            isSource
                              ? 'bg-mint-100 text-mint-700'
                              : onPath
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-nav-50 text-nav-600'
                          }`}>
                            {row.node}
                          </span>
                          <span className="text-slate-700 truncate font-medium" title={row.label}>
                            {row.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        {row.distance == null ? (
                          <span className="flex items-center gap-1 text-slate-300">
                            <TbInfinity /> ∞
                          </span>
                        ) : (
                          <span className={`font-mono font-semibold ${
                            onPath ? 'text-amber-600' : 'text-nav-700'
                          }`}>
                            {row.distance} km
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5">
                        {row.previous ? (
                          <span className="font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-md">
                            {row.previous}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      {distanceTable.length > 0 && (
        <div className="border-t border-slate-100 px-4 py-2 flex items-center gap-3 flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="text-[10px] text-slate-500">On shortest path</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-nav-300" />
            <span className="text-[10px] text-slate-500">Other nodes</span>
          </div>
        </div>
      )}
    </div>
  );
}
