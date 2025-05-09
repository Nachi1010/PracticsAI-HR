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
          <div className="w-full max-w-4xl mx-auto bg-card/90 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-slate-200/20 mb-10">
            <h2 className="text-3xl font-bold text-center mb-8 font-serif">בחרו מועד לפגישת התאמה ראשונית</h2>
            
            <div className="w-full max-w-3xl mx-auto bg-background/80 backdrop-blur-sm rounded-xl shadow-md p-6 border border-slate-300/20">
              <AppointmentCalendar />
            </div>
          </div>
        </div>
        
        <LandingFooter />
      </div>
    </AnimatedBackground>
  );
};

export default Index;
