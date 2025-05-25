export var defaultLayout = {
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