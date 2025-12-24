import React, { useState, useRef, useEffect } from "react";
import Button from "@/components/ui/Button";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";

interface JourneyHeaderProps {
    title: string;
    startDate: Date;
    onTitleChange: (title: string) => void;
    onDateChange: (date: Date) => void;
    onSubmit: () => void;
    isSubmitting: boolean;
}

export const JourneyHeader: React.FC<JourneyHeaderProps> = ({
    title,
    startDate,
    onTitleChange,
    onDateChange,
    onSubmit,
    isSubmitting,
}) => {
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(startDate);
    const datePickerRef = useRef<HTMLDivElement>(null);

    // Close date picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
                setShowDatePicker(false);
            }
        };

        if (showDatePicker) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showDatePicker]);

    // Reset current month when date picker opens
    useEffect(() => {
        if (showDatePicker) {
            setCurrentMonth(startDate);
        }
    }, [showDatePicker, startDate]);

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    const handleDateSelect = (date: Date) => {
        onDateChange(date);
        setShowDatePicker(false);
    };

    const handlePrevMonth = () => {
        setCurrentMonth(subMonths(currentMonth, 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(addMonths(currentMonth, 1));
    };

    return (
        <div className="flex pb-3 items-center gap-3 w-full border-b border-gray-300">
            <h1 className="flex-1 text-black font-outfit text-2xl font-medium leading-[120%]">
                Journey Details
            </h1>

            {/* Date Selector */}
            <div className="relative flex items-center gap-2" ref={datePickerRef}>
                <button
                    onClick={() => setShowDatePicker(true)}
                    className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                >
                    <span className="text-black font-manrope text-sm font-normal">
                        {startDate.toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                        })}
                    </span>
                    <svg
                        className="w-4 h-4 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                    </svg>
                </button>

                {/* Date Picker Calendar */}
                {showDatePicker && (
                    <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 w-80">
                        {/* Calendar Header */}
                        <div className="flex items-center justify-between mb-4">
                            <button
                                onClick={handlePrevMonth}
                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                                type="button"
                            >
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <h3 className="text-sm font-semibold text-gray-900 font-manrope">
                                {format(currentMonth, "MMMM yyyy")}
                            </h3>
                            <button
                                onClick={handleNextMonth}
                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                                type="button"
                            >
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>

                        {/* Weekday Headers */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Days */}
                        <div className="grid grid-cols-7 gap-1">
                            {calendarDays.map((day, idx) => {
                                const isCurrentMonth = isSameMonth(day, currentMonth);
                                const isSelected = isSameDay(day, startDate);
                                const isToday = isSameDay(day, new Date());

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleDateSelect(day)}
                                        className={`
                                            aspect-square text-sm rounded transition-colors
                                            ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                                            ${isSelected 
                                                ? 'bg-blue-10 text-white font-semibold border border-black' 
                                                : isToday
                                                ? 'bg-blue-50 text-blue-600 font-semibold'
                                                : 'hover:bg-gray-100'
                                            }
                                        `}
                                        type="button"
                                    >
                                        {format(day, 'd')}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            <Button
                variant="primary"
                size="sm"
                onClick={onSubmit}
                disabled={isSubmitting}
            >
                {isSubmitting ? "Creating..." : "Review & Post"}
            </Button>
        </div>
    );
};
