import { S3Client } from "bun";
import { createServiceClient } from "@/lib/service";
import {
    TERMINAL_TRANSFER_STATUSES,
    type ArchivematicaTransfer,
    type TransferEventType,
    type TransferStatus,
} from "./types";

const transferSourceClient = new S3Client({
    accessKeyId: process.env.ARCHIVE_S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.ARCHIVE_S3_SECRET_ACCESS_KEY!,
    bucket: process.env.ARCHIVE_S3_BUCKET,
    endpoint: process.env.ARCHIVE_S3_ENDPOINT,
    region: process.env.ARCHIVE_S3_REGION,
});

async function waitUntilVisible(
    key: string,
    attempts = 5,
    delayMs = 500,
): Promise<void> {
    for (let attempt = 0; attempt < attempts; attempt++) {
        if (await transferSourceClient.exists(key)) return;
        await new Promise((resolve) =>
            setTimeout(resolve, delayMs * 2 ** attempt),
        );
    }
    throw new Error(`Transfer package ${key} never became visible in S3`);
}

export async function uploadTransferPackage(
    zipPath: string,
    transferName: string,
): Promise<{ key: string; relativePath: string }> {
    const prefix = (process.env.ARCHIVE_S3_PREFIX ?? "").replace(/\/$/, "");
    const relativePath = `${transferName}.zip`;
    const key = prefix ? `${prefix}/${relativePath}` : relativePath;

    await transferSourceClient.write(key, Bun.file(zipPath));
    await waitUntilVisible(key);

    return { key, relativePath };
}

export async function getActiveTransferForItem(
    itemId: number,
): Promise<ArchivematicaTransfer | null> {
    const supabase = createServiceClient();
    const { data } = await supabase
        .from("archivematica_transfers")
        .select("*")
        .eq("item_id", itemId)
        .notIn("status", TERMINAL_TRANSFER_STATUSES)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
    return data as ArchivematicaTransfer | null;
}

export async function getCurrentTransferForItem(
    itemId: number,
): Promise<ArchivematicaTransfer | null> {
    const active = await getActiveTransferForItem(itemId);
    if (active) return active;

    const supabase = createServiceClient();
    const { data } = await supabase
        .from("archivematica_transfers")
        .select("*")
        .eq("item_id", itemId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
    return data as ArchivematicaTransfer | null;
}

export async function createQueuedTransfer(
    itemId: number,
): Promise<ArchivematicaTransfer> {
    const supabase = createServiceClient();
    const { data, error } = await supabase
        .from("archivematica_transfers")
        .insert({
            item_id: itemId,
            status: "queued",
            transfer_name: "",
        })
        .select()
        .single();
    if (error) throw error;
    return data as ArchivematicaTransfer;
}

export async function getTransfersByStatus(
    statuses: TransferStatus[],
): Promise<ArchivematicaTransfer[]> {
    const supabase = createServiceClient();
    const { data } = await supabase
        .from("archivematica_transfers")
        .select("*")
        .in("status", statuses);
    return (data ?? []) as ArchivematicaTransfer[];
}

export async function updateTransfer(
    id: string,
    values: Partial<ArchivematicaTransfer>,
): Promise<void> {
    const supabase = createServiceClient();
    await supabase
        .from("archivematica_transfers")
        .update({ ...values, updated_at: new Date().toISOString() })
        .eq("id", id);
}

export async function insertTransferEvent(
    transferId: string,
    eventType: TransferEventType,
    payload?: {
        microservice?: string | null;
        message?: string | null;
    },
): Promise<void> {
    const supabase = createServiceClient();
    await supabase.from("archivematica_transfer_events").insert({
        transfer_id: transferId,
        event_type: eventType,
        microservice: payload?.microservice ?? null,
        message: payload?.message ?? null,
    });
}
