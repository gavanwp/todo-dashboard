import { motion } from 'framer-motion';

export default function ProgressBar({ value, max = 100, className = '', size = 'md' }) {
  const percentage = max > 0 ? Math.round((value / max) * 100) : 0;
  const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };

  return (
    <div className={`w-full ${className}`}>
      <div className={`w-full ${heights[size]} bg-surface-100 dark:bg-dark-hover rounded-full overflow-hidden`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </motion.div>
      </div>
    </div>
  );
}
