"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, isBefore, startOfToday } from "date-fns";
import { es } from "date-fns/locale";

interface CalendarProps {
    selectedDate: Date | null;
    onSelectDate: (date: Date) => void;
    availableDates?: Date[];
}

export function Calendar({ selectedDate, onSelectDate, availableDates = [] }: CalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [direction, setDirection] = useState(0);
    const today = startOfToday();

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const firstDayOfMonth = monthStart.getDay();
    const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

    const isDateAvailable = (date: Date) => {
        return availableDates.some(availableDate => isSameDay(availableDate, date));
    };

    const isDateDisabled = (date: Date) => {
        return isBefore(date, today) || !isDateAvailable(date);
    };

    const handlePrevMonth = () => {
        setDirection(-1);
        setCurrentMonth(subMonths(currentMonth, 1));
    };

    const handleNextMonth = () => {
        setDirection(1);
        setCurrentMonth(addMonths(currentMonth, 1));
    };

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 20 : -20,
            opacity: 0
        }),
        center: {
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            x: direction < 0 ? 20 : -20,
            opacity: 0
        })
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white border border-gray-200 rounded-2xl p-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <motion.h3
                    key={currentMonth.toString()}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-lg font-bold capitalize"
                >
                    {format(currentMonth, "MMMM yyyy", { locale: es })}
                </motion.h3>
                <div className="flex gap-2">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handlePrevMonth}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleNextMonth}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </motion.button>
                </div>
            </div>

            {/* Days of week */}
            <div className="grid grid-cols-7 gap-2 mb-2">
                {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
                    <div
                        key={day}
                        className="text-center text-xs font-medium text-gray-500 py-2"
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Days */}
            <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                    key={currentMonth.toString()}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-7 gap-2"
                >
                    {emptyDays.map((_, index) => (
                        <div key={`empty-${index}`} />
                    ))}
                    {daysInMonth.map((day, index) => {
                        const isSelected = selectedDate && isSameDay(day, selectedDate);
                        const isCurrentMonth = isSameMonth(day, currentMonth);
                        const isTodayDate = isToday(day);
                        const isDisabled = isDateDisabled(day);

                        return (
                            <motion.button
                                key={day.toString()}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.01 }}
                                whileHover={!isDisabled ? { scale: 1.1 } : {}}
                                whileTap={!isDisabled ? { scale: 0.95 } : {}}
                                onClick={() => !isDisabled && onSelectDate(day)}
                                disabled={isDisabled}
                                className={`
                  aspect-square rounded-lg text-sm font-medium transition-all
                  ${isSelected
                                        ? "bg-purple-600 text-white shadow-lg shadow-purple-200"
                                        : isDisabled
                                            ? "text-gray-300 cursor-not-allowed"
                                            : isTodayDate
                                                ? "bg-purple-50 text-purple-600 hover:bg-purple-100"
                                                : "hover:bg-gray-100"
                                    }
                  ${!isCurrentMonth && "text-gray-400"}
                `}
                            >
                                {format(day, "d")}
                            </motion.button>
                        );
                    })}
                </motion.div>
            </AnimatePresence>
        </motion.div>
    );
}