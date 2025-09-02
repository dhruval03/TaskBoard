import type { Priority, Status, FilterState } from './types';
import { PRIORITY_ORDER } from './constant';

// Display Labels
export const getPriorityLabel = (priority: Priority | string): string => {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
};

export const getStatusLabel = (status: Status | string): string => {
  return status === 'todo' ? 'To Do' : status.charAt(0).toUpperCase() + status.slice(1);
};

// Sorting Utilities
export const sortByPriority = <T extends { priority?: string }>(items: T[]): T[] => {
  return [...items].sort((a, b) => {
    const aPriority = PRIORITY_ORDER[a.priority as Priority] || 2;
    const bPriority = PRIORITY_ORDER[b.priority as Priority] || 2;
    return bPriority - aPriority;
  });
};

// Date Utilities
export const toDateInput = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

// Default Filter State
export const DEFAULT_FILTER_STATE: FilterState = {
  type: 'all',
  priority: [],
  status: [],
  search: '',
  timeframe: []
};