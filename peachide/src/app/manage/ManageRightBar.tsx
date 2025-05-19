"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  BookCopy,
  UserPlus,
  Users,
  BookOpen,
  ClipboardList,
  Search,
  Loader2,
  Check,
  X,
  GraduationCap,
  Clock,
  MapPin,
  FolderPlus,
  FilePlus, EditIcon
} from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
                  <AvatarImage src={teacher.photo} alt={teacher.name}
                    className="w-full h-full object-cover" />
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

      const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/enroll', {
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
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL + `/fetch_member/${courseId}`, {
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
const SectionsTab = ({ courseId }: { courseId: string }) => {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editSection, setEditSection] = useState<Section | null>(null);
  const [uploadMaterialDialogOpen, setUploadMaterialDialogOpen] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');
  const { token } = useUserContext();

  interface Section {
    section_id: string;
    name: string;
    schedules: string[];
    materials: {
      material_id: string;
      material_name: string;
    }[];
  }

  const fetchSections = async () => {
    if (!courseId) return;

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sections/${courseId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch sections');
      }

      const data = await response.json();
      setSections(data.sections || []);
    } catch (error) {
      console.error('Error fetching sections:', error);
      toast.error('Failed to fetch sections');
      // Mock data for development
      setSections([
        {
          section_id: 'section1',
          name: 'Monday Section',
          schedules: ['2024-05-06-14', '2024-05-13-14', '2024-05-20-14'],
          materials: [
            { material_id: 'mat1', material_name: 'Lecture 1.pdf' },
            { material_id: 'mat2', material_name: 'Exercise Sheet 1.pdf' }
          ]
        },
        {
          section_id: 'section2',
          name: 'Thursday Section',
          schedules: ['2024-05-09-10', '2024-05-16-10', '2024-05-23-10'],
          materials: [
            { material_id: 'mat3', material_name: 'Lecture 2.pdf' }
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, [courseId]);

  const handleCreateSection = () => {
    setEditSection(null);
    setCreateDialogOpen(true);
  };

  const handleEditSection = (section: Section) => {
    setEditSection(section);
    setCreateDialogOpen(true);
  };

  const handleUploadMaterial = (sectionId: string) => {
    setSelectedSectionId(sectionId);
    setUploadMaterialDialogOpen(true);
  };

  const handleDeleteMaterial = async (materialId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/material/${materialId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete material');
      }

      toast.success('Material deleted successfully');
      fetchSections(); // Refresh sections
    } catch (error) {
      console.error('Error deleting material:', error);
      toast.error('Failed to delete material');
    }
  };

  // Format schedule for display
  const formatSchedule = (schedule: string) => {
    const [year, month, day, hour] = schedule.split('-');
    return `${month}/${day}/${year} ${hour}:00`;
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Course Sections</h2>
          <Skeleton className="h-9 w-28" />
        </div>
        <Skeleton className="h-40 w-full" />
        <div className="grid grid-cols-1 gap-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold">Course Sections</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {sections.length} {sections.length === 1 ? 'Section' : 'Sections'}
          </p>
        </div>
        <Button onClick={handleCreateSection}>
          <FolderPlus className="mr-2 h-4 w-4" />
          Create Section
        </Button>
      </div>

      {sections.length > 0 ? (
        <div className="space-y-4">
          {sections.map(section => (
            <Card key={section.section_id} className="overflow-hidden">
              <CardHeader className="bg-muted/30 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle
                      className="text-lg font-semibold">{section.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {section.schedules.length > 0
                        ? `${section.schedules.length} scheduled meetings`
                        : 'No scheduled meetings'}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUploadMaterial(section.section_id)}
                      className={"mt-2"}>
                      <FilePlus className="mr-1 h-3.5 w-3.5" />
                      Add Material
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditSection(section)}
                      className={"mt-2"}
                    >
                      <EditIcon className="mr-1 h-3.5 w-3.5" />

                      Edit Section
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                {section.schedules.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                      <Clock size={16} className="text-primary" />
                      Schedule
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {section.schedules.map((schedule, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="px-2.5 py-1.5 rounded-md text-xs font-normal justify-start w-fit"
                        >
                          {formatSchedule(schedule)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                  <BookCopy size={16} className="text-primary" />
                  Materials
                </h4>

                {section.materials.length > 0 ? (
                  <div className="space-y-2">
                    {section.materials.map(material => (
                      <div
                        key={material.material_id}
                        className="flex items-center justify-between p-2.5 rounded-md border hover:bg-muted/40 transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          <BookOpen className="h-4 w-4 text-primary" />
                          <span className="font-medium text-sm">{material.material_name}</span>
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={async () => {
                              try {
                                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/material/${material.material_id}`, {
                                  method: 'GET',
                                  headers: {
                                    'Authorization': `Bearer ${token}`
                                  }
                                });

                                if (!response.ok) {
                                  throw new Error('Failed to fetch PDF data');
                                }

                                const data = await response.json();

                                // 使用base64编码的PDF数据创建Blob对象
                                const pdfBlob = new Blob([atob(data.data)], { type: 'application/pdf' });
                                const pdfUrl = URL.createObjectURL(pdfBlob);

                                // 在新窗口中打开PDF
                                window.open(pdfUrl, '_blank');
                              } catch (error) {
                                console.error('Error fetching PDF:', error);
                                toast.error('Failed to load PDF');
                              }
                            }}
                          >
                            <Search className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteMaterial(material.material_id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 border rounded-md bg-muted/10">
                    <BookOpen
                      className="mx-auto h-7 w-7 text-muted-foreground opacity-50" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      No materials added to this section yet
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-3"
                      onClick={() => handleUploadMaterial(section.section_id)}
                    >
                      <FilePlus className="mr-1.5 h-3.5 w-3.5" />
                      Add Material
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-md bg-muted/10">
          <FolderPlus className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
          <h3 className="mt-4 text-lg font-medium">No sections created</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Get started by creating your first section for this course.
          </p>
          <Button className="mt-4" onClick={handleCreateSection}>
            <FolderPlus className="mr-2 h-4 w-4" />
            Create Section
          </Button>
        </div>
      )}

      <SectionDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        courseId={courseId}
        section={editSection}
        onSectionChange={fetchSections}
      />

      <UploadMaterialDialog
        open={uploadMaterialDialogOpen}
        onOpenChange={setUploadMaterialDialogOpen}
        sectionId={selectedSectionId}
        onMaterialUploaded={fetchSections}
      />
    </div>
  );
};

// Section Dialog - Create/Edit Section
const SectionDialog = ({
  open,
  onOpenChange,
  courseId,
  section,
  onSectionChange
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  section: any | null;
  onSectionChange: () => void;
}) => {
  const { token } = useUserContext();
  const [name, setName] = useState('');
  const [schedules, setSchedules] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedHour, setSelectedHour] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!section;

  // Reset form when dialog opens/closes or section changes
  useEffect(() => {
    if (open && section) {
      setName(section.name);
      setSchedules(section.schedules);
    } else if (open) {
      setName('');
      setSchedules([]);
    }

    // 每次对话框打开时重置日期和时间选择
    if (open) {
      setSelectedDate('');
      setSelectedHour('');
    }
  }, [open, section]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      const sectionId = section?.section_id || crypto.randomUUID();

      formData.append('section_id', sectionId);
      formData.append('course_id', courseId);
      formData.append('name', name);
      schedules.forEach(schedule => {
        formData.append('schedules', schedule);
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/section`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to save section');
      }

      toast.success(`Section ${isEditMode ? 'updated' : 'created'} successfully`);
      onOpenChange(false);
      onSectionChange();
    } catch (error) {
      console.error('Error saving section:', error);
      toast.error(`Failed to ${isEditMode ? 'update' : 'create'} section`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddSchedule = () => {
    if (selectedDate && selectedHour) {
      // 将选择的日期和小时组合成"年-月-日-小时"格式
      const [year, month, day] = selectedDate.split('-');
      const formattedSchedule = `${year}-${month}-${day}-${selectedHour}`;

      if (!schedules.includes(formattedSchedule)) {
        setSchedules([...schedules, formattedSchedule]);
        // 清空选择
        setSelectedDate('');
        setSelectedHour('');
      }
    }
  };

  const handleRemoveSchedule = (scheduleToRemove: string) => {
    setSchedules(schedules.filter(s => s !== scheduleToRemove));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Section' : 'Create New Section'}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update the section details and schedule.'
              : 'Add a new section to your course with schedule information.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Section Name
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Monday Morning Section"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Schedule
            </label>
            <div className="flex flex-col space-y-3">
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs font-medium mb-1 block">Date</label>
                  <Input
                    type="date"
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                    }}
                    value={selectedDate}
                    className="w-full"
                  />
                </div>
                <div className="w-1/3">
                  <label className="text-xs font-medium mb-1 block">Hour (24h)</label>
                  <select
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    onChange={(e) => {
                      setSelectedHour(e.target.value);
                    }}
                    value={selectedHour}
                  >
                    <option value="">Select</option>
                    {Array.from({ length: 24 }, (_, i) => i).map(hour => (
                      <option key={hour} value={hour}>
                        {hour.toString().padStart(2, '0')}:00
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <Button
                type="button"
                onClick={handleAddSchedule}
                disabled={!selectedDate || !selectedHour}
                className="self-end"
              >
                Add Schedule
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Select the date and time for each class meeting
            </p>

            {schedules.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-sm font-medium">Scheduled Meetings:</p>
                <div className="flex flex-wrap gap-2">
                  {schedules.map((schedule, index) => {
                    const [year, month, day, hour] = schedule.split('-');
                    return (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="pl-2 pr-1 py-1.5 flex items-center gap-1"
                      >
                        {`${month}/${day}/${year} ${hour}:00`}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 rounded-full ml-1"
                          onClick={() => handleRemoveSchedule(schedule)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !name || schedules.length === 0}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditMode ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                isEditMode ? 'Update Section' : 'Create Section'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Upload Material Dialog
const UploadMaterialDialog = ({
  open,
  onOpenChange,
  sectionId,
  onMaterialUploaded
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sectionId: string;
  onMaterialUploaded: () => void;
}) => {
  const { token } = useUserContext();
  const [materialName, setMaterialName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setMaterialName('');
      setFile(null);
    }
  }, [open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);

      // Auto-fill material name from file name if empty
      if (!materialName) {
        const fileName = selectedFile.name;
        // Remove .pdf extension if present
        setMaterialName(fileName.replace(/\.pdf$/i, ''));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      const formData = new FormData();
      const materialId = crypto.randomUUID();

      formData.append('material_name', materialName);
      formData.append('section_id', sectionId);

      if (file) {
        formData.append('data', file);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/material/${materialId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload material');
      }

      toast.success('Material uploaded successfully');
      onOpenChange(false);
      onMaterialUploaded();
    } catch (error) {
      console.error('Error uploading material:', error);
      toast.error('Failed to upload material');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload Course Material</DialogTitle>
          <DialogDescription>
            Add PDF materials to this section for students to access.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label htmlFor="material-name" className="text-sm font-medium">
              Material Name
            </label>
            <Input
              id="material-name"
              value={materialName}
              onChange={(e) => setMaterialName(e.target.value)}
              placeholder="e.g., Lecture 1 Slides"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              PDF File
            </label>
            <div
              className="border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
                required
              />

              {file ? (
                <div className="space-y-2">
                  <BookOpen className="mx-auto h-8 w-8 text-primary" />
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                  >
                    Change File
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <FilePlus className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="text-sm font-medium">Click to upload a PDF file</p>
                  <p className="text-xs text-muted-foreground">
                    PDF files only
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isUploading || !materialName || !file}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Upload Material'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
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
        return <SectionsTab courseId={selectedCourse.course_id} />;
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