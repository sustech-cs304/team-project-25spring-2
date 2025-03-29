"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import { 
  BookOpen, 
  CalendarDays, 
  Info, 
  Clock 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {SERVER} from "@/components/data/CodeEnvType";

interface CourseSchedule {
  date: string;
  section_name: string;
}

interface CourseInfoData {
  course_id: string;
  name: string;
  number: string;
  description: string;
  schedules: CourseSchedule[];
}

interface CourseInfoProps {
  courseId: string;
}

export default function CourseInfo({ courseId }: CourseInfoProps) {
  const [courseData, setCourseData] = useState<CourseInfoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    const fetchCourseInfo = async () => {
      if (!courseId) return;
      
      try {
        setLoading(true);
        // In a real app, you would fetch from your actual API endpoint
        const response = await fetch(SERVER + `/classes/${courseId}/course_info`);

        if (!response.ok) {
          throw new Error(`Failed to fetch course info: ${response.status}`);
        }

        const data = await response.json();
        setCourseData(data);
      } catch (error) {
        console.error("Error fetching course info:", error);
        setError("Failed to load course information. Please try again later.");

        // For development purposes, use mock data
        setCourseData({
          course_id: "b20be0be-57f5-4db3-91ea-8a961c443134",
          name: "Advanced Programming Paradigms",
          number: "CS339",
          description: "This course explores various programming paradigms including functional, object-oriented, and concurrent programming. Students will gain hands-on experience with multiple programming languages and develop a deep understanding of different approaches to software design.",
          schedules: [
            {
              date: "2025-01-16",
              section_name: "Morning Lecture"
            },
            {
              date: "2025-01-20",
              section_name: "Lab Session A"
            },
            {
              date: "2025-01-24",
              section_name: "Afternoon Discussion"
            },
            {
              date: "2025-02-03",
              section_name: "Guest Lecture"
            },
            {
              date: "2025-02-10",
              section_name: "Project Workshop"
            },
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCourseInfo();
  }, [courseId]);

  // Convert string dates to Date objects
  const scheduleDates = courseData?.schedules.map(schedule => new Date(schedule.date)) || [];

  // Find section name for a specific date
  const getSectionForDate = (date: Date): string | undefined => {
    if (!courseData) return undefined;

    const dateString = date.toISOString().split('T')[0];
    const schedule = courseData.schedules.find(s => s.date === dateString);
    return schedule?.section_name;
  };

  // Function to determine if a date has a scheduled class
  const isScheduledDate = (date: Date): boolean => {
    return scheduleDates.some(
      scheduledDate =>
        scheduledDate.getFullYear() === date.getFullYear() &&
        scheduledDate.getMonth() === date.getMonth() &&
        scheduledDate.getDate() === date.getDate()
    );
  };

  // Custom day rendering for the calendar
  const renderDay = (date: Date, modifiers: any) => {
    const isScheduled = isScheduledDate(date);

    if (!isScheduled) {
      return <div className="h-full w-full flex items-center justify-center">{date.getDate()}</div>;
    }

    const sectionName = getSectionForDate(date);

    return (
      <Popover>
        <PopoverTrigger asChild>
          <div
            className="h-full w-full flex items-center justify-center rounded-md bg-primary/20 border border-primary
              font-bold text-primary hover:bg-primary/30 cursor-pointer"
          >
            {date.getDate()}
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">
              {date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              })}
            </p>
            <div className="flex items-center gap-1 text-sm">
              <Clock size={14} className="text-primary" />
              <span>{sectionName}</span>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  if (loading) {
    return <CourseInfoSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <Card className="w-full">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center gap-2">
              <Info className="h-10 w-10 text-destructive" />
              <h3 className="text-xl font-semibold">Error</h3>
              <p className="text-muted-foreground">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!courseData) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6 p-6 h-full overflow-y-auto">
      {/* Course Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">{courseData.name}</h1>
        </div>
        <div className="flex items-center">
          <Badge variant="outline" className="text-lg font-semibold px-3 py-1">
            {courseData.number}
          </Badge>
        </div>
      </div>

      {/* Course Description */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center gap-2">
            <Info size={18} className="text-muted-foreground" />
            Course Description
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">
            {courseData.description}
          </p>
        </CardContent>
      </Card>

      {/* Course Schedule Calendar */}
      <Card className="flex-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center gap-2">
            <CalendarDays size={18} className="text-muted-foreground" />
            Course Schedule
          </CardTitle>
          <CardDescription>
            Click on highlighted dates to see class section details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border w-full"
              largeDisplay={true}
              components={{
                Day: ({ date }) => renderDay(date, {}),
              }}
            />

            {selectedDate && isScheduledDate(selectedDate) && (
              <Card className="mt-4 w-full bg-muted/30">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-lg">
                      {selectedDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </h3>
                    <Badge>{getSectionForDate(selectedDate)}</Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CourseInfoSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6 rounded" />
          <Skeleton className="h-10 w-3/4" />
        </div>
        <Skeleton className="h-6 w-24" />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full rounded-md" />
        </CardContent>
      </Card>
    </div>
  );
}
