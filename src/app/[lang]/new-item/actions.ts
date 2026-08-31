"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { insertRow } from "@/utils/supabase";
import type { Item } from "@/lib/types";

export type CreateItemState = {
    error?: string;
} | null;

export async function createItem(
    _prevState: CreateItemState,
    formData: FormData,
): Promise<CreateItemState> {
    const title = (formData.get("title") as string)?.trim();
    const description = (formData.get("description") as string)?.trim();
    if (!title || !description) {
        return { error: "Title and description are required." };
    }

    const date = (formData.get("date") as string) || null;
    const collectionRaw = formData.get("collection") as string;
    const collection = collectionRaw ? Number(collectionRaw) : null;

    const item = await insertRow<Item>("items", {
        title,
        description,
        date,
        collection,
    });

    revalidatePath("/");
    redirect(`/${item.id}`);
}
