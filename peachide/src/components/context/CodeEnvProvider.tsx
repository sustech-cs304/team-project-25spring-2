"use client";

import { Dispatch, ReactNode, SetStateAction, createContext, useState } from "react";

type CodeEnvContextType = {
};

export const CodeEnvContext = createContext<CodeEnvContextType | null>(null);

export default function CodeEnvProvider({ children }: { children: ReactNode }) {

  return (
    <CodeEnvContext.Provider
      value={{
      }}
    >
      {children}
    </CodeEnvContext.Provider>
  );
}