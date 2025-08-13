// Configuration constants for the calendar application

import type { Priority, Status, EventType } from './types';

// Priority Configuration
export const PRIORITY_ORDER: Record<Priority, number> = { 
  high: 3, 
  medium: 2, 
  low: 1 
};

export const PRIORITY_OPTIONS: Priority[] = ['high', 'medium', 'low'];

// Status Configuration
export const STATUS_OPTIONS: Status[] = ['todo', 'in progress', 'review', 'completed'];

// Event Type Configuration
export const EVENT_TYPE_OPTIONS: EventType[] = ['task', 'event'];

// Timeframe Configuration
export const TIMEFRAME_OPTIONS = [
  { value: '1week', label: 'Within 1 Week', days: 7 },
  { value: '2weeks', label: 'Within 2 Weeks', days: 14 },
  { value: '3weeks', label: 'Within 3 Weeks', days: 21 }
];

// Default Values
export const DEFAULT_PRIORITY: Priority = 'medium';
export const DEFAULT_STATUS: Status = 'todo';
export const DEFAULT_EVENT_TYPE: EventType = 'task';