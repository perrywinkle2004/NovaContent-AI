import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const generatedContentTable = pgTable("generated_content", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull(),
  contentType: text("content_type").notNull(),
  content: text("content").notNull(),
  metadata: text("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertGeneratedContentSchema = createInsertSchema(generatedContentTable).omit({ id: true, createdAt: true });
export type InsertGeneratedContent = z.infer<typeof insertGeneratedContentSchema>;
export type GeneratedContent = typeof generatedContentTable.$inferSelect;
