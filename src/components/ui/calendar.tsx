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
          --rdp-accent-color: transparent;
          --rdp-accent-background-color: transparent;
          --rdp-day-height: 2.5rem;
          --rdp-day-width: 2.5rem;
          --rdp-outline-color: transparent;
          --rdp-background-color: transparent;
          width: 100%;
        }

        .rdp-month_grid {
          border-collapse: collapse;
          width: 100%;
        }

        .rdp-weekday {
          color: #4b5563;
          font-weight: bold;
          font-size: 11px;
          text-transform: capitalize;
          border-bottom: 1px solid #e6eaf0;
          padding: 0.5rem 0;
        }

        .rdp-day {
          font-weight: bold;
          font-size: 14px;
          border-right: 1px solid #e6eaf0;
        }
        .rdp-day:last-child {
          border-right: none;
        }
        .rdp-week {
          border-bottom: 1px solid #e6eaf0;
        }
        .rdp-week:last-child {
          border-bottom: none;
        }

        .rdp-day_button {
          width: 100%;
          height: 100%;
          border-radius: 0;
          border: none;
        }

        .rdp-day_button:hover:not([disabled]):not(.rdp-selected) {
          background-color: transparent;
          color: #00aeff;
        }

        .rdp-outside {
          color: #9ca3af;
          opacity: 0.5;
        }

        .rdp-today:not(.rdp-outside) {
          color: #00aeff;
          font-weight: 800;
        }

        .rdp-selected {
          color: #00aeff;
        }

        .rdp-month_caption {
          font-weight: bold;
          color: #2F5FA7;
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 1rem;
          position: relative;
        }

        .rdp-caption_label {
          margin: 0;
          text-align: center;
        }

        .rdp-nav {
          position: absolute;
          right: 0;
          top: 0;
          display: flex;
          gap: 0.25rem;
        }
      `}</style>
      <DayPicker
        showOutsideDays={showOutsideDays}
        className={`w-full ${className || ""}`}
        components={{
          Chevron: (props) => {
            if (props.orientation === "left") {
              return <ChevronLeft className="h-5 w-5 text-black" strokeWidth={3} {...props} />;
            }
            return <ChevronRight className="h-5 w-5 text-black" strokeWidth={3} {...props} />;
          },
        }}
        {...props}
      />
    </>
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
