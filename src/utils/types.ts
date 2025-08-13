
export type Priority = 'high' | 'medium' | 'low';
export type Status = 'todo' | 'in progress' | 'review' | 'completed';
export type EventType = 'task' | 'event';

// Filter State Type
export interface FilterState {
  type: 'all' | EventType;
  priority: string[];
  status: string[];
  search: string;
  timeframe: string[];
}