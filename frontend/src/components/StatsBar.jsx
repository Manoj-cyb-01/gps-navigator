import { motion } from 'framer-motion';
import { TbMapPin, TbArrowsLeftRight, TbRoute, TbBolt } from 'react-icons/tb';

export default function StatsBar({ nodes, edges, result, loading }) {
  const stats = [
    {
      icon: <TbMapPin className="text-nav-500" />,
      label: 'Nodes',
      value: nodes.length,
      bg: 'bg-nav-50',
    },
    {
      icon: <TbArrowsLeftRight className="text-purple-500" />,
      label: 'Roads',
      value: edges.length,
      bg: 'bg-purple-50',
    },
    {
      icon: <TbRoute className="text-mint-500" />,
      label: 'Path Length',
      value: result?.path?.length > 1 ? `${result.totalDistance} km` : '—',
      bg: 'bg-mint-50',
    },
    {
      icon: <TbBolt className="text-amber-500" />,
      label: 'Nodes Visited',
      value: result?.visitedOrder?.length ?? '—',
      bg: 'bg-amber-50',
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-3">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className={`${s.bg} rounded-2xl px-4 py-3 flex items-center gap-3 border border-white`}>
          <div className="text-xl flex-shrink-0">{s.icon}</div>
          <div>
            <div className={`text-lg font-bold font-mono text-slate-800 ${loading ? 'animate-pulse' : ''}`}>
              {loading ? '…' : s.value}
            </div>
            <div className="text-[10px] text-slate-400 font-medium">{s.label}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
