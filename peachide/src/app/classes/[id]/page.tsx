"use client";

import React, { useState, useEffect } from "react";
import { BookCopy, SquareTerminal, FilePlus, FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TreeNode } from "@/components/data/CodeEnvType";
import { FileTreeProps, FileTree } from "@/components/coding/FileStructure";
import { assignTreeNode } from "@/components/coding/FileUtils";
import { Layout, Model, TabNode } from 'flexlayout-react';

function ClassesLeftBar({ props, isVisible }: { props: React.ComponentProps<any>; isVisible: boolean }) {


    return (
            <div className={`border-1 rounded-[var(--radius)]
            transition-all duration-300 ${isVisible ? 'w-1/5 mr-3 opacity-100' : 'w-0 opacity-0'} 
            overflow-hidden`}>
                <div className="flex flex-row p-3 items-center">
                    <div className="flex-1">Classes List</div>
                    {/*<Button variant="ghost" size="icon" className="size-8 flex-none ml-auto"><FilePlus /></Button>*/}
                    {/*<Button variant="ghost" size="icon" className="size-8 flex-none ml-auto"><FolderPlus /></Button>*/}
                </div>
                <hr className="border-1" />
            </div>
    );
}

function ClassesRightBar({ props, isVisible }: { props: React.ComponentProps<any>; isVisible: boolean }) {


    return (
            <div className="flex-1 border-1 rounded-[var(--radius)] h-full flex flex-col">
                <div className="flex-row items-start flex-none gap-1 p-3">
                    Class Info
                </div>
                <hr className="border-1 flex-none" />
            </div>
    );
}



export default function ClassesLoading() {

    return (
            <div className="flex h-full">
                <ClassesLeftBar props={{ id: "1", pathname: "/coding/1" }} isVisible={true} />
                {/*<Editor toggleFileSystemBar={toggleFileSystemBar} />*/}
                <ClassesRightBar props={{id:"1"}} isVisible={true}>

                </ClassesRightBar>
            </div>
    );
}