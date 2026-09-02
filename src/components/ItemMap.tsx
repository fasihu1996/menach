"use client";

import dynamic from "next/dynamic";

const ItemMapInner = dynamic(() => import("./ItemMapInner"), {
    ssr: false,
});

interface ItemMapProps {
    title: string;
    latitude: number;
    longitude: number;
}

export default function ItemMap(props: ItemMapProps) {
    return <ItemMapInner {...props} />;
}
