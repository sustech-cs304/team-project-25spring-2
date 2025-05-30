"use client";

import React, { useState } from "react";
import { use } from 'react'
import FileSystemBar from "@/components/coding/FileSystemBar";
import EditorLayout from "@/components/coding/EditorLayout";
import { TreeNode } from "@/components/data/CodeEnvType";

export default function Coding({ params }: { params: Promise<{ id: string }> }) {
  const [isFileSystemBarVisible, setFileSystemBarVisible] = useState(true);
  const [selectedFile, setSelectedFile] = useState<TreeNode | null>(null);
  const resolvedParams = use(params);
  const toggleFileSystemBar = () => {
    setFileSystemBarVisible(!isFileSystemBarVisible);
  };

  const handleFileSelect = (treeNode: TreeNode) => {
    setSelectedFile(treeNode);
  };

  return (
    <div className="flex h-full">
      <FileSystemBar 
        projectId={resolvedParams.id} 
        isVisible={isFileSystemBarVisible}
        onFileSelect={handleFileSelect}
      />
      <EditorLayout 
        environmentId={resolvedParams.id}
        onToggleFileSystemBar={toggleFileSystemBar}
        selectedFile={selectedFile}
      />
    </div>
  );
}