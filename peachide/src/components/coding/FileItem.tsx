import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TreeNode } from "@/components/data/CodeEnvType";

interface FileItemProps {
  icon: React.ReactNode;
  filename: React.ReactNode;
  treeNode: TreeNode;
  onItemClick?: (treeNode: TreeNode) => void;
  draggable?: boolean;
  onDrop?: (event: React.DragEvent<HTMLDivElement>, fromUri: string, toUri: string) => void;
  onDragOver?: (event: React.DragEvent<HTMLDivElement>, treeNode: TreeNode) => void;
  onDelete?: (uri: string) => void;
}

function FileItem(props: FileItemProps) {
  const {
    icon,
    filename,
    treeNode,
    onItemClick,
    draggable,
    onDrop,
    onDragOver,
    onDelete
  } = props;

  const [isHovered, setIsHovered] = useState(false);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    if (draggable) {
      e.dataTransfer.setData("text/plain", treeNode.uri);
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div 
      className="file-tree__file-item" 
      style={{ display: "flex", width: '100%', alignItems: 'center' }}
      onClick={() => onItemClick?.(treeNode)}
      draggable={draggable}
      onDragStart={handleDragStart}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver?.(e, treeNode);
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span className="file-tree__icon">{icon}</span>
      <span
        className="file-tree__filename"
        style={{
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
          overflow: "hidden",
          wordBreak: "break-all",
          flex: 1
        }}
      >
        {filename}
      </span>
      {onDelete && (
        <Button
          variant="ghost"
          size="icon"
          className={`size-6 opacity-0 ${isHovered ? 'opacity-100' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(treeNode.uri);
          }}
        >
          <Trash2 size={14} />
        </Button>
      )}
    </div>
  );
}

export default FileItem;
