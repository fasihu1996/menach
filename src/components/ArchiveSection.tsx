"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { startArchivalTransfer } from "@/utils/archive/actions";
import {
    TERMINAL_TRANSFER_STATUSES,
    type ArchivematicaTransfer,
    type ArchivematicaTransferEvent,
} from "@/utils/archive/types";
import { useFormatter, useTranslations } from "next-intl";

interface ArchiveSectionProps {
    itemId: number;
    hasMedia: boolean;
    outdatedArchive: boolean;
    initialTransfer: ArchivematicaTransfer | null;
    initialEvents: ArchivematicaTransferEvent[];
}

export default function ArchiveSection({
    itemId,
    hasMedia,
    outdatedArchive,
    initialTransfer,
    initialEvents,
}: ArchiveSectionProps) {
    const t = useTranslations("ArchiveSection");
    const format = useFormatter();
    const action = startArchivalTransfer.bind(null, itemId);
    const [state, formAction, isPending] = useActionState(action, null);

    const [transfer, setTransfer] = useState(initialTransfer);
    const [events, setEvents] = useState(initialEvents);

    useEffect(() => {
        if (!transfer || TERMINAL_TRANSFER_STATUSES.includes(transfer.status)) {
            return;
        }

        const interval = setInterval(async () => {
            const res = await fetch(`/api/archivematica/transfers/${itemId}`);
            if (!res.ok) {
                console.error(`Failed to poll transfer status: ${res.status}`);
                return;
            }
            const data = await res.json();
            setTransfer(data.transfer);
            setEvents(data.events);
        }, 1000);

        return () => clearInterval(interval);
    }, [itemId, transfer]);

    let content;

    if (!transfer) {
        content = (
            <form action={formAction}>
                <Button
                    type="submit"
                    variant="outline"
                    disabled={!hasMedia || isPending}
                >
                    {isPending ? t("starting") : t("archive")}
                </Button>
            </form>
        );
    } else if (transfer.status === "complete") {
        content = (
            <div className="flex flex-col gap-2">
                <p className="text-sm text-muted-foreground">
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
                            size="sm"
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
            <Card>
                <CardContent className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-4">
                        <span className="text-sm font-medium">
                            {t("archival-transfer")}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {transfer.status}
                            {transfer.current_microservice ?
                                ` — ${transfer.current_microservice}`
                            :   ""}
                        </span>
                    </div>
                    {transfer.error_message ?
                        <p className="text-sm text-destructive">
                            {transfer.error_message}
                        </p>
                    :   null}
                    {events.length > 0 ?
                        <ul className="flex flex-col gap-1 text-xs text-muted-foreground">
                            {events.slice(-5).map((event) => (
                                <li key={event.id}>
                                    {format.dateTime(
                                        new Date(event.created_at),
                                        { timeStyle: "short" },
                                    )}{" "}
                                    — {event.event_type}
                                    {event.microservice ?
                                        ` (${event.microservice})`
                                    :   ""}
                                </li>
                            ))}
                        </ul>
                    :   null}
                    {canRetry ?
                        <form action={formAction}>
                            <Button
                                type="submit"
                                variant="outline"
                                size="sm"
                                disabled={!hasMedia || isPending}
                            >
                                {isPending ? t("starting") : t("retry")}
                            </Button>
                        </form>
                    :   null}
                </CardContent>
            </Card>
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
