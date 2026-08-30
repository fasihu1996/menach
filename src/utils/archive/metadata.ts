import { stringify } from "csv-stringify/sync";
import type { PackageItem, PackageMediaEntry } from "./types";

/* remove UUID params from filename to avoid am failure due to filename.zip-UUID format */
export function cleanFilename(storageKey: string, taken: Set<string>): string {
    const original = storageKey.replace(/^[0-9a-f-]{36}-/i, "");
    const cleaned = original.replace(/[^A-Za-z0-9._-]/g, "_") || "file";

    if (!taken.has(cleaned)) {
        taken.add(cleaned);
        return cleaned;
    }

    const dot = cleaned.lastIndexOf(".");
    const base = dot > 0 ? cleaned.slice(0, dot) : cleaned;
    const ext = dot > 0 ? cleaned.slice(dot) : "";

    let n = 2;
    let candidate = `${base}_${n}${ext}`;
    while (taken.has(candidate)) {
        n++;
        candidate = `${base}_${n}${ext}`;
    }
    taken.add(candidate);
    return candidate;
}

const METADATA_CSV_COLUMNS = [
    "filename",
    "dc.title",
    "dc.description",
    "dc.date",
    "dc.type",
    "dc.identifier",
    "dc.relation",
];

export function buildMetadataCsv(
    item: PackageItem,
    entries: PackageMediaEntry[],
): string {
    const rows = [
        {
            filename: "objects",
            "dc.title": item.title,
            "dc.description": item.description,
            "dc.date": item.date ?? "",
            "dc.type": "",
            "dc.identifier": item.externalId,
            "dc.relation": item.collectionTitle ?? "",
        },
        ...entries.map((entry) => ({
            filename: entry.objectPath,
            "dc.title": entry.title,
            "dc.description": entry.description ?? "",
            "dc.date": entry.date ?? "",
            "dc.type": entry.mediaType,
            "dc.identifier": entry.localIdentifier,
            "dc.relation": "",
        })),
    ];

    return stringify(rows, { header: true, columns: METADATA_CSV_COLUMNS });
}

export function buildIdentifiersJson(
    item: PackageItem,
    entries: PackageMediaEntry[],
): string {
    const payload = [
        {
            file: "objects",
            identifiers: [
                { identifierType: "local-uuid", identifier: item.externalId },
            ],
        },
        ...entries.map((entry) => ({
            file: entry.objectPath,
            identifiers: [
                { identifierType: "local", identifier: entry.localIdentifier },
            ],
        })),
    ];

    return JSON.stringify(payload, null, 2);
}
