"use client";

import React, { useState, useEffect } from "react";
import { BookCopy, SquareTerminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { TreeNode } from "@/components/data/CodeEnvType";
import { FileTreeProps, FileTree } from "@/components/coding/FileStructure";
import { assignTreeNode } from "@/components/coding/FileUtils";
import FileItemWithFileIcon from "@/components/coding/FileItemWithFileIcon";

function FileSystemBar({ props, isVisible }: { props: React.ComponentProps<any>; isVisible: boolean }) {
    // const { theme, setTheme } = useTheme();

    const [tree, setTree] = useState<TreeNode|undefined>();

    const loadTree = () => {
        return import("./tree.json").then((module) => module.default as TreeNode);
    };

    useEffect(() => {
        loadTree()
        .then((tree) => Object.assign(tree, { expanded: true }))
        .then(setTree);
    }, []);

    const toggleExpanded: FileTreeProps["onItemClick"] = (treeNode) => {
        setTree((tree) =>
            assignTreeNode(tree, treeNode.uri, {
                expanded: !treeNode.expanded
            })
        );
    };

    const itemRenderer = (treeNode: TreeNode) => <FileItemWithFileIcon treeNode={treeNode} />

    return (
        <div className={`border-1 rounded-[var(--radius)] pl-4
            transition-all duration-300 ${isVisible ? 'w-1/6 mr-3 opacity-100' : 'w-0 opacity-0'} 
            overflow-hidden`}>
            <div className="pt-4 pr-4 pb-4">CodeSpace</div>
            <hr className="border-1" />
            <FileTree tree={tree} onItemClick={toggleExpanded} itemRenderer={itemRenderer} />
        </div>
    );
}

function Editor({ toggleFileSystemBar }: { toggleFileSystemBar: () => void }) {
    return (
        <div className="flex-1 border-1 rounded-[var(--radius)]">
            <div className="flex-row items-start flex gap-1 p-3">
                <Button onClick={toggleFileSystemBar} variant="ghost" size="icon" className="size-8"><BookCopy /></Button>
                <Button onClick={toggleFileSystemBar} variant="ghost" size="icon" className="size-8"><SquareTerminal /></Button>
            </div>
            <hr className="border-1" />
            <div className="p-5">   
                Editor
            </div>
        </div>
    );
}

export default function Coding() {
    const [isFileSystemBarVisible, setFileSystemBarVisible] = useState(true);

    const toggleFileSystemBar = () => {
        setFileSystemBarVisible(!isFileSystemBarVisible);
    };

    return (
        <div className="flex h-full">
            <FileSystemBar props={{ id: "1", pathname: "/coding/1" }} isVisible={isFileSystemBarVisible} />
            <Editor toggleFileSystemBar={toggleFileSystemBar} />
        </div>
    );
}