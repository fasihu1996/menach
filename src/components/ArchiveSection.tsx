"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ArchiveIcon, RotateCcwIcon } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { startArchivalTransfer } from "@/utils/archive/actions";
import {
    TERMINAL_TRANSFER_STATUSES,
    type ArchivematicaTransfer,
} from "@/utils/archive/types";
import { trackArchiveTransfer } from "@/utils/archive/toastTracker";
import { cn } from "@/lib/utils";
import { useFormatter, useTranslations } from "next-intl";

interface ArchiveSectionProps {
    itemId: number;
    itemTitle: string;
    hasMedia: boolean;
    outdatedArchive: boolean;
    initialTransfer: ArchivematicaTransfer | null;
}

export default function ArchiveSection({
    itemId,
    itemTitle,
    hasMedia,
    outdatedArchive,
    initialTransfer,
}: ArchiveSectionProps) {
    const t = useTranslations("ArchiveSection");
    const format = useFormatter();
    const action = startArchivalTransfer.bind(null, itemId);
    const [state, formAction, isPending] = useActionState(action, null);

    const [transfer, setTransfer] = useState(initialTransfer);

    useEffect(() => {
        if (!transfer || TERMINAL_TRANSFER_STATUSES.includes(transfer.status)) {
            return;
        }

        trackArchiveTransfer(itemId, {
            completeMessage: t("toast-complete", { title: itemTitle }),
            failedMessage: t("toast-failed", { title: itemTitle }),
        });

        const interval = setInterval(async () => {
            const res = await fetch(`/api/archivematica/transfers/${itemId}`);
            if (!res.ok) {
                console.error(`Failed to poll transfer status: ${res.status}`);
                return;
            }
            const data = await res.json();
            setTransfer(data.transfer);
        }, 1000);

        return () => clearInterval(interval);
    }, [itemId, itemTitle, t, transfer]);

    const wasPending = useRef(false);
    useEffect(() => {
        if (wasPending.current && !isPending && !state?.error) {
            toast.success(t("toast-started", { title: itemTitle }));
        }
        wasPending.current = isPending;
    }, [isPending, state, itemTitle, t]);

    let content;

    if (!transfer) {
        content = (
            <form action={formAction}>
                <Button
                    type="submit"
                    variant="outline"
                    disabled={!hasMedia || isPending}
                >
                    <ArchiveIcon data-icon="inline-start" />
                    <span className="sr-only sm:not-sr-only">
                        {isPending ? t("starting") : t("archive")}
                    </span>
                </Button>
            </form>
        );
    } else if (transfer.status === "complete") {
        content = (
            <div className="flex items-center gap-2 sr-only sm:not-sr-only">
                <p
                    className={cn(
                        buttonVariants({ variant: "outline" }),
                        "pointer-events-none text-muted-foreground",
                    )}
                >
                    {t("last-archived")}{" "}
                    {format.dateTime(new Date(transfer.updated_at), {
                        dateStyle: "medium",
                        timeStyle: "short",
                    })}
                </p>
                {outdatedArchive ?
                    <form action={formAction}>
                        <Button
                            type="submit"
                            variant="outline"
                            disabled={!hasMedia || isPending}
                        >
                            {isPending ? t("starting") : t("rearchive")}
                        </Button>
                    </form>
                :   null}
            </div>
        );
    } else {
        const canRetry =
            transfer.status === "failed" || transfer.status === "rejected";

        content = (
            <div className="flex items-center gap-2">
                <span
                    className={cn(
                        buttonVariants({ variant: "outline" }),
                        "pointer-events-none max-w-120 truncate text-muted-foreground",
                    )}
                >
                    {transfer.error_message ??
                        (transfer.current_microservice ?
                            `${transfer.status} — ${transfer.current_microservice}`
                        :   transfer.status)}
                </span>
                {canRetry ?
                    <form action={formAction}>
                        <Button
                            type="submit"
                            variant="outline"
                            size="sm"
                            disabled={!hasMedia || isPending}
                        >
                            <RotateCcwIcon data-icon="inline-start" />
                            <span className="sr-only sm:not-sr-only">
                                {isPending ? t("starting") : t("retry")}
                            </span>
                        </Button>
                    </form>
                :   null}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2">
            {content}
            {state?.error ?
                <p className="text-sm text-destructive">{state.error}</p>
            :   null}
        </div>
    );
}
