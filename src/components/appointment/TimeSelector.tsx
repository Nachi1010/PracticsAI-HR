import React from 'react';
import { format } from "date-fns";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { availableHours, appointmentUtils, BookedAppointment } from "@/hooks/useAppointmentData";

interface TimeSelectorProps {
  selectedDate: Date | undefined;
  selectedTime: string | undefined;
  onTimeSelect: (time: string) => void;
  onBack: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
  bookedAppointments: BookedAppointment[];
}

export const TimeSelector = ({
  selectedDate,
  selectedTime,
  onTimeSelect,
  onBack,
  onConfirm,
  isSubmitting,
  bookedAppointments
}: TimeSelectorProps) => {
  return (
    <Card className="max-w-md mx-auto border border-slate-300/30 shadow-lg backdrop-blur-sm bg-slate-800/10">
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-2 bg-slate-800/20 rounded-full mb-2">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-decorative">בחר שעה לפגישה</h3>
          <p className="text-muted-foreground text-sm mt-2">
            לתאריך: {selectedDate && format(selectedDate, 'dd/MM/yyyy')}
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {availableHours.map((time) => {
            const isBooked = appointmentUtils.isTimeSlotBooked(selectedDate, time, bookedAppointments);
            // אם השעה תפוסה, לא מציגים אותה בכלל
            if (isBooked) {
              return null;
            }
            
            return (
              <Button
                key={time}
                variant={selectedTime === time ? "default" : "outline"}
                className={cn(
                  "h-12 transition-all",
                  selectedTime === time 
                    ? "bg-slate-800 text-white border-none shadow-md hover:bg-slate-700" 
                    : "border-slate-300/30 hover:border-slate-300/50 hover:bg-slate-700/10"
                )}
                onClick={() => onTimeSelect(time)}
              >
                {time}
              </Button>
            );
          })}
        </div>
        
        <div className="mt-8 flex items-center gap-3">
          <Button 
            variant="outline" 
            className="w-1/2 border-slate-300/30 hover:border-slate-300/50 hover:bg-slate-700/10"
            onClick={onBack}
          >
            חזרה לבחירת תאריך
          </Button>
          
          <Button 
            className={cn(
              "w-1/2",
              !selectedTime || isSubmitting
                ? "opacity-70"
                : "bg-slate-800 hover:bg-slate-700 text-white shadow-md"
            )}
            onClick={onConfirm}
            disabled={!selectedTime || isSubmitting}
          >
            {isSubmitting ? "אנא המתן..." : "אישור פגישה"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
