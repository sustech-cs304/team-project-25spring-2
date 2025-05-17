"use client";

import React, { useState, useEffect, useRef } from "react";
import { BookCopy, PlusCircle, Edit, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUserContext } from "../UserEnvProvider";
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';
import { Course } from "./page";

// Add/Edit Course Dialog component
const CourseFormDialog = ({ 
  open, 
  onOpenChange, 
  courseToEdit, 
  onCourseUpdated 
}: { 
  open: boolean, 
  onOpenChange: (open: boolean) => void, 
  courseToEdit?: Course, 
  onCourseUpdated: () => void 
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const { token, userId } = useUserContext();
  
  const isNewCourse = !courseToEdit;
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      
      // Add teacher_id array (including current user)
      const teacherIds = courseToEdit?.teachers_name?.map(name => name) || [];
      if (userId && !teacherIds.includes(userId)) {
        formData.append('teacher_id', userId);
      }
      
      // For existing courses, ensure we have the course_id
      if (courseToEdit?.course_id) {
        formData.append('course_id', courseToEdit.course_id);
      } else {
        // Generate new UUID for new courses
        formData.append('course_id', uuidv4());
      }
      
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/course_info', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Failed to save course');
      }
      
      toast.success(isNewCourse ? 'Course created successfully' : 'Course updated successfully');
      onOpenChange(false);
      onCourseUpdated();
    } catch (error) {
      console.error('Error saving course:', error);
      toast.error(isNewCourse ? 'Failed to create course' : 'Failed to update course');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isNewCourse ? 'Add New Course' : 'Edit Course'}</DialogTitle>
          <DialogDescription>
            {isNewCourse 
              ? 'Fill out the form below to create a new course.' 
              : 'Update the course information.'}
          </DialogDescription>
        </DialogHeader>
        
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Course Name</Label>
            <Input 
              id="name" 
              name="name" 
              defaultValue={courseToEdit?.name || ''} 
              required 
              placeholder="e.g., Introduction to Computer Science"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="number">Course Number</Label>
            <Input 
              id="number" 
              name="number" 
              defaultValue={courseToEdit?.number || ''} 
              required 
              placeholder="e.g., CS101"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              name="description" 
              defaultValue={courseToEdit?.description || ''} 
              placeholder="Enter course description"
              rows={4}
            />
          </div>
          
          <div className="flex justify-end pt-4">
            <Button 
              variant="outline" 
              type="button" 
              className="mr-2"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isNewCourse ? 'Create Course' : 'Update Course'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// CourseCard component to display each course
const CourseCard = ({
  course,
  onClick,
  onEdit,
  isSelected,
}: {
  course: Course;
  onClick: () => void;
  onEdit: () => void;
  isSelected: boolean;
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.2 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
    >
      <Card 
        className={`overflow-hidden border cursor-pointer transition-colors ${
          isSelected ? 'border-primary border-2' : 'border-border hover:border-primary/50'
        }`}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold truncate">
              {course.name}
            </CardTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Edit size={16} />
            </Button>
          </div>
          <CardDescription className="text-sm text-muted-foreground font-medium">
            {course.number}
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Instructors: {course.teachers_name.join(", ")}</span>
          </div>
        </CardContent>
        <CardFooter className="pt-2 border-t bg-muted/20">
          <Button variant="ghost" size="sm" className="ml-auto text-xs">Manage Course</Button>
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

interface ManageLeftBarProps {
  isVisible: boolean;
  onSelectCourse: (course: Course) => void;
  selectedCourseId?: string;
}

export default function ManageLeftBar({ isVisible, onSelectCourse, selectedCourseId }: ManageLeftBarProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState<Course | undefined>(undefined);
  const { token } = useUserContext();

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/courses', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }
      
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
          description: "An introductory course to computer science principles.",
          teachers_name: ["Dr. Smith"]
        },
        {
          course_id: "cs201",
          name: "Data Structures",
          number: "CS 201",
          description: "Advanced data structures and algorithms.",
          teachers_name: ["Dr. Johnson", "Prof. Williams"]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleAddCourse = () => {
    setCourseToEdit(undefined);
    setAddDialogOpen(true);
  };

  const handleEditCourse = (course: Course) => {
    setCourseToEdit(course);
    setEditDialogOpen(true);
  };

  return (
    <div
      className={`border rounded-lg shadow-sm transition-all duration-300 
      ${isVisible ? 'w-1/3 mr-6 opacity-100' : 'w-0 opacity-0'} 
      overflow-hidden flex flex-col`}
    >
      <div className="flex flex-row p-4 items-center border-b sticky top-0 bg-background z-10">
        <div className="flex items-center gap-2">
          <BookCopy size={18} className="text-primary" />
          <h2 className="text-lg font-semibold">Manage Courses</h2>
        </div>
        <Button
          variant="outline"
          className="ml-auto"
          size="sm"
          onClick={handleAddCourse}
        >
          <PlusCircle size={16} />
          <span className="ml-1">Add Course</span>
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 gap-4">
          {loading ? (
            <>
              <CourseCardSkeleton />
              <CourseCardSkeleton />
              <CourseCardSkeleton />
            </>
          ) : courses?.length > 0 ? (
            courses?.map((course) => (
              <CourseCard
                key={course.course_id}
                course={course}
                onClick={() => onSelectCourse(course)}
                onEdit={() => handleEditCourse(course)}
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
                You haven't created any courses yet
              </p>
              <Button className="mt-4" size="sm" onClick={handleAddCourse}>
                <PlusCircle size={16} className="mr-2" />
                Create your first course
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Add Course Dialog */}
      <CourseFormDialog 
        open={addDialogOpen} 
        onOpenChange={setAddDialogOpen} 
        onCourseUpdated={fetchCourses}
      />

      {/* Edit Course Dialog */}
      <CourseFormDialog 
        open={editDialogOpen} 
        onOpenChange={setEditDialogOpen} 
        courseToEdit={courseToEdit} 
        onCourseUpdated={fetchCourses}
      />
    </div>
  );
} 