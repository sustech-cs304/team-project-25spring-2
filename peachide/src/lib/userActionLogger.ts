// use client is intentionally omitted so this module can be imported in SSR files safely.

export type UserActionType =
  | 'click'
  | 'navigate'
  | 'input'
  | 'submit'
  | 'delete'
  | 'edit'
  | 'add'
  | 'search'
  | 'toast'
  | 'error'
  | 'other';

export interface UserActionLog {
  timestamp: string;
  userId?: string;
  username?: string;
  actionType: UserActionType;
  pagePath: string;
  pageName: string;
  elementId?: string;
  elementText?: string;
  functionDescription?: string;
  actionDetails?: Record<string, unknown>;
  browserInfo?: string;
  ipAddress?: string;
  sessionId?: string;
}

type UserResolver = () => { userId?: string; username?: string };
type Sender = (log: UserActionLog) => Promise<void> | void;

class UserActionLogger {
  private logs: UserActionLog[] = [];
  private maxLogs = 1000;
  private sessionId: string | undefined;
  private isEnabled = true;
  private initialized = false;
  private userResolver: UserResolver | undefined;
  private sender: Sender | undefined;

  public init(): void {
    if (this.initialized) return;
    this.initialized = true;

    if (typeof window !== 'undefined') {
      this.sessionId = this.generateSessionId();
      try {
        const existingRaw = window.localStorage.getItem('userActionLogs');
        if (existingRaw) {
          const existing = JSON.parse(existingRaw) as UserActionLog[];
          if (Array.isArray(existing)) {
            this.logs = existing.slice(-this.maxLogs);
          }
        }
      } catch {
        // ignore hydration failures
      }
      this.setupGlobalErrorHandler();
      this.setupDelegatedClickTracking();
      this.setupDelegatedFormTracking();
      // Optionally future: setup form submit tracking
    }
  }

  public setUserResolver(resolver: UserResolver): void {
    this.userResolver = resolver;
  }

  public setSender(sender: Sender): void {
    this.sender = sender;
  }

