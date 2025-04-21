"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Node, Layout, Model, TabNode, Actions, DockLocation } from 'flexlayout-react';
import TerminalComponent from "@/components/coding/Terminal";
import { TreeNode } from "@/components/data/CodeEnvType";
import EditorToolbar from "./EditorToolbar";
import { PDFComponent } from "@/components/pdf/PDFComponent";
import { getLanguageFromFileName, loadFileContent } from "../data/EditorLayoutData";
import CollaboratedEditorComponent from "./CollaboratedEditor";

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
        children: []
      }
    ]
  }
};

interface EditorLayoutProps {
  projectId: string;
  onToggleFileSystemBar: () => void;
  selectedFile?: TreeNode | null;
}

const EditorLayout = ({ projectId, onToggleFileSystemBar, selectedFile }: EditorLayoutProps) => {
  const [model, setModel] = useState<Model>(() => Model.fromJson(defaultLayout));
  const [showTerminal, setShowTerminal] = useState<boolean>(false);
  const [openFiles, setOpenFiles] = useState<Record<string, string>>({});
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
      console.error("Error toggling terminal: ", error);
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
        return <CollaboratedEditorComponent initialData={openFiles[filePath]} language={language} onSave={handleSave} roomName={filePath} />;
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
          const content = await loadFileContent(projectId, filePath);
          setOpenFiles(prev => ({
            ...prev,
            [filePath]: content
          }));
        } catch (error) {
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

  const handleModelChange = (newModel: Model) => {
    setModel(newModel);
  };

  const handleAction = (action: any) => {
    if (action.type === Actions.DELETE_TAB) {
      const tabId = action.data.node;
      if (tabId === "terminal-panel") {
        setShowTerminal(false);
      }
      if (currentFile === action.data.node) {
        setCurrentFile(null);
      }
    } else if (action.type === Actions.MOVE_NODE) {
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
        onAction={handleAction}
        onModelChange={handleModelChange}
        onExternalDrag={handleExternalDrag}
      />
    </div>
  );
} 

export default EditorLayout;