import type {Metadata} from "next";
import "./globals.css";
import {ThemeProvider} from "next-themes";

export const metadata: Metadata = {
    title: "PeachIDE",
    description: "Course-aware IDE by Peach Fans Club",
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
                {children}
            </ThemeProvider>
        </body>
        </html>
    );
}
