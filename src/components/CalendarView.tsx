import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import type { Event as CalendarEvent } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";

import { format, parse, startOfWeek, getDay, startOfDay, endOfDay } from "date-fns";
import { enUS } from "date-fns/locale";
import { ChevronsUp, Minus, ChevronsDown, CheckCircle2, Zap, Eye, Circle, Funnel } from "lucide-react";

import EventModal from "./EventModal";
import type { MyEvent } from "./EventModal";
import FilterSidebar from "./FilterSidebar";
import StatusBoard from "./StatusBoard";

import { TIMEFRAME_OPTIONS } from "../utils/constant";
import { sortByPriority, DEFAULT_FILTER_STATE } from '../utils/utils'
import { getPriorityColor, getStatusColor, getEventBackgroundColor } from '../utils/color'
import type { FilterState, Status } from '../utils/types'

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format, parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay, locales,
});

const ICONS = {
  priority: {
    high: <ChevronsUp className="w-4 h-4" />,
    medium: <Minus className="w-4 h-4" />,
    low: <ChevronsDown className="w-4 h-4" />
  },
  status: {
    completed: <CheckCircle2 className="w-4 h-4" />,
    'in progress': <Zap className="w-4 h-4" />,
    review: <Eye className="w-4 h-4" />,
    todo: <Circle className="w-4 h-4" />
  }
};

interface CalendarEventExtended extends CalendarEvent {
  title: string; start: Date; end: Date; allDay?: boolean; resource?: any;
}

const DnDCalendar = withDragAndDrop<CalendarEventExtended, object>(Calendar);

