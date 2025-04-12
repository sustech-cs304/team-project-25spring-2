import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  ChevronRight,
  Presentation,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

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
  const router = useRouter();

  useEffect(() => {
    const fetchSections = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/classes/${courseId}/sections`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch sections data');
        }
        
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

  const handleMaterialClick = (sectionId: string, materialId: string) => {
    router.push(`/slides/${sectionId}/${materialId}`);
    setMaterialsOpen(false);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

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
        <div className="flex items-center gap-2 mb-6">
          <BookOpen className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Course Sections</h2>
        </div>

        <div className="h-[calc(100vh-250px)] overflow-y-auto pr-2">
          <div className="grid gap-6 pb-6">
            {data.sections.map((section) => (
              <motion.div
                key={section.section_id}
                variants={item}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="overflow-hidden border hover:shadow-md transition-all duration-200 hover:border-primary/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl font-semibold flex items-center">
                      <Presentation className="h-5 w-5 mr-2 text-primary" />
                      {section.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      This section contains {section.materials.length} learning materials.
                    </p>
                  </CardContent>
                  <CardFooter className="bg-muted/20 pt-2 border-t">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleOpenMaterials(section)}
                      className="ml-auto flex items-center gap-1 hover:gap-2 transition-all"
                    >
                      <span>View Materials</span>
                      <ChevronRight size={16} />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      <Dialog open={materialsOpen} onOpenChange={setMaterialsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText size={18} className="text-primary" />
              {selectedSection?.name} Materials
            </DialogTitle>
          </DialogHeader>
          
          <div className="max-h-[60vh] mt-4 overflow-y-auto">
            <div className="space-y-2 px-1">
              {selectedSection?.materials.map((material) => (
                <motion.div
                  key={material.material_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(0,0,0,0.03)' }}
                  transition={{ duration: 0.2 }}
                  onClick={() => handleMaterialClick(selectedSection.section_id, material.material_id)}
                  className="flex items-center justify-between p-3 rounded-md cursor-pointer border hover:border-primary/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <FileText size={16} className="text-primary" />
                    </div>
                    <span className="font-medium">{material.material_name}</span>
                  </div>
                  <ExternalLink size={16} className="text-muted-foreground" />
                </motion.div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}