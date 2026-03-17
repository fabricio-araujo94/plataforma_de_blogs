import * as z from "zod";

export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, "The comment cannot be empty.")
    .max(1000, "The comment is too long."),
  parentId: z.string().uuid("Invalid parent comment ID.").optional(),
});

export type CreateCommentDTO = z.infer<typeof createCommentSchema>;
