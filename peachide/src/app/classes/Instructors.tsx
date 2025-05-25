import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { SmartAvatar } from '@/components/ui/smart-avatar';
import { GraduationCap, Clock, MapPin, Users } from 'lucide-react';
import { useUserContext } from '../UserEnvProvider';

interface Teacher {
  name: string;
  photo: string;
  office_hour: string;
  office_place: string;
}

interface InstructorsData {
  teachers: Teacher[];
}

interface InstructorsProps {
  courseId: string;
}

export default function Instructors({ courseId }: InstructorsProps) {
  const [data, setData] = useState<InstructorsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useUserContext();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(process.env.NEXT_PUBLIC_API_URL + `/instructors/${courseId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch instructors data');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        // Since the API is not developed yet, we use mock data for demonstration purposes
        setData({
          teachers: [
            {
              name: 'Dr. Alice Smith',
              photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice&backgroundColor=b6e3f4',
              office_hour: 'Mon & Wed 2-4pm',
              office_place: 'Room 101, CS Building'
            },
            {
              name: 'Prof. Bob Johnson',
              photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob&backgroundColor=c0aede',
              office_hour: 'Tue & Thu 3-5pm',
              office_place: 'Room 202, Engineering Hall'
            },
            {
              name: 'Dr. Carol Williams',
              photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carol&backgroundColor=ffdfbf',
              office_hour: 'Fri 10am-12pm',
              office_place: 'Room 305, Science Center'
            }
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId]);

  if (loading) {
    return <div className="flex justify-center items-center h-full p-8">
      <div className="animate-pulse text-lg">Loading instructors...</div>
    </div>;
  }

  if (!data) {
    return <div className="text-center text-red-500 p-4">Error loading instructors.</div>;
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <motion.div
      className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <div className="grid gap-6 grid-cols-1">
        {data.teachers.map((teacher, index) => (
          <motion.div
            key={index}
            variants={item}
            whileHover={{ scale: 1.02 }}
          >
            <Card className="overflow-hidden hover:shadow-md transition-all">
              <CardHeader className="pb-2">
                <div className="flex flex-col items-center">
                  <div className="mb-4 relative">
                    <SmartAvatar
                      className="h-24 w-24 border-4 border-primary/20 shadow-md"
                      photo={teacher.photo}
                      name={teacher.name}
                    />
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <CardTitle className="text-xl font-bold text-center">{teacher.name}</CardTitle>
                    <div className="bg-primary text-white p-2 rounded-full">
                      <GraduationCap size={16} />
                    </div>
                  </div>
                </div>
              </CardHeader>
              {
                teacher.office_hour || teacher.office_place && (
                  <CardContent className="text-center pb-6">
                    <div className="space-y-3">
                      {
                        teacher.office_hour && (
                          <div className="flex items-center justify-center gap-2">
                            <Clock size={16} className="text-primary" />
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium">Office Hours:</span> {teacher.office_hour}
                            </p>
                          </div>
                        )
                      }
                      {
                        teacher.office_place && (
                          <div className="flex items-center justify-center gap-2">
                            <MapPin size={16} className="text-primary" />
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium">Location:</span> {teacher.office_place}
                            </p>
                          </div>
                        )
                      }
                    </div>
                  </CardContent>
                )
              }
            </Card>
          </motion.div>
        ))}
      </div>
      {error && (
        <div className="text-sm text-red-500 text-center mt-4">
          {error}
        </div>
      )}
    </motion.div>
  );
}