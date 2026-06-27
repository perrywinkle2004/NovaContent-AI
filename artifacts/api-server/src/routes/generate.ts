import { Router } from "express";
import { randomUUID } from "crypto";
import { db, campaignsTable, generatedContentTable, generatedImagesTable, tasksTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../lib/auth";
import { GenerateCampaignBody, RegenerateContentBody, GetGenerationStatusParams } from "@workspace/api-zod";
import { generateContent, getImageUrl, type CampaignContext } from "../lib/ollama";
import { logger } from "../lib/logger";

const router = Router();

const STEPS = [
  { name: "Blog Article", type: "blog_article", progress: 10 },
  { name: "Instagram Caption", type: "instagram_caption", progress: 20 },
  { name: "Tweets", type: "tweets", progress: 30 },
  { name: "LinkedIn Post", type: "linkedin_post", progress: 40 },
  { name: "Facebook Post", type: "facebook_post", progress: 50 },
  { name: "Newsletter", type: "newsletter", progress: 60 },
  { name: "SEO Metadata", type: "seo_metadata", progress: 70 },
  { name: "Marketing Assets", type: "marketing_assets", progress: 80 },
  { name: "AI Images", type: "images", progress: 90 },
];

async function runGeneration(taskId: string, campaign: { id: number; productName: string; description: string; audience: string; goal: string; tone: string; keywords: string | null; cta: string | null; category: string; platforms: string }): Promise<void> {
  const ctx: CampaignContext = {
    productName: campaign.productName,
    description: campaign.description,
    audience: campaign.audience,
    goal: campaign.goal,
    tone: campaign.tone,
    keywords: campaign.keywords ?? "",
    cta: campaign.cta ?? "",
    category: campaign.category,
  };

  const completedSteps: string[] = [];

  for (const step of STEPS) {
    try {
      await db.update(tasksTable)
        .set({ status: "generating", progress: step.progress - 5, currentStep: step.name, completedSteps: JSON.stringify(completedSteps) })
        .where(eq(tasksTable.taskId, taskId));

      if (step.type === "images") {
        const imageTypes = [
          { type: "product_ad", label: "Product Ad" },
          { type: "instagram_poster", label: "Instagram Poster" },
          { type: "lifestyle", label: "Lifestyle Image" },
        ];
        for (const img of imageTypes) {
          const imageUrl = getImageUrl(campaign.productName, img.label, ctx.keywords);
          await db.insert(generatedImagesTable).values({
            campaignId: campaign.id,
            imageUrl,
            prompt: `${img.label} for ${campaign.productName}`,
            imageType: img.type,
          });
        }
      } else {
        const content = await generateContent(step.type, ctx);
        await db.insert(generatedContentTable).values({
          campaignId: campaign.id,
          contentType: step.type,
          content,
        });
      }

      completedSteps.push(step.name);
      await db.update(tasksTable)
        .set({ progress: step.progress, completedSteps: JSON.stringify(completedSteps) })
        .where(eq(tasksTable.taskId, taskId));

    } catch (err) {
      logger.error({ err, step: step.name }, "Generation step failed");
    }
  }

  await db.update(tasksTable)
    .set({ status: "completed", progress: 100, currentStep: null, completedSteps: JSON.stringify(completedSteps.concat(["Complete"])) })
    .where(eq(tasksTable.taskId, taskId));

  await db.update(campaignsTable)
    .set({ status: "completed" })
    .where(eq(campaignsTable.id, campaign.id));
}

router.post("/generate/campaign", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const parsed = GenerateCampaignBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [campaign] = await db
    .select()
    .from(campaignsTable)
    .where(and(eq(campaignsTable.id, parsed.data.campaignId), eq(campaignsTable.userId, req.userId!)));

  if (!campaign) {
    res.status(404).json({ error: "Campaign not found" });
    return;
  }

  const taskId = randomUUID();
  await db.insert(tasksTable).values({
    campaignId: campaign.id,
    taskId,
    status: "pending",
    progress: 0,
    completedSteps: "[]",
  });

  await db.update(campaignsTable)
    .set({ status: "generating" })
    .where(eq(campaignsTable.id, campaign.id));

  // Fire and forget
  setImmediate(() => {
    runGeneration(taskId, campaign).catch((err) => {
      logger.error({ err }, "Generation failed");
      db.update(tasksTable)
        .set({ status: "failed", error: String(err) })
        .where(eq(tasksTable.taskId, taskId))
        .catch(() => {});
    });
  });

  res.status(202).json({ taskId, campaignId: campaign.id });
});

router.get("/generate/status/:taskId", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const params = GetGenerationStatusParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [task] = await db
    .select()
    .from(tasksTable)
    .where(eq(tasksTable.taskId, params.data.taskId));

  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }

  let completedSteps: string[] = [];
  try {
    completedSteps = JSON.parse(task.completedSteps) as string[];
  } catch {
    completedSteps = [];
  }

  res.json({
    taskId: task.taskId,
    campaignId: task.campaignId,
    status: task.status,
    progress: task.progress,
    currentStep: task.currentStep,
    completedSteps,
    error: task.error,
  });
});

router.post("/generate/regenerate", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const parsed = RegenerateContentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [campaign] = await db
    .select()
    .from(campaignsTable)
    .where(and(eq(campaignsTable.id, parsed.data.campaignId), eq(campaignsTable.userId, req.userId!)));

  if (!campaign) {
    res.status(404).json({ error: "Campaign not found" });
    return;
  }

  const ctx: CampaignContext = {
    productName: campaign.productName,
    description: campaign.description,
    audience: campaign.audience,
    goal: campaign.goal,
    tone: campaign.tone,
    keywords: campaign.keywords ?? "",
    cta: campaign.cta ?? "",
    category: campaign.category,
  };

  const content = await generateContent(parsed.data.contentType, ctx);

  // Delete old content of same type and insert new
  await db.delete(generatedContentTable)
    .where(and(
      eq(generatedContentTable.campaignId, campaign.id),
      eq(generatedContentTable.contentType, parsed.data.contentType)
    ));

  const [newContent] = await db.insert(generatedContentTable)
    .values({ campaignId: campaign.id, contentType: parsed.data.contentType, content })
    .returning();

  res.json(newContent);
});

export default router;
