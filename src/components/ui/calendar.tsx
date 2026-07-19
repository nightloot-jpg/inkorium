"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { es } from "date-fns/locale/es";
import { format } from "date-fns";
import "react-day-picker/style.css";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <>
      <style>{`
        .rdp-root {
          --rdp-accent-color: #1a1a1a;
          --rdp-accent-background-color: #1a1a1a;
          --rdp-day-height: 40px;
          --rdp-day-width: 40px;
          --rdp-outline-color: transparent;
          --rdp-background-color: transparent;
          width: 100%;
        }

        .rdp-month_grid {
          border-collapse: separate;
          border-spacing: 0 4px;
          width: 100%;
        }

        .rdp-weekday {
          color: #9ca3af;
          font-weight: 500;
          font-size: 13px;
          text-transform: uppercase;
          border-bottom: none;
          padding: 0.5rem 0;
        }

        .rdp-day {
          font-weight: 500;
          font-size: 15px;
          border-right: none;
        }

        .rdp-week {
          border-bottom: none;
        }

        .rdp-day_button {
          width: 100%;
          height: 100%;
          border-radius: 9999px; /* Circular */
          border: none;
          background-color: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s, color 0.2s;
        }

        .rdp-day_button:hover:not([disabled]):not(.rdp-selected) {
          background-color: #f3f4f6; /* Hover color */
          color: inherit;
        }

        .rdp-outside {
          color: #d1d5db;
        }

        .rdp-today:not(.rdp-outside) {
          color: #1a1a1a;
          font-weight: 700;
        }

        .rdp-selected {
          color: #ffffff;
        }

        .rdp-selected .rdp-day_button {
          background-color: #1a1a1a;
          color: #ffffff;
        }

        .rdp-month_caption {
          font-weight: 600;
          color: #1a1a1a;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding: 0 0.5rem;
          font-size: 16px;
        }

        .rdp-caption_label {
          margin: 0;
          text-align: center;
          flex: 1;
        }

        .rdp-months {
          position: relative;
        }

        .rdp-nav {
          display: flex;
          align-items: center;
          position: absolute;
          width: calc(100% - 1rem);
          left: 0.5rem;
          top: 0;
          justify-content: space-between;
          pointer-events: none;
        }

        .rdp-nav > * {
          pointer-events: auto;
        }

        .rdp-button_previous, .rdp-button_next {
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 9999px;
          transition: background-color 0.2s;
        }

        .rdp-button_previous:hover, .rdp-button_next:hover {
          background-color: #f3f4f6;
        }

        /* Support for modifier indicators (dots) */
        .has-event .rdp-day_button {
          position: relative;
        }
        .has-event .rdp-day_button::after {
          content: "";
          position: absolute;
          bottom: 6px;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 4px;
          background-color: #d1d5db;
          border-radius: 50%;
        }
        .rdp-selected.has-event .rdp-day_button::after {
          background-color: #ffffff;
        }
      `}</style>
      <DayPicker
        showOutsideDays={showOutsideDays}
        locale={es}
        className={`w-full ${className || ""}`}
        formatters={{
          formatWeekdayName: (date) => {
            const days = ["D", "L", "M", "X", "J", "V", "S"];
            return days[date.getDay()];
          },
          formatCaption: (date) => {
            const month = format(date, "LLLL", { locale: es });
            return month.charAt(0).toUpperCase() + month.slice(1) + " " + date.getFullYear();
          },
        }}
        components={{
          Chevron: (props) => {
            if (props.orientation === "left") {
              return <ChevronLeft className="h-5 w-5 text-black" strokeWidth={2} {...props} />;
            }
            return <ChevronRight className="h-5 w-5 text-black" strokeWidth={2} {...props} />;
          },
        }}
        {...props}
      />
    </>
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
