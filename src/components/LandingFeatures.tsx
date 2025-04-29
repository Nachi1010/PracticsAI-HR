
import React from "react";
import { CheckCircle, Clock, Calendar, Phone } from "lucide-react";

export const LandingFeatures = () => {
  const features = [
    {
      icon: <CheckCircle className="h-10 w-10 text-primary" />,
      title: "פשוט ומהיר",
      description: "תהליך קביעת פגישה פשוט ומהיר שלוקח פחות מדקה"
    },
    {
      icon: <Clock className="h-10 w-10 text-primary" />,
      title: "זמינות גבוהה",
      description: "מגוון רחב של תאריכים ושעות פגישה לבחירתכם"
    },
    {
      icon: <Calendar className="h-10 w-10 text-primary" />,
      title: "תזכורות אוטומטיות",
      description: "קבלו תזכורות לפני הפגישה כדי שלא תפספסו"
    },
    {
      icon: <Phone className="h-10 w-10 text-primary" />,
      title: "תמיכה זמינה",
      description: "צוות התמיכה שלנו זמין לכל שאלה או בעיה"
    }
  ];

  return (
    <div className="py-16 bg-muted/50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">למה לקבוע פגישה אצלנו?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-background p-6 rounded-lg shadow-md text-center">
              <div className="flex justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="font-bold text-xl mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
