import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const getEditorLayout = (projectId: string) => {
  const { data, error, isLoading } = useSWR(process.env.NEXT_PUBLIC_API_URL + `/environment/${projectId}/layout`, fetcher);
  return {
    data,
    error,
    isLoading
  };
};

export const loadFileContent = async (projectId: string, filePath: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/environment/${projectId}/file?path=${encodeURIComponent(filePath)}`);
    if (!response.ok) {
        throw new Error(`Failed to load file: ${response.status} ${response.statusText}`);
    }
    const data = await response.text();
    return data;
};

export const getLanguageFromFileName = (fileName: string): string => {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  return languageMap[ext] || 'plaintext';
};

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
  'hpp': 'cpp',
  'pdf': 'pdf'
};