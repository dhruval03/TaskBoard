import { useState, useEffect } from "react";
import { 
  CheckCircle, Calendar, Tag, AlignLeft, X, Check, Trash2,
  Circle, ChevronsDown, Eye, CheckCircle2, ChevronsUp, Minus, Zap
} from "lucide-react";

import { PRIORITY_OPTIONS, STATUS_OPTIONS,DEFAULT_PRIORITY, DEFAULT_STATUS, DEFAULT_EVENT_TYPE, } from "../utils/constant";
import {  getPriorityLabel, getStatusLabel, toDateInput} from '../utils/utils'
import { getPriorityColor, getStatusColor, } from '../utils/color'
import type {Priority,Status,EventType,} from '../utils/types'

export interface MyEvent {
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  resource?: any;
  priority?: Priority;
  description?: string;
  status?: Status;
  type?: EventType;
}

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: MyEvent) => void;
  onDelete?: () => void;
  editingEvent?: MyEvent | null;
  presetStart?: Date;
  presetEnd?: Date;
}

export default function EventModal({ isOpen, onClose, onSave, onDelete, editingEvent, presetStart, presetEnd }: EventModalProps) {
  const [title, setTitle] = useState("");
  const [startInput, setStartInput] = useState("");
  const [endInput, setEndInput] = useState("");
  const [priority, setPriority] = useState<Priority>(DEFAULT_PRIORITY);
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Status>(DEFAULT_STATUS);
  const [activeTab, setActiveTab] = useState<EventType>(DEFAULT_EVENT_TYPE);
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editingEvent) {
        setTitle(editingEvent.title);
        setStartInput(toDateInput(editingEvent.start));
        setEndInput(toDateInput(editingEvent.end));
        setPriority(editingEvent.priority || DEFAULT_PRIORITY);
        setDescription(editingEvent.description || '');
        setStatus(editingEvent.status || DEFAULT_STATUS);
        setActiveTab(editingEvent.type || DEFAULT_EVENT_TYPE);
      } else {
        setTitle("");
        setPriority(DEFAULT_PRIORITY);
        setDescription('');
        setStatus(DEFAULT_STATUS);
        setActiveTab(DEFAULT_EVENT_TYPE);
        const s = presetStart ?? new Date();
        const e = presetEnd ?? new Date(s.getTime() + 24 * 60 * 60 * 1000);
        setStartInput(toDateInput(s));
        setEndInput(toDateInput(e));
      }
      setIsPriorityOpen(false);
      setIsStatusOpen(false);
    }
  }, [isOpen, editingEvent, presetStart, presetEnd]);

  const handleSave = () => {
    const s = new Date(startInput + 'T00:00:00');
    const e = new Date(endInput + 'T23:59:59');
    if (e < s) return alert("End date must be after start date");
    
    onSave({
      title: title.trim() || "Untitled Event",
      start: s,
      end: e,
      allDay: true,
      priority,
      description: description.trim(),
      status,
      type: activeTab,
    });
    onClose();
  };

  if (!isOpen) return null;

  const priorityIcons = { high: ChevronsUp, medium: Minus, low: ChevronsDown };
  const statusIcons = { todo: Circle, 'in progress': Zap, review: Eye, completed: CheckCircle2 };

  const PriorityIcon = priorityIcons[priority];
  const StatusIcon = statusIcons[status];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-2xl shadow-2xl z-60 w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${activeTab === 'task' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                {activeTab === 'task' ? <CheckCircle className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
              </div>
              <h3 className="text-xl font-semibold text-gray-800">
                {editingEvent ? `Edit ${editingEvent.type === 'event' ? 'Event' : 'Task'}` : "Create New"}
              </h3>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Tabs */}
          <div className="px-6 pt-4">
            <div className="flex bg-gray-100 rounded-xl p-1">
              <button
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${activeTab === 'task' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
                onClick={() => setActiveTab('task')}
              >
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Task
                </div>
              </button>
              <button
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${activeTab === 'event' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
                onClick={() => setActiveTab('event')}
              >
                <div className="flex items-center justify-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Event
                </div>
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="px-6 py-4 space-y-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {activeTab === 'task' ? 'Task Title' : 'Event Title'}
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder={`Enter ${activeTab} title`}
              />
            </div>

            {/* Date Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Start Date
                </label>
                <input
                  type="date"
                  value={startInput}
                  onChange={(e) => setStartInput(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  End Date
                </label>
                <input
                  type="date"
                  value={endInput}
                  onChange={(e) => setEndInput(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            {/* Task-specific fields */}
            {activeTab === 'task' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Priority
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsPriorityOpen(!isPriorityOpen)}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-left flex items-center gap-2 ${getPriorityColor(priority)}`}
                    >
                      <PriorityIcon className="w-4 h-4" />
                      <span>{getPriorityLabel(priority)} Priority</span>
                      <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {isPriorityOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg">
                        {PRIORITY_OPTIONS.map((p) => {
                          const Icon = priorityIcons[p];
                          return (
                            <button
                              key={p}
                              type="button"
                              onClick={() => {
                                setPriority(p);
                                setIsPriorityOpen(false);
                              }}
                              className={`w-full px-4 py-3 text-left flex items-center gap-2 hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl transition-colors ${priority === p ? getPriorityColor(p) : ''}`}
                            >
                              <Icon className="w-4 h-4" />
                              <span>{getPriorityLabel(p)} Priority</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Status
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsStatusOpen(!isStatusOpen)}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-left flex items-center gap-2 ${getStatusColor(status)}`}
                    >
                      <StatusIcon className="w-4 h-4" />
                      <span>{getStatusLabel(status)}</span>
                      <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {isStatusOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg">
                        {STATUS_OPTIONS.map((s) => {
                          const Icon = statusIcons[s];
                          return (
                            <button
                              key={s}
                              type="button"
                              onClick={() => {
                                setStatus(s);
                                setIsStatusOpen(false);
                              }}
                              className={`w-full px-4 py-3 text-left flex items-center gap-2 hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl transition-colors ${status === s ? getStatusColor(s) : ''}`}
                            >
                              <Icon className="w-4 h-4" />
                              <span>{getStatusLabel(s)}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <AlignLeft className="w-4 h-4" />
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                placeholder={`Add ${activeTab} description...`}
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              {editingEvent && onDelete && (
                <button
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
                  onClick={() => { onDelete(); onClose(); }}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              )}
              <button
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-all duration-200"
                onClick={onClose}
              >
                Cancel
              </button>
            </div>

            <button
              className={`px-6 py-2 ${activeTab === 'task' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-purple-500 hover:bg-purple-600'} text-white rounded-lg font-medium transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md`}
              onClick={handleSave}
            >
              <Check className="w-4 h-4" />
              {editingEvent ? 'Update' : 'Create'} {activeTab === 'task' ? 'Task' : 'Event'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}