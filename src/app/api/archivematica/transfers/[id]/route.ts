import { NextResponse } from "next/server";
import { getCurrentTransferForItem } from "@/utils/archive/transfer";
import { verifyProducerSession } from "@/lib/dal";

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const session = await verifyProducerSession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const itemId = Number(id);

    const transfer = await getCurrentTransferForItem(itemId);
    return NextResponse.json({ transfer });
}
