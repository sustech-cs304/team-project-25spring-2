"use client";

import React, { useState, useEffect } from "react";
import { BookCopy, SquareTerminal, FilePlus, FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TreeNode } from "@/components/data/CodeEnvType";
import { FileTreeProps, FileTree } from "@/components/coding/FileStructure";
import { assignTreeNode } from "@/components/coding/FileUtils";
import { Layout, Model, TabNode } from 'flexlayout-react';
import MonacoEditorComponent from "@/components/coding/MonacoEditor";
import { languages } from "monaco-editor";

var json = {
    global: {
		"splitterEnableHandle": true,
		"tabSetEnableActiveIcon": true,
		"tabSetMinWidth": 130,
		"tabSetMinHeight": 100,
		"tabSetEnableTabScrollbar": true,
		"borderMinSize": 100,
		"borderEnableTabScrollbar": true
	},
    borders: [],
    layout: {
        type: "row",
        weight: 100,
        children: [
            {
                type: "tabset",
                weight: 50,
                children: [
                    {
                        type: "tab",
                        name: "safa.js",
                        component: "editor",
                        language: "javascript"
                    }
                ]
            },
            {
                type: "tabset",
                weight: 50,
                children: [
                    {
                        type: "tab",
                        name: "something.js",
                        component: "editor",
                        language: "javascript"
                    }
                ]
            }
        ]
    }
};

function FileSystemBar({ props, isVisible }: { props: React.ComponentProps<any>; isVisible: boolean }) {
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
            <FileTree tree={tree} onItemClick={toggleExpanded} />
        </div>
    );
}

function Editor({ toggleFileSystemBar }: { toggleFileSystemBar: () => void }) {
    const model = Model.fromJson(json);
    const defaultValue = `function hello() {
        alert('Hello world!');
      }`;
    
    const [code, setCode] = useState<string>(defaultValue);

    const factory = (node: TabNode) => {
        var component = node.getComponent();
        var language = node.getExtraData()?.language;

        if (component === "placeholder") {
            return <div>{node.getName()}</div>;
        }

        if (component === "editor") {
            return <MonacoEditorComponent initialData={code} language={language} setCode={setCode} />;
        }
    }

    return (
        <div className="flex-1 border-1 rounded-[var(--radius)] h-full flex flex-col">
            <div className="flex-row items-start flex-none gap-1 p-3">
                <Button onClick={toggleFileSystemBar} variant="ghost" size="icon" className="size-8"><BookCopy /></Button>
                <Button onClick={toggleFileSystemBar} variant="ghost" size="icon" className="size-8"><SquareTerminal /></Button>
            </div>
            <hr className="border-1 flex-none" />
            <Layout model={model} factory={factory} />
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