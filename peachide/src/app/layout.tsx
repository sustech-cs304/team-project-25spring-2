import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { UserProvider } from "./UserEnvProvider";
import UserActionLoggerProvider from "./UserActionLoggerProvider";
import AuthGuard from "@/components/auth-guard";
import RatingPopup from "@/components/RatingPopup";
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/github.css';

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
                    defaultTheme="light"
                    enableSystem={false}
                    disableTransitionOnChange
                >
                    <UserProvider>
                        <AuthGuard>
                            <UserActionLoggerProvider>
                            <SidebarProvider style={{
                                "--sidebar-width": "3rem"
                            } as React.CSSProperties} className="h-full">
                                <AppSidebar />
                                <SidebarInset className="p-3 h-full">
                                    {children}
                                </SidebarInset>
                            </SidebarProvider>
                            </UserActionLoggerProvider>
                        </AuthGuard>
                    </UserProvider>
                </ThemeProvider>
                <Toaster />
                <RatingPopup />
            </body>
        </html>
    );
}
