// src/app/components/role-context.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

type Role = "applicant" | "company" | null;

interface RoleContextType {
  role: Role;
  setRole: (role: Role) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>(null);

  // Initialize role from localStorage on mount
  useEffect(() => {
    const storedRole = localStorage.getItem("selectedRole") as Role;
    if (storedRole) setRole(storedRole);
  }, []);

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRoleContext() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRoleContext must be used within a RoleProvider");
  }
  return context;
}
