"use client";

import CodeEnvProvider from "@/components/context/CodeEnvProvider";
import "./local.css";
import { PDFProvider } from "@/components/pdf/PDFEnvProvider";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <PDFProvider>
      <CodeEnvProvider>
        {children}
      </CodeEnvProvider>
    </PDFProvider>
  );
}