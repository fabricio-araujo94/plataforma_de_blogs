import crypto from "crypto";

export function generateSlud(title: string): string {
  const baseSlug = title
    .toLowerCase()
    .normalize("NFD") // Separates accents from letters
    .replace(/[\u0300-\u036f]/g, "") // Removes accents
    .replace(/[^\w\s-]/g, "") // Removes special characters
    .replace(/\s+/g, "-") // Replaces spaces with hyphens
    .replace(/-+/g, "-") // Removes duplicate hyphens
    .trim();

  const randomSuffix = crypto.randomBytes(3).toString("hex");

  return `${baseSlug}-${randomSuffix}`;
}
