"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export interface CalendarProps {
  className?: string;
  classNames?: Record<string, string>;
  showOutsideDays?: boolean;
  largeDisplay?: boolean;
  selected?: Date | Date[] | undefined;
  onSelect?: (date: Date | undefined) => void;
  mode?: "single" | "multiple" | "range";
  components?: Record<string, React.ComponentType<any>>;
  [key: string]: any; // Allow other DayPicker props
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  largeDisplay = false,
  selected,
  onSelect,
  mode,
  components,
  ...props
}: CalendarProps) {
  // Define cell and day sizes based on display mode
  const cellSizeClass = largeDisplay ? "w-14 h-14" : "w-8 h-8";
  const daySizeClass = largeDisplay ? "size-12" : "size-8";
  const monthClass = largeDisplay ? "w-full" : "flex flex-col";
  const headCellClass = largeDisplay
    ? "text-muted-foreground rounded-md w-14 text-center font-medium text-sm py-2"
    : "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]";

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      selected={selected}
      onSelect={onSelect}
      mode={mode}
      className={cn("p-3", largeDisplay ? "w-full" : "", className)}
      classNames={{
        months: cn("flex flex-col sm:flex-row gap-2", largeDisplay ? "w-full justify-center" : ""),
        month: cn(monthClass, "gap-4"),
        caption: cn("flex justify-center pt-1 relative items-center", largeDisplay ? "mb-4" : "", "w-full"),
        caption_label: cn("text-sm font-medium", largeDisplay ? "text-base" : ""),
        nav: "flex items-center gap-1",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          largeDisplay ? "size-9" : "size-7",
          "bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: cn("w-full border-collapse", largeDisplay ? "table-fixed" : "space-x-1"),
        head_row: "flex w-full",
        head_cell: headCellClass,
        row: "flex w-full mt-2",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
          cellSizeClass,
          "[&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-range-end)]:rounded-r-md",
          mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
            : "[&:has([aria-selected])]:rounded-md"
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          daySizeClass,
          "p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_start: "day-range-start aria-selected:bg-primary aria-selected:text-primary-foreground",
        day_range_end: "day-range-end aria-selected:bg-primary aria-selected:text-primary-foreground",
        day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside: "day-outside text-muted-foreground aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn("size-4", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn("size-4", className)} {...props} />
        ),
        ...components
      }}
      {...props}
    />
  )
}

export { Calendar }
