import "server-only";

import type {
  AdminUser,
  CreateAdminInput,
  UserListQuery,
  UserStatus,
} from "@/lib/types";
import { gearUpFetch } from "./server-client";

export function listUsers(query: UserListQuery = {}) {
  return gearUpFetch<AdminUser[]>("/users", {
    auth: true,
    cache: "no-store",
    query: {
      search: query.search,
      role: query.role,
      status: query.status,
      page: query.page ?? 1,
      limit: query.limit ?? 10,
    },
    fallbackMessage: "Platform users couldn't be loaded. Try again shortly.",
  });
}

export function createAdmin(input: CreateAdminInput) {
  return gearUpFetch<AdminUser>("/users/admins", {
    method: "POST",
    auth: true,
    cache: "no-store",
    json: input,
    fallbackMessage: "The admin account couldn't be created. Try again shortly.",
  });
}

export function updateUserStatus(id: string, status: UserStatus) {
  return gearUpFetch<AdminUser>(`/users/${id}/status`, {
    method: "PATCH",
    auth: true,
    cache: "no-store",
    json: { status },
    fallbackMessage: "The account status couldn't be updated. Try again shortly.",
  });
}
