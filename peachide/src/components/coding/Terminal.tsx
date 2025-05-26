import React, { useEffect, useRef, useState } from 'react';
import 'xterm/css/xterm.css';
import { useTheme } from 'next-themes';
import { init } from 'next/dist/compiled/webpack/webpack';
import { useUserContext } from '@/app/UserEnvProvider';
import { set } from 'lodash';

interface TerminalComponentProps {
  env_id: string;
}

const terminalTheme = {
  dark: {
    background: '#1e1e1e',
    foreground: '#ffffff',
    cursor: '#ffffff',
    cursorAccent: '#ffffff',
  },
  light: {
    background: '#f0f0f0',
    foreground: '#000000',
    cursor: '#000000',
    cursorAccent: '#000000',
  }
};

const TerminalComponent: React.FC<TerminalComponentProps> = ({ env_id }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<any | null>(null);
  const fitAddonRef = useRef<any | null>(null);
  const [isClient, setIsClient] = useState(false);
  const { resolvedTheme } = useTheme();
  const [terminalPid, setTerminalPid] = useState<string | null>(null);
  const socketURL = `${process.env.NEXT_PUBLIC_API_URL}/terminal/${env_id}/`;
  const { token } = useUserContext();

  useEffect(() => {
    setIsClient(true);

    return () => {
      setIsClient(false);
    };
  }, []);

  useEffect(() => {
    if (xtermRef.current && resolvedTheme) {
      const currentTheme = resolvedTheme === 'dark' ? terminalTheme.dark : terminalTheme.light;
      xtermRef.current.options.theme = currentTheme;
      
      try {
        const terminal = xtermRef.current;
        if (terminal) {
          terminal.clearSelection();
          terminal.refresh(0, terminal.rows - 1);
        }
      } catch (e) {
        console.error("Failed to update terminal theme:", e);
      }
    }
  }, [resolvedTheme]);

  useEffect(() => {
    if (!terminalRef.current || !isClient) return;

    const loadTerminal = async () => {
      const { Terminal } = await import('xterm');
      const { FitAddon } = await import('xterm-addon-fit');
      const { WebLinksAddon } = await import('xterm-addon-web-links');
      const { AttachAddon } = await import('xterm-addon-attach');

      const currentTheme = resolvedTheme === 'dark' ? terminalTheme.dark : terminalTheme.light;

      const terminal = new Terminal({
        cursorBlink: true,
        theme: currentTheme,
      });
      
      const fitAddon = new FitAddon();
      const webLinksAddon = new WebLinksAddon();

      const initTermPID = async () => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/terminal/${env_id}/init`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          if (!response.ok) {
            throw new Error('Failed to initialize terminal PID');
          }
          const data = await response.json();
          return data.pid;
        } catch (error) {
          console.error('Error initializing terminal PID:', error);
          return null;
        }
      }

      initTermPID().then((pid) => {
        if (pid) {
          pid = pid.toString();
          setTerminalPid(pid);
          console.log(`Terminal initialized with PID: ${pid}`);
        } else {
          console.error('Failed to initialize terminal PID');
        }
      });

      const ws = new WebSocket(socketURL + terminalPid);
      const attachAddon = new AttachAddon(ws);

      terminal.loadAddon(fitAddon);
      terminal.loadAddon(webLinksAddon);
      terminal.loadAddon(attachAddon);

      if (terminalRef.current) {
        terminal.open(terminalRef.current);
        fitAddon.fit();
      }

      xtermRef.current = terminal;
      fitAddonRef.current = fitAddon;

      const resizeObserver = new ResizeObserver(() => {
        if (fitAddon) {
          setTimeout(() => fitAddon.fit(), 0);
        }
      });
      
      if (terminalRef.current) {
        resizeObserver.observe(terminalRef.current);
      }

      terminal.writeln('Welcome to PeachIDE Terminal');
      terminal.writeln('');

      const handleResize = () => {
        if (fitAddonRef.current) {
          fitAddonRef.current.fit();
        }
      };
      window.addEventListener('resize', handleResize);

      setTimeout(handleResize, 100);

      return () => {
        window.removeEventListener('resize', handleResize);
        if (terminalRef.current) {
          resizeObserver.disconnect();
        }
        terminal.dispose();
      };
    };

    loadTerminal();
  }, [isClient]);

  const bgColor = resolvedTheme === 'dark' ? '#1e1e1e' : '#f0f0f0';

  return (
    <div className="h-full w-full overflow-hidden flex flex-col" style={{ backgroundColor: bgColor }}>
      {isClient && <div ref={terminalRef} className="h-full w-full flex-grow p-2" />}
    </div>
  );
};

export default TerminalComponent; 