export default function CalendarView() {
  const [events, setEvents] = useState<MyEvent[]>([]);
  const [date, setDate] = useState<Date>(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<MyEvent | null>(null);
  const [presetStart, setPresetStart] = useState<Date | undefined>();
  const [presetEnd, setPresetEnd] = useState<Date | undefined>();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [previewEvent, setPreviewEvent] = useState<MyEvent | null>(null);
  const [livePreviewEvent, setLivePreviewEvent] = useState<MyEvent | null>(null);
  const [dragState, setDragState] = useState({ isSelecting: false, selectionStart: null as Date | null });
  const calendarRef = useRef<HTMLDivElement>(null);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTER_STATE);

  // Load/Save events
  useEffect(() => {
    const raw = localStorage.getItem("tasks");
    if (raw) {
      try {
        const parsed: MyEvent[] = JSON.parse(raw).map((e: any) => ({
          title: e.title || "Untitled Event",
          start: new Date(e.start), end: new Date(e.end),
          allDay: !!e.allDay, resource: e.resource,
          priority: e.priority || 'medium', description: e.description || '',
          status: e.status || 'todo', type: e.type || 'task',
        }));
        setEvents(parsed);
      } catch (err) { console.warn("Failed to parse stored tasks:", err); }
    }
  }, []);

  useEffect(() => {
    if (events.length > 0) localStorage.setItem("tasks", JSON.stringify(events));
  }, [events]);

  // Get date from coordinates
  const getDateFromCoordinates = useCallback((x: number, y: number): Date | null => {
    if (!calendarRef.current) return null;
    const monthView = calendarRef.current.querySelector('.rbc-month-view');
    if (!monthView) return null;

    const monthRect = monthView.getBoundingClientRect();
    const relativeX = x - monthRect.left;
    const relativeY = y - monthRect.top;
    const rows = monthView.querySelectorAll('.rbc-month-row');
    if (rows.length === 0) return null;

    const rowHeight = monthRect.height / rows.length;
    const colWidth = monthRect.width / 7;
    const rowIndex = Math.floor(relativeY / rowHeight);
    const colIndex = Math.floor(relativeX / colWidth);
    const cellIndex = rowIndex * 7 + colIndex;

    if (cellIndex >= 0 && cellIndex < 42) {
      const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const startOfCalendar = startOfWeek(firstDayOfMonth, { weekStartsOn: 0 });
      const targetDate = new Date(startOfCalendar);
      targetDate.setDate(startOfCalendar.getDate() + cellIndex);
      return targetDate;
    }
    return null;
  }, [date]);

  // Mouse handlers for live preview
  const handleMouseDown = useCallback((e: MouseEvent) => {
    const target = e.target as Element;
    const isDateCell = target.closest('.rbc-date-cell, .rbc-day-bg');
    const isEvent = target.closest('.rbc-event, .rbc-event-content');

    if (isDateCell && !isEvent) {
      e.preventDefault();
      const startDate = getDateFromCoordinates(e.clientX, e.clientY);
      if (startDate) {
        setDragState({ isSelecting: true, selectionStart: startDate });
        setLivePreviewEvent({
          title: "New Task", start: startDate,
          end: new Date(startDate.getTime() + 60 * 60 * 1000),
          allDay: false, priority: 'medium', status: 'todo',
          type: 'task', description: '', resource: { isLivePreview: true }
        });
      }
    }
  }, [getDateFromCoordinates]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragState.isSelecting || !dragState.selectionStart) return;

    const currentDate = getDateFromCoordinates(e.clientX, e.clientY);
    if (!currentDate) return;

    const start = new Date(Math.min(dragState.selectionStart.getTime(), currentDate.getTime()));
    const end = new Date(Math.max(dragState.selectionStart.getTime(), currentDate.getTime()));
    const isMultiDay = start.toDateString() !== end.toDateString();

    let finalStart = start, finalEnd = end, allDay = false;
    if (isMultiDay) {
      finalStart = startOfDay(start);
      finalEnd = endOfDay(end);
      allDay = true;
    } else if (finalEnd.getTime() - finalStart.getTime() < 60 * 60 * 1000) {
      finalEnd = new Date(finalStart.getTime() + 60 * 60 * 1000);
    }

    setLivePreviewEvent({
      title: "New Task", start: finalStart, end: finalEnd, allDay,
      priority: 'medium', status: 'todo', type: 'task',
      description: '', resource: { isLivePreview: true }
    });
  }, [dragState, getDateFromCoordinates]);

  const handleMouseUp = useCallback(() => {
    if (dragState.isSelecting && livePreviewEvent) {
      setDragState({ isSelecting: false, selectionStart: null });
      const finalPreview = { ...livePreviewEvent, resource: { isPreview: true } };
      setPreviewEvent(finalPreview);
      setLivePreviewEvent(null);
      setTimeout(() => openModal(null, finalPreview.start, finalPreview.end), 100);
    } else if (dragState.isSelecting) {
      setDragState({ isSelecting: false, selectionStart: null });
      setLivePreviewEvent(null);
    }
  }, [dragState, livePreviewEvent]);

  // Attach mouse events
  useEffect(() => {
    document.addEventListener('mousedown', handleMouseDown, true);
    document.addEventListener('mousemove', handleMouseMove, true);
    document.addEventListener('mouseup', handleMouseUp, true);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown, true);
      document.removeEventListener('mousemove', handleMouseMove, true);
      document.removeEventListener('mouseup', handleMouseUp, true);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp]);

  // Process events with filters and preview
  const processedEvents = useMemo(() => {
    const now = new Date();
    const filtered = events.filter((event) => {
      if (filters.type !== 'all' && event.type !== filters.type) return false;
      if (event.type === 'task') {
        if (filters.priority.length > 0 && !filters.priority.includes(event.priority || 'medium')) return false;
        if (filters.status.length > 0 && !filters.status.includes(event.status || 'todo')) return false;
        if (filters.timeframe.length > 0) {
          const diffDays = Math.ceil((new Date(event.start).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          const isValid = filters.timeframe.some(tf => {
            const option = TIMEFRAME_OPTIONS.find(o => o.value === tf);
            return option && diffDays >= 0 && diffDays <= option.days;
          });
          if (!isValid) return false;
        }
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (!event.title.toLowerCase().includes(searchLower) &&
          !(event.description || '').toLowerCase().includes(searchLower)) return false;
      }
      return true;
    });

    const sortedEvents = sortByPriority(filtered);
    const eventsToShow = [...sortedEvents];
    if (livePreviewEvent) eventsToShow.push(livePreviewEvent);
    if (previewEvent && !livePreviewEvent) eventsToShow.push(previewEvent);
    return eventsToShow;
  }, [events, filters, previewEvent, livePreviewEvent]);

  // Modal and event handlers
  const openModal = useCallback((event: MyEvent | null = null, presetStart?: Date, presetEnd?: Date) => {
    setEditingEvent(event);
    console.log(event)
    setPresetStart(presetStart);
    setPresetEnd(presetEnd);
    setModalOpen(true);
    setPreviewEvent(null);
    setLivePreviewEvent(null);
  }, []);

  const handleSaveEvent = useCallback((eventData: MyEvent) => {
    setEvents(prev => editingEvent ? prev.map(ev => ev === editingEvent ? eventData : ev) : [...prev, eventData]);
  }, [editingEvent]);

  const handleDeleteEvent = useCallback(() => {
    if (editingEvent) setEvents(prev => prev.filter(ev => ev !== editingEvent));
  }, [editingEvent]);

  const handleStatusUpdate = useCallback((event: MyEvent, newStatus: string) => {
    setEvents(prev => prev.map(ev => ev === event ? { ...ev, status: newStatus as Status } : ev));
  }, []);

  const handleCreateTaskFromBoard = useCallback((status: String) => {
    console.log(status);
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0);
    const newEvent: MyEvent = {
      title: `New Task - ${status}`,
      start,
      end,
      status: status as Status,
    };

    openModal(newEvent, start, end);
    setTimeout(() => { setPresetStart(start); setPresetEnd(end); }, 100);
  }, [openModal]);

  const handleSelectEvent = useCallback((event: MyEvent) => {
    if (event.resource?.isPreview || event.resource?.isLivePreview) return;
    openModal(event);
  }, [openModal]);

  const handleSelectSlot = useCallback(({ start, end }: { start: Date; end: Date }) => {
    if (dragState.isSelecting) return;
    const preview = {
      title: "New Task", start, end, allDay: false,
      priority: 'medium', status: 'todo', type: 'task',
      description: '', resource: { isPreview: true }
    } as MyEvent;
    setPreviewEvent(preview);
    setTimeout(() => openModal(null, start, end), 100);
  }, [openModal, dragState.isSelecting]);

  const moveEvent = useCallback(({ event, start, end }: any) => {
    if (event.resource?.isPreview || event.resource?.isLivePreview) return;
    setEvents(prev => prev.map(ev => ev === event ? { ...event, start: new Date(start), end: new Date(end) } : ev));
  }, []);

  const resizeEvent = useCallback(({ event, start, end }: any) => {
    if (event.resource?.isPreview || event.resource?.isLivePreview) return;
    setEvents(prev => prev.map(ev => ev === event ? { ...event, start: new Date(start), end: new Date(end) } : ev));
  }, []);

  // Filter handlers
  const updateFilter = useCallback((key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const toggleFilterArray = useCallback((filterType: 'priority' | 'status' | 'timeframe', value: string) => {
    setFilters(prev => {
      const currentArray = prev[filterType];
      return {
        ...prev,
        [filterType]: currentArray.includes(value) ? currentArray.filter(item => item !== value) : [...currentArray, value]
      };
    });
  }, []);

  const clearFilters = useCallback(() => setFilters(DEFAULT_FILTER_STATE), []);

  const hasActiveFilters = filters.type !== 'all' || filters.priority.length > 0 || filters.status.length > 0 || filters.search || filters.timeframe.length > 0;

  // Event component
  const EventComponent = ({ event }: { event: MyEvent }) => {
    const isPreview = event.resource?.isPreview || event.resource?.isLivePreview;
    return (
      <div className={`flex items-center gap-1 text-xs ${isPreview ? 'opacity-80' : ''}`} title={event.description || event.title}>
        {event.type === 'task' && (
          <>
            <span className={`${getPriorityColor(event.priority || 'medium')} rounded p-0.5`}>
              {ICONS.priority[event.priority as keyof typeof ICONS.priority] || ICONS.priority.medium}
            </span>
            <span className={`${getStatusColor(event.status || 'todo')} rounded p-0.5`}>
              {ICONS.status[event.status as keyof typeof ICONS.status] || ICONS.status.todo}
            </span>
          </>
        )}
        <span className="truncate flex-1">{event.title}</span>
        {event.resource?.isLivePreview && <span className="text-blue-500 animate-pulse">●</span>}
      </div>
    );
  };

  // Event styling
  const eventPropGetter = useCallback((event: MyEvent) => {
    const isPreview = event.resource?.isPreview || event.resource?.isLivePreview;
    return {
      style: {
        borderRadius: '8px', color: "#374151",
        backgroundColor: getEventBackgroundColor(event.type || 'task', event.status),
        border: isPreview ? "2px dashed #3b82f6" : "1px solid #e5e7eb",
        padding: "6px 8px", fontSize: "12px", overflow: "hidden",
        boxShadow: isPreview ? "0 4px 12px 0 rgba(59, 130, 246, 0.3)" : "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
        opacity: event.resource?.isLivePreview ? 0.9 : (isPreview ? 0.85 : 1),
        transform: isPreview ? "scale(1.02)" : "scale(1)",
        transition: event.resource?.isLivePreview ? "all 0.1s ease-out" : "all 0.2s ease-in-out",
        zIndex: isPreview ? 1000 : 1,
      }
    };
  }, []);

  // Custom Toolbar
  const CustomToolbar = ({ onNavigate }: any) => (
    <div className="flex items-center justify-between backdrop-blur-lg bg-gradient-to-r from-white/95 via-cyan-50/20 to-white/95 border-b border-slate-200/50 px-6 py-4 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl overflow-hidden shadow-sm border border-gray-200/50">
          <button onClick={() => onNavigate('PREV')} className="px-3 py-2 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-teal-50 hover:text-cyan-600 transition-all duration-200 text-gray-600 font-medium">←</button>
          <button onClick={() => onNavigate('TODAY')} className="px-4 py-2 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-teal-50 hover:text-cyan-600 transition-all duration-200 font-medium border-x border-gray-200/50 text-gray-700">Today</button>
          <button onClick={() => onNavigate('NEXT')} className="px-3 py-2 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-teal-50 hover:text-cyan-600 transition-all duration-200 text-gray-600 font-medium">→</button>
        </div>
        <h2 className="text-xl font-bold text-transparent bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-clip-text">{format(new Date(), 'MMMM d, yyyy')}</h2>
      </div>
      <div className="flex items-center gap-3">
        <button className="px-4 py-2 bg-gradient-to-r from-cyan-500 via-sky-600 to-blue-600 text-white rounded-xl hover:from-cyan-600 hover:via-sky-700 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-cyan-500/25 hover:scale-105" onClick={() => openModal()}>+ New Task</button>
        <button className="px-4 py-2 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 text-gray-700 rounded-xl hover:from-gray-200 hover:via-gray-100 hover:to-gray-200 transition-all duration-200 font-medium flex items-center gap-2 shadow-md hover:shadow-lg border border-gray-200/50 hover:scale-105" onClick={() => setSidebarOpen(true)}>
          <Funnel className="w-5 h-5" />Filters
          {hasActiveFilters && <span className="bg-gradient-to-r from-cyan-500 to-teal-600 text-white text-xs px-2 py-1 rounded-full font-medium animate-pulse shadow-lg">Active</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col bg-gradient-to-br from-slate-50 via-cyan-50/30 to-teal-50/40 relative before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_30%_20%,rgba(14,165,233,0.12),transparent_50%)] before:pointer-events-none">
      <div className={`transition-all duration-300 ease-in-out ${sidebarOpen ? 'mr-80' : 'mr-0'}`}>
        <StatusBoard events={events} onUpdateEvent={handleStatusUpdate} onCreateTask={handleCreateTaskFromBoard} filters={filters} />
      </div>

      <div className="flex p-3 pt-0">
        <div className={`flex-1 transition-all duration-300 ease-in-out ${sidebarOpen ? 'mr-80' : 'mr-0'}`}>
          <div className="bg-gradient-to-br from-white via-slate-50/95 to-cyan-50/30 rounded-2xl shadow-2xl border border-slate-200/40 backdrop-blur-sm relative">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-cyan-50/15 to-teal-50/20 pointer-events-none"></div>
            <div className="relative" ref={calendarRef}>
              <div style={{ minHeight: '600px', height: '600px' }}>
                <DnDCalendar
                  localizer={localizer} events={processedEvents} startAccessor="start" endAccessor="end"
                  style={{ height: '100%', minHeight: '600px' }} views={["month"]} view="month" date={date}
                  onNavigate={setDate} selectable={!dragState.isSelecting} onSelectSlot={handleSelectSlot}
                  onSelectEvent={handleSelectEvent} onEventDrop={moveEvent} onEventResize={resizeEvent}
                  resizable popup eventPropGetter={eventPropGetter}
                  components={{ event: EventComponent, toolbar: CustomToolbar }}
                />
              </div>
            </div>
          </div>
        </div>

        <FilterSidebar
          isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} filters={filters}
          onUpdateFilter={updateFilter} onToggleFilterArray={toggleFilterArray} onClearFilters={clearFilters}
          totalEvents={events.length} filteredEvents={processedEvents.length}
        />
      </div>

      <EventModal
        isOpen={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSaveEvent}
        onDelete={editingEvent ? handleDeleteEvent : undefined} editingEvent={editingEvent}
        presetStart={presetStart} presetEnd={presetEnd}
      />

      <style>{`
        .rbc-slot-selection, .rbc-slot-selecting { display: ${dragState.isSelecting ? 'none' : 'block'} !important; opacity: ${dragState.isSelecting ? '0' : '1'} !important; }
        .rbc-selected { background-color: transparent !important; }
        .rbc-day-bg.rbc-selected-cell, .rbc-date-cell.rbc-selected-cell { background-color: ${dragState.isSelecting ? 'transparent' : ''} !important; }
        ${dragState.isSelecting ? `.rbc-calendar * { user-select: none !important; }` : ''}
      `}</style>
    </div>
  );
}