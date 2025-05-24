export const defaultLayout = {
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

export const getEditorLayout = async (env_id: string) => {
  try {
    const response = await fetch(
      process.env.NEXT_PUBLIC_API_URL + `/environment/${env_id}/layout`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      return defaultLayout;
    }

    const data = await response.json();

    if (!data || !("layout" in data)) {
      return defaultLayout;
    }

    const layout = data.layout;

    if (
      layout == null ||
      (typeof layout === 'string' && layout.trim() === '') ||
      (typeof layout === 'object' && Object.keys(layout).length === 0)
    ) {
      return defaultLayout;
    }

    return layout;
  } catch (e) {
    return defaultLayout;
  }
};

export const saveEditorLayout = async (env_id: string, layout: string) => {
  const response = await fetch(process.env.NEXT_PUBLIC_API_URL + `/environment/${env_id}/layout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ layout })
  });

  if (!response.ok) {
    throw new Error('Failed to save layout');
  }
  return;
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