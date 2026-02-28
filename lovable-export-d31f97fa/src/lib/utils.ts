import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatProxyLine(p: { host: string; port: number | string; username: string; password?: string }) {
  if (!p.password) return `${p.host}:${p.port}:${p.username}`;
  return `${p.host}:${p.port}:${p.username}:${p.password}`;
}
