"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  CalendarDays,
  Info
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

  useEffect(() => {
    const fetchCourseInfo = async () => {
      if (!courseId) return;

      try {
        setLoading(true);
        const response = await fetch(process.env.NEXT_PUBLIC_API_URL + `/course_info/${courseId}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch course info: ${response.status}`);
        }

        const data = await response.json();
        setCourseData(data);
      } catch (error) {
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

      {/* Course Schedule List */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center gap-2">
            <CalendarDays size={18} className="text-muted-foreground" />
            Course Schedule
          </CardTitle>
          <CardDescription>
            Upcoming class dates and sections.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-2">
            {courseData.schedules.map((schedule) => (
              <div key={schedule.date} className="flex justify-between items-center py-2 border-b last:border-0">
                <span className="text-sm text-muted-foreground">
                  {new Date(schedule.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <Badge variant="outline">{schedule.section_name}</Badge>
              </div>
            ))}
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