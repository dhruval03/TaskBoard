import React, { useState, useMemo } from 'react';
import { Circle, Clock, Eye, CheckCircle2, Plus, Calendar, ChevronsUp, ChevronsDown, Minus, Zap } from 'lucide-react';
import type { MyEvent } from './EventModal';

interface StatusBoardProps {
    events: MyEvent[];
    onUpdateEvent: (event: MyEvent, newStatus: string) => void;
    onCreateTask: (status: string) => void;
    filters: any;
}

const STATUSES = {
    'todo': { title: 'TO DO', icon: Circle, color: 'slate' },
    'in progress': { title: 'IN PROGRESS', icon: Clock, color: 'sky' },
    'review': { title: 'REVIEW', icon: Eye, color: 'purple' },
    'completed': { title: 'DONE', icon: CheckCircle2, color: 'emerald' }
};

const PRIORITY_ICONS = {
    high: <ChevronsUp className="w-4 h-4 text-rose-600" />,
    medium: <Minus className="w-4 h-4 text-amber-600" />,
    low: <ChevronsDown className="w-4 h-4 text-emerald-600" />
};

const STATUS_ICONS = {
    completed: <CheckCircle2 className="w-4 h-4 text-emerald-700" />,
    'in progress': <Zap className="w-4 h-4 text-sky-700" />,
    review: <Eye className="w-4 h-4 text-purple-700" />,
    todo: <Circle className="w-4 h-4 text-slate-700" />
};

const StatusBoard: React.FC<StatusBoardProps> = ({ events, onUpdateEvent, onCreateTask, filters }) => {
    const [draggedEvent, setDraggedEvent] = useState<MyEvent | null>(null);
    const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

    const filteredEvents = useMemo(() => {
        const taskEvents = events.filter(event => {
            if (event.type !== 'task') return false;
            if (filters?.priority?.length > 0 && !filters.priority.includes(event.priority || 'medium')) return false;
            if (filters?.status?.length > 0 && !filters.status.includes(event.status || 'todo')) return false;

            if (filters?.timeframe?.length > 0) {
                const diffDays = Math.ceil((new Date(event.start).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                const timeframes = { today: 0, week: 7, month: 30 };
                const isValid = filters.timeframe.some((tf: string) =>
                    diffDays >= 0 && diffDays <= (timeframes[tf as keyof typeof timeframes] || 0)
                );
                if (!isValid) return false;
            }

            if (filters?.search) {
                const search = filters.search.toLowerCase();
                if (!event.title.toLowerCase().includes(search) &&
                    !(event.description || '').toLowerCase().includes(search)) return false;
            }

            return true;
        });

        const grouped: Record<string, MyEvent[]> = {};
        Object.keys(STATUSES).forEach(status => {
            const statusEvents = taskEvents.filter(e => e.status === status);
            // Sort by priority: high -> medium -> low
            grouped[status] = statusEvents.sort((a, b) => {
                const priorityOrder = { high: 0, medium: 1, low: 2 };
                const aPriority = a.priority || 'medium';
                const bPriority = b.priority || 'medium';
                return priorityOrder[aPriority as keyof typeof priorityOrder] - priorityOrder[bPriority as keyof typeof priorityOrder];
            });
        });
        return grouped;
    }, [events, filters]);

    const handleDrag = {
        start: (e: React.DragEvent, event: MyEvent) => {
            setDraggedEvent(event);
            e.dataTransfer.effectAllowed = 'move';
        },
        over: (e: React.DragEvent, status: string) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            setDragOverColumn(status);
        },
        leave: (e: React.DragEvent) => {
            if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) {
                setDragOverColumn(null);
            }
        },
        drop: (e: React.DragEvent, newStatus: string) => {
            e.preventDefault();
            setDragOverColumn(null);
            if (draggedEvent && draggedEvent.status !== newStatus) {
                onUpdateEvent(draggedEvent, newStatus);
            }
            setDraggedEvent(null);
        }
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric'
        }).format(date);
    };

    return (
        <div className="bg-gradient-to-r from-white via-slate-50/50 to-white border-b border-slate-200/60 shadow-sm backdrop-blur-sm flex-shrink-0">
            <div className="px-6 py-4">
                <div className="grid grid-cols-4 gap-4">
                    {Object.entries(STATUSES).map(([status, config]) => {
                        const Icon = config.icon;
                        const events = filteredEvents[status] || [];
                        const isDragOver = dragOverColumn === status;
                        const color = config.color;

                        return (
                            <div
                                key={status}
                                className={`bg-gradient-to-br from-white to-slate-50/50 rounded-xl border-2 transition-all duration-200 ${isDragOver ? 'border-blue-400 shadow-lg scale-[1.02] bg-gradient-to-br from-blue-50 to-blue-100/50'
                                        : 'border-slate-200/60 hover:border-slate-300/80'
                                    }`}
                                onDragOver={(e) => handleDrag.over(e, status)}
                                onDragLeave={handleDrag.leave}
                                onDrop={(e) => handleDrag.drop(e, status)}
                            >
                                {/* Header */}
                                <div className={`bg-gradient-to-r from-${color}-50 to-${color}-100 p-4 rounded-t-xl border-b border-slate-200/50`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Icon className={`w-5 h-5 text-${color}-700`} />
                                            <span className={`font-bold text-sm text-${color}-700`}>{config.title}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold text-${color}-700 bg-white/60 border border-white/40`}>
                                                {events.length}
                                            </span>
                                            <button
                                                onClick={() => onCreateTask(status)}
                                                className={`p-1 rounded-lg transition-all duration-200 hover:scale-110 text-${color}-700 bg-white/60 hover:bg-white/80 border border-white/40`}
                                                title={`Add task to ${config.title}`}
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Tasks */}
                                <div className="p-3 space-y-2 h-55 overflow-y-auto custom-scrollbar">
                                    {events.length === 0 ? (
                                        <div className="text-center py-4 text-slate-400 text-sm">No tasks</div>
                                    ) : (
                                        events.map((event, index) => (
                                            <div
                                                key={`${event.title}-${event.start.getTime()}-${index}`}
                                                draggable
                                                onDragStart={(e) => handleDrag.start(e, event)}
                                                className={`p-3 rounded-lg border cursor-move transition-all duration-200 bg-white hover:shadow-md hover:scale-[1.02] hover:border-slate-300 border-slate-200 hover:bg-slate-50/50 ${draggedEvent === event ? 'opacity-50 scale-95' : 'opacity-100'
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between gap-2 mb-1">
                                                    <span className="font-medium text-sm text-slate-800 leading-tight truncate flex-1">
                                                        {event.title}
                                                    </span>
                                                    <div className="flex-shrink-0" title={`Priority: ${event.priority}`}>
                                                        {PRIORITY_ICONS[event.priority as keyof typeof PRIORITY_ICONS] || PRIORITY_ICONS.medium}
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        <span>
                                                            {formatDate(event.start)}
                                                            {event.end && event.end.getTime() !== event.start.getTime() && (
                                                                <span className="text-slate-400"> → {formatDate(event.end)}</span>
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1" title={`Status: ${event.status}`}>
                                                        {STATUS_ICONS[event.status as keyof typeof STATUS_ICONS] || STATUS_ICONS.todo}
                                                    </div>
                                                </div>

                                                {event.description && (
                                                    <div className="mt-2 text-xs text-slate-600 line-clamp-2">
                                                        {event.description}
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgb(148 163 184 / 0.4); border-radius: 2px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgb(148 163 184 / 0.6); }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
        </div>
    );
};

export default StatusBoard;