import { NextResponse } from "next/server";
import {
    getCurrentTransferForItem,
    getTransferEvents,
} from "@/utils/archive/transfer";

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;
    const itemId = Number(id);

    const transfer = await getCurrentTransferForItem(itemId);

    if (!transfer) {
        return NextResponse.json({ transfer: null, events: [] });
    }

    const events = await getTransferEvents(transfer.id);
    return NextResponse.json({ transfer, events });
}
