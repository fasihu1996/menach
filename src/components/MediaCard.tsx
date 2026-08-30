import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardDescription,
} from "@/components/ui/card";
import Image from "next/image";
import { FileText, Film, ImageIcon, Music, Sparkles } from "lucide-react";
import type { Media, MediaType } from "@/lib/types";

interface MediaCardProps {
    media: Media;
    imageURL: string | null;
}

const mediaTypeIcon: Record<MediaType, typeof FileText> = {
    StillImage: ImageIcon,
    MovingImage: Film,
    Text: FileText,
    Sound: Music,
    Interactive: Sparkles,
};

export default function MediaCard({ media, imageURL }: MediaCardProps) {
    const Icon = mediaTypeIcon[media.media_type];

    return (
        <Card className="h-full">
            <CardHeader>
                <div className="p-2">
                    {media.media_type === "StillImage" && imageURL ?
                        <div className="relative aspect-square w-full overflow-hidden rounded-md">
                            <Image
                                src={imageURL}
                                alt={media.title}
                                fill
                                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                                className="object-cover"
                                unoptimized
                            />
                        </div>
                    :   <div className="flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed text-sm text-muted-foreground">
                            <Icon className="size-8" />
                            {media.media_type}
                        </div>
                    }
                </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-1">
                <CardTitle className="truncate p-1 text-base font-bold">
                    {media.title}
                </CardTitle>
                {media.description ?
                    <CardDescription className="line-clamp-2 p-1">
                        {media.description}
                    </CardDescription>
                :   null}
                {media.date ?
                    <CardDescription className="p-1">
                        {media.date}
                    </CardDescription>
                :   null}
            </CardContent>
        </Card>
    );
}
