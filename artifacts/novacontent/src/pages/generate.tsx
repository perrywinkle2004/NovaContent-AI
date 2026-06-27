import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { useCreateCampaign, useGenerateCampaign, useGetGenerationStatus, useRegenerateContent, getGetGenerationStatusQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Copy, RefreshCw, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

const PLATFORMS = ["Blog", "Instagram", "Twitter", "LinkedIn", "Facebook", "Newsletter"];
const CATEGORIES = ["E-commerce", "SaaS", "Food & Beverage", "Fashion", "Health", "Education", "Finance", "Other"];
const GOALS = ["Brand Awareness", "Lead Generation", "Sales", "Engagement", "Launch"];
const TONES = ["Professional", "Friendly", "Luxury", "Minimal", "Corporate", "Casual", "Humorous", "Gen Z", "Inspirational"];

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  productName: z.string().min(1, "Product name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  audience: z.string().min(1, "Target audience is required"),
  goal: z.string().min(1, "Goal is required"),
  tone: z.string().min(1, "Tone is required"),
  platforms: z.array(z.string()).min(1, "Select at least one platform"),
  keywords: z.string().optional(),
  cta: z.string().optional(),
});

export default function Generate() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const createCampaign = useCreateCampaign();
  const generateCampaign = useGenerateCampaign();
  const regenerateContent = useRegenerateContent();

  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [createdCampaignId, setCreatedCampaignId] = useState<number | null>(null);

  const { data: statusData } = useGetGenerationStatus(
    activeTaskId || "",
    {
      query: {
        enabled: !!activeTaskId,
        refetchInterval: (query) => {
          const status = query.state.data?.status;
          return status === 'completed' || status === 'failed' ? false : 2000;
        },
        queryKey: getGetGenerationStatusQueryKey(activeTaskId || "")
      }
    }
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      productName: "",
      description: "",
      category: "",
      audience: "",
      goal: "",
      tone: "",
      platforms: ["Blog", "Twitter"],
      keywords: "",
      cta: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createCampaign.mutate({
      data: {
        ...values,
        platforms: values.platforms.join(", ")
      }
    }, {
      onSuccess: (campaign) => {
        setCreatedCampaignId(campaign.id);
        generateCampaign.mutate({
          data: { campaignId: campaign.id }
        }, {
          onSuccess: (genRes) => {
            setActiveTaskId(genRes.taskId);
            toast({ title: "Generation started", description: "Your campaign is being crafted." });
          },
          onError: () => {
            toast({ variant: "destructive", title: "Error", description: "Failed to start generation." });
          }
        });
      },
      onError: () => {
        toast({ variant: "destructive", title: "Error", description: "Failed to create campaign." });
      }
    });
  };

  const isGenerating = createCampaign.isPending || generateCampaign.isPending || 
    (statusData && !['completed', 'failed'].includes(statusData.status));

  return (
    <div className="space-y-8 pb-8 h-full flex flex-col lg:flex-row gap-8">
      {/* Left Panel - Form */}
      <div className={`w-full lg:w-1/2 transition-all duration-500 ${activeTaskId ? 'hidden lg:block' : ''}`}>
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">New Campaign</h1>
          <p className="text-muted-foreground mb-8">Define your parameters and let AI do the rest.</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Campaign Name</Label>
                  <Input {...form.register("name")} placeholder="Q3 Launch" />
                </div>
                <div className="space-y-2">
                  <Label>Product / Service Name</Label>
                  <Input {...form.register("productName")} placeholder="NovaCRM" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea {...form.register("description")} placeholder="Describe what it does..." className="h-24 resize-none" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select onValueChange={(v) => form.setValue("category", v)} defaultValue={form.getValues("category")}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Target Audience</Label>
                  <Input {...form.register("audience")} placeholder="Marketing Managers" />
                </div>
                <div className="space-y-2">
                  <Label>Goal</Label>
                  <Select onValueChange={(v) => form.setValue("goal", v)} defaultValue={form.getValues("goal")}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      {GOALS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tone of Voice</Label>
                  <Select onValueChange={(v) => form.setValue("tone", v)} defaultValue={form.getValues("tone")}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      {TONES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Target Platforms</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {PLATFORMS.map((platform) => (
                    <div key={platform} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`platform-${platform}`} 
                        checked={form.watch("platforms").includes(platform)}
                        onCheckedChange={(checked) => {
                          const current = form.getValues("platforms");
                          if (checked) {
                            form.setValue("platforms", [...current, platform]);
                          } else {
                            form.setValue("platforms", current.filter(p => p !== platform));
                          }
                        }}
                      />
                      <label htmlFor={`platform-${platform}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        {platform}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Keywords (optional)</Label>
                  <Input {...form.register("keywords")} placeholder="AI, marketing, saas" />
                </div>
                <div className="space-y-2">
                  <Label>Call to Action (optional)</Label>
                  <Input {...form.register("cta")} placeholder="Start free trial" />
                </div>
              </div>

              <Button type="submit" className="w-full h-12 text-lg" disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Campaign"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Right Panel - Progress & Preview */}
      <AnimatePresence>
        {(activeTaskId || isGenerating) && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full lg:w-1/2 flex flex-col"
          >
            <Card className="flex-1 flex flex-col overflow-hidden">
              <CardHeader className="border-b border-border bg-card/50">
                <CardTitle>Generation Status</CardTitle>
                <CardDescription>
                  {statusData?.status === 'completed' ? "Campaign ready!" : 
                   statusData?.status === 'failed' ? "Generation failed." : 
                   "Crafting your content..."}
                </CardDescription>
                
                {statusData && (
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{statusData.currentStep || "Initializing..."}</span>
                      <span className="font-medium text-primary">{statusData.progress}%</span>
                    </div>
                    <Progress value={statusData.progress} className="h-2" />
                  </div>
                )}
              </CardHeader>
              
              <CardContent className="p-0 flex-1 overflow-auto bg-background/50">
                {statusData?.status === 'completed' && createdCampaignId ? (
                  <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-6">
                    <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-2">Campaign Generated Successfully</h3>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        All your content is ready. You can view, edit, and export it from the campaign detail page.
                      </p>
                    </div>
                    <Button size="lg" onClick={() => setLocation(`/campaigns/${createdCampaignId}`)} className="rounded-xl gap-2">
                      View Full Campaign <ArrowRight className="h-5 w-5" />
                    </Button>
                  </div>
                ) : statusData?.status === 'failed' ? (
                  <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-4">
                    <AlertCircle className="h-12 w-12 text-destructive" />
                    <h3 className="text-xl font-bold">Generation Failed</h3>
                    <p className="text-muted-foreground">{statusData.error}</p>
                    <Button variant="outline" onClick={() => setActiveTaskId(null)}>Try Again</Button>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-8 opacity-50">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                    <div className="space-y-2">
                      <p className="font-medium animate-pulse">This might take a minute...</p>
                      <p className="text-sm text-muted-foreground">We are calling multiple AI models to craft your assets.</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
