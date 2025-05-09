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
    <Card className="max-w-md mx-auto border border-slate-200/20 backdrop-blur-sm section-border">
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-decorative">בחר תאריך לפגישה</h3>
          <p className="text-sm text-muted-foreground mt-2">נא לבחור בתאריך פנוי (לא כולל סופי שבוע)</p>
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
          className={cn("mx-auto pointer-events-auto border border-slate-200/30 rounded-lg p-3")}
          classNames={{
            day_selected: "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white",
            day_today: "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50",
          }}
        />
      </CardContent>
    </Card>
  );
};
