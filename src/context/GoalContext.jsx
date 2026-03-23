import { createContext, useContext, useReducer, useEffect } from 'react';
import { v4 } from '../utils';

import { useOffline } from './OfflineContext';

const GoalContext = createContext();

const STORAGE_KEY = 'taskflow-goals';

const loadGoals = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveGoals = (goals) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
};

function goalReducer(state, action) {
  let newState;
  const now = new Date().toISOString();

  switch (action.type) {
    case 'ADD_GOAL':
      newState = [{ ...action.payload, updatedAt: now }, ...state];
      break;
    case 'EDIT_GOAL':
      newState = state.map(g =>
        g.id === action.payload.id ? { ...g, ...action.payload, updatedAt: now } : g
      );
      break;
    case 'DELETE_GOAL':
      newState = state.filter(g => g.id !== action.payload);
      break;
    case 'SET_GOALS':
      newState = action.payload;
      break;
    default:
      return state;
  }
  saveGoals(newState);
  return newState;
}

export function GoalProvider({ children }) {
  const [goals, dispatch] = useReducer(goalReducer, [], loadGoals);
  const { queueChange } = useOffline();

  const addGoal = (goal) => {
    const payload = {
      id: v4(),
      createdAt: new Date().toISOString(),
      ...goal,
    };
    dispatch({ type: 'ADD_GOAL', payload });
    queueChange({ type: 'ADD_GOAL', payload });
  };

  const editGoal = (id, updates) => {
    dispatch({ type: 'EDIT_GOAL', payload: { id, ...updates } });
    queueChange({ type: 'EDIT_GOAL', payload: { id, ...updates } });
  };

  const deleteGoal = (id) => {
    dispatch({ type: 'DELETE_GOAL', payload: id });
    queueChange({ type: 'DELETE_GOAL', payload: id });
  };

  return (
    <GoalContext.Provider value={{
      goals,
      addGoal,
      editGoal,
      deleteGoal
    }}>
      {children}
    </GoalContext.Provider>
  );
}

export const useGoals = () => {
  const context = useContext(GoalContext);
  if (!context) throw new Error('useGoals must be used within a GoalProvider');
  return context;
};
