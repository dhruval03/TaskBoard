import { useEffect, useState, useCallback, useMemo } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import type { Event as CalendarEvent } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";

import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import { ChevronsUp, Minus, ChevronsDown, CheckCircle2, Zap, Eye, Circle, Funnel } from "lucide-react";

import EventModal from "./EventModal";
import type { MyEvent } from "./EventModal";
import FilterSidebar from "./FilterSidebar";

import { TIMEFRAME_OPTIONS } from "../utils/constant";
import { sortByPriority, DEFAULT_FILTER_STATE } from '../utils/utils'
import { getPriorityColor, getStatusColor, getEventBackgroundColor } from '../utils/color'
import type { FilterState, } from '../utils/types'

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

// Icon utility functions
const getPriorityIcon = (priority: string) => {
  switch (priority) {
    case 'high': return <ChevronsUp className="w-4 h-4" />;
    case 'medium': return <Minus className="w-4 h-4" />;
    case 'low': return <ChevronsDown className="w-4 h-4" />;
    default: return <Minus className="w-4 h-4" />;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed': return <CheckCircle2 className="w-4 h-4" />;
    case 'in progress': return <Zap className="w-4 h-4" />;
    case 'review': return <Eye className="w-4 h-4" />;
    case 'todo': return <Circle className="w-4 h-4" />;
    default: return <Circle className="w-4 h-4" />;
  }
};

