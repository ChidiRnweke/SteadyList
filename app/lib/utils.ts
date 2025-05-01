import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, formatDistance } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  return format(new Date(dateString), "MMM d, yyyy")
}

export function formatDateRelative(dateString: string): string {
  const date = new Date(dateString)
  return formatDistance(date, new Date(), { addSuffix: true })
}
