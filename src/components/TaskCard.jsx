import { motion } from 'framer-motion';
import { Check, Clock, Pencil, Trash2, GripVertical } from 'lucide-react';
import { formatDate, formatTime, PRIORITIES, getCategoryConfig } from '../utils';

export default function TaskCard({ task, onToggle, onEdit, onDelete, isDragging, dragHandleProps }) {
  const priority = PRIORITIES[task.priority] || PRIORITIES.low;
  const category = getCategoryConfig(task.category);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0, scale: isDragging ? 1.02 : 1 }}
      exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
      className={`group glass-card p-4 transition-all duration-200 ${
        task.completed ? 'opacity-70' : ''
      } ${isDragging ? 'shadow-xl ring-2 ring-[var(--accent)]/30 z-10' : 'hover:border-[var(--text-muted)]'}`}
      style={{
        background: task.completed ? 'rgba(var(--bg-card-rgb), calc(var(--card-opacity) * 0.7))' : undefined
      }}
    >
      <div className="flex items-start gap-3">
        {/* Drag handle */}
        {dragHandleProps && (
          <div
            {...dragHandleProps}
            className="mt-1 cursor-grab active:cursor-grabbing text-[var(--text-muted)] lg:opacity-0 lg:group-hover:opacity-100 transition-opacity"
          >
            <GripVertical className="w-4 h-4" />
          </div>
        )}

        {/* Checkbox */}
        <button
          onClick={() => onToggle(task.id)}
          className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
            task.completed
              ? 'bg-[var(--accent)] border-[var(--accent)] text-white'
              : 'border-[var(--text-muted)] hover:border-[var(--accent)] text-transparent'
          }`}
        >
          {task.completed && <Check className="w-3 h-3 text-white" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3
              className={`text-sm font-semibold leading-snug ${
                task.completed
                  ? 'line-through text-[var(--text-muted)]'
                  : 'text-[var(--text-primary)]'
              }`}
            >
              {task.title}
            </h3>

            {/* Actions (visible on touch via media query setup, hover on desktop) */}
            <div className="flex items-center gap-1 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity flex-shrink-0">
              <button
                onClick={() => onEdit(task)}
                className="p-1.5 min-h-[44px] min-w-[44px] lg:min-h-0 lg:min-w-0 flex items-center justify-center rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
                aria-label="Edit task"
              >
                <Pencil className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
              </button>
              <button
                onClick={() => onDelete(task.id)}
                className="p-1.5 min-h-[44px] min-w-[44px] lg:min-h-0 lg:min-w-0 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-500 transition-colors"
                aria-label="Delete task"
              >
                <Trash2 className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
              </button>
            </div>
          </div>

          {task.description && (
            <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-2 mt-2.5">
            {/* Priority */}
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${priority.color}`}
                  style={{ background: `color-mix(in srgb, currentColor 10%, transparent)` }}>
              <span className={`w-1.5 h-1.5 rounded-full`} style={{ background: 'currentColor' }} />
              {priority.label}
            </span>

            {/* Category */}
            <span className={`px-2 py-0.5 rounded-md text-xs font-medium`} style={{ background: `color-mix(in srgb, ${category.color.split(' ')[1].replace('text-', '')} 15%, transparent)`, color: `var(--text-primary)` }}>
              {category.label}
            </span>

            {/* Time Block / Due date */}
            {(task.timeBlockStart !== undefined && task.timeBlockStart !== null) ? (
               <span className="inline-flex items-center gap-1 text-xs text-[var(--accent)] font-medium px-2 py-0.5 rounded-md bg-[var(--accent-glow)]">
                 <Clock className="w-3 h-3" />
                 {formatTime(`${task.timeBlockStart}:00`)}
               </span>
            ) : task.dueDate && (
              <span className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)]">
                <Clock className="w-3 h-3" />
                {formatDate(task.dueDate)}
                {task.dueTime && ` ${formatTime(task.dueTime)}`}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
