import { z } from 'zod';
// Team validation schema
export const teamSchema = z.object({
    name: z.string().min(1, 'Team name is required').max(200, 'Team name must be 200 characters or less'),
    description: z.string().max(1000, 'Description must be 1,000 characters or less').optional(),
});
// Team member role enum
export const teamMemberRoleSchema = z.enum(['owner', 'admin', 'member', 'viewer']);
//# sourceMappingURL=team.schema.js.map