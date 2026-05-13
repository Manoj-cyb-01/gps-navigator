import { AnimatePresence, motion } from 'framer-motion';
import { TbCheck, TbX, TbInfoCircle, TbAlertTriangle } from 'react-icons/tb';

const icons = {
  success: <TbCheck className="text-mint-500" />,
  error:   <TbX className="text-red-500" />,
  info:    <TbInfoCircle className="text-nav-500" />,
  warn:    <TbAlertTriangle className="text-amber-500" />,
};

const colors = {
  success: 'border-mint-200 bg-mint-50',
  error:   'border-red-200 bg-red-50',
  info:    'border-nav-200 bg-nav-50',
  warn:    'border-amber-200 bg-amber-50',
};

export default function Toast({ toasts }) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg
                        backdrop-blur-sm pointer-events-auto max-w-xs ${colors[t.type] || colors.info}`}>
            <span className="text-lg flex-shrink-0">{icons[t.type] || icons.info}</span>
            <span className="text-xs font-medium text-slate-700">{t.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
