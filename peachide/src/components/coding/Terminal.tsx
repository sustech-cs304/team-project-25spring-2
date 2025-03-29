import React, { useEffect, useRef, useState } from 'react';
import 'xterm/css/xterm.css';
import { useTheme } from 'next-themes';

interface TerminalComponentProps {
  initialCommand?: string;
  onInput?: (data: string) => void;
}

const TerminalComponent: React.FC<TerminalComponentProps> = ({ initialCommand, onInput }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<any | null>(null);
  const fitAddonRef = useRef<any | null>(null);
  const [isClient, setIsClient] = useState(false);
  const { resolvedTheme } = useTheme();
  
  // Define theme colors based on the current color scheme
  const terminalTheme = {
    dark: {
      background: '#1e1e1e',
      foreground: '#ffffff',
      cursor: '#ffffff',
      cursorAccent: '#ffffff',
    },
    light: {
      background: '#f0f0f0', // Light gray background
      foreground: '#000000', // Black text for light mode
      cursor: '#000000',
      cursorAccent: '#000000',
    }
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Watch for theme changes and update the terminal theme
  useEffect(() => {
    if (xtermRef.current && resolvedTheme) {
      const currentTheme = resolvedTheme === 'dark' ? terminalTheme.dark : terminalTheme.light;
      xtermRef.current.options.theme = currentTheme;
      
      // Need to force a redraw for the theme to take effect
      try {
        // This is a way to trigger a refresh of the terminal's appearance
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

    // Dynamically import xterm.js and addons only on client-side
    const loadTerminal = async () => {
      const { Terminal } = await import('xterm');
      const { FitAddon } = await import('xterm-addon-fit');
      const { WebLinksAddon } = await import('xterm-addon-web-links');

      // Get the current theme colors
      const currentTheme = resolvedTheme === 'dark' ? terminalTheme.dark : terminalTheme.light;

      // Initialize xterm.js
      const terminal = new Terminal({
        cursorBlink: true,
        theme: currentTheme,
      });
      const fitAddon = new FitAddon();
      const webLinksAddon = new WebLinksAddon();

      terminal.loadAddon(fitAddon);
      terminal.loadAddon(webLinksAddon);
      if (terminalRef.current) {
        terminal.open(terminalRef.current);
        fitAddon.fit();
      }

      xtermRef.current = terminal;
      fitAddonRef.current = fitAddon;

      // Ensure terminal fits properly
      const resizeObserver = new ResizeObserver(() => {
        if (fitAddon) {
          setTimeout(() => fitAddon.fit(), 0);
        }
      });
      
      if (terminalRef.current) {
        resizeObserver.observe(terminalRef.current);
      }

      // Welcome message
      terminal.writeln('Welcome to PeachIDE Terminal');
      terminal.writeln('Type "help" for available commands');
      terminal.writeln('');
      const prompt = () => {
        terminal.write('\r\n$ ');
      };
      prompt();

      // Handle user input
      let commandBuffer = '';
      terminal.onData((data) => {
        switch (data) {
          case '\r': // Enter
            terminal.writeln('');
            if (commandBuffer.trim().length > 0) {
              handleCommand(commandBuffer);
              commandBuffer = '';
            }
            terminal.write('\r\n$ ');
            break;
          case '\u007F': // Backspace
            if (commandBuffer.length > 0) {
              commandBuffer = commandBuffer.substring(0, commandBuffer.length - 1);
              terminal.write('\b \b');
            }
            break;
          default:
            if (data >= ' ' && data <= '~') {
              commandBuffer += data;
              terminal.write(data);
            }
        }

        if (onInput) {
          onInput(data);
        }
      });

      // Execute initial command if provided
      if (initialCommand) {
        terminal.writeln(`$ ${initialCommand}`);
        handleCommand(initialCommand);
        terminal.write('\r\n$ ');
      }

      // Handle window resize
      const handleResize = () => {
        if (fitAddonRef.current) {
          fitAddonRef.current.fit();
        }
      };
      window.addEventListener('resize', handleResize);

      // Trigger an initial resize after a small delay to ensure proper sizing
      setTimeout(handleResize, 100);

      // Cleanup
      return () => {
        window.removeEventListener('resize', handleResize);
        if (terminalRef.current) {
          resizeObserver.disconnect();
        }
        terminal.dispose();
      };
    };

    loadTerminal();
  }, [initialCommand, onInput, isClient]); // Removed resolvedTheme dependency to avoid recreating terminal on theme change

  // Basic command handling - this would be replaced with a connection to your backend
  const handleCommand = (command: string) => {
    const terminal = xtermRef.current;
    if (!terminal) return;

    const cmd = command.trim();
    
    // Simple command simulation
    if (cmd === 'help') {
      terminal.writeln('Available commands:');
      terminal.writeln('  help - Show this help message');
      terminal.writeln('  clear - Clear the terminal');
      terminal.writeln('  ls - List files (simulated)');
      terminal.writeln('  echo [text] - Display text');
    } else if (cmd === 'clear') {
      terminal.clear();
    } else if (cmd === 'ls') {
      terminal.writeln('index.js');
      terminal.writeln('package.json');
      terminal.writeln('node_modules/');
      terminal.writeln('src/');
    } else if (cmd.startsWith('echo ')) {
      terminal.writeln(cmd.substring(5));
    } else if (cmd.length > 0) {
      terminal.writeln(`Command not found: ${cmd}`);
    }
  };

  // Determine the background color based on theme
  const bgColor = resolvedTheme === 'dark' ? '#1e1e1e' : '#f0f0f0';

  return (
    <div className="h-full w-full overflow-hidden flex flex-col" style={{ backgroundColor: bgColor }}>
      {isClient && <div ref={terminalRef} className="h-full w-full flex-grow p-2" />}
    </div>
  );
};

export default TerminalComponent; 