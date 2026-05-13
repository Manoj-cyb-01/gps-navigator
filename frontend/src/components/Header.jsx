import { motion } from 'framer-motion';
import { TbRoute, TbMapPin2, TbChartDots } from 'react-icons/tb';

export default function Header({ backendStatus }) {
  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-10 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm"
    >
      <div className="max-w-screen-2xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-nav-500 to-nav-700 flex items-center justify-center shadow-md">
            <TbRoute className="text-white text-lg" />
          </div>
          <div>
            <div className="font-display font-bold text-slate-900 text-lg leading-tight tracking-tight">
              GPS Navigator
            </div>
            <div className="text-[10px] text-slate-400 font-medium tracking-widest uppercase">
              Dijkstra's Shortest Path
            </div>
          </div>
        </div>

        {/* Center badges */}
        <div className="hidden md:flex items-center gap-2">
          <span className="badge-blue gap-1.5">
            <TbMapPin2 className="text-xs" />
            City Map Visualizer
          </span>
          <span className="badge-green gap-1.5">
            <TbChartDots className="text-xs" />
            Algorithm Comparison
          </span>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2.5">
          <div className={`pulse-dot ${backendStatus === 'online' ? '' : 'bg-amber-400'}`}
            style={{ background: backendStatus === 'online' ? '#22c55e' : '#f59e0b' }} />
          <span className="text-xs text-slate-500 font-medium">
            {backendStatus === 'online' ? 'API Online' : backendStatus === 'offline' ? 'API Offline' : 'Connecting…'}
          </span>
        </div>
      </div>
    </motion.header>
  );
}
