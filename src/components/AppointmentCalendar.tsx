
import React, { useState } from 'react';
import { useSearchParams } from "react-router-dom";
import { 
  useBookedAppointments, 
  useUserData 
} from "@/hooks/useAppointmentData";
import { DateSelector } from "@/components/appointment/DateSelector";
import { TimeSelector } from "@/components/appointment/TimeSelector";
import { SuccessView } from "@/components/appointment/SuccessView";
import { confirmAppointment } from "@/components/appointment/appointmentService";

export const AppointmentCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'date' | 'time' | 'success'>('date');
  
  const { bookedAppointments, setBookedAppointments } = useBookedAppointments();
  const { ipAddress, userData } = useUserData();
  
  const [searchParams] = useSearchParams();
  const name = searchParams.get("name");
  const phone = searchParams.get("phone");
  const email = searchParams.get("email");
  
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
  
  // חזרה לבחירת תאריך
  const handleBackToDateSelection = () => {
    setStep('date');
  };
  
  // אישור קביעת הפגישה
  const handleConfirmAppointment = async () => {
    await confirmAppointment({
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
    });
  };

  // הצגת התצוגה המתאימה לפי השלב הנוכחי
  if (step === 'success') {
    return <SuccessView selectedDate={selectedDate} selectedTime={selectedTime} />;
  }

  if (step === 'date') {
    return (
      <DateSelector 
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
        bookedAppointments={bookedAppointments}
      />
    );
  }

  return (
    <TimeSelector
      selectedDate={selectedDate}
      selectedTime={selectedTime}
      onTimeSelect={handleTimeSelect}
      onBack={handleBackToDateSelection}
      onConfirm={handleConfirmAppointment}
      isSubmitting={isSubmitting}
      bookedAppointments={bookedAppointments}
    />
  );
};
