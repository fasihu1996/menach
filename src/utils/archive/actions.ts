"use server";

import { revalidatePath } from "next/cache";
import { getLocale } from "next-intl/server";
import { createQueuedTransfer, getActiveTransferForItem } from "./transfer";

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

    const locale = await getLocale();
    revalidatePath(`/${locale}/${itemId}`);
    return null;
}
