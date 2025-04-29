
import React, { useState, useEffect } from 'react';
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/components/ui/use-toast";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

// שעות זמינות לפגישות
const availableHours = [
  "09:00", "10:00", "11:00", "12:00", "13:00", 
  "14:00", "15:00", "16:00", "17:00", "18:00"
];

// סכמת ולידציה עבור הטופס
const formSchema = z.object({
  date: z.date({ required_error: "יש לבחור תאריך" }),
  time: z.string({ required_error: "יש לבחור שעה" }),
});

type FormValues = z.infer<typeof formSchema>;

export const AppointmentCalendar = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchParams] = useSearchParams();
  const name = searchParams.get("name");
  const phone = searchParams.get("phone");
  const email = searchParams.get("email");
  
  // בדיקה שיש את הפרטים הנדרשים מהדף המפנה
  useEffect(() => {
    if (!phone) {
      toast({
        variant: "destructive",
        title: "שגיאה בטעינת הנתונים",
        description: "חסרים פרטים אישיים הנדרשים לקביעת פגישה",
      });
    }
  }, [phone]);
  
  // הגדרת הטופס עם ולידציה
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  // שליחת הטופס לשרת
  const onSubmit = async (data: FormValues) => {
    if (!phone) {
      toast({
        variant: "destructive",
        title: "שגיאה בקביעת הפגישה",
        description: "חסרים פרטים אישיים הנדרשים לקביעת פגישה",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // אחזור כתובת ה-IP של המשתמש
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipResponse.json();
      const ipAddress = ipData?.ip || 'unknown';
      
      // חיפוש תחילה בטבלאות הקיימות לבדיקה אם משתמש כבר רשום
      let user_id = null;
      
      if (phone) {
        const { data: userData } = await supabase
          .from('registration_data')
          .select('user_id')
          .eq('phone', phone)
          .maybeSingle();
          
        if (userData) {
          user_id = userData.user_id;
        }
      }
      
      // הכנת הנתונים להוספה לטבלה
      const appointmentData = {
        name: name || "אורח",
        phone: phone || "",
        email: email || null,
        date: format(data.date, 'yyyy-MM-dd'),
        time: data.time,
        user_id,
        ip_address: ipAddress
      };
      
      // הוספת הנתונים לטבלת הפגישות
      const { error } = await supabase
        .from('appointments')
        .insert([appointmentData]);
      
      if (error) {
        throw new Error(error.message);
      }
      
      // הצגת הודעת הצלחה
      toast({
        title: "הפגישה נקבעה בהצלחה!",
        description: `פגישתך נקבעה לתאריך ${format(data.date, 'dd/MM/yyyy')} בשעה ${data.time}`,
      });
      
    } catch (error) {
      console.error("שגיאה בקביעת הפגישה:", error);
      toast({
        variant: "destructive",
        title: "שגיאה בקביעת הפגישה",
        description: "אירעה שגיאה בעת קביעת הפגישה. אנא נסה שוב מאוחר יותר.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="mb-6 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-3">
          <CalendarIcon className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-xl font-semibold">בחרו מועד לפגישה שלכם</h3>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>תאריך</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "pl-3 text-right font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "dd/MM/yyyy")
                          ) : (
                            <span>בחר תאריך</span>
                          )}
                          <CalendarIcon className="mr-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => {
                          // אין אפשרות לבחור תאריכים בעבר
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          
                          // אין פגישות בשישי ושבת
                          const day = date.getDay();
                          const isFridayOrSaturday = day === 5 || day === 6;
                          
                          return date < today || isFridayOrSaturday;
                        }}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>שעה</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="בחר שעה" />
                        <Clock className="h-4 w-4 ml-2" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableHours.map((hour) => (
                        <SelectItem key={hour} value={hour}>
                          {hour}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting || !phone}
          >
            {isSubmitting ? "מתבצעת קביעת פגישה..." : "קבע פגישה"}
          </Button>
          
          {!phone && (
            <p className="text-sm text-destructive text-center">
              נדרש לשלוח פרטים אישיים מהדף המפנה
            </p>
          )}
        </form>
      </Form>
    </div>
  );
};
