import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const generatedImagesTable = pgTable("generated_images", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull(),
  imageUrl: text("image_url").notNull(),
  prompt: text("prompt").notNull(),
  imageType: text("image_type").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertGeneratedImageSchema = createInsertSchema(generatedImagesTable).omit({ id: true, createdAt: true });
export type InsertGeneratedImage = z.infer<typeof insertGeneratedImageSchema>;
export type GeneratedImage = typeof generatedImagesTable.$inferSelect;
