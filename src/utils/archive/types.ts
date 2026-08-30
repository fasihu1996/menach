import type { MediaType } from "@/lib/types";

export type TransferStatus =
    | "queued"
    | "packaging"
    | "uploading"
    | "starting"
    | "transfer_processing"
    | "ingest_processing"
    | "complete"
    | "failed"
    | "rejected";

export const TERMINAL_TRANSFER_STATUSES: TransferStatus[] = [
    "complete",
    "failed",
    "rejected",
];

export type TransferEventType =
    | "started"
    | "status_change"
    | "transfer_complete"
    | "completed"
    | "failed";

export type ArchivematicaTransfer = {
    id: string;
    item_id: number;
    status: TransferStatus;
    transfer_name: string;
    am_transfer_uuid: string | null;
    am_sip_uuid: string | null;
    current_microservice: string | null;
    package_s3_key: string | null;
    error_message: string | null;
    created_at: string;
    updated_at: string;
};

export type ArchivematicaTransferEvent = {
    id: string;
    transfer_id: string;
    event_type: TransferEventType;
    microservice: string | null;
    message: string | null;
    created_at: string;
};

export type PackageItem = {
    externalId: string;
    title: string;
    description: string;
    date: string | null;
    collectionTitle: string | null;
};

export type PackageMediaEntry = {
    objectPath: string;
    title: string;
    description: string | null;
    date: string | null;
    mediaType: MediaType;
    localIdentifier: string;
};

export type BuildTransferPackageResult = {
    transferName: string;
    zipPath: string;
};

export type AmUnitStatus = "PROCESSING" | "COMPLETE" | "FAILED" | "REJECTED";

export type TransferStatusResult = {
    status: AmUnitStatus;
    microservice?: string | null;
    sipUuid?: string | null;
    message?: string | null;
};
