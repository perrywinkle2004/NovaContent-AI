import { logger } from "./logger";

const OLLAMA_BASE_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";
const OLLAMA_MODEL = "gemma";

async function callOllama(prompt: string): Promise<string | null> {
  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: OLLAMA_MODEL, prompt, stream: false }),
      signal: AbortSignal.timeout(60000),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { response?: string };
    return json.response ?? null;
  } catch (err) {
    logger.warn({ err }, "Ollama unavailable, using mock content");
    return null;
  }
}

export interface CampaignContext {
  productName: string;
  description: string;
  audience: string;
  goal: string;
  tone: string;
  keywords: string;
  cta: string;
  category: string;
}

function mock(type: string, ctx: CampaignContext): string {
  const templates: Record<string, string> = {
    blog_article: `# How ${ctx.productName} Is Transforming ${ctx.category}

## Introduction

In today's competitive landscape, ${ctx.audience} are constantly looking for solutions that deliver real results. ${ctx.productName} is designed to do exactly that — and more.

## The Challenge

${ctx.description}. This is a challenge that countless businesses face every day, often without a clear path forward.

## Our Solution

${ctx.productName} takes a fresh approach. By combining cutting-edge technology with intuitive design, we've built a platform that truly serves ${ctx.audience}.

**Key benefits:**
- Dramatically improves efficiency and output quality
- Built with ${ctx.tone.toLowerCase()} values at its core
- Proven results across the ${ctx.category} space
- Easy onboarding with dedicated support

## Why It Works

Our approach is rooted in deep understanding of what ${ctx.audience} actually need. Unlike generic alternatives, ${ctx.productName} was purpose-built for this exact use case.

## Getting Started

Ready to experience the difference? ${ctx.cta || `Try ${ctx.productName} today and see the results for yourself.`}

## Conclusion

The future of ${ctx.category} is here. ${ctx.productName} is leading the charge — and the results speak for themselves. Join the growing community of ${ctx.audience} who've already made the switch.`,

    instagram_caption: `Introducing ${ctx.productName} — built for ${ctx.audience} who demand more.

Every feature was crafted with your success in mind. ${ctx.description}

The results? Remarkable.

${ctx.cta || "Learn more at the link in bio."}

#${ctx.productName.replace(/\s+/g, "")} #${ctx.category.replace(/\s+/g, "")} #Innovation #${ctx.tone} #Growth #Marketing #Business #Success #Entrepreneur #Strategy`,

    tweets: JSON.stringify([
      `${ctx.productName}: built for ${ctx.audience} who want real results. ${ctx.description.slice(0, 100)}... ${ctx.cta || "Learn more."} #${ctx.category.replace(/\s+/g, "")}`,
      `We built ${ctx.productName} because ${ctx.audience} deserve better. ${ctx.tone} by design, powerful by default. ${ctx.cta || `Try it today.`}`,
      `The ${ctx.category} space just changed. ${ctx.productName} is here — and it's built for ${ctx.audience}. Don't miss this. #${ctx.tone} #Innovation`,
    ]),

    linkedin_post: `I'm excited to share something we've been building for ${ctx.audience} in the ${ctx.category} space.

${ctx.productName} started with a simple question: why do ${ctx.audience} still struggle with ${ctx.description}?

After extensive research and development, the answer became clear — most solutions aren't built with the end user in mind.

That's why we built ${ctx.productName} differently. Our approach:

• Deep focus on ${ctx.tone.toLowerCase()} principles
• Designed specifically for ${ctx.audience}
• Goal: ${ctx.goal}
• Built around real workflows, not theoretical ones

The early results have been incredible. ${ctx.audience} are seeing measurable improvements in ways we predicted — and in ways that surprised even us.

${ctx.cta || `If you're working in ${ctx.category}, I'd love to connect and share more.`}

What challenges are you facing in this space? Drop a comment below.`,

    facebook_post: `Hey everyone! We're so excited to introduce ${ctx.productName} to the world!

${ctx.description}

We built this specifically for ${ctx.audience}, and we've poured everything into making it work exactly the way you need it to.

Whether you're just starting out or you've been in ${ctx.category} for years, ${ctx.productName} was made with you in mind.

${ctx.cta || `Check it out — we think you're going to love it!`}

Drop a comment and let us know what you think!`,

    newsletter: JSON.stringify({
      subject: `Introducing ${ctx.productName} — Built for ${ctx.audience}`,
      preview: `The ${ctx.category} solution you've been waiting for is finally here`,
      body: `Hi there,

We've been working on something special, and today we're finally ready to share it with you.

${ctx.productName} is a new approach to ${ctx.description}. We built it from the ground up for ${ctx.audience}, and the results have been beyond what we imagined.

Here's what makes ${ctx.productName} different:

• **Purpose-built for ${ctx.audience}**: Every feature was designed with your workflow in mind
• **${ctx.tone} approach**: No fluff, no gimmicks — just results
• **Goal-focused**: We keep ${ctx.goal} front and center in everything we do
• **${ctx.keywords ? ctx.keywords.split(",")[0].trim() : "Innovative"}**: Leveraging the latest in ${ctx.category} technology

We're inviting a select group of early adopters to try it first.

Spots are limited, so don't wait.`,
      cta_text: ctx.cta || `Get Early Access to ${ctx.productName}`,
    }),

    seo_metadata: JSON.stringify({
      seo_title: `${ctx.productName} — ${ctx.goal} for ${ctx.audience}`.slice(0, 60),
      meta_description: `${ctx.productName} helps ${ctx.audience} achieve ${ctx.goal}. ${ctx.description.slice(0, 100)}. Start today.`.slice(0, 160),
      focus_keywords: [
        ctx.productName.toLowerCase(),
        ctx.category.toLowerCase(),
        ctx.goal.toLowerCase(),
        ctx.audience.toLowerCase(),
        `${ctx.category.toLowerCase()} solution`,
      ],
      long_tail_keywords: [
        `best ${ctx.category.toLowerCase()} for ${ctx.audience.toLowerCase()}`,
        `how to ${ctx.goal.toLowerCase()} with ${ctx.productName.toLowerCase()}`,
        `${ctx.productName.toLowerCase()} review`,
        `${ctx.category.toLowerCase()} software`,
        `${ctx.audience.toLowerCase()} tools`,
        `${ctx.tone.toLowerCase()} ${ctx.category.toLowerCase()}`,
        `${ctx.goal.toLowerCase()} solution`,
        `${ctx.keywords ? ctx.keywords.split(",")[0].trim().toLowerCase() : ctx.category.toLowerCase()} platform`,
      ],
      url_slug: ctx.productName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    }),

    marketing_assets: JSON.stringify({
      slogan: `${ctx.productName}: ${ctx.tone} by Design.`,
      tagline: `Built for ${ctx.audience} who demand results.`,
      promotional_headline: `The ${ctx.category} Platform That Actually Delivers`,
      brand_message: `${ctx.productName} exists because ${ctx.audience} deserve better tools. We combine ${ctx.tone.toLowerCase()} principles with cutting-edge ${ctx.category} technology to help you achieve ${ctx.goal}. No compromises. No shortcuts. Just results.`,
    }),
  };

  return templates[type] ?? `Generated content for ${ctx.productName} — ${type}`;
}

