"use client";

import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

interface UserData {
  name: string;
  email: string;
  grade: string;
  avatarUrl: string;
}

export default function Home() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user data when component mounts
    const fetchUserData = async () => {
      try {
        // Replace with your actual API endpoint
        const response = await fetch('/api/user');
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Set sample data for demonstration
        setUserData({
          name: "Alex Johnson",
          email: "alex.johnson@example.com",
          grade: "Senior",
          avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

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
            <CardHeader>
              <CardTitle className="text-center">User Profile</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              {loading ? (
                <>
                  <Skeleton className="h-24 w-24 rounded-full" />
                  <Skeleton className="h-4 w-[250px] mt-4" />
                  <Skeleton className="h-4 w-[200px] mt-2" />
                  <Skeleton className="h-4 w-[150px] mt-2" />
                </>
              ) : (
                <>
                  <Avatar className="h-24 w-24 border-2 border-primary">
                    <AvatarImage src={userData?.avatarUrl} alt={userData?.name} />
                    <AvatarFallback>{userData?.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-semibold mt-4">{userData?.name}</h2>
                  <p className="text-muted-foreground">{userData?.email}</p>
                  <p className="bg-primary/10 px-3 py-1 rounded-full text-sm mt-2">{userData?.grade} Student</p>
                </>
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
