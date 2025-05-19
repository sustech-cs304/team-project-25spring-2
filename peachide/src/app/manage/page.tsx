"use client";

import React, { useState } from "react";
import ManageLeftBar from "@/app/manage/ManageLeftBar";
import ManageRightBar from "@/app/manage/ManageRightBar";

// Course type definition based on API response
export interface Course {
  course_id: string;
  name: string;
  number: string;
  description?: string;
  teachers_name: string[];
}

export default function Manage() {
  const [selectedCourse, setSelectedCourse] = useState<Course | undefined>(undefined);

  const handleSelectCourse = (course: Course) => {
    setSelectedCourse(course);
  };

  return (
    <div className="flex h-full gap-4">
      <ManageLeftBar
        isVisible={true}
        onSelectCourse={handleSelectCourse}
        selectedCourseId={selectedCourse?.course_id}
      />
      <ManageRightBar
        isVisible={true}
        selectedCourse={selectedCourse}
      />
    </div>
  );
} 