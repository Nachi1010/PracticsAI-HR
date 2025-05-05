
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
    <Card className="max-w-md mx-auto bg-white shadow-lg rounded-lg">
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-2">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">בחר שעה לפגישה</h3>
          <p className="text-gray-500 text-sm mt-1">
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
                  "h-12",
                  selectedTime === time ? "border-primary" : ""
                )}
                onClick={() => onTimeSelect(time)}
              >
                {time}
              </Button>
            );
          })}
        </div>
        
        <div className="mt-6 flex items-center gap-2">
          <Button 
            variant="outline" 
            className="w-1/2"
            onClick={onBack}
          >
            חזרה לבחירת תאריך
          </Button>
          
          <Button 
            className="w-1/2" 
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
