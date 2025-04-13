import CodeEnvProvider from "@/components/context/CodeEnvProvider";
import "./local.css";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <CodeEnvProvider>
        {children}
    </CodeEnvProvider>
  );
}