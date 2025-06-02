"use client";

import React from "react";
import { Toggle } from "@/components/ui/toggle";
import { useTheme } from "next-themes";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <Toggle
      variant="outline"
      size="default"
      className="rounded-md border-white"
      onClick={toggleTheme}
    >
      {theme === "dark" ? "Light" : "Dark"}
    </Toggle>
  );
};

export default ThemeToggle;
