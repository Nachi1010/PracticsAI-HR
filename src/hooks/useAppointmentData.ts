
import { useState, useEffect } from 'react';
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

// שעות זמינות לפגישות
export const availableHours = [
  "09:00", "10:00", "11:00", "12:00", "13:00", 
  "14:00", "15:00", "16:00", "17:00", "18:00"
];

// מספר מירבי של פגישות מותרות ליום
export const MAX_APPOINTMENTS_PER_DAY = 5;

// סוג הנתונים של פגישה קיימת
export interface BookedAppointment {
  date: string;
  time: string;
}

// סוג הנתונים של המשתמש
export interface UserData {
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  user_id?: string | null;
}

/**
 * הוק לניהול טעינת פגישות קיימות
 */
export const useBookedAppointments = () => {
  const [bookedAppointments, setBookedAppointments] = useState<BookedAppointment[]>([]);
  
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
  
  return { 
    bookedAppointments, 
    setBookedAppointments 
  };
};

/**
 * הוק לניהול נתוני המשתמש לפי כתובת IP
 */
export const useUserData = () => {
  const [ipAddress, setIpAddress] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  
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
  
  return { ipAddress, userData };
};

/**
 * פונקציות עזר לבדיקת זמינות פגישות
 */
export const appointmentUtils = {
  // פונקציה שבודקת האם יום מסוים מלא בפגישות
  isDayFullyBooked: (date: Date, bookedAppointments: BookedAppointment[]) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const appointmentsOnDay = bookedAppointments.filter(app => app.date === dateStr);
    return appointmentsOnDay.length >= MAX_APPOINTMENTS_PER_DAY;
  },
  
  // פונקציה שבודקת האם שעה מסוימת תפוסה
  isTimeSlotBooked: (date: Date | undefined, time: string, bookedAppointments: BookedAppointment[]) => {
    if (!date) return false;
    
    const dateStr = format(date, 'yyyy-MM-dd');
    return bookedAppointments.some(app => app.date === dateStr && app.time === time);
  }
};
