import React, { useState } from 'react';
import Button from '@/components/ui/Button';

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
  isSubmitting
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  return (
    <div className="flex pb-3 items-center gap-3 w-full border-b border-gray-300">
      <h1 className="flex-1 text-black font-outfit text-2xl font-medium leading-[120%]">
        Journey Details
      </h1>
      
      {/* Date Selector */}
      <div className="relative flex items-center gap-2">
        <span className="text-black font-manrope text-sm font-normal">
          {startDate.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
          })}
        </span>
        <button
          onClick={() => setShowDatePicker(!showDatePicker)}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
        
        {/* Date Picker Dropdown */}
        {showDatePicker && (
          <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
            <input
              type="date"
              value={startDate.toISOString().split('T')[0]}
              onChange={(e) => {
                onDateChange(new Date(e.target.value));
                setShowDatePicker(false);
              }}
              className="border border-gray-300 rounded px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
            />
          </div>
        )}
      </div>
      
      <Button 
        variant="primary" 
        size="sm" 
        onClick={onSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Creating...' : 'Review & Post'}
      </Button>
    </div>
  );
};
