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

export const getEditorLayout = async (env_id: string, token: string | null) => {
  try {
    const response = await fetch(
      process.env.NEXT_PUBLIC_API_URL + `/environment/${env_id}/layout`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
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

export const saveEditorLayout = async (env_id: string, layout: string, token: string | null) => {
  const formData = new FormData();
  formData.append('layout', layout);
  const response = await fetch(process.env.NEXT_PUBLIC_API_URL + `/environment/${env_id}/layout`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData
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