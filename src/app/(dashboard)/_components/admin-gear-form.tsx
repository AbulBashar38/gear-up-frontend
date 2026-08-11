"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PackagePlus, Save } from "lucide-react";
import type { AdminUser, Category, GearItem } from "@/lib/types";
import { PhotoUpload } from "@/components/shared/photo-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import {
  GEAR_IMAGE_ACCEPT,
  GEAR_IMAGE_MAX_BYTES,
  GEAR_IMAGE_MAX_FILES,
  GEAR_IMAGE_MIME_TYPES,
} from "@/lib/image-upload";
import { createGearAction, updateGearAction } from "../_actions/admin-actions";
import {
  AdminActionMessage,
  AdminFieldError,
  INITIAL_ADMIN_MUTATION_STATE,
  useAdminMutationToast,
} from "./admin-mutation-feedback";

type AdminGearFormProps = {
  categories: Category[];
  providers?: AdminUser[];
  gear?: GearItem;
  // Admins assign the listing to an active provider. Providers own their gear
  // implicitly, so the field is hidden and no providerId is sent for them.
  canAssignProvider?: boolean;
};

export function AdminGearForm({
  categories,
  providers = [],
  gear,
  canAssignProvider = true,
}: AdminGearFormProps) {
  const router = useRouter();
  const actionFunction = gear
    ? updateGearAction.bind(null, gear.id)
    : createGearAction;
  const [state, action, pending] = useActionState(
    actionFunction,
    INITIAL_ADMIN_MUTATION_STATE,
  );
  useAdminMutationToast(state);

  useEffect(() => {
    if (state.status === "success") {
      router.push("/dashboard/gear");
      router.refresh();
    }
  }, [router, state.status]);

  const fields = state.fieldErrors ?? {};
  const values = state.values ?? {};
  const initialAvailability = state.values
    ? state.values.isAvailable === "true"
    : (gear?.isAvailable ?? true);

  return (
    <form action={action} noValidate className="border border-ink/15 bg-card p-6 sm:p-8">
      <div className="grid gap-6 lg:grid-cols-2">
        {!gear && canAssignProvider && (
          <div>
            <Label htmlFor="gear-provider" className="font-bold">Provider</Label>
            <NativeSelect name="providerId" defaultValue={values.providerId} disabled={pending} className="mt-2 w-full" aria-invalid={Boolean(fields.providerId)} aria-describedby={fields.providerId ? "gear-provider-error" : undefined}>
              <NativeSelectOption value="">Choose an active provider</NativeSelectOption>
              {providers.map((provider) => (
                <NativeSelectOption key={provider.id} value={provider.id}>{provider.name} — {provider.email}</NativeSelectOption>
              ))}
            </NativeSelect>
            <AdminFieldError id="gear-provider-error" messages={fields.providerId} />
          </div>
        )}

        <div>
          <Label htmlFor="gear-category" className="font-bold">Category</Label>
          <NativeSelect name="categoryId" defaultValue={values.categoryId ?? gear?.categoryId ?? ""} disabled={pending} className="mt-2 w-full" aria-invalid={Boolean(fields.categoryId)} aria-describedby={fields.categoryId ? "gear-category-error" : undefined}>
            <NativeSelectOption value="">Choose a category</NativeSelectOption>
            {categories.map((category) => (
              <NativeSelectOption key={category.id} value={category.id}>{category.name}</NativeSelectOption>
            ))}
          </NativeSelect>
          <AdminFieldError id="gear-category-error" messages={fields.categoryId} />
        </div>

        {gear && canAssignProvider && (
          <div>
            <Label className="font-bold">Provider</Label>
            <div className="mt-2 min-h-11 border border-ink/15 bg-mist/45 px-3 py-2 text-sm">
              {gear.provider.name} <span className="text-ink/55">(provider cannot be reassigned)</span>
            </div>
          </div>
        )}

        <div className="lg:col-span-2">
          <Label htmlFor="gear-name" className="font-bold">Listing name</Label>
          <Input id="gear-name" name="name" required minLength={2} maxLength={255} disabled={pending} defaultValue={values.name ?? gear?.name} aria-invalid={Boolean(fields.name)} aria-describedby={fields.name ? "gear-name-error" : undefined} className="mt-2 h-11 rounded-none" />
          <AdminFieldError id="gear-name-error" messages={fields.name} />
        </div>

        <div className="lg:col-span-2">
          <Label htmlFor="gear-description" className="font-bold">Description</Label>
          <Textarea id="gear-description" name="description" required minLength={10} disabled={pending} defaultValue={values.description ?? gear?.description} aria-invalid={Boolean(fields.description)} aria-describedby={fields.description ? "gear-description-error" : undefined} className="mt-2" />
          <AdminFieldError id="gear-description-error" messages={fields.description} />
        </div>

        <div>
          <Label htmlFor="gear-stock" className="font-bold">Stock</Label>
          <Input id="gear-stock" name="stock" type="number" inputMode="numeric" min={0} step={1} required disabled={pending} defaultValue={values.stock ?? gear?.stock ?? 0} aria-invalid={Boolean(fields.stock)} aria-describedby={fields.stock ? "gear-stock-error" : undefined} className="mt-2 h-11 rounded-none" />
          <AdminFieldError id="gear-stock-error" messages={fields.stock} />
        </div>

        <div>
          <Label htmlFor="gear-price" className="font-bold">Daily price</Label>
          <Input id="gear-price" name="pricePerDay" type="number" inputMode="decimal" min="0.01" max="99999999.99" step="0.01" required disabled={pending} defaultValue={values.pricePerDay ?? gear?.pricePerDay} aria-invalid={Boolean(fields.pricePerDay)} aria-describedby={fields.pricePerDay ? "gear-price-error" : undefined} className="mt-2 h-11 rounded-none" />
          <AdminFieldError id="gear-price-error" messages={fields.pricePerDay} />
        </div>

        <div>
          <Label htmlFor="gear-brand" className="font-bold">Brand <span className="font-normal text-ink/55">(optional)</span></Label>
          <Input id="gear-brand" name="brand" maxLength={255} disabled={pending} defaultValue={values.brand ?? gear?.brand ?? ""} aria-invalid={Boolean(fields.brand)} aria-describedby={fields.brand ? "gear-brand-error" : undefined} className="mt-2 h-11 rounded-none" />
          <AdminFieldError id="gear-brand-error" messages={fields.brand} />
        </div>

        <PhotoUpload
          id="gear-image"
          name="images"
          label="Gear image gallery"
          hint="Choose up to four clear photos. JPEG, PNG, WebP, or AVIF; maximum 5 MB each."
          accept={GEAR_IMAGE_ACCEPT}
          acceptedTypes={GEAR_IMAGE_MIME_TYPES}
          maxBytes={GEAR_IMAGE_MAX_BYTES}
          maxFiles={GEAR_IMAGE_MAX_FILES}
          disabled={pending}
          optional
          defaultPreviewUrls={Array.from(
            new Set([gear?.imageUrl, ...(gear?.imageUrls ?? [])].filter((url): url is string => Boolean(url))),
          )}
          errors={fields.images}
          className="lg:col-span-2"
        />

        <label className="flex min-h-14 items-center gap-3 border border-ink/15 bg-mist/45 px-4 lg:col-span-2">
          <input name="isAvailable" type="checkbox" defaultChecked={initialAvailability} disabled={pending} className="size-5 accent-[var(--signal)]" />
          <span>
            <span className="block text-sm font-extrabold">Available for rental requests</span>
            <span className="block text-xs text-ink/60">Stock and date conflicts are still checked by the backend.</span>
          </span>
        </label>
      </div>

      <AdminActionMessage state={state} className="mt-6" />
      <div className="mt-7 flex flex-wrap gap-3 border-t border-ink/12 pt-6">
        <Button type="submit" size="lg" disabled={pending || categories.length === 0 || (!gear && canAssignProvider && providers.length === 0)}>
          {gear ? <Save aria-hidden="true" /> : <PackagePlus aria-hidden="true" />}
          {pending ? "Uploading & saving…" : gear ? "Save listing" : "Create listing"}
        </Button>
        <Button type="button" variant="outline" size="lg" disabled={pending} onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  );
}
