import * as z from "zod";

export const generatePresignedUrlSchema = z.object({
  filename: z.string().min(1, "The file name is required"),
  contentType: z.string().regex(/^image\/(jpeg|png|webp|avif|gif)$/),
  contentLength: z
    .number()
    .max(5 * 1024 * 1024, "The file exceeds the 5MB limit"),
});

export type GeneratePresignedUrlDTO = z.infer<
  typeof generatePresignedUrlSchema
>;
