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
  FilePlus, EditIcon,
  MousePointer,
  ComponentIcon,
  Calendar,
  Trash2,
  Edit3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Course } from "./page";
import { useRouter } from 'next/navigation';
import { Skeleton } from "@/components/ui/skeleton";
import { useUserContext } from "../UserEnvProvider";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { SmartAvatar } from "@/components/ui/smart-avatar";
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
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <div className="flex items-center p-3 rounded-md border bg-background hover:shadow-sm transition-all">
        <div className="flex items-center space-x-3">
          <SmartAvatar name={student.name} photo={student.photo} className="h-8 w-8" />
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
              <SmartAvatar
                name={teacher.name}
                photo={teacher.photo}
                className="w-24 h-24 border-4 border-primary/20 shadow-md"
                fallbackClassName="text-2xl"
              />
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
  const [isNoTerm, setIsNoTerm] = useState(false);
  const { token } = useUserContext();

  // Debounced search function
  const debouncedSearch = useRef(
    debounce(async (term: string) => {
      if (!term || term.length < 2) {
        setSearchResults([]);
        setIsSearching(false);
        setIsNoTerm(true);
        return;
      }

      try {
        const response = await fetch(process.env.NEXT_PUBLIC_API_URL + `/search_user/${term}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          },
        });

        if (!response.ok) {
          throw new Error('Search failed');
        }

        const data = await response.json();
        setSearchResults(data.user || []);
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
              title="Search by name..."
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
                    <SmartAvatar name={user.name} />
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

          {isNoTerm ? (
            <div className="text-center py-4 text-muted-foreground">
              Please enter a search term (at least 2 characters).
            </div>
          ) : searchTerm && !isSearching && searchResults.length === 0 && (
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


// Format schedule for display
const formatSchedule = (schedule: string) => {
  // 2024-05-06 14:10:00
  const [year, month, day] = schedule.split(' ')[0].split('-');
  const [hour, minute, second] = schedule.split(' ')[1].split(':');
  return `${month}/${day}/${year} ${hour}:${minute}`;
};

// Sections Tab Content (placeholder)
const SectionsTab = ({ courseId }: { courseId: string }) => {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editSection, setEditSection] = useState<Section | null>(null);
  const [uploadMaterialDialogOpen, setUploadMaterialDialogOpen] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');
  const { token, sidebarItems, setSidebarItems } = useUserContext();
  const router = useRouter();

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
          schedules: ['2024-05-06 14:10:00', '2024-05-13 14:10:00', '2024-05-20 14:10:00'],
          materials: [
            { material_id: 'mat1', material_name: 'Lecture 1.pdf' },
            { material_id: 'mat2', material_name: 'Exercise Sheet 1.pdf' }
          ]
        },
        {
          section_id: 'section2',
          name: 'Thursday Section',
          schedules: ['2024-05-09 10:10:00', '2024-05-16 10:10:00', '2024-05-23 10:10:00'],
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

  const goToMaterial = (materialId: string, materialName: string) => {
    router.push(`/slides/${materialId}`);
    setSidebarItems([
      ...sidebarItems,
      {
        title: "Slides " + materialName,
        url: `/slides/${materialId}`,
        icon: "ComponentIcon"
      }
    ]);
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
                    <div className="flex flex-wrap gap-2">
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
                            onClick={() => goToMaterial(material.material_id, material.material_name)}
                          >
                            <MousePointer className="h-4 w-4" />
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
  const [selectedMinute, setSelectedMinute] = useState('');
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
      setSelectedMinute('');
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
    if (selectedDate && selectedHour && selectedMinute) {
      // 将选择的日期、小时和分钟组合成"年-月-日 小时:分钟:00"格式
      const [year, month, day] = selectedDate.split('-');
      const formattedSchedule = `${year}-${month}-${day} ${selectedHour.padStart(2, '0')}:${selectedMinute.padStart(2, '0')}:00`;

      if (!schedules.includes(formattedSchedule)) {
        setSchedules([...schedules, formattedSchedule]);
        // 清空选择
        setSelectedDate('');
        setSelectedHour('');
        setSelectedMinute('');
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
              title="Section Name"
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
                    title="Select date"
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
                    title="Select hour"
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    onChange={(e) => {
                      setSelectedHour(e.target.value);
                    }}
                    value={selectedHour}
                  >
                    <option value="">Select</option>
                    {Array.from({ length: 24 }, (_, i) => i).map(hour => (
                      <option key={hour} value={hour.toString().padStart(2, '0')}>
                        {hour.toString().padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-1/3">
                  <label className="text-xs font-medium mb-1 block">Minute</label>
                  <select
                    title="Select minute"
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    onChange={(e) => {
                      setSelectedMinute(e.target.value);
                    }}
                    value={selectedMinute}
                  >
                    <option value="">Select</option>
                    {Array.from({ length: 60 }, (_, i) => i).map(minute => (
                      <option key={minute} value={minute.toString().padStart(2, '0')}>
                        {minute.toString().padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <Button
                type="button"
                onClick={handleAddSchedule}
                disabled={!selectedDate || !selectedHour || !selectedMinute}
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
                    return (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="pl-2 pr-1 py-1.5 flex items-center gap-1"
                      >
                        {formatSchedule(schedule)}
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
  const [fileSize, setFileSize] = useState<number | null>(null);
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

      const fileName = selectedFile.name;
      console.log(fileName);
      setMaterialName(fileName);

      const fileSize = selectedFile.size;
      setFileSize(fileSize);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!materialName || !file) {
      toast.error('Please enter a material name and select a file to upload.');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      const materialId = crypto.randomUUID();

      formData.append('material_name', materialName);
      formData.append('section_id', sectionId);
      formData.append('file', file);

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
              title="Material Name"
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
                title="Upload PDF file"
                onChange={handleFileChange}
                required
              />

              {file ? (
                <div className="space-y-2">
                  <BookOpen className="mx-auto h-8 w-8 text-primary" />
                  <p className="text-sm font-medium">{materialName}</p>
                  <p className="text-xs text-muted-foreground">
                    {fileSize ? (fileSize / 1024 / 1024).toFixed(2) : '0.00'} MB
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

// Assignment interface
interface Assignment {
  assignment_id: string;
  is_group_assign: boolean;
  name: string;
  course_id: string;
  teacher_id: string;
  deadline: string; // "2025-05-07 10:00:00"
  is_over: boolean;
  description?: string;
}

// Uploaded file interface for assignment creation
interface UploadedFile {
  file_id: string;
  file_name: string;
  file_path: string;
  original_file: File;
}

// Assignment Card Component
const AssignmentCard = ({
  assignment,
  onEdit,
  onDelete
}: {
  assignment: Assignment;
  onEdit: (assignment: Assignment) => void;
  onDelete: (assignmentId: string) => void;
}) => {
  const formatDeadline = (deadline: string) => {
    try {
      const date = new Date(deadline);
      return {
        date: date.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
        time: date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
      };
    } catch {
      return { date: deadline, time: '' };
    }
  };

  const isOverdue = () => {
    try {
      return new Date(assignment.deadline) < new Date();
    } catch {
      return false;
    }
  };

  const getTimeRemaining = () => {
    try {
      const now = new Date();
      const deadline = new Date(assignment.deadline);
      const diff = deadline.getTime() - now.getTime();

      if (diff < 0) return null; // Past deadline

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

      if (days > 0) return `${days} day${days > 1 ? 's' : ''} remaining`;
      if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} remaining`;
      return 'Due soon';
    } catch {
      return null;
    }
  };

  const deadlineInfo = formatDeadline(assignment.deadline);
  const timeRemaining = getTimeRemaining();
  const overdue = isOverdue();
  const statusColor = assignment.is_over ? 'outline' : overdue ? 'destructive' : 'default';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
        <CardHeader className="pb-4 bg-gradient-to-r from-background to-muted/20">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="bg-primary/15 p-2 rounded-lg">
                  <ClipboardList size={20} className="text-primary" />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    variant={assignment.is_group_assign ? "default" : "secondary"}
                    className="text-xs font-medium"
                  >
                    {assignment.is_group_assign ? "Group Assignment" : "Individual"}
                  </Badge>
                  <Badge variant={statusColor} className="text-xs font-medium">
                    {assignment.is_over ? "Closed" : overdue ? "Overdue" : "Active"}
                  </Badge>
                </div>
              </div>
              <CardTitle className="text-xl font-bold line-clamp-2 leading-tight">
                {assignment.name}
              </CardTitle>
            </div>

            {/* Action buttons - only show for non-closed assignments */}
            {!assignment.is_over && (
              <div className="flex items-center gap-1 ml-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-primary"
                  onClick={() => onEdit(assignment)}
                  title="Edit assignment"
                >
                  <Edit3 size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => onDelete(assignment.assignment_id)}
                  title="Delete assignment"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Deadline Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={16} className={overdue ? "text-destructive" : "text-primary"} />
                <span className="text-sm font-medium">Deadline</span>
              </div>
              {timeRemaining && (
                <Badge variant="outline" className="text-xs">
                  {timeRemaining}
                </Badge>
              )}
            </div>
            <div className="ml-6">
              <p className={`text-sm font-medium ${overdue ? 'text-destructive' : 'text-foreground'}`}>
                {deadlineInfo.date}
              </p>
              {deadlineInfo.time && (
                <p className="text-xs text-muted-foreground">
                  {deadlineInfo.time}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          {assignment.description && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Description</p>
              <p className="text-sm text-muted-foreground line-clamp-4 leading-relaxed">
                {assignment.description}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Create Assignment Dialog
const CreateAssignmentDialog = ({
  open,
  onOpenChange,
  courseId,
  onAssignmentCreated
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string;
  onAssignmentCreated: () => void;
}) => {
  const { token, userData } = useUserContext();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isGroupAssign, setIsGroupAssign] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedHour, setSelectedHour] = useState('');
  const [selectedMinute, setSelectedMinute] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setName('');
      setDescription('');
      setIsGroupAssign(false);
      setSelectedDate('');
      setSelectedHour('');
      setSelectedMinute('');
      setUploadedFiles([]);
      setShowConfirmDialog(false);
    }
  }, [open]);

  // Helper function to check if selected deadline is in the past
  const isDeadlineInPast = () => {
    if (!selectedDate || !selectedHour || !selectedMinute) return false;
    const deadline = `${selectedDate} ${selectedHour.padStart(2, '0')}:${selectedMinute.padStart(2, '0')}:00`;
    const deadlineDate = new Date(deadline);
    const now = new Date();
    return deadlineDate <= now;
  };

  const handleFileUpload = async (file: File, filePath: string) => {
    setIsUploading(true);
    try {
      // Ensure the path starts with "/" for display purposes
      const displayPath = filePath.startsWith('/') ? filePath : `/${filePath}`;

      const formData = new FormData();
      formData.append('file_path', displayPath);
      formData.append('file_name', file.name);
      formData.append('file', file);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/file`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const data = await response.json();
      const newFile: UploadedFile = {
        file_id: data.file_id,
        file_name: file.name,
        file_path: displayPath,
        original_file: file
      };

      setUploadedFiles(prev => [...prev, newFile]);
      toast.success(`File "${file.name}" uploaded successfully`);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error(`Failed to upload file "${file.name}"`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/file/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete file');
      }

      setUploadedFiles(prev => prev.filter(f => f.file_id !== fileId));
      toast.success('File deleted successfully');
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    }
  };

  const handleCreateAssignment = async () => {
    if (!name || !selectedDate || !selectedHour || !selectedMinute) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Check if deadline is in the past
    const deadline = `${selectedDate} ${selectedHour.padStart(2, '0')}:${selectedMinute.padStart(2, '0')}:00`;
    const deadlineDate = new Date(deadline);
    const now = new Date();

    if (deadlineDate <= now) {
      toast.error('Deadline cannot be in the past. Please select a future date and time.');
      return;
    }

    setIsCreating(true);
    try {

      const formData = new FormData();
      formData.append('name', name);
      formData.append('deadline', deadline);
      formData.append('description', description);
      formData.append('is_group_assign', isGroupAssign.toString());
      formData.append('course_id', courseId);
      formData.append('teacher_id', userData?.user_id || '');

      // Add file IDs
      uploadedFiles.forEach(file => {
        formData.append('files', file.file_id);
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/assignment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to create assignment');
      }

      toast.success('Assignment created successfully');
      onOpenChange(false);
      onAssignmentCreated();
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast.error('Failed to create assignment');
    } finally {
      setIsCreating(false);
      setShowConfirmDialog(false);
    }
  };

  const FileUploadArea = () => {
    const [filePath, setFilePath] = useState('');
    const [showPathInput, setShowPathInput] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [pathError, setPathError] = useState('');

    return (
      <div className="space-y-4">
        {/* File Upload Section */}
        <div className="space-y-3">
          <div
            className={`border-2 border-dashed rounded-md p-6 text-center transition-colors ${selectedFile && showPathInput
              ? 'border-primary/50 bg-primary/5'
              : 'cursor-pointer hover:bg-muted/50'
              }`}
            onClick={selectedFile && showPathInput ? undefined : () => fileInputRef.current?.click()}
          >
            <input
              title="Choose file"
              type="file"
              className="hidden"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setSelectedFile(e.target.files[0]);
                  setShowPathInput(true);
                }
              }}
            />

            {selectedFile && showPathInput ? (
              <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-center gap-2">
                  <FilePlus className="h-8 w-8 text-primary" />
                  <div className="text-left">
                    <p className="text-sm font-medium">Selected: {selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>

                <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
                  <div className="space-y-3">
                    <label className="text-sm font-medium">File Path</label>
                    <div className="flex items-center max-w-md mx-auto">
                      <div className="flex items-center justify-center w-8 h-11 bg-muted border border-r-0 rounded-l-md">
                        <span className="text-sm font-medium text-muted-foreground">/</span>
                      </div>
                      <Input
                        value={filePath}
                        onChange={(e) => {
                          setFilePath(e.target.value);
                          setPathError('');
                        }}
                        placeholder="assignments/homework1"
                        className="rounded-l-none flex-1"
                        onClick={(e) => e.stopPropagation()}
                        onFocus={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="text-center max-w-md mx-auto space-y-1">
                      <p className="text-xs text-muted-foreground">
                        📁 Enter the directory path where this file should be stored
                      </p>
                      <p className="text-xs text-muted-foreground">
                        💡 Leave empty to upload to root directory (<code className="bg-muted px-1 rounded">/</code>)
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ✨ Examples: <code className="bg-muted px-1 rounded">assignments/hw1</code>, <code className="bg-muted px-1 rounded">materials/lectures</code>
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-center">
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (selectedFile) {
                          const finalPath = filePath.trim() || '/';
                          handleFileUpload(selectedFile, finalPath);
                          setSelectedFile(null);
                          setFilePath('');
                          setShowPathInput(false);
                          setPathError('');
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        } else {
                          toast.error('Please select a file first');
                        }
                      }}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        'Upload File'
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                        setFilePath('');
                        setShowPathInput(false);
                        setPathError('');
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                    >
                      Choose Different File
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <FilePlus className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">Click to upload files</p>
                <p className="text-xs text-muted-foreground">
                  Upload assignment files, templates, or resources
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Uploaded Files Section */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Uploaded Files ({uploadedFiles.length})</h4>
              <Badge variant="secondary" className="text-xs">
                Ready for assignment
              </Badge>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-3 bg-muted/10">
              {uploadedFiles.map((file, index) => (
                <motion.div
                  key={file.file_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center justify-between p-3 border rounded-md bg-background hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <FilePlus className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{file.file_name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs px-1 py-0">
                          Path: {file.file_path}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          File #{index + 1}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="flex-shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDeleteFile(file.file_id)}
                    title="Remove file"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground p-2 bg-muted/20 rounded">
              <span>These files will be attached to the assignment</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => fileInputRef.current?.click()}
                className="h-6 text-xs"
              >
                + Add More Files
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Assignment</DialogTitle>
            <DialogDescription>
              Create a new assignment for your course. Upload files and set deadlines.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <label htmlFor="assignment-name" className="text-sm font-medium">
                Assignment Name *
              </label>
              <Input
                id="assignment-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Homework 1: Basic Algorithms"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the assignment objectives and requirements..."
                rows={3}
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Assignment Type</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Individual Assignment */}
                <div
                  className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${!isGroupAssign
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border hover:border-primary/50'
                    }`}
                  onClick={() => setIsGroupAssign(false)}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center ${!isGroupAssign ? 'border-primary bg-primary' : 'border-muted-foreground'
                      }`}>
                      {!isGroupAssign && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <h4 className="font-medium text-sm">Individual Assignment</h4>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Each student submits their own work
                      </p>
                    </div>
                  </div>
                </div>

                {/* Group Assignment */}
                <div
                  className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${isGroupAssign
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border hover:border-primary/50'
                    }`}
                  onClick={() => setIsGroupAssign(true)}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center ${isGroupAssign ? 'border-primary bg-primary' : 'border-muted-foreground'
                      }`}>
                      {isGroupAssign && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <h4 className="font-medium text-sm">Group Assignment</h4>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Students collaborate in teams
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Deadline *</label>
              <div className="grid grid-cols-3 gap-3">
                {/* Date Picker */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Date</label>
                  <div className="relative">
                    <Input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      required
                      className="h-11 pr-10 focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                {/* Hour Picker */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Hour</label>
                  <select
                    title="Select hour"
                    className="w-full h-11 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all hover:border-primary/50"
                    value={selectedHour}
                    onChange={(e) => setSelectedHour(e.target.value)}
                  >
                    <option value="" disabled>Hour</option>
                    {Array.from({ length: 24 }, (_, i) => i).map(hour => (
                      <option key={hour} value={hour.toString().padStart(2, '0')}>
                        {hour.toString().padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Minute Picker */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Minute</label>
                  <select
                    title="Select minute"
                    className="w-full h-11 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all hover:border-primary/50"
                    value={selectedMinute}
                    onChange={(e) => setSelectedMinute(e.target.value)}
                  >
                    <option value="" disabled>Min</option>
                    {[0, 15, 30, 45].map(minute => (
                      <option key={minute} value={minute.toString().padStart(2, '0')}>
                        {minute.toString().padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Preview of selected datetime */}
              {selectedDate && selectedHour && selectedMinute && (
                <div className={`mt-2 p-2 rounded-md border ${isDeadlineInPast()
                  ? 'bg-destructive/5 border-destructive/20'
                  : 'bg-primary/5 border-primary/20'
                  }`}>
                  <p className="text-xs text-muted-foreground">Selected deadline:</p>
                  <p className={`text-sm font-medium ${isDeadlineInPast() ? 'text-destructive' : 'text-primary'
                    }`}>
                    {new Date(`${selectedDate} ${selectedHour}:${selectedMinute}`).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })} at {selectedHour}:{selectedMinute}
                  </p>
                  {isDeadlineInPast() && (
                    <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                      <span>⚠️</span>
                      This deadline is in the past. Please select a future date and time.
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Assignment Files</label>
              <FileUploadArea />
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
                type="button"
                onClick={() => setShowConfirmDialog(true)}
                disabled={!name || !selectedDate || !selectedHour || !selectedMinute || isDeadlineInPast()}
              >
                Create Assignment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Confirm Assignment Creation</DialogTitle>
            <DialogDescription>
              After creation, only name, description, and deadline can be modified. Uploaded files cannot be changed. Are you sure you want to create this assignment?
            </DialogDescription>
          </DialogHeader>
          <div className="pt-4 flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateAssignment}
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Confirm Create'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Edit Assignment Dialog
const EditAssignmentDialog = ({
  open,
  onOpenChange,
  assignment,
  onAssignmentUpdated
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignment: Assignment | null;
  onAssignmentUpdated: () => void;
}) => {
  const { token } = useUserContext();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedHour, setSelectedHour] = useState('');
  const [selectedMinute, setSelectedMinute] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Initialize form when assignment changes
  useEffect(() => {
    if (assignment && open) {
      setName(assignment.name);
      setDescription(assignment.description || '');

      // Parse deadline
      const deadline = new Date(assignment.deadline);
      setSelectedDate(deadline.toISOString().split('T')[0]);
      setSelectedHour(deadline.getHours().toString().padStart(2, '0'));
      setSelectedMinute(deadline.getMinutes().toString().padStart(2, '0'));
    } else if (!open) {
      // Reset form when closing
      setName('');
      setDescription('');
      setSelectedDate('');
      setSelectedHour('');
      setSelectedMinute('');
    }
  }, [assignment, open]);

  // Helper function to check if selected deadline is in the past
  const isDeadlineInPast = () => {
    if (!selectedDate || !selectedHour || !selectedMinute) return false;
    const deadline = `${selectedDate} ${selectedHour.padStart(2, '0')}:${selectedMinute.padStart(2, '0')}:00`;
    const deadlineDate = new Date(deadline);
    const now = new Date();
    return deadlineDate <= now;
  };

  const handleUpdateAssignment = async () => {
    if (!assignment || !name || !selectedDate || !selectedHour || !selectedMinute) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Check if deadline is in the past
    const deadline = `${selectedDate} ${selectedHour.padStart(2, '0')}:${selectedMinute.padStart(2, '0')}:00`;
    const deadlineDate = new Date(deadline);
    const now = new Date();

    if (deadlineDate <= now) {
      toast.error('Deadline cannot be in the past. Please select a future date and time.');
      return;
    }

    setIsUpdating(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('deadline', deadline);
      formData.append('description', description);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/assignment/${assignment.assignment_id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to update assignment');
      }

      toast.success('Assignment updated successfully');
      onOpenChange(false);
      onAssignmentUpdated();
    } catch (error) {
      console.error('Error updating assignment:', error);
      toast.error('Failed to update assignment');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!assignment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Assignment</DialogTitle>
          <DialogDescription>
            Update assignment details. Files cannot be modified.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <label htmlFor="edit-assignment-name" className="text-sm font-medium">
              Assignment Name *
            </label>
            <Input
              id="edit-assignment-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Homework 1: Basic Algorithms"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="edit-description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the assignment objectives and requirements..."
              rows={3}
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">Deadline *</label>
            <div className="grid grid-cols-3 gap-3">
              {/* Date Picker */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Date</label>
                <div className="relative">
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    className="h-11 pr-10 focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {/* Hour Picker */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Hour</label>
                <select
                  title="Select hour"
                  className="w-full h-11 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all hover:border-primary/50"
                  value={selectedHour}
                  onChange={(e) => setSelectedHour(e.target.value)}
                >
                  <option value="" disabled>Hour</option>
                  {Array.from({ length: 24 }, (_, i) => i).map(hour => (
                    <option key={hour} value={hour.toString().padStart(2, '0')}>
                      {hour.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Minute Picker */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Minute</label>
                <select
                  title="Select minute"
                  className="w-full h-11 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all hover:border-primary/50"
                  value={selectedMinute}
                  onChange={(e) => setSelectedMinute(e.target.value)}
                >
                  <option value="" disabled>Min</option>
                  {[0, 15, 30, 45].map(minute => (
                    <option key={minute} value={minute.toString().padStart(2, '0')}>
                      {minute.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Preview of selected datetime */}
            {selectedDate && selectedHour && selectedMinute && (
              <div className={`mt-2 p-2 rounded-md border ${isDeadlineInPast()
                ? 'bg-destructive/5 border-destructive/20'
                : 'bg-primary/5 border-primary/20'
                }`}>
                <p className="text-xs text-muted-foreground">Updated deadline:</p>
                <p className={`text-sm font-medium ${isDeadlineInPast() ? 'text-destructive' : 'text-primary'
                  }`}>
                  {new Date(`${selectedDate} ${selectedHour}:${selectedMinute}`).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })} at {selectedHour}:{selectedMinute}
                </p>
                {isDeadlineInPast() && (
                  <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                    <span>⚠️</span>
                    This deadline is in the past. Please select a future date and time.
                  </p>
                )}
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
              type="button"
              onClick={handleUpdateAssignment}
              disabled={!name || !selectedDate || !selectedHour || !selectedMinute || isDeadlineInPast() || isUpdating}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Assignment'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Assignments Tab Content
const AssignmentsTab = ({ courseId }: { courseId: string }) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [deletingAssignmentId, setDeletingAssignmentId] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);
  const { token } = useUserContext();

  const fetchAssignments = async () => {
    if (!courseId) return;

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/assignments/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          setAssignments([]);
          return;
        }
        throw new Error('Failed to fetch assignments');
      }

      const data = await response.json();
      setAssignments(data.assignments || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      // Mock data for development
      setAssignments([
        {
          assignment_id: 'assign1',
          name: 'Homework 1: Basic Data Structures',
          course_id: courseId,
          teacher_id: 'teacher1',
          deadline: '2025-05-15 23:59:00',
          is_over: false,
          is_group_assign: false,
          description: 'Implement basic data structures including arrays, linked lists, and stacks.'
        },
        {
          assignment_id: 'assign2',
          name: 'Group Project: Web Application',
          course_id: courseId,
          teacher_id: 'teacher1',
          deadline: '2025-06-01 23:59:00',
          is_over: false,
          is_group_assign: true,
          description: 'Build a full-stack web application using React and Node.js.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [courseId, token]);

  // Handle edit assignment
  const handleEditAssignment = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setEditDialogOpen(true);
  };

  // Handle delete assignment - open confirmation dialog
  const handleDeleteAssignment = (assignmentId: string) => {
    const assignment = assignments.find(a => a.assignment_id === assignmentId);
    if (!assignment) return;

    // Check if assignment is already closed
    if (assignment.is_over) {
      toast.error('Cannot delete a closed assignment');
      return;
    }

    setDeletingAssignmentId(assignmentId);
    setDeleteDialogOpen(true);
  };

  // Confirm and execute deletion
  const confirmDeleteAssignment = async () => {
    if (!deletingAssignmentId) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/assignment/${deletingAssignmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete assignment');
      }

      toast.success('Assignment deleted successfully');
      setDeleteDialogOpen(false);
      setDeletingAssignmentId('');
      fetchAssignments(); // Refresh the list
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast.error('Failed to delete assignment');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Course Assignments</h2>
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const isAssignmentExpired = (assignment: Assignment) => {
    try {
      return new Date(assignment.deadline) < new Date() || assignment.is_over;
    } catch {
      return false;
    }
  };

  const activeAssignments = assignments.filter(a => !isAssignmentExpired(a));
  const expiredAssignments = assignments.filter(a => isAssignmentExpired(a));

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Course Assignments</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {activeAssignments.length} Active, {expiredAssignments.length} Completed
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} size="lg">
          <FilePlus className="mr-2 h-4 w-4" />
          Create Assignment
        </Button>
      </div>

      {assignments.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-lg bg-muted/10">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <ClipboardList className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-medium">No assignments created yet</h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
            Create your first assignment to start managing coursework and deadlines for your students.
          </p>
          <Button className="mt-6" onClick={() => setCreateDialogOpen(true)} size="lg">
            <FilePlus className="mr-2 h-4 w-4" />
            Create Your First Assignment
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Active Assignments Section */}
          {activeAssignments.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <h3 className="text-lg font-semibold">Active Assignments</h3>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                  {activeAssignments.length} {activeAssignments.length === 1 ? 'assignment' : 'assignments'}
                </Badge>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AnimatePresence>
                  {activeAssignments.map(assignment => (
                    <AssignmentCard
                      key={assignment.assignment_id}
                      assignment={assignment}
                      onEdit={handleEditAssignment}
                      onDelete={handleDeleteAssignment}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Expired/Completed Assignments Section */}
          {expiredAssignments.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <h3 className="text-lg font-semibold">Completed Assignments</h3>
                </div>
                <Badge variant="outline" className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                  {expiredAssignments.length} {expiredAssignments.length === 1 ? 'assignment' : 'assignments'}
                </Badge>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 opacity-75">
                <AnimatePresence>
                  {expiredAssignments.map(assignment => (
                    <AssignmentCard
                      key={assignment.assignment_id}
                      assignment={assignment}
                      onEdit={handleEditAssignment}
                      onDelete={handleDeleteAssignment}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Quick Action Section - Only show when no assignments exist */}
          {assignments.length === 0 && (
            <div className="mt-8 p-4 border rounded-lg bg-muted/20">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Need to create a new assignment?</h4>
                  <p className="text-sm text-muted-foreground">
                    Set deadlines, upload materials, and track student progress.
                  </p>
                </div>
                <Button onClick={() => setCreateDialogOpen(true)} variant="outline">
                  <FilePlus className="mr-2 h-4 w-4" />
                  New Assignment
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <CreateAssignmentDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        courseId={courseId}
        onAssignmentCreated={fetchAssignments}
      />

      <EditAssignmentDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        assignment={editingAssignment}
        onAssignmentUpdated={fetchAssignments}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Delete Assignment
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this assignment? This action cannot be undone and will permanently remove the assignment and all associated data.
            </DialogDescription>
          </DialogHeader>
          <div className="pt-4 flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeletingAssignmentId('');
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteAssignment}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Assignment
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
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
        return <AssignmentsTab courseId={selectedCourse.course_id} />;
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