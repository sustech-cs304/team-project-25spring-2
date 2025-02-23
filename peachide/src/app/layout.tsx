import type {Metadata} from "next";
import "./globals.css";
import {ThemeProvider} from "next-themes";
import React from "react";
import {AppSidebar} from "@/components/app-sidebar";
import {SidebarInset, SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";

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
                    <SidebarProvider style={
                        {
                            "--sidebar-width": "300px",
                        } as React.CSSProperties
                    }>
                        <AppSidebar />
                        <SidebarInset
                                className="m-3 min-h-[calc(100%-6*var(--spacing))] rounded-[var(--radius)] border-1">
                            <div className="border-b p-3 flex items-center">
                                <SidebarTrigger className="mr-1" />
                                <div className="rounded-none border-l pl-3">Toolbar</div>
                            </div>
                            <div className="p-3">
                                {children}
                            </div>
                        </SidebarInset>
                    </SidebarProvider>
                </ThemeProvider>
            </body>
            </html>
    );
}
