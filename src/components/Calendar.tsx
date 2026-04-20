import React, { useState, useEffect } from 'react';
import { format, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, getHours, getMinutes } from 'date-fns';
import { pt } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, X, User, Phone, Mail, Calendar as CalendarIcon } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getGoogleCalendarUrl } from '../utils/calendar';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export type ViewMode = 'month' | 'week' | 'day';

export interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    status: string;
    subtitle?: string; // Barber name or Service
    clientDetails?: {
        name: string;
        email?: string;
        phone?: string;
    };
    rawAppointment?: any;
}

interface CalendarProps {
    events: CalendarEvent[];
    view: ViewMode;
    onViewChange: (view: ViewMode) => void;
    currentDate: Date;
    onDateChange: (date: Date) => void;
    renderActions?: (event: CalendarEvent) => React.ReactNode;
}

const Calendar: React.FC<CalendarProps> = ({ events, view, onViewChange, currentDate, onDateChange, renderActions }) => {
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000); // 1 minute
        return () => clearInterval(timer);
    }, []);

    const next = () => {
        if (view === 'month') onDateChange(addMonths(currentDate, 1));
        else if (view === 'week') onDateChange(addWeeks(currentDate, 1));
        else onDateChange(addDays(currentDate, 1));
    };

    const prev = () => {
        if (view === 'month') onDateChange(subMonths(currentDate, 1));
        else if (view === 'week') onDateChange(subWeeks(currentDate, 1));
        else onDateChange(subDays(currentDate, 1));
    };

    const today = () => {
        onDateChange(new Date());
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'confirmado': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'marcado': 
            case 'pendente': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'cancelado': return 'bg-red-500/20 text-red-500 border-red-500/30 line-through opacity-70';
            case 'concluido': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    const renderHeader = () => {
        const dateFormat = view === 'month' ? 'MMMM yyyy' : view === 'week' ? "'Semana de' dd MMM" : "EEEE, dd 'de' MMMM";
        return (
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={today} className="px-4 py-2 bg-zin-900 hover:bg-zinc-800 rounded-lg text-sm font-medium transition-colors border border-white/10 text-white">Hoje</button>
                    <div className="flex gap-2">
                        <button onClick={prev} className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors border border-white/10 text-white">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button onClick={next} className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors border border-white/10 text-white">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                    <h2 className="text-xl font-bold text-white capitalize min-w-[200px] text-center sm:text-left">
                        {format(currentDate, dateFormat, { locale: pt })}
                    </h2>
                </div>
                <div className="flex p-1 bg-zinc-900/80 rounded-lg border border-white/10">
                    {(['month', 'week', 'day'] as ViewMode[]).map((v) => (
                        <button
                            key={v}
                            onClick={() => onViewChange(v)}
                            className={cn(
                                "px-4 py-2 rounded-md text-sm font-medium transition-all capitalize",
                                view === v ? "bg-zinc-800 text-white shadow-sm" : "text-gray-400 hover:text-white"
                            )}
                        >
                            {v === 'month' ? 'Mês' : v === 'week' ? 'Semana' : 'Dia'}
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    const renderMonthView = () => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
        const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

        const dateFormat = "d";
        const rows = [];

        let days = [];
        let day = startDate;
        let formattedDate = "";

        const weekDays = [];
        for (let i = 0; i < 7; i++) {
            weekDays.push(
                <div className="text-center font-bold text-sm text-gray-400 py-3 capitalize" key={i}>
                    {format(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), i), 'EEEE', { locale: pt }).substring(0, 3)}
                </div>
            );
        }

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                formattedDate = format(day, dateFormat);
                const cloneDay = day;

                const dayEvents = events.filter(e => isSameDay(e.start, cloneDay)).sort((a,b) => a.start.getTime() - b.start.getTime());

                days.push(
                    <div
                        className={cn(
                            "min-h-[120px] p-2 border-r border-b border-white/5 transition-colors relative flex flex-col group",
                            !isSameMonth(day, monthStart) ? "bg-black/40 text-gray-600" : "bg-zinc-900/30 text-gray-300 hover:bg-zinc-800/50",
                            isSameDay(day, new Date()) ? "bg-primary/5" : ""
                        )}
                        key={day.toString()}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <span className={cn(
                                "text-sm font-bold w-8 h-8 flex items-center justify-center rounded-full transition-colors",
                                isSameDay(day, new Date()) ? "bg-primary text-black shadow-lg shadow-primary/20" : "group-hover:text-white"
                            )}>
                                {formattedDate}
                            </span>
                        </div>
                        <div className="flex flex-col gap-1.5 overflow-y-auto flex-1 scrollbar-hide pr-1">
                            {dayEvents.slice(0, 3).map((evt) => (
                                <div 
                                    key={evt.id} 
                                    onClick={() => setSelectedEvent(evt)}
                                    className={cn("text-[11px] px-2 py-1 rounded-md truncate border backdrop-blur-sm transition-all hover:scale-[1.02] cursor-pointer", getStatusStyle(evt.status))} 
                                    title={`${evt.title} - ${evt.subtitle || ''}`}
                                >
                                    <span className="font-bold opacity-80 mr-1">{format(evt.start, 'HH:mm')}</span>
                                    {evt.title}
                                </div>
                            ))}
                            {dayEvents.length > 3 && (
                                <div className="text-[11px] text-gray-400 font-medium pl-2 bg-white/5 rounded-md py-1 text-center hover:bg-white/10 transition-colors">+{dayEvents.length - 3} mais</div>
                            )}
                        </div>
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div className="grid grid-cols-7" key={day.toString()}>
                    {days}
                </div>
            );
            days = [];
        }

        return (
            <div className="bg-zinc-900/50 border border-white/10 rounded-2xl flex flex-col backdrop-blur-sm overflow-hidden shadow-xl">
                <div className="grid grid-cols-7 bg-black/60 border-b border-white/10">
                    {weekDays}
                </div>
                <div className="flex flex-col border-l border-t border-white/5">
                    {rows}
                </div>
            </div>
        );
    };

    const renderTimeGrid = (daysToRender: Date[]) => {
        const START_HOUR = 8;
        const END_HOUR = 21;
        const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => i + START_HOUR);

        const currentHourOffset = getHours(currentTime) + getMinutes(currentTime) / 60 - START_HOUR;
        const currentTimeTop = currentHourOffset * 96; // 96px = h-24
        const showCurrentTimeLine = currentHourOffset >= -0.5 && currentHourOffset <= (END_HOUR - START_HOUR + 1);

        return (
            <div className="bg-zinc-900/50 border border-white/10 rounded-2xl flex flex-col h-[700px] backdrop-blur-sm shadow-xl overflow-hidden">
                <div className="flex border-b border-white/10 bg-black/60 shrink-0">
                    <div className="w-20 shrink-0 border-r border-white/10"></div>
                    {daysToRender.map((day, i) => (
                        <div key={i} className="flex-1 text-center py-4 border-r border-white/10 last:border-r-0">
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{format(day, 'EEE', { locale: pt })}</div>
                            <div className={cn(
                                "text-xl font-bold mx-auto w-10 h-10 flex items-center justify-center rounded-full transition-colors",
                                isSameDay(day, new Date()) ? "bg-primary text-black shadow-lg shadow-primary/20" : "text-white"
                            )}>
                                {format(day, 'd')}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex flex-1 overflow-y-auto relative scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    <div className="w-20 shrink-0 border-r border-white/10 bg-black/40 relative z-20">
                        {hours.map((hour) => (
                            <div key={hour} className="h-24 text-xs text-center text-gray-500 font-medium relative border-b border-white/5">
                                <span className="absolute -top-3 left-0 right-0 bg-transparent">{hour.toString().padStart(2, '0')}:00</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-1 relative min-w-[500px]">



                        {daysToRender.map((day, i) => {
                            const dayEvents = events.filter(e => isSameDay(e.start, day));

                            return (
                                <div key={i} className="flex-1 border-r border-white/10 last:border-r-0 relative">
                                    {hours.map((hour) => (
                                        <div key={hour} className="h-24 border-b border-white/5 hover:bg-white/[0.02] transition-colors"></div>
                                    ))}

                                    {/* Professional Red line for current time restricted to 'today' column */}
                                    {isSameDay(day, currentTime) && showCurrentTimeLine && (
                                        <div 
                                            className="absolute left-0 right-0 z-[40] flex items-center pointer-events-none"
                                            style={{ top: `${currentTimeTop}px`, transform: 'translateY(-50%)', transition: 'top 1s linear' }}
                                        >
                                            <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)] absolute -left-1.5 flex items-center justify-center">
                                                <div className="w-full h-full rounded-full bg-red-400 animate-ping opacity-75"></div>
                                            </div>
                                            <div className="w-full border-t-2 border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]"></div>
                                            <div className="absolute right-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-l-md shadow-lg pointer-events-auto">
                                                {format(currentTime, 'HH:mm')}
                                            </div>
                                        </div>
                                    )}

                                    {dayEvents.map(evt => {
                                        const startHourOffset = getHours(evt.start) + getMinutes(evt.start) / 60 - START_HOUR;
                                        const topPos = startHourOffset * 96; // 96px = h-24
                                        const endOffset = evt.end ? getHours(evt.end) + getMinutes(evt.end) / 60 - START_HOUR : startHourOffset + 1; // Assume 1 hr if no end
                                        const durationHours = endOffset - startHourOffset;
                                        const height = Math.max(durationHours * 96, 30); // min height

                                        if (topPos < 0) return null;

                                        return (
                                            <div
                                                key={evt.id}
                                                onClick={() => setSelectedEvent(evt)}
                                                className={cn(
                                                    "absolute left-1 right-1 rounded-lg p-2 border shadow-lg overflow-hidden z-10 hover:z-30 transition-all hover:scale-[1.02] hover:shadow-xl group backdrop-blur-md cursor-pointer",
                                                    getStatusStyle(evt.status)
                                                )}
                                                style={{ top: `${topPos}px`, height: `${height}px` }}
                                            >
                                                <div className="text-[11px] font-bold leading-tight opacity-80 mb-1">
                                                    {format(evt.start, 'HH:mm')} - {format(evt.end || addHours(evt.start, 1), 'HH:mm')}
                                                </div>
                                                <div className="text-sm font-bold truncate group-hover:whitespace-normal">{evt.title}</div>
                                                {evt.subtitle && <div className="text-[11px] font-medium opacity-90 truncate mt-1 group-hover:whitespace-normal">{evt.subtitle}</div>}
                                            </div>
                                        )
                                    })}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        );
    };

    const renderWeekView = () => {
        const start = startOfWeek(currentDate, { weekStartsOn: 1 });
        const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
        return renderTimeGrid(days);
    };

    const renderDayView = () => {
        return renderTimeGrid([currentDate]);
    };

    return (
        <div className="w-full flex flex-col bg-transparent animate-in fade-in zoom-in-95 duration-300">
            {renderHeader()}
            {view === 'month' && renderMonthView()}
            {view === 'week' && renderWeekView()}
            {view === 'day' && renderDayView()}

            {/* Event Details Modal */}
            {selectedEvent && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in" onClick={() => setSelectedEvent(null)}>
                    <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-xl font-bold text-white">Detalhes da Marcação</h3>
                            <button onClick={() => setSelectedEvent(null)} className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-2">Cliente</p>
                                <p className="text-white font-medium flex items-center gap-3 mb-2">
                                    <User className="w-4 h-4 text-primary"/> {selectedEvent.clientDetails?.name || selectedEvent.title}
                                </p>
                                {selectedEvent.clientDetails?.phone && (
                                    <p className="text-white font-medium flex items-center gap-3 mb-2">
                                        <Phone className="w-4 h-4 text-primary"/> {selectedEvent.clientDetails.phone}
                                    </p>
                                )}
                                {selectedEvent.clientDetails?.email && (
                                    <p className="text-white font-medium flex items-center gap-3">
                                        <Mail className="w-4 h-4 text-primary"/> {selectedEvent.clientDetails.email}
                                    </p>
                                )}
                            </div>
                            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-2">Serviço & Horário</p>
                                <p className="text-white font-medium mb-1">
                                    {format(selectedEvent.start, "d 'de' MMMM, yyyy", { locale: pt })}
                                </p>
                                <p className="text-primary font-bold">
                                    {format(selectedEvent.start, 'HH:mm')} - {format(selectedEvent.end || new Date(selectedEvent.start.getTime() + 60*60000), 'HH:mm')}
                                </p>
                                {selectedEvent.subtitle && <p className="text-gray-300 mt-2 text-sm">{selectedEvent.subtitle}</p>}
                            </div>
                        </div>

                        {/* Ações */}
                        <div className="mt-6 pt-6 border-t border-white/5 space-y-3">
                            {renderActions && renderActions(selectedEvent)}
                            <a
                                href={getGoogleCalendarUrl(
                                    `Corte - ${selectedEvent.title}`,
                                    selectedEvent.start,
                                    (selectedEvent.end?.getTime() - selectedEvent.start.getTime()) / 60000 || 60
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-bold rounded-xl transition-colors border border-blue-500/20"
                            >
                                <CalendarIcon className="w-5 h-5" /> Adicionar ao Google Calendar
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper for default end date if missing
const addHours = (date: Date, hours: number) => {
    return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

export default Calendar;
