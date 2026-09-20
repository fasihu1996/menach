"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { insertRow } from "@/utils/supabase";
import { verifyProducerSession } from "@/lib/dal";
import type { Item } from "@/lib/types";

export type CreateItemState = {
    error?: string;
} | null;

export async function createItem(
    _prevState: CreateItemState,
    formData: FormData,
): Promise<CreateItemState> {
    const session = await verifyProducerSession();
    if (!session) {
        return { error: "You must be signed in to do this." };
    }

    const title = (formData.get("title") as string)?.trim();
    if (!title) {
        return { error: "Title is required." };
    }

    const description = (formData.get("description") as string)?.trim() || null;
    const date = (formData.get("date") as string) || null;
    const collectionRaw = formData.get("collection") as string;
    const collection = collectionRaw ? Number(collectionRaw) : null;

    const latitudeRaw = (formData.get("latitude") as string)?.trim();
    const longitudeRaw = (formData.get("longitude") as string)?.trim();

    let location: string | null = null;
    if (latitudeRaw || longitudeRaw) {
        const latitude = Number(latitudeRaw);
        const longitude = Number(longitudeRaw);

        if (!latitudeRaw || !longitudeRaw) {
            return {
                error: "Provide both latitude and longitude, or neither.",
            };
        }

        location = `SRID=4326;POINT(${longitude} ${latitude})`;
    }

    const item = await insertRow<Item>("items", {
        title,
        description,
        date,
        collection,
        location,
    });

    revalidatePath("/");
    redirect(`/${item.id}`);
}
