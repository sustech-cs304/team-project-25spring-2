"use client";

import React from "react";
import { BookCopy, SquareTerminal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EditorToolbarProps {
  onToggleFileSystemBar: () => void;
  onToggleTerminal: () => void;
}

export default function EditorToolbar({ onToggleFileSystemBar, onToggleTerminal }: EditorToolbarProps) {
  return (
    <>
      <div className="flex-row items-start flex-none gap-1 p-3">
        <Button onClick={onToggleFileSystemBar} variant="ghost" size="icon" className="size-8">
          <BookCopy />
        </Button>
        <Button onClick={onToggleTerminal} variant="ghost" size="icon" className="size-8">
          <SquareTerminal />
        </Button>
      </div>
      <hr className="border-1 flex-none" />
    </>
  );
} 