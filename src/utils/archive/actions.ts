"use server";

import { revalidatePath } from "next/cache";
import { createQueuedTransfer, getActiveTransferForItem } from "./transfer";
import { routing } from "@/i18n/routing";

export type StartArchivalTransferState = { error?: string } | null;

export async function startArchivalTransfer(
    itemId: number,
    _prevState: StartArchivalTransferState,
    _formData: FormData,
): Promise<StartArchivalTransferState> {
    const existing = await getActiveTransferForItem(itemId);
    if (existing) {
        return { error: "A transfer is already in progress for this item." };
    }

    await createQueuedTransfer(itemId);

    for (const locale of routing.locales) {
        revalidatePath(`/${locale}/${itemId}`);
    }
    return null;
}
