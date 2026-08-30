import "dotenv/config";
import type { TransferStatusResult } from "./types";

async function request(path: string, init?: RequestInit) {
    const user = process.env.ARCHIVEMATICA_DASHBOARD_API_USER!;
    const key = process.env.ARCHIVEMATICA_DASHBOARD_API_PASS!;

    const res = await fetch(
        `${process.env.ARCHIVEMATICA_DASHBOARD_URL}${path}`,
        {
            ...init,
            headers: {
                Authorization: `ApiKey ${user}:${key}`,
                ...init?.headers,
            },
        },
    );

    const body = await res.json().catch(() => null);

    if (!res.ok) {
        throw new Error(
            `Archivematica API ${path} returned ${res.status}: ${JSON.stringify(body)}`,
        );
    }

    return body;
}

export async function startTransfer(
    name: string,
    relativePath: string,
): Promise<{ transferUuid: string }> {
    const encodedPath = Buffer.from(
        `${process.env.ARCHIVE_S3_PREFIX}${relativePath}`,
    ).toString("base64");

    const reqBody = JSON.stringify({
        path: encodedPath,
        name: name,
        processing_config: "automated",
        type: "zipfile",
    });

    let attempt = 0;
    while (true) {
        try {
            const body = await request("/api/v2beta/package/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: reqBody,
            });
            return { transferUuid: body.id };
        } catch (err) {
            attempt++;
            if (attempt > 1) throw err;
            await new Promise((resolve) => setTimeout(resolve, 3000));
        }
    }
}

export async function getTransferStatus(
    transferUuid: string,
): Promise<TransferStatusResult> {
    const body = await request(`/api/transfer/status/${transferUuid}/`);
    return {
        status: body.status,
        microservice: body.microservice,
        sipUuid: body.sip_uuid,
        message: body.message,
    };
}

export async function getIngestStatus(
    sipUuid: string,
): Promise<TransferStatusResult> {
    const body = await request(`/api/ingest/status/${sipUuid}/`);
    return {
        status: body.status,
        microservice: body.microservice,
        message: body.message,
    };
}
