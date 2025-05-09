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
          <AppointmentCalendar />
        </div>
        
        <LandingFooter />
      </div>
    </AnimatedBackground>
  );
};

export default Index;
