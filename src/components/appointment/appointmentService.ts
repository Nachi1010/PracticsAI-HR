
import { format } from "date-fns";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BookedAppointment } from "@/hooks/useAppointmentData";

export const confirmAppointment = async ({
  selectedDate,
  selectedTime,
  ipAddress,
  userData,
  name,
  phone,
  email,
  bookedAppointments,
  setBookedAppointments,
  setStep,
  setIsSubmitting
}: {
  selectedDate: Date | undefined;
  selectedTime: string | undefined;
  ipAddress: string | null;
  userData: { name?: string | null; phone?: string | null; email?: string | null; user_id?: string | null } | null;
  name: string | null;
  phone: string | null;
  email: string | null;
  bookedAppointments: BookedAppointment[];
  setBookedAppointments: React.Dispatch<React.SetStateAction<BookedAppointment[]>>;
  setStep: React.Dispatch<React.SetStateAction<'date' | 'time' | 'success'>>;
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
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
