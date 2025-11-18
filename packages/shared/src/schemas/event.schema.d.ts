import { z } from 'zod';
export declare const eventSchema: z.ZodObject<{
    teamId: z.ZodString;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    location: z.ZodString;
    startDate: z.ZodDate;
    endDate: z.ZodDate;
    timezone: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    teamId: string;
    title: string;
    location: string;
    startDate: Date;
    endDate: Date;
    timezone: string;
    description?: string | undefined;
}, {
    teamId: string;
    title: string;
    location: string;
    startDate: Date;
    endDate: Date;
    description?: string | undefined;
    timezone?: string | undefined;
}>;
export declare const eventSchemaWithDateValidation: z.ZodEffects<z.ZodObject<{
    teamId: z.ZodString;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    location: z.ZodString;
    startDate: z.ZodDate;
    endDate: z.ZodDate;
    timezone: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    teamId: string;
    title: string;
    location: string;
    startDate: Date;
    endDate: Date;
    timezone: string;
    description?: string | undefined;
}, {
    teamId: string;
    title: string;
    location: string;
    startDate: Date;
    endDate: Date;
    description?: string | undefined;
    timezone?: string | undefined;
}>, {
    teamId: string;
    title: string;
    location: string;
    startDate: Date;
    endDate: Date;
    timezone: string;
    description?: string | undefined;
}, {
    teamId: string;
    title: string;
    location: string;
    startDate: Date;
    endDate: Date;
    description?: string | undefined;
    timezone?: string | undefined;
}>;
export declare const createEventSchema: z.ZodEffects<z.ZodObject<{
    teamId: z.ZodString;
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    location: z.ZodString;
    startDate: z.ZodDate;
    endDate: z.ZodDate;
    timezone: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    teamId: string;
    title: string;
    location: string;
    startDate: Date;
    endDate: Date;
    timezone: string;
    description?: string | undefined;
}, {
    teamId: string;
    title: string;
    location: string;
    startDate: Date;
    endDate: Date;
    description?: string | undefined;
    timezone?: string | undefined;
}>, {
    teamId: string;
    title: string;
    location: string;
    startDate: Date;
    endDate: Date;
    timezone: string;
    description?: string | undefined;
}, {
    teamId: string;
    title: string;
    location: string;
    startDate: Date;
    endDate: Date;
    description?: string | undefined;
    timezone?: string | undefined;
}>;
export declare const updateEventSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodString>;
    startDate: z.ZodOptional<z.ZodDate>;
    endDate: z.ZodOptional<z.ZodDate>;
    timezone: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    title?: string | undefined;
    description?: string | undefined;
    location?: string | undefined;
    startDate?: Date | undefined;
    endDate?: Date | undefined;
    timezone?: string | undefined;
}, {
    title?: string | undefined;
    description?: string | undefined;
    location?: string | undefined;
    startDate?: Date | undefined;
    endDate?: Date | undefined;
    timezone?: string | undefined;
}>;
export type EventInput = z.infer<typeof eventSchema>;
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
//# sourceMappingURL=event.schema.d.ts.map