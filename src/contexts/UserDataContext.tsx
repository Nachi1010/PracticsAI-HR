import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface UserDataContextType {
  userIp: string;
  isIpLoading: boolean;
  userData: UserData | null;
}

interface UserData {
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  user_id?: string | null;
}

// יצירת הקונטקסט עם ערכי ברירת מחדל
const UserDataContext = createContext<UserDataContextType>({
  userIp: '',
  isIpLoading: true,
  userData: null
});

export const useUserDataContext = () => useContext(UserDataContext);

interface UserDataProviderProps {
  children: ReactNode;
}

export const UserDataProvider: React.FC<UserDataProviderProps> = ({ children }) => {
  const [userIp, setUserIp] = useState<string>('');
  const [isIpLoading, setIsIpLoading] = useState<boolean>(true);
  const [userData, setUserData] = useState<UserData | null>(null);

  // איסוף כתובת ה-IP האמיתית של המשתמש
  useEffect(() => {
    const fetchUserIp = async () => {
      try {
        // ניסיון ראשון עם ipify
        try {
          const response = await fetch('https://api.ipify.org?format=json');
          if (response.ok) {
            const data = await response.json();
            if (data && data.ip) {
              setUserIp(data.ip);
              console.log("IP address fetched from ipify:", data.ip);
              setIsIpLoading(false);
              return;
            }
          }
        } catch (ipifyError) {
          console.warn('Error fetching from ipify:', ipifyError);
        }

        // ניסיון שני עם ipapi
        try {
          const response = await fetch('https://ipapi.co/json/');
          if (response.ok) {
            const data = await response.json();
            if (data && data.ip) {
              setUserIp(data.ip);
              console.log("IP address fetched from ipapi:", data.ip);
              setIsIpLoading(false);
              return;
            }
          }
        } catch (ipapiError) {
          console.warn('Error fetching from ipapi:', ipapiError);
        }

        // ניסיון שלישי ואחרון
        try {
          const response = await fetch('https://api.ipdata.co?api-key=test');
          if (response.ok) {
            const data = await response.json();
            if (data && data.ip) {
              setUserIp(data.ip);
              console.log("IP address fetched from ipdata:", data.ip);
              setIsIpLoading(false);
              return;
            }
          }
        } catch (ipdataError) {
          console.warn('Error fetching from ipdata:', ipdataError);
        }

        // אם כל הניסיונות נכשלו
        console.error('All IP fetching methods failed');
        setIsIpLoading(false);
      } catch (error) {
        console.error('Error fetching IP address:', error);
        setIsIpLoading(false);
      }
    };
    
    fetchUserIp();
  }, []);

  return (
    <UserDataContext.Provider value={{ userIp, isIpLoading, userData }}>
      {children}
    </UserDataContext.Provider>
  );
}; 