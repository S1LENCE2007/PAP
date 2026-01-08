import React, { useState } from 'react';
import {
    format,
    addDays,
    startOfWeek,
    addWeeks,
    subWeeks,
    isSameDay,
    isBefore,
    startOfDay
} from 'date-fns';
import { pt } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

interface WeeklyCalendarProps {
    selectedDate: Date | null;
    onDateSelect: (date: Date) => void;
}

const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({ selectedDate, onDateSelect }) => {
    const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
    const [direction, setDirection] = useState(0);

    // Determine if we can go back (prevent going before current week)
    const today = startOfDay(new Date());
    const isCurrentWeek = isSameDay(startOfWeek(today, { weekStartsOn: 1 }), currentWeekStart);

    const nextWeek = () => {
        setDirection(1);
        setCurrentWeekStart(addWeeks(currentWeekStart, 1));
    };

    const prevWeek = () => {
        if (isCurrentWeek) return;
        setDirection(-1);
        setCurrentWeekStart(subWeeks(currentWeekStart, 1));
    };

    const days = [];
    let day = currentWeekStart;

    for (let i = 0; i < 7; i++) {
        days.push(day);
        day = addDays(day, 1);
    }

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 50 : -50,
            opacity: 0
        }),
        center: {
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            x: direction > 0 ? -50 : 50,
            opacity: 0
        })
    };

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white capitalize flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-primary" />
                    {format(currentWeekStart, 'MMMM yyyy', { locale: pt })}
                </h3>
                <div className="flex gap-2">
                    <button
                        onClick={prevWeek}
                        disabled={isCurrentWeek}
                        className={clsx(
                            "p-2 rounded-lg border transition-colors",
                            isCurrentWeek
                                ? "border-gray-800 text-gray-600 cursor-not-allowed"
                                : "border-gray-700 text-gray-400 hover:text-white hover:border-primary"
                        )}
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={nextWeek}
                        className="p-2 rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:border-primary transition-colors"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="bg-dark-bg/50 rounded-xl p-4 border border-white/5 overflow-hidden">
                <AnimatePresence mode="popLayout" custom={direction}>
                    <motion.div
                        key={currentWeekStart.toISOString()}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
                        className="grid grid-cols-7 gap-1 md:gap-2"
                    >
                        {days.map((dayDate, idx) => {
                            const isPast = isBefore(dayDate, today);
                            const isSelected = selectedDate && isSameDay(dayDate, selectedDate);
                            const isToday = isSameDay(dayDate, today);

                            return (
                                <button
                                    key={idx}
                                    onClick={() => !isPast && onDateSelect(dayDate)}
                                    disabled={isPast}
                                    className={clsx(
                                        "flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 relative group min-h-[70px]",
                                        isSelected ? "bg-primary text-black shadow-[0_0_15px_rgba(212,175,55,0.4)] scale-105 z-10" : "bg-card-bg hover:bg-white/5 text-gray-400",
                                        isPast && "opacity-30 cursor-not-allowed hover:bg-card-bg",
                                        isToday && !isSelected && "border border-primary/50 text-primary"
                                    )}
                                >
                                    <span className="text-[10px] md:text-xs uppercase font-bold mb-1 opacity-70">
                                        {format(dayDate, 'EEE', { locale: pt }).replace('.', '')}
                                    </span>
                                    <span className={clsx(
                                        "text-base md:text-lg font-bold",
                                        isSelected ? "text-black" : "text-white"
                                    )}>
                                        {format(dayDate, 'd')}
                                    </span>
                                    {isSelected && (
                                        <motion.div
                                            layoutId="selectedIndicator"
                                            className="absolute -bottom-1 w-1 h-1 bg-black rounded-full"
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </motion.div>
                </AnimatePresence>
            </div>

            {selectedDate && (
                <div className="mt-4 text-center">
                    <p className="text-gray-400 text-sm">
                        Dia selecionado: <span className="text-primary font-bold capitalize">{format(selectedDate, "EEEE, d 'de' MMMM", { locale: pt })}</span>
                    </p>
                </div>
            )}
        </div>
    );
};

export default WeeklyCalendar;
