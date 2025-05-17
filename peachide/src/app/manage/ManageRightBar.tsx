"use client";

import React, { useState, useEffect, useRef } from "react";
import { BookCopy, UserPlus, Users, BookOpen, ClipboardList, Search, Loader2, Check, X, GraduationCap, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Course } from "./page";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserContext } from "../UserEnvProvider";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import debounce from 'lodash/debounce';

// Student data type
interface Student {
  user_id: string;
  name: string;
  email?: string;
  is_teacher?: boolean;
  photo: string;
  office_hour?: string;
  office_place?: string;
}

// Search result type
interface SearchResult {
  user_id: string;
  name: string;
  isTeacher?: boolean;
}

// Student Component - more compact design for students
const StudentCard = ({ student }: { student: Student }) => {
  // Convert first letters of name to initials for avatar
  const getInitials = (name: string) => {
    return name.split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <div className="flex items-center p-3 rounded-md border bg-background hover:shadow-sm transition-all">
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={student.photo} alt={student.name} />
            <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">{student.name}</p>
            <p className="text-xs text-muted-foreground">{student.email || 'No email available'}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Teacher Component - based on Instructors.tsx design
const TeacherCard = ({ teacher }: { teacher: Student }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card className="overflow-hidden hover:shadow-md transition-all">
        <CardHeader className="pb-2">
          <div className="flex flex-col items-center">
            <div className="mb-4 relative">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary/20 shadow-md">
                <Avatar className="w-full h-full">
                  <AvatarImage src={teacher.photo} alt={teacher.name} className="w-full h-full object-cover" />
                  <AvatarFallback className="text-2xl">{teacher.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CardTitle className="text-lg font-bold text-center">{teacher.name}</CardTitle>
              <div className="bg-primary text-white p-1.5 rounded-full">
                <GraduationCap size={14} />
              </div>
            </div>
            {teacher.email && (
              <p className="text-xs text-muted-foreground mt-1">{teacher.email}</p>
            )}
          </div>
        </CardHeader>
        <CardContent className="text-center pb-6">
          <div className="space-y-3">
            {teacher.office_hour && (
              <div className="flex items-center justify-center gap-2">
                <Clock size={14} className="text-primary" />
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Office Hours:</span> {teacher.office_hour}
                </p>
              </div>
            )}
            {teacher.office_place && (
              <div className="flex items-center justify-center gap-2">
                <MapPin size={14} className="text-primary" />
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Location:</span> {teacher.office_place}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Add User Dialog
const AddUserDialog = ({ 
  open, 
  onOpenChange, 
  courseId, 
  onUserAdded 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  courseId: string;
  onUserAdded: () => void;
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const { token } = useUserContext();

  // Debounced search function
  const debouncedSearch = useRef(
    debounce(async (term: string) => {
      if (!term || term.length < 2) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      try {
        const formData = new FormData();
        formData.append('search_term', term);

        const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/searchByName', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        if (!response.ok) {
          throw new Error('Search failed');
        }

        const data = await response.json();
        setSearchResults(data.searchResult || []);
      } catch (error) {
        console.error('Error searching users:', error);
        toast.error('Failed to search users');
        // Mock data for development
        setSearchResults([
          { user_id: 'user1', name: 'John Smith', isTeacher: false },
          { user_id: 'user2', name: 'Jane Doe', isTeacher: false },
          { user_id: 'user3', name: 'Bob Johnson', isTeacher: true }
        ]);
      } finally {
        setIsSearching(false);
      }
    }, 500)
  ).current;

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    setIsSearching(!!term && term.length >= 2);
    debouncedSearch(term);
  };

  // Add user to course
  const handleAddUser = async (userId: string) => {
    setIsAdding(true);
    
    try {
      const formData = new FormData();
      formData.append('course_id', courseId);
      formData.append('user_id', userId);

      const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/add', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to add user to course');
      }

      toast.success('User added to course successfully');
      setSearchTerm('');
      setSearchResults([]);
      onOpenChange(false);
      onUserAdded();
    } catch (error) {
      console.error('Error adding user to course:', error);
      toast.error('Failed to add user to course');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Student or Teacher</DialogTitle>
          <DialogDescription>
            Search for users by name and add them to this course.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by name..."
              className="pl-10"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          
          {isSearching && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
          
          {searchResults.length > 0 && (
            <div className="max-h-[300px] overflow-y-auto space-y-2 border rounded-md p-2">
              {searchResults.map(user => (
                <div 
                  key={user.user_id}
                  className="flex justify-between items-center p-2 hover:bg-muted/50 rounded-md cursor-pointer"
                  onClick={() => handleAddUser(user.user_id)}
                >
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>{user.name}</span>
                    {user.isTeacher && (
                      <Badge className="ml-2 bg-primary/20 text-primary">Teacher</Badge>
                    )}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8"
                    disabled={isAdding}
                  >
                    {isAdding ? 
                      <Loader2 className="h-4 w-4 animate-spin" /> : 
                      <UserPlus className="h-4 w-4" />
                    }
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          {searchTerm && !isSearching && searchResults.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              No users found. Try a different search term.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Students Tab Content
const StudentsTab = ({ courseId }: { courseId: string }) => {
  const [users, setUsers] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const { token } = useUserContext();
  
  const fetchStudents = async () => {
    if (!courseId) return;
    
    setLoading(true);
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL + `/getStudents?course_id=${courseId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }
      
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      // Mock data for development
      setUsers([
        {
          user_id: 'student1',
          name: 'Alice Johnson',
          email: 'alice@example.com',
          is_teacher: false,
          photo: ''
        },
        {
          user_id: 'instructor1',
          name: 'Professor Smith',
          email: 'smith@university.edu',
          is_teacher: true,
          photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Smith&backgroundColor=b6e3f4',
          office_hour: 'Mon & Wed 2-4pm',
          office_place: 'Room 101, CS Building'
        },
        {
          user_id: 'student2',
          name: 'Bob Williams',
          email: 'bob@example.com',
          is_teacher: false,
          photo: ''
        },
        {
          user_id: 'instructor2',
          name: 'Dr. Carol Davis',
          email: 'davis@university.edu',
          is_teacher: true,
          photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Davis&backgroundColor=ffdfbf',
          office_hour: 'Tue & Thu 1-3pm',
          office_place: 'Room 205, Engineering Hall'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchStudents();
  }, [courseId]);
  
  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Course Members</h2>
          <Skeleton className="h-9 w-28" />
        </div>
        <Skeleton className="h-40 w-full" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }
  
  const teachers = users.filter(u => u.is_teacher);
  const students = users.filter(u => !u.is_teacher);
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold">Course Members</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {students.length} Students, {teachers.length} Teachers
          </p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>
      
      {/* Teachers Section */}
      {teachers.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            Instructors
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <AnimatePresence>
              {teachers.map(teacher => (
                <TeacherCard 
                  key={teacher.user_id} 
                  teacher={teacher}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
      
      {/* Students Section */}
      <div>
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Students
        </h3>
        
        {students.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <AnimatePresence>
              {students.map(student => (
                <StudentCard 
                  key={student.user_id} 
                  student={student}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-8 border rounded-md bg-muted/10">
            <Users className="mx-auto h-8 w-8 text-muted-foreground opacity-50" />
            <h3 className="mt-2 text-sm font-medium">No students enrolled</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Add students to this course using the "Add User" button.
            </p>
          </div>
        )}
      </div>
      
      {/* No users at all */}
      {users.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
          <h3 className="mt-4 text-lg font-medium">No users enrolled</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Get started by adding students or teachers to this course.
          </p>
          <Button className="mt-4" onClick={() => setAddDialogOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
      )}
      
      <AddUserDialog 
        open={addDialogOpen} 
        onOpenChange={setAddDialogOpen}
        courseId={courseId}
        onUserAdded={fetchStudents}
      />
    </div>
  );
};

// Sections Tab Content (placeholder)
const SectionsTab = () => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <BookOpen className="h-12 w-12 text-muted-foreground opacity-50" />
      <h3 className="mt-4 text-lg font-medium">Sections Management</h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-md">
        This feature is coming soon. You'll be able to create and manage course sections here.
      </p>
    </div>
  );
};

// Assignments Tab Content (placeholder)
const AssignmentsTab = () => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <ClipboardList className="h-12 w-12 text-muted-foreground opacity-50" />
      <h3 className="mt-4 text-lg font-medium">Assignments Management</h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-md">
        This feature is coming soon. You'll be able to create and manage assignments here.
      </p>
    </div>
  );
};

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
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${active
        ? 'bg-background text-foreground shadow-sm'
        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
        }`}
    >
      {children}
    </button>
  );
}

type Tab = 'students' | 'sections' | 'assignments';

interface ManageRightBarProps {
  isVisible: boolean;
  selectedCourse?: Course;
}

export default function ManageRightBar({ isVisible, selectedCourse }: ManageRightBarProps) {
  const [activeTab, setActiveTab] = useState<Tab>('students');

  // Reset to first tab when new course is selected
  useEffect(() => {
    setActiveTab('students');
  }, [selectedCourse?.course_id]);

  const renderTabContent = () => {
    if (!selectedCourse) {
      return null;
    }

    switch (activeTab) {
      case 'students':
        return <StudentsTab courseId={selectedCourse.course_id} />;
      case 'sections':
        return <SectionsTab />;
      case 'assignments':
        return <AssignmentsTab />;
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
              active={activeTab === 'students'}
              onClick={() => setActiveTab('students')}
            >
              Students
            </TabButton>
            <TabButton
              active={activeTab === 'sections'}
              onClick={() => setActiveTab('sections')}
            >
              Sections
            </TabButton>
            <TabButton
              active={activeTab === 'assignments'}
              onClick={() => setActiveTab('assignments')}
            >
              Assignments
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
            Select a course from the list to manage
          </p>
        </div>
      )}
    </div>
  );
} 