"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { insertRow } from "@/utils/supabase";
import type { Collection } from "@/lib/types";

export type CreateCollectionState = {
    error?: string;
} | null;

export async function createCollection(
    _prevState: CreateCollectionState,
    formData: FormData,
): Promise<CreateCollectionState> {
    const title = (formData.get("title") as string)?.trim();
    const institution = (formData.get("institution") as string)?.trim();
    const city = (formData.get("city") as string)?.trim();
    const country = (formData.get("country") as string)?.trim();
    if (!title || !institution || !city || !country) {
        return {
            error: "Title, institution, city, and country are required.",
        };
    }

    const collection = await insertRow<Collection>("collections", {
        title,
        institution,
        city,
        country,
    });

    revalidatePath("/");
    redirect(`/collections/${collection.id}`);
}
