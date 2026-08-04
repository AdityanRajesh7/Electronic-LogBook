"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white/92 group-[.toaster]:text-foreground group-[.toaster]:border-white/70 group-[.toaster]:shadow-[0_20px_60px_rgba(15,23,42,0.12)] group-[.toaster]:backdrop-blur-xl",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-teal-600 group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-teal-50 group-[.toast]:text-teal-900",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
