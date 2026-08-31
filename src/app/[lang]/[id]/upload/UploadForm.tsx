"use client";

import { useActionState, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { uploadMedia } from "./actions";
import type { MediaType } from "@/lib/types";
import { useTranslations } from "next-intl";

const MEDIA_TYPES: MediaType[] = [
    "StillImage",
    "MovingImage",
    "Text",
    "Sound",
    "Interactive",
];

interface UploadFormProps {
    itemId: number;
}

export default function UploadForm({ itemId }: UploadFormProps) {
    const t = useTranslations("UploadForm");

    const action = uploadMedia.bind(null, itemId);
    const [state, formAction, isPending] = useActionState(action, null);

    const nextIdRef = useRef(1);
    const [blockIds, setBlockIds] = useState<number[]>([0]);

    const addBlock = () => {
        setBlockIds((ids) => [...ids, nextIdRef.current++]);
    };

    const removeBlock = (id: number) => {
        setBlockIds((ids) => ids.filter((blockId) => blockId !== id));
    };

    return (
        <form action={formAction} className="flex flex-col gap-4">
            <input type="hidden" name="blockIds" value={blockIds.join(",")} />

            {blockIds.map((id) => (
                <Card key={id}>
                    <CardContent className="flex flex-col gap-3">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor={`file-${id}`}>{t("file")}</Label>
                            {/* this cant be localised since its a native html element */}
                            <Input
                                id={`file-${id}`}
                                name={`file-${id}`}
                                type="file"
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor={`title-${id}`}>{t("title")}</Label>
                            <Input
                                id={`title-${id}`}
                                name={`title-${id}`}
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor={`description-${id}`}>
                                {t("desc")}
                            </Label>
                            <Textarea
                                id={`description-${id}`}
                                name={`description-${id}`}
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor={`date-${id}`}>{t("date")}</Label>
                            <Input
                                id={`date-${id}`}
                                name={`date-${id}`}
                                type="date"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor={`mediaType-${id}`}>
                                {t("media-type")}
                            </Label>
                            <Select
                                name={`mediaType-${id}`}
                                required
                                defaultValue="StillImage"
                            >
                                <SelectTrigger
                                    id={`mediaType-${id}`}
                                    className="w-full"
                                >
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {MEDIA_TYPES.map((mediaType) => (
                                        <SelectItem
                                            key={mediaType}
                                            value={mediaType}
                                        >
                                            {mediaType}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {blockIds.length > 1 ?
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => removeBlock(id)}
                            >
                                {t("remove")}
                            </Button>
                        :   null}
                    </CardContent>
                </Card>
            ))}

            <Button type="button" variant="outline" onClick={addBlock}>
                {t("add-another")}
            </Button>

            {state?.error ?
                <p className="text-sm text-destructive" aria-live="polite">
                    {state.error}
                </p>
            :   null}

            <Button type="submit" disabled={isPending}>
                {isPending ? t("uploading") : t("upload")}
            </Button>
        </form>
    );
}
