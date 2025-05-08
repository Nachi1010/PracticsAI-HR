import React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { confirmAppointment } from "@/components/appointment/appointmentService";
import { useUserData } from "@/hooks/useAppointmentData";
import { useSearchParams } from "react-router-dom";

export const LandingFooter = () => {
  const { ipAddress, userData } = useUserData();
  const [searchParams] = useSearchParams();

  const name = searchParams.get("name");
  const phone = searchParams.get("phone");
  const email = searchParams.get("email");

  const handleCallMeClick = async () => {
    try {
      // יוצר תאריך דיפולטי להיום בשעה 00:00
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // קורא לשירות תיאום פגישה עם הפרטים המתאימים
      await confirmAppointment({
        selectedDate: today,
        selectedTime: "00:00",
        ipAddress,
        userData,
        name,
        phone,
        email,
        bookedAppointments: [],
        setBookedAppointments: () => {},
        setStep: () => {},
        setIsSubmitting: () => {}
      });

      toast({
        title: "תודה רבה!",
        description: "צוות האי שלנו יצור איתך קשר בהקדם.",
      });
    } catch (error) {
      console.error("שגיאה בעת שליחת הבקשה:", error);
      toast({
        title: "אופס, משהו השתבש",
        description: "אנא נסו שוב מאוחר יותר או פנו אלינו ישירות",
        variant: "destructive"
      });
    }
  };

  return (
    <footer className="bg-transparent pt-12 pb-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center mb-8">
          <Button 
            variant="outline"
            className="mb-8 px-8 py-4 text-lg"
            onClick={handleCallMeClick}
          >
            אני מעדיף/ה שפשוט תתקשרו אליי
          </Button>
          
          <div className="text-center mt-4 text-muted-foreground">
            <p className="text-sm max-w-xl mx-auto">
              האי - המכון ללימודי בינה מלאכותית מתקדמת. מסייעים לאנשי מקצוע להתמחות בתחום הבינה המלאכותית, התוכנות המתקדמות וממשקי הבקשות.
            </p>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-center items-center text-sm text-muted-foreground">
          <p>© 2025 כל הזכויות שמורות | האי - המכון ללימודי בינה מלאכותית</p>
        </div>
      </div>
    </footer>
  );
};
