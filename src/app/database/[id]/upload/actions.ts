"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { insertRow } from "@/utils/supabase";
import { putFile } from "@/utils/s3";
import type { Media, MediaType } from "@/lib/types";

export type UploadMediaState = {
    error?: string;
} | null;

export async function uploadMedia(
    itemId: number,
    _prevState: UploadMediaState,
    formData: FormData,
): Promise<UploadMediaState> {
    const blockIds = ((formData.get("blockIds") as string) || "")
        .split(",")
        .filter(Boolean);

    if (blockIds.length === 0) {
        return { error: "Add at least one file." };
    }

    let uploadedCount = 0;

    for (const blockId of blockIds) {
        const file = formData.get(`file-${blockId}`) as File | null;
        if (!file || file.size === 0) continue;

        const title = (
            formData.get(`title-${blockId}`) as string
        )?.trim();
        const description =
            (formData.get(`description-${blockId}`) as string) || null;
        const date = (formData.get(`date-${blockId}`) as string) || null;
        const mediaType = formData.get(`mediaType-${blockId}`) as MediaType;

        if (!title || !mediaType) {
            return { error: "Each file needs a title and a media type." };
        }

        const storageKey = `${crypto.randomUUID()}-${file.name}`;
        await putFile(storageKey, file);

        const media = await insertRow<Media>("media", {
            storage_key: storageKey,
            title,
            description,
            date,
            media_type: mediaType,
        });

        await insertRow("assets", { item: itemId, media: media.id });
        uploadedCount++;
    }

    if (uploadedCount === 0) {
        return { error: "No files were attached." };
    }

    revalidatePath(`/database/${itemId}`);
    revalidatePath("/database");
    redirect(`/database/${itemId}`);
}
