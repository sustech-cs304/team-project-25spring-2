"use client";

import React, { useState, useEffect } from "react";
import { FilePlus, FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { treeData, TreeNode } from "@/components/data/CodeEnvType";
import { FileTreeProps, FileTree } from "@/components/coding/FileStructure";
import { assignTreeNode } from "@/components/coding/FileUtils";
import { Input } from "@/components/ui/input";

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

  const loadTree = () => {
    return Promise.resolve(treeData);
  };

  useEffect(() => {
    loadTree()
      .then((tree) => Object.assign(tree, { expanded: true }))
      .then(setTree);
  }, []);

  const createNewFile = () => {
    if (!newItemName.trim()) return;
    
    const targetDir = selectedDirectory;
    const newFileUri = targetDir + (targetDir.endsWith("/") ? "" : "/") + newItemName;
    
    // Check if file already exists
    const fileExists = (node: TreeNode, uri: string): boolean => {
      if (node.uri === uri) return true;
      if (node.children) {
        return node.children.some(child => fileExists(child, uri));
      }
      return false;
    };
    
    if (tree && fileExists(tree, newFileUri)) {
      alert("A file with this name already exists");
      return;
    }
    
    // Create the new file node
    const newFileNode: TreeNode = {
      type: "file",
      uri: newFileUri,
    };
    
    // Update tree by adding this file to the selected directory
    setTree(currentTree => {
      if (!currentTree) return currentTree;
      
      const newTree = JSON.parse(JSON.stringify(currentTree));
      
      const addFileToDir = (node: TreeNode, targetDirUri: string, fileNode: TreeNode): boolean => {
        if (node.uri === targetDirUri) {
          if (!node.children) node.children = [];
          node.children.push(fileNode);
          return true;
        }
        
        if (node.children) {
          for (const child of node.children) {
            if (addFileToDir(child, targetDirUri, fileNode)) {
              return true;
            }
          }
        }
        
        return false;
      };
      
      addFileToDir(newTree, targetDir, newFileNode);
      return newTree;
    });
    
    // Reset state
    setNewItemName("");
    setShowFileInput(false);
  };
  
  const createNewFolder = () => {
    if (!newItemName.trim()) return;
    
    const targetDir = selectedDirectory;
    const newFolderUri = targetDir + (targetDir.endsWith("/") ? "" : "/") + newItemName;
    
    // Check if folder already exists
    const folderExists = (node: TreeNode, uri: string): boolean => {
      if (node.uri === uri) return true;
      if (node.children) {
        return node.children.some(child => folderExists(child, uri));
      }
      return false;
    };
    
    if (tree && folderExists(tree, newFolderUri)) {
      alert("A folder with this name already exists");
      return;
    }
    
    // Create the new folder node
    const newFolderNode: TreeNode = {
      type: "directory",
      uri: newFolderUri,
      children: [],
      expanded: true
    };
    
    // Update tree
    setTree(currentTree => {
      if (!currentTree) return currentTree;
      
      const newTree = JSON.parse(JSON.stringify(currentTree));
      
      const addFolderToDir = (node: TreeNode, targetDirUri: string, folderNode: TreeNode): boolean => {
        if (node.uri === targetDirUri) {
          if (!node.children) node.children = [];
          node.children.push(folderNode);
          return true;
        }
        
        if (node.children) {
          for (const child of node.children) {
            if (addFolderToDir(child, targetDirUri, folderNode)) {
              return true;
            }
          }
        }
        
        return false;
      };
      
      addFolderToDir(newTree, targetDir, newFolderNode);
      return newTree;
    });
    
    // Reset state
    setNewItemName("");
    setShowFolderInput(false);
  };

  const handleItemClick: FileTreeProps["onItemClick"] = (treeNode) => {
    if (treeNode.type === "directory") {
      // If it's a directory, toggle expanded state
      setTree((tree) =>
        assignTreeNode(tree, treeNode.uri, {
          expanded: !treeNode.expanded
        })
      );
      
      // Set as selected directory for new file/folder creation
      setSelectedDirectory(treeNode.uri);
    } else if (onFileSelect) {
      // If it's a file and we have a file select handler, call it
      onFileSelect(treeNode);
    }
  };

  const handleDragOver: FileTreeProps["onDragOver"] = (event, treeNode) => {
    event.preventDefault();
    // Only allow dropping on directories
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
      // Don't drop on itself
      setDragOverNode(null);
      return;
    }

    // Find target node to verify it's a directory
    let targetNode: TreeNode | undefined;
    const findNode = (node: TreeNode, uri: string): TreeNode | undefined => {
      if (node.uri === uri) return node;
      if (node.children) {
        for (const child of node.children) {
          const found = findNode(child, uri);
          if (found) return found;
        }
      }
      return undefined;
    };

    if (tree) {
      targetNode = findNode(tree, toUri);
    }

    // Only allow dropping on directories
    if (!targetNode || targetNode.type !== "directory") {
      setDragOverNode(null);
      return;
    }

    // Calculate new URI by joining target directory with file name
    const fileName = fromUri.split('/').pop() || "";
    const newUri = toUri + '/' + fileName;

    // Check if new path would be same as old path (moving to same directory)
    if (newUri === fromUri) {
      setDragOverNode(null);
      return;
    }

    // Find source node
    let sourceNode: TreeNode | undefined;
    if (tree) {
      sourceNode = findNode(tree, fromUri);
    }

    if (!sourceNode) {
      setDragOverNode(null);
      return;
    }

    // Update the tree structure
    setTree((currentTree) => {
      if (!currentTree) return currentTree;

      // Clone the tree to avoid direct mutation
      const newTree = JSON.parse(JSON.stringify(currentTree));
      
      // Remove the node from its original location
      const removeNode = (node: TreeNode, uri: string): boolean => {
        if (node.children) {
          const index = node.children.findIndex(child => child.uri === uri);
          if (index !== -1) {
            node.children.splice(index, 1);
            return true;
          }
          
          for (let i = 0; i < node.children.length; i++) {
            if (removeNode(node.children[i], uri)) {
              return true;
            }
          }
        }
        return false;
      };

      // Helper function to update URIs recursively for a directory and its children
      const updateUrisRecursively = (node: TreeNode, oldBaseUri: string, newBaseUri: string): TreeNode => {
        // Update the current node's URI by replacing the old base path with the new base path
        const updatedNode = {
          ...node,
          uri: node.uri.replace(oldBaseUri, newBaseUri)
        };
        
        // If this is a directory with children, recursively update each child's URI
        if (updatedNode.children && updatedNode.children.length > 0) {
          updatedNode.children = updatedNode.children.map(child => 
            updateUrisRecursively(child, oldBaseUri, newBaseUri)
          );
        }
        
        return updatedNode;
      };

      // Find the target node to add the dragged node
      const addNodeToTarget = (node: TreeNode, targetUri: string, nodeToAdd: TreeNode): boolean => {
        if (node.uri === targetUri) {
          if (!node.children) node.children = [];
          
          // Prepare the node with updated URIs for itself and all children
          const updatedNodeToAdd = updateUrisRecursively(nodeToAdd, fromUri, newUri);
          
          node.children.push(updatedNodeToAdd);
          return true;
        }
        
        if (node.children) {
          for (let i = 0; i < node.children.length; i++) {
            if (addNodeToTarget(node.children[i], targetUri, nodeToAdd)) {
              return true;
            }
          }
        }
        return false;
      };

      // Execute the operations
      removeNode(newTree, fromUri);
      addNodeToTarget(newTree, toUri, sourceNode);

      return newTree;
    });

    // Reset drag state
    setDragOverNode(null);
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
        />
      ) : (
        <div className="p-4 text-center text-muted-foreground">
          Loading...
        </div>
      )}
    </div>
  );
} 