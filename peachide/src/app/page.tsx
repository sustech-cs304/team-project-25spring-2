"use client";

import React, { useEffect, useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { useUserContext } from "./UserEnvProvider";
import { LogOut, Edit, Save, X, Camera, Loader2 } from "lucide-react";
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
  const { userId, logout, isTeacher, setIsTeacher, userData, setUserData, token } = useUserContext();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editData, setEditData] = useState({
    office_hour: '',
    office_place: '',
    photo: null as File | null
  });
  const [previewPhoto, setPreviewPhoto] = useState<string>('');

  // Initialize edit data when userData changes
  useEffect(() => {
    if (userData) {
      setEditData({
        office_hour: userData.office_hour || '',
        office_place: userData.office_place || '',
        photo: null
      });
      setPreviewPhoto(userData.photo || '');
    }
  }, [userData]);

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

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing - reset to original data
      setEditData({
        office_hour: userData?.office_hour || '',
        office_place: userData?.office_place || '',
        photo: null
      });
      setPreviewPhoto(userData?.photo || '');
    }
    setIsEditing(!isEditing);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image file size must be less than 5MB');
        return;
      }

      setEditData(prev => ({ ...prev, photo: file }));

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewPhoto(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!userData || !userId) return;

    setIsLoading(true);
    try {
      const formData = new FormData();

      // Add fields based on user role
      if (isTeacher) {
        formData.append('office_hour', editData.office_hour);
        formData.append('office_place', editData.office_place);
      }

      // Add photo if changed
      if (editData.photo) {
        formData.append('photo', editData.photo);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedData = await response.json();

      // Update local userData
      if (userData) {
        setUserData({
          ...userData,
          office_hour: isTeacher ? editData.office_hour : userData.office_hour,
          office_place: isTeacher ? editData.office_place : userData.office_place,
          photo: editData.photo ? previewPhoto : userData.photo
        });
      }

      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
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
              <div className="flex items-center gap-2">
                {!isEditing && (
                  <Button variant="ghost" size="icon" onClick={handleEditToggle}>
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col items-center pt-4">
              {userData != null ? (
                <>
                  {/* Avatar Section */}
                  <div className="relative">
                    <Avatar className="h-24 w-24 border-2 border-primary">
                      <AvatarImage src={previewPhoto || userData.photo} alt={userData.name} />
                      <AvatarFallback>{getInitials(userData.name)}</AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <Button
                        size="icon"
                        variant="secondary"
                        className="absolute -bottom-2 -right-2 rounded-full h-8 w-8"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handlePhotoChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>

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

                  {/* Teacher Information Section */}
                  {isTeacher && (
                    <div className="w-full mt-4 space-y-3 border-t pt-4">
                      {isEditing ? (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="office_hour" className="text-sm font-medium">Office Hours</Label>
                            <Input
                              id="office_hour"
                              value={editData.office_hour}
                              onChange={(e) => setEditData(prev => ({ ...prev, office_hour: e.target.value }))}
                              placeholder="e.g., Mon & Wed 2-4pm"
                              className="w-full"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="office_place" className="text-sm font-medium">Office Location</Label>
                            <Input
                              id="office_place"
                              value={editData.office_place}
                              onChange={(e) => setEditData(prev => ({ ...prev, office_place: e.target.value }))}
                              placeholder="e.g., Room 101, CS Building"
                              className="w-full"
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          {(userData.office_hour || isEditing) && (
                            <p className="text-sm flex justify-between">
                              <span className="font-medium">Office Hours:</span>
                              <span>{userData.office_hour || 'Not set'}</span>
                            </p>
                          )}
                          {(userData.office_place || isEditing) && (
                            <p className="text-sm flex justify-between">
                              <span className="font-medium">Office Location:</span>
                              <span>{userData.office_place || 'Not set'}</span>
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {/* Edit Actions */}
                  {isEditing && (
                    <div className="flex gap-2 mt-4 w-full">
                      <Button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="flex-1"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleEditToggle}
                        disabled={isLoading}
                        className="flex-1"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
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
