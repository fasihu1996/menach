import path from "node:path";
import os from "node:os";
import fs from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { ZipArchive } from "archiver";
import { createServiceClient } from "@/lib/service";
import { getFile } from "@/utils/s3";
import {
    buildMetadataCsv,
    buildIdentifiersJson,
    cleanFilename,
} from "./metadata";
import type {
    BuildTransferPackageResult,
    PackageItem,
    PackageMediaEntry,
} from "./types";
import type { Item, Collection, Media } from "@/lib/types";

function slugify(value: string): string {
    return (
        value
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "") || "item"
    );
}

function zipDirectory(sourceDir: string, zipPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const output = createWriteStream(zipPath);
        const archive = new ZipArchive();

        output.on("close", () => resolve());
        output.on("error", reject);
        archive.on("error", reject);

        archive.pipe(output);
        archive.directory(sourceDir, false);
        archive.finalize();
    });
}

export async function buildTransferPackage(
    itemId: number,
): Promise<BuildTransferPackageResult> {
    const supabase = createServiceClient();

    const { data: item } = await supabase
        .from("items")
        .select("id,title,description,date,collection,external_id")
        .eq("id", itemId)
        .maybeSingle();
    const typedItem = item as Item | null;

    if (!typedItem) {
        throw new Error(`Item ${itemId} not found`);
    }

    let collection: Collection | null = null;
    if (typedItem.collection != null) {
        const { data } = await supabase
            .from("collections")
            .select("id,title")
            .eq("id", typedItem.collection)
            .maybeSingle();
        collection = data as Collection | null;
    }

    const { data: assets } = await supabase
        .from("assets")
        .select("media")
        .eq("item", itemId);

    const mediaIds = (assets ?? []).map((a: { media: number }) => a.media);

    let typedMedia: Media[] = [];
    if (mediaIds.length > 0) {
        const { data: media } = await supabase
            .from("media")
            .select("id,storage_key,title,description,date,media_type")
            .in("id", mediaIds);
        typedMedia = (media ?? []) as Media[];
    }

    if (typedMedia.length === 0) {
        throw new Error(`Item ${itemId} has no attached media`);
    }

    const transferName = `${slugify(typedItem.title)}-${typedItem.external_id.slice(0, 8)}`;
    const workDir = path.join(
        os.tmpdir(),
        `am-${transferName}-${crypto.randomUUID()}`,
    );
    const objectsDir = path.join(workDir, "objects");
    const metadataDir = path.join(workDir, "metadata");
    await fs.mkdir(objectsDir, { recursive: true });
    await fs.mkdir(metadataDir, { recursive: true });

    const taken = new Set<string>();
    const entries: PackageMediaEntry[] = [];

    try {
        for (const row of typedMedia) {
            const objectFilename = cleanFilename(row.storage_key, taken);
            const objectPath = `objects/${objectFilename}`;

            const bytes = await getFile(row.storage_key).arrayBuffer();

            await Bun.write(path.join(workDir, objectPath), bytes);

            entries.push({
                objectPath,
                title: row.title,
                description: row.description,
                date: row.date,
                mediaType: row.media_type,
                localIdentifier: `menach:media:${row.id}`,
            });
        }

        const packageItem: PackageItem = {
            externalId: typedItem.external_id,
            title: typedItem.title,
            description: typedItem.description,
            date: typedItem.date,
            collectionTitle: collection?.title ?? null,
        };

        await Bun.write(
            path.join(metadataDir, "metadata.csv"),
            buildMetadataCsv(packageItem, entries),
        );
        await Bun.write(
            path.join(metadataDir, "identifiers.json"),
            buildIdentifiersJson(packageItem, entries),
        );

        const zipPath = path.join(
            os.tmpdir(),
            `${transferName}-${Date.now()}.zip`,
        );
        await zipDirectory(workDir, zipPath);

        return { transferName, zipPath };
    } finally {
        await fs.rm(workDir, { recursive: true, force: true });
    }
}
