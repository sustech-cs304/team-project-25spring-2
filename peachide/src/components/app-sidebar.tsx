"use client";

import {CodeXml, ComponentIcon, Home, Library} from "lucide-react";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarInput,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import {NavUser} from "@/components/sidebar/nav-user";
import React, {useMemo} from "react";
import {SidebarContentBody} from "@/components/sidebar/content";
import {usePathname} from "next/navigation";

const items = [
    {
        title: "Home",
        url: "/",
        icon: Home,
    },
    {
        title: "Classes",
        url: "/classes",
        icon: Library,
    },
    {
        title: "Coding",
        url: "/coding",
        icon: CodeXml,
    },
    {
        title: "My Group",
        url: "/groups",
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
    return (<Sidebar collapsible="none"
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

function SecondSidebar(props: React.ComponentProps<any>) {
    const title = useMemo(() => {
        const item = items.find((item) => item.url === props.pathname);
        return item ? item.title : "Unknown";
    }, [props.pathname, items]);

    return (<Sidebar collapsible="none"
            className="hidden flex-1 md:flex ml-3 my-3 h-[calc(100%-6*var(--spacing))] rounded-[var(--radius)] border-1">
        <SidebarHeader className="gap-3.5 border-b p-4">
            <div className="text-base font-medium text-foreground" suppressHydrationWarning>
                {title}
            </div>
            <SidebarInput placeholder="Type to search..." />
        </SidebarHeader>
        <SidebarContent>
            <SidebarGroup className="px-0">
                <SidebarGroupContent>
                    <SidebarContentBody pathname={props.pathname} />
                </SidebarGroupContent>
            </SidebarGroup>
        </SidebarContent>
    </Sidebar>);
}

export function AppSidebar() {
    return (
            <Sidebar
                    collapsible="icon"
                    className="overflow-hidden [&>[data-sidebar=sidebar]]:flex-row w-fit-content h-full border-none"
            >
                <FirstSidebar />
                <SecondSidebar pathname={usePathname()} />
            </Sidebar>
    );
}
