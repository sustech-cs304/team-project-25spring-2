"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Node, Layout, Model, TabNode, Actions, DockLocation } from 'flexlayout-react';
import TerminalComponent from "@/components/coding/Terminal";
import { TreeNode } from "@/components/data/CodeEnvType";
import EditorToolbar from "./EditorToolbar";
import { PDFComponent } from "@/components/pdf/PDFComponent";
import { defaultLayout, getEditorLayout, getLanguageFromFileName, saveEditorLayout } from "../data/EditorLayoutData";
import CollaboratedEditorComponent from "./CollaboratedEditor";
import { UserInfo } from "./CollaboratedEditor";

interface EditorLayoutProps {
  environmentId: string;
  onToggleFileSystemBar: () => void;
  selectedFile?: TreeNode | null;
}

const EditorLayout = ({ environmentId, onToggleFileSystemBar, selectedFile }: EditorLayoutProps) => {
  const [model, setModel] = useState<Model>(() => Model.fromJson(defaultLayout));
  const [showTerminal, setShowTerminal] = useState<boolean>(false);
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [activeUsersByEditor, setActiveUsersByEditor] = useState<Record<string, UserInfo[]>>({});
  const layoutRef = useRef<Layout>(null);

  useEffect(() => {
    getEditorLayout(environmentId).then(layout => {
      setModel(Model.fromJson(layout));
    });

    return () => {
      saveEditorLayout(environmentId, JSON.stringify(model.toJson()));
    };
  }, [environmentId, model]);

  const handleEditorUsersChange = useCallback((editorId: string, users: UserInfo[]) => {
    setActiveUsersByEditor(prev => {
      const newState = { ...prev };
      if (users.length > 0) {
        newState[editorId] = users;
      } else {
        delete newState[editorId];
      }
      return newState;
    });
  }, []);

  const editingUsers = useMemo(() => {
    const allUsers = Object.values(activeUsersByEditor).flat();
    const uniqueUsers = Array.from(new Map(allUsers.map(user => [user.name, user])).values());
    return uniqueUsers;
  }, [activeUsersByEditor]);

  const onToggleTerminal = () => {
    try {
      const terminalVisible = showTerminal;
      if (!terminalVisible) {
        model.doAction(Actions.addNode({ type: "tab", name: "Terminal", component: "terminal", id: "terminal-panel" }, model.getRoot().getId(), DockLocation.BOTTOM, 0, true));
        setShowTerminal(true);
      } else {
        model.doAction(Actions.deleteTab("terminal-panel"));
        setShowTerminal(false);
      }
    } catch (error) {
      console.error("Error toggling terminal: ", error);
    }
  };

  const factory = useCallback((node: TabNode) => {
    const component = node.getComponent();
    const config = node.getConfig() || {};
    const filePath = config.filePath || node.getName();
    const language = config.language || getLanguageFromFileName(filePath);
    const wsUrl = process.env.NEXT_PUBLIC_API_URL + `/environment/${environmentId}/wsurl`;
    switch (component) {
      case 'editor':
        return <CollaboratedEditorComponent
          wsUrl={wsUrl}
          language={language}
          roomName={filePath}
          onUsersChange={handleEditorUsersChange}
        />;
      case 'terminal':
        return <TerminalComponent env_id={environmentId} />;
      case 'pdf':
        return <PDFComponent env_id={environmentId} file_path={config.filePath} />;
      default:
        return <div className="flex-1 border-1 rounded-[var(--radius)] h-full flex flex-col">Loading...</div>;
    }
  }, [handleEditorUsersChange]);

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
  }, [model]);

  useEffect(() => {
    if (selectedFile) {
      openFile(selectedFile);
    }
  }, [selectedFile, openFile]);

  const handleModelChange = (newModel: Model) => {
    setModel(newModel);
  };

  const handleAction = (action: any) => {
    let processedAction = action;
    if (action.type === Actions.DELETE_TAB) {
      const deletedNodeId = action.data.node;
      let deletedFilePath: string | undefined;

      const nodeToDelete = model.getNodeById(deletedNodeId);

      if (nodeToDelete && nodeToDelete.getType() === 'tab') {
        const tabNode = nodeToDelete as TabNode;
        const config = tabNode.getConfig();
        const component = tabNode.getComponent();

        if (component === 'editor' && config && config.filePath) {
          deletedFilePath = config.filePath;
          if (currentFile === deletedFilePath) {
            setCurrentFile(null);
          }
        } else if (component === 'terminal') {
          setShowTerminal(false);
        }
      }

      if (deletedFilePath) {
        setActiveUsersByEditor(prev => {
          const newState = { ...prev };
          delete newState[deletedFilePath];
          return newState;
        });
      }
      if (deletedNodeId === "terminal-panel") {
        setShowTerminal(false);
      }

    } else if (action.type === Actions.SELECT_TAB) {
      const selectedNode = model.getNodeById(action.data.tabNode);
      if (selectedNode && selectedNode.getType() === 'tab') {
        const config = (selectedNode as TabNode).getConfig();
        if (config && config.filePath) {
          setCurrentFile(config.filePath);
        }
      }
    }
    return processedAction;
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
        editingUsers={editingUsers}
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