"use client";

import "leaflet/dist/leaflet.css";
import { divIcon } from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { MapPin } from "lucide-react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";

const markerIcon = divIcon({
    html: renderToStaticMarkup(
        <MapPin
            className="text-primary"
            fill="currentColor"
            size={32}
            strokeWidth={1.5}
        />,
    ),
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
});

interface ItemMapInnerProps {
    title: string;
    latitude: number;
    longitude: number;
}

export default function ItemMapInner({
    latitude,
    longitude,
}: ItemMapInnerProps) {
    return (
        <MapContainer
            center={[latitude, longitude]}
            zoom={13}
            scrollWheelZoom={false}
            className="h-128 w-full rounded-lg"
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[latitude, longitude]} icon={markerIcon} />
        </MapContainer>
    );
}
