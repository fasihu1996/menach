"use client";

import dynamic from "next/dynamic";

const ItemMapInner = dynamic(() => import("./ItemMapInner"), {
    ssr: false,
    loading: () => (
        <div className="h-128 w-full animate-pulse rounded-lg border bg-muted" />
    ),
});

interface ItemMapProps {
    title: string;
    latitude: number;
    longitude: number;
}

export default function ItemMap(props: ItemMapProps) {
    return <ItemMapInner {...props} />;
}
