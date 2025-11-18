import { z } from 'zod';
export declare const teamSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    description?: string | undefined;
}, {
    name: string;
    description?: string | undefined;
}>;
export declare const teamMemberRoleSchema: z.ZodEnum<["owner", "admin", "member", "viewer"]>;
export type TeamInput = z.infer<typeof teamSchema>;
export type TeamMemberRole = z.infer<typeof teamMemberRoleSchema>;
//# sourceMappingURL=team.schema.d.ts.map