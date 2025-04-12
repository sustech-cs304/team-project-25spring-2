"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Node, Layout, Model, TabNode, Actions, DockLocation } from 'flexlayout-react';
import MonacoEditorComponent from "@/components/coding/MonacoEditor";
import TerminalComponent from "@/components/coding/Terminal";
import { TreeNode, TreeNodeType, languageMap } from "@/components/data/CodeEnvType";
import EditorToolbar from "./EditorToolbar";
import { PDFComponent } from "@/components/pdf/PDFComponent";

// Default layout configuration
var defaultLayout = {
  global: {
    "splitterEnableHandle": true,
    "tabSetEnableActiveIcon": true,
    "tabSetMinWidth": 130,
    "tabSetMinHeight": 100,
    "tabSetEnableTabScrollbar": true,
    "borderMinSize": 100,
    "borderEnableTabScrollbar": true,
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
            id: "welcome.js",
            name: "welcome.js",
            component: "editor",
            config: { 
              filePath: "welcome.js", 
              language: "javascript" 
            },
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

const loadFileContent = async (filePath: string): Promise<string> => {
  const ext = filePath.split('.').pop()?.toLowerCase() || '';
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

const getLanguageFromFileName = (fileName: string): string => {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  return languageMap[ext] || 'plaintext';
};

const EditorLayout = ({ onToggleFileSystemBar, selectedFile }: EditorLayoutProps) => {
  const [model, setModel] = useState<Model>(() => Model.fromJson(defaultLayout));
  const [showTerminal, setShowTerminal] = useState<boolean>(false);
  const [openFiles, setOpenFiles] = useState<Record<string, string>>({
    "welcome.js": `function hello() {\n  alert('Hello world!');\n}`
  });
  const [currentFile, setCurrentFile] = useState<string | null>("welcome.js");
  const layoutRef = useRef<Layout>(null);

  const onToggleTerminal = () => {
    try {
      const terminalVisible = showTerminal;
      if (!terminalVisible) {
        model.doAction(Actions.addNode({type: "tab", name: "Terminal", component: "terminal", id: "terminal-panel"}, model.getRoot().getId(), DockLocation.BOTTOM, 0, true));
        setShowTerminal(true);
      } else {
        model.doAction(Actions.deleteTab("terminal-panel"));
        setShowTerminal(false);
      }
    } catch (error) {
      console.error("Error toggling terminal:", error);
    }
  };

  const handleSave = (content: string) => {
    if(currentFile){
      setOpenFiles(prev => ({
        ...prev,
        [currentFile]: content
      }));
    }
  };
  
  const factory = useCallback((node: TabNode) => {
    const component = node.getComponent();
    const config = node.getConfig() || {};
    const filePath = config.filePath || node.getName();
    const language = config.language || getLanguageFromFileName(filePath);

    switch(component) {
      case 'editor':
        return <MonacoEditorComponent initialData={openFiles[filePath]} language={language} onSave={handleSave} />;
      case 'terminal':
        return <TerminalComponent />;
      case 'pdf':
        return <PDFComponent props={{ url: config.filePath, pageNumber: config.pageNumber || 1 }} onFeedbackAction={() => {}} />;
      default:
        return <div>Loading...</div>;
    }
  }, [openFiles, handleSave]);

  const openFile = useCallback(async (treeNode: TreeNode) => {
    if (!treeNode || treeNode.type !== "file") return;
    try {
      const filePath = treeNode.uri;
      const fileName = filePath.split('/').pop() || filePath;
      const language = getLanguageFromFileName(filePath);
      const isPDF = language === 'pdf';

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
        model.doAction(Actions.selectTab(existingTabId));
      } else {
        let tabsetId: string | undefined;
        const activeTabset = model.getActiveTabset();
        
        if (activeTabset) {
          tabsetId = activeTabset.getId();
        } else {
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
          const newTabJson = {
            type: "tab",
            name: fileName,
            component: isPDF ? "pdf" : "editor",
            config: { 
              filePath, 
              language
            }
          };
          model.doAction(Actions.addNode(newTabJson, tabsetId, DockLocation.CENTER, -1, true));
        }
      }
      setCurrentFile(filePath);
    } catch (error) {
      console.error("Error opening file:", error, treeNode);
    }
  }, [model, openFiles]);

  useEffect(() => {
    if (selectedFile) {
      openFile(selectedFile);
    }
  }, [selectedFile, openFile]);

  // Handle model changes from user interactions
  const handleModelChange = (newModel: Model) => {
    setModel(newModel);
  };

  const onAction = (action: any) => {
    if (action.type === Actions.DELETE_TAB) {
      const tabId = action.data.node;
      if (tabId === "terminal-panel") {
        setShowTerminal(false);
      }
      if (currentFile === action.data.node) {
        setCurrentFile(null);
      }
    } else if (action.type === Actions.MOVE_NODE) {
      console.log("[onAction] Move node ", action.data)
      setCurrentFile(action.data.node);
    }
    return action;
  };

  const handleExternalDrag = (event: React.DragEvent<HTMLElement>) => {
    const validTypes = ["text/plain"];
    if (event.dataTransfer.types.find(t => validTypes.indexOf(t) !== -1) === undefined) return;
    event.dataTransfer.dropEffect = 'link';
    return {
      json: {
        type: "tab",
        component: "editor",
      },
      onDrop: (node?: Node, event?: React.DragEvent<HTMLElement>) => {
        if (!node || !event) return;
        const uri = event.dataTransfer.getData("text/plain");
        const language = getLanguageFromFileName(uri);
        const isPDF = language === 'pdf';
        model.doAction(Actions.updateNodeAttributes(node.getId(), {
          name: uri.split('/').pop() || uri,
          component: isPDF ? "pdf" : "editor", 
          config: {
            filePath: uri,
            language: language
          },
        }));
        openFile({ type: "file", uri });
      }
    }
  };

  return (
    <div className="flex-1 border-1 rounded-[var(--radius)] h-full flex flex-col">
      <EditorToolbar 
        onToggleFileSystemBar={onToggleFileSystemBar}
        onToggleTerminal={onToggleTerminal}
      />
      <Layout 
        ref={layoutRef}
        model={model}
        factory={factory}
        onAction={onAction}
        onModelChange={handleModelChange}
        onExternalDrag={handleExternalDrag}
      />
    </div>
  );
} 

export default EditorLayout;