import React, { useState, useEffect } from 'react';
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { useUserDataContext } from "@/contexts/UserDataContext";
import { useAutoFillUserData } from "@/hooks/useUserData";

// שעות זמינות לפגישות
const availableHours = [
  "09:00", "10:00", "11:00", "12:00", "13:00", 
  "14:00", "15:00", "16:00", "17:00", "18:00"
];

// סכמת ולידציה עבור הטופס
const formSchema = z.object({
  name: z.string().min(2, { message: "שם חייב להכיל לפחות 2 תווים" }),
  phone: z.string().min(9, { message: "מספר טלפון אינו תקין" }),
  email: z.string().email({ message: "כתובת אימייל אינה תקינה" }).optional().or(z.literal("")),
  date: z.date({ required_error: "יש לבחור תאריך" }),
  time: z.string({ required_error: "יש לבחור שעה" }),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export const AppointmentForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { userIp, isIpLoading } = useUserDataContext();
  
  // הגדרת הטופס עם ברירות מחדל וולידציה
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      notes: "",
    }
  });

  // מילוי אוטומטי של פרטי המשתמש אם הם קיימים במערכת
  useAutoFillUserData({
    setName: (value) => form.setValue('name', value),
    setPhone: (value) => form.setValue('phone', value),
    setEmail: (value) => form.setValue('email', value)
  });

  // שליחת הטופס לשרת
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // הכנת הנתונים להוספה לטבלה
      const appointmentData = {
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        date: format(data.date, 'yyyy-MM-dd'),
        time: data.time,
        notes: data.notes || null
      };
      
      // הוספת כתובת IP אם היא זמינה
      try {
        if (userIp && userIp.trim() !== '') {
          appointmentData['ip_address'] = userIp;
          console.log("Using IP address from context:", userIp);
        } else {
          console.warn("IP address not available from context");
        }
      } catch (ipError) {
        console.warn('Could not add IP address to appointment data', ipError);
        // ממשיך את התהליך גם אם נכשל בהוספת האייפי
      }
      
      // הוספת הנתונים לטבלה
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
        <a href='questionnaire' class='text-white font-bold hover:text-white/80 hover:underline transition-colors' onclick='event.preventDefault(); document.getElementById(\"questionnaire.practicsai.com\"));'>שאלון התאמה ראשונית</a> בינתיים, מוזמנים למלא
        וחה ישירות אל מקצוע העתיד."
    }
      });
      
      // איפוס הטופס
      form.reset();
      
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
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">קביעת פגישה</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>שם מלא</FormLabel>
                <FormControl>
                  <Input placeholder="ישראל ישראלי" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>מספר טלפון</FormLabel>
                <FormControl>
                  <Input placeholder="050-0000000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>דוא"ל (אופציונלי)</FormLabel>
                <FormControl>
                  <Input placeholder="your@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "dd/MM/yyyy")
                          ) : (
                            <span>בחר</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
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
          
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>הערות (אופציונלי)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="הוסף הערות או בקשות מיוחדות..."
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "מתבצעת קביעת פגישה..." : "קבע פגישה"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

