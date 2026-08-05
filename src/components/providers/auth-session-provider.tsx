"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { AuthSessionSnapshot } from "@/lib/types";

const AuthSessionContext = createContext<AuthSessionSnapshot | null>(null);

export function AuthSessionProvider({
  initialSession,
  children,
}: {
  initialSession: AuthSessionSnapshot;
  children: ReactNode;
}) {
  return (
    <AuthSessionContext.Provider value={initialSession}>
      {children}
    </AuthSessionContext.Provider>
  );
}

export function useAuthSession() {
  const session = useContext(AuthSessionContext);

  if (!session) {
    throw new Error("useAuthSession must be used inside AuthSessionProvider.");
  }

  return session;
}
