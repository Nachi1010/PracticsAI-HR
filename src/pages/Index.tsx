
import React from "react";
import { LandingHeader } from "@/components/LandingHeader";
import { AppointmentCalendar } from "@/components/AppointmentCalendar";
import { LandingFooter } from "@/components/LandingFooter";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <LandingHeader />
      
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">בחרו מועד לפגישה</h2>
        <AppointmentCalendar />
      </div>
      
      <LandingFooter />
    </div>
  );
};

export default Index;
