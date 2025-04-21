"use client";

import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useUserContext } from "./UserEnvProvider";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export interface UserData {
  user_id: string;
  name: string;
  email?: string;
  is_teacher: boolean;
  courses: { course_id: string }[];
  photo?: string;
  office_hour?: string;
  office_place?: string;
}

export default function Home() {
  const { userId, logout, isTeacher, setIsTeacher, userData, setUserData } = useUserContext();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/auth');
    toast.success('Logged out successfully');
  };

  const getInitials = (name: string) => {
    return name.split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-primary mb-2">Welcome to PeachIDE</h1>
        <p className="text-xl text-muted-foreground">
          Your comprehensive course management system
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card className="border shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl">Your Profile</CardTitle>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="flex flex-col items-center pt-4">
              {userData != null ? (
                <>
                  <Avatar className="h-24 w-24 border-2 border-primary">
                    <AvatarImage src={userData.photo} alt={userData.name} />
                    <AvatarFallback>{getInitials(userData.name)}</AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-semibold mt-4">{userData.name}</h2>
                  {userData.email && <p className="text-muted-foreground">{userData.email}</p>}
                  <div className="flex flex-wrap gap-2 mt-2 justify-center">
                    <span className={`px-3 py-1 rounded-full text-sm ${isTeacher ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      }`}>
                      {isTeacher ? 'Teacher' : 'Student'}
                    </span>
                    <span className="bg-primary/10 px-3 py-1 rounded-full text-sm">
                      {userData.courses.length} Course{userData.courses.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {isTeacher && (
                    <div className="w-full mt-4 space-y-1 border-t pt-4">
                      {userData.office_hour && (
                        <p className="text-sm flex justify-between">
                          <span className="font-medium">Office Hours:</span>
                          <span>{userData.office_hour}</span>
                        </p>
                      )}
                      {userData.office_place && (
                        <p className="text-sm flex justify-between">
                          <span className="font-medium">Office Location:</span>
                          <span>{userData.office_place}</span>
                        </p>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-muted-foreground">Could not load user information</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Card className="border shadow-lg">
            <CardHeader>
              <CardTitle>About PeachIDE</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                PeachIDE is a comprehensive course management system designed to enhance your learning experience.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <span className="bg-primary/20 p-1 rounded-full mr-2">✓</span>
                  Track your course progress efficiently
                </li>
                <li className="flex items-center">
                  <span className="bg-primary/20 p-1 rounded-full mr-2">✓</span>
                  Access learning materials in one place
                </li>
                <li className="flex items-center">
                  <span className="bg-primary/20 p-1 rounded-full mr-2">✓</span>
                  Collaborate with classmates on projects
                </li>
                <li className="flex items-center">
                  <span className="bg-primary/20 p-1 rounded-full mr-2">✓</span>
                  Manage assignments and deadlines easily
                </li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
