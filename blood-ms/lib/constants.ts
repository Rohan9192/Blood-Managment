export const BLOOD_GROUPS = [
  { value: "A_POS", label: "A+" },
  { value: "A_NEG", label: "A-" },
  { value: "B_POS", label: "B+" },
  { value: "B_NEG", label: "B-" },
  { value: "AB_POS", label: "AB+" },
  { value: "AB_NEG", label: "AB-" },
  { value: "O_POS", label: "O+" },
  { value: "O_NEG", label: "O-" },
] as const;

/**
 * Blood compatibility map: RECIPIENT → compatible DONOR groups.
 * Based on standard ABO + Rh compatibility chart.
 *
 *  AB+ = universal recipient (can receive from all)
 *  O-  = universal donor   (can donate to all)
 */
export const BLOOD_COMPATIBILITY: Record<string, string[]> = {
  A_POS:  ["A_POS", "A_NEG", "O_POS", "O_NEG"],
  A_NEG:  ["A_NEG", "O_NEG"],
  B_POS:  ["B_POS", "B_NEG", "O_POS", "O_NEG"],
  B_NEG:  ["B_NEG", "O_NEG"],
  AB_POS: ["A_POS", "A_NEG", "B_POS", "B_NEG", "AB_POS", "AB_NEG", "O_POS", "O_NEG"],
  AB_NEG: ["A_NEG", "B_NEG", "AB_NEG", "O_NEG"],
  O_POS:  ["O_POS", "O_NEG"],
  O_NEG:  ["O_NEG"],
};

export const BLOOD_GROUP_LABELS: Record<string, string> = {
  A_POS: "A+",
  A_NEG: "A-",
  B_POS: "B+",
  B_NEG: "B-",
  AB_POS: "AB+",
  AB_NEG: "AB-",
  O_POS: "O+",
  O_NEG: "O-",
};

export const URGENCY_LEVELS = [
  { value: "NORMAL", label: "Normal", color: "emerald" },
  { value: "URGENT", label: "Urgent", color: "amber" },
  { value: "CRITICAL", label: "Critical", color: "red" },
] as const;

export const REQUEST_STATUSES = [
  { value: "PENDING", label: "Pending", color: "amber" },
  { value: "APPROVED", label: "Approved", color: "blue" },
  { value: "FULFILLED", label: "Fulfilled", color: "emerald" },
  { value: "REJECTED", label: "Rejected", color: "red" },
] as const;

export const DONOR_STATUSES = [
  { value: "PENDING", label: "Pending", color: "amber" },
  { value: "APPROVED", label: "Approved", color: "emerald" },
  { value: "REJECTED", label: "Rejected", color: "red" },
] as const;

export const ROLES = ["ADMIN", "DONOR", "RECEIVER"] as const;

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/donors", label: "Donors" },
  { href: "/requests", label: "Requests" },
  { href: "/dashboard", label: "Dashboard" },
];