interface CalendarEventExtended extends CalendarEvent {
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  resource?: any;
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

  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTER_STATE);

  // Load events from localStorage
  useEffect(() => {
    const raw = localStorage.getItem("tasks");
    if (raw) {
      try {
        const parsed: MyEvent[] = JSON.parse(raw).map((e: any) => ({
          title: e.title || "Untitled Event",
          start: new Date(e.start),
          end: new Date(e.end),
          allDay: !!e.allDay,
          resource: e.resource,
          priority: e.priority || 'medium',
          description: e.description || '',
          status: e.status || 'todo',
          type: e.type || 'task',
        }));
        setEvents(parsed);
      } catch (err) {
        console.warn("Failed to parse stored tasks:", err);
      }
    }
  }, []);

  // Save events to localStorage
  useEffect(() => {
    if (events.length > 0) {
      localStorage.setItem("tasks", JSON.stringify(events));
    }
  }, [events]);

  // Memoized filtered and sorted events
  const processedEvents = useMemo(() => {
    const now = new Date();

    const filtered = events.filter((event) => {
      // Type filter
      if (filters.type !== 'all' && event.type !== filters.type) return false;

      // Task-specific filters
      if (event.type === 'task') {
        if (filters.priority.length > 0 && !filters.priority.includes(event.priority || 'medium')) return false;
        if (filters.status.length > 0 && !filters.status.includes(event.status || 'todo')) return false;

        // Timeframe filter
        if (filters.timeframe.length > 0) {
          const diffDays = Math.ceil((new Date(event.start).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          const isWithinTimeframe = filters.timeframe.some(tf => {
            const option = TIMEFRAME_OPTIONS.find(o => o.value === tf);
            return option && diffDays >= 0 && diffDays <= option.days;
          });
          if (!isWithinTimeframe) return false;
        }
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (!event.title.toLowerCase().includes(searchLower) &&
          !(event.description || '').toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      return true;
    });

    // Sort by priority using utility function
    return sortByPriority(filtered);
  }, [events, filters]);

  // Modal handlers
  const openModal = useCallback((event: MyEvent | null = null, presetStart?: Date, presetEnd?: Date) => {
    setEditingEvent(event);
    setPresetStart(presetStart);
    setPresetEnd(presetEnd);
    setModalOpen(true);
  }, []);

  const handleSaveEvent = useCallback((eventData: MyEvent) => {
    setEvents(prev => editingEvent
      ? prev.map(ev => ev === editingEvent ? eventData : ev)
      : [...prev, eventData]
    );
  }, [editingEvent]);

  const handleDeleteEvent = useCallback(() => {
    if (editingEvent) {
      setEvents(prev => prev.filter(ev => ev !== editingEvent));
    }
  }, [editingEvent]);

  // Calendar event handlers
  const handleSelectEvent = useCallback((event: MyEvent) => openModal(event), [openModal]);
  const handleSelectSlot = useCallback(({ start, end }: { start: Date; end: Date }) => openModal(null, start, end), [openModal]);

  const moveEvent = useCallback(({ event, start, end }: any) => {
    setEvents(prev => prev.map(ev => ev === event ? { ...event, start: new Date(start), end: new Date(end) } : ev));
  }, []);

  const resizeEvent = useCallback(({ event, start, end }: any) => {
    setEvents(prev => prev.map(ev => ev === event ? { ...event, start: new Date(start), end: new Date(end) } : ev));
  }, []);

  // Custom event component with icons
  const EventComponent = ({ event }: { event: MyEvent }) => (
    <div
      className="flex items-center gap-1 text-xs"
      title={event.description || event.title}
    >
      {event.type === 'task' && (
        <>
          <span className={`${getPriorityColor(event.priority || 'medium')} rounded p-0.5`}>
            {getPriorityIcon(event.priority || 'medium')}
          </span>
          <span className={`${getStatusColor(event.status || 'todo')} rounded p-0.5`}>
            {getStatusIcon(event.status || 'todo')}
          </span>
        </>
      )}
      <span className="truncate flex-1">{event.title}</span>
    </div>
  );

  // Event styling using utility function
  const eventPropGetter = useCallback((event: MyEvent) => {
    return {
      style: {
        borderRadius: '8px',
        color: "#374151",
        backgroundColor: getEventBackgroundColor(event.type || 'task', event.status),
        border: "1px solid #e5e7eb",
        padding: "6px 8px",
        fontSize: "12px",
        overflow: "hidden",
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
      }
    };
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
        [filterType]: currentArray.includes(value)
          ? currentArray.filter(item => item !== value)
          : [...currentArray, value]
      };
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTER_STATE);
  }, []);

  // Check if any filters are active
  const hasActiveFilters = filters.type !== 'all' ||
    filters.priority.length > 0 ||
    filters.status.length > 0 ||
    filters.search ||
    filters.timeframe.length > 0;

  // Custom Toolbar Component
  const CustomToolbar = ({ onNavigate }: any) => {
    const currentDate = format(new Date(), 'MMMM d, yyyy');

    return (
      <div className="flex items-center justify-between backdrop-blur-lg bg-gradient-to-r from-white/95 via-cyan-50/20 to-white/95 border-b border-slate-200/50 px-6 py-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl overflow-hidden shadow-sm border border-gray-200/50">
            <button
              onClick={() => onNavigate('PREV')}
              className="px-3 py-2 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-teal-50 hover:text-cyan-600 transition-all duration-200 text-gray-600 font-medium hover:shadow-inner"
            >
              ←
            </button>
            <button
              onClick={() => onNavigate('TODAY')}
              className="px-4 py-2 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-teal-50 hover:text-cyan-600 transition-all duration-200 font-medium border-x border-gray-200/50 text-gray-700 relative before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-200"
            >
              Today
            </button>
            <button
              onClick={() => onNavigate('NEXT')}
              className="px-3 py-2 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-teal-50 hover:text-cyan-600 transition-all duration-200 text-gray-600 font-medium hover:shadow-inner"
            >
              →
            </button>
          </div>
          {/* Display current date instead of calendar label */}
          <h2 className="text-xl font-bold text-transparent bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-clip-text">{currentDate}</h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 via-sky-600 to-blue-600 text-white rounded-xl hover:from-cyan-600 hover:via-sky-700 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-cyan-500/25 hover:scale-105 hover:-translate-y-0.5 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/0 before:via-white/20 before:to-white/0 before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700"
            onClick={() => openModal()}
          >
            + New Task
          </button>

          <button
            className="px-4 py-2 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 text-gray-700 rounded-xl hover:from-gray-200 hover:via-gray-100 hover:to-gray-200 transition-all duration-200 font-medium flex items-center gap-2 shadow-md hover:shadow-lg border border-gray-200/50 hover:scale-105 hover:-translate-y-0.5 relative overflow-hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Funnel className="w-5 h-5" />
            Filters
            {hasActiveFilters && (
              <span className="bg-gradient-to-r from-cyan-500 to-teal-600 text-white text-xs px-2 py-1 rounded-full font-medium animate-pulse shadow-lg">
                Active
              </span>
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen flex bg-gradient-to-br from-slate-50 via-cyan-50/30 to-teal-50/40 overflow-hidden p-3 relative before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_30%_20%,rgba(14,165,233,0.12),transparent_50%)] before:pointer-events-none">
      {/* Main Calendar Container */}
      <div
        className={`flex-1 overflow-hidden transition-all duration-300 ease-in-out ${sidebarOpen ? 'mr-80' : 'mr-0'
          }`}
      >
        <div className="h-full bg-gradient-to-br from-white via-slate-50/95 to-cyan-50/30 rounded-2xl shadow-2xl border border-slate-200/40 backdrop-blur-sm overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-cyan-50/15 to-teal-50/20 pointer-events-none"></div>
          <div className="relative h-full">
            <DnDCalendar
              localizer={localizer}
              events={processedEvents}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              views={["month"]}
              view="month"
              date={date}
              onNavigate={setDate}
              selectable
              onSelectSlot={handleSelectSlot}
              onSelectEvent={handleSelectEvent}
              onEventDrop={moveEvent}
              onEventResize={resizeEvent}
              resizable
              popup
              eventPropGetter={eventPropGetter}
              components={{
                event: EventComponent,
                toolbar: CustomToolbar
              }}
            />
          </div>
        </div>
      </div>

      {/* Filter Sidebar */}
      <FilterSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        filters={filters}
        onUpdateFilter={updateFilter}
        onToggleFilterArray={toggleFilterArray}
        onClearFilters={clearFilters}
        totalEvents={events.length}
        filteredEvents={processedEvents.length}
      />

      {/* Event Modal */}
      <EventModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveEvent}
        onDelete={editingEvent ? handleDeleteEvent : undefined}
        editingEvent={editingEvent}
        presetStart={presetStart}
        presetEnd={presetEnd}
      />
    </div >
  );
}