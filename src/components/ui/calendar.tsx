"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <>
      <style>{`
        .rdp-root {
          --rdp-accent-color: #00aeff;
          --rdp-accent-background-color: #00aeff;
          --rdp-day-height: 2.5rem;
          --rdp-day-width: 2.5rem;
          --rdp-outline-color: #00aeff;
          --rdp-background-color: transparent;
        }

        .rdp-month_grid {
          border-collapse: collapse;
          width: 100%;
        }

        .rdp-weekday {
          border-bottom: 1px solid #e6eaf0;
          color: transparent !important; /* Hide standard text */
          position: relative;
          padding-bottom: 0.5rem;
        }

        .rdp-weekday::before {
          content: '';
          display: block;
          width: 6px;
          height: 6px;
          background-color: #d1d5db;
          border-radius: 50%;
          margin: 0 auto;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
        .rdp-weekday:nth-child(6)::before,
        .rdp-weekday:nth-child(7)::before {
          background-color: #00aeff;
        }

        .rdp-week {
          border-bottom: 1px solid #e6eaf0;
        }

        .rdp-week:last-child {
          border-bottom: none;
        }

        .rdp-day {
          border-right: 1px solid #e6eaf0;
          font-weight: bold;
          font-size: 13px;
        }

        .rdp-day:last-child {
          border-right: none;
        }

        .rdp-day_button {
          width: 100%;
          height: 100%;
          border-radius: 0;
          border: none;
        }

        .rdp-day_button:hover:not([disabled]):not(.rdp-selected) {
          background-color: #f1f3f6;
        }

        .rdp-outside {
          color: #9ca3af;
          opacity: 0.5;
        }

        .rdp-today:not(.rdp-outside) {
          color: #00aeff;
          font-weight: 800;
        }

        .rdp-nav {
          display: flex;
          justify-content: space-between;
        }

        .rdp-month_caption {
          font-weight: bold;
          color: #2F5FA7;
          display: none; /* User image shows no caption, maybe we should hide it or style it */
        }
        /* Wait, the user image shows the nav arrows at the bottom left, and the caption at top? No, the user image shows NO caption and just the grid, or a caption "July 2026" at the top and arrows at the bottom? The image has no top caption in the snippet, just days. Ah, the image provided does have a caption and arrows. Wait, let's look at the image again... Actually the image provided has "25 26 27 28 29 30 1...". It's just a grid. Let's hide the standard caption and put our own or just let it be. Wait, let's keep the standard caption if it's there. */
      `}</style>
      <DayPicker
        showOutsideDays={showOutsideDays}
        className={className}
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
