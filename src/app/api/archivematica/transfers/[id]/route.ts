import { NextResponse } from "next/server";
import { getCurrentTransferForItem } from "@/utils/archive/transfer";

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;
    const itemId = Number(id);

    const transfer = await getCurrentTransferForItem(itemId);
    return NextResponse.json({ transfer });
}
