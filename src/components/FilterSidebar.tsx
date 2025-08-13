import { ChevronsUp, Minus, ChevronsDown, CheckCircle2, Zap, Eye, Circle, X, Search } from "lucide-react";

import { PRIORITY_OPTIONS, STATUS_OPTIONS,TIMEFRAME_OPTIONS} from "../utils/constant";
import { getPriorityColorLight, getStatusColorLight, } from '../utils/color'
import type {FilterState} from '../utils/types'


// Icon functions (keeping as requested)
const getPriorityIcon = (priority: string) => {
  switch (priority) {
    case 'high': return <ChevronsUp className="w-3 h-3" />;
    case 'medium': return <Minus className="w-3 h-3" />;
    case 'low': return <ChevronsDown className="w-3 h-3" />;
    default: return <Minus className="w-3 h-3" />;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed': return <CheckCircle2 className="w-3 h-3" />;
    case 'in progress': return <Zap className="w-3 h-3" />;
    case 'review': return <Eye className="w-3 h-3" />;
    case 'todo': return <Circle className="w-3 h-3" />;
    default: return <Circle className="w-3 h-3" />;
  }
};

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onUpdateFilter: (key: keyof FilterState, value: any) => void;
  onToggleFilterArray: (filterType: 'priority' | 'status' | 'timeframe', value: string) => void;
  onClearFilters: () => void;
  totalEvents: number;
  filteredEvents: number;
}

export default function FilterSidebar({
  isOpen,
  onClose,
  filters,
  onUpdateFilter,
  onToggleFilterArray,
  onClearFilters,
  totalEvents,
  filteredEvents
}: FilterSidebarProps) {
  
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 transition-opacity duration-200"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed right-0 top-0 h-full w-80 bg-white shadow-2xl border-l border-slate-200/60 transform transition-all duration-300 ease-in-out z-50 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Filters</h2>
              <p className="text-sm text-slate-500 mt-0.5">Customize your view</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200 group"
            >
              <X className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Search */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => onUpdateFilter('search', e.target.value)}
                  placeholder="Search tasks and events..."
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm placeholder-slate-400 transition-all duration-200"
                />
              </div>
            </div>

            {/* Type */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700">Type</label>
              <div className="grid grid-cols-3 gap-2">
                {(['all', 'task', 'event'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => onUpdateFilter('type', type)}
                    className={`px-4 py-2.5 text-sm font-medium rounded-lg border-2 transition-all duration-200 capitalize ${
                      filters.type === type
                        ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    {type === 'all' ? 'All' : `${type}s`}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">Priority</label>
              <div className="space-y-3">
                {PRIORITY_OPTIONS.map(priority => (
                  <label key={priority} className="flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.priority.includes(priority)}
                        onChange={() => onToggleFilterArray('priority', priority)}
                        disabled={filters.type === 'event'}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500/20 focus:ring-2 border-slate-300 rounded transition-all duration-200 disabled:opacity-40"
                      />
                      <span className={`ml-3 text-sm capitalize transition-colors duration-200 ${
                        filters.type === 'event' 
                          ? 'text-slate-400' 
                          : 'text-slate-700 group-hover:text-slate-900'
                      }`}>
                        {priority}
                      </span>
                    </div>
                    {filters.type !== 'event' && (
                      <div className={`p-1.5 rounded-lg border-2 transition-all duration-200 group-hover:scale-105 ${getPriorityColorLight(priority)}`}>
                        {getPriorityIcon(priority)}
                      </div>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Status */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">Status</label>
              <div className="space-y-3">
                {STATUS_OPTIONS.map(status => (
                  <label key={status} className="flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.status.includes(status)}
                        onChange={() => onToggleFilterArray('status', status)}
                        disabled={filters.type === 'event'}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500/20 focus:ring-2 border-slate-300 rounded transition-all duration-200 disabled:opacity-40"
                      />
                      <span className={`ml-3 text-sm capitalize transition-colors duration-200 ${
                        filters.type === 'event' 
                          ? 'text-slate-400' 
                          : 'text-slate-700 group-hover:text-slate-900'
                      }`}>
                        {status}
                      </span>
                    </div>
                    {filters.type !== 'event' && (
                      <div className={`p-1.5 rounded-lg border-2 transition-all duration-200 group-hover:scale-105 ${getStatusColorLight(status)}`}>
                        {getStatusIcon(status)}
                      </div>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Timeframe */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">Timeframe</label>
              <div className="space-y-3">
                {TIMEFRAME_OPTIONS.map(option => (
                  <label key={option.value} className="flex items-center group cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={filters.timeframe.includes(option.value)}
                        onChange={() => onToggleFilterArray('timeframe', option.value)}
                        disabled={filters.type === 'event'}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500/20 focus:ring-2 border-slate-300 rounded transition-all duration-200 disabled:opacity-40"
                      />
                    </div>
                    <span className={`ml-3 text-sm transition-colors duration-200 ${
                      filters.type === 'event' 
                        ? 'text-slate-400' 
                        : 'text-slate-700 group-hover:text-slate-900'
                    }`}>
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 p-6 space-y-4 bg-slate-50/50">
            <button
              onClick={onClearFilters}
              className="w-full px-4 py-3 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all duration-200 hover:shadow-sm"
            >
              Clear All Filters
            </button>
            
            <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
              <span className="text-sm text-slate-600">Showing results</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold text-slate-900">{filteredEvents}</span>
                <span className="text-sm text-slate-400">of</span>
                <span className="text-sm text-slate-600">{totalEvents}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}