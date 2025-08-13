import CalendarView from "../../components/CalendarView";

export default function TaskBoard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/40 flex flex-col">
      <CalendarView />
    </div>
  );
}
