import CodeEnvProvider from "@/components/context/CodeEnvProvider";
import "./layout.css";
import "./local.css";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <CodeEnvProvider>
        {children}
    </CodeEnvProvider>
  );
}