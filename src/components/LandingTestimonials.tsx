
import React from "react";
import { Star } from "lucide-react";

export const LandingTestimonials = () => {
  const testimonials = [
    {
      name: "דניאל לוי",
      text: "תהליך קביעת הפגישה היה פשוט ומהיר, וקיבלתי תזכורת יום לפני הפגישה. השירות היה מעולה!",
      rating: 5
    },
    {
      name: "רונית כהן",
      text: "הצוות המקצועי והאדיב עזר לי בכל שאלה, והפגישה עצמה הייתה יעילה ומועילה מאוד.",
      rating: 5
    },
    {
      name: "משה ישראלי",
      text: "אני ממליץ בחום על השירות. קביעת הפגישה הייתה פשוטה, והפגישה עצמה עלתה על כל הציפיות.",
      rating: 4
    }
  ];

  return (
    <div className="bg-background py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">מה הלקוחות שלנו אומרים</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-muted p-6 rounded-lg shadow-md">
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                ))}
                {[...Array(5 - testimonial.rating)].map((_, i) => (
                  <Star key={i + testimonial.rating} className="h-5 w-5 text-gray-300" />
                ))}
              </div>
              <p className="mb-4 italic">"{testimonial.text}"</p>
              <p className="font-bold">{testimonial.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
