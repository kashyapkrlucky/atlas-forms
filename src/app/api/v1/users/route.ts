import { prisma } from "@/infra/db/connect";


export async function POST(request: Request) {
    try {
        const body = await request.json();
        const user = await prisma.user.findUnique({
            where: {
                email: body.email
            }
        });
        if(user) {
            return Response.json({ message: "User already exists" });
        }

        await prisma.user.create({
            data: body
        });
        return Response.json({ message: "User created" });
    } catch (error) {
        console.error(error);
        return Response.json({ message: "Error creating user" }, { status: 500 });
    }
}
