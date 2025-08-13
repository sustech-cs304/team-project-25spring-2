"use client";

import React from "react";
import { LogOut, Download, Trash2 } from "lucide-react";
import { SmartAvatar } from "@/components/ui/smart-avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar, } from "@/components/ui/sidebar";
import { DarkToggle } from "@/components/sidebar/dark-toggle";
import { useUserContext } from "@/app/UserEnvProvider";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import userActionLogger from '@/lib/userActionLogger';

export function NavUser({
    user,
}: {
    user: {
        name: string
        email: string
        avatar: string
    }
}) {
    const { isMobile } = useSidebar();
    const { logout } = useUserContext();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        toast.success("已退出登录");
        router.push('/auth');
    };

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground md:h-8 md:p-0"
                            title={"Sidebar: User " + user.name}
                        >
                            <SmartAvatar
                                name={user.name}
                                photo={user.avatar}
                                className="h-8 w-8 rounded-lg"
                                fallbackClassName="rounded-lg"
                            />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="flex items-center">
                            <SmartAvatar
                                name={user.name}
                                photo={user.avatar}
                                className="h-8 w-8 rounded-lg"
                                fallbackClassName="rounded-lg"
                            />
                            <div className="grid flex-1 ml-3 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">{user.name}</span>
                                <span className="truncate text-xs">{user.email}</span>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem
                                onClick={() => {
                                    userActionLogger.exportLogs();
                                    toast.success("Exported logs");
                                }}
                            >
                                <Download />
                                Download logs
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => {
                                    if (typeof window !== 'undefined') {
                                        const confirmed = window.confirm('Clear user action logs? This will permanently delete all locally stored logs on this device.');
                                        if (confirmed) {
                                            userActionLogger.clearLogs();
                                            toast.success('Logs cleared');
                                        }
                                    }
                                }}
                            >
                                <Trash2 />
                                Clear logs
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DarkToggle />
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>
                            <LogOut />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
