"use client";

import React, { useState, useEffect } from "react";
import { FilePlus, FolderPlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TreeNode } from "@/components/data/CodeEnvType";
import { FileTreeProps, FileTree } from "@/components/coding/FileStructure";
import { assignTreeNode } from "@/components/coding/FileUtils";
import { Input } from "@/components/ui/input";
import { useTree, removeNode, addNodeToTarget, addFolderToDir, addFileToDir, fileExists, folderExists, deleteNode, findNode } from "../data/FileSystemBarData";

interface FileSystemBarProps {
  projectId: string;
  isVisible: boolean;
  onFileSelect?: (treeNode: TreeNode) => void;
}

export default function FileSystemBar({ projectId, isVisible, onFileSelect }: FileSystemBarProps) {
  const [tree, setTree] = useState<TreeNode|undefined>();
  const [dragOverNode, setDragOverNode] = useState<string|null>(null);
  const [showFileInput, setShowFileInput] = useState(false);
  const [showFolderInput, setShowFolderInput] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [selectedDirectory, setSelectedDirectory] = useState<string>("/");

  const { fileTree, isLoading, isError } = useTree(projectId);

  useEffect(() => {
    if (fileTree) {
      setTree(fileTree);
    }
  }, [fileTree]);

  const createNewFile = () => {
    if (!newItemName.trim()) return;
    
    const targetDir = selectedDirectory;
    const newFileUri = targetDir + (targetDir.endsWith("/") ? "" : "/") + newItemName;
    
    if (tree && fileExists(tree, newFileUri)) {
      alert("A file with this name already exists");
      return;
    }
    
    const newFileNode: TreeNode = {
      type: "file",
      uri: newFileUri,
    };
    
    setTree(currentTree => {
      if (!currentTree) return currentTree;
      const newTree = JSON.parse(JSON.stringify(currentTree));
      addFileToDir(newTree, targetDir, newFileNode);
      return newTree;
    });
    
    setNewItemName("");
    setShowFileInput(false);
  };
  
  const createNewFolder = () => {
    if (!newItemName.trim()) return;
    
    const targetDir = selectedDirectory;
    const newFolderUri = targetDir + (targetDir.endsWith("/") ? "" : "/") + newItemName;
   
    if (tree && folderExists(tree, newFolderUri)) {
      alert("A folder with this name already exists");  
      return;
    }
    
    const newFolderNode: TreeNode = {
      type: "directory",
      uri: newFolderUri,
      children: [],
      expanded: true
    };
    
    setTree(currentTree => {
      if (!currentTree) return currentTree;
      const newTree = JSON.parse(JSON.stringify(currentTree));
      addFolderToDir(newTree, targetDir, newFolderNode);
      return newTree;
    });
    
    setNewItemName("");
    setShowFolderInput(false);
  };

  const handleItemClick: FileTreeProps["onItemClick"] = (treeNode) => {
    if (treeNode.type === "directory") {
      setTree((tree) =>
        assignTreeNode(tree, treeNode.uri, {
          expanded: !treeNode.expanded
        })
      );
      setSelectedDirectory(treeNode.uri);
    } else if (onFileSelect) {
      onFileSelect(treeNode);
    }
  };

  const handleDragOver: FileTreeProps["onDragOver"] = (event, treeNode) => {
    event.preventDefault();
    if (treeNode.type === "directory") {
      setDragOverNode(treeNode.uri);
      event.dataTransfer.dropEffect = "move";
    } else {
      event.dataTransfer.dropEffect = "none";
    }
  };

  const handleDrop: FileTreeProps["onDrop"] = (event, fromUri, toUri) => {
    event.preventDefault();
    if (!fromUri || !toUri || fromUri === toUri) {
      setDragOverNode(null);
      return;
    }

    let targetNode: TreeNode | undefined;
    if (tree) {
      targetNode = findNode(tree, toUri);
    }

    if (!targetNode || targetNode.type !== "directory") {
      setDragOverNode(null);
      return;
    }

    const fileName = fromUri.split('/').pop() || "";
    const newUri = toUri + '/' + fileName;

    if (newUri === fromUri) {
      setDragOverNode(null);
      return;
    }

    let sourceNode: TreeNode | undefined;
    if (tree) {
      sourceNode = findNode(tree, fromUri);
    }

    if (!sourceNode) {
      setDragOverNode(null);
      return;
    }

    setTree((currentTree) => {
      if (!currentTree) return currentTree;
      const newTree = JSON.parse(JSON.stringify(currentTree));
      removeNode(newTree, fromUri);
      addNodeToTarget(newTree, toUri, sourceNode, fromUri, newUri);
      console.log("newTree", newTree);
      return newTree;
    });

    setDragOverNode(null);
  };

  const handleDelete = (uri: string) => {
    if (!tree) return;
    
    if (window.confirm('Are you sure you want to delete this item?')) {
      setTree(currentTree => {
        if (!currentTree) return currentTree;
        const newTree = JSON.parse(JSON.stringify(currentTree));
        return deleteNode(newTree, uri);
      });
    }
  };

  return (
    <div className={`border-1 rounded-[var(--radius)]
        transition-all duration-300 ${isVisible ? 'w-1/5 mr-3 opacity-100' : 'w-0 opacity-0'} 
        overflow-hidden`}>
      <div className="flex flex-row p-3 items-center">
        <div className="flex-1">Code Space</div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="size-8 flex-none ml-auto"
          onClick={() => {
            setShowFileInput(true);
            setShowFolderInput(false);
            setNewItemName("");
          }}
        >
          <FilePlus />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="size-8 flex-none ml-auto"
          onClick={() => {
            setShowFolderInput(true);
            setShowFileInput(false);
            setNewItemName("");
          }}
        >
          <FolderPlus />
        </Button>
      </div>
      
      {showFileInput && (
        <div className="p-2 flex gap-2">
          <Input
            placeholder="File name"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') createNewFile();
              if (e.key === 'Escape') {
                setShowFileInput(false);
                setNewItemName("");
              }
            }}
            autoFocus
          />
          <Button size="sm" onClick={createNewFile}>Create</Button>
        </div>
      )}
      
      {showFolderInput && (
        <div className="p-2 flex gap-2">
          <Input
            placeholder="Folder name"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') createNewFolder();
              if (e.key === 'Escape') {
                setShowFolderInput(false);
                setNewItemName("");
              }
            }}
            autoFocus
          />
          <Button size="sm" onClick={createNewFolder}>Create</Button>
        </div>
      )}
      
      <hr className="border-1" />
      {tree ? (
        <FileTree 
          tree={tree}
          onItemClick={handleItemClick} 
          draggable={true}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          hideRoot={true}
          onDelete={handleDelete}
        />
      ) : (
        <div className="p-4 text-center text-muted-foreground">
          Loading...
        </div>
      )}
    </div>
  );
} 