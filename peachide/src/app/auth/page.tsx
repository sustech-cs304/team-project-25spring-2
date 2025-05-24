"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserContext } from "../UserEnvProvider";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { EyeIcon, EyeOffIcon, LogInIcon, UserPlusIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default function AuthPage() {
  const router = useRouter();
  const { login, isTeacher, setIsTeacher } = useUserContext();

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);

  // Shared form state for both login and register
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    email: "",
    user_id: ""
  });

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL + "/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: formData.user_id,
          password: formData.password
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Wrong username or password");
        }
        throw new Error("Login failed, please try again");
      }

      const data = await response.json();
      // data: { token, user_id, is_teacher }
      login(data.token, data.user_id, data.is_teacher === 'True');
      router.push('/');
      toast.success('Logged in successfully');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL + "/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: formData.name,
          password: formData.password,
          email: formData.email,
          user_id: formData.user_id,
          is_teacher: isTeacher
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized");
        }
        throw new Error("Registration failed, please try again");
      }

      toast.success('Registration successful, please login');
      setActiveTab("login");
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const tabContentVariants = {
    hidden: { opacity: 0, x: activeTab === "login" ? -20 : 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: activeTab === "login" ? 20 : -20, transition: { duration: 0.3 } }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background/50 to-background/95 p-4">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full max-w-md mt-16"
      >
        <motion.div
          variants={itemVariants}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-primary mb-3">PeachIDE</h1>
          <p className="text-muted-foreground">Your course-aware integrated development environment</p>
        </motion.div>

        <Tabs
          defaultValue="login"
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "login" | "register")}
          className="w-full"
        >
          <motion.div variants={itemVariants}>
            <TabsList className="grid w-full grid-cols-2 mb-10">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
          </motion.div>

          <AnimatePresence mode="wait">
            {activeTab === "login" && (
              <motion.div
                key="login"
                variants={tabContentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <Card className="border-2 shadow-lg mt-4">
                  <CardHeader className="pb-6">
                    <CardTitle className="flex items-center gap-2">
                      <LogInIcon className="h-5 w-5 text-primary" />
                      <span>Login</span>
                    </CardTitle>
                    <CardDescription>Enter your credentials to access your account</CardDescription>
                  </CardHeader>
                  <form onSubmit={handleLogin}>
                    <CardContent className="space-y-6">
                      <motion.div
                        className="space-y-2"
                        variants={itemVariants}
                      >
                        <Label htmlFor="login-name" className="text-sm font-medium">User ID</Label>
                        <Input
                          id="login-name"
                          name="user_id"
                          required
                          value={formData.user_id}
                          onChange={handleFormChange}
                          placeholder="Enter your user ID"
                          className="h-11 transition-all"
                        />
                      </motion.div>
                      <motion.div
                        className="space-y-2"
                        variants={itemVariants}
                      >
                        <Label htmlFor="login-password" className="text-sm font-medium">Password</Label>
                        <div className="relative">
                          <Input
                            id="login-password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            required
                            value={formData.password}
                            onChange={handleFormChange}
                            placeholder="Enter your password"
                            className="h-11 pr-10 transition-all"
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOffIcon className="h-5 w-5" />
                            ) : (
                              <EyeIcon className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </motion.div>
                    </CardContent>
                    <CardFooter className="mt-4">
                      <Button
                        type="submit"
                        className="w-full mt-4 h-12 text-base transition-all"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <span className="flex items-center gap-2">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                            Logging in...
                          </span>
                        ) : "Login"}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </motion.div>
            )}

            {activeTab === "register" && (
              <motion.div
                key="register"
                variants={tabContentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <Card className="border-2 shadow-lg mt-4">
                  <CardHeader className="pb-6">
                    <CardTitle className="flex items-center gap-2">
                      <UserPlusIcon className="h-5 w-5 text-primary" />
                      <span>Register</span>
                    </CardTitle>
                    <CardDescription>Create a new account to get started</CardDescription>
                  </CardHeader>
                  <form onSubmit={handleRegister}>
                    <CardContent className="space-y-6">
                      <motion.div
                        className="space-y-2"
                        variants={itemVariants}
                      >
                        <Label htmlFor="register-name" className="text-sm font-medium">Username</Label>
                        <Input
                          id="register-name"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleFormChange}
                          placeholder="Choose a username"
                          className="h-11 transition-all"
                        />
                      </motion.div>
                      <motion.div
                        className="space-y-2"
                        variants={itemVariants}
                      >
                        <Label htmlFor="register-password" className="text-sm font-medium">Password</Label>
                        <div className="relative">
                          <Input
                            id="register-password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            required
                            value={formData.password}
                            onChange={handleFormChange}
                            placeholder="Choose a password"
                            className="h-11 pr-10 transition-all"
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOffIcon className="h-5 w-5" />
                            ) : (
                              <EyeIcon className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </motion.div>
                      <motion.div
                        className="space-y-2"
                        variants={itemVariants}
                      >
                        <Label htmlFor="register-email" className="text-sm font-medium">Email (optional)</Label>
                        <Input
                          id="register-email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleFormChange}
                          placeholder="Enter your email (optional)"
                          className="h-11 transition-all"
                        />
                      </motion.div>
                      <motion.div
                        className="space-y-2"
                        variants={itemVariants}
                      >
                        <Label htmlFor="register-userid" className="text-sm font-medium">User ID</Label>
                        <Input
                          id="register-userid"
                          name="user_id"
                          required
                          value={formData.user_id}
                          onChange={handleFormChange}
                          placeholder="Enter your user ID"
                          className="h-11 transition-all"
                        />
                      </motion.div>

                      <motion.div
                        className="flex items-center space-x-2"
                        variants={itemVariants}
                      >
                        <Switch
                          id="register-teacher-mode"
                          checked={isTeacher}
                          onCheckedChange={setIsTeacher}
                        />
                        <Label htmlFor="register-teacher-mode" className="text-sm">Register as Teacher</Label>
                      </motion.div>
                    </CardContent>
                    <CardFooter className="mt-4">
                      <Button
                        type="submit"
                        className="w-full mt-4 h-12 text-base transition-all"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <span className="flex items-center gap-2">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                            Registering...
                          </span>
                        ) : "Register"}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </Tabs>
      </motion.div>
    </div>
  );
} 