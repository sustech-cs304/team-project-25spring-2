import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  ChevronRight,
  Presentation,
  FileText,
  ExternalLink,
  MoreHorizontal,
  Clock,
  ComponentIcon,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserContext } from '../UserEnvProvider';

interface Material {
  material_id: string;
  material_name: string;
}

interface Section {
  section_id: string;
  name: string;
  materials: Material[];
}

interface LectureData {
  sections: Section[];
}

interface LectureProps {
  courseId: string;
}

export default function Lecture({ courseId }: LectureProps) {
  const [data, setData] = useState<LectureData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [materialsOpen, setMaterialsOpen] = useState(false);
  const { setSidebarItems, sidebarItems } = useUserContext();
  const router = useRouter();

  useEffect(() => {
    const fetchSections = async () => {
      try {
        setLoading(true);
        const response = await fetch(process.env.NEXT_PUBLIC_API_URL + `/sections/${courseId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch sections data');
        }

        console.log(response);
        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error('Error fetching sections:', err);
        // Mock data for development
        setData({
          sections: [
            {
              section_id: "sec_001",
              name: "Introduction to Course Concepts",
              materials: [
                { material_id: "mat_001", material_name: "Course Overview Slides" },
                { material_id: "mat_002", material_name: "Basic Concepts PDF" }
              ]
            },
            {
              section_id: "sec_002",
              name: "Fundamental Principles",
              materials: [
                { material_id: "mat_003", material_name: "Core Principles Presentation" },
                { material_id: "mat_004", material_name: "Practice Problems" },
                { material_id: "mat_005", material_name: "Additional Reading Material" }
              ]
            },
            {
              section_id: "sec_003",
              name: "Advanced Topics",
              materials: [
                { material_id: "mat_006", material_name: "Advanced Concepts Slides" },
                { material_id: "mat_007", material_name: "Case Study Documentation" }
              ]
            },
            {
              section_id: "sec_004",
              name: "Special Topics & Guest Lectures",
              materials: [
                { material_id: "mat_008", material_name: "Guest Lecture Slides" },
                { material_id: "mat_009", material_name: "Supplemental Research Papers" }
              ]
            },
            {
              section_id: "sec_005",
              name: "Practical Applications",
              materials: [
                { material_id: "mat_010", material_name: "Lab Instructions" },
                { material_id: "mat_011", material_name: "Project Guidelines" }
              ]
            }
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchSections();
    }
  }, [courseId]);

  const handleOpenMaterials = (section: Section) => {
    setSelectedSection(section);
    setMaterialsOpen(true);
  };

  const handleMaterialClick = (sectionId: string, materialId: string, materialName: string) => {
    router.push(`/slides/${materialId}`);
    setMaterialsOpen(false);
    setSidebarItems([
      ...sidebarItems,
      {
        title: "Slides " + materialName,
        url: `/slides/${materialId}`,
        icon: ComponentIcon
      }
    ]);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  // Get current date for comparison
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });

  if (loading) {
    return (
      <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-72" />
        </div>

        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-40 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full p-8">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="text-destructive mb-4">
              <FileText size={48} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Failed to load lectures</h3>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data || data.sections.length === 0) {
    return (
      <div className="flex justify-center items-center h-full p-8">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="text-muted-foreground mb-4">
              <Presentation size={48} />
            </div>
            <h3 className="text-xl font-semibold mb-2">No lectures available</h3>
            <p className="text-muted-foreground">There are no lecture sections available for this course yet.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <motion.div
        className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto space-y-6"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-full">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Course Sections</h2>
          </div>
          <div className="bg-muted/50 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <Clock size={12} />
            <span>{formattedDate}</span>
          </div>
        </div>

        <div className="h-[calc(100vh-250px)] overflow-hidden">
          <div className="flex flex-col gap-4 pb-6 pr-1 overflow-y-auto h-full p-1">
            <AnimatePresence>
              {data.sections.map((section, index) => (
                <motion.div
                  key={section.section_id}
                  variants={item}
                  custom={index}
                  whileHover={{ scale: 1.01 }}
                  className="p-1.5" // Padding to contain the hover scale effect
                  transition={{ duration: 0.15 }}
                >
                  <Card className="overflow-hidden border shadow-sm hover:shadow-md transition-all duration-200 hover:border-primary/50 relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/60 to-primary/20"></div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xl font-semibold flex items-center">
                        <Presentation className="h-5 w-5 mr-2 text-primary" />
                        {section.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        This section contains {section.materials.length} {section.materials.length === 1 ? 'learning material' : 'learning materials'}.
                      </p>
                    </CardContent>
                    <CardFooter className="bg-muted/20 pt-2 border-t flex justify-between">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <FileText size={12} className="mr-1" />
                        <span>Section {index + 1}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenMaterials(section)}
                        className="flex items-center gap-1 hover:gap-2 transition-all hover:text-primary"
                      >
                        <span>View Materials</span>
                        <ChevronRight size={16} />
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      <Dialog open={materialsOpen} onOpenChange={setMaterialsOpen}>
        <DialogContent className=" shadow-lg">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <div className="p-2 bg-primary/10 rounded-full">
                <FileText size={18} className="text-primary" />
              </div>
              {selectedSection?.name} Materials
            </DialogTitle>
          </DialogHeader>

          <div className="max-h-[60vh] mt-4 overflow-hidden">
            <div className="space-y-3 px-1 overflow-y-auto max-h-[58vh] pr-2">
              <AnimatePresence>
                {selectedSection?.materials.map((material, index) => (
                  <motion.div
                    key={material.material_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{
                      duration: 0.3,
                      delay: index * 0.05,
                      ease: "easeOut"
                    }}
                    className="group"
                  >
                    <div
                      onClick={() => handleMaterialClick(selectedSection.section_id, material.material_id, material.material_name)}
                      className="flex items-center justify-between p-3 rounded-md cursor-pointer border hover:border-primary/50 hover:bg-muted/50 transition-all duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-full group-hover:bg-primary/20 transition-colors">
                          <FileText size={16} className="text-primary" />
                        </div>
                        <span className="font-medium group-hover:text-primary transition-colors">{material.material_name}</span>
                      </div>
                      <div className="transform transition-transform duration-200 group-hover:translate-x-1">
                        <ExternalLink size={16} className="text-muted-foreground group-hover:text-primary" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}