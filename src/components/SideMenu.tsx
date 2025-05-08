import { useState } from "react";
import { 
  Home, Book, School, ClipboardList, 
  HelpCircle, PhoneCall, Settings, Info
} from "lucide-react";

// יבוא ה-useLanguage מהקובץ המקומי שיצרנו
const useLanguage = () => {
  const [currentLang, setCurrentLang] = useState<"en" | "he">("he");
  return { currentLang, setCurrentLang };
};

// מימוש פשוט של smoothScrollTo שהיה מיובא מ-scrollUtils
const smoothScrollTo = (elementId: string) => {
  // מעבר פשוט לדף הרלוונטי ב-practicsai.com
  window.location.href = `https://practicsai.com/#${elementId}`;
};

const menuItems = [
  { title: "Home", titleHe: "דף הבית", href: "https://practicsai.com/#hero", icon: Home },
  { title: "About", titleHe: "אודות", href: "https://practicsai.com/#about", icon: Info },
  { title: "Course Details", titleHe: "פרטי הקורס", href: "https://practicsai.com/#technical-details", icon: School },
  { title: "Registration", titleHe: "הרשמה", href: "https://practicsai.com/#registration-form", icon: ClipboardList },
  { title: "FAQ", titleHe: "שאלות נפוצות", href: "https://practicsai.com/#faq", icon: HelpCircle },
  { title: "Contact", titleHe: "צור קשר", href: "https://practicsai.com/#registration-form", icon: PhoneCall }
] as const;

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SideMenu = ({ isOpen, onClose }: SideMenuProps) => {
  const { currentLang } = useLanguage();
  
  // פונקציה משולבת לטיפול בסגירת התפריט וגלילה חלקה
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    onClose();
    
    // הפניה ישירה לכתובת ב-practicsai.com
    window.location.href = href;
  };
  
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      <nav
        className={`fixed top-0 left-0 h-full w-72 bg-gradient-to-b from-slate-800 to-slate-900 shadow-2xl transform transition-all duration-300 ease-in-out z-50 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* קו מדורג בצד ימין של הסיידמניו בצבעים מתאימים */}
        <div className="absolute top-0 right-0 h-full w-1 bg-gradient-to-b from-slate-500 via-slate-600 to-slate-700"></div>
        
        <div className="p-6 flex flex-col justify-between h-full">
          {/* כותרת הסיידמניו */}
          <div className="mb-6 pb-4 border-b border-slate-700/50">
            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            PracticsAI
            </h2>
            <p className="text-xs text-slate-400 mt-1">
            {currentLang === "en" ? "Navigation Menu" : "תפריט ניווט"}
            </p>
          </div>
          
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.title}>
                  <a
                    href={item.href}
                    className="text-white/80 hover:text-white flex items-center gap-3 px-3 py-3 rounded-md transition-all hover:bg-white/10 group relative overflow-hidden"
                    onClick={(e) => handleLinkClick(e, item.href)}
                  >
                    {/* קו אנימטיבי בצד */}
                    <span className="absolute right-0 top-0 h-full w-1 bg-gradient-to-b from-slate-500 via-slate-600 to-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    
                    {/* אייקון */}
                    <span className="text-white/60 group-hover:text-white transition-colors">
                      <Icon className="w-5 h-5" />
                    </span>
                    
                    {/* טקסט */}
                    <span className="font-medium tracking-wide">{currentLang === "en" ? item.title : item.titleHe}</span>
                  </a>
                </li>
              );
            })}
          </ul>
          
          <div className="mt-auto pt-4 border-t border-slate-700/50 space-y-2">
            <button 
              className="flex w-full items-center gap-3 px-3 py-2 text-white/60 hover:text-white rounded-md transition-all hover:bg-white/10 text-sm group"
              onClick={() => {
                onClose();
                window.location.href = "https://practicsai.com/#accessibility";
              }}
            >
              <Settings className="w-4 h-4" />
              <span>{currentLang === "en" ? "Accessibility" : "נגישות"}</span>
            </button>
            
            <button 
              className="flex w-full items-center gap-3 px-3 py-2 text-white/60 hover:text-white rounded-md transition-all hover:bg-white/10 text-sm group"
              onClick={() => {
                onClose();
                window.location.href = "https://practicsai.com/#registration-form";
              }}
            >
              <Book className="w-4 h-4" />
              <span>{currentLang === "en" ? "More Information" : "מידע נוסף"}</span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}; 