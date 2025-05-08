import React from "react";
import { LandingHeader } from "@/components/LandingHeader";
import { AppointmentCalendar } from "@/components/AppointmentCalendar";
import { LandingFooter } from "@/components/LandingFooter";
import { AnimatedBackground } from "@/components/AnimatedBackground";

const Index = () => {
  return (
    <AnimatedBackground>
      <div className="min-h-screen flex flex-col" dir="rtl">
        <LandingHeader />
        
        <div className="container mx-auto px-4 py-6 flex-grow flex flex-col items-center justify-center">
          <h2 className="text-2xl font-medium text-center mb-8">בחרו מועד לפגישת התאמה ראשונית</h2>
          
          <div className="w-full max-w-3xl mx-auto bg-card/80 backdrop-blur-sm rounded-xl shadow-lg p-6">
            <AppointmentCalendar />
          </div>
        </div>
        
        <LandingFooter />
      </div>
    </AnimatedBackground>
  );
};

export default Index;
