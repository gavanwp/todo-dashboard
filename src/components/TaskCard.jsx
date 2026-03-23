import { motion } from 'framer-motion';
import { Check, Clock, Pencil, Trash2, GripVertical, Flag } from 'lucide-react';
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
      className={`group glass-card p-4 hover:shadow-card-hover transition-all duration-200 ${
        task.completed ? 'opacity-70' : ''
      } ${isDragging ? 'shadow-xl ring-2 ring-primary-400/20' : ''}`}
    >
      <div className="flex items-start gap-3">
        {/* Drag handle */}
        {dragHandleProps && (
          <div
            {...dragHandleProps}
            className="mt-1 cursor-grab active:cursor-grabbing text-surface-300 dark:text-surface-600 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <GripVertical className="w-4 h-4" />
          </div>
        )}

        {/* Checkbox */}
        <button
          onClick={() => onToggle(task.id)}
          className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
            task.completed
              ? 'bg-primary-600 border-primary-600 text-white'
              : 'border-surface-300 dark:border-surface-600 hover:border-primary-400'
          }`}
        >
          {task.completed && <Check className="w-3 h-3" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3
              className={`text-sm font-semibold leading-snug ${
                task.completed
                  ? 'line-through text-surface-400 dark:text-surface-600'
                  : 'text-surface-900 dark:text-white'
              }`}
            >
              {task.title}
            </h3>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <button
                onClick={() => onEdit(task)}
                className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-dark-hover text-surface-400 hover:text-primary-600 transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete(task.id)}
                className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-surface-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {task.description && (
            <p className="text-xs text-surface-500 dark:text-surface-500 mt-1 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-2 mt-2.5">
            {/* Priority */}
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${priority.bg} ${priority.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
              {priority.label}
            </span>

            {/* Category */}
            <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${category.color}`}>
              {category.label}
            </span>

            {/* Due date */}
            {task.dueDate && (
              <span className="inline-flex items-center gap-1 text-xs text-surface-500 dark:text-surface-500">
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
