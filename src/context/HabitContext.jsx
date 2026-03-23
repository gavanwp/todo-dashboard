import { createContext, useContext, useReducer, useEffect } from 'react';
import { v4 } from '../utils';

import { useOffline } from './OfflineContext';

const HabitContext = createContext();

const STORAGE_KEY = 'taskflow-habits';

const loadHabits = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveHabits = (habits) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
};

function habitReducer(state, action) {
  let newState;
  const now = new Date().toISOString();

  switch (action.type) {
    case 'ADD_HABIT':
      newState = [{ ...action.payload, updatedAt: now }, ...state];
      break;
    case 'EDIT_HABIT':
      newState = state.map(h =>
        h.id === action.payload.id ? { ...h, ...action.payload, updatedAt: now } : h
      );
      break;
    case 'DELETE_HABIT':
      newState = state.filter(h => h.id !== action.payload);
      break;
    case 'TOGGLE_HABIT_DATE':
      newState = state.map(h => {
        if (h.id === action.payload.id) {
          const isCompleted = h.completedDates.includes(action.payload.date);
          const newDates = isCompleted 
            ? h.completedDates.filter(d => d !== action.payload.date)
            : [...h.completedDates, action.payload.date];
          return { ...h, completedDates: newDates, updatedAt: now };
        }
        return h;
      });
      break;
    default:
      return state;
  }
  saveHabits(newState);
  return newState;
}

export function HabitProvider({ children }) {
  const [habits, dispatch] = useReducer(habitReducer, [], loadHabits);
  const { queueChange } = useOffline();

  const addHabit = (habit) => {
    const payload = {
      id: v4(),
      createdAt: new Date().toISOString(),
      completedDates: [],
      ...habit,
    };
    dispatch({ type: 'ADD_HABIT', payload });
    queueChange({ type: 'ADD_HABIT', payload });
  };

  const editHabit = (id, updates) => {
    dispatch({ type: 'EDIT_HABIT', payload: { id, ...updates } });
    queueChange({ type: 'EDIT_HABIT', payload: { id, ...updates } });
  };

  const deleteHabit = (id) => {
    dispatch({ type: 'DELETE_HABIT', payload: id });
    queueChange({ type: 'DELETE_HABIT', payload: id });
  };

  const toggleHabitDate = (id, dateStr) => {
    dispatch({ type: 'TOGGLE_HABIT_DATE', payload: { id, date: dateStr } });
    queueChange({ type: 'TOGGLE_HABIT_DATE', payload: { id, date: dateStr } });
  };

  return (
    <HabitContext.Provider value={{
      habits,
      addHabit,
      editHabit,
      deleteHabit,
      toggleHabitDate
    }}>
      {children}
    </HabitContext.Provider>
  );
}

export const useHabits = () => {
  const context = useContext(HabitContext);
  if (!context) throw new Error('useHabits must be used within a HabitProvider');
  return context;
};
