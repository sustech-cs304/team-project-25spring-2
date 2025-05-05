"use client";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavUser } from "@/components/sidebar/nav-user";
import React, { useEffect } from "react";
import { useUserContext } from "@/app/UserEnvProvider";
import { useRouter } from 'next/navigation';

function PeachSidebarHeader() {
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
                    <div className="flex aspect-square size-8 items-center justify-center select-none border-b-1 rounded-none">
                        🍑
                    </div>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}

function FirstSidebar() {
    const { sidebarItems, setSidebarItems } = useUserContext();

    const router = useRouter();

    const handleCloseSidebarItem = (itemUrl: string) => {
        setSidebarItems(sidebarItems.filter(item => item.url !== itemUrl));
        router.push("/classes");
    };

    return (<Sidebar collapsible="icon"
        className="w-[calc(var(--sidebar-width-icon))]! border-r-1">
        <SidebarHeader>
            <PeachSidebarHeader />
        </SidebarHeader>
        <SidebarContent>
            <SidebarGroup>
                <SidebarGroupContent>
                    <SidebarMenu>
                        {sidebarItems.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton asChild className="hover:bg-border mb-2">
                                    <a href={item.url} className="relative flex items-center justify-center">
                                        <item.icon />
                                        {
                                            item.title.startsWith("Slides") || item.title.startsWith("Coding") ?
                                                (<span
                                                    className="absolute bottom-0 right-0 bg-primary text-white text-[7px] px-1 py-0.5 rounded shadow"
                                                    style={{ minWidth: 16, textAlign: "center", pointerEvents: "none" }}
                                                >
                                                    {item.title.replace("Slides ", "").replace("Coding ", "").slice(0, 2)}
                                                </span>) : ''
                                        }
                                        {(item.title.startsWith("Slides") || item.title.startsWith("Coding")) && (
                                            <button
                                                className="absolute -top-1 -right-1 text-white rounded-full text-[10px] w-4 h-4 flex items-center justify-center hover:bg-red-600 pointer-events-auto cursor-pointer"
                                                style={{ zIndex: 10 }}
                                                onClick={e => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleCloseSidebarItem(item.url);
                                                }}
                                                title="Close"
                                            >
                                                ×
                                            </button>
                                        )}
                                    </a>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
        </SidebarContent>
    </Sidebar>);
}

export function AppSidebar() {
    const { userId } = useUserContext();

    const userInfo = {
        name: userId ? `User-${userId.slice(0, 5)}` : "Guest",
        email: userId ? `user-${userId.slice(0, 5)}@example.com` : "Not logged in",
        avatar: "",
    };

    return (
        <Sidebar
            className="h-full border-none"
        >
            <FirstSidebar />
            <SidebarFooter className="mb-1">
                <NavUser user={userInfo} />
            </SidebarFooter>
        </Sidebar>
    );
}
