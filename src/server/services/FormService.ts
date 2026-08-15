import { prisma } from "@/infra/db/connect";

export class FormService {
    static async createForm(title: string, userId: string) {
        const form = await prisma.form.create({
            data: { title, userId, schema: [] },
        });
        return form;
    }
    
    static async getForms(userId: string) {
        const forms = await prisma.form.findMany({
            where: { userId },
        });
        return forms;
    }
}
