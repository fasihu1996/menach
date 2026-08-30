"use server";

import { revalidatePath } from "next/cache";
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

    revalidatePath(`/${itemId}`);
    return null;
}
