import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserDataContext } from '@/contexts/UserDataContext';

export interface UserData {
  id?: string | null;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  source?: string | null;
}

// טיפוס עבור תשובת RPC - משמש כדי לעקוף בעיות טייפסקריפט
interface UserDataResponse {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  source: string | null;
}

/**
 * הוק לקבלת נתוני משתמש מאובטחים מהדאטה בייס
 * משתמש בפונקציית RPC מאובטחת שנוצרה על ידי הסקריפט SQL
 */
export const useUserData = () => {
  const { userIp, isIpLoading } = useUserDataContext();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isUserDataLoading, setIsUserDataLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userIp || isIpLoading) {
        return;
      }
      
      setIsUserDataLoading(true);
      
      try {
        // קריאה לפונקציית RPC ציבורית בסופאבייס
        // פונקציה זו כוללת בדיקות אבטחה שמוודאות שהמשתמש רשאי לקבל את המידע המבוקש
        const { data: rpcData, error: rpcError } = await supabase.rpc(
          'get_user_data_by_ip',
          { ip_param: userIp }
        );
        
        if (rpcError) {
          console.error('Error fetching user data:', rpcError);
          setError(rpcError.message);
          return;
        }
        
        if (rpcData && Array.isArray(rpcData) && rpcData.length > 0) {
          const userDataItem = rpcData[0] as UserDataResponse;
          setUserData({
            id: userDataItem.id,
            name: userDataItem.name,
            phone: userDataItem.phone,
            email: userDataItem.email,
            source: userDataItem.source
          });
          console.log('User data fetched successfully:', userDataItem);
        } else {
          // נסה לקבל נתונים מאוחדים מכל המקורות במקרה שטבלת user_data ריקה
          const { data: consolidatedData, error: consolidatedError } = await supabase.rpc(
            'consolidate_user_data_by_ip',
            { ip_param: userIp }
          );
          
          if (consolidatedError) {
            console.error('Error fetching consolidated user data:', consolidatedError);
            setUserData(null);
          } else if (consolidatedData && Array.isArray(consolidatedData) && consolidatedData.length > 0) {
            const consolidatedItem = consolidatedData[0] as UserDataResponse;
            setUserData({
              id: consolidatedItem.id,
              name: consolidatedItem.name,
              phone: consolidatedItem.phone,
              email: consolidatedItem.email,
              source: consolidatedItem.source
            });
            console.log('Consolidated user data fetched:', consolidatedItem);
          } else {
            console.log('No user data found for IP:', userIp);
            setUserData(null);
          }
        }
      } catch (err: any) {
        console.error('Error in user data hook:', err);
        setError(err?.message || 'Failed to fetch user data');
      } finally {
        setIsUserDataLoading(false);
      }
    };
    
    fetchUserData();
  }, [userIp, isIpLoading]);
  
  return { 
    userData,
    isUserDataLoading,
    error,
    userIp
  };
};

/**
 * פונקציה לשימוש בטפסים כדי למלא באופן אוטומטי פרטי משתמש מזוהים לפי האייפי
 * להשתמש ב-React Hook Form
 */
export const useAutoFillUserData = (formSetters: { 
  setName?: (value: string) => void,
  setPhone?: (value: string) => void,
  setEmail?: (value: string) => void
}) => {
  const { userData, isUserDataLoading } = useUserData();
  
  useEffect(() => {
    if (!isUserDataLoading && userData) {
      // מילוי אוטומטי של הטופס רק עם נתונים קיימים
      if (userData.name && formSetters.setName) {
        formSetters.setName(userData.name);
      }
      
      if (userData.phone && formSetters.setPhone) {
        formSetters.setPhone(userData.phone);
      }
      
      if (userData.email && formSetters.setEmail) {
        formSetters.setEmail(userData.email);
      }
    }
  }, [userData, isUserDataLoading, formSetters]);
  
  return {
    userData,
    isUserDataLoading
  };
}; 