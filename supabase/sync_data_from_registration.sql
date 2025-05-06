-- ========================================
-- סינכרון מידע בין טבלת registration_data לטבלאות מערכת ה-HR
-- הסקריפט יוצר טבלת user_data (אם אינה קיימת)
-- ויוצר פונקציה וטריגר להעתקת נתונים אוטומטית מרישומים חדשים
-- ========================================

-- יצירת טבלת user_data אם היא אינה קיימת
CREATE TABLE IF NOT EXISTS user_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT,
  phone TEXT,
  ip_address TEXT,
  registration_id BIGINT, -- שינוי מ-UUID ל-BIGINT
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  source TEXT DEFAULT 'registration' -- מקור הנתונים
);

-- אינדקסים לשיפור ביצועים
CREATE INDEX IF NOT EXISTS user_data_ip_address_idx ON user_data (ip_address);
CREATE INDEX IF NOT EXISTS user_data_email_idx ON user_data (email);
CREATE INDEX IF NOT EXISTS user_data_phone_idx ON user_data (phone);

-- פונקציה להעתקת נתונים מטבלת registration_data ל-user_data
CREATE OR REPLACE FUNCTION sync_registration_to_user_data()
RETURNS TRIGGER AS $$
BEGIN
  -- בדיקה האם יש כבר רשומה עם אותה כתובת IP, אימייל או טלפון
  IF EXISTS (
    SELECT 1 FROM user_data 
    WHERE 
      (NEW.ip_address IS NOT NULL AND ip_address = NEW.ip_address)
      OR (NEW.email IS NOT NULL AND email = NEW.email)
      OR (NEW.phone IS NOT NULL AND phone = NEW.phone)
  ) THEN
    -- עדכון רשומה קיימת
    UPDATE user_data 
    SET 
      name = COALESCE(NEW.name, name),
      email = COALESCE(NEW.email, email),
      phone = COALESCE(NEW.phone, phone),
      ip_address = COALESCE(NEW.ip_address, ip_address),
      registration_id = NEW.id,
      updated_at = NOW()
    WHERE 
      (NEW.ip_address IS NOT NULL AND ip_address = NEW.ip_address)
      OR (NEW.email IS NOT NULL AND email = NEW.email)
      OR (NEW.phone IS NOT NULL AND phone = NEW.phone);
  ELSE
    -- הוספת רשומה חדשה
    INSERT INTO user_data (name, email, phone, ip_address, registration_id)
    VALUES (NEW.name, NEW.email, NEW.phone, NEW.ip_address, NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- מחיקת הטריגר אם הוא קיים
DROP TRIGGER IF EXISTS registration_to_user_data_trigger ON registration_data;

-- יצירת טריגר חדש
CREATE TRIGGER registration_to_user_data_trigger
AFTER INSERT OR UPDATE ON registration_data
FOR EACH ROW
EXECUTE FUNCTION sync_registration_to_user_data();

-- פונקציה וטריגר להעתקת מידע גם מטבלת appointments
CREATE OR REPLACE FUNCTION sync_appointments_to_user_data()
RETURNS TRIGGER AS $$
BEGIN
  -- בדיקה האם יש כבר רשומה עם אותה כתובת IP, אימייל או טלפון
  IF EXISTS (
    SELECT 1 FROM user_data 
    WHERE 
      (NEW.ip_address IS NOT NULL AND ip_address = NEW.ip_address)
      OR (NEW.email IS NOT NULL AND email = NEW.email)
      OR (NEW.phone IS NOT NULL AND phone = NEW.phone)
  ) THEN
    -- עדכון רשומה קיימת
    UPDATE user_data 
    SET 
      name = COALESCE(NEW.name, name),
      email = COALESCE(NEW.email, email),
      phone = COALESCE(NEW.phone, phone),
      ip_address = COALESCE(NEW.ip_address, ip_address),
      updated_at = NOW(),
      source = CASE WHEN source = 'registration' THEN source ELSE 'appointment' END
    WHERE 
      (NEW.ip_address IS NOT NULL AND ip_address = NEW.ip_address)
      OR (NEW.email IS NOT NULL AND email = NEW.email)
      OR (NEW.phone IS NOT NULL AND phone = NEW.phone);
  ELSE
    -- הוספת רשומה חדשה
    INSERT INTO user_data (name, email, phone, ip_address, source)
    VALUES (NEW.name, NEW.email, NEW.phone, NEW.ip_address, 'appointment');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- מחיקת הטריגר אם הוא קיים
DROP TRIGGER IF EXISTS appointments_to_user_data_trigger ON appointments;

-- יצירת טריגר חדש
CREATE TRIGGER appointments_to_user_data_trigger
AFTER INSERT OR UPDATE ON appointments
FOR EACH ROW
EXECUTE FUNCTION sync_appointments_to_user_data();

-- ============================
-- הגדרת מדיניות אבטחה (RLS)
-- ============================

-- הפעלת RLS על הטבלה
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

-- פוליסי לאפשר הכנסת רשומות חדשות דרך ממשק המשתמש
CREATE POLICY "users_can_insert_with_their_ip" ON user_data
FOR INSERT
WITH CHECK (
  ip_address = current_setting('request.headers')::json->>'cf-connecting-ip'
  OR auth.uid() IS NOT NULL
);

-- פוליסי לאפשר מחיקה רק של רשומות של המשתמש עצמו
CREATE POLICY "users_can_delete_own_data" ON user_data
FOR DELETE
USING (
  ip_address = current_setting('request.headers')::json->>'cf-connecting-ip'
  OR email = auth.email()
);

-- פוליסי לאפשר עדכון רק של רשומות של המשתמש עצמו
CREATE POLICY "users_can_update_own_data" ON user_data
FOR UPDATE
USING (
  ip_address = current_setting('request.headers')::json->>'cf-connecting-ip'
  OR email = auth.email()
);

-- פוליסי לאפשר קריאה רק למשתמשים שהמידע שייך להם (לפי IP, אימייל או טלפון)
CREATE POLICY "users_can_view_own_data" ON user_data
FOR SELECT
USING (
  -- מחלץ את ה-IP מבקשת ה-HTTP
  (ip_address = current_setting('request.headers')::json->>'cf-connecting-ip')
  OR
  -- בודק התאמה לפי אימייל המשתמש המחובר
  (email = auth.email())
  OR
  -- בודק התאמה לפי מספר הטלפון בטוקן JWT
  (phone = current_setting('request.jwt.claims', true)::json->>'phone')
);

-- פוליסי המאפשר לשרת (service_role) לבצע את כל הפעולות
CREATE POLICY "service_role_can_do_everything" ON user_data
FOR ALL
TO service_role
USING (true);

-- ===========================
-- פונקציות RPC לשימוש מהקליינט
-- ===========================

-- יצירת פונקציה לקבלת נתוני משתמש לפי IP כפונקציית RPC
CREATE OR REPLACE FUNCTION public.get_user_data_by_ip(ip_param TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  email TEXT,
  phone TEXT,
  source TEXT
) AS $$
BEGIN
  -- מחזיר מידע רק אם ה-IP הנשלח מתאים לזה שמבקש את המידע
  IF ip_param = current_setting('request.headers')::json->>'cf-connecting-ip' THEN
    RETURN QUERY
    SELECT 
      ud.id,
      ud.name,
      ud.email,
      ud.phone,
      ud.source
    FROM 
      user_data ud
    WHERE 
      ud.ip_address = ip_param
    ORDER BY 
      ud.updated_at DESC
    LIMIT 1;
  ELSE
    -- אם אין התאמה, מוחזרת טבלה ריקה
    RETURN;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ניתן לקרוא לפונקציה דרך ה-API בצורה זו:
-- SELECT * FROM "get_user_data_by_ip"('127.0.0.1');

-- פונקציה לאיחוד נתונים מכל מקורות הנתונים לפי IP (appointments, registration_data, user_data)
CREATE OR REPLACE FUNCTION public.consolidate_user_data_by_ip(ip_param TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  email TEXT,
  phone TEXT,
  source TEXT,
  last_action_at TIMESTAMPTZ
) AS $$
BEGIN
  -- מחזיר מידע רק אם ה-IP הנשלח מתאים לזה שמבקש את המידע
  IF ip_param = current_setting('request.headers')::json->>'cf-connecting-ip' THEN
    RETURN QUERY

    -- לוקח את הנתונים המאוחדים מכל הטבלאות
    WITH combined_data AS (
      -- נתונים מטבלת appointments
      SELECT 
        gen_random_uuid() as id,
        a.name,
        a.email,
        a.phone,
        'appointment' as source,
        a.created_at as last_action_at
      FROM 
        appointments a
      WHERE 
        a.ip_address = ip_param
      
      UNION ALL
      
      -- נתונים מטבלת registration_data
      SELECT 
        gen_random_uuid() as id,
        r.name,
        r.email,
        r.phone,
        'registration' as source,
        r.created_at as last_action_at
      FROM 
        registration_data r
      WHERE 
        r.ip_address = ip_param
      
      UNION ALL
      
      -- נתונים מטבלת user_data
      SELECT 
        ud.id,
        ud.name,
        ud.email,
        ud.phone,
        ud.source,
        ud.updated_at as last_action_at
      FROM 
        user_data ud
      WHERE 
        ud.ip_address = ip_param
    )
    
    -- מחזיר את הרשומה העדכנית ביותר
    SELECT * FROM combined_data
    ORDER BY last_action_at DESC
    LIMIT 1;
  ELSE
    -- אם אין התאמה, מוחזרת טבלה ריקה
    RETURN;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- שאילתה לסינכרון מידע לאחור - מופעל פעם אחת כדי לסנכרן מידע קיים
-- העתקת נתונים קיימים מטבלת registration_data
INSERT INTO user_data (name, email, phone, ip_address, registration_id, source)
SELECT 
  r.name, r.email, r.phone, r.ip_address, r.id, 'registration'
FROM 
  registration_data r
LEFT JOIN 
  user_data u ON u.registration_id = r.id
WHERE 
  u.id IS NULL
  AND (r.ip_address IS NOT NULL OR r.email IS NOT NULL OR r.phone IS NOT NULL);

-- העתקת נתונים קיימים מטבלת appointments
INSERT INTO user_data (name, email, phone, ip_address, source)
SELECT 
  a.name, a.email, a.phone, a.ip_address, 'appointment'
FROM 
  appointments a
LEFT JOIN 
  user_data u ON 
    (a.ip_address IS NOT NULL AND u.ip_address = a.ip_address)
    OR (a.email IS NOT NULL AND u.email = a.email)
    OR (a.phone IS NOT NULL AND u.phone = a.phone)
WHERE 
  u.id IS NULL
  AND (a.ip_address IS NOT NULL OR a.email IS NOT NULL OR a.phone IS NOT NULL);