"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <>
      <style>{`
  .rdp-head_cell::before {
    content: '';
    display: block;
    width: 6px;
    height: 6px;
    background-color: #d1d5db;
    border-radius: 50%;
    margin: 0 auto;
  }
  .rdp-head_cell:nth-child(6)::before,
  .rdp-head_cell:nth-child(7)::before {
    background-color: #00aeff;
  }
`}</style>
      <DayPicker
        showOutsideDays={showOutsideDays}
        className={className}
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 w-full",
          month: "space-y-4 w-full",
          caption: "flex justify-center pt-1 relative items-center mb-4 hidden", // Hide standard caption if possible, but actually we need nav. Let's keep it.
          caption_label: "text-sm font-bold text-[#2F5FA7]",
          nav: "space-x-1 flex items-center",
          nav_button:
            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 transition-opacity flex items-center justify-center rounded-md hover:bg-secondary",
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
          table: "w-full border-collapse",
          head_row: "grid grid-cols-7 w-full border-b border-[#e6eaf0] pb-2",
          head_cell: "text-transparent relative w-full h-4", // We need grey dots. We can use before pseudo element
          row: "grid grid-cols-7 w-full border-b border-[#e6eaf0] last:border-0",
          cell: "h-8 w-full text-center text-[12px] font-bold p-0 relative focus-within:relative focus-within:z-20 border-r border-[#e6eaf0] last:border-0 flex items-center justify-center",
          day: "h-full w-full p-0 font-bold aria-selected:opacity-100 hover:bg-secondary transition-colors cursor-pointer flex items-center justify-center text-foreground",
          day_selected:
            "bg-[#00aeff] text-white hover:bg-[#00aeff] hover:text-white focus:bg-[#00aeff] focus:text-white",
          day_today: "text-[#00aeff]",
          day_outside: "text-muted-foreground/30 font-bold",
          day_disabled: "text-muted-foreground/30 font-bold",
          day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
          day_hidden: "invisible",
          ...classNames,
        }}
        components={{
          Chevron: (props) => {
            if (props.orientation === "left") {
              return <ChevronLeft className="h-4 w-4 text-[#2F5FA7]" {...props} />;
            }
            return <ChevronRight className="h-4 w-4 text-[#2F5FA7]" {...props} />;
          },
        }}
        {...props}
      />
    </>
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
