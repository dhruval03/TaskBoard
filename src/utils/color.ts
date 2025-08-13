// Color utility functions for the calendar application

import type { Priority, Status, EventType } from './types';

// Primary Color Schemes
export const getPriorityColor = (priority: Priority | string): string => {
  switch (priority) {
    case 'high': 
      return 'text-rose-600 bg-rose-50 border-rose-200';
    case 'medium': 
      return 'text-amber-600 bg-amber-50 border-amber-200';
    case 'low': 
      return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    default: 
      return 'text-slate-600 bg-slate-50 border-slate-200';
  }
};

export const getStatusColor = (status: Status | string): string => {
  switch (status) {
    case 'completed': 
      return 'text-emerald-700 bg-emerald-100 border-emerald-200';
    case 'in progress': 
      return 'text-sky-700 bg-sky-100 border-sky-200';
    case 'review': 
      return 'text-purple-700 bg-purple-100 border-purple-300';
    case 'todo': 
      return 'text-slate-700 bg-slate-100 border-slate-200';
    default: 
      return 'text-slate-700 bg-slate-100 border-slate-200';
  }
};

// Light Color Schemes (for FilterSidebar)
export const getPriorityColorLight = (priority: Priority | string): string => {
  switch (priority) {
    case 'high': 
      return 'text-red-600 bg-red-50 border-red-100';
    case 'medium': 
      return 'text-amber-600 bg-amber-50 border-amber-100';
    case 'low': 
      return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    default: 
      return 'text-slate-600 bg-slate-50 border-slate-100';
  }
};

export const getStatusColorLight = (status: Status | string): string => {
  switch (status) {
    case 'completed': 
      return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    case 'in progress': 
      return 'text-blue-600 bg-blue-50 border-blue-100';
    case 'review': 
      return 'text-violet-600 bg-violet-50 border-violet-100';
    case 'todo': 
      return 'text-slate-600 bg-slate-50 border-slate-100';
    default: 
      return 'text-slate-600 bg-slate-50 border-slate-100';
  }
};

// Event Background Colors for Calendar
export const getEventBackgroundColor = (eventType: EventType | string, status?: Status | string): string => {
  if (eventType === 'task' && status) {
    switch (status) {
      case 'completed': 
        return "#dcfce7";
      case 'in progress': 
        return "#dbeafe";
      case 'review': 
        return "#d8b4fe";
      case 'todo': 
        return "#f1f5f9";
      default: 
        return "#f1f5f9";
    }
  }
  return "#fef3c7";
};