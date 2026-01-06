import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format, addDays, isBefore, startOfToday } from 'date-fns';
import { CalendarIcon, Clock, Truck } from 'lucide-react';

export interface DeliverySchedule {
  date: Date | null;
  timeSlot: string | null;
}

interface TimeSlot {
  id: string;
  label: string;
  time: string;
  available: boolean;
  premium: boolean;
}

const TIME_SLOTS: TimeSlot[] = [
  { id: 'morning', label: 'Morning', time: '9:00 AM - 12:00 PM', available: true, premium: false },
  { id: 'afternoon', label: 'Afternoon', time: '12:00 PM - 4:00 PM', available: true, premium: false },
  { id: 'evening', label: 'Evening', time: '4:00 PM - 8:00 PM', available: true, premium: true },
  { id: 'express', label: 'Express', time: '2-4 hours', available: true, premium: true },
];

interface DeliverySchedulerProps {
  value: DeliverySchedule;
  onChange: (schedule: DeliverySchedule) => void;
}

export const DeliveryScheduler: React.FC<DeliverySchedulerProps> = ({ value, onChange }) => {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const today = startOfToday();
  const minDate = today;
  const maxDate = addDays(today, 30);

  const handleDateSelect = (date: Date | undefined) => {
    onChange({ ...value, date: date || null });
    setCalendarOpen(false);
  };

  const handleTimeSlotSelect = (slotId: string) => {
    onChange({ ...value, timeSlot: slotId });
  };

  const isDateDisabled = (date: Date) => {
    return isBefore(date, minDate) || isBefore(maxDate, date);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Truck className="w-4 h-4" />
          Delivery Scheduling
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Date Picker */}
        <div className="space-y-2">
          <Label className="text-sm">Delivery Date</Label>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !value.date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value.date ? format(value.date, "EEEE, MMMM d, yyyy") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={value.date || undefined}
                onSelect={handleDateSelect}
                disabled={isDateDisabled}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Time Slots */}
        <div className="space-y-2">
          <Label className="text-sm flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" />
            Time Slot
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {TIME_SLOTS.map((slot) => (
              <button
                key={slot.id}
                className={cn(
                  "relative p-3 rounded-lg border-2 transition-all text-left",
                  value.timeSlot === slot.id
                    ? "border-primary bg-primary/5"
                    : "border-muted hover:border-primary/50",
                  !slot.available && "opacity-50 cursor-not-allowed"
                )}
                onClick={() => slot.available && handleTimeSlotSelect(slot.id)}
                disabled={!slot.available}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{slot.label}</span>
                  {slot.premium && (
                    <Badge variant="secondary" className="text-[10px] h-5">
                      Premium
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">{slot.time}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        {value.date && value.timeSlot && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Scheduled:</span>{' '}
              {format(value.date, "MMM d, yyyy")} • {TIME_SLOTS.find(s => s.id === value.timeSlot)?.time}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
