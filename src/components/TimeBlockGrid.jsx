import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Clock, Plus } from 'lucide-react';
import { useTasks } from '../context/TaskContext';

const HOURS = [];
for (let h = 6; h <= 23; h++) {
  HOURS.push(h);
}

function formatHour(h) {
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12} ${ampm}`;
}

export default function TimeBlockGrid({ date, tasks: dayTasks, onEditTask, onToggleComplete, onAddTask }) {
  const { editTask } = useTasks();
  const [dragOverSlot, setDragOverSlot] = useState(null);

  const dateStr = date.toISOString().split('T')[0];

  // Build slot map
  const slotMap = useMemo(() => {
    const map = {};
    HOURS.forEach(h => { map[h] = []; });
    dayTasks.forEach(task => {
      if (task.timeBlockStart !== undefined && task.timeBlockStart !== null) {
        const hour = task.timeBlockStart;
        if (map[hour]) {
          map[hour].push(task);
        }
      }
    });
    return map;
  }, [dayTasks]);

  // Unscheduled tasks (no timeBlock)
  const unscheduled = useMemo(() => {
    return dayTasks.filter(t => t.timeBlockStart === undefined || t.timeBlockStart === null);
  }, [dayTasks]);

  const handleDragEnd = (result) => {
    setDragOverSlot(null);
    if (!result.destination) return;

    const taskId = result.draggableId;
    const destId = result.destination.droppableId;

    if (destId === 'unscheduled') {
      // Remove from time block
      editTask(taskId, { timeBlockStart: null, timeBlockEnd: null });
    } else if (destId.startsWith('slot-')) {
      const hour = parseInt(destId.replace('slot-', ''));
      editTask(taskId, { timeBlockStart: hour, timeBlockEnd: hour + 1 });
    }
  };

  const handleDragUpdate = (update) => {
    if (update.destination) {
      setDragOverSlot(update.destination.droppableId);
    } else {
      setDragOverSlot(null);
    }
  };

  const now = new Date();
  const currentHour = now.getHours();
  const isToday = dateStr === now.toISOString().split('T')[0];

  return (
    <DragDropContext onDragEnd={handleDragEnd} onDragUpdate={handleDragUpdate}>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Unscheduled tasks sidebar */}
        <div className="lg:col-span-1">
          <div className="glass-card p-4 sticky top-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">Unscheduled</h3>
              <button
                onClick={onAddTask}
                className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <Droppable droppableId="unscheduled">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`min-h-[80px] rounded-xl transition-colors ${
                    snapshot.isDraggingOver ? 'bg-[var(--accent-glow)]' : ''
                  }`}
                >
                  {unscheduled.length === 0 && !snapshot.isDraggingOver ? (
                    <p className="text-xs text-[var(--text-muted)] text-center py-4">
                      Drag tasks here to unschedule
                    </p>
                  ) : (
                    unscheduled.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`p-3 mb-2 rounded-xl text-sm font-medium cursor-grab active:cursor-grabbing transition-all ${
                              snapshot.isDragging
                                ? 'shadow-lg ring-2 ring-[var(--accent)]/20 bg-[var(--bg-card)]'
                                : 'bg-[var(--bg-hover)] hover:bg-[var(--border-color)]'
                            } ${task.completed ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-primary)]'}`}
                          >
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                task.priority === 'high' ? 'bg-red-500' :
                                task.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                              }`} />
                              <span className="truncate">{task.title}</span>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        </div>

        {/* Time grid */}
        <div className="lg:col-span-3 glass-card p-4 overflow-x-hidden">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-[var(--accent)]" />
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h3>
          </div>

          <div className="space-y-0">
            {HOURS.map(hour => {
              const slotTasks = slotMap[hour] || [];
              const isCurrentHour = isToday && hour === currentHour;
              const slotId = `slot-${hour}`;

              return (
                <Droppable key={hour} droppableId={slotId}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`time-slot flex gap-3 p-2 sm:p-3 ${
                        isCurrentHour ? 'bg-[var(--accent-glow)] border-l-2 border-l-[var(--accent)]' : ''
                      } ${snapshot.isDraggingOver ? '!bg-[var(--accent-glow)]' : ''} ${
                        dragOverSlot === slotId ? 'ring-1 ring-[var(--accent)]/30' : ''
                      }`}
                    >
                      {/* Time label */}
                      <div className="w-14 sm:w-16 flex-shrink-0 text-right">
                        <span className={`text-xs font-medium ${
                          isCurrentHour ? 'text-[var(--accent)] font-bold' : 'text-[var(--text-muted)]'
                        }`}>
                          {formatHour(hour)}
                        </span>
                      </div>

                      {/* Task blocks */}
                      <div className="flex-1 min-h-[44px] flex flex-col gap-1">
                        {slotTasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <motion.div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                layout
                                className={`px-3 py-2 rounded-lg text-xs font-medium cursor-grab active:cursor-grabbing transition-all ${
                                  snapshot.isDragging
                                    ? 'shadow-lg ring-2 ring-[var(--accent)]/30 z-10'
                                    : ''
                                } ${task.completed
                                  ? 'bg-emerald-500/10 text-emerald-600 line-through'
                                  : 'bg-[var(--accent-glow)] text-[var(--accent)] border border-[var(--accent)]/20'
                                }`}
                                onClick={() => onEditTask(task)}
                              >
                                <div className="flex items-center gap-2">
                                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                    task.priority === 'high' ? 'bg-red-500' :
                                    task.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                                  }`} />
                                  <span className="truncate">{task.title}</span>
                                </div>
                              </motion.div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              );
            })}
          </div>
        </div>
      </div>
    </DragDropContext>
  );
}
