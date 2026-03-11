import * as z from "zod";

const blockSchema = z.object({
  id: z.string().optional(),
  type: z.string(),
  data: z.record(z.string(), z.unknown()),
});

export const createPostSchema = z.object({
  title: z.string().min(3, "The title must be at least 3 characters long."),
  content: z.object({
    time: z.number().optional(),
    blocks: z.array(blockSchema),
    version: z.string().optional(),
  }),
  published: z.boolean().default(false).optional(),
});

export const updatePostSchema = createPostSchema.partial();

export type CreatePostDTO = z.infer<typeof createPostSchema>;
export type UpdatePostDTO = z.infer<typeof updatePostSchema>;
