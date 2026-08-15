import { IUser } from "@/features/auth/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { nanoid } from "nanoid";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function cloneSchema<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

export function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function formatDate(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function formatDateTime(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export const getDisplayName = (user: IUser) => {
  return user?.name || user?.username || user?.email || "User";
};

// Generate initials from user's name or email
export const getInitials = (user: IUser) => {
  if (user && user?.username) {
    return user.username
      .split(" ")
      .map((name: string) => name[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  }
  if (user?.email) {
    return user.email[0].toUpperCase();
  }
  return "U";
};


export function generateInviteToken() {
  return nanoid(32);
}

export function generateFieldId() {
  return nanoid(10);
}

export function generateOptionId() {
  return nanoid(8);
}
