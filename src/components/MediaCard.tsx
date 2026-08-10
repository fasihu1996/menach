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
        <Card>
            <CardHeader>
                <div className="p-2">
                    {media.media_type === "StillImage" && imageURL ?
                        <Image
                            src={imageURL}
                            alt={media.title}
                            width={400}
                            height={400}
                            unoptimized
                        />
                    :   <div className="flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed text-sm text-muted-foreground">
                            <Icon className="size-8" />
                            {media.media_type}
                        </div>
                    }
                </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-1">
                <CardTitle className="p-1 text-base font-bold">
                    {media.title}
                </CardTitle>
                {media.description ?
                    <CardDescription className="p-1">
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
