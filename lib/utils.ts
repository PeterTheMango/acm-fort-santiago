import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Compose and merge CSS class names for use with Tailwind CSS.
 *
 * @param inputs - One or more class values (strings, arrays, objects, etc.) to compose into a single class list
 * @returns A single class string with Tailwind classes merged and conflicting utilities resolved
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}