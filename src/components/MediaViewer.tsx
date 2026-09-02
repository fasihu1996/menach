"use client";

import { useState } from "react";
import Image from "next/image";
import { FileText, Film, Music, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Media, MediaType } from "@/lib/types";
import { useTranslations } from "next-intl";

interface MediaViewerProps {
    media: (Media & { url: string | null })[];
}

const mediaTypeIcon: Partial<Record<MediaType, typeof FileText>> = {
    MovingImage: Film,
    Text: FileText,
    Sound: Music,
    Interactive: Sparkles,
};

export default function MediaViewer({ media }: MediaViewerProps) {
    const t = useTranslations("Components");
    const [selectedId, setSelectedId] = useState(media[0]?.id ?? null);
    const selected = media.find((entry) => entry.id === selectedId) ?? media[0];

    if (!selected) {
        return (
            <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                {t("no-media")}
            </div>
        );
    }

    const Icon = mediaTypeIcon[selected.media_type] ?? FileText;

    return (
        <div className="flex flex-col gap-3">
            <Card className="p-0">
                <div className="relative flex aspect-video w-full items-center justify-center bg-white">
                    {selected.media_type === "StillImage" && selected.url ?
                        <Image
                            src={selected.url}
                            alt={selected.title}
                            fill
                            sizes="(min-width: 1024px) 800px, 100vw"
                            className="object-contain"
                            unoptimized
                        />
                    : selected.media_type === "MovingImage" && selected.url ?
                        <video
                            key={selected.id}
                            src={selected.url}
                            controls
                            className="h-full w-full"
                        />
                    : selected.media_type === "Sound" && selected.url ?
                        <div className="flex w-full flex-col items-center gap-4 p-8">
                            <Music className="size-16 text-muted-foreground" />
                            <audio
                                key={selected.id}
                                src={selected.url}
                                controls
                                className="w-full max-w-md"
                            />
                        </div>
                    :   <div className="flex flex-col items-center gap-3 text-muted-foreground">
                            <Icon className="size-16" />
                            <span className="text-sm">
                                {selected.media_type}
                            </span>
                            {selected.url ?
                                <a
                                    href={selected.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-sm font-medium text-primary underline"
                                >
                                    {t("open-file")}
                                </a>
                            :   null}
                        </div>
                    }
                </div>
            </Card>

            <div>
                <p className="font-medium">{selected.title}</p>
                <p className="min-h-5 text-sm text-muted-foreground">
                    {selected.description}
                </p>
            </div>

            {media.length > 1 ?
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {media.map((entry) => {
                        const EntryIcon =
                            mediaTypeIcon[entry.media_type] ?? FileText;
                        const isActive = entry.id === selected.id;

                        return (
                            <button
                                key={entry.id}
                                type="button"
                                onClick={() => setSelectedId(entry.id)}
                                className={cn(
                                    "relative aspect-square w-20 shrink-0 overflow-hidden rounded-md border-2",
                                    isActive ? "border-primary" : (
                                        "border-transparent"
                                    ),
                                )}
                            >
                                {(
                                    entry.media_type === "StillImage" &&
                                    entry.url
                                ) ?
                                    <Image
                                        src={entry.url}
                                        alt={entry.title}
                                        fill
                                        sizes="80px"
                                        className="object-cover"
                                    />
                                :   <div className="flex h-full w-full items-center justify-center bg-muted">
                                        <EntryIcon className="size-6 text-muted-foreground" />
                                    </div>
                                }
                            </button>
                        );
                    })}
                </div>
            :   null}
        </div>
    );
}
