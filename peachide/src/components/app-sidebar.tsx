"use client";

import { Book, CodeXml, ComponentIcon, Home } from "lucide-react";

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
import React from "react";
import { useUserContext } from "@/app/UserEnvProvider";

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
    const { sidebarItems } = useUserContext();
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
                                <SidebarMenuButton asChild
                                    className="hover:bg-border mb-2"
                                    tooltip={{
                                        children: item.title,
                                        hidden: false,
                                    }}>
                                    <a href={item.url}>
                                        <item.icon />
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
