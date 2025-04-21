"use client";

import React from "react";
import { BookCopy, SquareTerminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserInfo } from "./CollaboratedEditor";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface EditorToolbarProps {
  onToggleFileSystemBar: () => void;
  onToggleTerminal: () => void;
  editingUsers: UserInfo[];
}

export default function EditorToolbar({ onToggleFileSystemBar, onToggleTerminal, editingUsers }: EditorToolbarProps) {
  return (
    <div className="flex justify-between items-center flex-none p-3">
      <div className="flex gap-1">
        <Button onClick={onToggleFileSystemBar} variant="ghost" size="icon" className="size-8">
          <BookCopy />
        </Button>
        <Button onClick={onToggleTerminal} variant="ghost" size="icon" className="size-8">
          <SquareTerminal />
        </Button>
      </div>
      
      <div className="relative group/avatars cursor-pointer">
        <div className="flex -space-x-2 overflow-hidden">
          {editingUsers.slice(0, 3).map((user, index) => (
            <Avatar key={index} className="border-2 border-background">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
          ))}
          {editingUsers.length > 3 && (
            <div className="flex items-center justify-center z-10 bg-muted text-muted-foreground rounded-full border-2 border-background size-8">
              +{editingUsers.length - 3}
            </div>
          )}
        </div>
        
        {editingUsers.length > 0 && (
          <div className="absolute right-0 top-full mt-2 z-50 hidden group-hover/avatars:block hover:block bg-popover rounded-md shadow-md p-2 min-w-48">
            <div className="text-sm font-medium mb-1">Active users</div>
            <div className="space-y-2">
              {editingUsers.map((user, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Avatar className="size-6">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="text-xs">{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{user.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 