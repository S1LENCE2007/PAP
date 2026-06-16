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
    selectionMode?: boolean;
    selectedDates?: Date[];
    onDaySelect?: (date: Date) => void;
    blockedDays?: Date[];
    onUnblockDay?: (date: Date) => void;
}

const Calendar: React.FC<CalendarProps> = ({ events, view, onViewChange, currentDate, onDateChange, renderActions, selectionMode = false, selectedDates = [], onDaySelect, blockedDays = [], onUnblockDay }) => {
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
                    <button onClick={today} className="px-5 py-2 bg-card-bg hover:bg-white/10 rounded-xl text-sm font-bold transition-all duration-300 border border-white/5 hover:border-primary/30 text-white shadow-lg">Hoje</button>
                    <div className="flex gap-2">
                        <button onClick={prev} className="p-2 bg-card-bg hover:bg-white/10 rounded-xl transition-all duration-300 border border-white/5 hover:border-primary/30 text-white shadow-lg">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button onClick={next} className="p-2 bg-card-bg hover:bg-white/10 rounded-xl transition-all duration-300 border border-white/5 hover:border-primary/30 text-white shadow-lg">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                    <h2 className="text-2xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary capitalize min-w-[200px] text-center sm:text-left drop-shadow-md">
                        {format(currentDate, dateFormat, { locale: pt })}
                    </h2>
                </div>
                <div className="flex p-1.5 bg-card-bg/80 backdrop-blur-md rounded-xl border border-white/5 shadow-lg">
                    {(['month', 'week', 'day'] as ViewMode[]).map((v) => (
                        <button
                            key={v}
                            onClick={() => onViewChange(v)}
                            className={cn(
                                "px-5 py-2 rounded-lg text-sm font-bold transition-all duration-300 capitalize",
                                view === v ? "bg-gradient-to-r from-primary to-secondary text-dark shadow-md shadow-primary/20 scale-105" : "text-gray-400 hover:text-white hover:bg-white/5"
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

                const dayEvents = events.filter(e => isSameDay(e.start, cloneDay)).sort((a, b) => a.start.getTime() - b.start.getTime());

                const isSelected = selectedDates.some(d => isSameDay(d, cloneDay));
                const isBlocked = blockedDays.some(d => isSameDay(d, cloneDay));

                days.push(
                    <div
                        className={cn(
                            "min-h-[130px] p-2 border-r border-b border-white/5 transition-all duration-300 relative flex flex-col group",
                            !isSameMonth(day, monthStart) ? "bg-dark-bg/60 text-gray-600" : "bg-card-bg/40 text-gray-300 hover:bg-white/[0.03]",
                            isSameDay(day, new Date()) && !isSelected ? "bg-primary/5 ring-1 ring-inset ring-primary/20" : "",
                            selectionMode ? "cursor-pointer hover:bg-primary/10" : "",
                            isSelected ? "bg-primary/20 border-primary/50" : "",
                            isBlocked ? "bg-red-950/20" : ""
                        )}
                        onClick={() => {
                            if (selectionMode && onDaySelect) {
                                onDaySelect(cloneDay);
                            }
                        }}
                        key={day.toString()}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <span className={cn(
                                "text-sm font-bold w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300",
                                isSelected ? "bg-primary text-dark shadow-lg shadow-primary/40 scale-110" :
                                    isSameDay(day, new Date()) ? "bg-gradient-to-br from-primary to-secondary text-dark shadow-lg shadow-primary/30" : "group-hover:text-primary group-hover:bg-primary/10"
                            )}>
                                {formattedDate}
                            </span>
                            {isBlocked && onUnblockDay && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onUnblockDay(cloneDay); }}
                                    className="p-1 text-red-500 hover:text-white hover:bg-red-500 rounded transition-colors"
                                    title="Desbloquear Dia"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                        {isBlocked ? (
                            <div className="flex-1 flex items-center justify-center">
                                <span className="text-[10px] font-bold text-red-500/50 uppercase tracking-widest rotate-[-15deg]">Bloqueado</span>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-1.5 overflow-y-auto flex-1 scrollbar-hide pr-1">
                                {dayEvents.slice(0, 3).map((evt) => (
                                    <div
                                        key={evt.id}
                                        onClick={() => setSelectedEvent(evt)}
                                        className={cn("text-[11px] px-2 py-1.5 rounded-lg truncate border backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 cursor-pointer shadow-sm hover:shadow-md", getStatusStyle(evt.status))}
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
                        )}
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
            <div className="bg-card-bg/60 border border-white/5 rounded-2xl flex flex-col backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/50">
                <div className="grid grid-cols-7 bg-dark-bg/80 border-b border-white/5">
                    {weekDays}
                </div>
                <div className="flex flex-col border-l border-t border-white/5">
                    {rows}
                </div>
            </div>
        );
    };

    const renderTimeGrid = (daysToRender: Date[]) => {
        const START_HOUR = 9;
        const END_HOUR = 18;
        const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => i + START_HOUR);

        const currentHourOffset = getHours(currentTime) + getMinutes(currentTime) / 60 - START_HOUR;
        const currentTimeTop = currentHourOffset * 96; // 96px = h-24
        const showCurrentTimeLine = currentHourOffset >= -0.5 && currentHourOffset <= (END_HOUR - START_HOUR + 1);

        return (
            <div className="bg-card-bg/70 border border-white/5 rounded-3xl flex flex-col h-[700px] backdrop-blur-xl shadow-2xl shadow-black/50 overflow-hidden relative">
                <div className="flex flex-col flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    <div className="flex flex-col flex-1 min-w-[700px]">
                        <div className="flex border-b border-white/5 bg-dark-bg/80 shrink-0">
                            <div className="w-16 shrink-0 border-r border-white/5"></div>
                            {daysToRender.map((day, i) => (
                                <div key={i} className="flex-1 text-center py-4 border-r border-white/5 relative group">
                                    <div className="absolute inset-0 bg-gradient-to-b from-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{format(day, 'EEE', { locale: pt })}</div>
                                    <div className={cn(
                                        "text-xl font-bold mx-auto w-11 h-11 flex items-center justify-center rounded-full transition-all duration-300 relative z-10",
                                        isSameDay(day, new Date()) ? "bg-gradient-to-br from-primary to-secondary text-dark shadow-lg shadow-primary/30 scale-110" : "text-white group-hover:text-primary group-hover:bg-primary/10"
                                    )}>
                                        {format(day, 'd')}
                                    </div>
                                </div>
                            ))}
                            <div className="w-16 shrink-0"></div>
                        </div>

                        <div className="flex flex-1 overflow-y-auto relative scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                            <div className="flex min-w-full min-h-max pt-6 pb-8 relative">
                                {/* Global Current Time Line */}
                                {showCurrentTimeLine && (
                                    <div
                                        className="absolute left-16 right-0 z-[40] flex items-center pointer-events-none"
                                        style={{ top: `${currentTimeTop + 24}px`, transform: 'translateY(-50%)', transition: 'top 1s linear' }}
                                    >
                                        <div className="absolute -left-[3.5rem] bg-red-500 text-white text-[11px] font-bold px-1.5 py-0.5 rounded shadow-lg pointer-events-auto border border-red-500/20 z-20">
                                            {format(currentTime, 'HH:mm')}
                                        </div>
                                        <div className="absolute -left-2 w-3 h-3 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)] flex items-center justify-center z-10">
                                            <div className="w-full h-full rounded-full bg-red-400 animate-ping opacity-75"></div>
                                        </div>
                                        <div className="w-full border-t-2 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]"></div>
                                    </div>
                                )}
                                <div className="w-16 shrink-0 relative z-20 border-r border-white/5">
                                    {hours.map((hour) => (
                                        <div key={hour} className="h-24 relative">
                                            <div className="absolute -top-2.5 right-3 flex justify-end z-10 w-full">
                                                <span className={cn(
                                                    "text-[11px] font-bold tracking-wider",
                                                    hour === getHours(new Date())
                                                        ? "text-primary drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]"
                                                        : "text-gray-500"
                                                )}>
                                                    {hour.toString().padStart(2, '0')}:00
                                                </span>
                                            </div>
                                            {hour === END_HOUR && (
                                                <div className="absolute -bottom-2.5 right-3 flex justify-end z-10 w-full">
                                                    <span className={cn(
                                                        "text-[11px] font-bold tracking-wider",
                                                        (hour + 1) === getHours(new Date())
                                                            ? "text-primary drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]"
                                                            : "text-gray-500"
                                                    )}>
                                                        {(hour + 1).toString().padStart(2, '0')}:00
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="flex flex-1 relative">
                                    {daysToRender.map((day, i) => {
                                        const isBlocked = blockedDays.some(d => isSameDay(d, day));
                                        const dayEvents = events.filter(e => isSameDay(e.start, day));

                                        return (
                                            <div key={i} className="flex-1 border-r border-white/5 relative">
                                                {isBlocked && (
                                                    <div className="absolute inset-0 bg-red-900/10 z-[25] flex flex-col items-center justify-center backdrop-blur-[1px]">
                                                        <span className="text-red-500/60 font-bold tracking-widest uppercase rotate-[-90deg] whitespace-nowrap mb-8">Dia Bloqueado</span>
                                                        {onUnblockDay && (
                                                            <button
                                                                onClick={() => onUnblockDay(day)}
                                                                className="px-3 py-1.5 bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-lg text-xs font-bold transition-colors z-[30]"
                                                            >
                                                                Desbloquear
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                                {hours.map((hour) => (
                                                    <div key={hour} className={cn(
                                                        "h-24 border-b border-white/5 hover:bg-white/[0.02] transition-colors",
                                                        hour === START_HOUR && "border-t border-white/5"
                                                    )}></div>
                                                ))}

                                                {/* Removed localized time line so it can be global */}

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
                                                                "absolute left-1.5 right-1.5 rounded-xl p-3 border shadow-md overflow-hidden z-10 hover:z-30 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50 group backdrop-blur-md cursor-pointer",
                                                                getStatusStyle(evt.status)
                                                            )}
                                                            style={{ top: `${topPos}px`, height: `${height}px` }}
                                                        >
                                                            <div className="text-[11px] font-bold tracking-wider opacity-80 mb-1.5 bg-black/20 inline-block px-1.5 py-0.5 rounded-md">
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
                                <div className="w-16 shrink-0"></div>
                            </div>
                        </div>
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
            {selectedEvent && (() => {
                const startB = selectedEvent.start.getTime();
                const endB = selectedEvent.end.getTime();
                
                // Find all overlapping events (including selectedEvent itself)
                const overlapping = events.filter(e => {
                    const startA = e.start.getTime();
                    const endA = e.end.getTime();
                    return startA < endB && endA > startB;
                });
                
                return (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-dark-bg/80 backdrop-blur-md p-4 animate-in fade-in duration-300" onClick={() => setSelectedEvent(null)}>
                        <div className="bg-card-bg border border-white/10 rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl shadow-black/60 animate-in zoom-in-95 duration-300 relative" onClick={e => e.stopPropagation()}>
                            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-secondary"></div>
                            <div className="flex justify-between items-start mb-6 mt-2">
                                <div>
                                    <h3 className="text-2xl font-heading font-bold text-white">Detalhes da Marcação</h3>
                                    {overlapping.length > 1 && (
                                        <p className="text-sm text-yellow-500 font-medium mt-1">Existem {overlapping.length} marcações sobrepostas neste horário.</p>
                                    )}
                                </div>
                                <button onClick={() => setSelectedEvent(null)} className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors bg-dark-bg/50">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            
                            <div className="space-y-6">
                                {overlapping.map((evt, idx) => (
                                    <div key={evt.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 relative space-y-4">
                                        {overlapping.length > 1 && (
                                            <div className="absolute top-4 right-4 bg-primary/20 text-primary border border-primary/30 text-xs font-bold px-2 py-0.5 rounded-full">
                                                Marcação #{idx + 1}
                                            </div>
                                        )}
                                        
                                        <div className="space-y-2">
                                            <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Cliente</p>
                                            <p className="text-white font-medium flex items-center gap-3">
                                                <User className="w-4 h-4 text-primary" /> {evt.clientDetails?.name || evt.title}
                                            </p>
                                            {evt.clientDetails?.phone && (
                                                <p className="text-white font-medium flex items-center gap-3">
                                                    <Phone className="w-4 h-4 text-primary" /> {evt.clientDetails.phone}
                                                </p>
                                            )}
                                            {evt.clientDetails?.email && (
                                                <p className="text-white font-medium flex items-center gap-3">
                                                    <Mail className="w-4 h-4 text-primary" /> {evt.clientDetails.email}
                                                </p>
                                            )}
                                        </div>
                                        
                                        <div className="space-y-2 pt-2 border-t border-white/5">
                                            <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Serviço & Horário</p>
                                            <p className="text-white font-medium">
                                                {format(evt.start, "d 'de' MMMM, yyyy", { locale: pt })}
                                            </p>
                                            <p className="text-primary font-bold">
                                                {format(evt.start, 'HH:mm')} - {format(evt.end || new Date(evt.start.getTime() + 60 * 60000), 'HH:mm')}
                                            </p>
                                            {evt.subtitle && <p className="text-gray-300 text-sm">{evt.subtitle}</p>}
                                        </div>

                                        {/* Ações para cada evento individualmente */}
                                        <div className="pt-4 border-t border-white/5 space-y-3">
                                            {renderActions && renderActions(evt)}
                                            <a
                                                href={getGoogleCalendarUrl(
                                                    `Corte - ${evt.title}`,
                                                    evt.start,
                                                    ((evt.end?.getTime() || 0) - evt.start.getTime()) / 60000 || 60
                                                )}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-bold rounded-xl transition-colors border border-blue-500/20 text-sm"
                                            >
                                                <CalendarIcon className="w-4 h-4" /> Adicionar ao Google Calendar
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
};

// Helper for default end date if missing
const addHours = (date: Date, hours: number) => {
    return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

export default Calendar;
