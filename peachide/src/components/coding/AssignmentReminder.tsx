import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ArrowLeft, AlertCircle, Clock, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AssignmentReminderProps {
  environmentId: string;
}

export default function AssignmentReminder({ environmentId }: AssignmentReminderProps) {
  const router = useRouter();

  const handleBackToAssignments = () => {
    // Navigate back to the classes page where assignments are shown
    router.push('/classes');
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-base font-medium text-gray-900 dark:text-gray-100">
                Assignment Requirements
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Check the assignment page for details and guidelines
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <FileText className="h-4 w-4 text-blue-500" />
              <span>Description & requirements</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <Clock className="h-4 w-4 text-blue-500" />
              <span>Deadline & guidelines</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <BookOpen className="h-4 w-4 text-blue-500" />
              <span>Materials & resources</span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleBackToAssignments}
            className="w-full sm:w-auto border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/30"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            View Assignment Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
