"use server";

import { revalidatePath, updateTag } from "next/cache";
import type {
  AdminMutationState,
  CreateGearInput,
  FieldErrors,
  RentalOrderStatus,
  UpdateGearInput,
  UserStatus,
} from "@/lib/types";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/services/categories";
import {
  createGearItem,
  deleteGearItem,
  updateGearItem,
} from "@/services/gear";
import { updateOrderStatus } from "@/services/orders";
import { deleteReview } from "@/services/reviews";
import { createAdmin, updateUserStatus } from "@/services/users";
import { requireDashboardRole } from "../_utils/dashboard-access";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[0-9\s-]{7,20}$/;
const USER_STATUSES: UserStatus[] = ["ACTIVE", "INACTIVE", "SUSPENDED"];
const ADMIN_ORDER_STATUSES: RentalOrderStatus[] = [
  "CONFIRMED",
  "PICKED_UP",
  "RETURNED",
  "CANCELLED",
];

function readTrimmed(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function errorState(
  message: string,
  fieldErrors?: FieldErrors,
  values?: Record<string, string>,
): AdminMutationState {
  return { status: "error", message, fieldErrors, values };
}

function apiState(result: { ok: false; error: { message: string; fieldErrors?: FieldErrors } }) {
  return errorState(result.error.message, result.error.fieldErrors);
}

function successState(message: string): AdminMutationState {
  return { status: "success", message };
}

function validateId(id: string, label: string) {
  return UUID_PATTERN.test(id) ? null : `${label} is not valid.`;
}

function invalidateAdmin(paths: string[], tags: string[] = []) {
  for (const path of paths) revalidatePath(path);
  for (const tag of tags) updateTag(tag);
}

export async function updateUserStatusAction(
  userId: string,
  _previousState: AdminMutationState,
  formData: FormData,
): Promise<AdminMutationState> {
  const admin = await requireDashboardRole("ADMIN", "/dashboard/admin/users");
  const invalidId = validateId(userId, "User ID");
  if (invalidId) return errorState(invalidId);

  const rawStatus = readTrimmed(formData, "status");
  if (!USER_STATUSES.includes(rawStatus as UserStatus)) {
    return errorState("Choose a valid account status.", {
      status: ["Choose active, inactive, or suspended."],
    });
  }

  const status = rawStatus as UserStatus;
  if (admin.id === userId && status !== "ACTIVE") {
    return errorState("You cannot deactivate or suspend your own admin account.");
  }

  const result = await updateUserStatus(userId, status);
  if (!result.ok) return apiState(result);

  invalidateAdmin(["/dashboard/admin", "/dashboard/admin/users"]);
  return successState(result.message);
}

export async function createAdminAction(
  _previousState: AdminMutationState,
  formData: FormData,
): Promise<AdminMutationState> {
  await requireDashboardRole("ADMIN", "/dashboard/admin/admins/new");

  const name = readTrimmed(formData, "name");
  const email = readTrimmed(formData, "email").toLowerCase();
  const phone = readTrimmed(formData, "phone");
  const passwordValue = formData.get("password");
  const password = typeof passwordValue === "string" ? passwordValue : "";
  const fieldErrors: FieldErrors = {};

  if (name.length < 2 || name.length > 255) {
    fieldErrors.name = ["Name must be between 2 and 255 characters."];
  }
  if (!EMAIL_PATTERN.test(email)) {
    fieldErrors.email = ["Enter a valid email address."];
  }
  if (!PHONE_PATTERN.test(phone)) {
    fieldErrors.phone = ["Enter a valid phone number (7–20 digits)."];
  }
  if (password.length < 6) {
    fieldErrors.password = ["Password must be at least 6 characters."];
  }

  const values = { name, email, phone };
  if (Object.keys(fieldErrors).length > 0) {
    return errorState("Check the highlighted fields and try again.", fieldErrors, values);
  }

  const result = await createAdmin({ name, email, phone, password });
  if (!result.ok) {
    return errorState(result.error.message, result.error.fieldErrors, values);
  }

  invalidateAdmin(["/dashboard/admin", "/dashboard/admin/users"]);
  return successState(result.message);
}

function validateCategoryName(name: string) {
  if (name.length < 2) return "Category name must be at least 2 characters.";
  if (name.length > 255) return "Category name cannot exceed 255 characters.";
  return null;
}

export async function createCategoryAction(
  _previousState: AdminMutationState,
  formData: FormData,
): Promise<AdminMutationState> {
  void _previousState;
  await requireDashboardRole("ADMIN", "/dashboard/admin/categories");
  const name = readTrimmed(formData, "name");
  const validationMessage = validateCategoryName(name);
  if (validationMessage) {
    return errorState("Check the category name and try again.", {
      name: [validationMessage],
    }, { name });
  }

  const result = await createCategory(name);
  if (!result.ok) return errorState(result.error.message, result.error.fieldErrors, { name });

  invalidateAdmin(["/dashboard/admin/categories"], ["categories"]);
  return successState(result.message);
}

export async function updateCategoryAction(
  categoryId: string,
  _previousState: AdminMutationState,
  formData: FormData,
): Promise<AdminMutationState> {
  await requireDashboardRole("ADMIN", "/dashboard/admin/categories");
  const invalidId = validateId(categoryId, "Category ID");
  if (invalidId) return errorState(invalidId);

  const name = readTrimmed(formData, "name");
  const validationMessage = validateCategoryName(name);
  if (validationMessage) {
    return errorState("Check the category name and try again.", {
      name: [validationMessage],
    }, { name });
  }

  const result = await updateCategory(categoryId, name);
  if (!result.ok) return errorState(result.error.message, result.error.fieldErrors, { name });

  invalidateAdmin(["/dashboard/admin/categories", "/dashboard/admin/gear"], [
    "categories",
    "gear",
  ]);
  return successState(result.message);
}

export async function deleteCategoryAction(
  categoryId: string,
  _previousState: AdminMutationState,
  _formData: FormData,
): Promise<AdminMutationState> {
  void _previousState;
  void _formData;
  await requireDashboardRole("ADMIN", "/dashboard/admin/categories");
  const invalidId = validateId(categoryId, "Category ID");
  if (invalidId) return errorState(invalidId);

  const result = await deleteCategory(categoryId);
  if (!result.ok) return apiState(result);

  invalidateAdmin(["/dashboard/admin/categories"], ["categories"]);
  return successState(result.message);
}

export async function updateOrderStatusAction(
  orderId: string,
  _previousState: AdminMutationState,
  formData: FormData,
): Promise<AdminMutationState> {
  await requireDashboardRole("ADMIN", "/dashboard/admin/orders");
  const invalidId = validateId(orderId, "Order ID");
  if (invalidId) return errorState(invalidId);

  const rawStatus = readTrimmed(formData, "status");
  if (!ADMIN_ORDER_STATUSES.includes(rawStatus as RentalOrderStatus)) {
    return errorState("Choose a valid order transition. Paid status is webhook-only.");
  }

  const result = await updateOrderStatus(
    orderId,
    rawStatus as RentalOrderStatus,
  );
  if (!result.ok) return apiState(result);

  invalidateAdmin(["/dashboard/admin", "/dashboard/admin/orders"]);
  return successState(result.message);
}

export async function deleteReviewAction(
  reviewId: string,
  _previousState: AdminMutationState,
  _formData: FormData,
): Promise<AdminMutationState> {
  void _previousState;
  void _formData;
  await requireDashboardRole("ADMIN", "/dashboard/admin/reviews");
  const invalidId = validateId(reviewId, "Review ID");
  if (invalidId) return errorState(invalidId);

  const result = await deleteReview(reviewId);
  if (!result.ok) return apiState(result);

  invalidateAdmin(["/dashboard/admin/reviews"], ["reviews"]);
  return successState(result.message);
}

function parseGearForm(formData: FormData, requireProvider: boolean) {
  const categoryId = readTrimmed(formData, "categoryId");
  const providerId = readTrimmed(formData, "providerId");
  const name = readTrimmed(formData, "name");
  const description = readTrimmed(formData, "description");
  const stockRaw = readTrimmed(formData, "stock");
  const priceRaw = readTrimmed(formData, "pricePerDay");
  const brand = readTrimmed(formData, "brand");
  const imageUrl = readTrimmed(formData, "imageUrl");
  const isAvailable = formData.get("isAvailable") === "on";
  const stock = Number(stockRaw);
  const pricePerDay = Number(priceRaw);
  const fieldErrors: FieldErrors = {};

  if (!UUID_PATTERN.test(categoryId)) {
    fieldErrors.categoryId = ["Choose a valid category."];
  }
  if (requireProvider && !UUID_PATTERN.test(providerId)) {
    fieldErrors.providerId = ["Choose an active provider."];
  }
  if (name.length < 2 || name.length > 255) {
    fieldErrors.name = ["Name must be between 2 and 255 characters."];
  }
  if (description.length < 10) {
    fieldErrors.description = ["Description must be at least 10 characters."];
  }
  if (!/^\d+$/.test(stockRaw) || !Number.isSafeInteger(stock) || stock < 0) {
    fieldErrors.stock = ["Stock must be a non-negative integer."];
  }
  if (!Number.isFinite(pricePerDay) || pricePerDay <= 0 || pricePerDay > 99999999.99) {
    fieldErrors.pricePerDay = ["Enter a daily price greater than 0."];
  }
  if (brand.length > 255) {
    fieldErrors.brand = ["Brand cannot exceed 255 characters."];
  }
  if (imageUrl) {
    try {
      const parsedUrl = new URL(imageUrl);
      if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
        fieldErrors.imageUrl = ["Image URL must use HTTP or HTTPS."];
      }
    } catch {
      fieldErrors.imageUrl = ["Enter a valid image URL."];
    }
  }

  const values = {
    categoryId,
    providerId,
    name,
    description,
    stock: stockRaw,
    pricePerDay: priceRaw,
    brand,
    imageUrl,
    isAvailable: String(isAvailable),
  };

  return {
    fieldErrors,
    values,
    data: {
      categoryId,
      providerId,
      name,
      description,
      stock,
      pricePerDay,
      brand: brand || null,
      imageUrl: imageUrl || null,
      isAvailable,
    },
  };
}

