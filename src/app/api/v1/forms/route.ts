import { getUserFromHeaders } from "@/features/auth/utils";
import { NextRequest } from "next/server";
import { FormService } from "@/server/services/FormService";

export async function POST(request: NextRequest) {
    try {
        const user = await getUserFromHeaders(request);
        if (!user) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { title } = await request.json();
        if (!title) {
            return Response.json({ error: "Title is required" }, { status: 400 });
        }

        const form = await FormService.createForm(title, user);
        return Response.json(form);
    } catch (error) {
        console.error("Failed to create form:", error);
        return Response.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const user = await getUserFromHeaders(request);
        if (!user) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const forms = await FormService.getForms(user);
        return Response.json(forms);
    } catch (error) {
        return Response.json({ error: "Internal server error" }, { status: 500 });
    }
}