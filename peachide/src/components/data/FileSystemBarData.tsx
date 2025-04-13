import { SERVER, TreeNode } from "@/components/data/CodeEnvType";
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useTree(projectId: string) {
  const { data, error, isLoading } = useSWR(process.env.NEXT_PUBLIC_API_URL + `/environment/${projectId}/files`, fetcher);
  return {
    fileTree: data,
    isLoading: isLoading,
    isError: error
  };
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
