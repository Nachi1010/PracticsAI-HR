
import React from "react";

export const LandingFooter = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="font-bold text-xl mb-2">צור קשר</h3>
            <p>טלפון: 03-1234567</p>
            <p>דוא"ל: info@example.com</p>
          </div>
          <div className="text-center md:text-right">
            <p>© 2025 כל הזכויות שמורות</p>
            <p>תנאי השימוש | מדיניות פרטיות</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
