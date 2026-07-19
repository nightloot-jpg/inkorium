"use client";

import * as React from "react";
import { useState, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { es } from "date-fns/locale/es";
import { format } from "date-fns";
import "react-day-picker/style.css";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  month: defaultMonth,
  onMonthChange,
  ...props
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(defaultMonth || new Date());
  const touchStartX = useRef<number | null>(null);

  const handleMonthChange = useCallback(
    (newMonth: Date) => {
      setCurrentMonth(newMonth);
      if (onMonthChange) {
        onMonthChange(newMonth);
      }
    },
    [onMonthChange],
  );

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (e.deltaY > 0) {
        handleMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
      } else if (e.deltaY < 0) {
        handleMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
      }
    },
    [currentMonth, handleMonthChange],
  );

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartX.current === null) return;
      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchStartX.current - touchEndX;

      if (Math.abs(diff) > 50) {
        // threshold
        if (diff > 0) {
          // Swipe left -> next month
          handleMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
        } else {
          // Swipe right -> prev month
          handleMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
        }
      }
      touchStartX.current = null;
    },
    [currentMonth, handleMonthChange],
  );

  return (
    <div
      className="relative group calendar-wrapper"
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <style>{`
        .rdp-root {
          --rdp-accent-color: var(--color-primary);
          --rdp-accent-background-color: var(--color-primary);
          --rdp-day-height: 36px;
          --rdp-day-width: 36px;
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
          color: var(--color-muted-foreground);
          font-weight: 500;
          font-size: 13px;
          text-transform: capitalize;
          border-bottom: none;
          padding: 0.5rem 0;
          text-align: center;
        }

        .rdp-day {
          font-weight: 500;
          font-size: 14px;
          border-right: none;
          text-align: center;
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
          margin: 0 auto;
        }

        .rdp-day_button:hover:not([disabled]):not(.rdp-selected) {
          background-color: var(--color-secondary); /* Hover color */
          color: inherit;
        }

        .rdp-outside {
          color: #d1d5db;
        }

        .rdp-today:not(.rdp-outside) .rdp-day_button {
          background-color: var(--color-accent);
          color: var(--color-accent-foreground);
          font-weight: 600;
        }

        .rdp-selected {
          color: var(--color-primary-foreground);
        }

        .rdp-selected .rdp-day_button {
          background-color: var(--color-primary);
          color: var(--color-primary-foreground);
        }

        .rdp-month_caption {
          font-weight: 500;
          color: var(--color-foreground);
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 0.5rem;
          padding: 0;
          font-size: 16px;
        }

        .rdp-caption_label {
          margin: 0;
          text-align: center;
          padding: 0 1rem;
        }

        .rdp-months {
          position: relative;
        }

        .rdp-month {
          position: relative;
        }



        .rdp-nav > * {
          pointer-events: auto;
        }


        .rdp-nav_button_previous, .rdp-nav_button_next, .rdp-button_previous, .rdp-button_next, .rdp-nav_button {
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 9999px;
          transition: background-color 0.2s;
          pointer-events: auto !important;
          z-index: 50;
          position: absolute;
          top: 0;
        }

        .rdp-button_previous, .rdp-nav_button_previous {
           left: 0;
        }

        .rdp-button_next, .rdp-nav_button_next {
           right: 0;
        }

        .rdp-nav_button_previous:hover, .rdp-nav_button_next:hover, .rdp-button_previous:hover, .rdp-button_next:hover, .rdp-nav_button:hover {
          background-color: var(--color-secondary);
        }

        .rdp-nav {
          display: flex;
          align-items: center;
          position: static;
          width: 100%;
          justify-content: space-between;
          pointer-events: none;
          z-index: 40;
        }


        .rdp-nav_button_previous:hover, .rdp-nav_button_next:hover, .rdp-button_previous:hover, .rdp-button_next:hover, .rdp-nav_button:hover {
          background-color: var(--color-secondary);
        }

        .rdp-nav {
          display: flex;
          align-items: center;
          position: absolute;
          width: 100%;
          left: 0;
          top: 0;
          justify-content: center;
          pointer-events: none;
          gap: 140px; /* Space arrows around the title */
          z-index: 10;
        }


        /* Support for modifier indicators (dots) */
        .has-event .rdp-day_button {
          position: relative;
        }
        .has-event .rdp-day_button::after {
          content: "";
          position: absolute;
          bottom: 4px;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 4px;
          background-color: var(--color-primary);
          border-radius: 50%;
        }
        .rdp-selected.has-event .rdp-day_button::after {
          background-color: var(--color-primary-foreground);
        }
      `}</style>
      <DayPicker
        weekStartsOn={1}
        showOutsideDays={showOutsideDays}
        locale={es}
        month={currentMonth}
        onMonthChange={handleMonthChange}
        className={`w-full ${className || ""}`}
        formatters={{
          formatWeekdayName: (date) => {
            const days = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"];
            return days[date.getDay()];
          },
          formatCaption: (date) => {
            const monthStr = format(date, "LLLL", { locale: es });
            return monthStr.charAt(0).toUpperCase() + monthStr.slice(1) + " " + date.getFullYear();
          },
        }}
        components={{
          Chevron: (props) => {
            if (props.orientation === "left") {
              return (
                <ChevronLeft
                  className="h-5 w-5 text-foreground transition-opacity"
                  strokeWidth={2}
                  {...props}
                />
              );
            }
            return (
              <ChevronRight
                className="h-5 w-5 text-foreground transition-opacity"
                strokeWidth={2}
                {...props}
              />
            );
          },
        }}
        {...props}
      />
    </div>
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
