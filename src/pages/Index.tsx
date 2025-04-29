
import React from "react";
import { LandingHeader } from "@/components/LandingHeader";
import { LandingFeatures } from "@/components/LandingFeatures";
import { AppointmentForm } from "@/components/AppointmentForm";
import { LandingTestimonials } from "@/components/LandingTestimonials";
import { LandingFooter } from "@/components/LandingFooter";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <LandingHeader />
      
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">קבע פגישה עכשיו</h2>
        <AppointmentForm />
      </div>
      
      <LandingFeatures />
      
      <LandingTestimonials />
      
      <LandingFooter />
    </div>
  );
};

export default Index;
