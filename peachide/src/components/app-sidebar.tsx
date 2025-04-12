"use client";

import {CodeXml, ComponentIcon, Home, Book} from "lucide-react";

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
import {NavUser} from "@/components/sidebar/nav-user";
import React from "react";

const items = [
    {
        title: "Home",
        url: "/",
        icon: Home,
    },
    {
        title: "Classes",
        url: "/classes",
        icon: Book,
    },
    {
        title: "Coding",
        url: "/coding",
        icon: CodeXml,
    },
    {
        title: "Slides",
        url: "/slides",
        icon: ComponentIcon
    }
];

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
    return (<Sidebar collapsible="icon"
            className="w-[calc(var(--sidebar-width-icon))]! border-r-1">
        <SidebarHeader>
            <PeachSidebarHeader />
        </SidebarHeader>
        <SidebarContent>
            <SidebarGroup>
                <SidebarGroupContent>
                    <SidebarMenu>
                        {items.map((item) => (
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
        <SidebarFooter className="mb-1">
            <NavUser user={{
                name: "User",
                email: "user@example.com",
                avatar: "",
            }} />
        </SidebarFooter>
    </Sidebar>);
}

export function AppSidebar() {
    return (
        <Sidebar
                className="h-full border-none"
        >
            <FirstSidebar />
        </Sidebar>
    );
}
