"use server";

import { revalidatePath, updateTag } from "next/cache";
import type { AdminMutationState, FieldErrors } from "@/lib/types";
import {
  adminOrderStatusFormSchema,
  categoryFormSchema,
  createAdminFormSchema,
  createGearFormSchema,
  idSchema,
  updateGearFormSchema,
  userStatusFormSchema,
} from "../validation/admin.schema";
import { getZodFieldErrors } from "@/lib/validations/zod-errors";
import {
  removeUploadedGearImage,
  uploadGearImage,
} from "@/services/cloudinary";
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

function readTrimmed(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
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
  const parsed = idSchema(label).safeParse(id);
  return parsed.success
    ? null
    : (parsed.error.issues[0]?.message ?? `${label} is not valid.`);
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
  const admin = await requireDashboardRole("ADMIN", "/dashboard/users");
  const invalidId = validateId(userId, "User ID");
  if (invalidId) return errorState(invalidId);

  const parsed = userStatusFormSchema.safeParse({
    status: readTrimmed(formData, "status"),
  });
  if (!parsed.success) {
    return errorState("Choose a valid account status.", {
      ...getZodFieldErrors(parsed.error),
    });
  }

  const { status } = parsed.data;
  if (admin.id === userId && status !== "ACTIVE") {
    return errorState("You cannot deactivate or suspend your own admin account.");
  }

  const result = await updateUserStatus(userId, status);
  if (!result.ok) return apiState(result);

  invalidateAdmin(["/dashboard/admin", "/dashboard/users"]);
  return successState(result.message);
}

export async function createAdminAction(
  _previousState: AdminMutationState,
  formData: FormData,
): Promise<AdminMutationState> {
  await requireDashboardRole("ADMIN", "/dashboard/admins/new");

  const input = {
    name: readTrimmed(formData, "name"),
    email: readTrimmed(formData, "email").toLowerCase(),
    phone: readTrimmed(formData, "phone"),
    password: readString(formData, "password"),
  };
  const values = { name: input.name, email: input.email, phone: input.phone };
  const parsed = createAdminFormSchema.safeParse(input);

  if (!parsed.success) {
    return errorState(
      "Check the highlighted fields and try again.",
      getZodFieldErrors(parsed.error),
      values,
    );
  }

  const result = await createAdmin(parsed.data);
  if (!result.ok) {
    return errorState(result.error.message, result.error.fieldErrors, values);
  }

  invalidateAdmin(["/dashboard/admin", "/dashboard/users"]);
  return successState(result.message);
}

export async function createCategoryAction(
  _previousState: AdminMutationState,
  formData: FormData,
): Promise<AdminMutationState> {
  void _previousState;
  await requireDashboardRole("ADMIN", "/dashboard/categories");
  const name = readTrimmed(formData, "name");
  const parsed = categoryFormSchema.safeParse({ name });
  if (!parsed.success) {
    return errorState(
      "Check the category name and try again.",
      getZodFieldErrors(parsed.error),
      { name },
    );
  }

  const result = await createCategory(parsed.data.name);
  if (!result.ok) return errorState(result.error.message, result.error.fieldErrors, { name });

  invalidateAdmin(["/dashboard/categories"], ["categories"]);
  return successState(result.message);
}

