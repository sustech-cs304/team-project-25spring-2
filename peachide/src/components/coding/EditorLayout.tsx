"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Node, Layout, Model, TabNode, Actions, DockLocation } from 'flexlayout-react';
import MonacoEditorComponent from "@/components/coding/MonacoEditor";
import TerminalComponent from "@/components/coding/Terminal";
import { TreeNode, languageMap } from "@/components/data/CodeEnvType";
import EditorToolbar from "./EditorToolbar";
import { PDFPart } from "@/components/pdf/PDFPart";

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
        id: "main",
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

// Mock function to load file content - replace with actual API call later
const loadFileContent = async (filePath: string): Promise<string> => {
  // This is a mock function that returns dummy content based on file type
  // In a real implementation, this would call an API to fetch file content
  const ext = filePath.split('.').pop()?.toLowerCase() || '';
  // Return some sample content based on file extension
  switch (ext) {
    case 'js':
    case 'jsx':
      return `// JavaScript file: ${filePath}\n\nfunction hello() {\n  console.log("Hello from ${filePath}");\n}\n\nexport default hello;`;
    case 'ts':
    case 'tsx':
      return `// TypeScript file: ${filePath}\n\nfunction hello(): void {\n  console.log("Hello from ${filePath}");\n}\n\nexport default hello;`;
    case 'html':
      return `<!DOCTYPE html>\n<html>\n<head>\n  <title>${filePath}</title>\n</head>\n<body>\n  <h1>Hello from ${filePath}</h1>\n</body>\n</html>`;
    case 'css':
      return `/* CSS file: ${filePath} */\n\nbody {\n  font-family: sans-serif;\n  margin: 0;\n  padding: 20px;\n}`;
    case 'json':
      return `{\n  "name": "${filePath}",\n  "description": "Sample JSON file"\n}`;
    case 'md':
      return `# ${filePath}\n\nThis is a sample Markdown file.\n\n## Features\n\n- Feature 1\n- Feature 2`;
    default:
      return `// File content for ${filePath}`;
  }
};

