import React from "react";

export const LandingHeader = () => {
  return (
    <div className="bg-transparent py-8 px-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex-1 text-center">
          <h1 className="text-4xl font-bold mb-2">תודה על ההרשמה</h1>
          <p className="text-xl">מוזמנים לקבוע פגישה</p>
        </div>
        
        {/* לוגו בצד שמאל */}
        <div className="flex-shrink-0 ml-4">
          <img 
            src="/images/2.webp" 
            alt="לוגו" 
            className="h-20 w-auto" 
          />
        </div>
      </div>
    </div>
  );
};
