"use client";
import React, { forwardRef, useState } from "react";
import { File, Folder, FolderOpen } from "lucide-react";
import { AutoSizer, List, ListRowProps } from "react-virtualized";
import FileItem from "./FileItem";
import { TreeNode, TreeItem, TreeItemProps } from "@/components/data/CodeEnvType";
import { calcLevel, flatTreeData, getFileName } from "./FileUtils";

export interface FileTreeProps {
  /**
   * 是否支持拖拽
   */
  draggable?: boolean;

  tree?: TreeNode;

  /**
   * Whether to hide the root node and show only its children
   */
  hideRoot?: boolean;

  activatedUri?: string;
  /**
   * 点击条目
   */
  onItemClick?: (treeNode: TreeNode) => void;

  /**
   * 拖拽
   * @param fromUri
   * @param toDirUri
   */
  onDrop?: TreeItemProps["onDrop"];

  onDragOver?: TreeItemProps["onDragOver"];

  sorter?: (treeNodes: TreeNode[]) => TreeNode[];

  /**
   * 无数据时展示
   */
  emptyRenderer?: () => React.ReactElement;

  /**
   * 右键回调
   */
  onContextMenu?: (
    event: React.MouseEvent<HTMLDivElement>,
    treeNode: TreeNode
  ) => void;

  /**
   * 渲染节点
   */
  itemRenderer?: (treeNode: TreeNode) => React.ReactNode;

  /**
   * 子节点缩进尺寸
   */
  indent?: number;
  /**
   *  节点高度，默认30
   */
  rowHeight?: number;
  /**
   * 缩进单位，默认px
   */
  indentUnit?: string;
}

function defaultEmptyRenderer() {
  return <div className="file-tree__empty">Nothing</div>;
}

function defaultItemRenderer(treeNode: TreeNode) {
  const emoji = treeNode.type === "directory" ? (treeNode.expanded === true ? <FolderOpen size={16} /> : <Folder size={16} />): <File size={16} />;
  return <FileItem icon={emoji} filename={getFileName(treeNode.uri)} />;
}

export const FileTree = forwardRef<List, FileTreeProps>(
  (
    {
      tree,
      draggable,
      hideRoot,
      indent,
      rowHeight,
      indentUnit,
      onContextMenu,
      onItemClick,
      onDrop,
      onDragOver,
      emptyRenderer,
      itemRenderer,
      sorter,
      activatedUri,
    },
    ref
  ) => {
    // If hideRoot is true and tree has children, use those instead
    const treeNodes = hideRoot && tree?.children ? 
      tree.children : 
      (tree ? [tree] : []);
    
    const items = flatTreeData(treeNodes, sorter);

    const itemRender = itemRenderer
      ? (treeNode: TreeNode) => itemRenderer?.(treeNode)
      : defaultItemRenderer;
    const rowRenderer = (params: ListRowProps) => {
      const treeNode = items[params.index];
      const indentNum = indent || 10;
      const baseLevel = hideRoot ? -1 : 0; // Reduce indent level if hiding root
      return (
        <TreeItem
          draggable={draggable}
          key={treeNode.uri}
          indentUnit={indentUnit || "px"}
          indent={indentNum * Math.max(0, calcLevel(treeNode.uri, tree?.uri || "") + baseLevel)}
          style={params.style}
          treeNode={treeNode}
          onContextMenu={onContextMenu}
          treeItemRenderer={itemRender}
          onClick={onItemClick}
          onDragOver={onDragOver}
          activated={treeNode.uri === activatedUri}
          onDrop={onDrop}
        />
      );
    };

    return (
      <AutoSizer>
        {({ height, width }) => (
          <List
            ref={ref}
            className="file-tree pl-4 pr-4 pt-2 pb-2"
            height={height}
            width={width}
            overscanRowCount={30}
            noRowsRenderer={emptyRenderer || defaultEmptyRenderer}
            rowCount={items.length}
            rowHeight={rowHeight || 30}
            rowRenderer={rowRenderer}
            // scrollToIndex={scrollToIndex}
          />
        )}
      </AutoSizer>
    );
  }
);