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
    <Card className="max-w-md mx-auto border border-slate-300/30 shadow-lg backdrop-blur-sm bg-slate-800/10">
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-decorative">בחר תאריך לפגישה</h3>
          <p className="text-sm text-muted-foreground mt-2">נא לבחור מועד</p>
        </div>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={onDateSelect}
          disabled={(date) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const day = date.getDay();
            const isFridayOrSaturday = day === 5 || day === 6;
            const isFullyBooked = appointmentUtils.isDayFullyBooked(date, bookedAppointments);
            
            return date < today || isFridayOrSaturday || isFullyBooked;
          }}
          className={cn("mx-auto pointer-events-auto border border-slate-300/30 rounded-lg p-3")}
          classNames={{
            day_selected: "bg-slate-800 text-white hover:bg-slate-700",
            day_today: "bg-slate-100 text-slate-900",
            day: "hover:bg-slate-800/10",
          }}
        />
      </CardContent>
    </Card>
  );
};
