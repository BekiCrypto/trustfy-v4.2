"use client";
import { useEffect, useMemo, useState } from "react"
import { Toaster as Sonner } from "sonner"

const Toaster = ({
  ...props
}) => {
  const [setting, setSetting] = useState(() => localStorage.getItem("theme") || "dark")

  useEffect(() => {
    const onThemeChange = (e) => {
      const next = e?.detail?.theme ?? localStorage.getItem("theme") ?? "dark"
      setSetting(next)
    }
    const onStorage = (e) => {
      if (e.key === "theme") {
        setSetting(e.newValue || "dark")
      }
    }
    window.addEventListener("themechange", onThemeChange)
    window.addEventListener("storage", onStorage)
    return () => {
      window.removeEventListener("themechange", onThemeChange)
      window.removeEventListener("storage", onStorage)
    }
  }, [])

  const theme = useMemo(() => {
    if (setting === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      return prefersDark ? "dark" : "light"
    }
    return setting === "dark" ? "dark" : "light"
  }, [setting])

  return (
    (<Sonner
      theme={theme}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props} />)
  );
}

export { Toaster }
