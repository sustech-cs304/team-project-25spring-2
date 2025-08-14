import { TreeNode } from "@/components/data/CodeEnvType";
import { useEffect, useState } from 'react';

const STORAGE_PREFIX = 'codefs:';
const CONTENT_PREFIX = 'codecontent:';

const getStorageKey = (projectId: string) => `${STORAGE_PREFIX}${projectId}`;

const defaultRootTree = (): TreeNode => ({
  type: "directory",
  uri: "/",
  expanded: true,
  children: []
});

const readTreeFromLocalStorage = (projectId: string): TreeNode => {
  try {
    const key = getStorageKey(projectId);
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
    if (!raw) {
      const tree = defaultRootTree();
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(tree));
      }
      return tree;
    }
    const parsed = JSON.parse(raw);
    return parsed as TreeNode;
  } catch (e) {
    return defaultRootTree();
  }
};

const writeTreeToLocalStorage = (projectId: string, tree: TreeNode) => {
  try {
    const key = getStorageKey(projectId);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, JSON.stringify(tree));
    }
  } catch (e) {
    // swallow
  }
};

export const saveTree = (env_id: string, tree: TreeNode) => {
  writeTreeToLocalStorage(env_id, tree);
};

export function useTree(projectId: string, token: string | null) {
  const [fileTree, setFileTree] = useState<TreeNode | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<unknown>(null);

  useEffect(() => {
    try {
      setIsLoading(true);
      const tree = readTreeFromLocalStorage(projectId);
      setFileTree(tree);
      setIsError(null);
    } catch (e) {
      setIsError(e);
    } finally {
      setIsLoading(false);
    }

    const onStorage = (event: StorageEvent) => {
      const key = getStorageKey(projectId);
      if (event.key === key && event.newValue) {
        try {
          const next = JSON.parse(event.newValue) as TreeNode;
          setFileTree(next);
        } catch {
          // ignore
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', onStorage);
      return () => window.removeEventListener('storage', onStorage);
    }
  }, [projectId]);

  return { fileTree, isLoading, isError };
}

export const fileExists = (node: TreeNode, uri: string): boolean => {
  if (node.uri === uri) return true;
  if (node.children) return node.children.some(child => fileExists(child, uri));
  return false;
};

export const findNode = (node: TreeNode, uri: string): TreeNode | undefined => {
  if (node.uri === uri) return node;
  if (node.children) {
    for (const child of node.children) {
      const found = findNode(child, uri);
      if (found) return found;
    }
  }
  return undefined;
};

export const folderExists = (node: TreeNode, uri: string): boolean => {
  if (node.uri === uri) return true;
  if (node.children) return node.children.some(child => child.type === "directory" && folderExists(child, uri));
  return false;
};

export const addFileToDir = (node: TreeNode, targetDirUri: string, fileNode: TreeNode): boolean => {
  if (node.uri === targetDirUri) {
    if (!node.children) node.children = [];
    node.children.push(fileNode);
    return true;
  }

  if (node.children) {
    for (const child of node.children) {
      if (addFileToDir(child, targetDirUri, fileNode)) {
        return true;
      }
    }
  }

  return false;
};

export const addFolderToDir = (node: TreeNode, targetDirUri: string, folderNode: TreeNode): boolean => {
  if (node.uri === targetDirUri) {
    if (!node.children) node.children = [];
    node.children.push(folderNode);
    return true;
  }

  if (node.children) {
    for (const child of node.children) {
      if (addFolderToDir(child, targetDirUri, folderNode)) {
        return true;
      }
    }
  }

  return false;
};

export const removeNode = (node: TreeNode, uri: string): TreeNode => {
  if (node.children) {
    const index = node.children.findIndex(child => child.uri === uri);
    if (index !== -1) {
      node.children.splice(index, 1);
      return node;
    }

    for (let i = 0; i < node.children.length; i++) {
      if (removeNode(node.children[i], uri)) {
        return node;
      }
    }
  }
  return node;
};

export const updateUrisRecursively = (node: TreeNode, oldBaseUri: string, newBaseUri: string): TreeNode => {
  const updatedNode = {
    ...node,
    uri: node.uri.replace(oldBaseUri, newBaseUri)
  };

  if (updatedNode.children && updatedNode.children.length > 0) {
    updatedNode.children = updatedNode.children.map(child =>
      updateUrisRecursively(child, oldBaseUri, newBaseUri)
    );
  }

  return updatedNode;
};

export const addNodeToTarget = (node: TreeNode, targetUri: string, nodeToAdd: TreeNode, fromUri: string, newUri: string): TreeNode => {
  if (node.uri === targetUri) {
    if (!node.children) node.children = [];

    const updatedNodeToAdd = updateUrisRecursively(nodeToAdd, fromUri, newUri);

    node.children.push(updatedNodeToAdd);
    return node;
  }

  if (node.children) {
    for (let i = 0; i < node.children.length; i++) {
      if (addNodeToTarget(node.children[i], targetUri, nodeToAdd, fromUri, newUri)) {
        return node;
      }
    }
  }
  return node;
};

export const deleteNode = (node: TreeNode, uri: string): TreeNode => {
  if (node.children) {
    const index = node.children.findIndex(child => child.uri === uri);
    if (index !== -1) {
      node.children.splice(index, 1);
      return node;
    }

    for (let i = 0; i < node.children.length; i++) {
      node.children[i] = deleteNode(node.children[i], uri);
    }
  }
  return node;
};

export const createFile = (file_path: string, file_name: string, token: string | null, env_id: string) => {
  const tree = readTreeFromLocalStorage(env_id);
  const newFileNode: TreeNode = { type: "file", uri: file_path + (file_path.endsWith("/") ? "" : "/") + file_name };
  addFileToDir(tree, file_path, newFileNode);
  writeTreeToLocalStorage(env_id, tree);
  // initialize empty content for new file
  try {
    if (typeof window !== 'undefined') {
      const key = `${CONTENT_PREFIX}${env_id}:${newFileNode.uri}`;
      if (window.localStorage.getItem(key) === null) {
        window.localStorage.setItem(key, "");
      }
    }
  } catch {}
}

export const createDirectory = (uri: string, token: string | null, env_id: string) => {
  const tree = readTreeFromLocalStorage(env_id);
  const newFolderNode: TreeNode = { type: "directory", uri, children: [], expanded: true };
  addFolderToDir(tree, uri.substring(0, uri.lastIndexOf("/")) || "/", newFolderNode);
  writeTreeToLocalStorage(env_id, tree);
}

export const mvPath = (fromUri: string, toUri: string, token: string | null, env_id: string) => {
  const tree = readTreeFromLocalStorage(env_id);
  const sourceNode = findNode(tree, fromUri);
  if (!sourceNode) {
    writeTreeToLocalStorage(env_id, tree);
    return;
  }
  const fileName = fromUri.split('/').pop() || "";
  const newUri = toUri + '/' + fileName;
  removeNode(tree, fromUri);
  addNodeToTarget(tree, toUri, sourceNode, fromUri, newUri);
  // migrate content in localStorage if any
  try {
    if (typeof window !== 'undefined') {
      const envPrefix = `${CONTENT_PREFIX}${env_id}:`;
      if (sourceNode.type === 'file') {
        const oldKey = envPrefix + fromUri;
        const newKey = envPrefix + newUri;
        const content = window.localStorage.getItem(oldKey);
        if (content !== null) {
          window.localStorage.setItem(newKey, content);
          window.localStorage.removeItem(oldKey);
        }
      } else if (sourceNode.type === 'directory') {
        const keysToMove: string[] = [];
        for (let i = 0; i < window.localStorage.length; i++) {
          const key = window.localStorage.key(i);
          if (!key || !key.startsWith(envPrefix)) continue;
          const path = key.slice(envPrefix.length);
          if (path === fromUri || path.startsWith(fromUri + '/')) {
            keysToMove.push(key);
          }
        }
        keysToMove.forEach((oldKey) => {
          const oldPath = oldKey.slice(envPrefix.length);
          const newPath = oldPath.replace(fromUri, newUri);
          const newKey = envPrefix + newPath;
          const content = window.localStorage.getItem(oldKey);
          if (content !== null) {
            window.localStorage.setItem(newKey, content);
            window.localStorage.removeItem(oldKey);
          }
        });
      }
    }
  } catch {}
  writeTreeToLocalStorage(env_id, tree);
}

export const rmPath = (uri: string, token: string | null, env_id: string) => {
  const tree = readTreeFromLocalStorage(env_id);
  const updated = deleteNode(tree, uri);
  writeTreeToLocalStorage(env_id, updated);
  // remove content for file or directory subtree
  try {
    if (typeof window !== 'undefined') {
      const envPrefix = `${CONTENT_PREFIX}${env_id}:`;
      const keysToRemove: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (!key || !key.startsWith(envPrefix)) continue;
        const path = key.slice(envPrefix.length);
        if (path === uri || path.startsWith(uri + '/')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => window.localStorage.removeItem(key));
    }
  } catch {}
}