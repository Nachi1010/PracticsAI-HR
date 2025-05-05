
import React, { useState, useEffect } from 'react';
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
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
  const [ipAddress, setIpAddress] = useState<string | null>(null);
  const [userData, setUserData] = useState<{
    name?: string | null;
    phone?: string | null;
    email?: string | null;
    user_id?: string | null;
  } | null>(null);
  
  // מערך של פגישות שכבר נקבעו
  const [bookedAppointments, setBookedAppointments] = useState<{
    date: string;
    time: string;
  }[]>([]);
  
  // מספר מירבי של פגישות מותרות ליום
  const MAX_APPOINTMENTS_PER_DAY = 5;
  
  // פונקציה שבודקת האם יום מסוים מלא בפגישות
  const isDayFullyBooked = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const appointmentsOnDay = bookedAppointments.filter(app => app.date === dateStr);
    return appointmentsOnDay.length >= MAX_APPOINTMENTS_PER_DAY;
  };
  
  // פונקציה שבודקת האם שעה מסוימת תפוסה
  const isTimeSlotBooked = (time: string) => {
    if (!selectedDate) return false;
    
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return bookedAppointments.some(app => app.date === dateStr && app.time === time);
  };
  
  const [searchParams] = useSearchParams();
  const name = searchParams.get("name");
  const phone = searchParams.get("phone");
  const email = searchParams.get("email");
  
  // קבלת כתובת IP של המשתמש בטעינת הדף מתוך שירות חיצוני
  useEffect(() => {
    const fetchIpAddress = async () => {
      try {
        // שימוש ב-ipify API לקבלת האייפי האמיתי של הלקוח
        const response = await fetch('https://api.ipify.org?format=json');
        
        // אם התגובה אינה תקינה, ננסה שירות IP חלופי
        if (!response.ok) {
          const backupResponse = await fetch('https://ipapi.co/json/');
          const backupData = await backupResponse.json();
          setIpAddress(backupData.ip);
          console.log("קבלת כתובת IP משירות גיבוי:", backupData.ip);
          
          // לאחר קבלת האיפי, חפש את המשתמש בטבלאות
          if (backupData.ip) {
            await findUserByIp(backupData.ip);
          }
          return;
        }
        
        const data = await response.json();
        setIpAddress(data.ip);
        console.log("קבלת כתובת IP מהשירות הראשי:", data.ip);
        
        // לאחר קבלת האיפי, חפש את המשתמש בטבלאות
        if (data.ip) {
          await findUserByIp(data.ip);
        }
      } catch (error) {
        console.error("שגיאה בקבלת כתובת IP:", error);
        // ניסיון אחרון דרך שירות שלישי
        try {
          const lastResortResponse = await fetch('https://api.ipdata.co?api-key=test');
          const lastResortData = await lastResortResponse.json();
          setIpAddress(lastResortData.ip);
          console.log("קבלת כתובת IP משירות שלישי:", lastResortData.ip);
          
          if (lastResortData.ip) {
            await findUserByIp(lastResortData.ip);
          }
        } catch (finalError) {
          console.error("כל ניסיונות קבלת כתובת IP נכשלו:", finalError);
        }
      }
    };
    
    fetchIpAddress();
  }, []);
  
  // טעינת הפגישות הקיימות מהדאטאבייס בטעינת הדף
  useEffect(() => {
    const fetchBookedAppointments = async () => {
      try {
        console.log("מתחיל טעינת פגישות קיימות...");
        const { data, error } = await supabase
          .from('appointments')
          .select('date, time')
          .neq('status', 'cancelled'); // לא כולל פגישות שבוטלו
        
        if (error) {
          console.error("שגיאה בטעינת פגישות קיימות:", error);
          return;
        }
        
        if (data) {
          // המרת ערכי התאריך לפורמט אחיד (yyyy-MM-dd)
          const formattedAppointments = data.map(app => ({
            date: new Date(app.date).toISOString().split('T')[0],
            time: app.time
          }));
          
          setBookedAppointments(formattedAppointments);
          console.log("נטענו פגישות קיימות:", formattedAppointments.length);
          console.log("פרטי הפגישות:", formattedAppointments);
        }
      } catch (error) {
        console.error("שגיאה בטעינת פגישות:", error);
      }
    };
    
    fetchBookedAppointments();
  }, []);
  
  // חיפוש משתמש לפי IP בטבלאות הקיימות
  const findUserByIp = async (ip: string) => {
    try {
      // נסה למצוא את המשתמש בטבלת appointments
      const { data: appointmentData } = await supabase
        .from('appointments')
        .select('name, phone, email, user_id')
        .eq('ip_address', ip)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (appointmentData && appointmentData.length > 0) {
        setUserData({
          name: appointmentData[0].name,
          phone: appointmentData[0].phone,
          email: appointmentData[0].email,
          user_id: appointmentData[0].user_id
        });
        console.log("נמצא משתמש בטבלת appointments:", appointmentData[0]);
        return;
      }
      
      // אם לא נמצא, חפש בטבלת registration_data
      try {
        const { data: registrationData, error: registrationError } = await supabase
          .from('registration_data')
          .select('name, phone, email, user_id')
          .eq('metadata->>ip_address', ip)
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (registrationError) {
          console.error("שגיאה בחיפוש בטבלת registration_data:", registrationError);
        } else if (registrationData && registrationData.length > 0) {
          setUserData({
            name: registrationData[0].name,
            phone: registrationData[0].phone,
            email: registrationData[0].email,
            user_id: registrationData[0].user_id
          });
          console.log("נמצא משתמש בטבלת registration_data:", registrationData[0]);
          return;
        }
      } catch (registrationQueryError) {
        console.error("שגיאה בשאילתת registration_data:", registrationQueryError);
      }
      
      // אם עדיין לא נמצא, חפש בטבלת questionnaire_data
      const { data: questionnaireData } = await supabase
        .from('questionnaire_data')
        .select('contact_info, user_id')
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (questionnaireData && questionnaireData.length > 0 && questionnaireData[0].contact_info) {
        const contactInfo = questionnaireData[0].contact_info as Record<string, any>;
        setUserData({
          name: contactInfo.name || null,
          phone: contactInfo.phone || null,
          email: contactInfo.email || null,
          user_id: questionnaireData[0].user_id
        });
        console.log("נמצא משתמש בטבלת questionnaire_data:", contactInfo);
      }
    } catch (error) {
      console.error("שגיאה בחיפוש משתמש:", error);
    }
  };
  
  // בחירת תאריך
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime(undefined); // ביטול בחירת שעה קודמת
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
    
    // בדיקה נוספת שהשעה אינה תפוסה לפני השליחה
    const dateString = format(selectedDate, 'yyyy-MM-dd');
    const isBooked = bookedAppointments.some(
      app => app.date === dateString && app.time === selectedTime
    );
    
    if (isBooked) {
      toast({
        variant: "destructive",
        title: "שעה תפוסה",
        description: "השעה שבחרת כבר תפוסה, אנא בחר שעה אחרת",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // שימוש בנתונים מהפרמטרים, או מהמשתמש שנמצא, או ברירת מחדל
      const appointmentName = name || (userData && userData.name) || "אורח";
      const appointmentPhone = phone || (userData && userData.phone) || "";
      const appointmentEmail = email || (userData && userData.email) || null;
      const appointmentUserId = userData && userData.user_id;
      
      // הכנת הנתונים להוספה לטבלה
      const appointmentData = {
        name: appointmentName,
        phone: appointmentPhone,
        email: appointmentEmail,
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedTime,
        ip_address: ipAddress,
        user_id: appointmentUserId || null
      };
      
      // הוספת הנתונים לטבלת הפגישות
      const { error } = await supabase
        .from('appointments')
        .insert([appointmentData]);
      
      if (error) {
        throw new Error(error.message);
      }
      
      // עדכון המצב לאחר שליחה מוצלחת
      setStep('success');
      
      // הוספת הפגישה החדשה למערך הפגישות המקומי
      setBookedAppointments([
        ...bookedAppointments, 
        { date: format(selectedDate, 'yyyy-MM-dd'), time: selectedTime }
      ]);
      
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
              
              // בדיקה האם היום מלא בפגישות
              const isFullyBooked = isDayFullyBooked(date);
              
              return date < today || isFridayOrSaturday || isFullyBooked;
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
          {availableHours.map((time) => {
            const isBooked = isTimeSlotBooked(time);
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
                onClick={() => handleTimeSelect(time)}
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
