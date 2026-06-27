import { Router } from "express";
import { db, campaignsTable, generatedContentTable, generatedImagesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../lib/auth";
import {
  CreateCampaignBody,
  UpdateCampaignBody,
  GetCampaignParams,
  UpdateCampaignParams,
  DeleteCampaignParams,
  DuplicateCampaignParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/campaigns", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const campaigns = await db
    .select()
    .from(campaignsTable)
    .where(eq(campaignsTable.userId, req.userId!))
    .orderBy(campaignsTable.createdAt);
  res.json(campaigns);
});

router.post("/campaigns", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const parsed = CreateCampaignBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [campaign] = await db
    .insert(campaignsTable)
    .values({ ...parsed.data, userId: req.userId! })
    .returning();
  res.status(201).json(campaign);
});

router.get("/campaigns/:id", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const params = GetCampaignParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [campaign] = await db
    .select()
    .from(campaignsTable)
    .where(and(eq(campaignsTable.id, params.data.id), eq(campaignsTable.userId, req.userId!)));
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
  res.json({ ...campaign, content, images });
});

router.put("/campaigns/:id", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const params = UpdateCampaignParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateCampaignBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [campaign] = await db
    .update(campaignsTable)
    .set(parsed.data)
    .where(and(eq(campaignsTable.id, params.data.id), eq(campaignsTable.userId, req.userId!)))
    .returning();
  if (!campaign) {
    res.status(404).json({ error: "Campaign not found" });
    return;
  }
  res.json(campaign);
});

router.delete("/campaigns/:id", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const params = DeleteCampaignParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [deleted] = await db
    .delete(campaignsTable)
    .where(and(eq(campaignsTable.id, params.data.id), eq(campaignsTable.userId, req.userId!)))
    .returning();
  if (!deleted) {
    res.status(404).json({ error: "Campaign not found" });
    return;
  }
  res.sendStatus(204);
});

router.post("/campaigns/:id/duplicate", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const params = DuplicateCampaignParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [original] = await db
    .select()
    .from(campaignsTable)
    .where(and(eq(campaignsTable.id, params.data.id), eq(campaignsTable.userId, req.userId!)));
  if (!original) {
    res.status(404).json({ error: "Campaign not found" });
    return;
  }
  const { id: _id, createdAt: _ca, updatedAt: _ua, ...rest } = original;
  const [copy] = await db
    .insert(campaignsTable)
    .values({ ...rest, name: `${rest.name} (Copy)`, status: "pending" })
    .returning();
  res.status(201).json(copy);
});

export default router;
