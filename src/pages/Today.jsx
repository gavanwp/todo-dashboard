import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, Sun, Sunrise } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import SearchFilter from '../components/SearchFilter';
import ProgressBar from '../components/ProgressBar';
import { isToday } from '../utils';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 },
};

export default function Today() {
  const { tasks, addTask, editTask, deleteTask, toggleComplete, reorderTasks } = useTasks();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ priority: '', category: '', status: '' });

  // Get today's tasks
  const todayTasks = useMemo(() => {
    let filtered = tasks.filter(t => isToday(t.dueDate));

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q)
      );
    }
    if (filters.priority) filtered = filtered.filter(t => t.priority === filters.priority);
    if (filters.category) filtered = filtered.filter(t => t.category === filters.category);
    if (filters.status === 'active') filtered = filtered.filter(t => !t.completed);
    if (filters.status === 'completed') filtered = filtered.filter(t => t.completed);

    return filtered;
  }, [tasks, searchQuery, filters]);

  const completedCount = todayTasks.filter(t => t.completed).length;

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const todayIds = todayTasks.map(t => t.id);
    const moved = todayIds.splice(result.source.index, 1)[0];
    todayIds.splice(result.destination.index, 0, moved);

    // Reorder all tasks so today's tasks are in new order
    const otherTasks = tasks.filter(t => !todayIds.includes(t.id));
    const reordered = [...todayIds.map(id => tasks.find(t => t.id === id)), ...otherTasks];
    reorderTasks(reordered);
  };

  const handleSave = (formData) => {
    if (editingTask) {
      editTask(editingTask.id, formData);
    } else {
      const today = new Date().toISOString().split('T')[0];
      addTask({ ...formData, dueDate: formData.dueDate || today });
    }
    setEditingTask(null);
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/25">
            <Sunrise className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
              Today
            </h1>
            <p className="text-sm text-[var(--text-muted)]">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
        <button
          onClick={() => { setEditingTask(null); setModalOpen(true); }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Task</span>
          <span className="sm:hidden">Add</span>
        </button>
      </motion.div>

      {/* Progress */}
      <motion.div variants={item} className="glass-card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-[var(--text-secondary)]">Today's Progress</span>
          <span className="text-xs font-bold text-[var(--accent)]">
            {completedCount}/{todayTasks.length}
          </span>
        </div>
        <ProgressBar value={completedCount} max={todayTasks.length || 1} size="sm" />
      </motion.div>

      {/* Search & Filter */}
      <motion.div variants={item}>
        <SearchFilter
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filters={filters}
          onFilterChange={handleFilterChange}
        />
      </motion.div>

      {/* Tasks list with DnD */}
      <motion.div variants={item}>
        {todayTasks.length === 0 ? (
          <div className="text-center py-16">
            <Sun className="w-12 h-12 mx-auto text-[var(--text-muted)] opacity-50 mb-3" />
            <p className="text-[var(--text-secondary)] font-medium">No tasks for today</p>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Add a task or set a due date to today
            </p>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="today-tasks">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="space-y-2"
                >
                  <AnimatePresence>
                    {todayTasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                          >
                            <TaskCard
                              task={task}
                              onToggle={toggleComplete}
                              onEdit={handleEdit}
                              onDelete={deleteTask}
                              isDragging={snapshot.isDragging}
                              dragHandleProps={provided.dragHandleProps}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                  </AnimatePresence>
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </motion.div>

      <TaskModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingTask(null); }}
        onSave={handleSave}
        editTask={editingTask}
      />
    </motion.div>
  );
}