export default function EditorLayout({ onToggleFileSystemBar, selectedFile }: EditorLayoutProps) {
  const [model, setModel] = useState<Model>(() => Model.fromJson(defaultLayout));
  const [showTerminal, setShowTerminal] = useState<boolean>(false);
  const [openFiles, setOpenFiles] = useState<Record<string, string>>({
    "welcome.js": `function hello() {\n  alert('Hello world!');\n}`
  });
  const [currentFile, setCurrentFile] = useState<string | null>("welcome.js");
  const layoutRef = useRef<Layout>(null);
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);

  // Change Listener: Detect Tab Action and conduct according actions
  useEffect(() => {
    const handleModelChange = (action: any) => {
      // Check if a tab is being deleted
      if (action.type === Actions.DELETE_TAB) {
        const tabId = action.data.node;
        // Check if the deleted tab is the terminal tab
        if (tabId === "terminal-panel") {
          setShowTerminal(false);
        }
      }
    };

    model.addChangeListener(handleModelChange);
    
    // Clean up listener when component unmounts or model changes
    return () => {
      model.removeChangeListener(handleModelChange);
    };
  }, [model]);

  // Get file extension and map to language
  const getLanguageFromFileName = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
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
      // Use a unique key with a timestamp to ensure component is always recreated when moved
      const nodeId = `${node.getId()}-${Date.now()}`;
      return (
        <div key={nodeId} className="h-full w-full">
          <MonacoEditorComponent 
            initialData={initialData} 
            language={language} 
          />
        </div>
      );
    } else if (component === "terminal") {
      return <TerminalComponent />;
    } else if (component === "pdf") {
      return (
        <div className="h-full w-full">
          <PDFPart 
            props={{
              url: config.url || filePath,
              pageNumber: config.pageNumber || 1,
            }} 
            onFeedbackAction={() => {}} 
          />
        </div>
      );
    }

    return <div>{node.getName()}</div>;
  };

  // Toggle terminal panel
  const toggleTerminal = () => {
    try {
      // Check actual state instead of relying on showTerminal
      const terminalVisible = showTerminal;
      
      if (!terminalVisible) {
        // Find the main tabset ID to use as reference for adding
        const terminalNode = {
          type: "tab",
          name: "Terminal",
          component: "terminal",
          id: "terminal-panel",
          config: {}
        };

        model.doAction(Actions.addNode(terminalNode, model.getRoot().getId(), DockLocation.BOTTOM, 0, true));
        setShowTerminal(true);
      } else {
        // Find and remove the terminal tabset
        model.visitNodes((node) => {
          if (node.getId() === "terminal-panel") {
            model.doAction(Actions.deleteTab(node.getId()));
            return false; // Stop visiting
          }
          return true;
        });
        setShowTerminal(false);
      }
    } catch (error) {
      console.error("Error toggling terminal:", error);
    }
  };

  // Handle file opening - defined as a memoized callback
  const openFile = useCallback(async (treeNode: TreeNode) => {
    if (!treeNode || treeNode.type !== "file") return;
    try {
      const filePath = treeNode.uri;
      const fileName = filePath.split('/').pop() || filePath;
      
      // Determine language based on file extension
      const language = getLanguageFromFileName(filePath);
      const isPDF = language === 'pdf';

      // Check if file is already open by looking for a matching filePath in configs
      let existingTabId: string | undefined;
      
      model.visitNodes(node => {
        if (node.getType() === "tab") {
          const tabNode = node as TabNode;
          const config = tabNode.getConfig();
          if (config && config.filePath === filePath) {
            existingTabId = node.getId();
          }
        }
        return true;
      });

      // Load file content if not already loaded (for non-PDF files)
      if (!openFiles[filePath] && !isPDF) {
        try {
          const content = await loadFileContent(filePath);
          setOpenFiles(prev => ({
            ...prev,
            [filePath]: content
          }));
        } catch (error) {
          console.error("Error loading file content:", error);
          setOpenFiles(prev => ({
            ...prev,
            [filePath]: `// Error loading file content for ${filePath}`
          }));
        }
      }

      if (existingTabId) {
        // File is already open, just select the tab
        model.doAction(Actions.selectTab(existingTabId));
      } else {
        // Find the first tabset
        let tabsetId: string | undefined;
        const activeTabset = model.getActiveTabset();
        
        if (activeTabset) {
          tabsetId = activeTabset.getId();
        } else {
          // Find the main tabset if it exists
          model.visitNodes(node => {
            if (node.getType() === "tabset") {
              if (!tabsetId) {
                tabsetId = node.getId();
              }
            }
            return true;
          });
        }

        if (tabsetId) {
          // Add the tab to the tabset
          const newTabJson = {
            type: "tab",
            name: fileName,
            component: isPDF ? "pdf" : "editor",
            config: { filePath, url: isPDF ? filePath : undefined },
            language
          };
          
          model.doAction(Actions.addNode(newTabJson, tabsetId, DockLocation.CENTER, -1, true));
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

  // Add a custom action handler to properly manage component lifecycle
  const onAction = (action: any) => {
    // Check if the action is related to layout changes that require editor refresh
    if (action.type === Actions.MOVE_NODE) {
      
      // For move operations, we want to make sure editors have time to re-render before being accessed
      const result = action;
      
      // Schedule a layout refresh for all editors
      setTimeout(() => {
        // Find all Monaco editor instances and reset their layout
        document.querySelectorAll('.monaco-editor').forEach(editor => {
          try {
            const editorInstance = (editor as any)._dataEditor;
            if (editorInstance && typeof editorInstance.layout === 'function') {
              editorInstance.layout();
            }
          } catch (err) {
            // Ignore errors, just a safety mechanism
          }
        });
      }, 100);
      
      return result;
    }
    
    // For any other action, just return it unchanged
    return action;
  };

  // Handle external drag according to flexlayout's expected format
  const handleExternalDrag = (event: React.DragEvent<HTMLElement>) => {
    if (event.dataTransfer.types.indexOf('application/json') < 0) return;
    event.dataTransfer.dropEffect = 'link';
    return {
      dragText: `Drag New File`,
      json: {
        type: "tab",
        name: "New File",
        component: "editor", 
        config: { filePath: "New File", url: undefined },
        language: "plaintext",
      },
      onDrop: (node?: Node, event?: React.DragEvent<HTMLElement>) => {
        if (!node || !event) return; // Aborted drag
        const uri = event.dataTransfer.getData("text/plain");
        const language = getLanguageFromFileName(uri);
        const isPDF = language === 'pdf';
        model.doAction(Actions.updateNodeAttributes(node.getId(), {
          name: uri.split('/').pop() || uri,
          component: isPDF ? "pdf" : "editor",
          config: { filePath: uri, url: isPDF ? uri : undefined },
          language
        }));
      }
    };
  };

  return (
    <div className="flex-1 border-1 rounded-[var(--radius)] h-full flex flex-col">
      <EditorToolbar 
        onToggleFileSystemBar={onToggleFileSystemBar}
        onToggleTerminal={toggleTerminal}
      />
      <Layout 
        ref={layoutRef}
        model={model}
        factory={factory}
        onModelChange={handleModelChange}
        onAction={onAction}
        onExternalDrag={handleExternalDrag}
      />
    </div>
  );
} 