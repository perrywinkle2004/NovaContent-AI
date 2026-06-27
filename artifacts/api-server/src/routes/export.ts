import { Router } from "express";
import { db, campaignsTable, generatedContentTable, generatedImagesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../lib/auth";
import { ExportTxtParams } from "@workspace/api-zod";

const router = Router();

router.get("/export/:campaignId/txt", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const params = ExportTxtParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [campaign] = await db
    .select()
    .from(campaignsTable)
    .where(and(eq(campaignsTable.id, params.data.campaignId), eq(campaignsTable.userId, req.userId!)));

  if (!campaign) {
    res.status(404).json({ error: "Campaign not found" });
    return;
  }

  const content = await db
    .select()
    .from(generatedContentTable)
    .where(eq(generatedContentTable.campaignId, campaign.id));

  const images = await db
    .select()
    .from(generatedImagesTable)
    .where(eq(generatedImagesTable.campaignId, campaign.id));

  const lines: string[] = [
    `NOVACONTENT AI - CAMPAIGN EXPORT`,
    `${"=".repeat(50)}`,
    `Campaign: ${campaign.name}`,
    `Product: ${campaign.productName}`,
    `Category: ${campaign.category}`,
    `Tone: ${campaign.tone}`,
    `Goal: ${campaign.goal}`,
    `Audience: ${campaign.audience}`,
    `Platforms: ${campaign.platforms}`,
    `Created: ${new Date(campaign.createdAt).toLocaleDateString()}`,
    ``,
  ];

  for (const item of content) {
    lines.push(`${"=".repeat(50)}`);
    lines.push(`${item.contentType.toUpperCase().replace(/_/g, " ")}`);
    lines.push(`${"=".repeat(50)}`);
    lines.push(item.content);
    lines.push(``);
  }

  if (images.length > 0) {
    lines.push(`${"=".repeat(50)}`);
    lines.push(`GENERATED IMAGES`);
    lines.push(`${"=".repeat(50)}`);
    for (const img of images) {
      lines.push(`${img.imageType}: ${img.imageUrl}`);
    }
  }

  const filename = `${campaign.name.replace(/[^a-z0-9]/gi, "_")}.txt`;
  res.setHeader("Content-Type", "text/plain");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.send(lines.join("\n"));
});

export default router;
