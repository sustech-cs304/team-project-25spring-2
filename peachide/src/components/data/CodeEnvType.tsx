import React, { CSSProperties, FC, memo } from "react";

export type TreeNodeType = "directory" | "file";

export type TreeNode<T extends {} = {}, K extends keyof T = keyof T> = {
  [x in K]: T[K];
} & {
  type: TreeNodeType;
  uri: string;
  expanded?: boolean;
  children?: TreeNode<T, K>[];
};

export interface TreeItemProps {
  style: CSSProperties;
  indent: number;
  indentUnit: string;
  onContextMenu?: (
    event: React.MouseEvent<HTMLDivElement>,
    treeNode: TreeNode
  ) => void;
  onDragOver?: (
    event: React.DragEvent<HTMLDivElement>,
    treeNode: TreeNode
  ) => void;
  onDrop?: (
    event: React.DragEvent<HTMLDivElement>,
    fromUri: string,
    toUri: string
  ) => void;
  activated: boolean;
  draggable?: boolean;
  onClick?: (treeNode: TreeNode) => void;
  treeNode: TreeNode;
  treeItemRenderer: (treeNode: TreeNode) => React.ReactNode;
}

export const TreeItem: FC<TreeItemProps> = memo(
  ({
    treeNode,
    onContextMenu,
    treeItemRenderer,
    indent,
    indentUnit,
    style,
    draggable,
    onClick,
    onDragOver,
    onDrop,
    activated,
  }) => {
    const className = "file-tree__tree-item " + (activated ? "activated" : "");
    return (
      <div
        className={className}
        title={treeNode.uri}
        draggable={draggable}
        onDrop={(e) => {
          e.preventDefault();
          const from = e.dataTransfer.getData("text/plain");
          const to = treeNode.uri;
          onDrop?.(e, from, to);
          e.currentTarget.classList.remove("file-tree__tree-item--dragover");
        }}
        onDragOver={(e) => {
          e.preventDefault();
          onDragOver?.(e, treeNode);
          e.currentTarget.classList.add("file-tree__tree-item--dragover");
        }}
        onDragEnter={(e) => {
          e.currentTarget.classList.add("file-tree__tree-item--dragover");
        }}
        onDragLeave={(e) => {
          e.currentTarget.classList.remove("file-tree__tree-item--dragover");
        }}
        onDragStart={(e) => {
          e.dataTransfer.setData("text/plain", treeNode.uri);
          e.dataTransfer.setData("text/file-type", treeNode.type);
          e.currentTarget.classList.add("file-tree__tree-item--dragging");
          
          // Create a drag image with a more subtle appearance
          const ghostElement = e.currentTarget.cloneNode(true) as HTMLElement;
          ghostElement.style.opacity = "0.7";
          ghostElement.style.transform = "scale(0.95)";
          ghostElement.style.position = "absolute";
          ghostElement.style.top = "-1000px";
          document.body.appendChild(ghostElement);
          
          e.dataTransfer.setDragImage(ghostElement, 0, 0);
          
          // Clean up the ghost element after dragging ends
          setTimeout(() => {
            document.body.removeChild(ghostElement);
          }, 0);
        }}
        onDragEnd={(e) => {
          e.currentTarget.classList.remove("file-tree__tree-item--dragging");
          // Remove any lingering dragover classes from all items
          document.querySelectorAll(".file-tree__tree-item--dragover").forEach(el => {
            el.classList.remove("file-tree__tree-item--dragover");
          });
        }}
        onClick={() => onClick?.(treeNode)}
        style={{
          whiteSpace: "nowrap",
          boxSizing: "border-box",
          ...style,
          paddingLeft: indent + indentUnit,
        }}
        onContextMenu={(e) => onContextMenu?.(e, treeNode)}
      >
        {treeItemRenderer(treeNode)}
      </div>
    );
  }
);


export const treeData: TreeNode = {
  type: "directory",
  uri: "/",
  children: [
      {
      type: "directory",
      uri: "/src",
      children: [
          {
            type: "file",
            uri: "/src/index.js",
          },
          {
            type: "file",
            uri: "/src/index2.ts",
          },
          {
            type: "file",
            uri: "/example.pdf",
          },
      ],
      },
      {
      type: "file",
      uri: "/.gitignore",
      },
  ],
}