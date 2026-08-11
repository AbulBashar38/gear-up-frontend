/**
 * Dedicated grading/demo account, published deliberately on the sign-in screen
 * so reviewers can explore the admin experience without provisioning an
 * account. This is not a personal or production login: it exists only for
 * assessment of the deployed demo, and rotating it means editing this file.
 */
export const DEMO_ACCOUNTS = [
  {
    role: "Admin",
    description: "Full platform access: users, categories, gear, orders, and reviews.",
    email: "admin+23247886@example.com",
    password: "12345678Aa#",
  },
] as const;

export type DemoAccount = (typeof DEMO_ACCOUNTS)[number];
