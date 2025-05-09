import React from "react";

export const LandingHeader = () => {
  return (
    <div className="bg-transparent py-8 px-4 mt-24">
      <div className="container mx-auto flex items-center justify-between">
        {/* לוגו בצד שמאל */}

        <div className="flex-1 text-center">
          <h1 className="text-4xl font-bold mb-2">CloserAI מודה לך על הרשמתך לתכנית הגיוס הייחודית שלנו</h1>
          <p className="text-xl">נשמח לקבוע שיחת הכרות לבחינה ראשונית של התאמתך למועמדות</p>
        </div>
      </div>
    </div>
  );
};