export async function generateContent(type: string, ctx: CampaignContext): Promise<string> {
  const prompts: Record<string, string> = {
    blog_article: `Write a comprehensive, SEO-optimized blog article for ${ctx.productName}. Description: ${ctx.description}. Target audience: ${ctx.audience}. Goal: ${ctx.goal}. Tone: ${ctx.tone}. Keywords to include: ${ctx.keywords}. Include: engaging title, introduction, 3-4 main sections with H2 headings, conclusion, and a call-to-action: ${ctx.cta}. Length: 900-1100 words.`,
    instagram_caption: `Write an Instagram caption for ${ctx.productName}. Audience: ${ctx.audience}. Tone: ${ctx.tone}. Include 15-20 relevant hashtags, an engagement question, and CTA: ${ctx.cta}.`,
    tweets: `Write 3 unique tweet variations for ${ctx.productName}. Each under 280 characters. Variation 1: informative. Variation 2: emotional/storytelling. Variation 3: bold/punchy. Include relevant hashtags. CTA: ${ctx.cta}. Return as a JSON array of 3 strings.`,
    linkedin_post: `Write a professional LinkedIn post for ${ctx.productName}. Business category: ${ctx.category}. Audience: ${ctx.audience}. Tone: professional and ${ctx.tone}. Include a hook, value proposition, brief insight, and CTA. 150-300 words.`,
    facebook_post: `Write a conversational Facebook post for ${ctx.productName}. Audience: ${ctx.audience}. Tone: ${ctx.tone}. Friendly, engaging, shareable. Include CTA: ${ctx.cta}. 100-200 words.`,
    newsletter: `Write a marketing email for ${ctx.productName}. Audience: ${ctx.audience}. Goal: ${ctx.goal}. Tone: ${ctx.tone}. Include: Subject Line, Preview Text, greeting, main body (2-3 paragraphs), bullet points of key benefits, CTA button text, and sign-off. Return as JSON with keys: subject, preview, body, cta_text.`,
    seo_metadata: `Generate SEO metadata for ${ctx.productName}. Description: ${ctx.description}. Keywords: ${ctx.keywords}. Return as JSON with keys: seo_title (55-60 chars), meta_description (150-160 chars), focus_keywords (array of 5), long_tail_keywords (array of 8), url_slug.`,
    marketing_assets: `Generate marketing copy assets for ${ctx.productName}. Audience: ${ctx.audience}. Tone: ${ctx.tone}. Return as JSON with keys: slogan (short, memorable), tagline (descriptive, under 10 words), promotional_headline (attention-grabbing), brand_message (2-3 sentences of core brand value).`,
  };

  const prompt = prompts[type];
  if (!prompt) return mock(type, ctx);

  const result = await callOllama(prompt);
  return result ?? mock(type, ctx);
}

export function getImageUrl(productName: string, imageType: string, keywords: string): string {
  const query = encodeURIComponent(`${productName} ${imageType} ${keywords}`.trim());
  const seed = Math.abs(productName.split("").reduce((a, c) => a + c.charCodeAt(0), 0) + imageType.length);
  return `https://picsum.photos/seed/${seed + imageType.length}/1200/800`;
}
