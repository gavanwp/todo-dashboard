import { createContext, useContext, useReducer, useEffect } from 'react';
import { v4 } from '../utils';

import { useOffline } from './OfflineContext';

const TaskContext = createContext();

const STORAGE_KEY = 'taskflow-tasks';

const loadTasks = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveTasks = (tasks) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
};

function taskReducer(state, action) {
  let newState;
  const now = new Date().toISOString();

  switch (action.type) {
    case 'ADD_TASK':
      newState = [{ ...action.payload, updatedAt: now }, ...state];
      break;
    case 'EDIT_TASK':
      newState = state.map(t =>
        t.id === action.payload.id ? { ...t, ...action.payload, updatedAt: now } : t
      );
      break;
    case 'DELETE_TASK':
      newState = state.filter(t => t.id !== action.payload);
      break;
    case 'TOGGLE_COMPLETE':
      newState = state.map(t =>
        t.id === action.payload
          ? {
              ...t,
              completed: !t.completed,
              completedAt: !t.completed ? now : null,
              updatedAt: now,
            }
          : t
      );
      break;
    case 'REORDER_TASKS':
      newState = action.payload;
      break;
    case 'SET_TASKS':
      newState = action.payload;
      break;
    case 'CLEAR_ALL':
      newState = [];
      break;
    default:
      return state;
  }
  saveTasks(newState);
  return newState;
}

export function TaskProvider({ children }) {
  const [tasks, dispatch] = useReducer(taskReducer, [], loadTasks);
  const { queueChange } = useOffline();

  const addTask = (task) => {
    const payload = {
      id: v4(),
      createdAt: new Date().toISOString(),
      completed: false,
      completedAt: null,
      ...task,
    };
    dispatch({ type: 'ADD_TASK', payload });
    queueChange({ type: 'ADD_TASK', payload });
  };

  const editTask = (id, updates) => {
    dispatch({ type: 'EDIT_TASK', payload: { id, ...updates } });
    queueChange({ type: 'EDIT_TASK', payload: { id, ...updates } });
  };

  const deleteTask = (id) => {
    dispatch({ type: 'DELETE_TASK', payload: id });
    queueChange({ type: 'DELETE_TASK', payload: id });
  };

  const toggleComplete = (id) => {
    dispatch({ type: 'TOGGLE_COMPLETE', payload: id });
    queueChange({ type: 'TOGGLE_COMPLETE', payload: id });
  };

  const reorderTasks = (newTasks) => {
    dispatch({ type: 'REORDER_TASKS', payload: newTasks });
    queueChange({ type: 'REORDER_TASKS' }); // Simplified for sync
  };

  const clearAll = () => {
    dispatch({ type: 'CLEAR_ALL' });
    queueChange({ type: 'CLEAR_ALL' });
  };

  return (
    <TaskContext.Provider value={{
      tasks,
      addTask,
      editTask,
      deleteTask,
      toggleComplete,
      reorderTasks,
      clearAll
    }}>
      {children}
    </TaskContext.Provider>
  );
}

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) throw new Error('useTasks must be used within a TaskProvider');
  return context;
};
