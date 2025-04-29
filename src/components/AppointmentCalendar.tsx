
import React, { useState } from 'react';
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardFooter
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

// שעות זמינות לפגישות
const availableHours = [
  "09:00", "10:00", "11:00", "12:00", "13:00", 
  "14:00", "15:00", "16:00", "17:00", "18:00"
];

export const AppointmentCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'date' | 'time' | 'success'>('date');
  
  const [searchParams] = useSearchParams();
  const name = searchParams.get("name");
  const phone = searchParams.get("phone");
  const email = searchParams.get("email");
  
  // בחירת תאריך
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      setStep('time');
    }
  };
  
  // בחירת שעה
  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };
  
  // אישור קביעת הפגישה
  const confirmAppointment = async () => {
    if (!selectedDate || !selectedTime) {
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "יש לבחור תאריך ושעה",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // אחזור כתובת ה-IP של המשתמש
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipResponse.json();
      const ipAddress = ipData?.ip || 'unknown';
      
      // הכנת הנתונים להוספה לטבלה
      const appointmentData = {
        name: name || "אורח",
        phone: phone || "",
        email: email || null,
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedTime,
        ip_address: ipAddress,
        user_id: null // ברירת מחדל - יתעדכן אם נמצא משתמש קיים
      };
      
      // חיפוש משתמש קיים לפי טלפון או אימייל אם קיימים
      if (phone || email) {
        const { data: userData } = await supabase
          .from('registration_data')
          .select('user_id')
          .or(`phone.eq.${phone},email.eq.${email}`)
          .maybeSingle();
          
        if (userData) {
          appointmentData.user_id = userData.user_id;
        }
      }
      
      // הוספת הנתונים לטבלת הפגישות
      const { error } = await supabase
        .from('appointments')
        .insert([appointmentData]);
      
      if (error) {
        throw new Error(error.message);
      }
      
      // עדכון המצב לאחר שליחה מוצלחת
      setStep('success');
      
      // הצגת הודעת הצלחה
      toast({
        title: "הפגישה נקבעה בהצלחה!",
        description: `פגישתך נקבעה לתאריך ${format(selectedDate, 'dd/MM/yyyy')} בשעה ${selectedTime}`,
      });
      
    } catch (error) {
      console.error("שגיאה בקביעת הפגישה:", error);
      toast({
        variant: "destructive",
        title: "שגיאה בקביעת הפגישה",
        description: "אירעה שגיאה בעת קביעת הפגישה. אנא נסה שוב מאוחר יותר.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // תצוגה של הודעת הצלחה
  if (step === 'success') {
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
  }

  // תצוגת בחירת תאריך
  if (step === 'date') {
    return (
      <Card className="max-w-md mx-auto bg-white shadow-lg rounded-lg">
        <CardContent className="p-6">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold">בחר תאריך לפגישה</h3>
          </div>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={(date) => {
              // אין אפשרות לבחור תאריכים בעבר
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              
              // אין פגישות בשישי ושבת
              const day = date.getDay();
              const isFridayOrSaturday = day === 5 || day === 6;
              
              return date < today || isFridayOrSaturday;
            }}
            className={cn("mx-auto pointer-events-auto")}
          />
        </CardContent>
      </Card>
    );
  }

  // תצוגת בחירת שעה
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
          {availableHours.map((time) => (
            <Button
              key={time}
              variant={selectedTime === time ? "default" : "outline"}
              className={cn(
                "h-12",
                selectedTime === time ? "border-primary" : ""
              )}
              onClick={() => handleTimeSelect(time)}
            >
              {time}
            </Button>
          ))}
        </div>
        
        <div className="mt-6 flex items-center gap-2">
          <Button 
            variant="outline" 
            className="w-1/2"
            onClick={() => setStep('date')}
          >
            חזרה לבחירת תאריך
          </Button>
          
          <Button 
            className="w-1/2" 
            onClick={confirmAppointment}
            disabled={!selectedTime || isSubmitting}
          >
            {isSubmitting ? "אנא המתן..." : "אישור פגישה"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
