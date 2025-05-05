
import React from 'react';
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface SuccessViewProps {
  selectedDate: Date | undefined;
  selectedTime: string | undefined;
}

export const SuccessView = ({ selectedDate, selectedTime }: SuccessViewProps) => {
  return (
    <Card className="max-w-md mx-auto bg-white shadow-lg rounded-lg text-center">
      <CardContent className="p-8">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
          <CalendarIcon className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold mb-2">הפגישה נקבעה בהצלחה!</h3>
        <p className="text-gray-600">
          פגישתך נקבעה לתאריך {selectedDate && format(selectedDate, 'dd/MM/yyyy')} בשעה {selectedTime}
        </p>
      </CardContent>
    </Card>
  );
};