export async function updateCategoryAction(
  categoryId: string,
  _previousState: AdminMutationState,
  formData: FormData,
): Promise<AdminMutationState> {
  await requireDashboardRole("ADMIN", "/dashboard/categories");
  const invalidId = validateId(categoryId, "Category ID");
  if (invalidId) return errorState(invalidId);

  const name = readTrimmed(formData, "name");
  const parsed = categoryFormSchema.safeParse({ name });
  if (!parsed.success) {
    return errorState(
      "Check the category name and try again.",
      getZodFieldErrors(parsed.error),
      { name },
    );
  }

  const result = await updateCategory(categoryId, parsed.data.name);
  if (!result.ok) return errorState(result.error.message, result.error.fieldErrors, { name });

  invalidateAdmin(["/dashboard/categories", "/dashboard/gear"], [
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
  await requireDashboardRole("ADMIN", "/dashboard/categories");
  const invalidId = validateId(categoryId, "Category ID");
  if (invalidId) return errorState(invalidId);

  const result = await deleteCategory(categoryId);
  if (!result.ok) return apiState(result);

  invalidateAdmin(["/dashboard/categories"], ["categories"]);
  return successState(result.message);
}

export async function updateOrderStatusAction(
  orderId: string,
  _previousState: AdminMutationState,
  formData: FormData,
): Promise<AdminMutationState> {
  await requireDashboardRole("ADMIN", "/dashboard/orders");
  const invalidId = validateId(orderId, "Order ID");
  if (invalidId) return errorState(invalidId);

  const parsed = adminOrderStatusFormSchema.safeParse({
    status: readTrimmed(formData, "status"),
  });
  if (!parsed.success) {
    return errorState(
      "Choose a valid order transition. Paid status is webhook-only.",
      getZodFieldErrors(parsed.error),
    );
  }

  const result = await updateOrderStatus(orderId, parsed.data.status);
  if (!result.ok) return apiState(result);

  invalidateAdmin(["/dashboard/admin", "/dashboard/orders"]);
  return successState(result.message);
}

export async function deleteReviewAction(
  reviewId: string,
  _previousState: AdminMutationState,
  _formData: FormData,
): Promise<AdminMutationState> {
  void _previousState;
  void _formData;
  await requireDashboardRole("ADMIN", "/dashboard/reviews");
  const invalidId = validateId(reviewId, "Review ID");
  if (invalidId) return errorState(invalidId);

  const result = await deleteReview(reviewId);
  if (!result.ok) return apiState(result);

  invalidateAdmin(["/dashboard/reviews"], ["reviews"]);
  return successState(result.message);
}

function readGearForm(formData: FormData) {
  const imageValue = formData.get("image");
  const input = {
    categoryId: readTrimmed(formData, "categoryId"),
    providerId: readTrimmed(formData, "providerId"),
    name: readTrimmed(formData, "name"),
    description: readTrimmed(formData, "description"),
    stock: readTrimmed(formData, "stock"),
    pricePerDay: readTrimmed(formData, "pricePerDay"),
    brand: readTrimmed(formData, "brand"),
    image:
      imageValue instanceof File && imageValue.size === 0
        ? undefined
        : (imageValue ?? undefined),
    isAvailable: formData.get("isAvailable") === "on",
  };
  const values = {
    categoryId: input.categoryId,
    providerId: input.providerId,
    name: input.name,
    description: input.description,
    stock: input.stock,
    pricePerDay: input.pricePerDay,
    brand: input.brand,
    isAvailable: String(input.isAvailable),
  };

  return { input, values };
}

export async function createGearAction(
  _previousState: AdminMutationState,
  formData: FormData,
): Promise<AdminMutationState> {
  await requireDashboardRole("ADMIN", "/dashboard/gear/new");
  const form = readGearForm(formData);
  const parsed = createGearFormSchema.safeParse(form.input);
  if (!parsed.success) {
    return errorState(
      "Check the highlighted gear fields and try again.",
      getZodFieldErrors(parsed.error),
      form.values,
    );
  }

  const { image, ...gearData } = parsed.data;
  const uploaded = image ? await uploadGearImage(image) : null;
  if (uploaded && !uploaded.ok) {
    return errorState(
      uploaded.message,
      { image: [uploaded.message] },
      form.values,
    );
  }

  const result = await createGearItem({
    ...gearData,
    imageUrl: uploaded?.url ?? null,
  });
  if (!result.ok) {
    if (uploaded) await removeUploadedGearImage(uploaded.publicId);
    return errorState(result.error.message, result.error.fieldErrors, form.values);
  }

  invalidateAdmin(["/dashboard/admin", "/dashboard/gear"], ["gear"]);
  return successState(result.message);
}

export async function updateGearAction(
  gearId: string,
  _previousState: AdminMutationState,
  formData: FormData,
): Promise<AdminMutationState> {
  await requireDashboardRole("ADMIN", `/dashboard/gear/${gearId}/edit`);
  const invalidId = validateId(gearId, "Gear ID");
  if (invalidId) return errorState(invalidId);

  const form = readGearForm(formData);
  const parsed = updateGearFormSchema.safeParse(form.input);
  if (!parsed.success) {
    return errorState(
      "Check the highlighted gear fields and try again.",
      getZodFieldErrors(parsed.error),
      form.values,
    );
  }

  const { image, ...gearData } = parsed.data;
  const uploaded = image ? await uploadGearImage(image) : null;
  if (uploaded && !uploaded.ok) {
    return errorState(
      uploaded.message,
      { image: [uploaded.message] },
      form.values,
    );
  }

  const result = await updateGearItem(gearId, {
    ...gearData,
    ...(uploaded ? { imageUrl: uploaded.url } : {}),
  });
  if (!result.ok) {
    if (uploaded) await removeUploadedGearImage(uploaded.publicId);
    return errorState(result.error.message, result.error.fieldErrors, form.values);
  }

  invalidateAdmin(["/dashboard/admin", "/dashboard/gear"], [
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
  await requireDashboardRole("ADMIN", "/dashboard/gear");
  const invalidId = validateId(gearId, "Gear ID");
  if (invalidId) return errorState(invalidId);

  const result = await deleteGearItem(gearId);
  if (!result.ok) return apiState(result);

  invalidateAdmin(["/dashboard/admin", "/dashboard/gear"], [
    "gear",
    `gear:${gearId}`,
  ]);
  return successState(result.message);
}
