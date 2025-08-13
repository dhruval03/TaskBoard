// Utility functions for the calendar application

import type { Priority, Status, EventType, FilterState } from './types';
import { PRIORITY_ORDER, PRIORITY_OPTIONS, STATUS_OPTIONS, EVENT_TYPE_OPTIONS } from './constant';

// Display Labels
export const getPriorityLabel = (priority: Priority | string): string => {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
};

export const getStatusLabel = (status: Status | string): string => {
  return status === 'todo' ? 'To Do' : status.charAt(0).toUpperCase() + status.slice(1);
};

// Validation Utilities
export const isValidPriority = (priority: string): priority is Priority => {
  return PRIORITY_OPTIONS.includes(priority as Priority);
};

export const isValidStatus = (status: string): status is Status => {
  return STATUS_OPTIONS.includes(status as Status);
};

export const isValidEventType = (type: string): type is EventType => {
  return EVENT_TYPE_OPTIONS.includes(type as EventType);
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