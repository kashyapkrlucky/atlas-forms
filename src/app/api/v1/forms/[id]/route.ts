import { NextRequest, NextResponse } from "next/server";
import { getUserFromHeaders } from "@/features/auth/utils";
import { prisma } from "@/infra/db/connect";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
    const { id } = await params;
    const user = await getUserFromHeaders(_req);
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const form = await prisma.form.findFirst({ where: { id, userId: user } });
    if (!form) return NextResponse.json({ error: "not_found" }, { status: 404 });

    return NextResponse.json({ form });
}