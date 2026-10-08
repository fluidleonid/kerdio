import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "project"
}

export function capitalizeMemo(text: string): string {
  if (!text) return ""
  const trimmed = text.trim()
  if (!trimmed) return ""
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
}
