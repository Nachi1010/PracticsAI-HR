import React from "react";

export const AnimatedBackground = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* רקע תמונה */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0" 
        style={{ 
          backgroundImage: 'url("/images/D.webp")',
          backgroundSize: 'cover',
          backgroundRepeat: 'repeat',
        }}
      />
      
      {/* שכבת שקיפות */}
      <div className="absolute inset-0 bg-background/80 z-10" />
      
      {/* אנימציית גלים */}
      <div className="absolute inset-0 z-20 opacity-30">
        <div className="absolute inset-0 wave-animation" />
      </div>
      
      {/* תוכן הדף */}
      <div className="relative z-30 min-h-screen">
        {children}
      </div>
    </div>
  );
};

// CSS ניתן להוסיף לקובץ ה-global.css או להוסיף כאן
// הוספת ה-CSS לאנימציית הגלים יכולה להיראות כך:
/*
.wave-animation {
  background: linear-gradient(45deg, rgba(29, 78, 216, 0.2), rgba(124, 58, 237, 0.2));
  background-size: 400% 400%;
  animation: gradient 15s ease infinite;
}

@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
*/ 