import { createContext, useContext, useReducer, useEffect } from 'react';
import { v4 } from '../utils';

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
  switch (action.type) {
    case 'ADD_TASK':
      newState = [action.payload, ...state];
      break;
    case 'EDIT_TASK':
      newState = state.map(t => t.id === action.payload.id ? { ...t, ...action.payload } : t);
      break;
    case 'DELETE_TASK':
      newState = state.filter(t => t.id !== action.payload);
      break;
    case 'TOGGLE_COMPLETE':
      newState = state.map(t =>
        t.id === action.payload
          ? { ...t, completed: !t.completed, completedAt: !t.completed ? new Date().toISOString() : null }
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

  const addTask = (task) => {
    dispatch({
      type: 'ADD_TASK',
      payload: {
        id: v4(),
        createdAt: new Date().toISOString(),
        completed: false,
        completedAt: null,
        ...task,
      },
    });
  };

  const editTask = (id, updates) => {
    dispatch({ type: 'EDIT_TASK', payload: { id, ...updates } });
  };

  const deleteTask = (id) => {
    dispatch({ type: 'DELETE_TASK', payload: id });
  };

  const toggleComplete = (id) => {
    dispatch({ type: 'TOGGLE_COMPLETE', payload: id });
  };

  const reorderTasks = (tasks) => {
    dispatch({ type: 'REORDER_TASKS', payload: tasks });
  };

  const clearAll = () => {
    dispatch({ type: 'CLEAR_ALL' });
  };

  return (
    <TaskContext.Provider value={{ tasks, addTask, editTask, deleteTask, toggleComplete, reorderTasks, clearAll }}>
      {children}
    </TaskContext.Provider>
  );
}

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) throw new Error('useTasks must be used within a TaskProvider');
  return context;
};
