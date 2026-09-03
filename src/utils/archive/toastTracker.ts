"use client";

import { toast } from "sonner";
import { TERMINAL_TRANSFER_STATUSES } from "./types";

interface TrackedMessages {
    completeMessage: string;
    failedMessage: string;
}

const tracked = new Map<number, TrackedMessages>();
let interval: ReturnType<typeof setInterval> | null = null;

async function poll() {
    for (const [itemId, messages] of tracked) {
        const res = await fetch(`/api/archivematica/transfers/${itemId}`);
        if (!res.ok) continue;

        const { transfer } = await res.json();
        if (!transfer || !TERMINAL_TRANSFER_STATUSES.includes(transfer.status)) {
            continue;
        }

        if (transfer.status === "complete") {
            toast.success(messages.completeMessage);
        } else {
            toast.error(messages.failedMessage);
        }
        tracked.delete(itemId);
    }

    if (tracked.size === 0 && interval) {
        clearInterval(interval);
        interval = null;
    }
}

export function trackArchiveTransfer(
    itemId: number,
    messages: TrackedMessages,
) {
    if (tracked.has(itemId)) return;
    tracked.set(itemId, messages);
    interval ??= setInterval(poll, 2000);
}
