import "dotenv/config";
import fs from "node:fs/promises";
import { buildTransferPackage } from "./package";
import {
    uploadTransferPackage,
    getTransfersByStatus,
    updateTransfer,
    insertTransferEvent,
} from "./transfer";
import { startTransfer, getTransferStatus, getIngestStatus } from "./client";

async function processQueuedTransfers() {
    const queued = await getTransfersByStatus(["queued"]);

    for (const transfer of queued) {
        try {
            await updateTransfer(transfer.id, { status: "packaging" });
            const pkg = await buildTransferPackage(transfer.item_id);

            await updateTransfer(transfer.id, {
                status: "uploading",
                transfer_name: pkg.transferName,
            });

            const { key, relativePath } = await uploadTransferPackage(
                pkg.zipPath,
                pkg.transferName,
            );
            await fs.rm(pkg.zipPath, { force: true });

            await updateTransfer(transfer.id, {
                status: "starting",
                package_s3_key: key,
            });

            const { transferUuid } = await startTransfer(
                pkg.transferName,
                relativePath,
            );

            await updateTransfer(transfer.id, {
                status: "transfer_processing",
                am_transfer_uuid: transferUuid,
            });
            await insertTransferEvent(transfer.id, "started", {
                message: `Transfer ${transferUuid} started`,
            });
        } catch (err) {
            const message = String(err);
            await updateTransfer(transfer.id, {
                status: "failed",
                error_message: message,
            });
            await insertTransferEvent(transfer.id, "failed", { message });
            console.error(`Transfer ${transfer.id} failed:`, err);
        }
    }
}

async function pollActiveTransfers() {
    const active = await getTransfersByStatus([
        "transfer_processing",
        "ingest_processing",
    ]);

    for (const transfer of active) {
        try {
            const inIngest = Boolean(transfer.am_sip_uuid);
            const result =
                inIngest ?
                    await getIngestStatus(transfer.am_sip_uuid!)
                :   await getTransferStatus(transfer.am_transfer_uuid!);

            switch (result.status) {
                case "COMPLETE":
                    if (!inIngest && result.sipUuid) {
                        await updateTransfer(transfer.id, {
                            status: "ingest_processing",
                            am_sip_uuid: result.sipUuid,
                        });
                        await insertTransferEvent(
                            transfer.id,
                            "transfer_complete",
                            { message: "Transfer complete, ingest started" },
                        );
                    } else if (inIngest) {
                        await updateTransfer(transfer.id, {
                            status: "complete",
                        });
                        await insertTransferEvent(transfer.id, "completed");
                    }
                    break;

                case "FAILED":
                case "REJECTED":
                    await updateTransfer(transfer.id, {
                        status:
                            result.status === "FAILED" ? "failed" : "rejected",
                        error_message: result.message ?? null,
                    });
                    await insertTransferEvent(transfer.id, "failed", {
                        message: result.message,
                    });
                    break;

                default:
                    if (result.microservice !== transfer.current_microservice) {
                        await updateTransfer(transfer.id, {
                            current_microservice: result.microservice ?? null,
                        });
                        await insertTransferEvent(
                            transfer.id,
                            "status_change",
                            {
                                microservice: result.microservice,
                            },
                        );
                    }
            }
        } catch (err) {
            console.error(`Failed to poll transfer ${transfer.id}:`, err);
        }
    }
}

async function main() {
    console.log("Archivematica worker started");
    for (;;) {
        await processQueuedTransfers().catch((err) =>
            console.error("processQueuedTransfers failed:", err),
        );
        await pollActiveTransfers().catch((err) =>
            console.error("pollActiveTransfers failed:", err),
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }
}

main();
