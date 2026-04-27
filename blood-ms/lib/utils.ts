import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";
import { BLOOD_GROUP_LABELS, BLOOD_COMPATIBILITY } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null): string {
  if (!date) return "N/A";
  return format(new Date(date), "MMM dd, yyyy");
}

export function formatRelativeTime(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function getBloodGroupLabel(value: string): string {
  return BLOOD_GROUP_LABELS[value] ?? value;
}

/**
 * Returns all donor blood groups that are compatible with the given recipient group.
 * Falls back to [recipientGroup] if not found in the compatibility table.
 */
export function getCompatibleGroups(recipientGroup: string): string[] {
  return BLOOD_COMPATIBILITY[recipientGroup] ?? [recipientGroup];
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function canDonate(lastDonationDate: Date | string | null): boolean {
  if (!lastDonationDate) return true;
  const last = new Date(lastDonationDate);
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  return last < threeMonthsAgo;
}

export function getUrgencyColor(urgency: string): string {
  switch (urgency) {
    case "CRITICAL":
      return "text-red-400 bg-red-900/30 border-red-700/50";
    case "URGENT":
      return "text-amber-400 bg-amber-900/30 border-amber-700/50";
    default:
      return "text-emerald-400 bg-emerald-900/30 border-emerald-700/50";
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "APPROVED":
    case "FULFILLED":
      return "text-emerald-400 bg-emerald-900/30 border-emerald-700/50";
    case "PENDING":
      return "text-amber-400 bg-amber-900/30 border-amber-700/50";
    case "REJECTED":
      return "text-red-400 bg-red-900/30 border-red-700/50";
    default:
      return "text-slate-400 bg-slate-800/50 border-slate-700/50";
  }
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}