  private getLocalISOString(date?: Date): string {
    const d = date ? new Date(date) : new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    const seconds = pad(d.getSeconds());
    const offsetMinutes = -d.getTimezoneOffset();
    const sign = offsetMinutes >= 0 ? '+' : '-';
    const abs = Math.abs(offsetMinutes);
    const offsetHours = pad(Math.floor(abs / 60));
    const offsetMins = pad(abs % 60);
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${sign}${offsetHours}:${offsetMins}`;
  }

  private getLocalDateString(date?: Date): string {
    const d = date ? new Date(date) : new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    return `${year}-${month}-${day}`;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  }

  private setupGlobalErrorHandler(): void {
    if (typeof window === 'undefined') return;
    // Avoid duplicate listeners in HMR
    const flag = '__ua_error_listener_registered__';
    if ((window as any)[flag]) return;
    (window as any)[flag] = true;

    window.addEventListener('error', (event) => {
      this.logAction({
        actionType: 'other',
        functionDescription: `页面错误: ${event.message}`,
        actionDetails: {
          error: (event as any).error?.stack || event.message,
          filename: (event as any).filename,
          lineno: (event as any).lineno,
          colno: (event as any).colno,
        },
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.logAction({
        actionType: 'other',
        functionDescription: '页面错误: Unhandled promise rejection',
        actionDetails: {
          reason: (event as any).reason?.stack || String((event as any).reason),
        },
      });
    });
  }

  private setupDelegatedClickTracking(): void {
    if (typeof document === 'undefined') return;
    const flag = '__ua_click_listener_registered__';
    if ((window as any)[flag]) return;
    (window as any)[flag] = true;

    document.addEventListener('click', (e) => {
      if (!this.isEnabled) return;
      const rawTarget = e.target as HTMLElement | null;
      if (!rawTarget) return;

      // Find the most relevant clickable ancestor
      const el = (rawTarget.closest('[data-ua], [data-track], button, a, [role="button"], input[type="submit"], [type="button"], [data-action], [data-testid]') || rawTarget) as HTMLElement;

      // Ignore clicks related to toast UI or global html/body
      const toastAncestor = el.closest('[data-sonner-toaster], [data-sonner-toast], .sonner, .sonner-toast');
      const tagNameEarly = el.tagName ? el.tagName.toLowerCase() : 'unknown';
      if (toastAncestor || tagNameEarly === 'html' || tagNameEarly === 'body' || el.hasAttribute('data-ua-ignore')) {
        return;
      }

      const dataUa = el.getAttribute('data-ua') || el.getAttribute('data-track') || el.getAttribute('data-action') || el.getAttribute('data-testid');
      const uaTextAttr = el.getAttribute('data-ua-text');
      const aria = el.getAttribute('aria-label') || el.getAttribute('aria-roledescription');
      const title = el.getAttribute('title');
      const valueAttr = (el as HTMLInputElement).value;
      const altAttr = (el as HTMLImageElement).alt;
      const nameAttr = (el as HTMLInputElement).name;
      // Prefer innerText to avoid capturing CSS text from <style> tags
      let textContent = ((el as HTMLElement).innerText || el.textContent || '').trim();
      if (!textContent) {
        const labeled = el.querySelector('[aria-label], [title]') as HTMLElement | null;
        textContent = (labeled?.getAttribute('aria-label') || labeled?.getAttribute('title') || '').trim();
      }
      const elementText = (uaTextAttr || aria || title || valueAttr || altAttr || nameAttr || textContent).trim().slice(0, 160);
      const className = typeof el.className === 'string' ? el.className : '';
      const tagName = el.tagName ? el.tagName.toLowerCase() : 'unknown';
      const typeAttr = (el as HTMLButtonElement).type || (el.getAttribute && el.getAttribute('type')) || undefined;
      const elementId = el.id || '';
      const role = el.getAttribute('role') || '';
      const inForm = !!el.closest('form');
      const inMenu = role === 'menuitem' || !!el.closest('[role="menu"]');
      const isTab = role === 'tab' || !!el.closest('[role="tablist"]');

      // Default to Chinese description consistent with sample
      const description = dataUa
        ? dataUa
        : (() => {
            if (isTab) {
              return `切换选项卡: ${elementText || nameAttr || className || tagName}`;
            }
            if (inMenu) {
              return `菜单选择: ${elementText || nameAttr || className || tagName}`;
            }
            // Simple heuristic for common add actions
            if (/mdi-plus|icon-?plus|add|新增/i.test(className + ' ' + elementText)) {
              return `新增操作: ${elementText || className || tagName}`;
            }
            if (/refresh|刷新/i.test(className + ' ' + elementText)) {
              return `刷新操作: ${elementText || className || tagName}`;
            }
            if (/delete|移除|remove|trash|删除/i.test(className + ' ' + elementText)) {
              return `删除操作: ${elementText || className || tagName}`;
            }
            if (tagName === 'a') {
              return `链接点击: ${elementText || (el as HTMLAnchorElement).href || className || 'a'}`;
            }
            if (typeAttr === 'submit' && inForm) {
              return `提交操作: ${elementText || nameAttr || className || tagName}`;
            }
            return `点击操作: ${elementText || nameAttr || className || tagName}`;
          })();

      this.logAction({
        actionType: 'click',
        elementText: elementText || undefined,
        functionDescription: description,
        elementId,
        actionDetails: {
          className,
          tagName,
          type: typeAttr || undefined,
           role: role || undefined,
           inForm,
           inMenu,
           isTab,
        },
      });
    });
  }

  private setupDelegatedFormTracking(): void {
    if (typeof document === 'undefined') return;
    const flag = '__ua_form_listener_registered__';
    if ((window as any)[flag]) return;
    (window as any)[flag] = true;

    document.addEventListener('submit', (e) => {
      if (!this.isEnabled) return;
      const target = e.target as HTMLFormElement | null;
      if (!target) return;

      const formName = target.getAttribute('data-ua') || target.getAttribute('name') || 'Form Submit';
      const fields: string[] = [];
      try {
        const elements = Array.from(target.elements) as Array<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;
        for (const el of elements) {
          if (el.name) fields.push(el.name);
        }
      } catch {/* ignore */}

      this.logFormSubmit(formName, { fields });
    });
  }

  private getCurrentUser(): { userId?: string; username?: string } {
    try {
      if (this.userResolver) {
        return this.userResolver();
      }
    } catch {
      // ignore
    }
    return {};
  }

  private getBrowserInfo(): string | undefined {
    if (typeof navigator === 'undefined') return undefined;
    const { userAgent } = navigator;
    const browser = userAgent.match(/(Chrome|Firefox|Safari|Edge|Opera)\/([\d.]+)/)?.[0] || 'Unknown';
    const os = userAgent.match(/(Windows|Mac|Linux|Android|iOS)/)?.[0] || 'Unknown';
    return `${browser} on ${os}`;
  }

  private getPageInfo(): { pagePath: string; pageName: string } {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return { pagePath: '', pageName: '' };
    }
    const hashFirst = window.location.hash || undefined;
    return {
      pagePath: hashFirst || window.location.pathname,
      pageName: document.title || 'Unknown page',
    };
  }

  public logAction(actionData: Partial<UserActionLog>): void {
    if (!this.isEnabled) return;

    const { userId, username } = this.getCurrentUser();
    const { pagePath, pageName } = this.getPageInfo();

    const log: UserActionLog = {
      timestamp: this.getLocalISOString(),
      userId,
      username,
      actionType: actionData.actionType || 'other',
      pagePath: actionData.pagePath || pagePath,
      pageName: actionData.pageName || pageName,
      elementId: actionData.elementId ?? '',
      elementText: actionData.elementText,
      functionDescription: actionData.functionDescription,
      actionDetails: actionData.actionDetails,
      browserInfo: this.getBrowserInfo(),
      sessionId: this.sessionId,
    };

    this.logs.push(log);
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    this.outputToConsole(log);
    this.send(log);
  }

  private outputToConsole(log: UserActionLog): void {
    if (typeof console === 'undefined') return;
    const style = 'color: #7c3aed; font-weight: bold;';
    const timeStr = new Date(log.timestamp).toLocaleString();
    // group collapsed to reduce noise
    if ((console as any).groupCollapsed) {
      (console as any).groupCollapsed(`%c[UA] ${timeStr} ${log.actionType.toUpperCase()}`, style);
    } else {
      console.log(`[UA] ${timeStr} ${log.actionType.toUpperCase()}`);
    }
    console.log({
      user: `${log.username || 'Unknown'} (${log.userId || 'N/A'})`,
      page: `${log.pageName} (${log.pagePath})`,
      element: log.elementText,
      description: log.functionDescription,
      details: log.actionDetails,
      browser: log.browserInfo,
      session: log.sessionId,
    });
    if ((console as any).groupEnd) (console as any).groupEnd();
  }

  private async send(log: UserActionLog): Promise<void> {
    try {
      if (typeof window !== 'undefined') {
        // Always persist locally first
        const existingRaw = window.localStorage.getItem('userActionLogs') || '[]';
        const existing = JSON.parse(existingRaw) as UserActionLog[];
        existing.push(log);
        const recent = existing.slice(-500);
        window.localStorage.setItem('userActionLogs', JSON.stringify(recent));
      }

      // Then try sending to any configured backend (best-effort)
      if (this.sender) {
        await this.sender(log);
      }
    } catch (err) {
      console.warn('Failed to persist user action log', err);
    }
  }

  public logButtonClick(
    buttonText?: string,
    functionDescription?: string,
    elementId?: string,
    actionDetails?: Record<string, unknown>
  ): void {
    this.logAction({
      actionType: 'click',
      elementText: buttonText,
      functionDescription: functionDescription || (buttonText ? `点击操作: ${buttonText}` : '点击操作'),
      elementId: elementId ?? '',
      actionDetails,
    });
  }

  public logNavigation(fromPath: string, toPath: string, pageName?: string): void {
    this.logAction({
      actionType: 'navigate',
      functionDescription: `页面导航: ${fromPath} -> ${toPath}`,
      pageName,
      actionDetails: { fromPath, toPath },
      pagePath: toPath,
    });
  }

  public logSearch(searchTerm: string, searchType?: string): void {
    this.logAction({
      actionType: 'search',
      functionDescription: `搜索操作: ${searchTerm}`,
      actionDetails: { searchTerm, searchType },
    });
  }

  public logFormSubmit(formName: string, formData?: Record<string, unknown>): void {
    this.logAction({
      actionType: 'submit',
      functionDescription: `提交表单: ${formName}`,
      actionDetails: {
        formName,
        // Only record field names to avoid sensitive data
        formFields: formData ? Object.keys(formData as any) : undefined,
      },
    });
  }

  public logDataOperation(operation: 'add' | 'edit' | 'delete', entityName: string, entityId?: string): void {
    const verb = operation === 'add' ? '新增' : operation === 'edit' ? '编辑' : '删除';
    this.logAction({
      actionType: operation,
      functionDescription: `${verb} ${entityName}`,
      actionDetails: { operation, entityName, entityId },
    });
  }

  public getLogs(): UserActionLog[] {
    return [...this.logs];
  }

  public clearLogs(): void {
    this.logs = [];
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('userActionLogs');
    }
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  public exportLogs(): void {
    const logs = this.getLogs();
    const dataStr = JSON.stringify(logs, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const defaultName = `user_action_logs_${this.getLocalDateString()}.json`;
    if (typeof document === 'undefined') return;
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', defaultName);
    link.click();
  }
}

export const userActionLogger = new UserActionLogger();
// Expose for debugging in development
if (typeof window !== 'undefined') {
  (window as any).userActionLogger = userActionLogger;
}

export default userActionLogger;


