"use client";

import React, { useState, useEffect } from "react";
import { FilePlus, FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TreeNode } from "@/components/data/CodeEnvType";
import { FileTreeProps, FileTree } from "@/components/coding/FileStructure";
import { assignTreeNode } from "@/components/coding/FileUtils";

interface FileSystemBarProps {
  projectId: string;
  isVisible: boolean;
  onFileSelect?: (treeNode: TreeNode) => void;
}

export default function FileSystemBar({ projectId, isVisible, onFileSelect }: FileSystemBarProps) {
  const [tree, setTree] = useState<TreeNode|undefined>();

  const loadTree = () => {
    return import(`@/app/coding/[id]/tree.json`).then((module) => module.default as TreeNode);
  };

  useEffect(() => {
    loadTree()
      .then((tree) => Object.assign(tree, { expanded: true }))
      .then(setTree);
  }, []);

  const handleItemClick: FileTreeProps["onItemClick"] = (treeNode) => {
    if (treeNode.type === "directory") {
      // If it's a directory, toggle expanded state
      setTree((tree) =>
        assignTreeNode(tree, treeNode.uri, {
          expanded: !treeNode.expanded
        })
      );
    } else if (onFileSelect) {
      // If it's a file and we have a file select handler, call it
      onFileSelect(treeNode);
    }
  };

  return (
    <div className={`border-1 rounded-[var(--radius)]
        transition-all duration-300 ${isVisible ? 'w-1/5 mr-3 opacity-100' : 'w-0 opacity-0'} 
        overflow-hidden`}>
      <div className="flex flex-row p-3 items-center">
        <div className="flex-1">Code Space</div>
        <Button variant="ghost" size="icon" className="size-8 flex-none ml-auto"><FilePlus /></Button>
        <Button variant="ghost" size="icon" className="size-8 flex-none ml-auto"><FolderPlus /></Button>
      </div>
      <hr className="border-1" />
      <FileTree tree={tree} onItemClick={handleItemClick} />
    </div>
  );
} 