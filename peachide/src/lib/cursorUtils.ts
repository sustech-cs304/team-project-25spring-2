/**
 * 创建或更新用户光标的样式
 * @param clientID 用户的客户端ID
 * @param color 用户的颜色
 * @param name 用户的名字
 */
export function updateUserCursorStyle(clientID: number, color: string, name: string): void {
  // 设置CSS变量供全局样式使用
  document.documentElement.style.setProperty(
    `--user-color-${clientID}`, 
    color
  );
  
  // 添加用户特定的样式
  const styleId = `user-style-${clientID}`;
  let styleEl = document.getElementById(styleId) as HTMLStyleElement;
  
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = styleId;
    document.head.appendChild(styleEl);
  }
  
  // 设置样式内容
  styleEl.textContent = `
    .yRemoteSelection-${clientID} {
      background-color: ${color}50 !important;
    }
    .yRemoteSelectionHead-${clientID} {
      border-left: ${color} solid 2px !important;
      border-top: ${color} solid 2px !important;
      border-bottom: ${color} solid 2px !important;
      position: relative;
    }
    .yRemoteSelectionHead-${clientID}::after {
      border: 3px solid ${color} !important;
    }
    .yRemoteSelectionHead-${clientID}:hover::before {
      content: "${name}";
      position: absolute;
      top: -20px;
      left: 0;
      background-color: ${color};
      color: white;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 12px;
      white-space: nowrap;
      z-index: 1000;
    }
  `;
}

/**
 * 清理所有用户光标样式元素
 */
export function cleanupCursorStyles(): void {
  document.querySelectorAll('[id^="user-style-"]').forEach(el => el.remove());
}

/**
 * 生成随机用户颜色
 * @returns 返回随机选取的颜色
 */
export function getRandomUserColor(): string {
  const userColors = [
    'rgb(255, 0, 0)', // red
    'rgb(0, 255, 0)', // green
    'rgb(0, 0, 255)', // blue
    'rgb(255, 165, 0)', // orange
    'rgb(128, 0, 128)', // purple
    'rgb(0, 128, 128)', // teal
    'rgb(255, 192, 203)', // pink
    'rgb(255, 255, 0)', // yellow
  ];
  
  return userColors[Math.floor(Math.random() * userColors.length)];
} 