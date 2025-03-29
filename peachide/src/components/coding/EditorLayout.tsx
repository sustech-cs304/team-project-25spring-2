"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Layout, Model, TabNode, Actions, DockLocation } from 'flexlayout-react';
import MonacoEditorComponent from "@/components/coding/MonacoEditor";
import TerminalComponent from "@/components/coding/Terminal";
import { TreeNode } from "@/components/data/CodeEnvType";
import EditorToolbar from "./EditorToolbar";
import layout from "@/app/layout";

// Default layout configuration
const defaultLayout = {
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
        weight: 100,
        children: [
          {
            type: "tab",
            name: "welcome.js",
            component: "editor",
            config: { filePath: "welcome.js" },
            language: "javascript"
          }
        ]
      }
    ]
  }
};

interface EditorLayoutProps {
  onToggleFileSystemBar: () => void;
  selectedFile?: TreeNode | null;
}

export default function EditorLayout({ onToggleFileSystemBar, selectedFile }: EditorLayoutProps) {
  const [model, setModel] = useState<Model>(() => Model.fromJson(defaultLayout));
  const [showTerminal, setShowTerminal] = useState<boolean>(false);
  const [openFiles, setOpenFiles] = useState<Record<string, string>>({
    "welcome.js": `function hello() {\n  alert('Hello world!');\n}`
  });
  const [currentFile, setCurrentFile] = useState<string | null>("welcome.js");

  // Update code for the current file
  const updateCode = (filePath: string, newCode: string) => {
    setOpenFiles(prev => ({
      ...prev,
      [filePath]: newCode
    }));
  };

  // Get file extension and map to language
  const getLanguageFromFileName = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    const languageMap: Record<string, string> = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'html': 'html',
      'css': 'css',
      'json': 'json',
      'md': 'markdown',
      'py': 'python',
      'java': 'java',
      'c': 'c',
      'cpp': 'cpp',
      'h': 'cpp',
      'hpp': 'cpp'
    };
    
    return languageMap[ext] || 'plaintext';
  };

  // Factory function for creating components in layout
  const factory = (node: TabNode) => {
    const component = node.getComponent();
    const config = node.getConfig() || {};
    const filePath = config.filePath || node.getName();
    const language = node.getExtraData()?.language || getLanguageFromFileName(filePath);

    if (component === "editor") {
      const initialData = openFiles[filePath] || "";
      return (
        <MonacoEditorComponent
          initialData={initialData}
          language={language}
          setCode={(newCode) => updateCode(filePath, newCode)}
        />
      );
    }else if (component === "terminal") {
      return <TerminalComponent />;
    }

    return <div>{node.getName()}</div>;
  };

  // Toggle terminal panel
  const toggleTerminal = () => {
    try {
      if (!showTerminal) {
        model.doAction(Actions.addNode({
            type: "tab",
            name: "Terminal",
            component: "terminal"
        }, "root", DockLocation.BOTTOM, -1));
      } else {
        model.doAction(Actions.deleteTab("root"));
      }
      setShowTerminal(!showTerminal);
    } catch (error) {
      console.error("Error toggling terminal:", error);
    }
  };

  // Handle file opening - defined as a memoized callback
  const openFile = useCallback((treeNode: TreeNode) => {
    if (!treeNode || treeNode.type !== "file") return;

    try {
      const filePath = treeNode.uri;
      
      // Determine language based on file extension
      const language = getLanguageFromFileName(filePath);

      // Check if file is already open by looking for a matching filePath in configs
      let existingTabId: string | undefined;
      
      model.visitNodes(node => {
        if (node.getType() === "tab") {
          const config = node.getConfig();
          if (config && config.filePath === filePath) {
            existingTabId = node.getId();
          }
        }
        return true;
      });

      if (existingTabId) {
        // File is already open, just select the tab
        model.doAction(Actions.selectTab(existingTabId));
      } else {
        // If not already open, add a new tab
        if (!openFiles[filePath]) {setOpenFiles(prev => ({
            ...prev,
            [filePath]: ""
          }));
        }

        // Find the first tabset
        const tabsetId = model.getActiveTabset()?.getId() || 
                         model.getAllNodes().find(node => node.getType() === "tabset")?.getId();

        if (tabsetId) {
          // Add the tab to the tabset
          const newTabJson = {
            type: "tab",
            name: fileName,
            component: "editor",
            config: { filePath },
            language
          };
          
          model.doAction(Actions.addNode(newTabJson, tabsetId, -1, false)); // Add at the end
          
          // Need to wait a bit for the tab to be added before selecting it
          setTimeout(() => {
            // Find and select the newly added tab
            model.visitNodes(node => {
              if (node.getType() === "tab") {
                const config = node.getConfig();
                if (config && config.filePath === filePath) {
                  model.doAction(Actions.selectTab(node.getId()));
                  return false; // Stop visiting
                }
              }
              return true; // Continue visiting
            });
          }, 10);
        }
      }

      setCurrentFile(filePath);
    } catch (error) {
      console.error("Error opening file:", error, treeNode);
    }
  }, [model, openFiles]);

  // React to selectedFile changes
  useEffect(() => {
    if (selectedFile) {
      openFile(selectedFile);
    }
  }, [selectedFile, openFile]);

  // Handle model changes from user interactions
  const handleModelChange = (newModel: Model) => {
    setModel(newModel);
  };

  return (
    <div className="flex-1 border-1 rounded-[var(--radius)] h-full flex flex-col">
      <EditorToolbar 
        onToggleFileSystemBar={onToggleFileSystemBar}
        onToggleTerminal={toggleTerminal}
      />
      <Layout 
        model={model}
        factory={factory}
        onModelChange={handleModelChange}
      />
    </div>
  );
} 