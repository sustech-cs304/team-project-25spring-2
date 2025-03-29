"use client";

import React, { useState, useEffect } from "react";
import { BookCopy, SquareTerminal, FilePlus, FolderPlus, Users, Calendar, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

// Import tab components
import CourseInfo from "../CourseInfo";
import Instructors from "../Instructors";
import Lecture from "../Lecture";
import Assignment from "../Assignment";

// Course type definition based on API response
interface Course {
  course_id: string;
  name: string;
  number: string;
  teachers_name: string[];
}

// CourseCard component to display each course
const CourseCard = ({ course, onClick, isSelected }: { course: Course; onClick: () => void; isSelected: boolean }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.2 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
    >
      <Card className={`overflow-hidden border cursor-pointer transition-colors ${
        isSelected ? 'border-primary border-2' : 'border-border hover:border-primary/50'
      }`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold truncate">{course.name}</CardTitle>
            <div className="bg-primary/10 p-2 rounded-full">
              <GraduationCap size={16} className="text-primary" />
            </div>
          </div>
          <CardDescription className="text-sm text-muted-foreground font-medium">
            {course.number}
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users size={14} />
            <span>{course.teachers_name.join(", ")}</span>
          </div>
        </CardContent>
        <CardFooter className="pt-2 border-t bg-muted/20">
          <Button variant="ghost" size="sm" className="ml-auto text-xs">View Details</Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

// Loading skeleton for course cards
const CourseCardSkeleton = () => {
  return (
    <Card className="overflow-hidden border border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        <Skeleton className="h-4 w-1/2 mt-2" />
      </CardHeader>
      <CardContent className="pb-2">
        <Skeleton className="h-4 w-full" />
      </CardContent>
      <CardFooter className="pt-2 border-t">
        <div className="flex justify-end w-full">
          <Skeleton className="h-8 w-24" />
        </div>
      </CardFooter>
    </Card>
  );
};

function ClassesLeftBar({ props, isVisible, onSelectCourse, selectedCourseId }: { 
  props: React.ComponentProps<any>; 
  isVisible: boolean;
  onSelectCourse: (course: Course) => void;
  selectedCourseId?: string;
}) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        // In a real app, you'd fetch from your actual API endpoint
        const response = await fetch('/classes/getCourses');
        const data = await response.json();
        setCourses(data.courses);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
        // Fallback data for development/testing
        setCourses([
          { 
            course_id: "cs101", 
            name: "Introduction to Computer Science", 
            number: "CS 101", 
            teachers_name: ["Dr. Smith"]
          },
          { 
            course_id: "cs201", 
            name: "Data Structures", 
            number: "CS 201", 
            teachers_name: ["Dr. Johnson", "Prof. Williams"]
          },
          { 
            course_id: "math152", 
            name: "Calculus II", 
            number: "MATH 152", 
            teachers_name: ["Dr. Brown"]
          },
          { 
            course_id: "eng101", 
            name: "English Composition", 
            number: "ENG 101", 
            teachers_name: ["Prof. Davis"]
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourses();
  }, []);

  return (
    <div 
      className={`border rounded-lg shadow-sm transition-all duration-300 
      ${isVisible ? 'w-1/3 mr-6 opacity-100' : 'w-0 opacity-0'} 
      overflow-hidden flex flex-col`}
    >
      <div className="flex flex-row p-4 items-center border-b sticky top-0 bg-background z-10">
        <div className="flex items-center gap-2">
          <BookCopy size={18} className="text-primary" />
          <h2 className="text-lg font-semibold">My Courses</h2>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 gap-4">
          {loading ? (
            <>
              <CourseCardSkeleton />
              <CourseCardSkeleton />
              <CourseCardSkeleton />
            </>
          ) : courses.length > 0 ? (
            courses.map((course) => (
              <CourseCard 
                key={course.course_id} 
                course={course} 
                onClick={() => onSelectCourse(course)}
                isSelected={course.course_id === selectedCourseId}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="bg-muted p-4 rounded-full mb-4">
                <BookCopy size={24} className="text-muted-foreground" />
              </div>
              <h3 className="font-medium">No courses found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                You don't have any courses yet
              </p>
              <Button className="mt-4" size="sm">
                Enroll in a course
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

type Tab = 'course-info' | 'instructors' | 'lecture' | 'assignment';

function ClassesRightBar({ 
  props, 
  isVisible, 
  selectedCourse 
}: { 
  props: React.ComponentProps<any>; 
  isVisible: boolean; 
  selectedCourse?: Course;
}) {
  const [activeTab, setActiveTab] = useState<Tab>('course-info');

  // Reset to first tab when new course is selected
  useEffect(() => {
    setActiveTab('course-info');
  }, [selectedCourse?.course_id]);

  const renderTabContent = () => {
    if (!selectedCourse) {
      return (
        <div className="flex flex-col items-center justify-center p-8 h-full text-center">
          <div className="bg-muted p-4 rounded-full mb-4">
            <BookCopy size={24} className="text-muted-foreground" />
          </div>
          <h3 className="font-medium">No course selected</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Select a course from the list to view details
          </p>
        </div>
      );
    }

    switch (activeTab) {
      case 'course-info':
        return <CourseInfo courseId={selectedCourse.course_id} />;
      case 'instructors':
      //   return <Instructors courseId={selectedCourse.course_id} />;
      // case 'lecture':
      //   return <Lecture courseId={selectedCourse.course_id} />;
      // case 'assignment':
      //   return <Assignment courseId={selectedCourse.course_id} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 border rounded-lg shadow-sm h-full flex flex-col overflow-hidden">
      {selectedCourse ? (
        <>
          <div className="flex-row items-center flex-none p-4 border-b">
            <h2 className="text-xl font-semibold">{selectedCourse.name}</h2>
            <p className="text-sm text-muted-foreground">{selectedCourse.number}</p>
          </div>
          <div className="flex space-x-1 p-1 bg-muted/30 border-b">
            <TabButton 
              active={activeTab === 'course-info'} 
              onClick={() => setActiveTab('course-info')}
            >
              Course Info
            </TabButton>
            <TabButton 
              active={activeTab === 'instructors'} 
              onClick={() => setActiveTab('instructors')}
            >
              Instructors
            </TabButton>
            <TabButton 
              active={activeTab === 'lecture'} 
              onClick={() => setActiveTab('lecture')}
            >
              Lecture
            </TabButton>
            <TabButton 
              active={activeTab === 'assignment'} 
              onClick={() => setActiveTab('assignment')}
            >
              Assignment
            </TabButton>
          </div>
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            {renderTabContent()}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 h-full text-center">
          <div className="bg-muted p-4 rounded-full mb-4">
            <BookCopy size={24} className="text-muted-foreground" />
          </div>
          <h3 className="font-medium">No course selected</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Select a course from the list to view details
          </p>
        </div>
      )}
    </div>
  );
}

// Custom Tab Button component
function TabButton({ 
  children, 
  active, 
  onClick 
}: { 
  children: React.ReactNode; 
  active: boolean; 
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
        active 
          ? 'bg-background text-foreground shadow-sm' 
          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
      }`}
    >
      {children}
    </button>
  );
}

export default function Classes() {
  const [selectedCourse, setSelectedCourse] = useState<Course | undefined>(undefined);

  const handleSelectCourse = (course: Course) => {
    setSelectedCourse(course);
  };

  return (
    <div className="flex h-full gap-4">
      <ClassesLeftBar 
        props={{ id: "1", pathname: "/coding/1" }} 
        isVisible={true} 
        onSelectCourse={handleSelectCourse}
        selectedCourseId={selectedCourse?.course_id}
      />
      <ClassesRightBar 
        props={{id:"1"}} 
        isVisible={true}
        selectedCourse={selectedCourse}
      />
    </div>
  );
}