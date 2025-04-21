import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "sonner";
import { UserProvider } from "./UserEnvProvider";
import AuthGuard from "@/components/auth-guard";

export const metadata: Metadata = {
    title: "PeachIDE: Course-aware IDE",
    description: "A course-aware IDE by Peach Fans Club",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    return (
        <html lang="en" suppressHydrationWarning>
            <body>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <UserProvider>
                        <AuthGuard>
                            <SidebarProvider style={{
                                "--sidebar-width": "3rem"
                            } as React.CSSProperties} className="h-full">
                                <AppSidebar />
                                <SidebarInset className="p-3 h-full">
                                    {children}
                                </SidebarInset>
                            </SidebarProvider>
                        </AuthGuard>
                    </UserProvider>
                </ThemeProvider>
                <Toaster />
            </body>
        </html>
    );
}
