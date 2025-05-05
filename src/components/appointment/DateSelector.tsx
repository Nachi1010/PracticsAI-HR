
import React from 'react';
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { appointmentUtils, BookedAppointment } from "@/hooks/useAppointmentData";

interface DateSelectorProps {
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
  bookedAppointments: BookedAppointment[];
}

export const DateSelector = ({ selectedDate, onDateSelect, bookedAppointments }: DateSelectorProps) => {
  return (
    <Card className="max-w-md mx-auto bg-white shadow-lg rounded-lg">
      <CardContent className="p-6">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold">בחר תאריך לפגישה</h3>
        </div>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={onDateSelect}
          disabled={(date) => {
            // אין אפשרות לבחור תאריכים בעבר
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            // אין פגישות בשישי ושבת
            const day = date.getDay();
            const isFridayOrSaturday = day === 5 || day === 6;
            
            // בדיקה האם היום מלא בפגישות
            const isFullyBooked = appointmentUtils.isDayFullyBooked(date, bookedAppointments);
            
            return date < today || isFridayOrSaturday || isFullyBooked;
          }}
          className={cn("mx-auto pointer-events-auto")}
        />
      </CardContent>
    </Card>
  );
};