export async function createGearAction(
  _previousState: AdminMutationState,
  formData: FormData,
): Promise<AdminMutationState> {
  await requireDashboardRole("ADMIN", "/dashboard/admin/gear/new");
  const parsed = parseGearForm(formData, true);
  if (Object.keys(parsed.fieldErrors).length > 0) {
    return errorState(
      "Check the highlighted gear fields and try again.",
      parsed.fieldErrors,
      parsed.values,
    );
  }

  const result = await createGearItem(parsed.data as CreateGearInput);
  if (!result.ok) {
    return errorState(result.error.message, result.error.fieldErrors, parsed.values);
  }

  invalidateAdmin(["/dashboard/admin", "/dashboard/admin/gear"], ["gear"]);
  return successState(result.message);
}

export async function updateGearAction(
  gearId: string,
  _previousState: AdminMutationState,
  formData: FormData,
): Promise<AdminMutationState> {
  await requireDashboardRole("ADMIN", `/dashboard/admin/gear/${gearId}/edit`);
  const invalidId = validateId(gearId, "Gear ID");
  if (invalidId) return errorState(invalidId);

  const parsed = parseGearForm(formData, false);
  if (Object.keys(parsed.fieldErrors).length > 0) {
    return errorState(
      "Check the highlighted gear fields and try again.",
      parsed.fieldErrors,
      parsed.values,
    );
  }

  const data: UpdateGearInput = {
    categoryId: parsed.data.categoryId,
    name: parsed.data.name,
    description: parsed.data.description,
    stock: parsed.data.stock,
    pricePerDay: parsed.data.pricePerDay,
    brand: parsed.data.brand,
    imageUrl: parsed.data.imageUrl,
    isAvailable: parsed.data.isAvailable,
  };
  const result = await updateGearItem(gearId, data);
  if (!result.ok) {
    return errorState(result.error.message, result.error.fieldErrors, parsed.values);
  }

  invalidateAdmin(["/dashboard/admin", "/dashboard/admin/gear"], [
    "gear",
    `gear:${gearId}`,
  ]);
  return successState(result.message);
}

export async function deleteGearAction(
  gearId: string,
  _previousState: AdminMutationState,
  _formData: FormData,
): Promise<AdminMutationState> {
  void _previousState;
  void _formData;
  await requireDashboardRole("ADMIN", "/dashboard/admin/gear");
  const invalidId = validateId(gearId, "Gear ID");
  if (invalidId) return errorState(invalidId);

  const result = await deleteGearItem(gearId);
  if (!result.ok) return apiState(result);

  invalidateAdmin(["/dashboard/admin", "/dashboard/admin/gear"], [
    "gear",
    `gear:${gearId}`,
  ]);
  return successState(result.message);
}
