import { Router } from "express";
import { db, campaignsTable, generatedContentTable, generatedImagesTable } from "@workspace/db";
import { eq, sql, gte } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../lib/auth";

const router = Router();

router.get("/analytics/summary", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const userId = req.userId!;

  const campaigns = await db
    .select()
    .from(campaignsTable)
    .where(eq(campaignsTable.userId, userId))
    .orderBy(campaignsTable.createdAt);

  const totalCampaigns = campaigns.length;

  const campaignIds = campaigns.map((c) => c.id);

  let totalImages = 0;
  let totalBlogs = 0;
  let totalSocialPosts = 0;
  const contentTypeMap: Record<string, number> = {};

  if (campaignIds.length > 0) {
    const allContent = await db
      .select()
      .from(generatedContentTable)
      .where(sql`${generatedContentTable.campaignId} = ANY(ARRAY[${sql.join(campaignIds.map(id => sql`${id}`), sql`, `)}]::int[])`);

    const allImages = await db
      .select()
      .from(generatedImagesTable)
      .where(sql`${generatedImagesTable.campaignId} = ANY(ARRAY[${sql.join(campaignIds.map(id => sql`${id}`), sql`, `)}]::int[])`);

    totalImages = allImages.length;

    for (const c of allContent) {
      contentTypeMap[c.contentType] = (contentTypeMap[c.contentType] ?? 0) + 1;
      if (c.contentType === "blog_article") totalBlogs++;
      if (["instagram_caption", "tweets", "linkedin_post", "facebook_post"].includes(c.contentType)) totalSocialPosts++;
    }
  }

  // Campaigns per week (last 8 weeks)
  const now = new Date();
  const campaignsPerWeek: { week: string; count: number }[] = [];
  for (let i = 7; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - i * 7 - 6);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(now);
    weekEnd.setDate(now.getDate() - i * 7);
    weekEnd.setHours(23, 59, 59, 999);

    const weekLabel = weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const count = campaigns.filter((c) => {
      const d = new Date(c.createdAt);
      return d >= weekStart && d <= weekEnd;
    }).length;
    campaignsPerWeek.push({ week: weekLabel, count });
  }

  const contentTypeBreakdown = Object.entries(contentTypeMap).map(([contentType, count]) => ({
    contentType,
    count,
  }));

  const recentCampaigns = campaigns.slice(-5).reverse();

  res.json({
    totalCampaigns,
    totalImages,
    totalBlogs,
    totalSocialPosts,
    campaignsPerWeek,
    contentTypeBreakdown,
    recentCampaigns,
  });
});

export default router;
