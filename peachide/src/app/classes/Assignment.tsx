import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  ChevronRight,
  AlertCircle,
  BookOpen,
  CodeXml,
  Users,
  User
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserContext } from '../UserEnvProvider';

interface Assignment {
  assignment_id: string;
  is_group_assign: boolean;
  name: string;
  course_id: string;
  teacher_id: string;
  deadline: string;
  isOver: boolean;
  description?: string;
}

interface AssignmentData {
  assignments: Assignment[];
}

interface AssignmentProps {
  courseId: string;
}

export default function Assignment({ courseId }: AssignmentProps) {
  const [data, setData] = useState<AssignmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setSidebarItems, sidebarItems } = useUserContext();
  const router = useRouter();
  const { token, myGroups } = useUserContext();

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        const response = await fetch(process.env.NEXT_PUBLIC_API_URL + `/assignments/${courseId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          if (response.status === 404) {
            setData({
              assignments: []
            });
            return;
          } else
            throw new Error('Failed to fetch assignments data');
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error('Error fetching assignments:', err);
        // Mock data for development
        setData({
          assignments: []
        });
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchAssignments();
    }
  }, [courseId]);

  const [envLoading, setEnvLoading] = useState(false);

  const handleStartAssignment = async (assignmentId: string) => {
    setError(null);
    setEnvLoading(true);
    var result: any;
    try {
      const formData = new FormData();
      formData.append('course_id', courseId);
      formData.append('assign_id', assignmentId);
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL + `/environment`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        method: 'POST',
        body: formData
      });
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      result = await response.json();
      if (result.message == "Require group" && !(courseId in myGroups)) {
        setError('You need to join a group to start this assignment.');
        setEnvLoading(false);
        return;
      }
    } catch (error) {
      console.error('Error starting assignment environment:', error);
      setError('Failed to start assignment environment. Please try again later.');
      setEnvLoading(false);
      return;
    }
    const environmentId = result.environment_id;
    router.push(`/coding/${environmentId}`);
    setSidebarItems([
      ...sidebarItems,
      {
        title: "Coding " + environmentId,
        url: `/coding/${environmentId}`,
        icon: "CodeXml"
      }
    ]);
    setEnvLoading(false);
  };

  // Loading popout overlay
  if (envLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <Card className="p-8 flex flex-col items-center gap-4 shadow-2xl">
          <div className="animate-spin mb-2">
            <svg className="h-10 w-10 text-primary" viewBox="0 0 24 24" fill="none">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold">Preparing your coding environment...</h3>
          <p className="text-muted-foreground text-center text-sm">This may take a few moments. Please wait.</p>
        </Card>
      </div>
    );
  }

  // Sort assignments: active ones by deadline (earliest first), then completed ones
  const sortedAssignments = data?.assignments
    ? [...data.assignments].sort((a, b) => {
      // First separate by isOver status
      if (a.isOver !== b.isOver) {
        return a.isOver ? 1 : -1; // Active/incomplete assignments first
      }

      // For incomplete assignments, prioritize by deadline
      if (!a.isOver) {
        const aDeadline = new Date(a.deadline);
        const bDeadline = new Date(b.deadline);
        const now = new Date();
        const aIsPastDeadline = aDeadline < now;
        const bIsPastDeadline = bDeadline < now;

        // If one is past deadline and the other isn't, prioritize upcoming deadlines
        if (aIsPastDeadline !== bIsPastDeadline) {
          return aIsPastDeadline ? 1 : -1; // Non-missed assignments first
        }
      }

      // Then sort by deadline
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    })
    : [];

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

  // Function to format deadline
  const formatDeadline = (deadlineStr: string) => {
    const deadline = new Date(deadlineStr);
    const now = new Date();

    // Format the date
    const formattedDate = deadline.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    // Format the time
    const formattedTime = deadline.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });

    // Calculate days remaining
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      date: formattedDate,
      time: formattedTime,
      daysRemaining: diffDays
    };
  };

  // Function to render deadline info with appropriate styling
  const renderDeadlineInfo = (deadline: string, isOver: boolean) => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const isPastDeadline = deadlineDate < now;
    const { date, time, daysRemaining } = formatDeadline(deadline);

    if (isOver) {
      return (
        <div className="flex items-center gap-2 text-muted-foreground">
          <CheckCircle size={16} className="text-green-500" />
          <span>Completed</span>
        </div>
      );
    }

    if (isPastDeadline) {
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-muted-foreground" />
            <span className="font-medium text-sm">{date} at {time}</span>
          </div>
          <Badge
            variant="destructive"
            className="flex items-center gap-1 text-xs bg-red-500 hover:bg-red-600"
          >
            <XCircle size={10} />
            <span>Missed</span>
          </Badge>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-primary" />
          <span className="font-medium text-sm">{date} at {time}</span>
        </div>
        <Badge
          variant={daysRemaining <= 0 ? "destructive" : daysRemaining < 3 ? "default" : daysRemaining < 7 ? "outline" : "secondary"}
          className={`flex items-center gap-1 text-xs ${daysRemaining <= 0 ? 'bg-red-500 hover:bg-red-600' : daysRemaining < 3 ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''}`}
        >
          <Clock size={10} />
          {daysRemaining <= 0
            ? 'Due today!'
            : daysRemaining === 1
              ? '1 day remaining'
              : `${daysRemaining} days remaining`}
        </Badge>
      </div>
    );
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
            <div className="text-destructive mb-4 w-full flex justify-center">
              <AlertCircle size={48} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Failed to load assignments</h3>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data || data.assignments.length === 0) {
    return (
      <div className="flex justify-center items-center h-full p-8">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="text-muted-foreground mb-4 w-full flex justify-center">
              <ClipboardList size={48} />
            </div>
            <h3 className="text-xl font-semibold mb-2">No assignments available</h3>
            <p className="text-muted-foreground">There are no assignments for this course yet.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-full">
            <ClipboardList className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Assignments</h2>
        </div>
        <div className="flex gap-2">
          {data.assignments.filter(a => {
            const deadlineDate = new Date(a.deadline);
            const now = new Date();
            return !a.isOver && deadlineDate >= now;
          }).length > 0 && (
              <Badge className="px-3 py-1 flex items-center gap-1">
                <Calendar size={12} />
                <span>{data.assignments.filter(a => {
                  const deadlineDate = new Date(a.deadline);
                  const now = new Date();
                  return !a.isOver && deadlineDate >= now;
                }).length} Active</span>
              </Badge>
            )}

          {data.assignments.filter(a => {
            const deadlineDate = new Date(a.deadline);
            const now = new Date();
            return !a.isOver && deadlineDate < now;
          }).length > 0 && (
              <Badge variant="destructive" className="px-3 py-1 flex items-center gap-1">
                <XCircle size={12} />
                <span>{data.assignments.filter(a => {
                  const deadlineDate = new Date(a.deadline);
                  const now = new Date();
                  return !a.isOver && deadlineDate < now;
                }).length} Missed</span>
              </Badge>
            )}

          {data.assignments.filter(a => a.isOver).length > 0 && (
            <Badge variant="outline" className="px-3 py-1 flex items-center gap-1">
              <CheckCircle size={12} />
              <span>{data.assignments.filter(a => a.isOver).length} Completed</span>
            </Badge>
          )}
        </div>
      </div>

      <div className="h-[calc(100vh-250px)] overflow-hidden">
        <div className="flex flex-col gap-4 pb-6 pr-1 overflow-y-auto h-full p-1">
          <AnimatePresence>
            {sortedAssignments.map((assignment, index) => {
              const isActive = !assignment.isOver;
              const deadlineDate = new Date(assignment.deadline);
              const now = new Date();
              const isMissed = isActive && deadlineDate < now;

              return (
                <motion.div
                  key={assignment.assignment_id}
                  variants={item}
                  custom={index}
                  whileHover={{ scale: 1.01 }}
                  className="p-1.5" // Padding to contain the hover scale effect
                  transition={{ duration: 0.15 }}
                >
                  <Card className={`overflow-hidden border shadow-sm hover:shadow-md transition-all duration-200 ${isActive ? 'hover:border-primary/50' : 'opacity-80'
                    } relative`}>
                    {isActive && !isMissed && (
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/60 to-primary/20"></div>
                    )}
                    {isMissed && (
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500/60 to-red-500/20"></div>
                    )}
                    {!isActive && (
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-muted-foreground/30 to-muted-foreground/10"></div>
                    )}
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className={`text-xl font-semibold flex items-center ${!isActive ? 'text-muted-foreground' : ''}`}>
                          <BookOpen className="h-5 w-5 mr-2 text-primary" />
                          {assignment.name}
                        </CardTitle>
                        <div className="flex gap-2 ml-4">
                          {assignment.is_group_assign && (
                            <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                              <Users size={10} />
                              Group
                            </Badge>
                          )}
                          {!assignment.is_group_assign && (
                            <Badge variant="outline" className="flex items-center gap-1 text-xs">
                              <User size={10} />
                              Individual
                            </Badge>
                          )}
                          {assignment.isOver && (
                            <Badge variant="outline" className="text-xs">
                              Completed
                            </Badge>
                          )}
                          {isMissed && (
                            <Badge variant="destructive" className="text-xs">
                              Missed
                            </Badge>
                          )}
                        </div>
                      </div>
                      {assignment.description && (
                        <p className={`text-sm mt-2 ${!isActive ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                          {assignment.description}
                        </p>
                      )}
                    </CardHeader>
                    <CardContent className="pb-4">
                      {renderDeadlineInfo(assignment.deadline, assignment.isOver)}
                    </CardContent>
                    <CardFooter className="bg-muted/20 pt-2 border-t flex justify-between">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock size={12} className="mr-1" />
                        <span>Assignment {index + 1}</span>
                      </div>
                      {isActive ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStartAssignment(assignment.assignment_id)}
                          className="flex items-center gap-1 hover:gap-2 transition-all hover:text-primary"
                        >
                          <span>Start Assignment</span>
                          <ChevronRight size={16} />
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStartAssignment(assignment.assignment_id)}
                          className="text-muted-foreground"
                        >
                          <span>View Details</span>
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}